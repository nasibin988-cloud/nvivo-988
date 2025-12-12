/**
 * AnalyzeStep - Display analysis results for selected menu items
 * - Single item: Full nutrition breakdown (like Photo AI)
 * - Multiple items (2-4): Comparison view (like Food Compare)
 */

import { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Utensils } from 'lucide-react';
import type { AnalysisResult, NutritionDetailLevel } from '../../photo-analysis/types';
import type { MultiComparisonResult, WellnessFocus } from '../../food-comparison/types';
import NutritionSummary from '../../photo-analysis/components/NutritionSummary';
import MealTypeSelector from '../../photo-analysis/components/MealTypeSelector';
import { ComparisonResultsView } from '../../food-comparison/components/ComparisonResultsView';
import { usePersonalizedDV } from '../../../../../../hooks/nutrition/usePersonalizedDV';

interface AnalyzeStepProps {
  isAnalyzing: boolean;
  isLoadingAIInsight?: boolean;
  singleItemResult: AnalysisResult | null;
  comparisonResult: MultiComparisonResult | null;
  userFocuses: WellnessFocus[];
  error: string | null;
  onBack: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function AnalyzeStep({
  isAnalyzing,
  isLoadingAIInsight = false,
  singleItemResult,
  comparisonResult,
  userFocuses,
  error,
  onBack,
}: AnalyzeStepProps): React.ReactElement {
  const [displayLevel, setDisplayLevel] = useState<NutritionDetailLevel>('essential');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [eatenAt, setEatenAt] = useState<string>(getCurrentTime);

  // Get personalized DVs for nutrition display
  const { dvs: personalizedDVs, isPersonalized } = usePersonalizedDV();

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center mb-4">
          <Loader2 size={28} className="text-teal-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">Analyzing...</p>
        <p className="text-xs text-text-muted text-center max-w-xs">
          Getting detailed nutrition information
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">Analysis Failed</p>
        <p className="text-xs text-text-muted text-center max-w-xs mb-4">
          {error}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Single item result - show detailed nutrition
  if (singleItemResult) {
    const itemName = singleItemResult.items[0]?.name || 'Menu Item';

    return (
      <div className="p-5 space-y-4">
        {/* Back button and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{itemName}</h3>
            <p className="text-xs text-text-muted">Nutrition Analysis</p>
          </div>
        </div>

        {/* Meal Type & Time Selection */}
        <MealTypeSelector
          selectedMealType={selectedMealType}
          eatenAt={eatenAt}
          onMealTypeChange={setSelectedMealType}
          onTimeChange={setEatenAt}
        />

        {/* Nutrition Summary - same as Photo AI */}
        <NutritionSummary
          result={singleItemResult}
          displayLevel={displayLevel}
          onDisplayLevelChange={setDisplayLevel}
        />
      </div>
    );
  }

  // Multiple items result - show comparison
  if (comparisonResult) {
    return (
      <div className="p-5 space-y-4">
        {/* Back button and title */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Comparing {comparisonResult.items.length} Items
            </h3>
            <p className="text-xs text-text-muted">Side-by-side nutrition comparison</p>
          </div>
        </div>

        {/* Comparison Results - same as Food Compare */}
        <ComparisonResultsView
          result={comparisonResult}
          isLoadingAIInsight={isLoadingAIInsight}
          selectedFocuses={userFocuses}
          personalizedDVs={personalizedDVs}
          isPersonalized={isPersonalized}
        />
      </div>
    );
  }

  // Fallback - no results
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5">
      <Utensils size={32} className="text-text-muted/40 mb-3" />
      <p className="text-sm text-text-muted text-center">
        No analysis results available
      </p>
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all"
      >
        Go Back
      </button>
    </div>
  );
}
