// Maakt de gegevens voor "Vlaggen van de wereld".
//
//   node scripts/vlaggen/build.mjs
//
// Bronnen:
//   vlaggen:  flag-icons (MIT-licentie), gekopieerd naar public/vlaggen/<code>.svg
//   kaart:    world-atlas (Natural Earth 1:50 miljoen), dezelfde wereldkaart als de
//             site en "Landen van de wereld"; de site haalt de vormen daar zelf uit
// Dit script schrijft:
//   src/data/vlaggen/places.json  naam, pakket, soort (land/stip), tip, punt, tint, bron
//   public/vlaggen/*.svg          de vlaggen (alleen die van de lijst) en LICENSE.txt

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import polylabel from 'polylabel';
import { items } from './items.mjs';
import { areaKm2, polygonsOf, ringArea } from '../nederland/base.mjs';

const require = createRequire(import.meta.url);
const isoCountries = require('i18n-iso-countries');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(root, 'src/data/vlaggen');
const flagDir = path.join(root, 'public/vlaggen');
const flagIcons = path.join(root, 'node_modules/flag-icons');

/** Kleiner dan dit (km²) is op de wereldkaart niet aan te klikken: dan een stip. */
const MIN_SHAPE_KM2 = 5000;

/**
 * Landen die niet (of te klein) op de wereldkaart staan: stip op de hoofdstad.
 * Alleen nodig als world-atlas het land helemaal niet heeft.
 */
const DOTS = {
  Tuvalu: [-8.5211, 179.1983],
  Nauru: [-0.5228, 166.9315],
  Marshalleilanden: [7.0897, 171.3803],
  Kiribati: [1.3278, 172.9784],
  Micronesia: [6.9248, 158.161],
  Palau: [7.5006, 134.6243],
  Maldiven: [4.1755, 73.5093],
  Seychellen: [-4.6191, 55.4513],
  Monaco: [43.7384, 7.4246],
  Vaticaanstad: [41.9029, 12.4534],
  'San Marino': [43.9424, 12.4578],
  Liechtenstein: [47.141, 9.5209],
  Andorra: [42.5462, 1.6016],
  Malta: [35.9175, 14.4091],
  Singapore: [1.3521, 103.8198],
  Bahrein: [26.0667, 50.5577],
  Tonga: [-21.1789, -175.1982],
  Samoa: [-13.759, -172.1046],
  'Sao Tomé en Principe': [0.3365, 6.7273],
  Kaapverdië: [14.933, -23.5133],
  Comoren: [-11.7172, 43.2473],
  Mauritius: [-20.1609, 57.5012],
  Barbados: [13.1132, -59.5988],
  Grenada: [12.0561, -61.7488],
  'Saint Lucia': [13.9094, -60.9789],
  'Saint Vincent en de Grenadines': [13.1579, -61.2248],
  'Saint Kitts en Nevis': [17.3026, -62.7177],
  'Antigua en Barbuda': [17.1274, -61.8468],
  Dominica: [15.415, -61.371],
};

// ---------- hulpjes ----------

/** Zelfde als in scripts/landen/build.mjs: ringen over ±180° uitvouwen. */
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

const round4 = (x) => Math.round(x * 1e4) / 1e4;

// ---------- bronnen ----------

const topo = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);
const countries = feature(topo, topo.objects.countries).features;

function atlasFeature(item) {
  if (item.code === 'xk') return countries.find((f) => f.properties.name === 'Kosovo');
  const numeric = isoCountries.alpha2ToNumeric(item.code.toUpperCase());
  if (!numeric) throw new Error(`${item.name}: geen landnummer voor ${item.code}`);
  return countries.find((f) => f.id === numeric);
}

// ---------- per land: vlak of stip ----------

const resolved = items.map((item) => {
  const f = atlasFeature(item);
  const polys = f ? polygonsOf(f.geometry).map((poly) => poly.map(unwrapRing)) : [];
  const area = f ? areaKm2(f.geometry) : 0;
  if (f && area >= MIN_SHAPE_KM2 && !DOTS[item.name]) {
    return { item, kind: 'country', atlas: f.properties.name, polys };
  }
  let point = DOTS[item.name];
  if (!point && polys.length > 0) {
    const largest = polys.reduce((best, p) => (ringArea(p[0]) > ringArea(best[0]) ? p : best));
    const [lng, lat] = polylabel(largest, 0.001);
    point = [lat, lng];
  }
  if (!point) throw new Error(`${item.name}: niet op de wereldkaart; zet een stip in DOTS`);
  return { item, kind: 'city', point };
});

// Tinten: landen die een grens delen krijgen een andere tint (zoals bij Landen).
const shapes = resolved.filter((r) => r.kind === 'country');
const pointKeys = new Map(
  shapes.map((r) => [
    r.item.name,
    new Set(r.polys.flatMap((p) => p.flat().map((c) => c.join(',')))),
  ]),
);
const tints = {};
for (const r of [...shapes].sort((a, b) => a.item.name.localeCompare(b.item.name))) {
  const mine = pointKeys.get(r.item.name);
  const taken = new Set(
    shapes
      .filter((o) => o !== r && tints[o.item.name] !== undefined)
      .filter((o) => [...pointKeys.get(o.item.name)].some((k) => mine.has(k)))
      .map((o) => tints[o.item.name]),
  );
  let tint = 0;
  while (taken.has(tint)) tint++;
  tints[r.item.name] = tint;
}

const places = resolved.map((r) => {
  const base = {
    name: r.item.name,
    package: r.item.package,
    hint: `In ${r.item.continent}`,
    code: r.item.code,
  };
  if (r.kind === 'city') {
    return { ...base, kind: 'city', lat: round4(r.point[0]), lng: round4(r.point[1]) };
  }
  const largest = r.polys.reduce((best, p) => (ringArea(p[0]) > ringArea(best[0]) ? p : best));
  const [lng, lat] = polylabel(largest, 0.01);
  return {
    ...base,
    kind: 'country',
    lat: round4(lat),
    lng: round4(lng),
    tint: tints[r.item.name],
    atlas: [r.atlas],
  };
});

// ---------- vlaggen kopiëren ----------

fs.rmSync(flagDir, { recursive: true, force: true });
fs.mkdirSync(flagDir, { recursive: true });
for (const { code, name } of items) {
  const source = path.join(flagIcons, 'flags/4x3', `${code}.svg`);
  if (!fs.existsSync(source)) throw new Error(`${name}: geen vlag ${code}.svg in flag-icons`);
  fs.copyFileSync(source, path.join(flagDir, `${code}.svg`));
}
fs.copyFileSync(path.join(flagIcons, 'LICENSE'), path.join(flagDir, 'LICENSE.txt'));

// ---------- wegschrijven ----------

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'places.json'), JSON.stringify(places, null, 2) + '\n');
const flagBytes = items.reduce(
  (sum, { code }) => sum + fs.statSync(path.join(flagDir, `${code}.svg`)).size,
  0,
);
console.log(
  `${places.length} landen: ${shapes.length} als vlak, ${places.length - shapes.length} als stip;`,
  `tinten: ${Math.max(...Object.values(tints)) + 1}; vlaggen samen ${Math.round(flagBytes / 1024)} KB`,
);
console.log(
  'Stippen:',
  places
    .filter((p) => p.kind === 'city')
    .map((p) => p.name)
    .join(', '),
);
