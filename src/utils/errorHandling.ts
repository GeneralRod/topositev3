export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class MapError extends GameError {
  constructor(message: string) {
    super(message, 'MAP_ERROR');
    this.name = 'MapError';
  }
}

export class StorageError extends GameError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}

export const handleMapError = (error: unknown): void => {
  if (error instanceof MapError) {
    console.error('Map Error:', error.message);
    // You could dispatch to a global error state or show a notification
  } else {
    console.error('Unexpected Map Error:', error);
  }
};

export const handleStorageError = (error: unknown): void => {
  if (error instanceof StorageError) {
    console.error('Storage Error:', error.message);
    // You could dispatch to a global error state or show a notification
  } else {
    console.error('Unexpected Storage Error:', error);
  }
};

export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof GameError) {
    return error.code === 'STORAGE_ERROR';
  }
  return false;
};

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }

  throw lastError;
};
