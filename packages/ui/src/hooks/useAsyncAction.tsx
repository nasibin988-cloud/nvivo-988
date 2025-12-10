/**
 * useAsyncAction - Manages loading, error, and success states for async operations
 */

import { useState, useCallback } from 'react';

export interface AsyncActionState {
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export interface UseAsyncActionReturn<T> extends AsyncActionState {
  execute: (action: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
  setError: (error: Error | null) => void;
}

export function useAsyncAction<T = void>(): UseAsyncActionReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const execute = useCallback(async (action: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await action();
      setIsSuccess(true);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    isLoading,
    error,
    isSuccess,
    execute,
    reset,
    setError,
  };
}

/**
 * Utility hook for showing success toast that auto-dismisses
 */
export function useSuccessToast(duration = 2000): {
  showSuccess: boolean;
  triggerSuccess: () => void;
} {
  const [showSuccess, setShowSuccess] = useState(false);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), duration);
  }, [duration]);

  return { showSuccess, triggerSuccess };
}
