/**
 * usePhotoAnalysis Hook
 * State management and analysis logic
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import type { AnalysisResult, AnalyzedFood, MealType, AnalysisStep } from '../types';
import { getMockAnalysisResult } from '../data';

interface UsePhotoAnalysisReturn {
  step: AnalysisStep;
  imageData: string | null;
  result: AnalysisResult | null;
  error: string | null;
  selectedMealType: MealType;
  eatenAt: string;
  editingItem: number | null;
  setImageData: (data: string | null) => void;
  analyzeImage: (base64: string) => Promise<void>;
  handleRetry: () => void;
  handleUpdateItem: (index: number, updates: Partial<AnalyzedFood>) => void;
  handleRemoveItem: (index: number) => void;
  handlePortionChange: (index: number, newQuantity: number) => void;
  setSelectedMealType: (type: MealType) => void;
  setEatenAt: (time: string) => void;
  setEditingItem: (index: number | null) => void;
  getConfirmResult: () => AnalysisResult | null;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function recalculateTotals(items: AnalyzedFood[]): Pick<AnalysisResult, 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'> {
  return items.reduce(
    (acc, item) => ({
      totalCalories: acc.totalCalories + item.calories,
      totalProtein: acc.totalProtein + item.protein,
      totalCarbs: acc.totalCarbs + item.carbs,
      totalFat: acc.totalFat + item.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
}

export function usePhotoAnalysis(): UsePhotoAnalysisReturn {
  const [step, setStep] = useState<AnalysisStep>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [eatenAt, setEatenAt] = useState<string>(getCurrentTime);

  const analyzeImage = useCallback(async (base64: string) => {
    setStep('analyzing');
    setError(null);

    try {
      const functions = getFunctions();
      const analyzeFn = httpsCallable<{ imageBase64: string }, AnalysisResult>(
        functions,
        'analyzeFoodPhoto'
      );

      const imageContent = base64.split(',')[1];
      const response = await analyzeFn({ imageBase64: imageContent });
      setResult(response.data);

      if (response.data.mealType && response.data.mealType !== 'unknown') {
        setSelectedMealType(response.data.mealType as MealType);
      }
      setStep('review');
    } catch (err) {
      console.error('Analysis failed:', err);
      const mockResult = getMockAnalysisResult();
      setResult(mockResult);
      if (mockResult.mealType && mockResult.mealType !== 'unknown') {
        setSelectedMealType(mockResult.mealType as MealType);
      }
      setStep('review');
    }
  }, []);

  const handleRetry = useCallback(() => {
    setImageData(null);
    setResult(null);
    setError(null);
    setStep('capture');
  }, []);

  const handleUpdateItem = useCallback((index: number, updates: Partial<AnalyzedFood>) => {
    if (!result) return;

    const newItems = [...result.items];
    newItems[index] = { ...newItems[index], ...updates };
    const totals = recalculateTotals(newItems);

    setResult({ ...result, items: newItems, ...totals });
    setEditingItem(null);
  }, [result]);

  const handleRemoveItem = useCallback((index: number) => {
    if (!result) return;

    const newItems = result.items.filter((_, i) => i !== index);
    const totals = recalculateTotals(newItems);

    setResult({ ...result, items: newItems, ...totals });
  }, [result]);

  const handlePortionChange = useCallback((index: number, newQuantity: number) => {
    if (!result || newQuantity <= 0) return;

    const item = result.items[index];
    const multiplier = newQuantity / item.quantity;

    const updatedItem: AnalyzedFood = {
      ...item,
      quantity: newQuantity,
      calories: Math.round(item.calories * multiplier),
      protein: Math.round(item.protein * multiplier * 10) / 10,
      carbs: Math.round(item.carbs * multiplier * 10) / 10,
      fat: Math.round(item.fat * multiplier * 10) / 10,
      fiber: item.fiber ? Math.round(item.fiber * multiplier * 10) / 10 : undefined,
    };

    const newItems = [...result.items];
    newItems[index] = updatedItem;

    const totals = recalculateTotals(newItems);
    setResult({
      ...result,
      items: newItems,
      totalCalories: Math.round(totals.totalCalories),
      totalProtein: Math.round(totals.totalProtein * 10) / 10,
      totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
      totalFat: Math.round(totals.totalFat * 10) / 10,
    });
  }, [result]);

  const getConfirmResult = useCallback((): AnalysisResult | null => {
    if (!result) return null;
    return {
      ...result,
      mealType: selectedMealType,
      eatenAt,
    };
  }, [result, selectedMealType, eatenAt]);

  return {
    step,
    imageData,
    result,
    error,
    selectedMealType,
    eatenAt,
    editingItem,
    setImageData,
    analyzeImage,
    handleRetry,
    handleUpdateItem,
    handleRemoveItem,
    handlePortionChange,
    setSelectedMealType,
    setEatenAt,
    setEditingItem,
    getConfirmResult,
  };
}
