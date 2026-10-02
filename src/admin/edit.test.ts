import { describe, expect, it } from 'vitest';
import { emptySaveData } from '../storage/storage';
import { allPrizes } from '../cabinet/catalog';
import { describeChanges, setCoins, setStars, starPackages, toggleItem } from './edit';

const prize = allPrizes[0];

describe('aanpassen', () => {
  it('zet munten, nooit onder 0 en altijd heel', () => {
    expect(setCoins(emptySaveData(), 250.7).coins).toBe(250);
    expect(setCoins(emptySaveData(), -5).coins).toBe(0);
    expect(setCoins(emptySaveData(), NaN).coins).toBe(0);
  });

  it('zet een prijs aan en weer uit', () => {
    const on = toggleItem(emptySaveData(), 'prizes', prize.id);
    expect(on.prizes).toEqual([prize.id]);
    expect(toggleItem(on, 'prizes', prize.id).prizes).toEqual([]);
  });

  it('zet sterren, en 0 haalt ze weg', () => {
    const three = setStars(emptySaveData(), 'pakket1', 5);
    expect(three.stars).toEqual({ pakket1: 3 });
    expect(setStars(three, 'pakket1', 0).stars).toEqual({});
  });

  it('kent de pakketten met sterren', () => {
    const all = starPackages().flatMap((c) => c.packages.map((p) => p.id));
    expect(all.length).toBeGreaterThan(5);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('overzicht van wijzigingen', () => {
  it('beschrijft munten, prijzen en sterren in gewone taal', () => {
    const before = { ...emptySaveData(), coins: 100, stars: { pakket1: 3 } };
    const after = setStars(toggleItem(setCoins(before, 600), 'prizes', prize.id), 'pakket1', 1);
    const lines = describeChanges(before, after);
    expect(lines[0]).toBe('Munten: 100 → 600 (+500)');
    expect(lines[1]).toBe(`Prijs erbij: ${prize.name}`);
    expect(lines[2]).toMatch(/^Sterren .*: 3 → 1$/);
  });

  it('meldt weggehaalde dingen en negatieve munten', () => {
    const before = { ...emptySaveData(), coins: 50, prizes: [prize.id] };
    const after = { ...before, coins: 20, prizes: [] };
    expect(describeChanges(before, after)).toEqual([
      'Munten: 50 → 20 (-30)',
      `Prijs weg: ${prize.name}`,
    ]);
  });

  it('is leeg als er niets verandert', () => {
    expect(describeChanges(emptySaveData(), emptySaveData())).toEqual([]);
    expect(describeChanges(null, emptySaveData())).toEqual([]);
  });
});
