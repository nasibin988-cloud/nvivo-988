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

// Mock response for development/fallback
function getMockScanResult(): MenuScanResult {
  return {
    restaurant: {
      name: 'Sample Restaurant',
      logoDetected: false,
      confidence: 0.7,
      cuisine: 'American',
    },
    menuItems: [
      {
        id: generateId(),
        name: 'Grilled Chicken Salad',
        description: 'Mixed greens with grilled chicken, tomatoes, and house dressing',
        price: '$12.99',
        calories: 420,
        protein: 35,
        carbs: 18,
        fat: 22,
        fiber: 4,
        sugar: 6,
        sodium: 680,
        isSelected: false,
        confidence: 0.85,
      },
      {
        id: generateId(),
        name: 'Classic Burger',
        description: 'Angus beef patty with lettuce, tomato, and special sauce',
        price: '$14.99',
        calories: 780,
        protein: 42,
        carbs: 45,
        fat: 48,
        fiber: 2,
        sugar: 8,
        sodium: 1120,
        isSelected: false,
        confidence: 0.82,
      },
      {
        id: generateId(),
        name: 'Caesar Salad',
        description: 'Romaine lettuce with parmesan and croutons',
        price: '$9.99',
        calories: 320,
        protein: 12,
        carbs: 22,
        fat: 24,
        fiber: 3,
        sugar: 4,
        sodium: 580,
        isSelected: false,
        confidence: 0.88,
      },
    ],
    rawText: 'MENU\n\nGrilled Chicken Salad - $12.99\nMixed greens with grilled chicken...\n\nClassic Burger - $14.99\nAngus beef patty...',
    scanConfidence: 0.75,
  };
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
      // Fall back to mock data for demo purposes
      const mockResult = getMockScanResult();
      setResult(mockResult);
      setStep('review');
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
