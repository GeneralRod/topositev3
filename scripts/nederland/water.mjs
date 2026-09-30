// Het water rond en in Nederland, verdeeld over de wateren uit de lijst.
//
// Water = alles binnen het kader dat geen land is (geen Nederland, geen buurland).
// Dat water valt uiteen in losse stukken (de kust, dammen en sluizen scheiden ze);
// waar wateren in elkaar overlopen (bijv. Noordzee en Waddenzee tussen de eilanden)
// trekken we een knip. Elk stuk krijgt de naam van het water waar een 'zaadpunt'
// in ligt; stukken zonder zaadpunt blijven gewoon water (niet aan te klikken).

import polygonClipping from 'polygon-clipping';
import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp.js';
import {
  FRAME,
  areaKm2,
  asMulti,
  bbox,
  boxPolygon,
  boxesTouch,
  inGeometry,
  polygonsOf,
  ringArea,
  round,
  toJsts,
} from './base.mjs';

/** Punten midden in elk water uit de lijst (lengte, breedte). */
export const SEEDS = {
  Noordzee: [[3.5, 52.5]],
  Waddenzee: [[5.2, 53.2]],
  IJsselmeer: [[5.3, 52.85]],
  Markermeer: [[5.2, 52.5]],
  Veluwemeer: [[5.656, 52.381]],
  Lauwersmeer: [[6.167, 53.394]],
  Dollard: [[7.17, 53.26]],
  Oosterschelde: [
    [3.8, 51.64],
    [4.13, 51.48],
  ],
  Westerschelde: [
    [3.93, 51.4],
    [3.65, 51.42],
  ],
  Grevelingenmeer: [[3.987, 51.779]],
  Haringvliet: [[4.21, 51.78]],
  'Hollands Diep': [[4.48, 51.7]],
};

/**
 * Knippen tussen wateren die in elkaar overlopen. Een knip is de kortste lijn
 * tussen twee stukken land (gemeente, of een eiland van een buurland bij een punt),
 * of een vaste lijn. Een knip loopt een stukje het land in, zodat hij zeker sluit.
 */
const CUTS = [
  // Waddenzee | Noordzee: de zeegaten tussen de eilanden.
  ['Den Helder', 'Texel'],
  ['Texel', 'Vlieland'],
  ['Vlieland', 'Terschelling'],
  ['Terschelling', 'Ameland'],
  ['Ameland', 'Schiermonnikoog'],
  // Simonszand, Rottumerplaat en Rottumeroog horen bij de gemeente Het Hogeland.
  ['Schiermonnikoog', { gemeente: 'Het Hogeland', near: [6.421, 53.521] }],
  [
    { gemeente: 'Het Hogeland', near: [6.421, 53.521] },
    { gemeente: 'Het Hogeland', near: [6.495, 53.538] },
  ],
  [
    { gemeente: 'Het Hogeland', near: [6.495, 53.538] },
    { gemeente: 'Het Hogeland', near: [6.594, 53.538] },
  ],
  [{ gemeente: 'Het Hogeland', near: [6.594, 53.538] }, { buurland: [6.724, 53.587] }],
  // Waddenzee | Eems: van Borkum naar de Groninger kust.
  [{ buurland: [6.724, 53.587] }, { gemeente: 'Het Hogeland', near: [6.85, 53.44] }],
  // Eems | Dollard: van de Punt van Reide naar de Duitse oever.
  {
    line: [
      [7.0955, 53.3],
      [7.1, 53.342],
    ],
  },
  // Duitse Waddenzee (niet in de lijst) | Noordzee: langs de Oost-Friese eilanden.
  [{ buurland: [6.724, 53.587] }, { buurland: [6.959, 53.682] }],
  [{ buurland: [6.959, 53.682] }, { buurland: [7.243, 53.717] }],
  [{ buurland: [7.243, 53.717] }, { buurland: [7.404, 53.728] }],
  [{ buurland: [7.404, 53.728] }, { buurland: [7.523, 53.748] }],
  [{ buurland: [7.523, 53.748] }, { buurland: [7.724, 53.769] }],
  [{ buurland: [7.724, 53.769] }, { buurland: [7.893, 53.788] }],
  [{ buurland: [7.893, 53.788] }, { vasteland: [8.0, 53.5] }],
  // Westerschelde | Noordzee: tussen Vlissingen en Breskens.
  ['Vlissingen', 'Sluis'],
  // Noordzee | Het Kanaal: de Straat van Dover (van Frankrijk naar Engeland).
  {
    line: [
      [1.7, 50.86],
      [1.3, 51.16],
    ],
  },
];

/**
 * De Noordzee buiten het kader (tot Engeland, Schotland, Noorwegen en Denemarken),
 * grof: dit vlak ligt onder het land, dus alleen de kant in open water telt. Zo
 * houdt de Noordzee op een groot scherm niet op bij de rand van het kader. Begint
 * bij de knip in de Straat van Dover.
 */
export const NORTH_SEA_BEYOND = [
  [1.7, 50.86],
  [1.3, 51.16],
  [0.5, 51.25],
  [-0.5, 52.5],
  [-1.5, 54],
  [-2.5, 55.5],
  [-3.2, 56.3],
  [-3, 57.5],
  [-3.3, 58.6],
  [-1.2, 60.8],
  [4.9, 61],
  [6.5, 59],
  [7, 58],
  [8.6, 57.1],
  [9, 56],
  [9.2, 55],
  [9.5, 54.8],
  [9.5, 49],
  [1.7, 49],
  [1.7, 50.86],
];

/** Stukjes water kleiner dan dit (km²) tellen niet als apart water. */
const POCKET = 0.02;

/** Knip een stukje (m) het land in laten lopen. */
const CUT_OVERLAP = 150;
/** Breedte (m) van een knip. */
const CUT_WIDTH = 2;

const largestPart = (polys) =>
  polys.reduce((best, poly) => (ringArea(poly[0]) > ringArea(best[0]) ? poly : best));

/** Het deelvlak (eiland) waarvan het midden het dichtst bij een punt ligt. */
function closestPart(polys, [x, y]) {
  const distance = (poly) => {
    const [w, s, e, n] = bbox(asMulti([poly]));
    return Math.hypot((w + e) / 2 - x, (s + n) / 2 - y);
  };
  return polys.reduce((best, poly) => (distance(poly) < distance(best) ? poly : best));
}

function cutLines(municipalities, neighbours) {
  const neighbourPolys = polygonsOf(neighbours);
  const resolve = (end) => {
    if (typeof end === 'string') {
      const m = municipalities.get(end);
      if (!m) throw new Error(`Onbekende gemeente in knip: ${end}`);
      // Het grootste deel (het eiland zelf): gemeenten hebben ook losse snippertjes
      // in het water, soms tegen de buurgemeente aan.
      return toJsts(asMulti([largestPart(polygonsOf(m.geometry))]));
    }
    if (end.gemeente) {
      const m = municipalities.get(end.gemeente);
      if (!m) throw new Error(`Onbekende gemeente in knip: ${end.gemeente}`);
      return toJsts(asMulti([closestPart(polygonsOf(m.geometry), end.near)]));
    }
    if (end.vasteland) {
      const poly = neighbourPolys.find((p) => inGeometry(end.vasteland, asMulti([p])));
      if (!poly) throw new Error(`Geen vasteland bij ${end.vasteland}`);
      return toJsts(asMulti([poly]));
    }
    return toJsts(asMulti([closestPart(neighbourPolys, end.buurland)]));
  };
  return CUTS.map((cut) => {
    if (cut.line) return cut.line;
    const [a, b] = DistanceOp.nearestPoints(resolve(cut[0]), resolve(cut[1]));
    // Terug naar graden en aan beide kanten een stukje verlengen.
    const KX = 111320 * Math.cos((52 * Math.PI) / 180);
    const KY = 111200;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    return [
      [(a.x - ux * CUT_OVERLAP) / KX, (a.y - uy * CUT_OVERLAP) / KY],
      [(b.x + ux * CUT_OVERLAP) / KX, (b.y + uy * CUT_OVERLAP) / KY],
    ];
  });
}

/** Een lijn als heel smal vlak, om het water mee door te knippen. */
function lineToStrip([[x1, y1], [x2, y2]]) {
  const KX = 111320 * Math.cos((52 * Math.PI) / 180);
  const KY = 111200;
  const dx = (x2 - x1) * KX;
  const dy = (y2 - y1) * KY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = ((-dy / len) * CUT_WIDTH) / 2 / KX;
  const ny = ((dx / len) * CUT_WIDTH) / 2 / KY;
  return [
    [
      [x1 + nx, y1 + ny],
      [x2 + nx, y2 + ny],
      [x2 - nx, y2 - ny],
      [x1 - nx, y1 - ny],
      [x1 + nx, y1 + ny],
    ],
  ];
}

/**
 * Het water binnen het kader, doorgeknipt, in losse stukken; elk stuk met de naam
 * van het water waar een zaadpunt in ligt (of null).
 */
function waterParts(land, neighbours, cuts) {
  const r = (g) => polygonsOf(round(g, 7));
  let water = polygonClipping.difference(boxPolygon(FRAME), r(neighbours));
  water = polygonClipping.difference(water, r(land));
  water = polygonClipping.difference(water, ...cuts.map(lineToStrip));
  const parts = water.map((poly, id) => ({
    id,
    poly,
    box: bbox(asMulti([poly])),
    area: areaKm2(asMulti([poly])),
    name: null,
  }));
  const conflicts = [];
  for (const [name, seeds] of Object.entries(SEEDS)) {
    for (const seed of seeds) {
      const part = parts.find((p) => inGeometry(seed, asMulti([p.poly])));
      if (!part) throw new Error(`Zaadpunt van ${name} ligt niet in het water: ${seed}`);
      if (part.name && part.name !== name) {
        conflicts.push(`${name} en ${part.name} lopen in elkaar over (bij ${seed})`);
        continue;
      }
      part.name = name;
    }
  }
  return { parts, conflicts };
}

/**
 * Welke dunne stukjes land mogen weg? `land` is Nederland vóór het weghalen. Een
 * stukje mag weg als het in (of tegen) precies één water ligt: dan is het een
 * nep-strook, strekdam of pier. Stukjes die twee wateren scheiden (dammen, sluizen,
 * bruggen) blijven staan.
 */
export function judgePieces({ land, neighbours, municipalities, pieces }) {
  const cuts = cutLines(municipalities, neighbours);
  const { parts, conflicts } = waterParts(land, neighbours, cuts);
  if (conflicts.length > 0) throw new Error(conflicts.join(' / '));
  // Getest met de punten van de (3 m ruimere) rand van het stukje: die liggen net
  // in het water ernaast.
  const verdict = pieces.map((piece) => {
    const box = bbox(piece);
    const near = parts.filter((p) => boxesTouch(box, p.box));
    const keys = new Set();
    let wet = false;
    for (const ring of polygonsOf(piece).map((poly) => poly[0])) {
      for (const point of ring) {
        const part = near.find((p) => inGeometry(point, asMulti([p.poly])));
        if (!part) continue;
        wet = true;
        // Piepkleine plasjes (kleiner dan 2 ha) tellen niet als apart water.
        if (part.name || part.area >= POCKET) keys.add(part.name ?? `#${part.id}`);
      }
    }
    return { piece, keys: [...keys], remove: wet && keys.size <= 1 };
  });
  return { verdict, cuts };
}

/**
 * De vormen van de wateren uit de lijst, uit het water rond het opgeschoonde land.
 * Omdat alleen stukjes binnen één water weg zijn, valt dat water nog steeds netjes
 * uiteen; de kust van elk water is precies de kust van het land.
 */
export function waterShapes({ land, neighbours, cuts }) {
  const { parts, conflicts } = waterParts(land, neighbours, cuts);
  if (conflicts.length > 0) throw new Error(conflicts.join(' / '));
  const shapes = {};
  for (const name of Object.keys(SEEDS)) {
    shapes[name] = asMulti(parts.filter((p) => p.name === name).map((p) => p.poly));
  }
  const unnamed = parts
    .filter((p) => !p.name)
    .map((p) => ({ area: p.area, box: p.box }))
    .filter((p) => p.area > 1)
    .sort((a, b) => b.area - a.area);
  return { shapes, unnamed };
}
