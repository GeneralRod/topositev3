// Maakt de gegevens voor de categorie "Landen van de wereld".
//
//   node scripts/landen/build.mjs
//
// De landen zelf komen uit world-atlas (Natural Earth 1:50 miljoen, publiek domein):
// dezelfde kaart als de wereldkaart van de site, dus ze passen er precies op. De
// site haalt de vormen daar zelf uit (zie src/data/landen/index.ts). Dit script
// schrijft:
//   src/data/landen/places.json   naam, pakket, werelddeel, ankerpunt, tint, bron
//   src/data/landen/england.json  Engeland (niet los in world-atlas; uit de 'map
//                                 units' van Natural Earth, eenmalig gedownload)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import polylabel from 'polylabel';
import { items } from './items.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cacheDir = path.join(here, '.cache');
const outDir = path.join(root, 'src/data/landen');
const NE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_map_units.geojson';

// ---------- hulpjes ----------

const polygonsOf = (g) =>
  g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];

function ringArea(ring) {
  let sum = 0;
  for (let i = 1; i < ring.length; i++) {
    sum += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
  }
  return Math.abs(sum / 2);
}

/** Zelfde als unwrapRing in src/components/map/dateLine.ts: ringen over ±180° uitvouwen. */
function unwrapRing(ring) {
  const out = [];
  let offset = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    if (i > 0) {
      const delta = lng - ring[i - 1][0];
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    out.push([lng + offset, lat]);
  }
  return offset === 0 ? out : ring;
}

/** Zelfde regel als partWithin in src/data/landen/index.ts: midden van de rechthoek. */
const inBox =
  ([w, s, e, n]) =>
  (poly) => {
    const xs = poly[0].map((p) => p[0]);
    const ys = poly[0].map((p) => p[1]);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    const y = (Math.min(...ys) + Math.max(...ys)) / 2;
    return x >= w && x <= e && y >= s && y <= n;
  };

// ---------- bronnen ----------

const topo = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);
const countries = feature(topo, topo.objects.countries).features;

async function england() {
  const file = path.join(cacheDir, 'ne_50m_admin_0_map_units.geojson');
  if (!fs.existsSync(file)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('Downloaden: Natural Earth map units');
    const response = await fetch(NE);
    if (!response.ok) throw new Error(`Natural Earth: ${response.status}`);
    fs.writeFileSync(file, await response.text());
  }
  const units = JSON.parse(fs.readFileSync(file, 'utf8'));
  const unit = units.features.find((f) => f.properties.GEOUNIT === 'England');
  if (!unit) throw new Error('Engeland niet gevonden in de map units');
  // 4 decimalen (~10 m): nauwkeuriger dan de wereldkaart zelf.
  const round = (c) =>
    typeof c[0] === 'number'
      ? [Math.round(c[0] * 1e4) / 1e4, Math.round(c[1] * 1e4) / 1e4]
      : c.map(round);
  return { type: unit.geometry.type, coordinates: round(unit.geometry.coordinates) };
}

// ---------- per land de vorm, het ankerpunt en de buren ----------

const englandShape = await england();

function shapeOf(item) {
  if (item.england) return polygonsOf(englandShape);
  const parts = item.atlas.flatMap((name) => {
    const f = countries.find((c) => c.properties.name === name);
    if (!f) throw new Error(`${item.name}: '${name}' niet gevonden in world-atlas`);
    return polygonsOf(f.geometry).map((poly) => poly.map(unwrapRing));
  });
  const kept = item.within ? parts.filter(inBox(item.within)) : parts;
  if (kept.length === 0) throw new Error(`${item.name}: geen delen binnen ${item.within}`);
  return kept;
}

const shapes = new Map(items.map((item) => [item.name, shapeOf(item)]));

/** Landen die een grens delen (een gemeenschappelijk punt), voor verschillende tinten. */
const pointKeys = new Map(
  items.map((item) => [
    item.name,
    new Set(shapes.get(item.name).flatMap((poly) => poly.flat().map((p) => p.join(',')))),
  ]),
);
const tints = {};
for (const item of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
  const mine = pointKeys.get(item.name);
  const taken = new Set(
    items
      .filter((other) => other.name !== item.name && tints[other.name] !== undefined)
      .filter((other) => [...pointKeys.get(other.name)].some((k) => mine.has(k)))
      .map((other) => tints[other.name]),
  );
  let tint = 0;
  while (taken.has(tint)) tint++;
  tints[item.name] = tint;
}

const places = items.map((item) => {
  const largest = shapes
    .get(item.name)
    .reduce((best, poly) => (ringArea(poly[0]) > ringArea(best[0]) ? poly : best));
  const [lng, lat] = polylabel(largest, 0.01);
  return {
    name: item.name,
    package: item.package,
    kind: 'country',
    hint: item.hint,
    lat: Math.round(lat * 1e4) / 1e4,
    lng: Math.round(lng * 1e4) / 1e4,
    tint: tints[item.name],
    ...(item.england ? { england: true } : { atlas: item.atlas }),
    ...(item.within ? { within: item.within } : {}),
  };
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'places.json'), JSON.stringify(places, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'england.json'), JSON.stringify(englandShape));
console.log(
  `${places.length} landen; tinten: ${Math.max(...Object.values(tints)) + 1};`,
  `england.json ${Math.round(fs.statSync(path.join(outDir, 'england.json')).size / 1024)} KB`,
);
