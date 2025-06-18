import type { City } from '../data/cities';
import { StorageError, retryOperation } from './errorHandling';

interface GameState {
  cityStatus: Record<string, 'unanswered' | 'blue' | 'green'>;
  cityMistakes: Record<string, number>;
  score: number;
  currentAttempts: number;
  hintUsed: boolean;
  currentCity: City | null;
  selectedPackage: string;
  lastUpdated: number;
  sessionCoins?: number;
  coinsThisGame?: number;
}

const getStorageKey = (packageName: string) => `topografie_game_state_${packageName}`;

export const saveGameState = async (state: GameState): Promise<void> => {
  const saveOperation = async () => {
    try {
      const storageKey = getStorageKey(state.selectedPackage);
      const stateToSave = {
        ...state,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      throw new StorageError(
        `Failed to save game state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  try {
    await retryOperation(saveOperation);
  } catch (error) {
    console.error('Failed to save game state after retries:', error);
    throw error;
  }
};

export const loadGameState = async (packageName: string): Promise<GameState | null> => {
  const loadOperation = async () => {
    try {
      const storageKey = getStorageKey(packageName);
      const savedState = localStorage.getItem(storageKey);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as GameState;

        if (!isValidGameState(parsedState)) {
          throw new StorageError('Invalid game state structure');
        }

        return parsedState;
      }
      return null;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to load game state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  try {
    return await retryOperation(loadOperation);
  } catch (error) {
    console.error('Failed to load game state after retries:', error);
    await clearGameState(packageName);
    return null;
  }
};

export const clearGameState = async (packageName: string): Promise<void> => {
  const clearOperation = async () => {
    try {
      const storageKey = getStorageKey(packageName);
      localStorage.removeItem(storageKey);
    } catch (error) {
      throw new StorageError(
        `Failed to clear game state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  try {
    await retryOperation(clearOperation);
  } catch (error) {
    console.error('Failed to clear game state after retries:', error);
    throw error;
  }
};

// Helper function to validate game state structure
const isValidGameState = (state: unknown): state is GameState => {
  if (typeof state !== 'object' || state === null) return false;
  const s = state as Record<string, unknown>;
  return (
    'cityStatus' in s &&
    'cityMistakes' in s &&
    'score' in s &&
    'currentAttempts' in s &&
    'hintUsed' in s &&
    'selectedPackage' in s &&
    'currentCity' in s &&
    'lastUpdated' in s
    // sessionCoins and coinsThisGame are optional
  );
};
