import { describe, expect, it } from 'vitest';
import type { GameState } from '../game/rules';
import { mergeSaveData, sameData } from './merge';
import { emptySaveData, type SaveData } from './storage';

function save(change: Partial<SaveData> = {}): SaveData {
  return { ...emptySaveData(), ...change };
}

function game(found: number, total = 4): GameState {
  const names = ['Parijs', 'Berlijn', 'Rome', 'Madrid', 'Lissabon', 'Wenen'].slice(0, total);
  return {
    status: Object.fromEntries(names.map((name, i) => [name, i < found ? 'green' : 'unanswered'])),
    mistakes: Object.fromEntries(names.map((name) => [name, 0])),
    currentCity: names[found] ?? null,
    attempts: 0,
    hintUsed: false,
    hintsUsed: 0,
    coinsThisGame: found * 5,
    bonusPaid: false,
  };
}

describe('munten', () => {
  it('telt bij de eerste keer inloggen beide kanten op', () => {
    const merged = mergeSaveData(null, save({ coins: 120 }), save({ coins: 300 }));
    expect(merged.coins).toBe(420);
  });

  it('telt alleen wat er sinds de basis bij kwam of af ging', () => {
    const base = save({ coins: 300 });
    // Hier 50 verdiend, op een andere computer 100 uitgegeven.
    const merged = mergeSaveData(base, save({ coins: 350 }), save({ coins: 200 }));
    expect(merged.coins).toBe(250);
  });

  it('komt nooit onder 0', () => {
    const base = save({ coins: 100 });
    const merged = mergeSaveData(base, save({ coins: 0 }), save({ coins: 0 }));
    expect(merged.coins).toBe(0);
  });
});

describe('verzamelingen', () => {
  it('houdt alle prijzen, stickers, upgrades en prestaties van beide kanten', () => {
    const local = save({
      prizes: ['globe', 'kompas'],
      stickers: ['ster'],
      upgrades: ['cherry'],
      achievements: ['first-game'],
    });
    const remote = save({
      prizes: ['kompas', 'atlas'],
      stickers: [],
      upgrades: ['cherry', 'lampje'],
      achievements: ['streak-3'],
    });
    const merged = mergeSaveData(null, local, remote);
    expect(merged.prizes).toEqual(['kompas', 'atlas', 'globe']);
    expect(merged.stickers).toEqual(['ster']);
    expect(merged.upgrades).toEqual(['cherry', 'lampje']);
    expect(merged.achievements).toEqual(['streak-3', 'first-game']);
  });
});

describe('sterren en toetscijfers', () => {
  it('neemt het beste van beide kanten', () => {
    const local = save({ stars: { pakket1: 3, pakket2: 1 }, toetsen: { 'landen:1:kort': 6.5 } });
    const remote = save({
      stars: { pakket2: 2, pakket3: 1 },
      toetsen: { 'landen:1:kort': 8, 'nl:1:alles': 7 },
    });
    const merged = mergeSaveData(null, local, remote);
    expect(merged.stars).toEqual({ pakket1: 3, pakket2: 2, pakket3: 1 });
    expect(merged.toetsen).toEqual({ 'landen:1:kort': 8, 'nl:1:alles': 7 });
  });
});

describe('lastige plekken', () => {
  it('telt nieuwe fouten van beide kanten op', () => {
    const base = save({ cityStats: { landen: { Peru: { wrong: 2, streak: 0 } } } });
    const local = save({ cityStats: { landen: { Peru: { wrong: 3, streak: 0 } } } });
    const remote = save({
      cityStats: { landen: { Peru: { wrong: 4, streak: 1 }, Chili: { wrong: 1, streak: 0 } } },
    });
    const merged = mergeSaveData(base, local, remote);
    expect(merged.cityStats.landen).toEqual({
      Peru: { wrong: 5, streak: 0 },
      Chili: { wrong: 1, streak: 0 },
    });
  });

  it('neemt de reeks van de kant waar gespeeld is', () => {
    const base = save({ cityStats: { landen: { Peru: { wrong: 1, streak: 0 } } } });
    const remote = save({ cityStats: { landen: { Peru: { wrong: 1, streak: 2 } } } });
    const merged = mergeSaveData(base, base, remote);
    expect(merged.cityStats.landen.Peru).toEqual({ wrong: 1, streak: 2 });
  });
});

describe('dagelijkse uitdaging', () => {
  it('neemt de recentste dag, en op dezelfde dag de langste reeks', () => {
    const local = save({
      daily: {
        landen: { lastCompleted: '2026-09-30', streak: 1 },
        nl: { lastCompleted: '2026-09-29', streak: 2 },
      },
    });
    const remote = save({
      daily: {
        landen: { lastCompleted: '2026-09-29', streak: 5 },
        nl: { lastCompleted: '2026-09-29', streak: 4 },
        wateren: { lastCompleted: null, streak: 0 },
      },
    });
    const merged = mergeSaveData(null, local, remote);
    expect(merged.daily).toEqual({
      landen: { lastCompleted: '2026-09-30', streak: 1 },
      nl: { lastCompleted: '2026-09-29', streak: 4 },
      wateren: { lastCompleted: null, streak: 0 },
    });
  });
});

describe('lopende spellen', () => {
  it('neemt de kant die veranderd is, ook als dat minder ver is (opnieuw begonnen)', () => {
    const base = save({ games: { pakket1: game(3) } });
    const local = save({ games: { pakket1: game(0) } });
    const merged = mergeSaveData(base, local, base);
    expect(merged.games.pakket1).toEqual(game(0));
  });

  it('neemt het spel over dat alleen online veranderd is', () => {
    const base = save({ games: { pakket1: game(1) } });
    const remote = save({ games: { pakket1: game(2) } });
    expect(mergeSaveData(base, base, remote).games.pakket1).toEqual(game(2));
  });

  it('wist een spel dat aan één kant gewist is', () => {
    const base = save({ games: { pakket1: game(1) } });
    const local = save({ games: {} });
    expect(mergeSaveData(base, local, base).games).toEqual({});
  });

  it('neemt bij veranderingen aan beide kanten het spel waarin je het verst bent', () => {
    const local = save({ games: { pakket1: game(1), pakket2: game(3) } });
    const remote = save({ games: { pakket1: game(2), pakket2: game(3, 5), pakket3: game(1) } });
    const merged = mergeSaveData(null, local, remote);
    expect(merged.games.pakket1).toEqual(game(2));
    // Even ver: dan het spel van deze computer.
    expect(merged.games.pakket2).toEqual(game(3));
    expect(merged.games.pakket3).toEqual(game(1));
  });

  it('houdt een gespeeld spel als de andere kant het wiste', () => {
    const base = save({ games: { pakket1: game(1) } });
    const local = save({ games: {} });
    const remote = save({ games: { pakket1: game(2) } });
    expect(mergeSaveData(base, local, remote).games.pakket1).toEqual(game(2));
  });
});

describe('kaststijl en speelmanier', () => {
  it('neemt de keuze van deze computer als die veranderd is, anders die van online', () => {
    const base = save();
    const local = save({ prefs: { playMode: 'choice', sound: true } });
    const remote = save({ style: { finish: 'cherry', extras: ['lampje'] } });
    const merged = mergeSaveData(base, local, remote);
    expect(merged.prefs).toEqual({ playMode: 'choice', sound: true });
    expect(merged.style).toEqual({ finish: 'cherry', extras: ['lampje'] });
  });
});

describe('alles samen', () => {
  it('verandert niets als beide kanten gelijk zijn aan de basis', () => {
    const data = save({
      coins: 80,
      prizes: ['globe'],
      stars: { pakket1: 2 },
      games: { pakket1: game(2) },
      cityStats: { landen: { Peru: { wrong: 1, streak: 1 } } },
    });
    expect(mergeSaveData(data, data, data)).toEqual(data);
  });

  it('geeft hetzelfde als online als deze browser niets nieuws heeft', () => {
    const base = save({ coins: 10 });
    const remote = save({ coins: 90, prizes: ['globe'], stars: { pakket1: 3 } });
    expect(mergeSaveData(base, base, remote)).toEqual(remote);
  });
});

describe('sameData', () => {
  it('kijkt naar inhoud, niet naar volgorde van sleutels', () => {
    expect(sameData({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toBe(true);
    expect(sameData({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(sameData([1, 2], [2, 1])).toBe(false);
    expect(sameData(undefined, undefined)).toBe(true);
    expect(sameData({}, [])).toBe(false);
  });
});

describe('aanpassingen door de beheerder', () => {
  it('houdt een weggehaalde prijs weg, ook als deze computer hem nog had', () => {
    const base = save({ prizes: ['globe', 'kompas'], achievements: ['first-game'] });
    const remote = save({ prizes: ['kompas'], achievements: [] });
    // Op deze computer intussen een nieuwe prijs gekocht.
    const local = save({ prizes: ['globe', 'kompas', 'atlas'], achievements: ['first-game'] });
    const merged = mergeSaveData(base, local, remote);
    expect(merged.prizes).toEqual(['kompas', 'atlas']);
    expect(merged.achievements).toEqual([]);
  });

  it('neemt verlaagde of gewiste sterren over', () => {
    const base = save({ stars: { pakket1: 3, pakket2: 2 }, toetsen: { 'nl:1:kort': 9 } });
    const remote = save({ stars: { pakket1: 1 }, toetsen: {} });
    const merged = mergeSaveData(base, base, remote);
    expect(merged.stars).toEqual({ pakket1: 1 });
    expect(merged.toetsen).toEqual({});
  });

  it('neemt het beste als beide kanten sterren veranderden', () => {
    const base = save({ stars: { pakket1: 1 } });
    const remote = save({ stars: { pakket1: 2 } });
    const local = save({ stars: { pakket1: 3 } });
    expect(mergeSaveData(base, local, remote).stars).toEqual({ pakket1: 3 });
  });

  it('geeft extra munten door zonder dat munten van het spelen verloren gaan', () => {
    const base = save({ coins: 100 });
    const remote = save({ coins: 600 }); // beheerder gaf 500
    const local = save({ coins: 130 }); // intussen 30 verdiend
    expect(mergeSaveData(base, local, remote).coins).toBe(630);
  });
});
