import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isOnLand, loadWorld } from './world';

describe('isOnLand', () => {
  it('returns false before the world map is loaded', async () => {
    // Vitest runs modules in isolation by default, but just to be sure we're testing the initial state
    // we can use vi.resetModules() if necessary.
    // Assuming this runs first in the suite.
    // Resetting modules to ensure clean state
    vi.resetModules();
    const { isOnLand: freshIsOnLand } = await import('./world');
    expect(freshIsOnLand(4.9, 52.37)).toBe(false);
  });

  it('correctly identifies land and ocean after loading', async () => {
    await loadWorld();

    // Coordinates in the Netherlands (Amsterdam approx)
    expect(isOnLand(4.9, 52.37)).toBe(true);

    // Coordinates in the middle of the Atlantic Ocean
    expect(isOnLand(-30, 30)).toBe(false);

    // Coordinates for Australia
    expect(isOnLand(133, -25)).toBe(true);

    // Coordinates for Pacific Ocean
    expect(isOnLand(-150, 0)).toBe(false);
  });

  it('returns false for coordinates out of bounds', async () => {
    await loadWorld();

    // Out of bounds coordinates
    expect(isOnLand(200, 0)).toBe(false);
    expect(isOnLand(0, 100)).toBe(false);
  });
});
