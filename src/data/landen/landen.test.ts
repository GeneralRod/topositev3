import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import world from 'world-atlas/countries-50m.json';
import places from './places.json';
import england from './england.json';
import { countryShapes } from './index';
import { containsPoint } from '../../components/map/shapes';
import { unwrapFeatures } from '../../components/map/dateLine';

// Controleert wat scripts/landen/build.mjs heeft gemaakt, met de echte wereldkaart.

const topo = world as unknown as Topology;
const land = unwrapFeatures(
  feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection,
);
const shapes = countryShapes(land, england as unknown as Geometry).features;
const shapeOf = (name: string) =>
  shapes.find((f) => f.properties.name === name)!.geometry as MultiPolygon;

describe('landen van de wereld: gegevens', () => {
  it('heeft alle 75 landen: 50 in pakket 1 (per werelddeel), 10 in pakket 2, 15 in pakket 3', () => {
    expect(places).toHaveLength(75);
    const count = (pkg: string) => places.filter((p) => p.package === pkg).length;
    expect(count('landen1-europa')).toBe(8);
    expect(count('landen1-afrika')).toBe(12);
    expect(count('landen1-noord-amerika')).toBe(4);
    expect(count('landen1-azie')).toBe(18);
    expect(count('landen1-zuid-amerika')).toBe(6);
    expect(count('landen1-oceanie')).toBe(2);
    expect(count('landen2')).toBe(10);
    expect(count('landen3')).toBe(15);
    const names = places.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('heeft voor elk land een vorm, met het knipperpunt erin', () => {
    expect(shapes).toHaveLength(places.length);
    for (const place of places) {
      const shape = shapeOf(place.name);
      expect(shape.coordinates.length, place.name).toBeGreaterThan(0);
      expect(containsPoint(shape, place.lng, place.lat), place.name).toBe(true);
    }
  });

  it('laat verre gebieden weg (Frankrijk zonder Frans-Guyana, Nederland zonder de Antillen)', () => {
    for (const name of ['Frankrijk', 'Nederland']) {
      for (const poly of shapeOf(name).coordinates) {
        for (const [, lat] of poly[0]) expect(lat, name).toBeGreaterThan(40);
      }
    }
  });

  it('neemt Somaliland mee bij Somalië en tekent Engeland zonder Schotland', () => {
    const somalie = shapeOf('Somalië');
    expect(containsPoint(somalie, 44.06, 9.56)).toBe(true); // Hargeisa
    const engeland = shapeOf('Engeland');
    expect(containsPoint(engeland, -0.13, 51.51)).toBe(true); // Londen
    expect(containsPoint(engeland, -3.19, 55.95)).toBe(false); // Edinburgh
    expect(containsPoint(engeland, -3.18, 51.48)).toBe(false); // Cardiff
  });

  it('geeft buurlanden een andere tint', () => {
    const points = new Map(
      shapes.map((f) => [
        f.properties.name,
        new Set((f.geometry as MultiPolygon).coordinates.flat(2).map((p) => p.join(','))),
      ]),
    );
    const tint = new Map(places.map((p) => [p.name, p.tint]));
    for (const a of places) {
      for (const b of places) {
        if (a.name >= b.name) continue;
        const shared = [...points.get(a.name)!].some((k) => points.get(b.name)!.has(k));
        if (shared) expect(tint.get(a.name), `${a.name}/${b.name}`).not.toBe(tint.get(b.name));
      }
    }
  });

  it('geeft als hint het werelddeel', () => {
    const delen = ['Europa', 'Afrika', 'Noord-Amerika', 'Azië', 'Zuid-Amerika', 'Oceanië'];
    for (const place of places) expect(delen, place.name).toContain(place.hint);
  });
});
