/**
 * ReviewStep Component
 * Review and edit analysis results
 * Includes nutrition detail level toggle (shown AFTER analysis)
 * Displays health grade based on selected wellness focus
 */

import { RotateCcw } from 'lucide-react';
import type { AnalysisResult, AnalyzedFood, MealType, NutritionDetailLevel } from '../types';
import type { WellnessFocus } from '../../food-comparison/types';
import NutritionSummary from './NutritionSummary';
import MealTypeSelector from './MealTypeSelector';
import FoodItemCard from './FoodItemCard';
import { MealGradeCard } from '../../shared';

interface ReviewStepProps {
  imageData: string;
  result: AnalysisResult;
  selectedMealType: MealType;
  eatenAt: string;
  editingItem: number | null;
  displayLevel: NutritionDetailLevel;
  selectedFocus: WellnessFocus;
  onDisplayLevelChange: (level: NutritionDetailLevel) => void;
  onRetry: () => void;
  onMealTypeChange: (type: MealType) => void;
  onTimeChange: (time: string) => void;
  onToggleEdit: (index: number | null) => void;
  onUpdateItem: (index: number, updates: Partial<AnalyzedFood>) => void;
  onPortionChange: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
}

export default function ReviewStep({
  imageData,
  result,
  selectedMealType,
  eatenAt,
  editingItem,
  displayLevel,
  selectedFocus,
  onDisplayLevelChange,
  onRetry,
  onMealTypeChange,
  onTimeChange,
  onToggleEdit,
  onUpdateItem,
  onPortionChange,
  onRemoveItem,
}: ReviewStepProps): React.ReactElement {
  return (
    <div className="p-5 space-y-4">
      {/* Image preview (small) */}
      <div className="h-32 rounded-xl overflow-hidden relative border border-white/[0.06]">
        <img src={imageData} alt="Food" className="w-full h-full object-cover" />
        <button
          onClick={onRetry}
          className="absolute top-2 right-2 p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Meal Type & Time Selection */}
      <MealTypeSelector
        selectedMealType={selectedMealType}
        eatenAt={eatenAt}
        onMealTypeChange={onMealTypeChange}
        onTimeChange={onTimeChange}
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

      {/* Total summary - with toggleable detail level (shown AFTER analysis) */}
      <NutritionSummary
        result={result}
        displayLevel={displayLevel}
        onDisplayLevelChange={onDisplayLevelChange}
      />

      {/* Detected items */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Detected Items ({result.items.length})
        </p>
        {result.items.map((item, index) => (
          <FoodItemCard
            key={index}
            item={item}
            index={index}
            isEditing={editingItem === index}
            onToggleEdit={() => onToggleEdit(editingItem === index ? null : index)}
            onUpdate={(updates) => onUpdateItem(index, updates)}
            onPortionChange={(qty) => onPortionChange(index, qty)}
            onRemove={() => onRemoveItem(index)}
            userFocus={selectedFocus}
          />
        ))}
      </div>
    </div>
  );
}
