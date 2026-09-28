import { describe, expect, it } from 'vitest';
import { countsStars, totalMistakes } from './useGame';
import type { GameState } from './rules';

describe('totalMistakes', () => {
  const baseState: GameState = {
    status: {},
    mistakes: {},
    currentCity: null,
    attempts: 0,
    hintUsed: false,
    hintsUsed: 0,
    coinsThisGame: 0,
    bonusPaid: false,
  };

  it('returns 0 when there are no mistakes', () => {
    const state: GameState = {
      ...baseState,
      mistakes: {
        Amsterdam: 0,
        Rotterdam: 0,
      },
    };
    expect(totalMistakes(state)).toBe(0);
  });

  it('returns the total number of mistakes across all cities', () => {
    const state: GameState = {
      ...baseState,
      mistakes: {
        Amsterdam: 2,
        Rotterdam: 1,
        Utrecht: 0,
        'Den Haag': 5,
      },
    };
    expect(totalMistakes(state)).toBe(8);
  });

  it('returns 0 for an empty mistakes object', () => {
    const state: GameState = {
      ...baseState,
      mistakes: {},
    };
    expect(totalMistakes(state)).toBe(0);
  });
});

describe('countsStars', () => {
  it('returns true only for regular packages on the map', () => {
    expect(countsStars('package', 'map')).toBe(true);
  });

  it('returns false for other modes of regular packages', () => {
    expect(countsStars('package', 'choice')).toBe(false);
  });

  it('returns false for practice and daily games, even on the map', () => {
    expect(countsStars('practice', 'map')).toBe(false);
    expect(countsStars('daily', 'map')).toBe(false);
  });

  it('returns false for practice and daily games on choice mode', () => {
    expect(countsStars('practice', 'choice')).toBe(false);
    expect(countsStars('daily', 'choice')).toBe(false);
  });
});
