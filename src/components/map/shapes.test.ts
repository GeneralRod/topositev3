import { describe, expect, it } from 'vitest';
import type { Polygon, MultiPolygon } from 'geojson';
import { containsPoint, SEA_TINTS, seaTints, shapeStyle } from './shapes';
import shapes from '../../data/wateren/shapes.json';

// Vierkant van 0 tot 10 met een 'eiland' (gat) van 4 tot 6.
const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
    [
      [4, 4],
      [6, 4],
      [6, 6],
      [4, 6],
      [4, 4],
    ],
  ],
};

describe('punt in vlak', () => {
  it('ziet of een punt binnen of buiten ligt', () => {
    expect(containsPoint(square, 2, 2)).toBe(true);
    expect(containsPoint(square, 12, 2)).toBe(false);
    expect(containsPoint(square, -1, 5)).toBe(false);
  });

  it('telt een gat (eiland) niet als binnen', () => {
    expect(containsPoint(square, 5, 5)).toBe(false);
    expect(containsPoint(square, 3.9, 5)).toBe(true);
  });

  it('werkt met meerdere delen', () => {
    const two: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        square.coordinates,
        [
          [
            [20, 0],
            [30, 0],
            [30, 10],
            [20, 0],
          ],
        ],
      ],
    };
    expect(containsPoint(two, 29, 5)).toBe(true);
    expect(containsPoint(two, 15, 5)).toBe(false);
  });

  it('een lijn heeft geen binnenkant', () => {
    expect(
      containsPoint(
        {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [10, 10],
          ],
        },
        5,
        5,
      ),
    ).toBe(false);
  });
});

describe('kleuren van vormen', () => {
  it('kleurt gevonden plekken groen, na een fout paarsblauw', () => {
    expect(shapeStyle('lake', 'green').fillColor).toBe('#34a853');
    expect(shapeStyle('lake', 'blue').fillColor).toBe('#6c5ce7');
    expect(shapeStyle('river', 'green').color).toBe('#34a853');
  });

  it('tekent zeeën zonder rand (de kust komt van de wereldkaart)', () => {
    expect(shapeStyle('sea', 'unanswered').stroke).toBe(false);
  });

  it('laat zien wat je aanwijst', () => {
    const sea = shapeStyle('sea', 'unanswered', { hovered: true });
    expect(sea.fillOpacity).toBeGreaterThan(shapeStyle('sea', 'unanswered').fillOpacity!);
    expect(sea.stroke).toBe(true);
    expect(shapeStyle('river', 'unanswered', { hovered: true }).weight).toBeGreaterThan(
      shapeStyle('river', 'unanswered').weight!,
    );
  });

  it('kleurt een zee met zijn eigen tint', () => {
    expect(shapeStyle('sea', 'unanswered', { tint: 1 }).fillColor).toBe(SEA_TINTS[1]);
    // Gevonden gaat voor de tint.
    expect(shapeStyle('sea', 'green', { tint: 1 }).fillColor).toBe('#34a853');
  });
});

describe('tinten van zeeën', () => {
  const borders: Array<{ between: [string, string] }> = [
    { between: ['Noordzee', 'Atlantische Oceaan'] },
    { between: ['Noordzee', 'Oostzee'] },
    { between: ['Atlantische Oceaan', 'Oostzee'] },
    { between: ['Atlantische Oceaan', '-'] },
  ];
  const names = ['Noordzee', 'Atlantische Oceaan', 'Oostzee', 'Zwarte Zee'];

  it('geeft buurzeeën nooit dezelfde tint', () => {
    const tints = seaTints(names, borders);
    for (const { between } of borders) {
      if (between.includes('-')) continue;
      expect(tints[between[0]], between.join('/')).not.toBe(tints[between[1]]);
    }
  });

  it('geeft steeds dezelfde tinten, ook in een andere volgorde', () => {
    expect(seaTints([...names].reverse(), borders)).toEqual(seaTints(names, borders));
  });

  it('heeft genoeg tinten voor alle zeeën van de echte kaart', () => {
    const tints = seaTints(
      shapes.features.filter((f) => f.properties.kind === 'sea').map((f) => f.properties.name),
      shapes.seaBorders as unknown as Array<{ between: [string, string] }>,
    );
    expect(Math.max(...Object.values(tints))).toBeLessThan(SEA_TINTS.length);
  });
});
