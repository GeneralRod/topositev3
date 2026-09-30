// Categorie "Nederland". De gegevens komen uit scripts/nederland/build.mjs (CBS,
// Kadaster, Rijkswaterstaat, Natural Earth); pas die aan en draai het script
// opnieuw, niet deze bestanden met de hand.

import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, MultiLineString, MultiPolygon } from 'geojson';
import type { City, PlaceKind } from '../cities';
import placeData from './places.json';
// Alleen de url: het kaartbestand wordt pas opgehaald als je gaat spelen.
import mapUrl from './map.json?url';
import type { BaseMap, CategoryMap } from '../../components/map/baseMap';
import { containsPoint, type ShapeData, type ShapeFeature } from '../../components/map/shapes';

interface PlaceRecord {
  name: string;
  package: string;
  kind: string;
  hint: string;
  lat: number;
  lng: number;
}

export const nederlandPlaces: City[] = (placeData as PlaceRecord[]).map((p) => ({
  name: p.name,
  country: 'Nederland',
  coordinates: [p.lat, p.lng],
  package: p.package,
  lat: p.lat,
  lng: p.lng,
  continent: p.hint,
  kind: p.kind as PlaceKind,
}));

interface MapFile {
  topology: Topology;
  /** De rest van Europa, grof (voor grote schermen). */
  far: MultiPolygon;
}

interface Loaded {
  base: BaseMap;
  shapes: ShapeData;
}

type Box = [number, number, number, number];

/** Land met de omringende rechthoek per deel, voor een snelle 'ligt dit op land?'-test. */
let landIndex: Array<{ geometry: Geometry; box: Box }> = [];

function parts(geometry: Geometry): Geometry[] {
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }));
  }
  return [geometry];
}

function boundingBox(geometry: Geometry): Box {
  const box: Box = [Infinity, Infinity, -Infinity, -Infinity];
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

function decode(file: MapFile): Loaded {
  const topo = file.topology;
  const objects = topo.objects as Record<string, GeometryCollection>;
  const provinces = feature(topo, objects.provinces) as FeatureCollection<
    Geometry,
    { name: string; tint: number }
  >;
  const neighbours = (feature(topo, objects.neighbours) as unknown as Feature).geometry;
  const line = (name: string) =>
    (feature(topo, objects[name]) as unknown as Feature<MultiLineString>).geometry;

  landIndex = [...provinces.features.map((f) => f.geometry), neighbours, file.far]
    .flatMap(parts)
    .map((geometry) => ({ geometry, box: boundingBox(geometry) }));

  const shapeFeatures = (feature(topo, objects.shapes) as FeatureCollection).features;
  const borders = (feature(topo, objects.seaBorders) as FeatureCollection).features;
  return {
    base: {
      land: provinces,
      neighbours: [neighbours, file.far],
      innerBorders: mesh(topo, objects.provinces, (a, b) => a !== b),
      coast: line('coast'),
      border: line('border'),
    },
    shapes: {
      type: 'FeatureCollection',
      features: [
        ...provinces.features.map((f): ShapeFeature => ({
          ...f,
          properties: { name: f.properties.name, kind: 'province', tint: f.properties.tint },
        })),
        ...(shapeFeatures as ShapeFeature[]),
      ],
      seaBorders: borders.map((f) => ({
        type: 'MultiLineString',
        // Wateren met alleen een dam ertussen hebben geen lijn (wel een andere tint).
        coordinates: f.geometry ? (f.geometry as MultiLineString).coordinates : [],
        between: (f.properties as { between: [string, string] }).between,
      })),
    },
  };
}

let cached: Promise<Loaded> | null = null;

function load(): Promise<Loaded> {
  cached ??= fetch(mapUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Kaart laden mislukt (${response.status})`);
      return response.json() as Promise<MapFile>;
    })
    .then(decode)
    .catch((error) => {
      // Volgende keer opnieuw proberen in plaats van de fout te onthouden.
      cached = null;
      throw error;
    });
  return cached;
}

export const loadNederlandShapes = (): Promise<ShapeData> => load().then((d) => d.shapes);

/** Ligt dit punt op land (Nederland of een buurland)? 'Nee' zolang de kaart nog laadt. */
export function isOnNederlandLand(lng: number, lat: number): boolean {
  return landIndex.some(
    ({ geometry, box }) =>
      lng >= box[0] &&
      lng <= box[2] &&
      lat >= box[1] &&
      lat <= box[3] &&
      containsPoint(geometry, lng, lat),
  );
}

export const nederlandMap: CategoryMap = {
  view: {
    fit: [
      [50.75, 3.35],
      [53.56, 7.23],
    ],
    minZoom: 6.5,
    maxBounds: [
      [49.8, 1.5],
      [54.8, 9.5],
    ],
    resetLabel: 'Heel Nederland',
  },
  loadBase: () => load().then((d) => d.base),
  isOnLand: isOnNederlandLand,
  attribution: 'Kaart: CBS, Kadaster, Rijkswaterstaat, Natural Earth',
};
