/**
 * FoodInputForm - Form for entering food nutrition data
 * Supports three input methods:
 * 1. Camera/Photo scan - Take or upload a photo
 * 2. Text-based AI - Describe your food in natural language
 * 3. Manual entry - Enter nutrition values directly
 */

import { useState } from 'react';
import { Plus, Camera, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { FoodCaptureModal } from './FoodCaptureModal';
import { useFoodAI } from '../../../../../../hooks/useFoodAI';

interface FoodInputFormProps {
  onSubmit: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }) => void;
  onCancel?: () => void;
}

export function FoodInputForm({ onSubmit, onCancel }: FoodInputFormProps): React.ReactElement {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Use shared food AI hook for text analysis
  const { analyzeText, status: aiStatus, error: aiError, reset: resetAI } = useFoodAI();

  const isValid = name.trim() && calories;
  const isAnalyzing = aiStatus === 'analyzing';

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      fiber: parseInt(fiber) || 0,
      sugar: parseInt(sugar) || 0,
      sodium: parseInt(sodium) || 0,
    });
  };

  const handleFoodAnalyzed = (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }) => {
    // Populate the form with analyzed food data
    setName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setFiber(food.fiber.toString());
    setSugar(food.sugar.toString());
    setSodium(food.sodium.toString());
    setShowCaptureModal(false);
    setShowTextInput(false);
    setTextDescription('');
  };

  const handleTextAnalysis = async () => {
    if (!textDescription.trim()) return;

    const result = await analyzeText(textDescription.trim());
    if (result && result.items.length > 0) {
      // Use the first item (or totals if multiple items)
      if (result.items.length === 1) {
        const item = result.items[0];
        handleFoodAnalyzed({
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
          sugar: item.sugar,
          sodium: item.sodium,
        });
      } else {
        // For multiple items, show combined name and totals
        const combinedName = result.items.map(i => i.name).join(' + ');
        handleFoodAnalyzed({
          name: combinedName.length > 50 ? combinedName.slice(0, 47) + '...' : combinedName,
          calories: result.totalCalories,
          protein: result.totalProtein,
          carbs: result.totalCarbs,
          fat: result.totalFat,
          fiber: result.items.reduce((sum, i) => sum + i.fiber, 0),
          sugar: result.items.reduce((sum, i) => sum + i.sugar, 0),
          sodium: result.items.reduce((sum, i) => sum + i.sodium, 0),
        });
      }
    }
  };

  const handleCancelTextInput = () => {
    setShowTextInput(false);
    setTextDescription('');
    resetAI();
  };

  return (
    <>
      <div className="space-y-4">
        {/* AI Input Options */}
        <div className="flex gap-2">
          {/* Photo Scan Button */}
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/25 hover:to-teal-500/25 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            <span>Photo</span>
          </button>

          {/* Text AI Button */}
          <button
            onClick={() => setShowTextInput(true)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 hover:from-violet-500/25 hover:to-purple-500/25 hover:border-violet-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Wand2 size={16} />
            <span>Describe</span>
          </button>
        </div>

        {/* Text Input for AI Analysis */}
        {showTextInput && (
          <div className="space-y-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
            <div className="flex items-center gap-2 text-xs text-violet-400">
              <Sparkles size={14} />
              <span>Describe what you ate - AI will estimate nutrition</span>
            </div>
            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g., grilled chicken breast with rice and steamed broccoli"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.04] transition-all resize-none"
              rows={2}
              disabled={isAnalyzing}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancelTextInput}
                disabled={isAnalyzing}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTextAnalysis}
                disabled={!textDescription.trim() || isAnalyzing}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Analyze
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="text-xs text-amber-400">{aiError}</p>
            )}
          </div>
        )}

        {!showTextInput && (
          <>
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-text-muted">or enter manually</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Food name */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Food name (e.g., Grilled Chicken)"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.02] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all"
              />
            </div>

            {/* Nutrition inputs - 2 column grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: calories, setter: setCalories, label: 'Calories', unit: 'cal', required: true },
                { value: protein, setter: setProtein, label: 'Protein', unit: 'g' },
                { value: carbs, setter: setCarbs, label: 'Carbs', unit: 'g' },
                { value: fat, setter: setFat, label: 'Fat', unit: 'g' },
                { value: fiber, setter: setFiber, label: 'Fiber', unit: 'g' },
                { value: sugar, setter: setSugar, label: 'Sugar', unit: 'g' },
                { value: sodium, setter: setSodium, label: 'Sodium', unit: 'mg' },
              ].map(({ value, setter, label, unit, required }) => (
                <div key={label} className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={label}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-white/[0.02] border ${
                      required && !value ? 'border-amber-500/30' : 'border-white/[0.06]'
                    } text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                    {unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Analyze
              </button>
            </div>
          </>
        )}
      </div>

      {/* Food Capture Modal */}
      {showCaptureModal && (
        <FoodCaptureModal
          onClose={() => setShowCaptureModal(false)}
          onFoodAnalyzed={handleFoodAnalyzed}
        />
      )}
    </>
  );
}
