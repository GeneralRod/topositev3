import { describe, expect, it } from 'vitest';
import type { Geometry } from 'geojson';
import places from './places.json';
import shapes from './shapes.json';
import { containsPoint } from '../../components/map/shapes';

// Controleert wat scripts/wateren/build.mjs heeft gemaakt.

const features = shapes.features as Array<{
  properties: { name: string; kind: string };
  geometry: Geometry;
}>;

describe('wateren en landschappen: gegevens', () => {
  it('heeft pakket 1, 2 en 3 met de 40, 10 en 10 onderdelen van de lijst', () => {
    expect(places.filter((p) => p.package === 'wateren1')).toHaveLength(40);
    expect(places.filter((p) => p.package === 'wateren2')).toHaveLength(10);
    expect(places.filter((p) => p.package === 'wateren3')).toHaveLength(10);
    const names = places.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('heeft voor elke plek (behalve bergtoppen) precies één vorm van dezelfde soort', () => {
    for (const place of places) {
      const matches = features.filter((f) => f.properties.name === place.name);
      expect(matches, place.name).toHaveLength(place.kind === 'peak' ? 0 : 1);
      if (matches[0]) expect(matches[0].properties.kind, place.name).toBe(place.kind);
    }
    for (const f of features) {
      expect(
        places.some((p) => p.name === f.properties.name),
        f.properties.name,
      ).toBe(true);
    }
  });

  it('heeft het knipperpunt van elk vlak binnen dat vlak', () => {
    for (const place of places) {
      const f = features.find((x) => x.properties.name === place.name);
      if (!f || place.kind === 'river') continue;
      expect(containsPoint(f.geometry, place.lng, place.lat), place.name).toBe(true);
    }
  });

  it('heeft een hint voor elke plek', () => {
    for (const place of places) expect(place.hint.length, place.name).toBeGreaterThan(0);
  });
});
