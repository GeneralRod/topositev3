import { describe, expect, it } from 'vitest';
import {
  answer,
  claimCompletionBonus,
  coinsForCorrect,
  completionBonus,
  foundCount,
  hardestCities,
  isComplete,
  newGame,
  pickNextCity,
  restoreGame,
  speedBonus,
  takeHint,
  hintsLeft,
  type GameState,
} from './rules';

const first = () => 0;
const CITIES = ['Parijs', 'Berlijn', 'Rome'];

function game(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(CITIES, first), ...overrides };
}

describe('munten', () => {
  it('geeft de volle snelheidsbonus binnen 3 seconden', () => {
    expect(speedBonus(0)).toBe(5);
    expect(speedBonus(3)).toBe(5);
  });

  it('laat de snelheidsbonus aflopen tot 0 na 10 seconden', () => {
    expect(speedBonus(6.5)).toBe(3);
    expect(speedBonus(10)).toBe(0);
    expect(speedBonus(60)).toBe(0);
  });

  it('telt basismunten en bonus op', () => {
    expect(coinsForCorrect(1)).toBe(10);
    expect(coinsForCorrect(30)).toBe(5);
  });

  it('eindbonus is 20% afgerond', () => {
    expect(completionBonus(100)).toBe(20);
    expect(completionBonus(12)).toBe(2);
  });
});

describe('nieuw spel', () => {
  it('begint met alle steden open en een gevraagde stad', () => {
    const state = newGame(CITIES, first);
    expect(Object.values(state.status)).toEqual(['unanswered', 'unanswered', 'unanswered']);
    expect(state.currentCity).toBe('Parijs');
    expect(state.coinsThisGame).toBe(0);
    expect(state.bonusPaid).toBe(false);
  });

  it('heeft geen vraag bij een lege lijst', () => {
    expect(newGame([]).currentCity).toBeNull();
  });
});

describe('volgende stad kiezen', () => {
  it('vraagt geen groene steden', () => {
    const state = game({ status: { Parijs: 'green', Berlijn: 'green', Rome: 'unanswered' } });
    expect(pickNextCity(state, () => 0.99)).toBe('Rome');
  });

  it('vraagt blauwe steden opnieuw', () => {
    const state = game({
      currentCity: null,
      status: { Parijs: 'green', Berlijn: 'blue', Rome: 'green' },
    });
    expect(pickNextCity(state)).toBe('Berlijn');
  });

  it('vraagt niet twee keer achter elkaar dezelfde stad als er keus is', () => {
    const state = game({ currentCity: 'Parijs' });
    for (const r of [0, 0.4, 0.99]) {
      expect(pickNextCity(state, () => r)).not.toBe('Parijs');
    }
  });

  it('geeft null als alles groen is', () => {
    const state = game({ status: { Parijs: 'green', Berlijn: 'green', Rome: 'green' } });
    expect(pickNextCity(state)).toBeNull();
  });
});

describe('antwoorden', () => {
  it('goed in één keer maakt de stad groen en geeft munten', () => {
    const { state, result } = answer(game(), 'Parijs', 1, first);
    expect(result).toEqual({ kind: 'correct', city: 'Parijs', coins: 10, firstTry: true });
    expect(state.status.Parijs).toBe('green');
    expect(state.coinsThisGame).toBe(10);
    expect(state.currentCity).toBe('Berlijn');
    expect(foundCount(state)).toBe(1);
  });

  it('fout telt als fout voor de gevraagde stad, niet voor de aangeklikte', () => {
    const { state, result } = answer(game(), 'Rome', 1);
    expect(result.kind).toBe('wrong');
    expect(state.mistakes).toEqual({ Parijs: 1, Berlijn: 0, Rome: 0 });
    expect(state.attempts).toBe(1);
    expect(state.currentCity).toBe('Parijs');
  });

  it('goed na een fout maakt de stad blauw', () => {
    const wrong = answer(game(), 'Rome', 1).state;
    const { state, result } = answer(wrong, 'Parijs', 1, first);
    expect(result).toMatchObject({ kind: 'correct', firstTry: false });
    expect(state.status.Parijs).toBe('blue');
    expect(state.attempts).toBe(0);
  });

  it('geeft minder munten met een lagere muntfactor', () => {
    const { result } = answer(game(), 'Parijs', 1, first, 0.5);
    expect(result).toMatchObject({ kind: 'correct', coins: 5 });
  });

  it('zet de hint terug na een goed antwoord', () => {
    const { state } = answer(game({ hintUsed: true }), 'Parijs', 1, first);
    expect(state.hintUsed).toBe(false);
  });

  it('negeert klikken als het spel klaar is', () => {
    const done = game({
      currentCity: null,
      status: { Parijs: 'green', Berlijn: 'green', Rome: 'green' },
    });
    expect(answer(done, 'Parijs', 1)).toEqual({ state: done, result: { kind: 'ignored' } });
  });

  it('speelt een heel spel uit tot het klaar is', () => {
    let state = newGame(CITIES, first);
    for (let i = 0; i < 10 && state.currentCity; i++) {
      state = answer(state, state.currentCity, 1, first).state;
    }
    expect(isComplete(state)).toBe(true);
    expect(state.currentCity).toBeNull();
    expect(state.coinsThisGame).toBe(30);
  });
});

describe('eindbonus', () => {
  const done = game({
    currentCity: null,
    status: { Parijs: 'green', Berlijn: 'green', Rome: 'green' },
    coinsThisGame: 50,
  });

  it('wordt precies één keer uitgekeerd', () => {
    const once = claimCompletionBonus(done);
    expect(once.bonus).toBe(10);
    expect(once.state.bonusPaid).toBe(true);
    expect(claimCompletionBonus(once.state).bonus).toBe(0);
  });

  it('wordt niet uitgekeerd zolang het spel niet klaar is', () => {
    expect(claimCompletionBonus(game({ coinsThisGame: 50 })).bonus).toBe(0);
  });
});

describe('opgeslagen spel herstellen', () => {
  it('houdt voortgang en huidige vraag vast', () => {
    const saved = game({
      status: { Parijs: 'green', Berlijn: 'blue', Rome: 'unanswered' },
      currentCity: 'Rome',
    });
    expect(restoreGame(saved, CITIES)).toEqual(saved);
  });

  it('voegt nieuwe steden toe en laat verdwenen steden weg', () => {
    const saved = game({ status: { Parijs: 'green', Berlijn: 'blue', Rome: 'unanswered' } });
    const restored = restoreGame(saved, ['Parijs', 'Rome', 'Madrid'], first);
    expect(restored.status).toEqual({ Parijs: 'green', Rome: 'unanswered', Madrid: 'unanswered' });
    expect(Object.keys(restored.mistakes)).toEqual(['Parijs', 'Rome', 'Madrid']);
  });

  it('kiest een nieuwe vraag als de opgeslagen vraag niet meer geldig is', () => {
    const saved = game({
      status: { Parijs: 'green', Berlijn: 'unanswered', Rome: 'unanswered' },
      currentCity: 'Parijs',
      attempts: 2,
    });
    const restored = restoreGame(saved, CITIES, first);
    expect(restored.currentCity).toBe('Berlijn');
    expect(restored.attempts).toBe(0);
  });
});

describe('moeilijkste steden', () => {
  it('sorteert op aantal fouten en laat foutloze steden weg', () => {
    const state = game({ mistakes: { Parijs: 1, Berlijn: 0, Rome: 3 } });
    expect(hardestCities(state)).toEqual([
      { city: 'Rome', mistakes: 3 },
      { city: 'Parijs', mistakes: 1 },
    ]);
  });
});

describe('hints', () => {
  it('telt gebruikte hints en stopt bij het maximum', () => {
    let state = game();
    state = takeHint(state, 2);
    expect(state.hintUsed).toBe(true);
    expect(hintsLeft(state, 2)).toBe(1);
    // nog een keer op dezelfde vraag telt niet dubbel
    expect(takeHint(state, 2)).toBe(state);
    state = answer(state, 'Parijs', 1, first).state;
    state = takeHint(state, 2);
    expect(hintsLeft(state, 2)).toBe(0);
    state = answer(state, state.currentCity!, 1, first).state;
    expect(takeHint(state, 2).hintUsed).toBe(false);
  });

  it('nieuw spel begint met alle hints', () => {
    expect(hintsLeft(newGame(CITIES), 5)).toBe(5);
  });
});
