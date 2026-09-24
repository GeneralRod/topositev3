// Verbindt de spelregels (rules.ts) met React en de opslag.
// Alle beslissingen staan in rules.ts; hier alleen: bijhouden, bewaren, munten uitkeren.

import { useCallback, useEffect, useRef, useState } from 'react';
import { addCoins, clearGame, loadGame, recordCityAnswer, recordStars, saveGame } from '../storage';
import { starsFor } from './progress';
import {
  answer,
  claimCompletionBonus,
  isComplete,
  newGame,
  restoreGame,
  type AnswerResult,
  type GameState,
} from './rules';

function startGame(packageId: string, cityNames: string[]): GameState {
  const saved = loadGame(packageId);
  return saved ? restoreGame(saved, cityNames) : newGame(cityNames);
}

export interface GameOptions {
  /** Onderwerp, voor het bijhouden van lastige steden. */
  categoryId: string;
  /** Sterren bewaren bij een afgerond spel (niet bij het oefenrondje). */
  countStars: boolean;
}

/** Totaal aantal fouten in een spel. */
export function totalMistakes(state: GameState): number {
  return Object.values(state.mistakes).reduce((sum, n) => sum + n, 0);
}

export function useGame(packageId: string, cityNames: string[], options: GameOptions) {
  const { categoryId, countStars } = options;
  const [state, setState] = useState(() => startGame(packageId, cityNames));
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
      const { state: answered, result } = answer(state, cityName, seconds);
      let next = answered;
      if (result.kind === 'wrong' && state.currentCity) {
        recordCityAnswer(categoryId, state.currentCity, 'wrong');
      }
      if (result.kind === 'correct') {
        recordCityAnswer(categoryId, result.city, result.firstTry ? 'first-try' : 'after-mistake');
        addCoins(result.coins);
        if (isComplete(next)) {
          const claimed = claimCompletionBonus(next);
          addCoins(claimed.bonus);
          next = claimed.state;
          if (countStars) {
            recordStars(packageId, starsFor(totalMistakes(next), Object.keys(next.status).length));
          }
        }
      }
      setState(next);
      return result;
    },
    [state, categoryId, countStars, packageId],
  );

  const showHint = useCallback(() => setState((s) => ({ ...s, hintUsed: true })), []);

  const restart = useCallback(() => {
    clearGame(packageId);
    setState(newGame(cityNames));
  }, [packageId, cityNames]);

  return { state, clickCity, showHint, restart };
}
