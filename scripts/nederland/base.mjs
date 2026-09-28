// Ondergrond van de kaart van Nederland: de gemeenten en provincies (precies, uit
// CBS), de buurlanden (Natural Earth) en de indeling van het water.
//
// Bronnen (vrij te gebruiken, naamsvermelding):
//   CBS Gebiedsindelingen, gemeenten niet gegeneraliseerd (CC-BY 4.0)
//   Kadaster Bestuurlijke gebieden, landgebied (CC-BY 4.0)
//   Natural Earth 1:10 en 1:50 miljoen via world-atlas (publiek domein)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { feature, merge, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import polygonClipping from 'polygon-clipping';
import polylabel from 'polylabel';
import 'jsts/org/locationtech/jts/monkey.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, '../..');
export const cacheDir = path.join(here, '.cache');
const CRS84 = encodeURIComponent('http://www.opengis.net/def/crs/OGC/1.3/CRS84');

/** Kader rond Nederland: hierbinnen tekenen we de buurlanden precies (1:10 miljoen). */
export const FRAME = [1.5, 49.8, 9.5, 54.8];
/** Daarbuiten, tot hier, de rest van Europa grof (1:50 miljoen), voor grote schermen. */
export const OUTER = [-12, 42, 25, 64];

/**
 * Vereenvoudiging (Visvalingam, kleinste driehoek in graden²). 1e-7 is ~750 m²:
 * afwijkingen van hooguit enkele meters, bij de diepste zoom (1 pixel ≈ 50 m)
 * onzichtbaar.
 */
export const LAND_SIMPLIFY = 1e-7;

/** Haal een PDOK OGC-collectie op (alle pagina's), één keer; daarna uit de cache. */
export async function pdok(name, url) {
  const file = path.join(cacheDir, `${name}.json`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    const features = [];
    let next = `${url}${url.includes('?') ? '&' : '?'}f=json&limit=1000&crs=${CRS84}`;
    while (next) {
      const response = await fetch(next);
      if (!response.ok) throw new Error(`${response.status} ${next}`);
      const page = await response.json();
      features.push(...page.features);
      next = page.links?.find((l) => l.rel === 'next')?.href;
    }
    fs.writeFileSync(file, JSON.stringify({ type: 'FeatureCollection', features }));
    console.log(`Opgehaald: ${name} (${features.length})`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ---------- geometrie-hulpjes ----------

export function polygonsOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  if (geometry.type === 'GeometryCollection') return geometry.geometries.flatMap(polygonsOf);
  return [];
}

export const asMulti = (polys) => ({ type: 'MultiPolygon', coordinates: polys });

export function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function inGeometry(point, geometry) {
  return polygonsOf(geometry).some(
    (rings) => rings.filter((ring) => inRing(point, ring)).length % 2 === 1,
  );
}

export function ringArea(ring) {
  let sum = 0;
  for (let i = 1; i < ring.length; i++) {
    sum += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
  }
  return Math.abs(sum / 2);
}

/** Oppervlakte van een vlak in km² (ongeveer, genoeg om te vergelijken). */
export function areaKm2(geometry) {
  const k = 111.2 * 111.2 * Math.cos((52 * Math.PI) / 180);
  return polygonsOf(geometry).reduce(
    (sum, [outer, ...holes]) =>
      sum + (ringArea(outer) - holes.reduce((s, h) => s + ringArea(h), 0)) * k,
    0,
  );
}

/** Punt midden in het grootste deelvlak. */
export function insidePoint(geometry) {
  const largest = polygonsOf(geometry).reduce((best, poly) =>
    ringArea(poly[0]) > ringArea(best[0]) ? poly : best,
  );
  return polylabel(largest, 0.0005);
}

export function bbox(geometry) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = (c) => {
    if (typeof c[0] === 'number') {
      b[0] = Math.min(b[0], c[0]);
      b[1] = Math.min(b[1], c[1]);
      b[2] = Math.max(b[2], c[0]);
      b[3] = Math.max(b[3], c[1]);
    } else c.forEach(walk);
  };
  if (geometry.type === 'GeometryCollection')
    geometry.geometries.forEach((g) => walk(g.coordinates));
  else walk(geometry.coordinates);
  return b;
}

export const boxesTouch = (a, b) => a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];

export const boxPolygon = ([w, s, e, n]) => [
  [
    [w, s],
    [e, s],
    [e, n],
    [w, n],
    [w, s],
  ],
];

export function round(geometry, decimals = 5) {
  const f = 10 ** decimals;
  const walk = (c) =>
    typeof c[0] === 'number' ? [Math.round(c[0] * f) / f, Math.round(c[1] * f) / f] : c.map(walk);
  return { ...geometry, coordinates: walk(geometry.coordinates) };
}

export function countPoints(geometry) {
  return JSON.stringify(geometry.coordinates).split('],[').length;
}

/** Afstand in km tussen twee punten [lengte, breedte] (vlakke benadering, prima voor NL). */
export function km([x1, y1], [x2, y2]) {
  return Math.hypot((x2 - x1) * 111.2 * Math.cos(((y1 + y2) * Math.PI) / 360), (y2 - y1) * 111.2);
}

// ---------- JSTS in meters (voor 'bufferen': dunne stukjes vinden) ----------

const KX = 111320 * Math.cos((52 * Math.PI) / 180);
const KY = 111200;
const reader = new GeoJSONReader();
const writer = new GeoJSONWriter();
const mapCoords = (geometry, f) => {
  const walk = (c) => (typeof c[0] === 'number' ? f(c) : c.map(walk));
  return { ...geometry, coordinates: walk(geometry.coordinates) };
};

/** GeoJSON (graden) naar JSTS (meters). */
export const toJsts = (geometry) => reader.read(mapCoords(geometry, ([x, y]) => [x * KX, y * KY]));

/** JSTS (meters) naar GeoJSON-vlakken (graden). */
export function fromJsts(g) {
  const out = writer.write(g);
  return asMulti(polygonsOf(mapCoords(out, ([x, y]) => [x / KX, y / KY])));
}

// ---------- buurlanden ----------

let worldCache = null;
function world(name) {
  worldCache ??= {};
  worldCache[name] ??= JSON.parse(
    fs.readFileSync(path.join(root, `node_modules/world-atlas/${name}.json`), 'utf8'),
  );
  return worldCache[name];
}

/** Het Nederlandse grondgebied (land én binnenwater, zonder de Noordzee) volgens het Kadaster. */
export async function loadTerritory() {
  const landgebied = await pdok(
    'kadaster_landgebied',
    'https://api.pdok.nl/kadaster/bestuurlijkegebieden/ogc/v1/collections/landgebied/items',
  );
  return landgebied.features[0].geometry;
}

/**
 * Buurlanden: binnen FRAME uit Natural Earth 1:10 miljoen, zonder het stuk dat
 * volgens het Kadaster Nederlands grondgebied is (dus nooit over Nederlands water
 * heen). Waar de grove Natural Earth-grens Nederland te klein tekent, vullen we
 * aan tot de precieze grens. Plus de Belgische enclaves in Baarle-Nassau.
 * Buiten FRAME (tot OUTER): de rest van Europa uit 1:50 miljoen.
 */
export async function buildNeighbours() {
  const nl = await loadTerritory();
  const inBox = (box) => (f) =>
    polygonsOf(f.geometry).flatMap((poly) => polygonClipping.intersection(boxPolygon(box), poly));

  const w10 = world('countries-10m');
  const all = feature(w10, w10.objects.countries).features;
  const clipped = all.filter((f) => f.id !== '528').flatMap(inBox(FRAME));
  const neighbours = polygonClipping.difference(clipped, ...polygonsOf(nl));
  const enclaves = polygonsOf(nl).flatMap((rings) => rings.slice(1).map((hole) => [hole]));

  // Stukken die Natural Earth bij Nederland rekent, maar die langs de landsgrens
  // buiten het Kadaster-grondgebied vallen, zijn in werkelijkheid buurland.
  const seam = mesh(
    w10,
    w10.objects.countries,
    (a, b) => a !== b && (a.id === '528') !== (b.id === '528'),
  );
  const seamPoints = seam.coordinates.flat();
  const nearSeam = (p, limit) => seamPoints.some((s) => km(p, s) < limit);
  const overshoot = polygonClipping.difference(
    all.filter((f) => f.id === '528').flatMap(inBox(FRAME)),
    ...polygonsOf(nl),
  );
  const borderFill = overshoot.filter((poly) => nearSeam(polylabel(poly, 0.0005), 5));
  const near = polygonClipping.union(neighbours, borderFill, ...enclaves.map((e) => [e]));

  // Rest van Europa, grof: alles binnen OUTER maar buiten FRAME.
  const w50 = world('countries-50m');
  const outerRing = [boxPolygon(OUTER)[0], [...boxPolygon(FRAME)[0]].reverse()];
  const far = feature(w50, w50.objects.countries).features.flatMap((f) =>
    polygonsOf(f.geometry).flatMap((poly) => polygonClipping.intersection(outerRing, poly)),
  );
  return { neighbours: asMulti(near), far: asMulti(far), territory: nl, nearSeam };
}

// ---------- gemeenten en provincies ----------

/**
 * Alle gemeenten (precies, CBS 2025), met hun provincie, vereenvoudigd over de hele
 * topologie zodat buren precies op elkaar blijven aansluiten.
 */
export async function loadMunicipalities() {
  const gemeenten = await pdok(
    'cbs_gemeente_2025',
    'https://api.pdok.nl/cbs/gebiedsindelingen/ogc/v1/collections/gemeente_niet_gegeneraliseerd/items?jaarcode=2025',
  );
  const grof = await pdok(
    'cbs_provincie_gegeneraliseerd',
    'https://api.pdok.nl/cbs/gebiedsindelingen/ogc/v1/collections/provincie_gegeneraliseerd/items',
  );
  const provincies = grof.features.filter((f) => f.properties.jaarcode === 2026);
  if (provincies.length !== 12)
    throw new Error(`Verwacht 12 provincies, kreeg ${provincies.length}`);

  const features = gemeenten.features.map((f) => {
    const point = insidePoint(f.geometry);
    const provincie = provincies.find((p) => inGeometry(point, p.geometry));
    if (!provincie) throw new Error(`Geen provincie voor gemeente ${f.properties.statnaam}`);
    return {
      type: 'Feature',
      properties: { gemeente: f.properties.statnaam, provincie: provincie.properties.statnaam },
      geometry: f.geometry,
    };
  });
  const topo = simplify(
    presimplify(topology({ gemeenten: { type: 'FeatureCollection', features } })),
    LAND_SIMPLIFY,
  );
  return {
    provinceNames: provincies.map((p) => p.properties.statnaam),
    features: feature(topo, topo.objects.gemeenten).features,
    /** Heel Nederland als één vlak. */
    land: merge(topo, topo.objects.gemeenten.geometries),
  };
}

/** Straal (m) voor het zoeken naar dunne stukjes: smaller dan 2× dit valt weg. */
const THIN = 15;

/**
 * Dunne stukjes land: vooral nep-stroken langs gemeentegrenzen door het water
 * (bijv. dwars over de Westerschelde), maar ook strekdammen, pieren, sluizen en
 * bruggen. Gevonden door Nederland 'open' te maken (eerst smaller, dan weer breder
 * maken): wat daarbij verdwijnt en langer dan 60 m is, is zo'n stukje. Stukjes
 * tegen een buurland aan tellen niet (anders een kiertje water langs de grens).
 * Of een stukje echt weg mag, beslist de waterindeling (zie water.mjs).
 */
export function findThinPieces(land, neighbours, nearSeam) {
  const opened = fromJsts(toJsts(land).buffer(-THIN, 2).buffer(THIN, 2));
  const removed = polygonClipping.difference(
    polygonsOf(round(land, 7)),
    polygonsOf(round(opened, 7)),
  );
  const neighboursJ = toJsts(neighbours);
  const pieces = [];
  for (const poly of removed) {
    const box = bbox(asMulti([poly]));
    if (km([box[0], box[1]], [box[2], box[3]]) < 0.1) continue;
    const g = toJsts(asMulti([poly]));
    // Alleen vlak bij de landsgrens hoeft de (trage) precieze afstand bepaald.
    if (nearSeam([box[0], box[1]], 6) && g.isWithinDistance(neighboursJ, 100)) continue;
    pieces.push(fromJsts(g.buffer(3, 2)));
  }
  return pieces;
}

/**
 * De gemeenten zonder de dunne stukjes die weg mogen, als één nieuwe topologie;
 * daaruit de provincies, provinciegrenzen en de buitenrand van Nederland.
 */
export function cleanLand({ provinceNames, features }, removePieces) {
  const pieces = removePieces.map((p) => ({ box: bbox(p), polys: polygonsOf(round(p, 7)) }));
  let cleaned = 0;
  const cleanFeatures = features.map((f) => {
    const box = bbox(f.geometry);
    const hits = pieces.filter((p) => boxesTouch(box, p.box));
    if (hits.length === 0) return f;
    // Alle stukjes samen in één keer eraf: veel sneller dan één voor één.
    const cut = toJsts(asMulti(polygonClipping.union(...hits.map((p) => p.polys))));
    let g = toJsts(f.geometry);
    const before = g.getArea();
    try {
      g = g.difference(cut);
    } catch {
      // Na het vereenvoudigen soms een klein knoopje in de rand: eerst rechtzetten.
      g = g.buffer(0).difference(cut);
    }
    if (Math.abs(g.getArea() - before) < 1) return f;
    cleaned++;
    return { ...f, geometry: fromJsts(g) };
  });
  console.log(`Dunne stukjes weg: ${removePieces.length}, uit ${cleaned} gemeenten`);

  const clean = topology(
    { gemeenten: { type: 'FeatureCollection', features: cleanFeatures } },
    1e6,
  );
  const geoms = clean.objects.gemeenten.geometries;
  return {
    provinces: provinceNames.map((name) => ({
      name,
      geometry: merge(
        clean,
        geoms.filter((g) => g.properties.provincie === name),
      ),
    })),
    municipalities: new Map(
      feature(clean, clean.objects.gemeenten).features.map((f) => [
        f.properties.gemeente,
        { province: f.properties.provincie, geometry: f.geometry },
      ]),
    ),
    provinceBorders: mesh(
      clean,
      clean.objects.gemeenten,
      (a, b) => a !== b && a.properties.provincie !== b.properties.provincie,
    ),
    outline: mesh(clean, clean.objects.gemeenten, (a, b) => a === b),
    /** Een paar gemeenten samen als één vlak (precies aansluitend, zonder naden). */
    mergeMunicipalities(names) {
      const parts = geoms.filter((g) => names.includes(g.properties.gemeente));
      if (parts.length !== names.length) throw new Error(`Gemeente niet gevonden in ${names}`);
      return merge(clean, parts);
    },
  };
}

/**
 * Splits de buitenrand van Nederland in kust (water ernaast) en landsgrens (buurland
 * ernaast). Per stukje kijken we net buiten Nederland: ligt daar een buurland, dan is
 * het landsgrens. Alleen dicht bij de landsgrens hoeft dat getest te worden.
 */
export function splitOutline(outline, nlLand, neighbours, nearSeam) {
  const coast = [];
  const border = [];
  const isBorder = (a, b) => {
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (!nearSeam(mid, 8)) return false;
    // Loodrecht op het stukje, 40 meter naar beide kanten.
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const step = 0.00036;
    const sides = [
      [mid[0] - (dy / len) * step, mid[1] + (dx / len) * step],
      [mid[0] + (dy / len) * step, mid[1] - (dx / len) * step],
    ];
    const outside = sides.find((p) => !inGeometry(p, nlLand)) ?? sides[0];
    return inGeometry(outside, neighbours);
  };
  for (const line of outline.coordinates) {
    let current = [line[0]];
    let kind = null;
    for (let i = 1; i < line.length; i++) {
      const k = isBorder(line[i - 1], line[i]) ? 'border' : 'coast';
      if (kind !== null && k !== kind) {
        (kind === 'border' ? border : coast).push(current);
        current = [line[i - 1]];
      }
      kind = k;
      current.push(line[i]);
    }
    if (current.length > 1) (kind === 'border' ? border : coast).push(current);
  }
  return {
    coast: { type: 'MultiLineString', coordinates: coast },
    border: { type: 'MultiLineString', coordinates: border },
  };
}
