/**
 * FoodAnalysisCard - Complete health analysis for a single food
 */

import { Sparkles, Lightbulb } from 'lucide-react';
import type { FoodHealthProfile } from '../types';
import { HealthGradeBadge } from './HealthGradeBadge';
import { NutrientScoreBar } from './NutrientScoreBar';
import { ConditionImpactCard } from './ConditionImpactCard';

interface FoodAnalysisCardProps {
  profile: FoodHealthProfile;
  showAlternatives?: boolean;
}

export function FoodAnalysisCard({
  profile,
  showAlternatives = true,
}: FoodAnalysisCardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Header with grade */}
      <div className="flex items-start gap-4">
        <HealthGradeBadge grade={profile.healthGrade} size="lg" showLabel />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary">{profile.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">{profile.gradeReason}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-bold text-amber-400">{profile.calories} cal</span>
            <span className="text-xs text-text-muted">
              {profile.protein}g protein • {profile.carbs}g carbs • {profile.fat}g fat
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {profile.aiRecommendation && (
        <div className="bg-gradient-to-r from-violet-500/[0.08] to-purple-500/[0.05] rounded-xl p-3 border border-violet-500/20">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary">{profile.aiRecommendation}</p>
          </div>
        </div>
      )}

      {/* Nutrient Scores */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Nutrient Analysis
        </h4>
        <div className="space-y-3">
          {profile.nutrientScores.map((score) => (
            <NutrientScoreBar key={score.name} score={score} />
          ))}
        </div>
      </div>

      {/* Condition Impacts */}
      {profile.conditionImpacts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Health Condition Impacts
          </h4>
          <div className="space-y-2">
            {profile.conditionImpacts.map((impact) => (
              <ConditionImpactCard key={impact.condition} impact={impact} />
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {showAlternatives && profile.alternatives && profile.alternatives.length > 0 && (
        <div className="bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-emerald-400" />
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Healthier Alternatives
            </h4>
          </div>
          <div className="space-y-2">
            {profile.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <HealthGradeBadge grade={alt.healthGrade} size="sm" />
                  <div>
                    <span className="text-sm font-medium text-text-primary">{alt.name}</span>
                    <p className="text-[10px] text-text-muted">{alt.benefit}</p>
                  </div>
                </div>
                {alt.calorieReduction && (
                  <span className="text-xs font-bold text-emerald-400">
                    -{alt.calorieReduction} cal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
