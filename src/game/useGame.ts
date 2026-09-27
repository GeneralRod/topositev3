// Verbindt de spelregels (rules.ts) met React en de opslag.
// Alle beslissingen staan in rules.ts; hier alleen: bijhouden, bewaren, munten uitkeren.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addCoins,
  awardAchievements,
  clearGame,
  loadGame,
  recordCityAnswer,
  recordStars,
  saveGame,
  type PlayMode,
} from '../storage';
import { starsFor } from './progress';
import {
  answer,
  claimCompletionBonus,
  isComplete,
  MAX_HINTS,
  newGame,
  restoreGame,
  takeHint,
  type AnswerResult,
  type GameKind,
  type GameState,
} from './rules';

function startGame(packageId: string, cityNames: string[]): GameState {
  const saved = loadGame(packageId);
  return saved ? restoreGame(saved, cityNames) : newGame(cityNames);
}

export interface GameOptions {
  /** Onderwerp, voor het bijhouden van lastige steden. */
  categoryId: string;
  kind: GameKind;
  /** Aanwijzen op de kaart of meerkeuze. */
  mode: PlayMode;
  /** Wordt één keer aangeroepen op het moment dat het spel af is. */
  onComplete?: () => void;
}

/** Totaal aantal fouten in een spel. */
export function totalMistakes(state: GameState): number {
  return Object.values(state.mistakes).reduce((sum, n) => sum + n, 0);
}

/**
 * Sterren tellen alleen bij gewone pakketten op de kaart: niet bij het
 * oefenrondje, de dagelijkse uitdaging of meerkeuze (dat is makkelijker).
 */
export function countsStars(kind: GameKind, mode: PlayMode): boolean {
  return kind === 'package' && mode === 'map';
}

function processWrongAnswer(categoryId: string, currentCity: string | null) {
  if (currentCity) {
    recordCityAnswer(categoryId, currentCity, 'wrong');
  }
}

function processCorrectAnswer(
  categoryId: string,
  result: Extract<AnswerResult, { kind: 'correct' }>,
) {
  recordCityAnswer(categoryId, result.city, result.firstTry ? 'first-try' : 'after-mistake');
  addCoins(result.coins);
}

function handleGameCompletion(
  state: GameState,
  packageId: string,
  kind: GameKind,
  mode: PlayMode,
  countStars: boolean,
  onComplete?: () => void,
): { state: GameState; earned: string[] } {
  const claimed = claimCompletionBonus(state);
  addCoins(claimed.bonus);
  const next = claimed.state;
  if (countStars) {
    recordStars(packageId, starsFor(totalMistakes(next), Object.keys(next.status).length));
  }
  onComplete?.();
  // Pas na de sterren en de dagelijkse reeks, want daar kijken prestaties naar.
  const earned = awardAchievements({ kind, mode, mistakes: totalMistakes(next) });
  return { state: next, earned };
}

export function useGame(packageId: string, cityNames: string[], options: GameOptions) {
  const { categoryId, kind, mode, onComplete } = options;
  const countStars = countsStars(kind, mode);
  // Meerkeuze is makkelijker: halve munten.
  const coinFactor = mode === 'choice' ? 0.5 : 1;
  const [state, setState] = useState(() => startGame(packageId, cityNames));
  /** Prestatieprijzen die je met dit spel net hebt verdiend. */
  const [earned, setEarned] = useState<string[]>([]);
  const questionStartedAt = useRef(0);

  // Start de klok voor de snelheidsbonus zodra er een nieuwe vraag is.
  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, [state.currentCity]);

  // Bewaar elke wijziging meteen.
  useEffect(() => {
    saveGame(packageId, state);
  }, [packageId, state]);

  const clickCity = useCallback(
    (cityName: string): AnswerResult => {
      const seconds = (Date.now() - questionStartedAt.current) / 1000;
      const { state: answered, result } = answer(state, cityName, seconds, Math.random, coinFactor);
      let next = answered;

      if (result.kind === 'wrong') {
        processWrongAnswer(categoryId, state.currentCity);
      } else if (result.kind === 'correct') {
        processCorrectAnswer(categoryId, result);
        if (isComplete(next)) {
          const completion = handleGameCompletion(
            next,
            packageId,
            kind,
            mode,
            countStars,
            onComplete,
          );
          next = completion.state;
          setEarned(completion.earned);
        }
      }

      setState(next);
      return result;
    },
    [state, categoryId, countStars, packageId, coinFactor, onComplete, kind, mode],
  );

  const showHint = useCallback(() => setState((s) => takeHint(s, MAX_HINTS[mode])), [mode]);

  const restart = useCallback(() => {
    clearGame(packageId);
    setState(newGame(cityNames));
    setEarned([]);
  }, [packageId, cityNames]);

  return { state, earned, clickCity, showHint, restart };
}
