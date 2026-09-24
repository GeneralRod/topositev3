// Verbindt de spelregels (rules.ts) met React en de opslag.
// Alle beslissingen staan in rules.ts; hier alleen: bijhouden, bewaren, munten uitkeren.

import { useCallback, useEffect, useRef, useState } from 'react';
import { addCoins, clearGame, loadGame, saveGame } from '../storage';
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

export function useGame(packageId: string, cityNames: string[]) {
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
      if (result.kind === 'correct') {
        addCoins(result.coins);
        if (isComplete(next)) {
          const claimed = claimCompletionBonus(next);
          addCoins(claimed.bonus);
          next = claimed.state;
        }
      }
      setState(next);
      return result;
    },
    [state],
  );

  const showHint = useCallback(() => setState((s) => ({ ...s, hintUsed: true })), []);

  const restart = useCallback(() => {
    clearGame(packageId);
    setState(newGame(cityNames));
  }, [packageId, cityNames]);

  return { state, clickCity, showHint, restart };
}
