/**
 * Food Comparison Modal
 * Health grade analysis and food comparison with condition impacts
 */

import { useState } from 'react';
import { X, Scale, ChevronLeft, Plus, Trash2, Trophy } from 'lucide-react';
import {
  useFoodComparison,
  FoodInputForm,
  FoodAnalysisCard,
  HealthGradeBadge,
} from './food-comparison';

interface FoodComparisonModalProps {
  onClose: () => void;
}

type ViewMode = 'input' | 'analysis' | 'compare';

export default function FoodComparisonModal({
  onClose,
}: FoodComparisonModalProps): React.ReactElement {
  const [view, setView] = useState<ViewMode>('input');
  const [inputSlot, setInputSlot] = useState<1 | 2>(1);

  const {
    food1,
    food2,
    comparison,
    analyzeFood,
    clearFood,
  } = useFoodComparison();

  const handleFoodSubmit = (food: Parameters<typeof analyzeFood>[0]) => {
    analyzeFood(food, inputSlot);
    setView('analysis');
  };

  const handleAddAnother = () => {
    if (!food2) {
      setInputSlot(2);
      setView('input');
    }
  };

  const handleCompare = () => {
    if (food1 && food2) {
      setView('compare');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-transparent">
          <div className="flex items-center gap-3">
            {view !== 'input' && (
              <button
                onClick={() => setView(view === 'compare' ? 'analysis' : 'input')}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/90 to-orange-500/90 text-white shadow-lg shadow-amber-500/20">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Food Compare</h2>
              <p className="text-xs text-text-muted">
                {view === 'input'
                  ? 'Enter food nutrition'
                  : view === 'analysis'
                  ? 'Health analysis'
                  : 'Side-by-side comparison'}
              </p>
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
        <div className="flex-1 overflow-y-auto p-5">
          {view === 'input' && (
            <div className="space-y-4">
              {/* Slot indicator */}
              <div className="text-center mb-4">
                <span className="text-sm text-text-muted">
                  {inputSlot === 1 ? 'First' : 'Second'} Food
                </span>
              </div>

              <FoodInputForm
                onSubmit={handleFoodSubmit}
                onCancel={food1 ? () => setView('analysis') : undefined}
              />

              {/* Quick examples */}
              <div className="pt-4 border-t border-white/[0.04]">
                <p className="text-xs text-text-muted mb-3">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Grilled Chicken', cal: 165, p: 31, c: 0, f: 4, fi: 0, s: 0, so: 74 },
                    { name: 'Caesar Salad', cal: 320, p: 12, c: 22, f: 24, fi: 3, s: 4, so: 580 },
                    { name: 'Cheeseburger', cal: 540, p: 28, c: 40, f: 30, fi: 2, s: 8, so: 1020 },
                    { name: 'Greek Yogurt', cal: 100, p: 17, c: 6, f: 1, fi: 0, s: 4, so: 50 },
                  ].map((ex) => (
                    <button
                      key={ex.name}
                      onClick={() => {
                        analyzeFood({
                          name: ex.name,
                          calories: ex.cal,
                          protein: ex.p,
                          carbs: ex.c,
                          fat: ex.f,
                          fiber: ex.fi,
                          sugar: ex.s,
                          sodium: ex.so,
                        }, inputSlot);
                        setView('analysis');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-all"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'analysis' && food1 && (
            <div className="space-y-6">
              {/* Food 1 Analysis */}
              <FoodAnalysisCard profile={food1} />

              {/* Food 2 if exists */}
              {food2 && (
                <>
                  <div className="border-t border-white/[0.06] pt-6">
                    <FoodAnalysisCard profile={food2} />
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                {!food2 ? (
                  <button
                    onClick={handleAddAnother}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Food to Compare
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        clearFood(2);
                      }}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={handleCompare}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Scale size={16} />
                      Compare Foods
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {view === 'compare' && comparison && (
            <div className="space-y-5">
              {/* Winner announcement */}
              <div className="bg-gradient-to-r from-amber-500/[0.08] to-orange-500/[0.05] rounded-2xl p-4 border border-amber-500/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy size={20} className="text-amber-400" />
                  <span className="text-lg font-bold text-text-primary">
                    {comparison.winner === 'tie'
                      ? 'It\'s a tie!'
                      : comparison.winner === 'food1'
                      ? `${comparison.food1.name} wins!`
                      : `${comparison.food2.name} wins!`}
                  </span>
                </div>
                <p className="text-xs text-text-muted">Based on health grade and nutrient profile</p>
              </div>

              {/* Side by side grades */}
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <HealthGradeBadge grade={comparison.food1.healthGrade} size="lg" showLabel />
                  <p className="text-sm font-semibold text-text-primary mt-2 max-w-[100px] truncate">
                    {comparison.food1.name}
                  </p>
                </div>

                <div className="text-2xl font-bold text-text-muted">VS</div>

                <div className="text-center">
                  <HealthGradeBadge grade={comparison.food2.healthGrade} size="lg" showLabel />
                  <p className="text-sm font-semibold text-text-primary mt-2 max-w-[100px] truncate">
                    {comparison.food2.name}
                  </p>
                </div>
              </div>

              {/* Comparison breakdown */}
              <div className="space-y-2">
                {comparison.comparison.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-sm font-medium text-text-primary">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{item.difference}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.food1Better
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {item.food1Better ? '1' : '2'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nutrition comparison table */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Nutrition Breakdown
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Calories', v1: comparison.food1.calories, v2: comparison.food2.calories, unit: '' },
                    { label: 'Protein', v1: comparison.food1.protein, v2: comparison.food2.protein, unit: 'g' },
                    { label: 'Carbs', v1: comparison.food1.carbs, v2: comparison.food2.carbs, unit: 'g' },
                    { label: 'Fat', v1: comparison.food1.fat, v2: comparison.food2.fat, unit: 'g' },
                    { label: 'Fiber', v1: comparison.food1.fiber, v2: comparison.food2.fiber, unit: 'g' },
                    { label: 'Sugar', v1: comparison.food1.sugar, v2: comparison.food2.sugar, unit: 'g' },
                    { label: 'Sodium', v1: comparison.food1.sodium, v2: comparison.food2.sodium, unit: 'mg' },
                  ].map(({ label, v1, v2, unit }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-text-muted w-20">{label}</span>
                      <span className="font-bold text-amber-400">
                        {v1}{unit}
                      </span>
                      <span className="text-text-muted">vs</span>
                      <span className="font-bold text-blue-400">
                        {v2}{unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
