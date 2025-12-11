/**
 * useMenuScanner Hook
 * State management and OCR analysis for menu scanning
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import type { ScanStep, MenuItem, MenuScanResult } from '../types';
import { generateId } from '../utils';

interface UseMenuScannerReturn {
  step: ScanStep;
  imageData: string | null;
  result: MenuScanResult | null;
  error: string | null;
  selectedItems: MenuItem[];
  setImageData: (data: string | null) => void;
  scanMenu: (base64: string) => Promise<void>;
  handleRetry: () => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  updateItemNutrition: (itemId: string, updates: Partial<MenuItem>) => void;
  getSelectedItems: () => MenuItem[];
}

export function useMenuScanner(): UseMenuScannerReturn {
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<MenuScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanMenu = useCallback(async (base64: string) => {
    setStep('scanning');
    setError(null);

    try {
      const functions = getFunctions();
      const scanFn = httpsCallable<{ imageBase64: string }, MenuScanResult>(
        functions,
        'scanMenuPhoto'
      );

      const imageContent = base64.split(',')[1];
      const response = await scanFn({ imageBase64: imageContent });

      // Ensure all items have IDs
      const itemsWithIds = response.data.menuItems.map((item) => ({
        ...item,
        id: item.id || generateId(),
        isSelected: false,
      }));

      setResult({ ...response.data, menuItems: itemsWithIds });
      setStep('review');
    } catch (err) {
      console.error('Menu scan failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan menu';
      setError(errorMessage);
      setStep('capture');
    }
  }, []);

  const handleRetry = useCallback(() => {
    setImageData(null);
    setResult(null);
    setError(null);
    setStep('capture');
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    if (!result) return;

    const updatedItems = result.menuItems.map((item) =>
      item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
    );

    setResult({ ...result, menuItems: updatedItems });
  }, [result]);

  const selectAllItems = useCallback(() => {
    if (!result) return;

    const updatedItems = result.menuItems.map((item) => ({
      ...item,
      isSelected: true,
    }));

    setResult({ ...result, menuItems: updatedItems });
  }, [result]);

  const deselectAllItems = useCallback(() => {
    if (!result) return;

    const updatedItems = result.menuItems.map((item) => ({
      ...item,
      isSelected: false,
    }));

    setResult({ ...result, menuItems: updatedItems });
  }, [result]);

  const updateItemNutrition = useCallback((itemId: string, updates: Partial<MenuItem>) => {
    if (!result) return;

    const updatedItems = result.menuItems.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    setResult({ ...result, menuItems: updatedItems });
  }, [result]);

  const getSelectedItems = useCallback((): MenuItem[] => {
    if (!result) return [];
    return result.menuItems.filter((item) => item.isSelected);
  }, [result]);

  const selectedItems = result?.menuItems.filter((item) => item.isSelected) || [];

  return {
    step,
    imageData,
    result,
    error,
    selectedItems,
    setImageData,
    scanMenu,
    handleRetry,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateItemNutrition,
    getSelectedItems,
  };
}
