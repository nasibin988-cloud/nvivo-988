/**
 * Food Comparison Utilities
 * Health grade calculation and condition impact analysis
 */

import type {
  HealthGrade,
  FoodHealthProfile,
  NutrientScore,
  ConditionImpact,
  FoodAlternative,
  UserCondition,
} from './types';

// Health Grade color mapping
export const GRADE_COLORS: Record<HealthGrade, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  B: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  C: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  D: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  F: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

// Impact color mapping
export const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  beneficial: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  caution: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  avoid: { bg: 'bg-red-500/15', text: 'text-red-400' },
  positive: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  negative: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

/**
 * Calculate health grade based on nutritional profile
 */
export function calculateHealthGrade(food: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}): { grade: HealthGrade; reason: string } {
  let score = 50; // Start at middle

  // Protein bonus (0-20 points)
  const proteinRatio = food.protein / Math.max(food.calories / 100, 1);
  if (proteinRatio > 5) score += 20;
  else if (proteinRatio > 3) score += 15;
  else if (proteinRatio > 2) score += 10;
  else if (proteinRatio > 1) score += 5;

  // Fiber bonus (0-15 points)
  const fiberPer100cal = food.fiber / Math.max(food.calories / 100, 1);
  if (fiberPer100cal > 3) score += 15;
  else if (fiberPer100cal > 2) score += 10;
  else if (fiberPer100cal > 1) score += 5;

  // Sugar penalty (0-20 points)
  const sugarPer100cal = food.sugar / Math.max(food.calories / 100, 1);
  if (sugarPer100cal > 10) score -= 20;
  else if (sugarPer100cal > 5) score -= 15;
  else if (sugarPer100cal > 3) score -= 10;
  else if (sugarPer100cal > 1) score -= 5;

  // Sodium penalty (0-15 points)
  const sodiumPer100cal = food.sodium / Math.max(food.calories / 100, 1);
  if (sodiumPer100cal > 500) score -= 15;
  else if (sodiumPer100cal > 300) score -= 10;
  else if (sodiumPer100cal > 150) score -= 5;

  // Saturated fat approximation (assume 30% of fat is saturated)
  const satFatPer100cal = (food.fat * 0.3) / Math.max(food.calories / 100, 1);
  if (satFatPer100cal > 5) score -= 10;
  else if (satFatPer100cal > 3) score -= 5;

  // Convert score to grade
  let grade: HealthGrade;
  let reason: string;

  if (score >= 75) {
    grade = 'A';
    reason = 'Excellent nutritional balance with high protein and fiber';
  } else if (score >= 60) {
    grade = 'B';
    reason = 'Good nutrition with some room for improvement';
  } else if (score >= 45) {
    grade = 'C';
    reason = 'Average nutrition - consider healthier alternatives';
  } else if (score >= 30) {
    grade = 'D';
    reason = 'Below average - high in sugar or sodium';
  } else {
    grade = 'F';
    reason = 'Poor nutritional value - consume sparingly';
  }

  return { grade, reason };
}

/**
 * Calculate nutrient-specific scores
 */
export function calculateNutrientScores(food: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}): NutrientScore[] {
  const scores: NutrientScore[] = [];
  const per100cal = Math.max(food.calories / 100, 1);

  // Protein score
  const proteinRatio = food.protein / per100cal;
  scores.push({
    name: 'Protein',
    score: Math.min(100, proteinRatio * 20),
    impact: proteinRatio > 2 ? 'positive' : proteinRatio > 1 ? 'neutral' : 'negative',
    reason: proteinRatio > 2 ? 'High protein density' : proteinRatio > 1 ? 'Moderate protein' : 'Low protein content',
  });

  // Fiber score
  const fiberRatio = food.fiber / per100cal;
  scores.push({
    name: 'Fiber',
    score: Math.min(100, fiberRatio * 30),
    impact: fiberRatio > 2 ? 'positive' : fiberRatio > 1 ? 'neutral' : 'negative',
    reason: fiberRatio > 2 ? 'Excellent fiber source' : fiberRatio > 1 ? 'Good fiber content' : 'Low in fiber',
  });

  // Sugar score (inverse)
  const sugarRatio = food.sugar / per100cal;
  scores.push({
    name: 'Sugar',
    score: Math.max(0, 100 - sugarRatio * 10),
    impact: sugarRatio < 3 ? 'positive' : sugarRatio < 6 ? 'neutral' : 'negative',
    reason: sugarRatio < 3 ? 'Low sugar content' : sugarRatio < 6 ? 'Moderate sugar' : 'High in added sugars',
  });

  // Sodium score (inverse)
  const sodiumRatio = food.sodium / per100cal;
  scores.push({
    name: 'Sodium',
    score: Math.max(0, 100 - sodiumRatio / 3),
    impact: sodiumRatio < 150 ? 'positive' : sodiumRatio < 300 ? 'neutral' : 'negative',
    reason: sodiumRatio < 150 ? 'Low sodium' : sodiumRatio < 300 ? 'Moderate sodium' : 'High sodium content',
  });

  return scores;
}

/**
 * Calculate condition-specific impacts
 */
export function calculateConditionImpacts(
  food: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  },
  conditions: UserCondition[]
): ConditionImpact[] {
  const impacts: ConditionImpact[] = [];
  const per100cal = Math.max(food.calories / 100, 1);

  if (conditions.includes('diabetes') || conditions.includes('none')) {
    const sugarRatio = food.sugar / per100cal;
    const fiberRatio = food.fiber / per100cal;
    const carbRatio = food.carbs / per100cal;

    let impact: ConditionImpact['impact'] = 'moderate';
    let reason = 'Moderate impact on blood sugar';

    if (sugarRatio < 2 && fiberRatio > 2) {
      impact = 'beneficial';
      reason = 'Low sugar with high fiber helps stabilize blood sugar';
    } else if (sugarRatio > 6 || (carbRatio > 15 && fiberRatio < 1)) {
      impact = 'avoid';
      reason = 'High sugar/carb content can spike blood glucose';
    } else if (sugarRatio > 3) {
      impact = 'caution';
      reason = 'Moderate sugar content - watch portion size';
    }

    impacts.push({
      condition: 'Diabetes',
      impact,
      reason,
      recommendation: impact === 'avoid' ? 'Consider lower-carb alternatives' : undefined,
    });
  }

  if (conditions.includes('hypertension') || conditions.includes('none')) {
    const sodiumRatio = food.sodium / per100cal;

    let impact: ConditionImpact['impact'] = 'moderate';
    let reason = 'Moderate sodium content';

    if (sodiumRatio < 100) {
      impact = 'beneficial';
      reason = 'Low sodium helps maintain healthy blood pressure';
    } else if (sodiumRatio > 400) {
      impact = 'avoid';
      reason = 'Very high sodium can raise blood pressure';
    } else if (sodiumRatio > 200) {
      impact = 'caution';
      reason = 'High sodium - limit intake';
    }

    impacts.push({
      condition: 'Hypertension',
      impact,
      reason,
      recommendation: impact === 'avoid' ? 'Look for low-sodium options' : undefined,
    });
  }

  if (conditions.includes('heart_disease') || conditions.includes('high_cholesterol') || conditions.includes('none')) {
    const fatRatio = food.fat / per100cal;
    const satFatApprox = fatRatio * 0.3;
    const fiberRatio = food.fiber / per100cal;

    let impact: ConditionImpact['impact'] = 'moderate';
    let reason = 'Moderate impact on heart health';

    if (satFatApprox < 1 && fiberRatio > 2) {
      impact = 'beneficial';
      reason = 'Low saturated fat with good fiber supports heart health';
    } else if (satFatApprox > 4) {
      impact = 'avoid';
      reason = 'High in saturated fat which can raise cholesterol';
    } else if (satFatApprox > 2) {
      impact = 'caution';
      reason = 'Moderate saturated fat content';
    }

    impacts.push({
      condition: 'Heart Health',
      impact,
      reason,
      recommendation: impact === 'avoid' ? 'Choose lean proteins and plant-based options' : undefined,
    });
  }

  return impacts;
}

/**
 * Generate healthier alternatives
 */
export function generateAlternatives(food: {
  name: string;
  calories: number;
  healthGrade: HealthGrade;
}): FoodAlternative[] {
  // This would be expanded with a real database of foods
  // For now, return generic suggestions based on food type
  const alternatives: FoodAlternative[] = [];

  if (food.calories > 500) {
    alternatives.push({
      name: 'Grilled version',
      calories: Math.round(food.calories * 0.7),
      healthGrade: 'B',
      benefit: 'Lower calories with similar taste',
      calorieReduction: Math.round(food.calories * 0.3),
    });
  }

  if (food.healthGrade === 'D' || food.healthGrade === 'F') {
    alternatives.push({
      name: 'Salad alternative',
      calories: Math.round(food.calories * 0.4),
      healthGrade: 'A',
      benefit: 'Much lighter option with added vegetables',
      calorieReduction: Math.round(food.calories * 0.6),
    });
  }

  return alternatives;
}

/**
 * Generate AI recommendation based on profile
 */
export function generateAiRecommendation(profile: FoodHealthProfile): string {
  const { healthGrade, nutrientScores, conditionImpacts } = profile;

  const negativeImpacts = conditionImpacts.filter(
    (i) => i.impact === 'avoid' || i.impact === 'caution'
  );

  const positiveNutrients = nutrientScores.filter((n) => n.impact === 'positive');
  const negativeNutrients = nutrientScores.filter((n) => n.impact === 'negative');

  if (healthGrade === 'A' || healthGrade === 'B') {
    if (positiveNutrients.length > 0) {
      return `Great choice! This food is ${positiveNutrients.map((n) => n.reason.toLowerCase()).join(' and ')}. ${
        negativeImpacts.length > 0
          ? `Just watch out for ${negativeImpacts[0].condition.toLowerCase()} impacts.`
          : 'Enjoy as part of a balanced diet.'
      }`;
    }
    return 'This is a nutritious choice. Enjoy as part of your balanced diet.';
  }

  if (negativeImpacts.length > 0) {
    return `Consider: This food may not be ideal if you have ${negativeImpacts.map((i) => i.condition).join(' or ')} concerns. ${
      profile.alternatives && profile.alternatives.length > 0
        ? 'Check out the healthier alternatives below.'
        : 'Try pairing with vegetables to balance the meal.'
    }`;
  }

  if (negativeNutrients.length > 0) {
    return `Tip: This food is ${negativeNutrients.map((n) => n.reason.toLowerCase()).join(' and ')}. Consider smaller portions or balancing with healthier sides.`;
  }

  return 'This is an average nutritional choice. Consider pairing with vegetables or lean protein.';
}
