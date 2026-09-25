// Maakt de kaartbestanden voor de categorie "Wateren en landschappen over de
// wereld" uit Natural Earth (publiek domein, naturalearthdata.com).
//
//   node scripts/wateren/build.mjs
//
// Downloadt de ruwe Natural Earth-bestanden één keer naar scripts/wateren/.cache
// (niet in git) en schrijft:
//   src/data/wateren/places.json  klein: naam, pakket, soort, hint, ankerpunt
//   src/data/wateren/shapes.json  de vormen; pas geladen als je gaat spelen
//
// Zeeën komen uit de 'marine polygons' van Natural Earth: grove vlakken die
// onder het land worden getekend, zodat het land zelf de precieze kust tekent.
// Kleine baaien zonder eigen onderdeel gaan automatisch naar de zee waarmee ze
// de langste grens delen (bijv. de Waddenzee naar de Noordzee).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { merge, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import polylabel from 'polylabel';
import { items, neutralMarine } from './items.mjs';

/**
 * Hoeveel de zeeën vereenvoudigd worden (kleinste driehoek in graden², Visvalingam).
 * Scheelt een kwart in bestandsgrootte; de kustkant valt toch onder het land.
 */
const SEA_SIMPLIFY = 1e-3;

/** Pakketten die nu in de site staan. */
const ENABLED = new Set(['wateren1', 'wateren2', 'wateren3', 'wateren4']);

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cacheDir = path.join(here, '.cache');
const outDir = path.join(root, 'src/data/wateren');
const SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

async function loadNE(name) {
  const file = path.join(cacheDir, `${name}.geojson`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`Downloaden: ${name}`);
    const response = await fetch(`${SOURCE}${name}.geojson`);
    if (!response.ok) throw new Error(`${name}: ${response.status}`);
    fs.writeFileSync(file, await response.text());
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ---------- hulpjes voor coördinaten ----------

/** Afronden: 4 decimalen is ~10 meter, met het oog niet te zien. */
function round(geometry, decimals) {
  const f = 10 ** decimals;
  const walk = (c) =>
    typeof c[0] === 'number' ? [Math.round(c[0] * f) / f, Math.round(c[1] * f) / f] : c.map(walk);
  return { ...geometry, coordinates: walk(geometry.coordinates) };
}

function polygonsOf(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  throw new Error(`Geen vlak: ${geometry.type}`);
}

function linesOf(geometry) {
  if (geometry.type === 'LineString') return [geometry.coordinates];
  if (geometry.type === 'MultiLineString') return geometry.coordinates;
  throw new Error(`Geen lijn: ${geometry.type}`);
}

/**
 * Chaikin: maakt de hoekige omtrek van gebergtes en woestijnen (Natural Earth
 * geeft daar alleen een ruwe omtrek) vloeiend, zonder de vorm te veranderen.
 */
function smoothRing(ring, rounds = ring.length < 150 ? 2 : 1) {
  let points = ring.slice(0, -1);
  for (let r = 0; r < rounds; r++) {
    const next = [];
    for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % points.length];
      next.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1]);
      next.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    points = next;
  }
  return [...points, points[0]];
}

function ringArea(ring) {
  let sum = 0;
  for (let i = 1; i < ring.length; i++) {
    sum += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
  }
  return Math.abs(sum / 2);
}

/** Punt midden in het grootste deelvlak, ver van de randen (voor label en knipperpunt). */
function polygonAnchor(geometry) {
  const largest = polygonsOf(geometry).reduce((best, poly) =>
    ringArea(poly[0]) > ringArea(best[0]) ? poly : best,
  );
  const [lng, lat] = polylabel(largest, 0.01);
  return [lat, lng];
}

/** Punt halverwege de langste lijn van een rivier. */
function lineAnchor(geometry) {
  const lengthOf = (line) =>
    line.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - line[i][0], p[1] - line[i][1]), 0);
  const longest = linesOf(geometry).reduce((best, line) =>
    lengthOf(line) > lengthOf(best) ? line : best,
  );
  let remaining = lengthOf(longest) / 2;
  for (let i = 1; i < longest.length; i++) {
    const step = Math.hypot(longest[i][0] - longest[i - 1][0], longest[i][1] - longest[i - 1][1]);
    if (step >= remaining) return [longest[i][1], longest[i][0]];
    remaining -= step;
  }
  return [longest[0][1], longest[0][0]];
}

// ---------- zeeën: indelen en samenvoegen ----------

function buildSeas(marine) {
  const owner = new Map();
  for (const item of items) for (const name of item.marine ?? []) owner.set(name, item.name);

  const features = marine.features.map((f) => ({
    ...f,
    properties: { ne: f.properties.name, group: owner.get(f.properties.name) ?? null },
  }));
  for (const f of features) if (neutralMarine.includes(f.properties.ne)) f.properties.group = '-';

  for (const [name, group] of owner) {
    if (!features.some((f) => f.properties.ne === name)) {
      throw new Error(`Zee niet gevonden in Natural Earth: ${name} (${group})`);
    }
  }

  // Vereenvoudigen over de hele topologie tegelijk, zodat buurzeeën precies op elkaar
  // blijven aansluiten. De kustkant valt toch onder het land.
  const topo = simplify(
    presimplify(topology({ seas: { type: 'FeatureCollection', features } })),
    SEA_SIMPLIFY,
  );
  const geoms = topo.objects.seas.geometries;
  const arcId = (a) => (a < 0 ? ~a : a);
  const arcsOf = (g) => {
    const out = new Set();
    const walk = (a) => (Array.isArray(a) ? a.forEach(walk) : out.add(arcId(a)));
    walk(g.arcs ?? []);
    return out;
  };
  const arcLength = topo.arcs.map((arc) =>
    arc.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - arc[i][0], p[1] - arc[i][1]), 0),
  );
  const owners = new Map();
  geoms.forEach((g, gi) => {
    for (const a of arcsOf(g)) owners.set(a, [...(owners.get(a) ?? []), gi]);
  });

  // Naamloze stukjes zee: bij de buur met de langste gedeelde grens voegen.
  let changed = true;
  while (changed) {
    changed = false;
    geoms.forEach((g, gi) => {
      if (g.properties.group !== null) return;
      const shared = new Map();
      for (const a of arcsOf(g)) {
        for (const other of owners.get(a)) {
          const group = geoms[other].properties.group;
          if (other === gi || group === null || group === '-') continue;
          shared.set(group, (shared.get(group) ?? 0) + arcLength[a]);
        }
      }
      const best = [...shared].sort((x, y) => y[1] - x[1])[0];
      if (best) {
        g.properties.group = best[0];
        changed = true;
      }
    });
  }

  const shapes = new Map();
  for (const item of items.filter((i) => i.marine)) {
    const parts = geoms.filter((g) => g.properties.group === item.name);
    shapes.set(item.name, merge(topo, parts));
  }

  // Grenzen tussen twee verschillende zeeën, als er minstens één in de site staat. Per
  // paar opgeslagen, zodat het spel alleen de grenzen toont van zeeën die meedoen.
  const enabledSea = new Set(
    items.filter((i) => i.marine && ENABLED.has(i.pkg)).map((i) => i.name),
  );
  const pairs = new Set();
  for (const geomIds of owners.values()) {
    const groups = [...new Set(geomIds.map((gi) => geoms[gi].properties.group ?? '-'))];
    if (groups.length === 2 && groups.some((g) => enabledSea.has(g))) {
      pairs.add(groups.sort().join('|'));
    }
  }
  const borders = [...pairs].sort().map((pair) => {
    const [first, second] = pair.split('|');
    const lines = mesh(topo, topo.objects.seas, (a, b) => {
      const ga = a.properties.group ?? '-';
      const gb = b.properties.group ?? '-';
      return a !== b && ((ga === first && gb === second) || (ga === second && gb === first));
    });
    return { between: [first, second], ...round(lines, 3) };
  });

  const leftover = geoms.filter((g) => g.properties.group === null).map((g) => g.properties.ne);
  return { shapes, borders, leftover };
}

// ---------- overige soorten ----------

function pickByName(collection, names, what) {
  // Het gebiedenbestand gebruikt NAME in hoofdletters, de rest name.
  const nameOf = (f) => f.properties.name ?? f.properties.NAME;
  const found = collection.features.filter((f) => names.includes(nameOf(f)));
  for (const name of names) {
    if (!found.some((f) => nameOf(f) === name)) {
      throw new Error(`${what} niet gevonden in Natural Earth: ${name}`);
    }
  }
  return found;
}

/** Punt-in-ring (even-oneven regel), voor het uitzoeken van troggen. */
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Een trog uit de dieptekaart: de vlakken dieper dan 6000 m binnen 'box' die ook een
 * plek dieper dan 7000 m bevatten. Zo vallen gewone diepe oceaanbodem en andere
 * troggen in de buurt af.
 */
function trenchShape([west, south, east, north]) {
  const within = (poly) =>
    poly[0].every(([x, y]) => x >= west && x <= east && y >= south && y <= north);
  const parts = (collection) =>
    collection.features.flatMap((f) => polygonsOf(f.geometry)).filter(within);
  const deepest = parts(depth7000);
  const selected = parts(depth6000).filter((poly) =>
    deepest.some((deep) => inRing(deep[0][0], poly[0])),
  );
  if (selected.length === 0) throw new Error('Geen trog gevonden in de dieptekaart');
  // Alleen de buitenrand: gaatjes (onderzeese bergen, minder dan 6000 m diep) zouden
  // als losse stipjes in de trog staan en zijn niet aan te klikken.
  return { type: 'MultiPolygon', coordinates: selected.map((poly) => [poly[0]]) };
}

function mergeLines(features) {
  return {
    type: 'MultiLineString',
    coordinates: features.flatMap((f) => linesOf(f.geometry)),
  };
}

function mergePolygons(features, smooth) {
  const polygons = features.flatMap((f) => polygonsOf(f.geometry));
  return {
    type: 'MultiPolygon',
    coordinates: smooth ? polygons.map((poly) => poly.map((ring) => smoothRing(ring))) : polygons,
  };
}

// ---------- alles samen ----------

const [marine, lakes, rivers, regions, depth6000, depth7000] = await Promise.all([
  loadNE('ne_10m_geography_marine_polys'),
  loadNE('ne_10m_lakes'),
  loadNE('ne_10m_rivers_lake_centerlines'),
  loadNE('ne_10m_geography_regions_polys'),
  loadNE('ne_10m_bathymetry_E_6000'),
  loadNE('ne_10m_bathymetry_D_7000'),
]);

const seas = buildSeas(marine);
const places = [];
const features = [];

for (const item of items.filter((i) => ENABLED.has(i.pkg))) {
  let geometry = null;
  if (item.marine) geometry = round(seas.shapes.get(item.name), 3);
  if (item.lakes) geometry = round(mergePolygons(pickByName(lakes, item.lakes, 'Meer')), 4);
  if (item.regions) {
    const parts = pickByName(regions, item.regions, 'Gebied');
    geometry = round(mergePolygons(parts, true), 4);
  }
  if (item.rivers) {
    // Rivieren lopen soms door een stuwmeer: die stukken (Lake Centerline) horen erbij.
    geometry = round(mergeLines(pickByName(rivers, item.rivers, 'Rivier')), 4);
  }
  if (item.trench) geometry = round(trenchShape(item.trench.box), 4);

  const anchor =
    item.anchor ??
    item.peak ??
    (geometry.type === 'MultiLineString' ? lineAnchor(geometry) : polygonAnchor(geometry));
  places.push({
    name: item.name,
    package: item.pkg,
    kind: item.kind,
    hint: item.hint,
    lat: Math.round(anchor[0] * 1e4) / 1e4,
    lng: Math.round(anchor[1] * 1e4) / 1e4,
  });
  if (geometry) {
    features.push({ type: 'Feature', properties: { name: item.name, kind: item.kind }, geometry });
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'places.json'), `${JSON.stringify(places, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'shapes.json'),
  JSON.stringify({
    type: 'FeatureCollection',
    features,
    seaBorders: seas.borders,
  }),
);

const size = (file) => `${Math.round(fs.statSync(path.join(outDir, file)).size / 1024)} KB`;
console.log(
  `${places.length} onderdelen; places.json ${size('places.json')}, shapes.json ${size('shapes.json')}`,
);
if (seas.leftover.length > 0) console.log('Zeeën zonder onderdeel:', seas.leftover.join(', '));
