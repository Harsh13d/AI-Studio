import { useCallback, useEffect, useState } from 'react';
import { fetchGenerations } from '../services/api';
import type { Generation } from '../types';

export const useGenerations = (token: string | null) => {
  const [items, setItems] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGenerations(token, 5);
      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load history.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addGeneration = useCallback((generation: Generation) => {
    setItems((prev) => [generation, ...prev].slice(0, 5));
  }, []);

  return {
    items,
    isLoading,
    error,
    refresh,
    addGeneration,
  };
};

