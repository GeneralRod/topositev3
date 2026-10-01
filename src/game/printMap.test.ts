import { describe, expect, it } from 'vitest';
import { numberPlaces, printBounds } from './printMap';

const p = (name: string, lat: number, lng: number) => ({ name, lat, lng });

describe('oefenkaart: nummers', () => {
  it('nummert van boven naar beneden en per strook van links naar rechts', () => {
    const places = [
      p('Rome', 41.9, 12.5),
      p('Oslo', 59.9, 10.8),
      p('Madrid', 40.4, -3.7),
      p('Stockholm', 59.3, 18.1),
      p('Athene', 38.0, 23.7),
    ];
    expect(numberPlaces(places, 2).map((x) => x.name)).toEqual([
      'Oslo',
      'Stockholm',
      'Madrid',
      'Rome',
      'Athene',
    ]);
  });

  it('geeft elke plek precies één nummer', () => {
    const places = Array.from({ length: 30 }, (_, i) =>
      p(`plek ${i}`, (i * 37) % 60, (i * 53) % 90),
    );
    const numbered = numberPlaces(places);
    expect(numbered).toHaveLength(30);
    expect(new Set(numbered.map((x) => x.name)).size).toBe(30);
  });

  it('kan ook met één plek of geen plekken', () => {
    expect(numberPlaces([])).toEqual([]);
    expect(numberPlaces([p('Amsterdam', 52.4, 4.9)])).toHaveLength(1);
  });
});

describe('oefenkaart: uitsnede', () => {
  it('neemt alle plekken mee, met wat ruimte eromheen', () => {
    const [[south, west], [north, east]] = printBounds([p('a', 50, 4), p('b', 54, 7)]);
    expect(south).toBeLessThan(50);
    expect(west).toBeLessThan(4);
    expect(north).toBeGreaterThan(54);
    expect(east).toBeGreaterThan(7);
  });

  it('blijft binnen de wereldkaart', () => {
    const [[south, west], [north, east]] = printBounds([p('a', -78, -179), p('b', 84, 179)]);
    expect(south).toBeGreaterThanOrEqual(-80);
    expect(west).toBeGreaterThanOrEqual(-180);
    expect(north).toBeLessThanOrEqual(85);
    expect(east).toBeLessThanOrEqual(180);
  });
});
