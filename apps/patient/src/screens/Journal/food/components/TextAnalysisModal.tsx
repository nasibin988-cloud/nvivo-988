/**
 * TextAnalysisModal - AI-powered food analysis from text description
 * Output format matches PhotoAnalysisModal (minus confidence %)
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wand2, AlertCircle, Edit3, Check } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { AnalysisResult, AnalyzedFood, MealType, NutritionDetailLevel } from './photo-analysis/types';
import type { WellnessFocus } from './food-comparison/types';
import NutritionSummary from './photo-analysis/components/NutritionSummary';
import MealTypeSelector from './photo-analysis/components/MealTypeSelector';
import TextFoodItemCard from './TextFoodItemCard';
import { AnalyzingAnimation, MealGradeCard } from './shared';
import { FocusSelector } from './food-comparison/components/FocusSelector';

interface TextAnalysisModalProps {
  onClose: () => void;
  onConfirm: (result: AnalysisResult) => void;
}

type AnalysisStep = 'input' | 'manual' | 'analyzing' | 'review' | 'error';

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function recalculateTotals(items: AnalyzedFood[]): Partial<AnalysisResult> {
  const sum = (fn: (item: AnalyzedFood) => number | undefined) =>
    items.reduce((acc, item) => acc + (fn(item) ?? 0), 0);
  const round = (n: number, decimals = 1) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);

  return {
    // Essential
    totalCalories: Math.round(sum(i => i.calories)),
    totalProtein: round(sum(i => i.protein)),
    totalCarbs: round(sum(i => i.carbs)),
    totalFat: round(sum(i => i.fat)),
    totalFiber: round(sum(i => i.fiber)),
    totalSugar: round(sum(i => i.sugar)),
    totalSodium: Math.round(sum(i => i.sodium)),

    // Extended - Fat breakdown
    totalSaturatedFat: round(sum(i => i.saturatedFat)),
    totalTransFat: round(sum(i => i.transFat)),
    totalCholesterol: Math.round(sum(i => i.cholesterol)),
    totalMonounsaturatedFat: round(sum(i => i.monounsaturatedFat)),
    totalPolyunsaturatedFat: round(sum(i => i.polyunsaturatedFat)),

    // Minerals
    totalPotassium: Math.round(sum(i => i.potassium)),
    totalCalcium: Math.round(sum(i => i.calcium)),
    totalIron: round(sum(i => i.iron)),
    totalMagnesium: Math.round(sum(i => i.magnesium)),
    totalZinc: round(sum(i => i.zinc)),
    totalPhosphorus: Math.round(sum(i => i.phosphorus)),
    totalSelenium: round(sum(i => i.selenium)),
    totalCopper: round(sum(i => i.copper), 2),
    totalManganese: round(sum(i => i.manganese), 2),

    // Vitamins
    totalVitaminA: round(sum(i => i.vitaminA)),
    totalVitaminC: round(sum(i => i.vitaminC)),
    totalVitaminD: round(sum(i => i.vitaminD)),
    totalVitaminE: round(sum(i => i.vitaminE)),
    totalVitaminK: round(sum(i => i.vitaminK)),
    totalThiamin: round(sum(i => i.thiamin), 2),
    totalRiboflavin: round(sum(i => i.riboflavin), 2),
    totalNiacin: round(sum(i => i.niacin)),
    totalVitaminB6: round(sum(i => i.vitaminB6), 2),
    totalFolate: round(sum(i => i.folate)),
    totalVitaminB12: round(sum(i => i.vitaminB12), 2),
    totalCholine: round(sum(i => i.choline)),

    // Other
    totalCaffeine: round(sum(i => i.caffeine)),
    totalWater: round(sum(i => i.water)),
  };
}

export function TextAnalysisModal({ onClose, onConfirm }: TextAnalysisModalProps): React.ReactElement {
  const [step, setStep] = useState<AnalysisStep>('input');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [eatenAt, setEatenAt] = useState<string>(getCurrentTime);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [displayLevel, setDisplayLevel] = useState<NutritionDetailLevel>('essential');
  const [selectedFocus, setSelectedFocus] = useState<WellnessFocus>('balanced');
  const [manualData, setManualData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
  });

  const handleAnalyze = async () => {
    if (!description.trim()) return;

    setStep('analyzing');
    setError(null);

    try {
      const functions = getFunctions();
      // Use AnalysisResult type directly - server returns complete nutrition data (35+ nutrients)
      const analyzeFoodText = httpsCallable<
        { foodDescription: string },
        AnalysisResult & { description?: string; source?: string }
      >(functions, 'analyzeFoodText');

      const response = await analyzeFoodText({ foodDescription: description.trim() });
      const data = response.data;

      // Build full AnalysisResult from response - spread all fields to capture vitamins, minerals, etc.
      const analysisResult: AnalysisResult = {
        ...data,
        // Override items to set confidence to 1 (no uncertainty badge for text-based)
        items: data.items.map(item => ({
          ...item,
          confidence: item.confidence ?? 1,
          quantity: item.quantity || 1,
          unit: item.unit || 'serving',
        })),
        // Ensure detailLevel is set for the display toggle
        detailLevel: data.detailLevel || 'complete',
        // Ensure mealType defaults to lunch if not detected
        mealType: data.mealType || 'lunch',
      };

      setResult(analysisResult);
      if (analysisResult.mealType && analysisResult.mealType !== 'unknown') {
        setSelectedMealType(analysisResult.mealType as MealType);
      }
      setStep('review');
    } catch (err) {
      console.error('Text analysis error:', err);
      let errorMessage = 'Failed to analyze food description. Please try again.';
      if (err && typeof err === 'object') {
        const firebaseErr = err as { message?: string };
        if (firebaseErr.message) {
          errorMessage = firebaseErr.message;
        }
      }
      setError(errorMessage);
      setStep('error');
    }
  };

  const handleRetry = useCallback(() => {
    setResult(null);
    setError(null);
    setStep('input');
  }, []);

  const handleUpdateItem = useCallback((index: number, updates: Partial<AnalyzedFood>) => {
    if (!result) return;

    const newItems = [...result.items];
    newItems[index] = { ...newItems[index], ...updates };
    const totals = recalculateTotals(newItems);

    setResult({ ...result, items: newItems, ...totals });
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
      sugar: item.sugar ? Math.round(item.sugar * multiplier * 10) / 10 : undefined,
      sodium: item.sodium ? Math.round(item.sodium * multiplier) : undefined,
    };

    const newItems = [...result.items];
    newItems[index] = updatedItem;

    const totals = recalculateTotals(newItems);
    setResult({ ...result, items: newItems, ...totals });
  }, [result]);

  const handleConfirm = () => {
    if (!result) return;
    onConfirm({
      ...result,
      mealType: selectedMealType,
      eatenAt,
    });
    onClose();
  };

  const handleManualSubmit = () => {
    if (!manualData.name || !manualData.calories) return;

    const manualItem: AnalyzedFood = {
      name: manualData.name.trim(),
      calories: parseInt(manualData.calories) || 0,
      protein: parseInt(manualData.protein) || 0,
      carbs: parseInt(manualData.carbs) || 0,
      fat: parseInt(manualData.fat) || 0,
      fiber: parseInt(manualData.fiber) || undefined,
      sugar: parseInt(manualData.sugar) || undefined,
      confidence: 1,
      quantity: 1,
      unit: 'serving',
    };

    const manualResult: AnalysisResult = {
      items: [manualItem],
      detailLevel: 'essential',
      totalCalories: manualItem.calories,
      totalProtein: manualItem.protein,
      totalCarbs: manualItem.carbs,
      totalFat: manualItem.fat,
      totalFiber: manualItem.fiber,
      totalSugar: manualItem.sugar,
      mealType: selectedMealType,
      eatenAt,
    };

    onConfirm(manualResult);
    onClose();
  };

  const getStepDescription = (): string => {
    switch (step) {
      case 'input':
        return 'Describe what you ate';
      case 'manual':
        return 'Enter nutrition manually';
      case 'analyzing':
        return 'Analyzing your food...';
      case 'review':
        return 'Review & adjust results';
      case 'error':
        return 'Analysis failed';
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md" style={{ width: '100vw', height: '100vh' }}>
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r from-violet-500/[0.08] via-purple-500/[0.05] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/90 to-purple-600/90 text-white shadow-lg shadow-violet-500/20">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Describe AI</h2>
              <p className="text-xs text-text-muted">{getStepDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Input Step */}
          {step === 'input' && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  What did you eat?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., grilled chicken breast with rice and steamed broccoli"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-violet-500/30 resize-none"
                  rows={3}
                  autoFocus
                />
              </div>

              <MealTypeSelector
                selectedMealType={selectedMealType}
                eatenAt={eatenAt}
                onMealTypeChange={setSelectedMealType}
                onTimeChange={setEatenAt}
              />

              {/* Focus Selector - shown before analysis */}
              <FocusSelector
                selectedFocus={selectedFocus}
                onFocusChange={setSelectedFocus}
                colorTheme="violet"
              />

              {/* Manual Entry Option */}
              <button
                onClick={() => setStep('manual')}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={14} />
                Enter nutrition manually instead
              </button>
            </div>
          )}

          {/* Manual Entry Step */}
          {step === 'manual' && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  value={manualData.name}
                  onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Grilled Chicken Salad"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30"
                  autoFocus
                />
              </div>

              <MealTypeSelector
                selectedMealType={selectedMealType}
                eatenAt={eatenAt}
                onMealTypeChange={setSelectedMealType}
                onTimeChange={setEatenAt}
              />

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Nutrition Info
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'calories', label: 'Calories', unit: '', required: true },
                    { key: 'protein', label: 'Protein', unit: 'g', required: false },
                    { key: 'carbs', label: 'Carbs', unit: 'g', required: false },
                    { key: 'fat', label: 'Fat', unit: 'g', required: false },
                    { key: 'fiber', label: 'Fiber', unit: 'g', required: false },
                    { key: 'sugar', label: 'Sugar', unit: 'g', required: false },
                  ].map(({ key, label, unit, required }) => (
                    <div key={key} className="relative">
                      <input
                        type="number"
                        value={manualData[key as keyof typeof manualData]}
                        onChange={(e) => setManualData(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={label + (required ? ' *' : '')}
                        className="w-full px-3 py-2 pr-8 rounded-lg text-sm bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30"
                      />
                      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Back to AI option */}
              <button
                onClick={() => setStep('input')}
                className="w-full py-2 rounded-lg text-xs font-medium text-text-muted hover:text-violet-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Wand2 size={12} />
                Use AI description instead
              </button>
            </div>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <AnalyzingAnimation
              icon={Wand2}
              title="Analyzing your food..."
              subtitle="AI is estimating the nutritional content"
              colorTheme="violet"
            />
          )}

          {/* Review Step */}
          {step === 'review' && result && (
            <div className="p-5 space-y-4">
              {/* Description preview (like image preview in photo modal) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] relative">
                <p className="text-sm text-text-primary italic">"{description}"</p>
                <button
                  onClick={handleRetry}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-colors"
                >
                  <Edit3 size={12} />
                </button>
              </div>

              {/* Meal Type & Time Selection */}
              <MealTypeSelector
                selectedMealType={selectedMealType}
                eatenAt={eatenAt}
                onMealTypeChange={setSelectedMealType}
                onTimeChange={setEatenAt}
              />

              {/* Health Grade based on focus - uses food intelligence data */}
              {(() => {
                // Get the primary food item (highest calories) for intelligence data
                const primaryItem = result.items.reduce<AnalyzedFood | null>(
                  (max, item) => (!max || item.calories > max.calories ? item : max),
                  null
                );
                const intelligence = primaryItem?.intelligence ?? null;
                const foodName = result.items.length === 1 ? primaryItem?.name : undefined;

                return (
                  <MealGradeCard
                    intelligence={intelligence}
                    foodName={foodName}
                    focus={selectedFocus}
                  />
                );
              })()}

              {/* Total summary - with toggleable detail level */}
              <NutritionSummary
                result={result}
                displayLevel={displayLevel}
                onDisplayLevelChange={setDisplayLevel}
              />

              {/* Detected items */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Detected Items ({result.items.length})
                </p>
                {result.items.map((item, index) => (
                  <TextFoodItemCard
                    key={index}
                    item={item}
                    index={index}
                    isEditing={editingItem === index}
                    onToggleEdit={() => setEditingItem(editingItem === index ? null : index)}
                    onUpdate={(updates) => handleUpdateItem(index, updates)}
                    onPortionChange={(qty) => handlePortionChange(index, qty)}
                    onRemove={() => handleRemoveItem(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">Analysis Failed</p>
              <p className="text-xs text-text-muted text-center max-w-xs mb-4">
                {error || 'Unable to analyze your food description. Please try again.'}
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] shrink-0">
          {step === 'input' && (
            <button
              onClick={handleAnalyze}
              disabled={!description.trim()}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                description.trim()
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
            >
              <Wand2 size={16} />
              Analyze Food
            </button>
          )}

          {step === 'manual' && (
            <button
              onClick={handleManualSubmit}
              disabled={!manualData.name || !manualData.calories}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                manualData.name && manualData.calories
                  ? 'bg-white/[0.06] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
            >
              <Check size={16} />
              Add to Food Log
            </button>
          )}

          {step === 'review' && (
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Add to Food Log
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
