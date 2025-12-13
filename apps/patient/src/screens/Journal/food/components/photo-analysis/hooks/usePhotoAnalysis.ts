/**
 * usePhotoAnalysis Hook
 * State management and analysis logic - NO mock data fallback
 *
 * Note: Analysis always returns complete nutrition data (35+ nutrients).
 * The displayLevel is only used to filter what the UI shows to the user.
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import type {
  AnalysisResult,
  AnalyzedFood,
  MealType,
  AnalysisStep,
  NutritionDetailLevel,
  WellnessFocus,
  GradingResult,
  FoodInsight,
  GIResult,
} from '../types';

/**
 * V2 API response structure from analyzeFoodPhotoV2
 */
interface V2AnalyzedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedGrams: number;
  foodType: 'whole_food' | 'branded' | 'restaurant' | 'homemade';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    saturatedFat: number;
    transFat: number;
    monounsaturatedFat: number;
    polyunsaturatedFat: number;
    cholesterol: number;
    potassium: number;
    calcium: number;
    iron: number;
    magnesium: number;
    zinc: number;
    phosphorus: number;
    vitaminA: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminC: number;
    thiamin: number;
    riboflavin: number;
    niacin: number;
    vitaminB6: number;
    folate: number;
    vitaminB12: number;
    gi?: number;
    gl?: number;
    giBand?: 'low' | 'medium' | 'high';
    glBand?: 'low' | 'medium' | 'high';
  };
  nutritionSource: 'usda' | 'branded' | 'recipe' | 'ai_estimated';
  nutritionConfidence: number;
  gi?: GIResult;
  grading: GradingResult;
  insight?: FoodInsight;
}

interface V2AnalysisResponse {
  items: V2AnalyzedItem[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    saturatedFat: number;
    transFat: number;
    monounsaturatedFat: number;
    polyunsaturatedFat: number;
    cholesterol: number;
    potassium: number;
    calcium: number;
    iron: number;
    magnesium: number;
    zinc: number;
    phosphorus: number;
    vitaminA: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminC: number;
    thiamin: number;
    riboflavin: number;
    niacin: number;
    vitaminB6: number;
    folate: number;
    vitaminB12: number;
  };
  totalGI?: GIResult;
  userFocus: WellnessFocus;
  analyzedAt: string;
  version: string;
}

/**
 * Map V2 API response to our AnalysisResult format
 */
function mapV2ResponseToAnalysisResult(v2Response: V2AnalysisResponse, userFocus: WellnessFocus): AnalysisResult {
  const items: AnalyzedFood[] = v2Response.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    confidence: item.nutritionConfidence,
    // Flatten nutrition object
    calories: item.nutrition.calories,
    protein: item.nutrition.protein,
    carbs: item.nutrition.carbs,
    fat: item.nutrition.fat,
    fiber: item.nutrition.fiber,
    sugar: item.nutrition.sugar,
    sodium: item.nutrition.sodium,
    saturatedFat: item.nutrition.saturatedFat,
    transFat: item.nutrition.transFat,
    monounsaturatedFat: item.nutrition.monounsaturatedFat,
    polyunsaturatedFat: item.nutrition.polyunsaturatedFat,
    cholesterol: item.nutrition.cholesterol,
    potassium: item.nutrition.potassium,
    calcium: item.nutrition.calcium,
    iron: item.nutrition.iron,
    magnesium: item.nutrition.magnesium,
    zinc: item.nutrition.zinc,
    phosphorus: item.nutrition.phosphorus,
    vitaminA: item.nutrition.vitaminA,
    vitaminD: item.nutrition.vitaminD,
    vitaminE: item.nutrition.vitaminE,
    vitaminK: item.nutrition.vitaminK,
    vitaminC: item.nutrition.vitaminC,
    thiamin: item.nutrition.thiamin,
    riboflavin: item.nutrition.riboflavin,
    niacin: item.nutrition.niacin,
    vitaminB6: item.nutrition.vitaminB6,
    folate: item.nutrition.folate,
    vitaminB12: item.nutrition.vitaminB12,
    // GI data from enriched nutrition
    glycemicIndex: item.nutrition.gi,
    glycemicLoad: item.nutrition.gl,
    // V2-specific fields
    grading: item.grading,
    insight: item.insight,
    estimatedGrams: item.estimatedGrams,
    foodType: item.foodType,
    nutritionSource: item.nutritionSource,
    nutritionConfidence: item.nutritionConfidence,
  }));

  return {
    items,
    detailLevel: 'complete', // V2 always returns complete data
    // Macro totals
    totalCalories: v2Response.totals.calories,
    totalProtein: v2Response.totals.protein,
    totalCarbs: v2Response.totals.carbs,
    totalFat: v2Response.totals.fat,
    totalFiber: v2Response.totals.fiber,
    totalSugar: v2Response.totals.sugar,
    totalSodium: v2Response.totals.sodium,
    // Fat breakdown
    totalSaturatedFat: v2Response.totals.saturatedFat,
    totalTransFat: v2Response.totals.transFat,
    totalMonounsaturatedFat: v2Response.totals.monounsaturatedFat,
    totalPolyunsaturatedFat: v2Response.totals.polyunsaturatedFat,
    totalCholesterol: v2Response.totals.cholesterol,
    // Minerals
    totalPotassium: v2Response.totals.potassium,
    totalCalcium: v2Response.totals.calcium,
    totalIron: v2Response.totals.iron,
    totalMagnesium: v2Response.totals.magnesium,
    totalZinc: v2Response.totals.zinc,
    totalPhosphorus: v2Response.totals.phosphorus,
    // Vitamins
    totalVitaminA: v2Response.totals.vitaminA,
    totalVitaminD: v2Response.totals.vitaminD,
    totalVitaminE: v2Response.totals.vitaminE,
    totalVitaminK: v2Response.totals.vitaminK,
    totalVitaminC: v2Response.totals.vitaminC,
    totalThiamin: v2Response.totals.thiamin,
    totalRiboflavin: v2Response.totals.riboflavin,
    totalNiacin: v2Response.totals.niacin,
    totalVitaminB6: v2Response.totals.vitaminB6,
    totalFolate: v2Response.totals.folate,
    totalVitaminB12: v2Response.totals.vitaminB12,
    // Meal metadata
    mealType: v2Response.mealType,
    // V2 fields
    userFocus,
    totalGI: v2Response.totalGI,
    version: v2Response.version,
    analyzedAt: v2Response.analyzedAt,
  };
}

interface UsePhotoAnalysisReturn {
  step: AnalysisStep;
  imageData: string | null;
  result: AnalysisResult | null;
  error: string | null;
  isAnalyzing: boolean;
  selectedMealType: MealType;
  eatenAt: string;
  editingItem: number | null;
  displayLevel: NutritionDetailLevel;
  selectedFocus: WellnessFocus;
  setImageData: (data: string | null) => void;
  analyzeImage: (base64: string) => Promise<void>;
  handleRetry: () => void;
  handleUpdateItem: (index: number, updates: Partial<AnalyzedFood>) => void;
  handleRemoveItem: (index: number) => void;
  handlePortionChange: (index: number, newQuantity: number) => void;
  setSelectedMealType: (type: MealType) => void;
  setEatenAt: (time: string) => void;
  setEditingItem: (index: number | null) => void;
  setDisplayLevel: (level: NutritionDetailLevel) => void;
  setSelectedFocus: (focus: WellnessFocus) => void;
  getConfirmResult: () => AnalysisResult | null;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function recalculateTotals(items: AnalyzedFood[], detailLevel: NutritionDetailLevel): Partial<AnalysisResult> {
  const totals: Partial<AnalysisResult> = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
  };

  // Extended totals
  if (detailLevel !== 'essential') {
    totals.totalSaturatedFat = 0;
    totals.totalTransFat = 0;
    totals.totalCholesterol = 0;
    totals.totalPotassium = 0;
    totals.totalCalcium = 0;
    totals.totalIron = 0;
    totals.totalMagnesium = 0;
    totals.totalZinc = 0;
    totals.totalVitaminA = 0;
    totals.totalVitaminC = 0;
    totals.totalVitaminD = 0;
  }

  // Complete totals
  if (detailLevel === 'complete') {
    totals.totalMonounsaturatedFat = 0;
    totals.totalPolyunsaturatedFat = 0;
    totals.totalOmega3 = 0;
    totals.totalOmega6 = 0;
    totals.totalAddedSugar = 0;
    totals.totalPhosphorus = 0;
    totals.totalCopper = 0;
    totals.totalManganese = 0;
    totals.totalSelenium = 0;
    totals.totalVitaminE = 0;
    totals.totalVitaminK = 0;
    totals.totalThiamin = 0;
    totals.totalRiboflavin = 0;
    totals.totalNiacin = 0;
    totals.totalVitaminB6 = 0;
    totals.totalFolate = 0;
    totals.totalVitaminB12 = 0;
    totals.totalCholine = 0;
    totals.totalWater = 0;
    totals.totalCaffeine = 0;
  }

  for (const item of items) {
    // Essential
    totals.totalCalories = (totals.totalCalories ?? 0) + item.calories;
    totals.totalProtein = (totals.totalProtein ?? 0) + item.protein;
    totals.totalCarbs = (totals.totalCarbs ?? 0) + item.carbs;
    totals.totalFat = (totals.totalFat ?? 0) + item.fat;
    totals.totalFiber = (totals.totalFiber ?? 0) + (item.fiber ?? 0);
    totals.totalSugar = (totals.totalSugar ?? 0) + (item.sugar ?? 0);
    totals.totalSodium = (totals.totalSodium ?? 0) + (item.sodium ?? 0);

    // Extended
    if (detailLevel !== 'essential') {
      totals.totalSaturatedFat = (totals.totalSaturatedFat ?? 0) + (item.saturatedFat ?? 0);
      totals.totalTransFat = (totals.totalTransFat ?? 0) + (item.transFat ?? 0);
      totals.totalCholesterol = (totals.totalCholesterol ?? 0) + (item.cholesterol ?? 0);
      totals.totalPotassium = (totals.totalPotassium ?? 0) + (item.potassium ?? 0);
      totals.totalCalcium = (totals.totalCalcium ?? 0) + (item.calcium ?? 0);
      totals.totalIron = (totals.totalIron ?? 0) + (item.iron ?? 0);
      totals.totalMagnesium = (totals.totalMagnesium ?? 0) + (item.magnesium ?? 0);
      totals.totalZinc = (totals.totalZinc ?? 0) + (item.zinc ?? 0);
      totals.totalVitaminA = (totals.totalVitaminA ?? 0) + (item.vitaminA ?? 0);
      totals.totalVitaminC = (totals.totalVitaminC ?? 0) + (item.vitaminC ?? 0);
      totals.totalVitaminD = (totals.totalVitaminD ?? 0) + (item.vitaminD ?? 0);
    }

    // Complete
    if (detailLevel === 'complete') {
      totals.totalMonounsaturatedFat = (totals.totalMonounsaturatedFat ?? 0) + (item.monounsaturatedFat ?? 0);
      totals.totalPolyunsaturatedFat = (totals.totalPolyunsaturatedFat ?? 0) + (item.polyunsaturatedFat ?? 0);
      totals.totalOmega3 = (totals.totalOmega3 ?? 0) + (item.omega3 ?? 0);
      totals.totalOmega6 = (totals.totalOmega6 ?? 0) + (item.omega6 ?? 0);
      totals.totalAddedSugar = (totals.totalAddedSugar ?? 0) + (item.addedSugar ?? 0);
      totals.totalPhosphorus = (totals.totalPhosphorus ?? 0) + (item.phosphorus ?? 0);
      totals.totalCopper = (totals.totalCopper ?? 0) + (item.copper ?? 0);
      totals.totalManganese = (totals.totalManganese ?? 0) + (item.manganese ?? 0);
      totals.totalSelenium = (totals.totalSelenium ?? 0) + (item.selenium ?? 0);
      totals.totalVitaminE = (totals.totalVitaminE ?? 0) + (item.vitaminE ?? 0);
      totals.totalVitaminK = (totals.totalVitaminK ?? 0) + (item.vitaminK ?? 0);
      totals.totalThiamin = (totals.totalThiamin ?? 0) + (item.thiamin ?? 0);
      totals.totalRiboflavin = (totals.totalRiboflavin ?? 0) + (item.riboflavin ?? 0);
      totals.totalNiacin = (totals.totalNiacin ?? 0) + (item.niacin ?? 0);
      totals.totalVitaminB6 = (totals.totalVitaminB6 ?? 0) + (item.vitaminB6 ?? 0);
      totals.totalFolate = (totals.totalFolate ?? 0) + (item.folate ?? 0);
      totals.totalVitaminB12 = (totals.totalVitaminB12 ?? 0) + (item.vitaminB12 ?? 0);
      totals.totalCholine = (totals.totalCholine ?? 0) + (item.choline ?? 0);
      totals.totalWater = (totals.totalWater ?? 0) + (item.water ?? 0);
      totals.totalCaffeine = (totals.totalCaffeine ?? 0) + (item.caffeine ?? 0);
    }
  }

  return totals;
}

export function usePhotoAnalysis(): UsePhotoAnalysisReturn {
  const [step, setStep] = useState<AnalysisStep>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [eatenAt, setEatenAt] = useState<string>(getCurrentTime);
  // Display level controls UI filtering only - analysis always returns complete data
  const [displayLevel, setDisplayLevel] = useState<NutritionDetailLevel>('essential');
  // Wellness focus for health grading
  const [selectedFocus, setSelectedFocus] = useState<WellnessFocus>('balanced');

  const analyzeImage = useCallback(async (base64: string) => {
    setStep('analyzing');
    setError(null);
    setIsAnalyzing(true);

    try {
      const functions = getFunctions();
      // Use V2 endpoint with user focus and AI insights
      const analyzeFn = httpsCallable<
        { imageBase64: string; userFocus: WellnessFocus; generateInsights: boolean },
        V2AnalysisResponse
      >(functions, 'analyzeFoodPhotoV2');

      const imageContent = base64.split(',')[1];
      // Note: Analysis always returns complete nutrition data (35+ nutrients)
      // The displayLevel only controls what the UI shows after analysis
      const response = await analyzeFn({
        imageBase64: imageContent,
        userFocus: selectedFocus,
        generateInsights: true,
      });

      // Map v2 response to our AnalysisResult format
      const mappedResult = mapV2ResponseToAnalysisResult(response.data, selectedFocus);
      setResult(mappedResult);

      if (mappedResult.mealType && mappedResult.mealType !== 'unknown') {
        setSelectedMealType(mappedResult.mealType as MealType);
      }
      setStep('review');
    } catch (err) {
      console.error('Analysis failed:', err);
      // NO mock data fallback - show error to user
      // Firebase callable functions wrap errors - extract the actual message
      let errorMessage = 'Failed to analyze food photo. Please try again.';
      if (err && typeof err === 'object') {
        // Firebase errors have a 'message' property with the actual error
        const firebaseErr = err as { message?: string; details?: string };
        if (firebaseErr.message) {
          // Check if it's a "no food detected" type error
          if (firebaseErr.message.toLowerCase().includes('no food')) {
            errorMessage = firebaseErr.message;
          } else if (firebaseErr.message.includes('internal')) {
            // Generic internal error - provide helpful message
            errorMessage = 'Could not analyze this image. Please try a clearer photo of food.';
          } else {
            errorMessage = firebaseErr.message;
          }
        }
      }
      setError(errorMessage);
      setStep('capture'); // Go back to capture step on error
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFocus]);

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
    const totals = recalculateTotals(newItems, result.detailLevel);

    setResult({ ...result, items: newItems, ...totals });
  }, [result]);

  const handleRemoveItem = useCallback((index: number) => {
    if (!result) return;

    const newItems = result.items.filter((_, i) => i !== index);
    const totals = recalculateTotals(newItems, result.detailLevel);

    setResult({ ...result, items: newItems, ...totals });
  }, [result]);

  const handlePortionChange = useCallback((index: number, newQuantity: number) => {
    if (!result || newQuantity <= 0) return;

    const item = result.items[index];
    const multiplier = newQuantity / item.quantity;

    // Scale all numeric nutritional values
    const updatedItem: AnalyzedFood = {
      ...item,
      quantity: newQuantity,
      calories: Math.round(item.calories * multiplier),
      protein: Math.round(item.protein * multiplier * 10) / 10,
      carbs: Math.round(item.carbs * multiplier * 10) / 10,
      fat: Math.round(item.fat * multiplier * 10) / 10,
      fiber: item.fiber ? Math.round(item.fiber * multiplier * 10) / 10 : undefined,
      sugar: item.sugar ? Math.round(item.sugar * multiplier * 10) / 10 : undefined,
      sodium: item.sodium ? Math.round(item.sodium * multiplier) : undefined,
      // Extended nutrients
      saturatedFat: item.saturatedFat ? Math.round(item.saturatedFat * multiplier * 10) / 10 : undefined,
      cholesterol: item.cholesterol ? Math.round(item.cholesterol * multiplier) : undefined,
      potassium: item.potassium ? Math.round(item.potassium * multiplier) : undefined,
      calcium: item.calcium ? Math.round(item.calcium * multiplier) : undefined,
      iron: item.iron ? Math.round(item.iron * multiplier * 10) / 10 : undefined,
      // Add more as needed...
    };

    const newItems = [...result.items];
    newItems[index] = updatedItem;

    const totals = recalculateTotals(newItems, result.detailLevel);
    setResult({ ...result, items: newItems, ...totals });
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
    isAnalyzing,
    selectedMealType,
    eatenAt,
    editingItem,
    displayLevel,
    selectedFocus,
    setImageData,
    analyzeImage,
    handleRetry,
    handleUpdateItem,
    handleRemoveItem,
    handlePortionChange,
    setSelectedMealType,
    setEatenAt,
    setEditingItem,
    setDisplayLevel,
    setSelectedFocus,
    getConfirmResult,
  };
}
