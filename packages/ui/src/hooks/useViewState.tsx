/**
 * useViewState - Manages view toggle state with optional URL sync
 */

import { useState, useCallback } from 'react';

export interface UseViewStateReturn<T extends string> {
  view: T;
  setView: (view: T) => void;
  isView: (view: T) => boolean;
}

export function useViewState<T extends string>(
  defaultView: T
): UseViewStateReturn<T> {
  const [view, setViewState] = useState<T>(defaultView);

  const setView = useCallback((newView: T) => {
    setViewState(newView);
  }, []);

  const isView = useCallback(
    (checkView: T) => view === checkView,
    [view]
  );

  return {
    view,
    setView,
    isView,
  };
}
