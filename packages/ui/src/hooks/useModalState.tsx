/**
 * useModalState - Manages multiple modal states with a single hook
 * Reduces boilerplate from multiple useState declarations
 */

import { useState, useCallback } from 'react';

export interface ModalState {
  [key: string]: boolean;
}

export interface UseModalStateReturn<T extends ModalState> {
  modals: T;
  openModal: (key: keyof T) => void;
  closeModal: (key: keyof T) => void;
  toggleModal: (key: keyof T) => void;
  closeAll: () => void;
  isOpen: (key: keyof T) => boolean;
}

export function useModalState<T extends ModalState>(
  initialState: T
): UseModalStateReturn<T> {
  const [modals, setModals] = useState<T>(initialState);

  const openModal = useCallback((key: keyof T) => {
    setModals((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeModal = useCallback((key: keyof T) => {
    setModals((prev) => ({ ...prev, [key]: false }));
  }, []);

  const toggleModal = useCallback((key: keyof T) => {
    setModals((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeAll = useCallback(() => {
    setModals((prev) => {
      const closed = { ...prev };
      for (const key in closed) {
        closed[key] = false as T[typeof key];
      }
      return closed;
    });
  }, []);

  const isOpen = useCallback(
    (key: keyof T) => modals[key],
    [modals]
  );

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAll,
    isOpen,
  };
}
