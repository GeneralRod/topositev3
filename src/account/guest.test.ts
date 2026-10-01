import { describe, expect, it } from 'vitest';
import { emptySaveData, type SaveData } from '../storage/storage';
import {
  GUEST_KEY,
  hasProgress,
  keepGuest,
  needsGuestQuestion,
  progressSummary,
  readGuest,
  takeGuest,
} from './guest';

function memory() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const save = (part: Partial<SaveData>): SaveData => ({ ...emptySaveData(), ...part });

describe('hasProgress', () => {
  it('niets gespeeld: geen voortgang', () => {
    expect(hasProgress(emptySaveData())).toBe(false);
  });

  it('munten, sterren, prijzen, spellen of toetsen tellen allemaal', () => {
    expect(hasProgress(save({ coins: 5 }))).toBe(true);
    expect(hasProgress(save({ stars: { pakket1: 1 } }))).toBe(true);
    expect(hasProgress(save({ prizes: ['globe'] }))).toBe(true);
    expect(hasProgress(save({ toetsen: { 'landen:1:kort': 7.5 } }))).toBe(true);
    expect(
      hasProgress(save({ cityStats: { capitals: { Parijs: { wrong: 1, streak: 0 } } } })),
    ).toBe(true);
  });
});

describe('needsGuestQuestion', () => {
  it('alleen bij de eerste keer inloggen op deze computer, als er voortgang staat', () => {
    expect(needsGuestQuestion(null, save({ coins: 10 }))).toBe(true);
    expect(needsGuestQuestion(null, emptySaveData())).toBe(false);
    expect(needsGuestQuestion({ userId: 'anna' }, save({ coins: 10 }))).toBe(false);
  });
});

describe('progressSummary', () => {
  it('noemt munten, sterren en prijzen', () => {
    const data = save({
      coins: 120,
      stars: { pakket1: 3, pakket2: 2 },
      prizes: ['globe', 'atlas'],
      stickers: ['vlag'],
    });
    expect(progressSummary(data)).toBe('120 munten, 5 sterren en 3 prijzen');
  });

  it('enkelvoud en alleen wat er is', () => {
    expect(progressSummary(save({ coins: 1, stars: { pakket1: 1 } }))).toBe('1 munt en 1 ster');
    expect(progressSummary(save({ prizes: ['globe'] }))).toBe('1 prijs');
    expect(progressSummary(save({ games: {}, toetsen: { a: 6 } }))).toBe(
      'voortgang in de pakketten',
    );
  });
});

describe('apart zetten', () => {
  it('bewaart de voortgang en geeft hem één keer terug', () => {
    const store = memory();
    expect(keepGuest(store, save({ coins: 120 }))).toBe(true);
    expect(readGuest(store)?.coins).toBe(120);
    expect(takeGuest(store)?.coins).toBe(120);
    expect(store.map.has(GUEST_KEY)).toBe(false);
    expect(takeGuest(store)).toBeNull();
  });

  it('overschrijft nooit wat er al apart stond', () => {
    const store = memory();
    keepGuest(store, save({ coins: 100, prizes: ['globe'] }));
    keepGuest(store, save({ coins: 20, prizes: ['atlas'] }));
    const kept = takeGuest(store);
    expect(kept?.coins).toBe(120);
    expect(kept?.prizes).toEqual(['atlas', 'globe']);
  });

  it('meldt het als bewaren niet lukt (dan mag de voortgang niet weg)', () => {
    const full = {
      ...memory(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(keepGuest(full, save({ coins: 120 }))).toBe(false);
  });
});
