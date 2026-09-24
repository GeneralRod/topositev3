// Spelregels van het stedenspel, als pure functies zonder React of opslag.
// Alles wat hier gebeurt is te testen in src/game/rules.test.ts.

/** unanswered = nog niet gevonden, blue = gevonden na een fout, green = in één keer goed. */
export type CityStatus = 'unanswered' | 'blue' | 'green';

export interface GameState {
  status: Record<string, CityStatus>;
  mistakes: Record<string, number>;
  /** De stad die nu gevraagd wordt; null als het spel klaar is. */
  currentCity: string | null;
  /** Aantal foute klikken voor de huidige vraag. */
  attempts: number;
  hintUsed: boolean;
  /** Hoeveel hints je dit spel al hebt gebruikt (er is een maximum). */
  hintsUsed: number;
  coinsThisGame: number;
  /** Is de eindbonus al uitgekeerd? Voorkomt dubbele uitbetaling. */
  bonusPaid: boolean;
}

export type Random = () => number;

export const COINS_PER_CORRECT = 5;
export const SPEED_BONUS_MAX = 5;
/** Binnen zoveel seconden krijg je de volledige snelheidsbonus. */
export const SPEED_BONUS_THRESHOLD = 3;
/** Na zoveel seconden is de snelheidsbonus 0. */
export const SPEED_BONUS_DECAY = 10;
export const COMPLETION_BONUS_RATE = 0.2;

export function speedBonus(seconds: number): number {
  if (seconds <= SPEED_BONUS_THRESHOLD) return SPEED_BONUS_MAX;
  if (seconds >= SPEED_BONUS_DECAY) return 0;
  const fraction = (seconds - SPEED_BONUS_THRESHOLD) / (SPEED_BONUS_DECAY - SPEED_BONUS_THRESHOLD);
  return Math.max(0, Math.round(SPEED_BONUS_MAX * (1 - fraction)));
}

export function coinsForCorrect(seconds: number): number {
  return COINS_PER_CORRECT + speedBonus(seconds);
}

export function completionBonus(coinsThisGame: number): number {
  return Math.round(coinsThisGame * COMPLETION_BONUS_RATE);
}

/** Steden die nog gevraagd mogen worden: niet gevonden, of gevonden na een fout. */
export function eligibleCities(state: GameState): string[] {
  return Object.keys(state.status).filter((name) => state.status[name] !== 'green');
}

/**
 * Kies willekeurig de volgende stad. Dezelfde stad twee keer achter elkaar
 * wordt vermeden zolang er andere keuzes zijn.
 */
export function pickNextCity(state: GameState, random: Random = Math.random): string | null {
  const eligible = eligibleCities(state);
  if (eligible.length === 0) return null;
  const others = eligible.filter((name) => name !== state.currentCity);
  const pool = others.length > 0 ? others : eligible;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

export function newGame(cityNames: string[], random: Random = Math.random): GameState {
  const state: GameState = {
    status: Object.fromEntries(cityNames.map((name) => [name, 'unanswered' as CityStatus])),
    mistakes: Object.fromEntries(cityNames.map((name) => [name, 0])),
    currentCity: null,
    attempts: 0,
    hintUsed: false,
    hintsUsed: 0,
    coinsThisGame: 0,
    bonusPaid: false,
  };
  return { ...state, currentCity: pickNextCity(state, random) };
}

/**
 * Maak een opgeslagen spel passend voor de huidige stedenlijst: nieuwe steden
 * komen erbij als 'unanswered', verdwenen steden vallen weg.
 */
export function restoreGame(
  saved: GameState,
  cityNames: string[],
  random: Random = Math.random,
): GameState {
  const status: Record<string, CityStatus> = {};
  const mistakes: Record<string, number> = {};
  for (const name of cityNames) {
    status[name] = saved.status[name] ?? 'unanswered';
    mistakes[name] = saved.mistakes[name] ?? 0;
  }
  const state: GameState = { ...saved, status, mistakes };
  const currentStillValid =
    state.currentCity !== null &&
    state.currentCity in status &&
    status[state.currentCity] !== 'green';
  if (currentStillValid) return state;
  return {
    ...state,
    currentCity: pickNextCity({ ...state, currentCity: null }, random),
    attempts: 0,
  };
}

export function isComplete(state: GameState): boolean {
  return eligibleCities(state).length === 0;
}

export function foundCount(state: GameState): number {
  return Object.values(state.status).filter((s) => s === 'green').length;
}

export type AnswerResult =
  | { kind: 'ignored' }
  | { kind: 'wrong' }
  | { kind: 'correct'; city: string; coins: number; firstTry: boolean };

/**
 * Verwerk een klik op een stad.
 * Goed in één keer: stad wordt groen. Goed na een fout: blauw (komt later terug).
 * Fout: telt als fout voor de gevraagde stad.
 */
export function answer(
  state: GameState,
  clickedCity: string,
  secondsTaken: number,
  random: Random = Math.random,
  /** Deel van de munten dat je krijgt (meerkeuze is makkelijker: 0,5). */
  coinFactor = 1,
): { state: GameState; result: AnswerResult } {
  const target = state.currentCity;
  if (target === null) return { state, result: { kind: 'ignored' } };

  if (clickedCity !== target) {
    return {
      state: {
        ...state,
        attempts: state.attempts + 1,
        mistakes: { ...state.mistakes, [target]: (state.mistakes[target] ?? 0) + 1 },
      },
      result: { kind: 'wrong' },
    };
  }

  const firstTry = state.attempts === 0;
  const coins = Math.round(coinsForCorrect(secondsTaken) * coinFactor);
  const answered: GameState = {
    ...state,
    status: { ...state.status, [target]: firstTry ? 'green' : 'blue' },
    coinsThisGame: state.coinsThisGame + coins,
    attempts: 0,
    hintUsed: false,
  };
  return {
    state: { ...answered, currentCity: pickNextCity(answered, random) },
    result: { kind: 'correct', city: target, coins, firstTry },
  };
}

/**
 * Keer de eindbonus uit als het spel klaar is en dat nog niet gebeurd is.
 * Geeft 0 terug als er niets (meer) uit te keren valt.
 */
export function claimCompletionBonus(state: GameState): { state: GameState; bonus: number } {
  if (!isComplete(state) || state.bonusPaid) return { state, bonus: 0 };
  return {
    state: { ...state, bonusPaid: true },
    bonus: completionBonus(state.coinsThisGame),
  };
}

/** Een gewoon pakket, het oefenrondje met lastige steden of de dagelijkse uitdaging. */
export type GameKind = 'package' | 'practice' | 'daily';

/** Maximaal aantal hints per spel. */
export const MAX_HINTS = { map: 5, choice: 3 } as const;

export function hintsLeft(state: GameState, max: number): number {
  return Math.max(0, max - state.hintsUsed);
}

/**
 * Gebruik een hint voor de huidige vraag. Lukt niet als de hint al aan staat,
 * er geen vraag is of de hints op zijn.
 */
export function takeHint(state: GameState, max: number): GameState {
  if (state.hintUsed || state.currentCity === null || hintsLeft(state, max) === 0) return state;
  return { ...state, hintUsed: true, hintsUsed: state.hintsUsed + 1 };
}

/** Steden met fouten, meeste fouten eerst. */
export function hardestCities(state: GameState): Array<{ city: string; mistakes: number }> {
  return Object.entries(state.mistakes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([city, mistakes]) => ({ city, mistakes }));
}
