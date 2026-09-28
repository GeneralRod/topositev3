import { describe, it, expect } from 'vitest';
import { hasShape, City } from './cities';

describe('hasShape', () => {
  it('returns false when kind is undefined', () => {
    const city: City = {
      name: 'Test City',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
    };
    expect(hasShape(city)).toBe(false);
  });

  it('returns false when kind is "city"', () => {
    const city: City = {
      name: 'Test City',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'city',
    };
    expect(hasShape(city)).toBe(false);
  });

  it('returns false when kind is "peak"', () => {
    const peak: City = {
      name: 'Test Peak',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'peak',
    };
    expect(hasShape(peak)).toBe(false);
  });

  it('returns true when kind is "sea"', () => {
    const sea: City = {
      name: 'Test Sea',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'sea',
    };
    expect(hasShape(sea)).toBe(true);
  });

  it('returns true when kind is "lake"', () => {
    const lake: City = {
      name: 'Test Lake',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'lake',
    };
    expect(hasShape(lake)).toBe(true);
  });

  it('returns true when kind is "river"', () => {
    const river: City = {
      name: 'Test River',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'river',
    };
    expect(hasShape(river)).toBe(true);
  });

  it('returns true when kind is "desert"', () => {
    const desert: City = {
      name: 'Test Desert',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'desert',
    };
    expect(hasShape(desert)).toBe(true);
  });

  it('returns true when kind is "range"', () => {
    const range: City = {
      name: 'Test Range',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'range',
    };
    expect(hasShape(range)).toBe(true);
  });

  it('returns true when kind is "trench"', () => {
    const trench: City = {
      name: 'Test Trench',
      country: 'Test Country',
      coordinates: [0, 0],
      package: 'test',
      lat: 0,
      lng: 0,
      continent: 'Test Continent',
      kind: 'trench',
    };
    expect(hasShape(trench)).toBe(true);
  });
});
