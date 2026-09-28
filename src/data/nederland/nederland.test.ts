import { describe, expect, it } from 'vitest';
import { feature, neighbors } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import places from './places.json';
import mapFile from './map.json';
import { containsPoint } from '../../components/map/shapes';

// Controleert wat scripts/nederland/build.mjs heeft gemaakt.

const topo = (mapFile as unknown as { topology: Topology }).topology;
const objects = topo.objects as Record<string, GeometryCollection>;
type Props = { name: string; kind?: string; tint?: number };
const provinces = (feature(topo, objects.provinces) as FeatureCollection<Geometry, Props>).features;
const shapes = (feature(topo, objects.shapes) as FeatureCollection<Geometry, Props>).features;
const all: Array<Feature<Geometry, Props>> = [
  ...provinces.map((f) => ({ ...f, properties: { ...f.properties, kind: 'province' } })),
  ...shapes,
];

const inProvince = (lng: number, lat: number) =>
  provinces.find((p) => containsPoint(p.geometry, lng, lat))?.properties.name;

describe('Nederland: gegevens', () => {
  it('heeft alle 79 plekken van de lijst, verdeeld over 6 pakketten', () => {
    expect(places).toHaveLength(79);
    const perPackage = [12, 13, 15, 12, 11, 16];
    perPackage.forEach((count, i) => {
      expect(
        places.filter((p) => p.package === `nederland${i + 1}`),
        `pakket ${i + 1}`,
      ).toHaveLength(count);
    });
    const names = places.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('heeft voor elke plek (behalve steden en de berg) precies één vorm van dezelfde soort', () => {
    for (const place of places) {
      const matches = all.filter((f) => f.properties.name === place.name);
      const expected = place.kind === 'city' || place.kind === 'peak' ? 0 : 1;
      expect(matches, place.name).toHaveLength(expected);
      if (matches[0]) expect(matches[0].properties.kind, place.name).toBe(place.kind);
    }
    for (const f of all) {
      expect(
        places.some((p) => p.name === f.properties.name),
        f.properties.name,
      ).toBe(true);
    }
  });

  it('heeft het knipperpunt van elk vlak binnen dat vlak', () => {
    for (const place of places) {
      const f = all.find((x) => x.properties.name === place.name);
      if (!f || place.kind === 'river' || place.kind === 'dike') continue;
      expect(containsPoint(f.geometry, place.lng, place.lat), place.name).toBe(true);
    }
  });

  it('legt elke stad in de goede provincie', () => {
    const expected: Record<string, string> = {
      Amsterdam: 'Noord-Holland',
      Groningen: 'Groningen (provincie)',
      Leeuwarden: 'Friesland',
      Assen: 'Drenthe',
      Zwolle: 'Overijssel',
      Lelystad: 'Flevoland',
      Arnhem: 'Gelderland',
      Utrecht: 'Utrecht (provincie)',
      Haarlem: 'Noord-Holland',
      'Den Haag': 'Zuid-Holland',
      Middelburg: 'Zeeland',
      "'s-Hertogenbosch": 'Noord-Brabant',
      Maastricht: 'Limburg',
      Rotterdam: 'Zuid-Holland',
      Eindhoven: 'Noord-Brabant',
      Tilburg: 'Noord-Brabant',
      Almere: 'Flevoland',
      Breda: 'Noord-Brabant',
      Nijmegen: 'Gelderland',
      Apeldoorn: 'Gelderland',
      Enschede: 'Overijssel',
      Amersfoort: 'Utrecht (provincie)',
      Leiden: 'Zuid-Holland',
      Dordrecht: 'Zuid-Holland',
      Deventer: 'Overijssel',
      Venlo: 'Limburg',
      'Den Helder': 'Noord-Holland',
      Emmen: 'Drenthe',
    };
    const cities = places.filter((p) => p.kind === 'city');
    expect(cities.map((c) => c.name).sort()).toEqual(Object.keys(expected).sort());
    for (const city of cities) {
      expect(inProvince(city.lng, city.lat), city.name).toBe(expected[city.name]);
    }
  });

  it('legt elk water naast het land (niet eronder)', () => {
    for (const place of places.filter((p) => p.kind === 'sea')) {
      expect(inProvince(place.lng, place.lat), place.name).toBeUndefined();
    }
  });

  it('geeft buurprovincies een andere tint', () => {
    const adjacent = neighbors(objects.provinces.geometries);
    adjacent.forEach((others, i) => {
      for (const j of others) {
        expect(provinces[i].properties.tint, provinces[i].properties.name).not.toBe(
          provinces[j].properties.tint,
        );
      }
    });
  });

  it('heeft alleen grenzen tussen bekende wateren', () => {
    const waters = new Set([...places.filter((p) => p.kind === 'sea').map((p) => p.name), '-']);
    const borders = (feature(topo, objects.seaBorders) as FeatureCollection<Geometry | null>)
      .features;
    expect(borders.length).toBeGreaterThan(0);
    for (const b of borders) {
      for (const name of (b.properties as { between: string[] }).between) {
        expect(waters.has(name), name).toBe(true);
      }
    }
  });

  it('heeft een hint voor elke plek', () => {
    for (const place of places) expect(place.hint.length, place.name).toBeGreaterThan(0);
  });
});
