// Categorie "Landen van de wereld". De lijst komt uit scripts/landen/build.mjs; pas
// die aan en draai het script opnieuw, niet deze bestanden met de hand.
//
// De vormen van de landen komen uit dezelfde wereldkaart die de site toch al laadt
// (world-atlas), dus ze passen er precies op en er hoeft niets extra's te laden.
// Alleen Engeland staat daar niet los in (het Verenigd Koninkrijk is één land): dat
// komt uit england.json.

import type { Feature, FeatureCollection, Geometry, MultiPolygon, Position } from 'geojson';
import type { City } from '../cities';
import placeData from './places.json';
import type { ShapeData, ShapeFeature } from '../../components/map/shapes';

export interface CountryRecord {
  name: string;
  package: string;
  kind: string;
  hint: string;
  lat: number;
  lng: number;
  tint: number;
  /** Naam of namen van het land in world-atlas. */
  atlas?: string[];
  /** Alleen de delen binnen dit kader [west, zuid, oost, noord]. */
  within?: number[];
  /** Vorm uit england.json. */
  england?: boolean;
}

const records = placeData as CountryRecord[];

export const countryPlaces: City[] = records.map((p) => ({
  name: p.name,
  country: '',
  coordinates: [p.lat, p.lng],
  package: p.package,
  lat: p.lat,
  lng: p.lng,
  continent: p.hint,
  kind: 'country',
}));

function polygonsOf(geometry: Geometry): Position[][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

/** Ligt het midden van de omringende rechthoek van dit deel in het kader? */
function partWithin(poly: Position[][], [w, s, e, n]: number[]): boolean {
  const xs = poly[0].map((p) => p[0]);
  const ys = poly[0].map((p) => p[1]);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  return x >= w && x <= e && y >= s && y <= n;
}

/**
 * De vormen van alle landen uit de lijst, uit de landen van de wereldkaart. Ook
 * gebruikt door de vlaggen (met hun eigen lijst, zonder Engeland).
 */
export function countryShapes(
  land: FeatureCollection,
  england: Geometry | null,
  list: CountryRecord[] = records,
): ShapeData {
  const byName = new Map(
    land.features.map((f) => [(f.properties as { name: string }).name, f as Feature]),
  );
  const features = list.map((record): ShapeFeature => {
    const parts =
      record.england && england
        ? polygonsOf(england)
        : (record.atlas ?? []).flatMap((name) => {
            const f = byName.get(name);
            if (!f) throw new Error(`Land niet gevonden op de wereldkaart: ${name}`);
            return polygonsOf(f.geometry);
          });
    const kept = record.within ? parts.filter((poly) => partWithin(poly, record.within!)) : parts;
    const geometry: MultiPolygon = { type: 'MultiPolygon', coordinates: kept };
    return {
      type: 'Feature',
      properties: { name: record.name, kind: 'country', tint: record.tint },
      geometry,
    };
  });
  return { type: 'FeatureCollection', features, seaBorders: [] };
}

let cached: Promise<ShapeData> | null = null;

export function loadCountryShapes(): Promise<ShapeData> {
  cached ??= Promise.all([import('../../components/map/world'), import('./england.json')])
    .then(async ([world, england]) => {
      const { land } = await world.loadWorld();
      return countryShapes(land, (england.default ?? england) as Geometry);
    })
    .catch((error) => {
      // Volgende keer opnieuw proberen in plaats van de fout te onthouden.
      cached = null;
      throw error;
    });
  return cached;
}
