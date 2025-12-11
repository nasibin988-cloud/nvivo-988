/**
 * useMultiFoodComparison Hook
 * State management for comparing multiple food items (2-5)
 * Supports parallel analysis with focus-based scoring
 */

import { useState, useCallback, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import type {
  FoodInputItem,
  ExtendedNutritionData,
  FoodHealthProfile,
  MultiComparisonResult,
  WellnessFocus,
  HealthGrade,
  AIComparisonInsight,
  AIGradingResult,
} from '../types';
import {
  calculateHealthGrade,
  calculateNutrientScores,
  calculateFocusImpacts,
  calculateConditionImpacts,
  generateAlternatives,
  generateAiRecommendation,
} from '../utils';

const MAX_ITEMS = 5;
const MIN_ITEMS_FOR_COMPARE = 2;

function generateId(): string {
  return `food-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyItem(): FoodInputItem {
  return {
    id: generateId(),
    inputMethod: null,
    status: 'empty',
  };
}

/**
 * Helper to extract all extended nutrition data from a food item
 * Handles undefined values gracefully
 */
function extractAllNutrients(food: ExtendedFoodItem): ExtendedNutritionData {
  return {
    name: food.name,
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
}

/**
 * Helper to combine nutrients from multiple food items
 */
function combineNutrients(items: ExtendedFoodItem[], combinedName: string): ExtendedNutritionData {
  const sumOptional = (getter: (item: ExtendedFoodItem) => number | undefined): number | undefined => {
    const sum = items.reduce((acc, item) => acc + (getter(item) ?? 0), 0);
    return sum > 0 ? sum : undefined;
  };

  return {
    name: combinedName.length > 40 ? combinedName.slice(0, 37) + '...' : combinedName,
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

// Extended nutrition data from cloud function (complete nutrients)
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
}

interface UseMultiFoodComparisonReturn {
  items: FoodInputItem[];
  userFocuses: WellnessFocus[];
  isAnalyzing: boolean;
  isLoadingAIInsight: boolean;
  canAddMore: boolean;
  canCompare: boolean;
  comparisonResult: MultiComparisonResult | null;
  aiInsight: AIComparisonInsight | null;
  // Item management
  addItem: () => void;
  removeItem: (id: string) => void;
  resetItem: (id: string) => void;
  // Set input data
  setPhotoData: (id: string, imageData: string) => void;
  setTextData: (id: string, text: string) => void;
  setManualData: (id: string, data: ExtendedNutritionData) => void;
  // Analysis
  analyzeAll: () => Promise<void>;
  // Settings
  setUserFocuses: (focuses: WellnessFocus[]) => void;
  // Reset
  resetAll: () => void;
}

export function useMultiFoodComparison(): UseMultiFoodComparisonReturn {
  const [items, setItems] = useState<FoodInputItem[]>([
    createEmptyItem(),
    createEmptyItem(),
  ]);
  const [userFocuses, setUserFocuses] = useState<WellnessFocus[]>(['balanced']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAIInsight, setIsLoadingAIInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIComparisonInsight | null>(null);

  const canAddMore = items.length < MAX_ITEMS;
  const readyItems = items.filter((item) => item.status === 'ready');
  const canCompare = readyItems.length >= MIN_ITEMS_FOR_COMPARE;

  // Add a new empty item
  const addItem = useCallback(() => {
    if (items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, createEmptyItem()]);
  }, [items.length]);

  // Remove an item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length < 2) {
        return [filtered[0] || createEmptyItem(), createEmptyItem()];
      }
      return filtered;
    });
    setAiInsight(null);
  }, []);

  // Reset an item to empty
  const resetItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...createEmptyItem(), id } : item
      )
    );
    setAiInsight(null);
  }, []);

  // Set photo data for an item
  const setPhotoData = useCallback((id: string, imageData: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              inputMethod: 'photo',
              imageData,
              status: 'pending',
              error: undefined,
            }
          : item
      )
    );
    setAiInsight(null);
  }, []);

  // Set text description for an item
  const setTextData = useCallback((id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              inputMethod: 'text',
              textDescription: text,
              status: 'pending',
              error: undefined,
            }
          : item
      )
    );
    setAiInsight(null);
  }, []);

  // Build health profile from nutrition data
  // Uses AI grading when available, falls back to algorithmic grading
  const buildHealthProfile = useCallback((
    data: ExtendedNutritionData,
    aiGrading?: AIGradingResult
  ): FoodHealthProfile => {
    // Get the currently selected focus (single selection)
    const selectedFocus = userFocuses[0] || 'balanced';

    // Use AI grades when available, otherwise fall back to algorithmic
    let grade: HealthGrade;
    let reason: string;
    let overallScore: number;
    let focusScores: Record<WellnessFocus, number>;

    if (aiGrading) {
      // Use AI-provided grades
      grade = aiGrading.focusGrades[selectedFocus] || aiGrading.overallGrade;
      reason = aiGrading.primaryConcerns.length > 0
        ? `${aiGrading.primaryConcerns[0]}`
        : aiGrading.strengths.length > 0
          ? `${aiGrading.strengths[0]}`
          : 'AI-graded for your wellness focus';

      // Convert letter grades to scores for display
      const gradeToScore: Record<HealthGrade, number> = { A: 90, B: 75, C: 60, D: 40, F: 20 };
      overallScore = gradeToScore[grade];

      // Build focus scores from AI grades
      focusScores = {} as Record<WellnessFocus, number>;
      const allFocuses: WellnessFocus[] = [
        'balanced', 'muscle_building', 'heart_health', 'energy_endurance',
        'weight_management', 'brain_focus', 'gut_health', 'blood_sugar_balance',
        'bone_joint_support', 'anti_inflammatory'
      ];
      for (const focus of allFocuses) {
        const focusGrade = aiGrading.focusGrades[focus] || 'C';
        focusScores[focus] = gradeToScore[focusGrade];
      }
    } else {
      // Fall back to algorithmic grading
      const algorithmicResult = calculateHealthGrade(data, userFocuses);
      grade = algorithmicResult.grade;
      reason = algorithmicResult.reason;
      overallScore = algorithmicResult.overallScore;
      focusScores = algorithmicResult.focusScores;
    }

    const nutrientScores = calculateNutrientScores(data);
    const focusImpacts = calculateFocusImpacts(data, userFocuses);
    const conditionImpacts = calculateConditionImpacts(data, []);

    const profile: FoodHealthProfile = {
      ...data,
      aiGrading,
      healthGrade: grade,
      gradeReason: reason,
      overallScore,
      focusScores,
      nutrientScores,
      focusImpacts,
      conditionImpacts,
      alternatives: generateAlternatives({ ...data, healthGrade: grade }),
    };
    profile.aiRecommendation = generateAiRecommendation(profile);

    return profile;
  }, [userFocuses]);

  // Set manual nutrition data for an item
  const setManualData = useCallback((id: string, data: ExtendedNutritionData) => {
    const profile = buildHealthProfile(data);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              inputMethod: 'manual',
              nutritionData: data,
              healthProfile: profile,
              status: 'ready',
              error: undefined,
            }
          : item
      )
    );
    setAiInsight(null);
  }, [buildHealthProfile]);

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

  // Analyze all pending items in parallel
  const analyzeAll = useCallback(async () => {
    const pendingItems = items.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsAnalyzing(true);
    setAiInsight(null);

    // Mark all pending items as analyzing
    setItems((prev) =>
      prev.map((item) =>
        item.status === 'pending' ? { ...item, status: 'analyzing' } : item
      )
    );

    const functions = getFunctions();
    const analyzeFoodPhoto = httpsCallable<
      { imageBase64: string },
      { items: ExtendedFoodItem[] }
    >(functions, 'analyzeFoodPhoto');

    const analyzeFoodText = httpsCallable<
      { description: string },
      { items: ExtendedFoodItem[]; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number }
    >(functions, 'analyzeFoodText');

    const gradeFoodAI = httpsCallable<
      { nutrition: ExtendedNutritionData },
      AIGradingResult
    >(functions, 'gradeFoodAI');

    // Analyze all items in parallel
    const analysisPromises = pendingItems.map(async (item) => {
      try {
        let nutritionData: ExtendedNutritionData;

        if (item.inputMethod === 'photo' && item.imageData) {
          const imageContent = item.imageData.split(',')[1];
          const response = await analyzeFoodPhoto({ imageBase64: imageContent });
          const result = response.data;

          if (result.items.length === 1) {
            // Single item - extract all nutrients
            nutritionData = extractAllNutrients(result.items[0]);
          } else {
            // Multiple items - combine all nutrients
            const combinedName = result.items.map((i) => i.name).join(' + ');
            nutritionData = combineNutrients(result.items, combinedName);
          }
        } else if (item.inputMethod === 'text' && item.textDescription) {
          const response = await analyzeFoodText({ description: item.textDescription });
          const result = response.data;

          if (result.items.length === 1) {
            // Single item - extract all nutrients
            nutritionData = extractAllNutrients(result.items[0]);
          } else {
            // Multiple items - combine all nutrients
            const combinedName = result.items.map((i) => i.name).join(' + ');
            nutritionData = combineNutrients(result.items, combinedName);
          }
        } else {
          throw new Error('Invalid input method');
        }

        // Get AI grading for this food (parallel with nutrition analysis is done above)
        let aiGrading: AIGradingResult | undefined;
        try {
          const gradingResponse = await gradeFoodAI({ nutrition: nutritionData });
          aiGrading = gradingResponse.data;
        } catch (gradingError) {
          console.warn('AI grading failed, using fallback:', gradingError);
          // Continue without AI grading - buildHealthProfile will use algorithmic fallback
        }

        const profile = buildHealthProfile(nutritionData, aiGrading);
        return { id: item.id, success: true, nutritionData, healthProfile: profile };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        return { id: item.id, success: false, error: errorMessage };
      }
    });

    const results = await Promise.all(analysisPromises);

    // Update items with results
    setItems((prev) =>
      prev.map((item) => {
        const result = results.find((r) => r.id === item.id);
        if (!result) return item;

        if (result.success && 'nutritionData' in result) {
          return {
            ...item,
            nutritionData: result.nutritionData,
            healthProfile: result.healthProfile,
            status: 'ready' as const,
            error: undefined,
          };
        } else {
          return {
            ...item,
            status: 'error' as const,
            error: result.error,
          };
        }
      })
    );

    setIsAnalyzing(false);

    // Fetch AI insight after analysis
    const successfulProfiles = results
      .filter((r): r is typeof r & { success: true; healthProfile: FoodHealthProfile } => r.success && 'healthProfile' in r)
      .map(r => r.healthProfile);

    // Add existing ready items to the profiles
    const existingProfiles = items
      .filter(i => i.status === 'ready' && i.healthProfile)
      .map(i => i.healthProfile!);

    const allProfiles = [...existingProfiles, ...successfulProfiles];

    if (allProfiles.length >= 2) {
      fetchAIInsight(allProfiles);
    }
  }, [items, buildHealthProfile, fetchAIInsight]);

  // Calculate comparison result
  const comparisonResult = useMemo((): MultiComparisonResult | null => {
    if (readyItems.length < MIN_ITEMS_FOR_COMPARE) return null;

    const profiles = readyItems
      .map((item) => item.healthProfile)
      .filter((p): p is FoodHealthProfile => p !== undefined);

    if (profiles.length < MIN_ITEMS_FOR_COMPARE) return null;

    // Calculate rankings based on overall score (instead of just grade)
    const rankings = profiles
      .map((profile, index) => ({
        index,
        name: profile.name,
        grade: profile.healthGrade,
        score: profile.overallScore,
      }))
      .sort((a, b) => b.score - a.score) // Higher score is better
      .map((item, rank) => ({
        index: item.index,
        rank: rank + 1,
        name: item.name,
        grade: item.grade,
        score: item.score,
      }));

    // Calculate category comparisons
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

    return {
      items: profiles,
      rankings,
      categoryComparisons,
      aiInsight: aiInsight ?? undefined,
    };
  }, [readyItems, aiInsight]);

  // Reset everything
  const resetAll = useCallback(() => {
    setItems([createEmptyItem(), createEmptyItem()]);
    setIsAnalyzing(false);
    setAiInsight(null);
  }, []);

  return {
    items,
    userFocuses,
    isAnalyzing,
    isLoadingAIInsight,
    canAddMore,
    canCompare,
    comparisonResult,
    aiInsight,
    addItem,
    removeItem,
    resetItem,
    setPhotoData,
    setTextData,
    setManualData,
    analyzeAll,
    setUserFocuses,
    resetAll,
  };
}
