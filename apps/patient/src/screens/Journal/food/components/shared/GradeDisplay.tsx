/**
 * GradeDisplay - Shows health grade for single food/meal based on wellness focus
 * Used in Photo AI and Text AI results views
 * Matches the quality of ComparisonResultsView insights
 */

import { Trophy, AlertTriangle, Sparkles } from 'lucide-react';
import type { WellnessFocus } from '../food-comparison/types';
import { calculateHealthGrade, FOCUS_LABELS } from '../food-comparison/utils';
import type { ExtendedNutritionData, HealthGrade } from '../food-comparison/types';
import { HealthGradeBadge } from '../food-comparison/components/HealthGradeBadge';

interface GradeDisplayProps {
  /** Total nutrition data from the analyzed meal */
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    magnesium?: number;
    omega3?: number;
    vitaminD?: number;
  };
  /** Selected wellness focus */
  focus: WellnessFocus;
}

/**
 * Generate strengths based on nutrition data
 */
function generateStrengths(
  nutrition: GradeDisplayProps['nutrition'],
  focus: WellnessFocus
): string[] {
  const strengths: string[] = [];
  const per100cal = Math.max(nutrition.calories, 100) / 100;

  // Protein density
  const proteinPer100cal = nutrition.protein / per100cal;
  if (proteinPer100cal > 4) {
    strengths.push('Excellent protein density — great for muscle and satiety');
  } else if (proteinPer100cal > 2.5) {
    strengths.push('Good protein content to help you stay full longer');
  }

  // Fiber
  const fiberPer100cal = (nutrition.fiber ?? 0) / per100cal;
  if (fiberPer100cal > 2.5) {
    strengths.push('High in fiber — supports digestion and blood sugar control');
  } else if (fiberPer100cal > 1.5) {
    strengths.push('Good fiber content for digestive health');
  }

  // Low sugar
  const sugarPer100cal = (nutrition.sugar ?? 0) / per100cal;
  if (sugarPer100cal < 1.5 && nutrition.calories > 100) {
    strengths.push('Low in sugar — won\'t spike your blood glucose');
  }

  // Low sodium
  const sodiumPer100cal = (nutrition.sodium ?? 0) / per100cal;
  if (sodiumPer100cal < 100 && nutrition.sodium !== undefined) {
    strengths.push('Low sodium — heart-friendly choice');
  }

  // Low saturated fat
  const satFatPer100cal = (nutrition.saturatedFat ?? 0) / per100cal;
  if (satFatPer100cal < 1 && nutrition.saturatedFat !== undefined && nutrition.calories > 100) {
    strengths.push('Low in saturated fat — good for cardiovascular health');
  }

  // Focus-specific strengths
  if (focus === 'muscle_building' && nutrition.protein > 20) {
    strengths.push(`${Math.round(nutrition.protein)}g protein supports muscle building`);
  }
  if (focus === 'weight_management' && nutrition.calories < 400 && (nutrition.fiber ?? 0) > 5) {
    strengths.push('Lower calorie with good fiber — ideal for weight management');
  }
  if (focus === 'gut_health' && (nutrition.fiber ?? 0) > 8) {
    strengths.push('Fiber-rich — excellent for gut microbiome health');
  }

  return strengths.slice(0, 2);
}

/**
 * Generate concerns based on nutrition data
 */
function generateConcerns(
  nutrition: GradeDisplayProps['nutrition'],
  focus: WellnessFocus
): string[] {
  const concerns: string[] = [];
  const per100cal = Math.max(nutrition.calories, 100) / 100;

  // Trans fat - always a concern if present
  if ((nutrition.transFat ?? 0) > 0.1) {
    concerns.push('Contains trans fat — linked to heart disease, best avoided');
  }

  // High saturated fat
  const satFat = nutrition.saturatedFat ?? (nutrition.fat * 0.35);
  const satFatPer100cal = satFat / per100cal;
  if (satFatPer100cal > 3) {
    const percentDV = Math.round((satFat / 20) * 100);
    concerns.push(`High saturated fat (${percentDV}% DV) — consider limiting`);
  }

  // High sodium
  const sodiumPer100cal = (nutrition.sodium ?? 0) / per100cal;
  if (sodiumPer100cal > 300) {
    const percentDV = Math.round((nutrition.sodium ?? 0) / 2300 * 100);
    concerns.push(`High sodium (${percentDV}% DV) — watch if managing blood pressure`);
  }

  // High sugar
  const sugarPer100cal = (nutrition.sugar ?? 0) / per100cal;
  if (sugarPer100cal > 6) {
    concerns.push('High in sugar — may cause energy spikes and crashes');
  }

  // Low protein (if relevant focus)
  if ((focus === 'muscle_building' || focus === 'weight_management') && nutrition.protein / per100cal < 1.5) {
    concerns.push('Low protein density — consider adding a protein source');
  }

  // Low fiber
  if ((focus === 'gut_health' || focus === 'blood_sugar_balance') && (nutrition.fiber ?? 0) / per100cal < 0.8) {
    concerns.push('Low in fiber — pair with vegetables or whole grains');
  }

  // Calorie density for weight management
  if (focus === 'weight_management' && nutrition.calories > 600) {
    concerns.push(`${Math.round(nutrition.calories)} calories is quite high — watch portion size`);
  }

  return concerns.slice(0, 2);
}

/**
 * Get grade-specific header text
 */
function getGradeHeader(grade: HealthGrade): { text: string; subtext: string } {
  switch (grade) {
    case 'A':
      return { text: 'Excellent Choice', subtext: 'A nutritious option for your goals' };
    case 'B':
      return { text: 'Good Choice', subtext: 'Solid nutrition with minor trade-offs' };
    case 'C':
      return { text: 'Average Choice', subtext: 'Moderate nutrition — balance with healthier options' };
    case 'D':
      return { text: 'Below Average', subtext: 'Consider healthier alternatives when possible' };
    case 'F':
      return { text: 'Poor Choice', subtext: 'Best as an occasional treat, not a regular choice' };
  }
}

export function GradeDisplay({
  nutrition,
  focus,
}: GradeDisplayProps): React.ReactElement {
  // Convert to ExtendedNutritionData format
  const extendedData: ExtendedNutritionData = {
    name: 'meal',
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber ?? 0,
    sugar: nutrition.sugar ?? 0,
    sodium: nutrition.sodium ?? 0,
    saturatedFat: nutrition.saturatedFat,
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    potassium: nutrition.potassium,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    magnesium: nutrition.magnesium,
    omega3: nutrition.omega3,
    vitaminD: nutrition.vitaminD,
  };

  const { grade } = calculateHealthGrade(extendedData, [focus]);
  const focusLabel = focus === 'balanced' ? 'Overall' : FOCUS_LABELS[focus];
  const { text: headerText, subtext: headerSubtext } = getGradeHeader(grade);

  const strengths = generateStrengths(nutrition, focus);
  const concerns = generateConcerns(nutrition, focus);

  // Choose gradient based on grade
  const gradientClass = grade === 'A' || grade === 'B'
    ? 'from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border-emerald-500/30'
    : grade === 'C'
    ? 'from-amber-500/15 via-yellow-500/10 to-orange-500/5 border-amber-500/30'
    : 'from-red-500/15 via-orange-500/10 to-amber-500/5 border-red-500/30';

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientClass} border p-4`}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header with grade badge */}
        <div className="flex items-start gap-3 mb-3">
          <HealthGradeBadge grade={grade} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{headerText}</p>
            <p className="text-xs text-text-muted">{headerSubtext}</p>
            <p className="text-[10px] text-text-muted mt-1">
              {focusLabel} Focus
            </p>
          </div>
        </div>

        {/* Insights */}
        {(strengths.length > 0 || concerns.length > 0) && (
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            {/* Strengths */}
            {strengths.map((strength, idx) => (
              <div key={`s-${idx}`} className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {grade === 'A' || grade === 'B' ? (
                    <Trophy size={12} className="text-emerald-400" />
                  ) : (
                    <Sparkles size={12} className="text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-emerald-400/90 leading-relaxed">{strength}</p>
              </div>
            ))}

            {/* Concerns */}
            {concerns.map((concern, idx) => (
              <div key={`c-${idx}`} className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/90 leading-relaxed">{concern}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
