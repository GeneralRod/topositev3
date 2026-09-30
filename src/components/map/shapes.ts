// Vormen op de kaart (zeeën, meren, rivieren, gebieden): het bestandsformaat,
// kleuren per soort en een test of een punt in een vlak ligt. Pure functies,
// getest in shapes.test.ts.

import type { Feature, FeatureCollection, Geometry, MultiLineString, Position } from 'geojson';
import type { PathOptions } from 'leaflet';
import type { PlaceKind } from '../../data/cities';
import type { CityStatus } from '../../game/rules';
import { COAST_COLOR, WATER_COLOR } from './mapSettings';

export interface ShapeProperties {
  name: string;
  kind: PlaceKind;
  /** Vaste tint (landen, provincies, rivieren: buren verschillen, zoals op een atlaskaart). */
  tint?: number;
}

export interface ShapeData extends FeatureCollection<Geometry, ShapeProperties> {
  /**
   * Grenzen tussen zeeën (in open water), om te zien waar de ene zee ophoudt. Per
   * paar zeeën; '-' is zee die bij geen onderdeel hoort.
   */
  seaBorders: Array<MultiLineString & { between: [string, string] }>;
}

export type ShapeFeature = Feature<Geometry, ShapeProperties>;

// ---------- punt in vlak ----------

function inRing(x: number, y: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Ligt het punt (lengte, breedte) in dit vlak? Gaten (eilanden) tellen niet mee. */
export function containsPoint(geometry: Geometry, lng: number, lat: number): boolean {
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];
  // Buitenrand en gaten samen: oneven aantal keer binnen = in het vlak.
  return polygons.some((rings) => rings.filter((ring) => inRing(lng, lat, ring)).length % 2 === 1);
}

// ---------- kleuren ----------

export const SHAPE_COLORS = {
  found: '#34a853',
  /** Gevonden na een fout (komt nog terug). Paarsblauw: valt op tegen blauw water. */
  retry: '#6c5ce7',
  seaBorder: '#1f4e79',
  lake: '#6fb0e0',
  lakeEdge: '#3f7fb5',
  river: '#2f7fc1',
  desert: '#e2b96f',
  desertEdge: '#b98d3e',
  range: '#9c7a5b',
  rangeEdge: '#6f5238',
  /** Trog: donker, zoals diep water op een atlaskaart. */
  trench: '#1b2a6b',
  trenchEdge: '#0d1540',
  /** Rand van een land of provincie als de muis erop staat. */
  countryEdge: '#8a7650',
  /** Streek of polder: oranjebruin met een gestippelde rand. */
  region: '#e08a2e',
  regionEdge: '#a3591a',
  /** Eiland: zandkleur met een donkere rand. */
  island: '#d9a441',
  islandEdge: '#8a6420',
  dike: '#5d4037',
  highlight: '#ff9800',
} as const;

/**
 * Tinten voor landen en provincies (zacht, zoals op een atlaskaart). Buren krijgen
 * een andere tint. Geen groen of paars: die betekenen 'gevonden'.
 */
export const AREA_TINTS = ['#f6d38b', '#f4b49a', '#e9c7a0', '#f2a7b8', '#d8c48c'] as const;

/**
 * Meer dat niet in het pakket zit: gewoon water, net als de zee op de wereldkaart
 * (die heeft zelf geen meren). Niet aan te klikken.
 */
export const PLAIN_LAKE_STYLE: PathOptions = {
  color: COAST_COLOR,
  weight: 1,
  fillColor: WATER_COLOR,
  fillOpacity: 1,
};

/**
 * Tinten voor zeeën die meedoen. Buurzeeën krijgen een andere tint (zie seaTints),
 * zodat je ziet waar de ene zee ophoudt en de andere begint. Geen groen of paars:
 * die betekenen 'gevonden'.
 */
export const SEA_TINTS = ['#2f7fd8', '#22a3c4', '#2d5fa8', '#56aee8', '#4f7fb0'] as const;

/**
 * Geef elke zee een tint (nummer in SEA_TINTS), zo dat twee zeeën met een
 * gedeelde grens nooit dezelfde krijgen. Vast per naam, dus in elk pakket gelijk.
 */
export function seaTints(
  names: string[],
  borders: Array<{ between: [string, string] }>,
): Record<string, number> {
  const neighbours = new Map<string, Set<string>>();
  for (const { between } of borders) {
    const [a, b] = between;
    if (a === '-' || b === '-') continue;
    neighbours.set(a, (neighbours.get(a) ?? new Set()).add(b));
    neighbours.set(b, (neighbours.get(b) ?? new Set()).add(a));
  }
  const tints: Record<string, number> = {};
  for (const name of [...names].sort((x, y) => x.localeCompare(y))) {
    const taken = new Set([...(neighbours.get(name) ?? [])].map((n) => tints[n]));
    let tint = 0;
    while (taken.has(tint)) tint++;
    tints[name] = tint;
  }
  return tints;
}

export interface StyleOptions {
  /** Muis staat erop: laat duidelijk zien wat je aanklikt. */
  hovered?: boolean;
  /** Tint van een zee (zie seaTints). */
  tint?: number;
}

/** Stijl van een vorm, afhankelijk van soort, of hij al gevonden is en of de muis erop staat. */
export function shapeStyle(
  kind: PlaceKind,
  status: CityStatus,
  { hovered = false, tint = 0 }: StyleOptions = {},
): PathOptions {
  const done = status === 'green' || status === 'blue';
  const doneColor = status === 'green' ? SHAPE_COLORS.found : SHAPE_COLORS.retry;
  switch (kind) {
    case 'sea':
      return {
        // De rand valt aan de kust onder het land; in open water zie je hem bij aanwijzen.
        stroke: hovered,
        color: '#ffffff',
        weight: 2.5,
        fillColor: done ? doneColor : SEA_TINTS[tint % SEA_TINTS.length],
        fillOpacity: hovered ? 0.85 : done ? 0.6 : 0.5,
      };
    case 'lake':
      return {
        color: done ? doneColor : SHAPE_COLORS.lakeEdge,
        weight: hovered ? 3 : 1,
        fillColor: done ? doneColor : SHAPE_COLORS.lake,
        fillOpacity: done ? 0.75 : 0.9,
      };
    case 'river':
      return {
        color: done ? doneColor : SHAPE_COLORS.river,
        weight: (done ? 4 : 2.5) + (hovered ? 2.5 : 0),
        fill: false,
      };
    case 'trench':
      return {
        color: done ? doneColor : SHAPE_COLORS.trenchEdge,
        weight: hovered ? 3 : 1.5,
        fillColor: done ? doneColor : SHAPE_COLORS.trench,
        fillOpacity: (done ? 0.65 : 0.6) + (hovered ? 0.25 : 0),
      };
    case 'desert':
      return {
        color: done ? doneColor : SHAPE_COLORS.desertEdge,
        weight: hovered ? 3 : 1.5,
        dashArray: done ? undefined : '5 4',
        fillColor: done ? doneColor : SHAPE_COLORS.desert,
        fillOpacity: (done ? 0.55 : 0.45) + (hovered ? 0.25 : 0),
      };
    case 'country':
    case 'province':
      return {
        color: hovered ? SHAPE_COLORS.countryEdge : '#ffffff',
        weight: hovered ? 3 : 1,
        fillColor: done ? doneColor : AREA_TINTS[tint % AREA_TINTS.length],
        fillOpacity: (done ? 0.65 : 0.8) + (hovered ? 0.15 : 0),
      };
    case 'region':
      return {
        color: done ? doneColor : SHAPE_COLORS.regionEdge,
        weight: hovered ? 3 : 1.5,
        dashArray: done ? undefined : '6 4',
        fillColor: done ? doneColor : SHAPE_COLORS.region,
        fillOpacity: (done ? 0.55 : 0.3) + (hovered ? 0.25 : 0),
      };
    case 'island':
      return {
        color: done ? doneColor : SHAPE_COLORS.islandEdge,
        weight: hovered ? 3 : 1.2,
        fillColor: done ? doneColor : SHAPE_COLORS.island,
        fillOpacity: (done ? 0.6 : 0.45) + (hovered ? 0.25 : 0),
      };
    case 'dike':
      return {
        color: done ? doneColor : SHAPE_COLORS.dike,
        weight: (done ? 5 : 4) + (hovered ? 2.5 : 0),
        lineCap: 'butt',
        fill: false,
      };
    default:
      return {
        color: done ? doneColor : SHAPE_COLORS.rangeEdge,
        weight: hovered ? 3 : 1.5,
        fillColor: done ? doneColor : SHAPE_COLORS.range,
        fillOpacity: (done ? 0.55 : 0.4) + (hovered ? 0.25 : 0),
      };
  }
}

/** Stijl voor de vorm die bij meerkeuze knippert. */
export function highlightStyle(kind: PlaceKind): PathOptions {
  if (kind === 'river' || kind === 'dike') {
    return { color: SHAPE_COLORS.highlight, weight: 6, fill: false };
  }
  return {
    color: SHAPE_COLORS.highlight,
    weight: kind === 'sea' ? 0 : 3,
    stroke: kind !== 'sea',
    fillColor: SHAPE_COLORS.highlight,
    // Zeeën iets voller: half doorzichtig oranje op blauw water wordt bruin, net land.
    fillOpacity: kind === 'sea' ? 0.8 : 0.6,
  };
}
