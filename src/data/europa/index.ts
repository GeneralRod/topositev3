// Categorie "Europa". De gegevens komen uit scripts/europa/build.mjs (Natural Earth
// 1:10 miljoen); pas die aan en draai het script opnieuw, niet deze bestanden met
// de hand.

import { feature, merge, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry, MultiLineString, MultiPolygon, Position } from 'geojson';
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

export const europaPlaces: City[] = (placeData as PlaceRecord[]).map((p) => ({
  name: p.name,
  country: '',
  coordinates: [p.lat, p.lng],
  package: p.package,
  lat: p.lat,
  lng: p.lng,
  continent: p.hint,
  kind: p.kind as PlaceKind,
}));

type Role = 'game' | 'small' | 'neighbour';
type Props = { name: string; role: Role; tint?: number };

interface MapFile {
  topology: Topology;
  /** Het getekende kader [west, zuid, oost, noord]. */
  frame: [number, number, number, number];
  /** De rest van de wereld, grof (voor brede schermen). */
  far: MultiPolygon;
}

interface Loaded {
  base: BaseMap;
  shapes: ShapeData;
}

type Box = [number, number, number, number];

/** Alle landen met hun omringende rechthoek, voor een snelle 'ligt dit op land?'-test. */
let landIndex: Array<{ geometry: Geometry; box: Box }> = [];

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

/** Buitenranden zonder de stukken langs het kader (dat is geen kust). */
export function withoutFrame(lines: Position[][], frame: Box): Position[][] {
  const onFrame = ([x, y]: Position) =>
    Math.abs(x - frame[0]) < 1e-3 ||
    Math.abs(x - frame[2]) < 1e-3 ||
    Math.abs(y - frame[1]) < 1e-3 ||
    Math.abs(y - frame[3]) < 1e-3;
  const out: Position[][] = [];
  for (const line of lines) {
    let current = [line[0]];
    for (let i = 1; i < line.length; i++) {
      if (onFrame(line[i - 1]) && onFrame(line[i])) {
        if (current.length > 1) out.push(current);
        current = [line[i]];
      } else current.push(line[i]);
    }
    if (current.length > 1) out.push(current);
  }
  return out;
}

function decode(file: MapFile): Loaded {
  const topo = file.topology;
  const object = (topo.objects as Record<string, GeometryCollection<Props>>).countries;
  const all = (feature(topo, object) as FeatureCollection<Geometry, Props>).features;
  const europe = all.filter((f) => f.properties.role !== 'neighbour');
  const others = object.geometries.filter(
    (g) => (g.properties as Props | undefined)?.role === 'neighbour',
  ) as Parameters<typeof merge>[1];

  landIndex = [...all.map((f) => f.geometry), file.far].map((geometry) => ({
    geometry,
    box: boundingBox(geometry),
  }));
  const outline = mesh(topo, object, (a, b) => a === b);
  return {
    base: {
      land: { type: 'FeatureCollection', features: europe },
      neighbours: [merge(topo, others), file.far],
      innerBorders: mesh(topo, object, (a, b) => a !== b),
      coast: {
        type: 'MultiLineString',
        coordinates: withoutFrame(outline.coordinates, file.frame),
      },
      border: { type: 'MultiLineString', coordinates: [] } as MultiLineString,
    },
    shapes: {
      type: 'FeatureCollection',
      features: all
        .filter((f) => f.properties.role === 'game')
        .map((f): ShapeFeature => ({
          ...f,
          properties: { name: f.properties.name, kind: 'country', tint: f.properties.tint },
        })),
      seaBorders: [],
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

export const loadEuropaShapes = (): Promise<ShapeData> => load().then((d) => d.shapes);

/** Ligt dit punt op land? 'Nee' zolang de kaart nog laadt. */
export function isOnEuropaLand(lng: number, lat: number): boolean {
  return landIndex.some(
    ({ geometry, box }) =>
      lng >= box[0] &&
      lng <= box[2] &&
      lat >= box[1] &&
      lat <= box[3] &&
      containsPoint(geometry, lng, lat),
  );
}

export const europaMap: CategoryMap = {
  view: {
    fit: [
      [34.5, -24.5],
      [71.2, 45],
    ],
    minZoom: 3,
    maxBounds: [
      [27, -38],
      [77, 72],
    ],
    resetLabel: 'Heel Europa',
  },
  loadBase: () => load().then((d) => d.base),
  isOnLand: isOnEuropaLand,
  attribution: 'Kaart: Natural Earth',
};
