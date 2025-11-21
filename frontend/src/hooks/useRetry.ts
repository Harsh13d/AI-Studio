import { useCallback, useRef, useState } from 'react';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useRetry = (options?: { maxAttempts?: number; baseDelayMs?: number }) => {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelay = options?.baseDelayMs ?? 600;
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const lastErrorRef = useRef<unknown>(null);

  const execute = useCallback(
    async <T,>(
      action: () => Promise<T>,
      shouldRetry: (error: unknown) => boolean = () => true,
    ): Promise<T> => {
      setAttempts(0);
      setIsRetrying(false);
      lastErrorRef.current = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          if (attempt > 0) {
            setIsRetrying(true);
            await wait(baseDelay * 2 ** (attempt - 1));
          }
          const result = await action();
          setAttempts(attempt);
          setIsRetrying(false);
          lastErrorRef.current = null;
          return result;
        } catch (error) {
          lastErrorRef.current = error;
          const canRetry = shouldRetry(error) && attempt < maxAttempts - 1;
          setAttempts(attempt + 1);
          if (!canRetry) {
            setIsRetrying(false);
            throw error;
          }
        }
      }

      setIsRetrying(false);
      throw lastErrorRef.current ?? new Error('Max retries reached');
    },
    [baseDelay, maxAttempts],
  );

  const reset = useCallback(() => {
    setAttempts(0);
    setIsRetrying(false);
    lastErrorRef.current = null;
  }, []);

  return {
    execute,
    attempts,
    maxAttempts,
    isRetrying,
    hasAttemptsLeft: attempts < maxAttempts,
    reset,
  };
};

