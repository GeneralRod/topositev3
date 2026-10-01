// Maakt de kaart en de lijst van de categorie "Europa".
//
//   node scripts/europa/build.mjs
//
// Bron: Natural Earth 1:10 miljoen via world-atlas (publiek domein), niet
// vereenvoudigd (wens eigenaar: nooit minder precies). Alles binnen FRAME wordt
// getekend; de landen van Europa als land, de rest (Noord-Afrika, Azië) grijs.
// Dit script schrijft:
//   src/data/europa/map.json     topologie: alle landen in het kader, met rol; het kader;
//                                en de rest van de wereld grof (far)
//   src/data/europa/places.json  naam, pakket, soort, tip, knipperpunt, tint

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { feature, neighbors } from 'topojson-client';
import polygonClipping from 'polygon-clipping';
import polylabel from 'polylabel';
import { items, smallCountries } from './items.mjs';
import { asMulti, boxPolygon, inGeometry, polygonsOf, ringArea } from '../nederland/base.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(root, 'src/data/europa');

/** Kader [west, zuid, oost, noord]: van IJsland tot de Oeral, van Noord-Afrika tot de Noordkaap. */
const FRAME = [-60, 18, 100, 82];

const world = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-10m.json'), 'utf8'),
);
const atlas = new Map(
  feature(world, world.objects.countries).features.map((f) => [f.properties.name, f]),
);

/**
 * De Krim staat in world-atlas bij Rusland; Nederland en de VN rekenen hem tot
 * Oekraïne. Delen van Rusland die helemaal in dit kader liggen, gaan naar Oekraïne.
 */
const CRIMEA = [32.3, 44.2, 36.7, 46.3];
const inCrimea = (poly) =>
  poly[0].every(([x, y]) => x >= CRIMEA[0] && x <= CRIMEA[2] && y >= CRIMEA[1] && y <= CRIMEA[3]);

/** Ringen over ±180° uitvouwen (zoals unwrapRing in src/components/map/dateLine.ts). */
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
  // Begint de ring aan de 'verkeerde' kant (Rusland begint bij Tsjoekotka), dan
  // schuift alles 360° op: terugschuiven tot het midden tussen -180° en 180° ligt.
  const mean = out.reduce((sum, [lng]) => sum + lng, 0) / out.length;
  const shift = -360 * Math.round(mean / 360);
  return shift === 0 ? out : out.map(([lng, lat]) => [lng + shift, lat]);
}

function partsOf(name) {
  const f = atlas.get(name);
  if (!f) throw new Error(`'${name}' niet gevonden in world-atlas`);
  // Rusland loopt over de datumgrens: anders knipt het kader er rechthoeken uit.
  const polys = polygonsOf(f.geometry).map((poly) => poly.map(unwrapRing));
  if (name === 'Russia') return polys.filter((p) => !inCrimea(p));
  if (name === 'Ukraine')
    return [...polys, ...polygonsOf(atlas.get('Russia').geometry).filter(inCrimea)];
  return polys;
}

/** De delen van een world-atlas-land binnen het kader. */
function clipped(name) {
  return partsOf(name).flatMap((poly) => polygonClipping.intersection(boxPolygon(FRAME), poly));
}

// ---------- welke vorm hoort bij wie ----------

const countries = items.filter((i) => i.kind === 'country');
const used = new Set([...countries.flatMap((c) => c.atlas), ...Object.values(smallCountries)]);
const features = [];
for (const c of countries) {
  const parts = polygonClipping.union(...c.atlas.map((name) => clipped(name)));
  features.push({ name: c.name, role: 'game', geometry: asMulti(parts) });
}
for (const [name, atlasName] of Object.entries(smallCountries)) {
  // Vaticaanstad valt weg in het raster van world-atlas (~0,4 km²): alleen een stip.
  const parts = clipped(atlasName);
  if (parts.length > 0) features.push({ name, role: 'small', geometry: asMulti(parts) });
}
for (const [name] of atlas) {
  if (used.has(name)) continue;
  const parts = clipped(name);
  if (parts.length > 0) features.push({ name, role: 'neighbour', geometry: asMulti(parts) });
}

// De Krim hoort bij Oekraïne (zoals Nederland en de VN het zien).
const simferopol = [34.1, 44.95];
const crimea = features.find((f) => inGeometry(simferopol, f.geometry));
if (crimea?.name !== 'Oekraïne')
  throw new Error(`De Krim ligt in ${crimea?.name}, niet in Oekraïne`);

// ---------- topologie (buren delen precies dezelfde grens) ----------

const topo = topology(
  {
    countries: {
      type: 'FeatureCollection',
      features: features.map((f) => ({
        type: 'Feature',
        properties: { name: f.name, role: f.role },
        geometry: f.geometry,
      })),
    },
  },
  // Raster van ~10 m: preciezer dan de bron zelf.
  1e6,
);
const geoms = topo.objects.countries.geometries;

// Tinten: landen die aan elkaar grenzen krijgen een andere tint.
const touching = neighbors(geoms);
const tints = {};
const order = geoms
  .map((g, i) => ({ g, i }))
  .filter(({ g }) => g.properties.role === 'game')
  .sort((a, b) => a.g.properties.name.localeCompare(b.g.properties.name));
for (const { g, i } of order) {
  const taken = new Set(touching[i].map((j) => tints[geoms[j].properties.name]));
  let tint = 0;
  while (taken.has(tint)) tint++;
  tints[g.properties.name] = tint;
}
for (const g of geoms) {
  if (g.properties.role === 'game') g.properties.tint = tints[g.properties.name];
}

// ---------- de rest van de wereld, grof ----------

// Alleen te zien als je op een breed scherm ver uitzoomt: 1:110 miljoen is genoeg.
const world110 = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-110m.json'), 'utf8'),
);
const outside = [boxPolygon([-180, -55, 180, 85])[0], [...boxPolygon(FRAME)[0]].reverse()];
const roundTo = (decimals) => (c) =>
  typeof c[0] === 'number'
    ? [Number(c[0].toFixed(decimals)), Number(c[1].toFixed(decimals))]
    : c.map(roundTo(decimals));
const far = asMulti(
  roundTo(2)(
    feature(world110, world110.objects.countries).features.flatMap((f) =>
      polygonsOf(f.geometry)
        .map((poly) => poly.map(unwrapRing))
        .flatMap((poly) => polygonClipping.intersection(outside, poly)),
    ),
  ),
);

// ---------- de plekken ----------

const shapeOf = new Map(features.map((f) => [f.name, f.geometry]));
const places = items.map((item) => {
  const base = { name: item.name, package: item.package, kind: item.kind, hint: item.hint };
  if (item.kind === 'city') return { ...base, lat: item.lat, lng: item.lng };
  const largest = polygonsOf(shapeOf.get(item.name)).reduce((best, poly) =>
    ringArea(poly[0]) > ringArea(best[0]) ? poly : best,
  );
  const [lng, lat] = polylabel(largest, 0.01);
  return {
    ...base,
    lat: Math.round(lat * 1e4) / 1e4,
    lng: Math.round(lng * 1e4) / 1e4,
    tint: tints[item.name],
  };
});

// ---------- wegschrijven ----------

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'map.json'),
  JSON.stringify({ topology: topo, frame: FRAME, far }),
);
fs.writeFileSync(path.join(outDir, 'places.json'), JSON.stringify(places, null, 2) + '\n');
const size = (file) => Math.round(fs.statSync(path.join(outDir, file)).size / 1024);
console.log(
  `${places.length} plekken; ${features.length} vormen (${countries.length} landen om aan te wijzen);`,
  `tinten: ${Math.max(...Object.values(tints)) + 1}; map.json ${size('map.json')} KB`,
);
