/**
 * useMenuScanner Hook
 * State management and OCR analysis for menu scanning
 * Supports single-item detailed view and multi-item comparison (2-4 items)
 *
 * Uses the SAME analysis flow as useMultiFoodComparison:
 * - Calls analyzeFoodText for each item to get full 35+ nutrient data
 * - Calls gradeFoodAI for AI-based health grades
 * - Builds complete FoodHealthProfile for comparison
 */

import { useState, useCallback, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import type { ScanStep, MenuItem, MenuScanResult } from '../types';
import type { AnalysisResult } from '../../photo-analysis/types';
import type {
  MultiComparisonResult,
  FoodHealthProfile,
  WellnessFocus,
  ExtendedNutritionData,
  HealthGrade,
  AIComparisonInsight,
} from '../../food-comparison/types';
import { generateId } from '../utils';
import {
  buildFoodHealthProfile,
  generateAiRecommendation,
} from '../../food-comparison/utils';
import type { FoodIntelligence } from '../../photo-analysis/types';

/**
 * Extract a short, clean food name from a potentially long description
 * Examples:
 * - "Hunter Chicken (chicken breast with mushrooms and bacon)" → "Hunter Chicken"
 * - "1/3 lb Bacon Cheeseburger with sesame bun and lettuce" → "Bacon Cheeseburger"
 * - "Grilled Salmon Fillet" → "Grilled Salmon Fillet"
 */
function getShortFoodName(fullName: string): string {
  // Remove anything in parentheses
  let name = fullName.replace(/\s*\([^)]*\)/g, '').trim();

  // Remove common prefixes like "1/3 lb", "8 oz", "Large", etc.
  name = name.replace(/^(\d+\/?\d*\s*(lb|oz|g|ml|pc|pcs|piece|pieces|slice|slices)\.?\s+)/i, '').trim();
  name = name.replace(/^(small|medium|large|extra large|xl|sm|md|lg)\s+/i, '').trim();

  // Remove "with" and everything after it
  const withIndex = name.toLowerCase().indexOf(' with ');
  if (withIndex > 0) {
    name = name.substring(0, withIndex).trim();
  }

  // Remove "and" clauses at the end
  const andIndex = name.toLowerCase().lastIndexOf(' and ');
  if (andIndex > name.length * 0.6) { // Only if "and" is in the last 40% of the string
    name = name.substring(0, andIndex).trim();
  }

  // Truncate if still too long (max ~25 chars for display)
  if (name.length > 30) {
    // Try to cut at a word boundary
    const truncated = name.substring(0, 27);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 15) {
      name = truncated.substring(0, lastSpace);
    } else {
      name = truncated;
    }
  }

  return name || fullName.substring(0, 25); // Fallback to truncated original
}

// Extended nutrition data from cloud function (complete nutrients)
// Matches the structure from useMultiFoodComparison
interface ExtendedFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;

  // Carbs breakdown
  addedSugar?: number;
  starch?: number;

  // Fat breakdown
  saturatedFat?: number;
  transFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  cholesterol?: number;

  // Fatty acids
  omega3?: number;
  omega6?: number;

  // Minerals - Electrolytes
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  phosphorus?: number;

  // Minerals - Trace
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  chromium?: number;
  molybdenum?: number;
  fluoride?: number;

  // Vitamins - Fat-soluble
  vitaminA?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;

  // Vitamins - Water-soluble
  vitaminC?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  pantothenicAcid?: number;
  vitaminB6?: number;
  biotin?: number;
  folate?: number;
  vitaminB12?: number;
  choline?: number;

  // Other bioactive
  caffeine?: number;
  alcohol?: number;
  water?: number;
  lycopene?: number;
  lutein?: number;
  betaCarotene?: number;

  // Metadata
  glycemicIndex?: number;
  glycemicLoad?: number;
  novaClass?: 1 | 2 | 3 | 4;

  // Food intelligence data from database
  intelligence?: FoodIntelligence;
}

/**
 * Helper to extract all extended nutrition data from a food item
 * Handles undefined values gracefully
 * Uses short food names for cleaner display
 * Returns both nutrition data and intelligence (if available)
 */
function extractAllNutrients(food: ExtendedFoodItem): { nutrition: ExtendedNutritionData; intelligence?: FoodIntelligence } {
  const nutrition: ExtendedNutritionData = {
    name: getShortFoodName(food.name),
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber ?? 0,
    sugar: food.sugar ?? 0,
    sodium: food.sodium ?? 0,
    // Carbs breakdown
    addedSugar: food.addedSugar,
    starch: food.starch,
    // Fat breakdown
    saturatedFat: food.saturatedFat,
    transFat: food.transFat,
    monounsaturatedFat: food.monounsaturatedFat,
    polyunsaturatedFat: food.polyunsaturatedFat,
    cholesterol: food.cholesterol,
    // Fatty acids
    omega3: food.omega3,
    omega6: food.omega6,
    // Minerals - Electrolytes
    potassium: food.potassium,
    calcium: food.calcium,
    magnesium: food.magnesium,
    phosphorus: food.phosphorus,
    // Minerals - Trace
    iron: food.iron,
    zinc: food.zinc,
    copper: food.copper,
    manganese: food.manganese,
    selenium: food.selenium,
    iodine: food.iodine,
    chromium: food.chromium,
    molybdenum: food.molybdenum,
    fluoride: food.fluoride,
    // Vitamins - Fat-soluble
    vitaminA: food.vitaminA,
    vitaminD: food.vitaminD,
    vitaminE: food.vitaminE,
    vitaminK: food.vitaminK,
    // Vitamins - Water-soluble
    vitaminC: food.vitaminC,
    thiamin: food.thiamin,
    riboflavin: food.riboflavin,
    niacin: food.niacin,
    pantothenicAcid: food.pantothenicAcid,
    vitaminB6: food.vitaminB6,
    biotin: food.biotin,
    folate: food.folate,
    vitaminB12: food.vitaminB12,
    choline: food.choline,
    // Other bioactive
    caffeine: food.caffeine,
    alcohol: food.alcohol,
    water: food.water,
    lycopene: food.lycopene,
    lutein: food.lutein,
    betaCarotene: food.betaCarotene,
    // Metadata
    glycemicIndex: food.glycemicIndex,
    glycemicLoad: food.glycemicLoad,
    novaClass: food.novaClass,
  };

  return {
    nutrition,
    intelligence: food.intelligence,
  };
}

/**
 * Helper to combine nutrients from multiple food items
 * Uses short food names for cleaner display
 */
function combineNutrients(items: ExtendedFoodItem[], _combinedName: string): ExtendedNutritionData {
  const sumOptional = (getter: (item: ExtendedFoodItem) => number | undefined): number | undefined => {
    const sum = items.reduce((acc, item) => acc + (getter(item) ?? 0), 0);
    return sum > 0 ? sum : undefined;
  };

  // Create short combined name from short individual names
  const shortNames = items.map(i => getShortFoodName(i.name));
  const shortCombinedName = shortNames.join(' + ');
  const finalName = shortCombinedName.length > 30
    ? shortNames[0] + ' + more'
    : shortCombinedName;

  return {
    name: finalName,
    calories: items.reduce((sum, i) => sum + i.calories, 0),
    protein: items.reduce((sum, i) => sum + i.protein, 0),
    carbs: items.reduce((sum, i) => sum + i.carbs, 0),
    fat: items.reduce((sum, i) => sum + i.fat, 0),
    fiber: items.reduce((sum, i) => sum + (i.fiber ?? 0), 0),
    sugar: items.reduce((sum, i) => sum + (i.sugar ?? 0), 0),
    sodium: items.reduce((sum, i) => sum + (i.sodium ?? 0), 0),
    // Carbs breakdown
    addedSugar: sumOptional(i => i.addedSugar),
    starch: sumOptional(i => i.starch),
    // Fat breakdown
    saturatedFat: sumOptional(i => i.saturatedFat),
    transFat: sumOptional(i => i.transFat),
    monounsaturatedFat: sumOptional(i => i.monounsaturatedFat),
    polyunsaturatedFat: sumOptional(i => i.polyunsaturatedFat),
    cholesterol: sumOptional(i => i.cholesterol),
    // Fatty acids
    omega3: sumOptional(i => i.omega3),
    omega6: sumOptional(i => i.omega6),
    // Minerals - Electrolytes
    potassium: sumOptional(i => i.potassium),
    calcium: sumOptional(i => i.calcium),
    magnesium: sumOptional(i => i.magnesium),
    phosphorus: sumOptional(i => i.phosphorus),
    // Minerals - Trace
    iron: sumOptional(i => i.iron),
    zinc: sumOptional(i => i.zinc),
    copper: sumOptional(i => i.copper),
    manganese: sumOptional(i => i.manganese),
    selenium: sumOptional(i => i.selenium),
    iodine: sumOptional(i => i.iodine),
    chromium: sumOptional(i => i.chromium),
    molybdenum: sumOptional(i => i.molybdenum),
    fluoride: sumOptional(i => i.fluoride),
    // Vitamins - Fat-soluble
    vitaminA: sumOptional(i => i.vitaminA),
    vitaminD: sumOptional(i => i.vitaminD),
    vitaminE: sumOptional(i => i.vitaminE),
    vitaminK: sumOptional(i => i.vitaminK),
    // Vitamins - Water-soluble
    vitaminC: sumOptional(i => i.vitaminC),
    thiamin: sumOptional(i => i.thiamin),
    riboflavin: sumOptional(i => i.riboflavin),
    niacin: sumOptional(i => i.niacin),
    pantothenicAcid: sumOptional(i => i.pantothenicAcid),
    vitaminB6: sumOptional(i => i.vitaminB6),
    biotin: sumOptional(i => i.biotin),
    folate: sumOptional(i => i.folate),
    vitaminB12: sumOptional(i => i.vitaminB12),
    choline: sumOptional(i => i.choline),
    // Other bioactive
    caffeine: sumOptional(i => i.caffeine),
    alcohol: sumOptional(i => i.alcohol),
    water: sumOptional(i => i.water),
    // Metadata - average for GI/GL
    glycemicIndex: sumOptional(i => i.glycemicIndex) ? Math.round(items.reduce((sum, i) => sum + (i.glycemicIndex ?? 0), 0) / items.filter(i => i.glycemicIndex).length) : undefined,
    glycemicLoad: sumOptional(i => i.glycemicLoad),
  };
}

interface UseMenuScannerReturn {
  step: ScanStep;
  imageData: string | null;
  result: MenuScanResult | null;
  error: string | null;
  selectedItems: MenuItem[];
  // Analysis state
  isAnalyzing: boolean;
  isLoadingAIInsight: boolean;
  singleItemResult: AnalysisResult | null;
  comparisonResult: MultiComparisonResult | null;
  userFocuses: WellnessFocus[];
  // Actions
  setImageData: (data: string | null) => void;
  scanMenu: (base64: string) => Promise<void>;
  handleRetry: () => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  updateItemNutrition: (itemId: string, updates: Partial<MenuItem>) => void;
  getSelectedItems: () => MenuItem[];
  // Analysis actions
  analyzeSelected: () => Promise<void>;
  setUserFocuses: (focuses: WellnessFocus[]) => void;
  goBackToReview: () => void;
}

// Max items for comparison
const MAX_COMPARE_ITEMS = 4;

export function useMenuScanner(): UseMenuScannerReturn {
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<MenuScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAIInsight, setIsLoadingAIInsight] = useState(false);
  const [singleItemResult, setSingleItemResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<MultiComparisonResult | null>(null);
  const [aiInsight, setAiInsight] = useState<AIComparisonInsight | null>(null);
  const [userFocuses, setUserFocuses] = useState<WellnessFocus[]>(['balanced']);

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
    setSingleItemResult(null);
    setComparisonResult(null);
    setAiInsight(null);
    setStep('capture');
  }, []);

  const goBackToReview = useCallback(() => {
    setSingleItemResult(null);
    setComparisonResult(null);
    setAiInsight(null);
    setStep('review');
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    if (!result) return;

    const currentlySelected = result.menuItems.filter(i => i.isSelected).length;
    const isCurrentlySelected = result.menuItems.find(i => i.id === itemId)?.isSelected;

    // Enforce max limit (only when selecting, not deselecting)
    if (!isCurrentlySelected && currentlySelected >= MAX_COMPARE_ITEMS) {
      return; // Can't select more than 4
    }

    const updatedItems = result.menuItems.map((item) =>
      item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
    );

    setResult({ ...result, menuItems: updatedItems });
  }, [result]);

  const selectAllItems = useCallback(() => {
    if (!result) return;

    // Only select up to MAX_COMPARE_ITEMS
    let selectedCount = 0;
    const updatedItems = result.menuItems.map((item) => {
      if (selectedCount < MAX_COMPARE_ITEMS) {
        selectedCount++;
        return { ...item, isSelected: true };
      }
      return { ...item, isSelected: false };
    });

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

  // Build health profile from nutrition data
  // Priority: Database grades > Algorithmic fallback
  const createHealthProfile = useCallback((
    data: ExtendedNutritionData,
    intelligence?: FoodIntelligence
  ): FoodHealthProfile => {
    // Use shared buildFoodHealthProfile which prefers database grades
    const profile = buildFoodHealthProfile(data, userFocuses, intelligence);
    profile.aiRecommendation = generateAiRecommendation(profile);
    return profile;
  }, [userFocuses]);

  // Fetch AI insight for comparison
  const fetchAIInsight = useCallback(async (profiles: FoodHealthProfile[]) => {
    if (profiles.length < 2) return;

    setIsLoadingAIInsight(true);

    try {
      const functions = getFunctions();
      const compareFoodsAI = httpsCallable<
        { foods: Array<{ name: string; nutritionData: ExtendedNutritionData; grade: HealthGrade; focusScores: Record<WellnessFocus, number> }>; focuses: WellnessFocus[] },
        AIComparisonInsight
      >(functions, 'compareFoodsAI');

      const response = await compareFoodsAI({
        foods: profiles.map(p => ({
          name: p.name,
          nutritionData: {
            name: p.name,
            calories: p.calories,
            protein: p.protein,
            carbs: p.carbs,
            fat: p.fat,
            fiber: p.fiber,
            sugar: p.sugar,
            sodium: p.sodium,
            saturatedFat: p.saturatedFat,
            transFat: p.transFat,
            cholesterol: p.cholesterol,
            potassium: p.potassium,
          },
          grade: p.healthGrade,
          focusScores: p.focusScores,
        })),
        focuses: userFocuses,
      });

      setAiInsight(response.data);
    } catch (error) {
      console.error('Failed to get AI insight:', error);
      // AI insight is optional enhancement, not critical
    } finally {
      setIsLoadingAIInsight(false);
    }
  }, [userFocuses]);

  /**
   * Analyze selected items:
   * - 1 item: Get detailed nutrition (like Photo AI)
   * - 2-4 items: Get comparison analysis (like Food Compare)
   *
   * Uses the SAME flow as useMultiFoodComparison:
   * - Calls analyzeFoodText for each menu item to get full 35+ nutrient data
   * - Calls gradeFoodAI to get AI-based health grades
   * - Builds complete FoodHealthProfile with all data
   */
  const analyzeSelected = useCallback(async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    setIsAnalyzing(true);
    setStep('analyze');
    setSingleItemResult(null);
    setComparisonResult(null);
    setAiInsight(null);

    try {
      const functions = getFunctions();

      // Define the cloud function callables
      const analyzeFoodText = httpsCallable<
        { foodDescription: string },
        { items: ExtendedFoodItem[]; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number }
      >(functions, 'analyzeFoodText');

      if (selected.length === 1) {
        // Single item - get detailed nutrition analysis
        // Same flow as Photo AI / Text AI
        const item = selected[0];

        // Build a description from the menu item
        const description = item.description
          ? `${item.name}: ${item.description}`
          : item.name;

        const response = await analyzeFoodText({ foodDescription: description });
        const result = response.data;

        // The result is AnalysisResult-compatible
        // Convert the response to match AnalysisResult format
        const analysisResult: AnalysisResult = {
          items: result.items.map(foodItem => ({
            name: getShortFoodName(foodItem.name),
            quantity: 1, // Menu items are typically single serving
            unit: 'serving',
            confidence: 90, // Menu items don't have confidence from text analysis
            calories: foodItem.calories,
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fat: foodItem.fat,
            fiber: foodItem.fiber,
            sugar: foodItem.sugar,
            sodium: foodItem.sodium,
            saturatedFat: foodItem.saturatedFat,
            transFat: foodItem.transFat,
            monounsaturatedFat: foodItem.monounsaturatedFat,
            polyunsaturatedFat: foodItem.polyunsaturatedFat,
            cholesterol: foodItem.cholesterol,
            potassium: foodItem.potassium,
            calcium: foodItem.calcium,
            iron: foodItem.iron,
            vitaminA: foodItem.vitaminA,
            vitaminC: foodItem.vitaminC,
            vitaminD: foodItem.vitaminD,
            vitaminE: foodItem.vitaminE,
            vitaminK: foodItem.vitaminK,
            thiamin: foodItem.thiamin,
            riboflavin: foodItem.riboflavin,
            niacin: foodItem.niacin,
            vitaminB6: foodItem.vitaminB6,
            folate: foodItem.folate,
            vitaminB12: foodItem.vitaminB12,
            magnesium: foodItem.magnesium,
            phosphorus: foodItem.phosphorus,
            zinc: foodItem.zinc,
            copper: foodItem.copper,
            manganese: foodItem.manganese,
            selenium: foodItem.selenium,
            omega3: foodItem.omega3,
            omega6: foodItem.omega6,
            glycemicIndex: foodItem.glycemicIndex,
            glycemicLoad: foodItem.glycemicLoad,
          })),
          totalCalories: result.totalCalories,
          totalProtein: result.totalProtein,
          totalCarbs: result.totalCarbs,
          totalFat: result.totalFat,
          totalFiber: result.items.reduce((sum, i) => sum + (i.fiber ?? 0), 0),
          totalSugar: result.items.reduce((sum, i) => sum + (i.sugar ?? 0), 0),
          totalSodium: result.items.reduce((sum, i) => sum + (i.sodium ?? 0), 0),
          detailLevel: 'complete',
          mealType: 'lunch',
        };

        setSingleItemResult(analysisResult);
      } else {
        // Multiple items (2-4) - call AI for EACH item to get full nutrition data
        // This is the SAME flow as useMultiFoodComparison.analyzeAll()
        const profiles: FoodHealthProfile[] = [];

        // Analyze all items in parallel
        const analysisPromises = selected.map(async (item) => {
          try {
            // Build description from menu item
            const description = item.description
              ? `${item.name}: ${item.description}`
              : item.name;

            // Call AI to get full nutrition data (35+ nutrients)
            const response = await analyzeFoodText({ foodDescription: description });
            const result = response.data;

            let nutritionData: ExtendedNutritionData;
            let intelligence: FoodIntelligence | undefined;

            if (result.items.length === 1) {
              // Single item - extract all nutrients and intelligence
              const extracted = extractAllNutrients(result.items[0]);
              nutritionData = extracted.nutrition;
              intelligence = extracted.intelligence;
            } else {
              // Multiple items detected - combine them
              const combinedName = result.items.map((i) => i.name).join(' + ');
              nutritionData = combineNutrients(result.items, combinedName);
              // Use first item's intelligence for combined meals
              intelligence = result.items[0]?.intelligence;
            }

            return { success: true, nutritionData, intelligence };
          } catch (error) {
            console.error(`Analysis failed for ${item.name}:`, error);
            // Return a fallback using basic menu item data
            const fallbackData: ExtendedNutritionData = {
              name: getShortFoodName(item.name),
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbs: item.carbs || 0,
              fat: item.fat || 0,
              fiber: item.fiber || 0,
              sugar: item.sugar || 0,
              sodium: item.sodium || 0,
            };
            return { success: true, nutritionData: fallbackData, intelligence: undefined };
          }
        });

        const results = await Promise.all(analysisPromises);

        // Build health profiles from results using database grades when available
        for (const result of results) {
          if (result.success && result.nutritionData) {
            const profile = createHealthProfile(result.nutritionData, result.intelligence);
            profiles.push(profile);
          }
        }

        if (profiles.length < 2) {
          throw new Error('Not enough items could be analyzed');
        }

        // Build rankings (sorted by overallScore descending)
        const rankings = profiles
          .map((profile, index) => ({
            index,
            rank: 0,
            name: profile.name,
            grade: profile.healthGrade,
            score: profile.overallScore,
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));

        // Build category comparisons (same categories as Food Compare)
        const categories = [
          { key: 'calories', label: 'Calories', unit: '', lowerIsBetter: true },
          { key: 'protein', label: 'Protein', unit: 'g', lowerIsBetter: false },
          { key: 'fiber', label: 'Fiber', unit: 'g', lowerIsBetter: false },
          { key: 'sugar', label: 'Sugar', unit: 'g', lowerIsBetter: true },
          { key: 'sodium', label: 'Sodium', unit: 'mg', lowerIsBetter: true },
          { key: 'saturatedFat', label: 'Sat. Fat', unit: 'g', lowerIsBetter: true },
          { key: 'fat', label: 'Total Fat', unit: 'g', lowerIsBetter: true },
        ] as const;

        const categoryComparisons = categories.map(({ key, label, unit, lowerIsBetter }) => {
          const values = profiles.map((profile, index) => ({
            index,
            value: (profile[key] as number | undefined) ?? 0,
            unit,
          }));

          const sortedValues = [...values].sort((a, b) =>
            lowerIsBetter ? a.value - b.value : b.value - a.value
          );
          const bestIndex = sortedValues[0].index;

          return {
            category: label,
            bestIndex,
            values,
          };
        });

        // Set comparison result
        setComparisonResult({
          items: profiles,
          rankings,
          categoryComparisons,
          aiInsight: undefined, // Will be populated by fetchAIInsight
        });

        // Fetch AI insight after comparison is ready
        setIsAnalyzing(false);
        fetchAIInsight(profiles);
        return; // Early return since setIsAnalyzing is already handled
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('review');
    } finally {
      setIsAnalyzing(false);
    }
  }, [getSelectedItems, userFocuses, createHealthProfile, fetchAIInsight]);

  const selectedItems = result?.menuItems.filter((item) => item.isSelected) || [];

  // Merge AI insight into comparison result when available
  const comparisonResultWithInsight = useMemo((): MultiComparisonResult | null => {
    if (!comparisonResult) return null;
    return {
      ...comparisonResult,
      aiInsight: aiInsight ?? comparisonResult.aiInsight,
    };
  }, [comparisonResult, aiInsight]);

  return {
    step,
    imageData,
    result,
    error,
    selectedItems,
    isAnalyzing,
    isLoadingAIInsight,
    singleItemResult,
    comparisonResult: comparisonResultWithInsight,
    userFocuses,
    setImageData,
    scanMenu,
    handleRetry,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateItemNutrition,
    getSelectedItems,
    analyzeSelected,
    setUserFocuses,
    goBackToReview,
  };
}
