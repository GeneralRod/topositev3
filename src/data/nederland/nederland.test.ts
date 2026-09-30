import { describe, expect, it } from 'vitest';
import { feature, neighbors } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, MultiLineString } from 'geojson';
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
  it('heeft alle 74 plekken van de lijst, verdeeld over 6 pakketten', () => {
    expect(places).toHaveLength(74);
    const perPackage = [12, 13, 15, 12, 9, 13];
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

  it('laat de rivieren tot aan zee lopen, met een eigen tint per rivier', () => {
    const rivers = shapes.filter((f) => f.properties.kind === 'river');
    expect(rivers.map((r) => r.properties.name).sort()).toEqual(
      [
        'IJssel',
        'Lek',
        'Maas',
        'Merwede',
        'Nederrijn',
        'Nieuwe Maas',
        'Nieuwe Waterweg',
        'Rijn',
        'Waal',
      ].sort(),
    );
    const lines = (name: string) =>
      (rivers.find((r) => r.properties.name === name)!.geometry as MultiLineString).coordinates;
    // De Nieuwe Waterweg eindigt in zee voorbij Hoek van Holland (westelijker dan 4,1° oost).
    expect(
      Math.min(
        ...lines('Nieuwe Waterweg')
          .flat()
          .map(([x]) => x),
      ),
    ).toBeLessThan(4.1);
    // Aansluitende rivieren (binnen ~1 km) hebben een andere tint.
    const near = (a: string, b: string) =>
      lines(a)
        .flatMap((l) => [l[0], l[l.length - 1]])
        .some(([x, y]) =>
          lines(b)
            .flat()
            .some(([u, v]) => Math.hypot((u - x) * 68, (v - y) * 111) < 1),
        );
    for (const a of rivers) {
      expect(a.properties.tint, a.properties.name).toBeDefined();
      for (const b of rivers) {
        if (a === b || !near(a.properties.name, b.properties.name)) continue;
        expect(a.properties.tint, `${a.properties.name}/${b.properties.name}`).not.toBe(
          b.properties.tint,
        );
      }
    }
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
