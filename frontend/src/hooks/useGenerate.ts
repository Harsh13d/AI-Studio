import { useRef, useState } from 'react';
import { createGeneration } from '../services/api';
import type { Generation } from '../types';
import { useRetry } from './useRetry';

type GenerateStatus = 'idle' | 'loading' | 'success' | 'error';

export const useGenerate = (
  token: string | null,
  onSuccess?: (generation: Generation) => void,
) => {
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(
    null,
  );
  const controllerRef = useRef<AbortController | null>(null);
  const retry = useRetry({ maxAttempts: 3, baseDelayMs: 700 });

  const generate = async (formData: FormData) => {
    if (!token) {
      throw new Error('You must be logged in to generate images.');
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');
    setError(null);

    try {
      const generation = await retry.execute(
        () => createGeneration({ token, formData, signal: controller.signal }),
        (err) => err instanceof Error && /overloaded/i.test(err.message),
      );

      setCurrentGeneration(generation);
      onSuccess?.(generation);
      setStatus('success');
      retry.reset();
      return generation;
    } catch (err) {
      if (controller.signal.aborted) {
        setError('Generation aborted.');
        setStatus('idle');
        return null;
      }

      const message =
        err instanceof Error ? err.message : 'Unable to generate image.';
      setError(message);
      setStatus('error');
      throw err;
    } finally {
      controllerRef.current = null;
    }
  };

  const abort = () => {
    controllerRef.current?.abort();
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setCurrentGeneration(null);
    retry.reset();
  };

  return {
    generate,
    abort,
    reset,
    status,
    error,
    currentGeneration,
    retryState: {
      attempts: retry.attempts,
      maxAttempts: retry.maxAttempts,
      isRetrying: retry.isRetrying,
    },
  };
};

