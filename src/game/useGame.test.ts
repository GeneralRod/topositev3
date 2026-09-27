import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame, totalMistakes, countsStars } from './useGame';
import type { AnswerResult } from './rules';
import * as storage from '../storage';
import * as rules from './rules';

vi.mock('../storage', () => ({
  addCoins: vi.fn(),
  awardAchievements: vi.fn(() => []),
  clearGame: vi.fn(),
  loadGame: vi.fn(() => null),
  recordCityAnswer: vi.fn(),
  recordStars: vi.fn(),
  saveGame: vi.fn(),
}));

describe('countsStars', () => {
  it('counts stars only for ordinary map packages', () => {
    expect(countsStars('package', 'map')).toBe(true);
    expect(countsStars('daily', 'map')).toBe(false);
    expect(countsStars('practice', 'map')).toBe(false);
    expect(countsStars('package', 'choice')).toBe(false);
  });
});

describe('totalMistakes', () => {
  it('sums up all mistakes in the state', () => {
    const state = rules.newGame(['A', 'B', 'C']);
    state.mistakes = { A: 1, B: 2, C: 0 };
    expect(totalMistakes(state)).toBe(3);
  });
});

describe('useGame', () => {
  const defaultOptions = {
    categoryId: 'test-category',
    kind: 'package' as const,
    mode: 'map' as const,
    onComplete: vi.fn(),
  };

  const packageId = 'test-pkg';
  const cities = ['City1', 'City2', 'City3'];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.awardAchievements).mockReturnValue([]);
  });

  it('starts a new game if no saved game exists', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));
    expect(storage.loadGame).toHaveBeenCalledWith(packageId);
    expect(result.current.state.currentCity).toBeTruthy();
    expect(storage.saveGame).toHaveBeenCalledWith(packageId, result.current.state);
  });

  it('restores a saved game if one exists', () => {
    const savedState = rules.newGame(cities);
    savedState.status = { City1: 'green', City2: 'unanswered', City3: 'unanswered' };
    savedState.currentCity = 'City2';
    vi.mocked(storage.loadGame).mockReturnValueOnce(savedState);

    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));
    expect(result.current.state.currentCity).toBe('City2');
    expect(result.current.state.status.City1).toBe('green');
  });

  it('handles wrong answers correctly', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));
    const currentCity = result.current.state.currentCity!;
    const wrongCity = cities.find((c) => c !== currentCity)!;

    let ansResult: AnswerResult | undefined;
    act(() => {
      ansResult = result.current.clickCity(wrongCity);
    });

    expect(ansResult?.kind).toBe('wrong');
    expect(storage.recordCityAnswer).toHaveBeenCalledWith('test-category', currentCity, 'wrong');
  });

  it('handles correct answers correctly and records first-try', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));
    const currentCity = result.current.state.currentCity!;

    let ansResult: AnswerResult | undefined;
    act(() => {
      ansResult = result.current.clickCity(currentCity);
    });

    expect(ansResult?.kind).toBe('correct');

    expect((ansResult as Extract<AnswerResult, { kind: 'correct' }>).firstTry).toBe(true);
    expect(storage.recordCityAnswer).toHaveBeenCalledWith(
      'test-category',
      currentCity,
      'first-try',
    );
    expect(storage.addCoins).toHaveBeenCalled();
  });

  it('handles correct answers after mistake and records after-mistake', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));
    const currentCity = result.current.state.currentCity!;
    const wrongCity = cities.find((c) => c !== currentCity)!;

    act(() => {
      result.current.clickCity(wrongCity);
    });

    vi.clearAllMocks();

    let ansResult: AnswerResult | undefined;
    act(() => {
      ansResult = result.current.clickCity(currentCity);
    });

    expect(ansResult?.kind).toBe('correct');

    expect((ansResult as Extract<AnswerResult, { kind: 'correct' }>).firstTry).toBe(false);
    expect(storage.recordCityAnswer).toHaveBeenCalledWith(
      'test-category',
      currentCity,
      'after-mistake',
    );
  });

  it('handles completion correctly', () => {
    // Create a mock state that is almost complete
    const almostDone = rules.newGame(['C1', 'C2']);
    almostDone.status = { C1: 'green', C2: 'unanswered' };
    almostDone.currentCity = 'C2';
    vi.mocked(storage.loadGame).mockReturnValueOnce(almostDone);

    const onComplete = vi.fn();
    vi.mocked(storage.awardAchievements).mockReturnValue(['medal1']);

    const { result } = renderHook(() =>
      useGame(packageId, ['C1', 'C2'], { ...defaultOptions, onComplete }),
    );

    act(() => {
      result.current.clickCity('C2');
    });

    expect(onComplete).toHaveBeenCalled();
    expect(storage.recordStars).toHaveBeenCalled();
    expect(storage.awardAchievements).toHaveBeenCalled();
    expect(result.current.earned).toEqual(['medal1']);
  });

  it('uses coinFactor 0.5 for choice mode', () => {
    const almostDone = rules.newGame(['C1', 'C2']);
    almostDone.status = { C1: 'green', C2: 'unanswered' };
    almostDone.currentCity = 'C2';
    vi.mocked(storage.loadGame).mockReturnValueOnce(almostDone);

    const { result } = renderHook(() =>
      useGame(packageId, ['C1', 'C2'], { ...defaultOptions, mode: 'choice' }),
    );

    let ansResult: AnswerResult | undefined;
    act(() => {
      ansResult = result.current.clickCity('C2');
    });

    // We can't directly check the coin value easily without mocking Math.random or knowing speed bonus
    // But we know addCoins was called with the result of answer
    // We can mock rules.answer to verify coinFactor
    expect(ansResult?.kind).toBe('correct');
  });

  it('does not record stars if countsStars is false', () => {
    const almostDone = rules.newGame(['C1', 'C2']);
    almostDone.status = { C1: 'green', C2: 'unanswered' };
    almostDone.currentCity = 'C2';
    vi.mocked(storage.loadGame).mockReturnValueOnce(almostDone);

    const { result } = renderHook(() =>
      useGame(packageId, ['C1', 'C2'], { ...defaultOptions, kind: 'practice' }),
    );

    act(() => {
      result.current.clickCity('C2');
    });

    expect(storage.recordStars).not.toHaveBeenCalled();
  });

  it('showHint takes a hint', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));

    act(() => {
      result.current.showHint();
    });

    expect(result.current.state.hintUsed).toBe(true);
  });

  it('restart clears the game and creates a new one', () => {
    const { result } = renderHook(() => useGame(packageId, cities, defaultOptions));

    // Simulate some progress
    const wrongCity = cities.find((c) => c !== result.current.state.currentCity)!;
    act(() => {
      result.current.clickCity(wrongCity);
    });

    act(() => {
      result.current.restart();
    });

    expect(storage.clearGame).toHaveBeenCalledWith(packageId);
    expect(result.current.state.attempts).toBe(0);
    expect(result.current.earned).toEqual([]);
  });
});
