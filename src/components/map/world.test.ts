import { describe, expect, it, vi, beforeEach } from 'vitest';

// We mock world-atlas because the JSON file is huge and not needed for a unit test.
const mockTopology = {
  type: 'Topology',
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          arcs: [[0]],
          id: '001',
        },
        {
          type: 'Polygon',
          arcs: [[1]],
          id: '002',
        }
      ],
    },
  },
  arcs: [
    [
      [0, 0],   // 0, 0
      [10, 0],  // 10, 0
      [0, 10],  // 10, 10
      [-10, 0], // 0, 10
      [0, -10], // 0, 0
    ],
    [
      [20, 20], // 20, 20
      [10, 0],  // 30, 20
      [0, 10],  // 30, 30
      [-10, 0], // 20, 30
      [0, -10], // 20, 20
    ]
  ],
  transform: {
    scale: [1, 1],
    translate: [0, 0],
  },
};

vi.mock('world-atlas/countries-50m.json', () => ({
  default: mockTopology,
}));

describe('world', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('loads world shapes and processes topology into GeoJSON', async () => {
    const { loadWorld } = await import('./world');
    const world = await loadWorld();

    expect(world.land).toBeDefined();
    expect(world.land.type).toBe('FeatureCollection');
    expect(world.land.features).toHaveLength(2);
    expect(world.borders).toBeDefined();
    expect(world.coasts).toBeDefined();
  });

  it('caches the world loading promise', async () => {
    const { loadWorld } = await import('./world');
    const promise1 = loadWorld();
    const promise2 = loadWorld();
    expect(promise1).toBe(promise2);

    const world1 = await promise1;
    const world2 = await promise2;
    expect(world1).toBe(world2);
  });

  it('determines if a point is on land correctly', async () => {
    const { loadWorld, isOnLand } = await import('./world');

    // Before loadWorld, isOnLand should return false everywhere because index is empty
    expect(isOnLand(5, 5)).toBe(false);

    await loadWorld();

    // Inside the first polygon (0,0 to 10,10)
    expect(isOnLand(5, 5)).toBe(true);

    // Outside all polygons
    expect(isOnLand(15, 15)).toBe(false);

    // Inside the second polygon (20,20 to 30,30)
    expect(isOnLand(25, 25)).toBe(true);

    // Edge cases
    expect(isOnLand(10.1, 5)).toBe(false);
    expect(isOnLand(-1, 5)).toBe(false);
  });
});
