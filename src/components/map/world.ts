import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry, MultiLineString } from 'geojson';
import { splitAtDateLine, unwrapFeatures } from './dateLine';
import { containsPoint } from './shapes';

// Eigen wereldkaart zonder namen: landen en grenzen uit Natural Earth (vrij te
// gebruiken), meegeleverd met de site. Geen externe kaartdienst, geen sleutel.

export interface WorldShapes {
  land: FeatureCollection;
  borders: MultiLineString;
  coasts: MultiLineString;
}

let cached: Promise<WorldShapes> | null = null;
/** Landen met hun omringende rechthoek, voor een snelle 'ligt dit op land?'-test. */
let landIndex: Array<{ geometry: Geometry; box: [number, number, number, number] }> | null = null;

export function loadWorld(): Promise<WorldShapes> {
  cached ??= import('world-atlas/countries-50m.json').then((module) => {
    const topo = (module.default ?? module) as unknown as Topology;
    const countries = topo.objects.countries as GeometryCollection;
    const land = unwrapFeatures(feature(topo, countries) as FeatureCollection);
    landIndex = land.features.map((f) => ({ geometry: f.geometry, box: boundingBox(f.geometry) }));
    return {
      land,
      // Grens tussen twee landen (a !== b) of kustlijn (a === b).
      borders: splitAtDateLine(mesh(topo, countries, (a, b) => a !== b)),
      coasts: splitAtDateLine(mesh(topo, countries, (a, b) => a === b)),
    };
  });
  return cached;
}

function boundingBox(geometry: Geometry): [number, number, number, number] {
  const box: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === 'number') {
      box[0] = Math.min(box[0], c[0]);
      box[1] = Math.min(box[1], c[1] as number);
      box[2] = Math.max(box[2], c[0]);
      box[3] = Math.max(box[3], c[1] as number);
    } else if (Array.isArray(c)) c.forEach(walk);
  };
  if ('coordinates' in geometry) walk(geometry.coordinates);
  return box;
}

/**
 * Ligt dit punt op land (zoals de kaart het tekent)? Onbekend zolang de
 * wereldkaart nog niet geladen is: dan 'nee'.
 */
export function isOnLand(lng: number, lat: number): boolean {
  return (landIndex ?? []).some(
    ({ geometry, box }) =>
      lng >= box[0] &&
      lng <= box[2] &&
      lat >= box[1] &&
      lat <= box[3] &&
      containsPoint(geometry, lng, lat),
  );
}
