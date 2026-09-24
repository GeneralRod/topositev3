// Vormen op de kaart (zeeën, meren, rivieren, gebieden): het bestandsformaat,
// kleuren per soort en een test of een punt in een vlak ligt. Pure functies,
// getest in shapes.test.ts.

import type { Feature, FeatureCollection, Geometry, MultiLineString, Position } from 'geojson';
import type { PathOptions } from 'leaflet';
import type { PlaceKind } from '../../data/cities';
import type { CityStatus } from '../../game/rules';

export interface ShapeData extends FeatureCollection<Geometry, { name: string; kind: PlaceKind }> {
  /** Grenzen tussen zeeën (in open water), om te zien waar de ene zee ophoudt. */
  seaBorders: MultiLineString;
}

export type ShapeFeature = Feature<Geometry, { name: string; kind: PlaceKind }>;

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
  sea: '#5b9bd5',
  seaBorder: '#4a7fae',
  lake: '#6fb0e0',
  lakeEdge: '#3f7fb5',
  river: '#2f7fc1',
  desert: '#e2b96f',
  desertEdge: '#b98d3e',
  range: '#9c7a5b',
  rangeEdge: '#6f5238',
  highlight: '#ff9800',
} as const;

/** Stijl van een vorm, afhankelijk van soort en of hij al gevonden is. */
export function shapeStyle(kind: PlaceKind, status: CityStatus): PathOptions {
  const done = status === 'green' || status === 'blue';
  const doneColor = status === 'green' ? SHAPE_COLORS.found : SHAPE_COLORS.retry;
  switch (kind) {
    case 'sea':
      return {
        stroke: false,
        fillColor: done ? doneColor : SHAPE_COLORS.sea,
        fillOpacity: done ? 0.6 : 0.3,
      };
    case 'lake':
      return {
        color: done ? doneColor : SHAPE_COLORS.lakeEdge,
        weight: 1,
        fillColor: done ? doneColor : SHAPE_COLORS.lake,
        fillOpacity: done ? 0.75 : 0.9,
      };
    case 'river':
      return { color: done ? doneColor : SHAPE_COLORS.river, weight: done ? 4 : 2.5, fill: false };
    case 'desert':
      return {
        color: done ? doneColor : SHAPE_COLORS.desertEdge,
        weight: 1.5,
        dashArray: done ? undefined : '5 4',
        fillColor: done ? doneColor : SHAPE_COLORS.desert,
        fillOpacity: done ? 0.55 : 0.45,
      };
    default:
      return {
        color: done ? doneColor : SHAPE_COLORS.rangeEdge,
        weight: 1.5,
        fillColor: done ? doneColor : SHAPE_COLORS.range,
        fillOpacity: done ? 0.55 : 0.4,
      };
  }
}

/** Stijl voor de vorm die bij meerkeuze knippert. */
export function highlightStyle(kind: PlaceKind): PathOptions {
  if (kind === 'river') return { color: SHAPE_COLORS.highlight, weight: 6, fill: false };
  return {
    color: SHAPE_COLORS.highlight,
    weight: kind === 'sea' ? 0 : 3,
    stroke: kind !== 'sea',
    fillColor: SHAPE_COLORS.highlight,
    // Zeeën iets voller: half doorzichtig oranje op blauw water wordt bruin, net land.
    fillOpacity: kind === 'sea' ? 0.8 : 0.6,
  };
}
