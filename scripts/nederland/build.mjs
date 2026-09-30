// Maakt de kaartbestanden voor de categorie "Nederland".
//
//   node scripts/nederland/build.mjs
//
// Haalt de brongegevens één keer op naar scripts/nederland/.cache (niet in git) en
// schrijft:
//   src/data/nederland/places.json  klein: naam, pakket, soort, hint, ankerpunt
//   src/data/nederland/map.json     de kaart (TopoJSON); pas geladen als je gaat spelen
//
// Bronnen (vrij te gebruiken, met naamsvermelding):
//   CBS Gebiedsindelingen (gemeenten, provincies)            CC-BY 4.0
//   Kadaster Bestuurlijke gebieden (landgebied), TOP10NL      CC-BY 4.0
//   Rijkswaterstaat NWB vaarwegen en wegen                    CC0
//   Natural Earth (buurlanden)                                publiek domein

import fs from 'node:fs';
import path from 'node:path';
import { topology } from 'topojson-server';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import polygonClipping from 'polygon-clipping';
import polylabel from 'polylabel';
import {
  FRAME,
  LAND_SIMPLIFY,
  areaKm2,
  asMulti,
  bbox,
  boxPolygon,
  boxesTouch,
  buildNeighbours,
  cacheDir,
  cleanLand,
  countPoints,
  findThinPieces,
  inGeometry,
  insidePoint,
  km,
  loadMunicipalities,
  pdok,
  polygonsOf,
  ringArea,
  root,
  round,
  splitOutline,
} from './base.mjs';
import { NORTH_SEA_BEYOND, judgePieces, waterShapes } from './water.mjs';
import { items } from './items.mjs';

const outDir = path.join(root, 'src/data/nederland');
const t0 = Date.now();
const log = (...args) => console.log(`[${Math.round((Date.now() - t0) / 1000)} s]`, ...args);

// ---------- ondergrond ----------

const nb = await buildNeighbours();
const municipalitiesRaw = await loadMunicipalities();
log('gemeenten en buurlanden geladen');
const pieces = findThinPieces(municipalitiesRaw.land, nb.neighbours, nb.nearSeam);
const { verdict, cuts } = judgePieces({
  land: municipalitiesRaw.land,
  neighbours: nb.neighbours,
  municipalities: new Map(
    municipalitiesRaw.features.map((f) => [f.properties.gemeente, { geometry: f.geometry }]),
  ),
  pieces,
});
log(`dunne stukjes: ${pieces.length}, waarvan ${verdict.filter((v) => !v.remove).length} blijven`);
const land = cleanLand(
  municipalitiesRaw,
  verdict.filter((v) => v.remove).map((v) => v.piece),
);
const nlLand = asMulti(land.provinces.flatMap((p) => polygonsOf(p.geometry)));
const outline = splitOutline(land.outline, nlLand, nb.neighbours, nb.nearSeam);
const water = waterShapes({ land: nlLand, neighbours: nb.neighbours, cuts });
// De Noordzee loopt buiten het kader door (grof, onder het land), zodat hij op een
// groot scherm niet ophoudt bij de rand van het kader.
water.shapes.Noordzee = asMulti(
  polygonClipping.union(
    polygonsOf(water.shapes.Noordzee),
    polygonClipping.difference([NORTH_SEA_BEYOND], boxPolygon(FRAME)),
  ),
);
log('land en water klaar');

// ---------- onderdelen ----------

const provinceByCbs = new Map(land.provinces.map((p) => [p.name, p.geometry]));
const largestPart = (geometry) =>
  polygonsOf(geometry).reduce((best, poly) =>
    ringArea(poly[0]) > ringArea(best[0]) ? poly : best,
  );
const bigParts = (geometry, minKm2) =>
  asMulti(polygonsOf(geometry).filter((poly) => areaKm2(asMulti([poly])) >= minKm2));

/** Een streek uit TOP10NL (het grootste vlak met die naam), alleen op het land. */
async function streek(name, type) {
  const vlak = await pdok(
    'top10nl_geografisch_gebied_vlak',
    'https://api.pdok.nl/kadaster/brt-top10nl/ogc/v1/collections/geografisch_gebied_vlak/items',
  );
  const candidates = vlak.features.filter(
    (f) => f.properties.naamnl === name && f.properties.typegeografischgebied === type,
  );
  if (candidates.length === 0) throw new Error(`Streek niet gevonden: ${name}`);
  const shape = candidates.reduce((best, f) =>
    areaKm2(f.geometry) > areaKm2(best.geometry) ? f : best,
  ).geometry;
  // Eerst vereenvoudigen zoals het land, dan precies op het land knippen.
  const topo = simplify(presimplify(topology({ s: shape })), LAND_SIMPLIFY);
  const simple = feature(topo, topo.objects.s).geometry;
  const box = bbox(simple);
  const under = land.provinces.filter((p) => boxesTouch(box, bbox(p.geometry)));
  const clipped = polygonClipping.intersection(
    polygonsOf(round(simple, 7)),
    polygonClipping.union(...under.map((p) => polygonsOf(round(p.geometry, 7)))),
  );
  return bigParts(asMulti(clipped), 0.5);
}

/** Vaarwegvakken uit NWB op naam; kleine gaten (sluizen, stuwen) dichtgemaakt. */
async function vaarweg(names) {
  const nwb = await pdok(
    'nwb_vaarwegvakken',
    'https://api.pdok.nl/rws/nationaal-wegenbestand-vaarwegen/ogc/v1/collections/vaarwegvakken/items',
  );
  const lines = nwb.features
    .filter((f) => names.includes(f.properties.vwg_naam))
    .flatMap((f) =>
      f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates,
    );
  const missing = names.filter((n) => !nwb.features.some((f) => f.properties.vwg_naam === n));
  if (missing.length > 0) throw new Error(`Vaarwegen niet gevonden: ${missing.join(', ')}`);
  // Losse eindes die elkaar het dichtst zijn (en dichterbij dan 1,5 km) verbinden.
  const ends = lines.flatMap((l, i) => [
    { p: l[0], i },
    { p: l[l.length - 1], i },
  ]);
  const loose = ends.filter(
    ({ p, i }) => !lines.some((l, j) => j !== i && l.some((q) => km(p, q) < 0.05)),
  );
  const nearest = (e) =>
    loose
      .filter((o) => o.i !== e.i)
      .reduce((best, o) => (!best || km(e.p, o.p) < km(e.p, best.p) ? o : best), null);
  const joins = [];
  for (const e of loose) {
    const o = nearest(e);
    if (o && nearest(o) === e && km(e.p, o.p) < 1.5 && e.p[0] < o.p[0]) joins.push([e.p, o.p]);
  }
  return { type: 'MultiLineString', coordinates: [...lines, ...joins] };
}

/** De Afsluitdijk: de rijksweg A7 over de dijk (één rijbaan), uit NWB wegen. */
async function afsluitdijk() {
  const file = path.join(cacheDir, 'nwb_afsluitdijk.json');
  if (!fs.existsSync(file)) {
    const url =
      'https://api.pdok.nl/rws/nationaal-wegenbestand-wegen/ogc/v1/collections/wegvakken/items' +
      '?f=json&limit=1000&bbox=5.02,52.92,5.42,53.08&crs=' +
      encodeURIComponent('http://www.opengis.net/def/crs/OGC/1.3/CRS84');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NWB wegen: ${response.status}`);
    fs.writeFileSync(file, await response.text());
  }
  const roads = JSON.parse(fs.readFileSync(file, 'utf8'));
  const lines = roads.features
    .filter(
      (f) =>
        f.properties.wegnummer === '007' &&
        f.properties.stt_naam === 'Afsluitdijk' &&
        f.properties.bst_code === 'HR' &&
        f.properties.rpe_code === 'R',
    )
    .flatMap((f) => f.geometry.coordinates);
  if (lines.length === 0) throw new Error('Afsluitdijk niet gevonden in NWB');
  return { type: 'MultiLineString', coordinates: lines };
}

/** Een punt op een lijn, ongeveer halverwege de langste lijn. */
function midOfLines(geometry) {
  const longest = geometry.coordinates.reduce((best, l) => (l.length > best.length ? l : best));
  return longest[Math.floor(longest.length / 2)];
}

const shapes = [];
const places = [];
for (const item of items) {
  let geometry = null;
  let anchor;
  if (item.kind === 'province') {
    geometry = provinceByCbs.get(item.province);
    if (!geometry) throw new Error(`Provincie niet gevonden: ${item.province}`);
  } else if (item.kind === 'city') {
    const gemeente = land.municipalities.get(item.gemeente);
    if (!gemeente) throw new Error(`Gemeente niet gevonden: ${item.gemeente}`);
    anchor = [item.lng, item.lat];
    if (!inGeometry(anchor, gemeente.geometry)) {
      throw new Error(`${item.name} ligt niet in de gemeente ${item.gemeente}`);
    }
  } else if (item.kind === 'sea') {
    geometry = water.shapes[item.name];
    if (!geometry || geometry.coordinates.length === 0) throw new Error(`Geen water: ${item.name}`);
  } else if (item.kind === 'river') {
    geometry = await vaarweg(item.vaarwegen);
    anchor = midOfLines(geometry);
  } else if (item.kind === 'island') {
    geometry = asMulti([largestPart(land.mergeMunicipalities(item.gemeenten))]);
  } else if (item.kind === 'region') {
    geometry = item.gemeenten
      ? bigParts(land.mergeMunicipalities(item.gemeenten), 1)
      : await streek(item.streek, 'streek, veld');
  } else if (item.kind === 'dike') {
    geometry = await afsluitdijk();
    anchor = midOfLines(geometry);
  } else if (item.kind === 'peak') {
    const berg = await pdok(
      'top10nl_geografisch_gebied_vlak',
      'https://api.pdok.nl/kadaster/brt-top10nl/ogc/v1/collections/geografisch_gebied_vlak/items',
    );
    const hill = berg.features.find(
      (f) =>
        f.properties.naamnl === item.streek &&
        f.properties.typegeografischgebied === 'heuvel, berg',
    );
    if (!hill) throw new Error(`Berg niet gevonden: ${item.streek}`);
    anchor = insidePoint(hill.geometry);
  }
  anchor ??= insidePoint(geometry);
  places.push({
    name: item.name,
    package: item.package,
    kind: item.kind,
    hint: item.hint,
    lat: Math.round(anchor[1] * 1e5) / 1e5,
    lng: Math.round(anchor[0] * 1e5) / 1e5,
  });
  if (geometry) shapes.push({ name: item.name, kind: item.kind, geometry });
}
log(`${places.length} onderdelen`);

// ---------- tinten voor provincies en grenzen tussen wateren ----------

/** Provincies die een grens delen krijgen een andere tint (zoals op een atlaskaart). */
function provinceTints() {
  const keys = new Map(
    land.provinces.map((p) => [
      p.name,
      new Set(polygonsOf(p.geometry).flatMap((poly) => poly.flat().map((c) => c.join(',')))),
    ]),
  );
  const tints = {};
  for (const p of [...land.provinces].sort((a, b) => a.name.localeCompare(b.name))) {
    const taken = new Set(
      land.provinces
        .filter((q) => q.name !== p.name && tints[q.name] !== undefined)
        .filter((q) => [...keys.get(p.name)].some((k) => keys.get(q.name).has(k)))
        .map((q) => tints[q.name]),
    );
    let tint = 0;
    while (taken.has(tint)) tint++;
    tints[p.name] = tint;
  }
  return tints;
}
const tints = provinceTints();

/**
 * Rivieren die op elkaar aansluiten (binnen 1 km) krijgen een andere tint blauw,
 * zodat je ziet waar de ene rivier ophoudt en de volgende begint (wens eigenaar).
 */
function riverTints() {
  const rivers = shapes.filter((x) => x.kind === 'river');
  const points = new Map(rivers.map((r) => [r.name, r.geometry.coordinates.flat()]));
  const ends = new Map(
    rivers.map((r) => [r.name, r.geometry.coordinates.flatMap((l) => [l[0], l[l.length - 1]])]),
  );
  const touch = (a, b) =>
    ends.get(a).some((p) => points.get(b).some((q) => km(p, q) < 1)) ||
    ends.get(b).some((p) => points.get(a).some((q) => km(p, q) < 1));
  // Vijf tinten (zie RIVER_TINTS in src/components/map/shapes.ts); steeds de minst
  // gebruikte die mag, zodat zoveel mogelijk rivieren een eigen tint hebben.
  const TINTS = 5;
  const out = {};
  for (const r of [...rivers].sort((a, b) => a.name.localeCompare(b.name))) {
    const taken = new Set(
      rivers
        .filter((o) => o.name !== r.name && out[o.name] !== undefined && touch(r.name, o.name))
        .map((o) => out[o.name]),
    );
    const used = (t) => Object.values(out).filter((x) => x === t).length;
    const free = [...Array(TINTS).keys()].filter((t) => !taken.has(t));
    out[r.name] = free.reduce((best, t) => (used(t) < used(best) ? t : best));
  }
  return out;
}
const riverTint = riverTints();
log('tinten rivieren:', JSON.stringify(riverTint));
const cbsName = new Map(
  items.filter((i) => i.kind === 'province').map((i) => [i.province, i.name]),
);

/**
 * Grenzen tussen wateren: de knippen (met aan elke kant het water dat daar ligt),
 * plus wateren die alleen door een dam gescheiden zijn (zonder lijn, alleen zodat
 * ze een andere tint krijgen).
 */
function seaBorders() {
  const waterAt = (point) =>
    Object.entries(water.shapes).find(([, g]) => inGeometry(point, g))?.[0] ?? '-';
  const borders = [];
  for (const [[x1, y1], [x2, y2]] of cuts) {
    const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const off = 0.0005;
    const a = waterAt([mid[0] - ((y2 - y1) / len) * off, mid[1] + ((x2 - x1) / len) * off]);
    const b = waterAt([mid[0] + ((y2 - y1) / len) * off, mid[1] - ((x2 - x1) / len) * off]);
    if (a === '-' && b === '-') continue;
    borders.push({
      between: [a, b],
      line: [
        [x1, y1],
        [x2, y2],
      ],
    });
  }
  const pairs = new Set();
  for (const v of verdict) {
    const named = v.keys.filter((k) => !k.startsWith('#')).sort();
    for (let i = 0; i < named.length; i++) {
      for (let j = i + 1; j < named.length; j++) pairs.add(`${named[i]}|${named[j]}`);
    }
  }
  // Wateren die alleen door een brede dam gescheiden zijn, ook een andere tint.
  for (const pair of [
    'IJsselmeer|Waddenzee',
    'Lauwersmeer|Waddenzee',
    'Grevelingenmeer|Noordzee',
    'Grevelingenmeer|Oosterschelde',
    'Grevelingenmeer|Haringvliet',
  ]) {
    pairs.add(pair);
  }
  for (const pair of pairs) {
    const [a, b] = pair.split('|');
    if (!borders.some((x) => x.between.includes(a) && x.between.includes(b))) {
      borders.push({ between: [a, b], line: null });
    }
  }
  return borders;
}
const borders = seaBorders();

// ---------- wegschrijven ----------

// Buurlanden vereenvoudigen zoals het land: onder de precieze grens van Nederland
// zie je het verschil niet.
const nbTopo = simplify(presimplify(topology({ n: nb.neighbours })), LAND_SIMPLIFY);
const neighbours = feature(nbTopo, nbTopo.objects.n).geometry;

const collection = (features) => ({
  type: 'FeatureCollection',
  features: features.map(({ properties, ...geometry }) => ({
    type: 'Feature',
    properties,
    geometry,
  })),
});
const topo = topology(
  {
    provinces: collection(
      land.provinces.map((p) => ({
        ...p.geometry,
        properties: { name: cbsName.get(p.name), tint: tints[p.name] },
      })),
    ),
    neighbours,
    coast: outline.coast,
    border: outline.border,
    shapes: collection(
      shapes
        .filter((s) => s.kind !== 'province')
        .map((s) => ({
          ...s.geometry,
          properties: {
            name: s.name,
            kind: s.kind,
            ...(riverTint[s.name] !== undefined ? { tint: riverTint[s.name] } : {}),
          },
        })),
    ),
    seaBorders: collection(
      borders.map((b) => ({
        type: 'MultiLineString',
        coordinates: b.line ? [b.line] : [],
        properties: { between: b.between },
      })),
    ),
  },
  // Raster van ~2 m (de Noordzee reikt tot Noorwegen, dus het kader is groot).
  6e5,
);
const far = round(nb.far, 3);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'map.json'), JSON.stringify({ topology: topo, far }));
fs.writeFileSync(path.join(outDir, 'places.json'), JSON.stringify(places, null, 2) + '\n');

const size = (file) => Math.round(fs.statSync(path.join(outDir, file)).size / 1024);
log(`map.json ${size('map.json')} KB, places.json ${size('places.json')} KB`);
log(
  'water zonder naam (groter dan 1 km²):',
  water.unnamed.map((u) => `${u.area.toFixed(0)} km² bij ${u.box.map((v) => v.toFixed(2))}`),
);
log('punten per vorm:', shapes.map((s) => `${s.name} ${countPoints(s.geometry)}`).join(', '));
log('grenzen tussen wateren:', borders.map((b) => b.between.join('|')).join(', '));
