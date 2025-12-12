/**
 * DESIGN 13: Score-Forward
 * Each meal shows a mini health score ring (like DailyScoreCard).
 * Emphasizes nutritional quality at a glance. Matches app's ring aesthetic.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design13Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

// Calculate a simple health score for display
function calculateMealScore(meal: FoodLog): { score: number; color: string; label: string } {
  const calories = meal.calories || 0;
  const protein = meal.protein || 0;
  const fiber = meal.fiber || 0;

  if (calories === 0) return { score: 0, color: '#6b7280', label: '' };

  // Score based on protein density and fiber
  const proteinDensity = (protein / calories) * 100;
  const fiberBonus = Math.min(fiber * 3, 20);

  let score = Math.min(100, Math.round(proteinDensity * 4 + fiberBonus + 30));

  // Penalize very high calorie meals slightly
  if (calories > 700) score = Math.max(20, score - 15);

  if (score >= 70) return { score, color: '#10b981', label: 'Great' };
  if (score >= 50) return { score, color: '#f59e0b', label: 'Good' };
  if (score >= 30) return { score, color: '#f97316', label: 'Fair' };
  return { score, color: '#ef4444', label: 'Poor' };
}

function MiniScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg width="48" height="48" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
        />
        {/* Progress ring */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-text-primary">{score}</span>
      </div>
    </div>
  );
}

function ScoreCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const { score, color, label } = calculateMealScore(meal);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left"
    >
      {/* Score ring */}
      <MiniScoreRing score={score} color={color} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] text-text-muted tabular-nums">{meal.time}</span>
          {label && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {label}
            </span>
          )}
          {meal.isAiAnalyzed && <Sparkles size={10} className="text-violet-400" />}
        </div>

        <p className="text-sm font-medium text-text-primary line-clamp-1 mb-1.5">{meal.description}</p>

        {/* Macro chips */}
        <div className="flex items-center gap-2">
          {meal.protein && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
              {meal.protein}g P
            </span>
          )}
          {meal.carbs && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
              {meal.carbs}g C
            </span>
          )}
          {meal.fat && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
              {meal.fat}g F
            </span>
          )}
        </div>
      </div>

      {/* Calories */}
      {meal.calories && (
        <div className="text-right shrink-0">
          <span className="text-xl font-bold text-text-primary tabular-nums">{meal.calories}</span>
          <span className="text-[9px] text-text-muted block">cal</span>
        </div>
      )}
    </button>
  );
}

export function Design13_Score({ meals, onDelete: _onDelete, onEdit }: Design13Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3">
          <svg width="48" height="48">
            <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">Log meals to see your scores</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => (
        <ScoreCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
    </div>
  );
}
