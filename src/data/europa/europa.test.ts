import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import places from './places.json';
import mapFile from './map.json';
import { containsPoint } from '../../components/map/shapes';
import { withoutFrame } from '.';

// Controleert wat scripts/europa/build.mjs heeft gemaakt.

const topo = (mapFile as unknown as { topology: Topology }).topology;
const object = (topo.objects as Record<string, GeometryCollection>).countries;
type Props = { name: string; role: 'game' | 'small' | 'neighbour'; tint?: number };
const all = (feature(topo, object) as FeatureCollection<Geometry, Props>).features;
const shape = (name: string) => all.find((f) => f.properties.name === name);
const countryAt = (lng: number, lat: number) =>
  all.find((f) => containsPoint(f.geometry, lng, lat))?.properties.name;

describe('Europa: gegevens', () => {
  it('heeft alle 88 plekken van de lijst, verdeeld over 6 pakketten', () => {
    expect(places).toHaveLength(88);
    [17, 12, 12, 17, 24, 6].forEach((count, i) => {
      expect(
        places.filter((p) => p.package === `europa${i + 1}`),
        `pakket ${i + 1}`,
      ).toHaveLength(count);
    });
    const names = places.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('heeft voor elk land precies één vorm om aan te wijzen, en niets extra', () => {
    const game = all.filter((f) => f.properties.role === 'game');
    const countries = places.filter((p) => p.kind === 'country');
    expect(game).toHaveLength(countries.length);
    for (const c of countries) {
      expect(
        game.filter((f) => f.properties.name === c.name),
        c.name,
      ).toHaveLength(1);
    }
  });

  it('heeft het knipperpunt van elk land binnen dat land', () => {
    for (const c of places.filter((p) => p.kind === 'country')) {
      expect(containsPoint(shape(c.name)!.geometry, c.lng, c.lat), c.name).toBe(true);
    }
  });

  it('heeft elke hoofdstad in het goede land', () => {
    for (const city of places.filter((p) => p.hint.startsWith('Hoofdstad van '))) {
      const country = city.hint.replace('Hoofdstad van ', '').replace(/^het /, '');
      expect(countryAt(city.lng, city.lat), city.name).toBe(country);
    }
  });

  it('heeft de stip van elk klein land in dat land', () => {
    for (const p of places.filter((x) => x.package === 'europa6')) {
      // Vaticaanstad is te klein voor een eigen vorm in de kaartbron: een stip in Rome.
      expect(countryAt(p.lng, p.lat), p.name).toBe(p.name === 'Vaticaanstad' ? 'Italië' : p.name);
    }
  });

  it('rekent de Krim tot Oekraïne', () => {
    expect(countryAt(34.1, 44.95)).toBe('Oekraïne');
    expect(countryAt(33.52, 44.6)).toBe('Oekraïne');
  });

  it('geeft buurlanden een andere tint', () => {
    const tint = (name: string) => shape(name)?.properties.tint;
    for (const [a, b] of [
      ['Nederland', 'Duitsland'],
      ['Nederland', 'België'],
      ['Frankrijk', 'Spanje'],
      ['Servië', 'Kosovo'],
      ['Polen', 'Wit-Rusland'],
    ]) {
      expect(tint(a), `${a}/${b}`).not.toBe(tint(b));
    }
  });
});

describe('Europa: kust', () => {
  it('tekent geen kust langs de rand van het kader', () => {
    const frame: [number, number, number, number] = [-60, 18, 100, 82];
    const lines = withoutFrame(
      [
        [
          [-60, 40],
          [-60, 41],
          [-29, 41],
          [-28, 42],
        ],
      ],
      frame,
    );
    expect(lines).toEqual([
      [
        [-60, 41],
        [-29, 41],
        [-28, 42],
      ],
    ]);
  });
});
