import { describe, expect, it } from 'vitest';
import { splitAtDateLine, unwrapRing } from './dateLine';

describe('lijnen bij de datumgrens', () => {
  it('knipt een lijn die van +180 naar -180 springt', () => {
    const result = splitAtDateLine({
      type: 'MultiLineString',
      coordinates: [
        [
          [170, 60],
          [179, 61],
          [-179, 62],
          [-170, 63],
        ],
      ],
    });
    expect(result.coordinates).toEqual([
      [
        [170, 60],
        [179, 61],
      ],
      [
        [-179, 62],
        [-170, 63],
      ],
    ]);
  });

  it('laat de snijlijn langs 180 graden weg', () => {
    const result = splitAtDateLine({
      type: 'MultiLineString',
      coordinates: [
        [
          [175, 60],
          [180, 60],
          [180, 70],
          [175, 70],
        ],
      ],
    });
    expect(result.coordinates).toEqual([
      [
        [175, 60],
        [180, 60],
      ],
      [
        [180, 70],
        [175, 70],
      ],
    ]);
  });

  it('laat gewone lijnen heel', () => {
    const line = [
      [4, 52],
      [5, 52],
      [6, 53],
    ];
    expect(splitAtDateLine({ type: 'MultiLineString', coordinates: [line] }).coordinates).toEqual([
      line,
    ]);
  });
});

describe('landen over de datumgrens', () => {
  it('vouwt een ring uit die over 180 graden springt', () => {
    const ring = [
      [175, 60],
      [-175, 60],
      [-175, 65],
      [175, 65],
      [175, 60],
    ];
    expect(unwrapRing(ring)).toEqual([
      [175, 60],
      [185, 60],
      [185, 65],
      [175, 65],
      [175, 60],
    ]);
  });

  it('laat een ring die rond de aarde loopt ongemoeid', () => {
    const ring = [
      [-180, -80],
      [0, -70],
      [179, -80],
      [-179, -85],
    ];
    expect(unwrapRing(ring)).toBe(ring);
  });
});
