/**
 * Food Comparison Utilities
 * Focus-based health grade calculation with smart scoring
 */

import type {
  HealthGrade,
  FoodHealthProfile,
  NutrientScore,
  FocusImpact,
  ConditionImpact,
  FoodAlternative,
  WellnessFocus,
  ExtendedNutritionData,
} from './types';
import type { FoodIntelligence, FoodFocusGrades } from '../photo-analysis/types';

// ============================================
// Focus ID Mapping (WellnessFocus ↔ FoodFocusGrades key)
// ============================================

/**
 * Map WellnessFocus IDs to FoodFocusGrades keys
 * WellnessFocus uses longer names, FoodFocusGrades uses shorter keys
 */
const WELLNESS_TO_GRADE_KEY: Record<WellnessFocus, keyof FoodFocusGrades> = {
  balanced: 'balanced',
  muscle_building: 'muscle_building',
  heart_health: 'heart_health',
  energy_endurance: 'energy',
  weight_management: 'weight_management',
  brain_focus: 'brain_focus',
  gut_health: 'gut_health',
  blood_sugar_balance: 'blood_sugar',
  bone_joint_support: 'bone_joint',
  anti_inflammatory: 'anti_inflammatory',
};

// ============================================
// Color Mappings
// ============================================

export const GRADE_COLORS: Record<HealthGrade, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  B: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  C: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  D: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  F: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

export const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  beneficial: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  caution: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  avoid: { bg: 'bg-red-500/15', text: 'text-red-400' },
  positive: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  negative: { bg: 'bg-red-500/15', text: 'text-red-400' },
  excellent: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  good: { bg: 'bg-teal-500/15', text: 'text-teal-400' },
  poor: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

export const FOCUS_LABELS: Record<WellnessFocus, string> = {
  muscle_building: 'Muscle Building',
  heart_health: 'Heart Health',
  energy_endurance: 'Energy & Endurance',
  weight_management: 'Weight Management',
  brain_focus: 'Brain & Focus',
  gut_health: 'Gut Health',
  blood_sugar_balance: 'Blood Sugar Balance',
  bone_joint_support: 'Bone & Joint',
  anti_inflammatory: 'Anti-Inflammatory',
  balanced: 'Balanced',
};

// ============================================
// Focus-Based Weight System
// ============================================

interface FocusWeights {
  // Positive contributors (points to add based on nutrient density)
  protein: number;
  fiber: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  omega3: number;
  vitaminD: number;
  // Negative contributors (points to subtract based on nutrient density)
  saturatedFat: number;
  transFat: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  // Calorie density penalty multiplier
  calorieDensityPenalty: number;
}

const FOCUS_WEIGHTS: Record<WellnessFocus, FocusWeights> = {
  muscle_building: {
    protein: 4.0,        // Very important
    fiber: 0.5,
    potassium: 0.5,
    calcium: 0.8,
    iron: 1.2,
    magnesium: 1.0,
    omega3: 0.5,
    vitaminD: 1.0,
    saturatedFat: -0.5,  // More lenient
    transFat: -3.0,
    sugar: -0.5,
    sodium: -0.3,
    cholesterol: -0.3,
    calorieDensityPenalty: 0,  // Calories are okay
  },
  heart_health: {
    protein: 1.0,
    fiber: 3.0,          // Very important
    potassium: 2.5,      // Important for blood pressure
    calcium: 0.5,
    iron: 0.5,
    magnesium: 1.5,
    omega3: 3.0,         // Very important
    vitaminD: 0.5,
    saturatedFat: -4.0,  // Major concern
    transFat: -5.0,      // Critical
    sugar: -1.5,
    sodium: -3.0,        // Major concern
    cholesterol: -2.5,
    calorieDensityPenalty: 1.0,
  },
  energy_endurance: {
    protein: 1.5,
    fiber: 1.0,
    potassium: 1.5,
    calcium: 0.5,
    iron: 2.0,           // Important for oxygen transport
    magnesium: 2.0,      // Important for energy metabolism
    omega3: 0.5,
    vitaminD: 0.5,
    saturatedFat: -1.0,
    transFat: -3.0,
    sugar: -1.0,         // Some sugar okay for energy
    sodium: -0.8,
    cholesterol: -0.5,
    calorieDensityPenalty: 0.3,
  },
  weight_management: {
    protein: 2.5,        // Helps satiety
    fiber: 3.0,          // Very important for satiety
    potassium: 0.5,
    calcium: 0.5,
    iron: 0.5,
    magnesium: 0.5,
    omega3: 0.5,
    vitaminD: 0.5,
    saturatedFat: -2.0,
    transFat: -3.0,
    sugar: -3.0,         // Very important to limit
    sodium: -1.5,
    cholesterol: -1.0,
    calorieDensityPenalty: 2.0,  // Very important
  },
  brain_focus: {
    protein: 1.5,
    fiber: 1.0,
    potassium: 1.0,
    calcium: 0.5,
    iron: 1.5,
    magnesium: 2.0,      // Important for cognitive function
    omega3: 4.0,         // Critical for brain health
    vitaminD: 1.5,
    saturatedFat: -2.0,
    transFat: -4.0,
    sugar: -2.5,         // Blood sugar swings affect focus
    sodium: -1.0,
    cholesterol: -1.0,
    calorieDensityPenalty: 0.5,
  },
  gut_health: {
    protein: 1.0,
    fiber: 5.0,          // Critical
    potassium: 0.5,
    calcium: 0.5,
    iron: 0.5,
    magnesium: 1.0,
    omega3: 1.0,
    vitaminD: 0.5,
    saturatedFat: -1.5,
    transFat: -3.0,
    sugar: -2.0,         // Can feed bad bacteria
    sodium: -1.0,
    cholesterol: -0.5,
    calorieDensityPenalty: 0.3,
  },
  blood_sugar_balance: {
    protein: 2.0,        // Helps stabilize blood sugar
    fiber: 4.0,          // Critical - slows glucose absorption
    potassium: 0.5,
    calcium: 0.5,
    iron: 0.5,
    magnesium: 1.5,      // Important for insulin sensitivity
    omega3: 1.0,
    vitaminD: 0.5,
    saturatedFat: -1.5,
    transFat: -3.0,
    sugar: -5.0,         // Critical to limit
    sodium: -1.0,
    cholesterol: -1.0,
    calorieDensityPenalty: 1.0,
  },
  bone_joint_support: {
    protein: 1.5,
    fiber: 0.5,
    potassium: 1.0,
    calcium: 4.0,        // Critical
    iron: 0.5,
    magnesium: 2.0,      // Important for calcium absorption
    omega3: 2.0,         // Anti-inflammatory for joints
    vitaminD: 3.0,       // Critical for calcium absorption
    saturatedFat: -1.0,
    transFat: -2.0,
    sugar: -1.5,
    sodium: -1.5,        // High sodium can leach calcium
    cholesterol: -0.5,
    calorieDensityPenalty: 0.5,
  },
  anti_inflammatory: {
    protein: 1.0,
    fiber: 2.0,
    potassium: 1.0,
    calcium: 0.5,
    iron: 0.5,
    magnesium: 2.0,
    omega3: 5.0,         // Critical - anti-inflammatory
    vitaminD: 1.5,
    saturatedFat: -3.0,  // Pro-inflammatory
    transFat: -5.0,      // Very pro-inflammatory
    sugar: -3.0,         // Pro-inflammatory
    sodium: -2.0,
    cholesterol: -1.5,
    calorieDensityPenalty: 0.5,
  },
  balanced: {
    protein: 1.5,
    fiber: 2.0,
    potassium: 1.0,
    calcium: 1.0,
    iron: 1.0,
    magnesium: 1.0,
    omega3: 1.5,
    vitaminD: 1.0,
    saturatedFat: -2.0,
    transFat: -4.0,
    sugar: -2.0,
    sodium: -1.5,
    cholesterol: -1.0,
    calorieDensityPenalty: 0.8,
  },
};

// ============================================
// Core Scoring Functions
// ============================================

/**
 * Calculate score for a specific wellness focus
 *
 * Scoring approach:
 * - Base score of 60 (gives most foods a C starting point)
 * - Positive nutrients can add up to ~40 points
 * - Negative nutrients can subtract up to ~40 points
 * - Processing penalties are applied on top (max ~15)
 * - This allows differentiation: whole foods can reach A, processed foods drop to D/F
 */
export function calculateFocusScore(
  food: ExtendedNutritionData,
  focus: WellnessFocus
): number {
  const weights = FOCUS_WEIGHTS[focus];
  const per100cal = Math.max(food.calories, 100) / 100;

  let score = 60; // Start slightly above middle (most foods start at C)

  // Get actual or estimated values
  const satFat = food.saturatedFat ?? (food.fat * 0.35);
  const transFat = food.transFat ?? 0;
  const cholesterol = food.cholesterol ?? 0;
  const potassium = food.potassium ?? 0;
  const calcium = food.calcium ?? 0;
  const iron = food.iron ?? 0;
  const magnesium = food.magnesium ?? 0;
  const omega3 = food.omega3 ?? (food.fat * 0.02); // Rough estimate
  const vitaminD = food.vitaminD ?? 0;

  // Positive contributions (based on nutrient density per 100 cal)
  // These can push foods toward A grade
  score += Math.min(12, (food.protein / per100cal) * weights.protein * 0.8);
  score += Math.min(10, (food.fiber / per100cal) * weights.fiber * 0.8);
  score += Math.min(6, (potassium / per100cal / 100) * weights.potassium);
  score += Math.min(5, (calcium / per100cal / 50) * weights.calcium);
  score += Math.min(4, (iron / per100cal) * weights.iron);
  score += Math.min(4, (magnesium / per100cal / 20) * weights.magnesium);
  score += Math.min(6, (omega3 / per100cal) * weights.omega3);
  score += Math.min(4, (vitaminD / per100cal / 2) * weights.vitaminD);

  // Negative contributions (penalties) - scaled down to be less punitive
  // These differentiate between healthy and unhealthy foods
  score += Math.max(-15, (satFat / per100cal) * weights.saturatedFat * 0.6);
  score += Math.max(-12, transFat * weights.transFat); // Trans fat is always bad
  score += Math.max(-12, (food.sugar / per100cal) * weights.sugar * 0.6);
  score += Math.max(-10, (food.sodium / per100cal / 100) * weights.sodium * 0.5);
  score += Math.max(-6, (cholesterol / per100cal / 50) * weights.cholesterol);

  // Processing penalty: High sodium + high saturated fat = processed food
  // This is where heavily processed foods get their biggest penalty
  const processingPenalty = calculateProcessingPenalty(food);
  score -= processingPenalty;

  // Calorie density penalty (for weight management, etc.)
  const calorieDensity = food.calories / 100;
  if (calorieDensity > 3 && weights.calorieDensityPenalty > 0) {
    score -= Math.min(8, (calorieDensity - 3) * weights.calorieDensityPenalty * 2);
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate penalty for processed food indicators
 */
function calculateProcessingPenalty(food: ExtendedNutritionData): number {
  const satFat = food.saturatedFat ?? (food.fat * 0.35);
  const transFat = food.transFat ?? 0;
  const per100cal = Math.max(food.calories, 100) / 100;

  let penalty = 0;

  // High sodium + high saturated fat combo = likely processed
  const sodiumPer100cal = food.sodium / per100cal;
  const satFatPer100cal = satFat / per100cal;

  if (sodiumPer100cal > 250 && satFatPer100cal > 3) {
    penalty += 12;
  } else if (sodiumPer100cal > 200 && satFatPer100cal > 2) {
    penalty += 6;
  }

  // Trans fat is a major red flag (highly processed)
  if (transFat > 0.5) {
    penalty += 15;
  } else if (transFat > 0.1) {
    penalty += 8;
  }

  // Very high sugar + high fat = ultra-processed
  const sugarPer100cal = food.sugar / per100cal;
  if (sugarPer100cal > 8 && satFatPer100cal > 2) {
    penalty += 10;
  }

  return penalty;
}

/**
 * Convert score to letter grade
 */
function scoreToGrade(score: number): HealthGrade {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

/**
 * Convert score to rating
 */
function scoreToRating(score: number): 'excellent' | 'good' | 'moderate' | 'poor' {
  if (score >= 75) return 'excellent';
  if (score >= 55) return 'good';
  if (score >= 40) return 'moderate';
  return 'poor';
}

// ============================================
// Main Health Grade Calculation
// ============================================

/**
 * Calculate health grade based on nutritional profile and selected focuses
 */
export function calculateHealthGrade(
  food: ExtendedNutritionData,
  focuses: WellnessFocus[] = ['balanced']
): { grade: HealthGrade; reason: string; overallScore: number; focusScores: Record<WellnessFocus, number> } {
  // Calculate scores for ALL focuses (for comparison purposes)
  const focusScores = {} as Record<WellnessFocus, number>;
  for (const focus of Object.keys(FOCUS_WEIGHTS) as WellnessFocus[]) {
    focusScores[focus] = calculateFocusScore(food, focus);
  }

  // Calculate the overall score based on selected focuses
  const selectedFocuses = focuses.length === 0 ? ['balanced'] as WellnessFocus[] : focuses;
  let totalScore = 0;
  for (const focus of selectedFocuses) {
    totalScore += focusScores[focus];
  }
  const overallScore = Math.round(totalScore / selectedFocuses.length);
  const grade = scoreToGrade(overallScore);
  const reason = generateGradeReason(food, grade, selectedFocuses, focusScores);

  return { grade, reason, overallScore, focusScores };
}

/**
 * Generate a human-readable reason for the grade
 */
function generateGradeReason(
  food: ExtendedNutritionData,
  grade: HealthGrade,
  _focuses: WellnessFocus[],
  _focusScores: Record<WellnessFocus, number>
): string {
  const satFat = food.saturatedFat ?? (food.fat * 0.35);
  const per100cal = Math.max(food.calories, 100) / 100;

  const highlights: string[] = [];
  const concerns: string[] = [];

  // Check key nutrients
  if (food.protein / per100cal > 3) highlights.push('high protein');
  if (food.fiber / per100cal > 2) highlights.push('good fiber');
  if (food.sugar / per100cal < 2) highlights.push('low sugar');
  if (food.sodium / per100cal < 150) highlights.push('low sodium');

  if (satFat / per100cal > 3) concerns.push('high saturated fat');
  if (food.sugar / per100cal > 6) concerns.push('high sugar');
  if (food.sodium / per100cal > 300) concerns.push('high sodium');
  if ((food.transFat ?? 0) > 0.1) concerns.push('contains trans fat');

  // Build reason based on grade
  if (grade === 'A') {
    return highlights.length > 0
      ? `Excellent choice with ${highlights.slice(0, 2).join(' and ')}`
      : 'Excellent nutritional balance';
  } else if (grade === 'B') {
    return highlights.length > 0
      ? `Good option with ${highlights[0]}${concerns.length > 0 ? `, watch ${concerns[0]}` : ''}`
      : 'Good nutrition with room for improvement';
  } else if (grade === 'C') {
    return concerns.length > 0
      ? `Average choice - ${concerns[0]}`
      : 'Average nutritional value';
  } else if (grade === 'D') {
    return concerns.length > 0
      ? `Below average - ${concerns.slice(0, 2).join(' and ')}`
      : 'Below average nutrition';
  } else {
    return concerns.length > 0
      ? `Poor choice due to ${concerns.slice(0, 2).join(' and ')}`
      : 'Poor nutritional value - consume sparingly';
  }
}

// ============================================
// Focus Impact Calculation
// ============================================

/**
 * Calculate detailed impact for each focus area
 */
export function calculateFocusImpacts(
  food: ExtendedNutritionData,
  focuses: WellnessFocus[]
): FocusImpact[] {
  const impacts: FocusImpact[] = [];
  const per100cal = Math.max(food.calories, 100) / 100;
  const satFat = food.saturatedFat ?? (food.fat * 0.35);

  for (const focus of focuses) {
    if (focus === 'balanced') continue; // Skip balanced in detailed impacts

    const score = calculateFocusScore(food, focus);
    const rating = scoreToRating(score);
    const highlights: string[] = [];
    const concerns: string[] = [];

    // Generate focus-specific highlights and concerns
    switch (focus) {
      case 'muscle_building':
        if (food.protein / per100cal > 4) highlights.push('Excellent protein density');
        else if (food.protein / per100cal > 2) highlights.push('Good protein content');
        if (food.protein / per100cal < 1.5) concerns.push('Low protein for muscle building');
        break;

      case 'heart_health':
        if (food.fiber / per100cal > 2) highlights.push('Heart-healthy fiber');
        if (food.sodium / per100cal < 100) highlights.push('Low sodium');
        if (satFat / per100cal > 3) concerns.push('High saturated fat');
        if (food.sodium / per100cal > 250) concerns.push('High sodium content');
        if ((food.transFat ?? 0) > 0) concerns.push('Contains trans fat');
        break;

      case 'weight_management':
        if (food.fiber / per100cal > 2) highlights.push('High fiber aids satiety');
        if (food.protein / per100cal > 2) highlights.push('Protein helps fullness');
        if (food.calories > 400) concerns.push('Calorie-dense');
        if (food.sugar / per100cal > 5) concerns.push('High sugar');
        break;

      case 'blood_sugar_balance':
        if (food.fiber / per100cal > 2) highlights.push('Fiber slows glucose absorption');
        if (food.sugar / per100cal < 2) highlights.push('Low sugar impact');
        if (food.sugar / per100cal > 6) concerns.push('High sugar content');
        if (food.fiber / per100cal < 1 && food.carbs / per100cal > 10) concerns.push('High carb, low fiber');
        break;

      case 'gut_health':
        if (food.fiber / per100cal > 3) highlights.push('Excellent fiber for gut health');
        else if (food.fiber / per100cal > 1.5) highlights.push('Good fiber content');
        if (food.fiber / per100cal < 1) concerns.push('Low fiber');
        if (food.sugar / per100cal > 8) concerns.push('High sugar may affect gut balance');
        break;

      case 'brain_focus':
        if ((food.omega3 ?? 0) > 0.5) highlights.push('Contains omega-3s for brain health');
        if (food.sugar / per100cal < 3) highlights.push('Low sugar for stable focus');
        if (food.sugar / per100cal > 6) concerns.push('Sugar can affect concentration');
        break;

      case 'bone_joint_support':
        if ((food.calcium ?? 0) > 100) highlights.push('Good calcium content');
        if ((food.vitaminD ?? 0) > 2) highlights.push('Contains vitamin D');
        if (food.sodium / per100cal > 300) concerns.push('High sodium may affect calcium');
        break;

      case 'anti_inflammatory':
        if ((food.omega3 ?? 0) > 0.5) highlights.push('Anti-inflammatory omega-3s');
        if (food.fiber / per100cal > 1.5) highlights.push('Fiber supports anti-inflammatory response');
        if (satFat / per100cal > 3) concerns.push('Saturated fat promotes inflammation');
        if ((food.transFat ?? 0) > 0) concerns.push('Trans fat is highly inflammatory');
        if (food.sugar / per100cal > 6) concerns.push('High sugar promotes inflammation');
        break;

      case 'energy_endurance':
        if ((food.iron ?? 0) > 2) highlights.push('Good iron for energy');
        if ((food.magnesium ?? 0) > 30) highlights.push('Magnesium supports energy metabolism');
        if (food.protein / per100cal > 2) highlights.push('Protein for sustained energy');
        break;

    }

    impacts.push({
      focus,
      focusLabel: FOCUS_LABELS[focus],
      score,
      rating,
      highlights: highlights.slice(0, 2),
      concerns: concerns.slice(0, 2),
    });
  }

  return impacts;
}

// ============================================
// Nutrient Scores
// ============================================

/**
 * Calculate nutrient-specific scores
 */
export function calculateNutrientScores(food: ExtendedNutritionData): NutrientScore[] {
  const scores: NutrientScore[] = [];
  const per100cal = Math.max(food.calories / 100, 1);
  const satFat = food.saturatedFat ?? (food.fat * 0.35);

  // Protein score
  const proteinRatio = food.protein / per100cal;
  scores.push({
    name: 'Protein',
    score: Math.min(100, proteinRatio * 20),
    impact: proteinRatio > 2.5 ? 'positive' : proteinRatio > 1.5 ? 'neutral' : 'negative',
    reason: proteinRatio > 2.5 ? 'High protein density' : proteinRatio > 1.5 ? 'Moderate protein' : 'Low protein content',
  });

  // Fiber score
  const fiberRatio = food.fiber / per100cal;
  scores.push({
    name: 'Fiber',
    score: Math.min(100, fiberRatio * 30),
    impact: fiberRatio > 2 ? 'positive' : fiberRatio > 1 ? 'neutral' : 'negative',
    reason: fiberRatio > 2 ? 'Excellent fiber source' : fiberRatio > 1 ? 'Good fiber content' : 'Low in fiber',
  });

  // Sugar score (inverse - lower is better)
  const sugarRatio = food.sugar / per100cal;
  scores.push({
    name: 'Sugar',
    score: Math.max(0, 100 - sugarRatio * 12),
    impact: sugarRatio < 2 ? 'positive' : sugarRatio < 5 ? 'neutral' : 'negative',
    reason: sugarRatio < 2 ? 'Low sugar content' : sugarRatio < 5 ? 'Moderate sugar' : 'High in sugar',
  });

  // Sodium score (inverse)
  const sodiumRatio = food.sodium / per100cal;
  scores.push({
    name: 'Sodium',
    score: Math.max(0, 100 - sodiumRatio / 4),
    impact: sodiumRatio < 150 ? 'positive' : sodiumRatio < 300 ? 'neutral' : 'negative',
    reason: sodiumRatio < 150 ? 'Low sodium' : sodiumRatio < 300 ? 'Moderate sodium' : 'High sodium content',
  });

  // Saturated fat score (inverse)
  const satFatRatio = satFat / per100cal;
  scores.push({
    name: 'Sat. Fat',
    score: Math.max(0, 100 - satFatRatio * 15),
    impact: satFatRatio < 1.5 ? 'positive' : satFatRatio < 3 ? 'neutral' : 'negative',
    reason: satFatRatio < 1.5 ? 'Low saturated fat' : satFatRatio < 3 ? 'Moderate saturated fat' : 'High saturated fat',
  });

  return scores;
}

// ============================================
// Legacy Condition Impacts (for backward compatibility)
// ============================================

/**
 * @deprecated Use calculateFocusImpacts instead
 */
export function calculateConditionImpacts(
  food: ExtendedNutritionData,
  conditions: string[]
): ConditionImpact[] {
  // Map old conditions to new focuses for backward compatibility
  const conditionToFocus: Record<string, WellnessFocus> = {
    'diabetes': 'blood_sugar_balance',
    'hypertension': 'heart_health',
    'heart_disease': 'heart_health',
    'obesity': 'weight_management',
    'high_cholesterol': 'heart_health',
    'kidney_disease': 'balanced',
    'celiac': 'gut_health',
    'none': 'balanced',
  };

  const impacts: ConditionImpact[] = [];
  const focusImpacts = calculateFocusImpacts(
    food,
    conditions.map(c => conditionToFocus[c] || 'balanced')
  );

  // Convert FocusImpact to ConditionImpact format
  for (const fi of focusImpacts) {
    let impact: ConditionImpact['impact'] = 'moderate';
    if (fi.rating === 'excellent') impact = 'beneficial';
    else if (fi.rating === 'good') impact = 'moderate';
    else if (fi.rating === 'moderate') impact = 'caution';
    else impact = 'avoid';

    impacts.push({
      condition: fi.focusLabel,
      impact,
      reason: fi.highlights[0] || fi.concerns[0] || 'Moderate impact',
      recommendation: fi.concerns[0] ? `Consider: ${fi.concerns[0]}` : undefined,
    });
  }

  return impacts;
}

// ============================================
// Alternatives Generation
// ============================================

/**
 * Generate healthier alternatives
 */
export function generateAlternatives(food: {
  name: string;
  calories: number;
  healthGrade: HealthGrade;
}): FoodAlternative[] {
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

// ============================================
// Database Grade Extraction
// ============================================

/**
 * Convert a letter grade string (A+, B-, etc.) to a HealthGrade
 */
function letterToHealthGrade(letter: string): HealthGrade {
  const base = letter.charAt(0).toUpperCase();
  if (['A', 'B', 'C', 'D', 'F'].includes(base)) {
    return base as HealthGrade;
  }
  return 'C'; // Default
}

/**
 * Convert a letter grade to a numeric score (0-100)
 */
function letterGradeToScore(grade: string): number {
  const base = grade.charAt(0).toUpperCase();
  const modifier = grade.charAt(1);

  let baseScore: number;
  switch (base) {
    case 'A': baseScore = 90; break;
    case 'B': baseScore = 75; break;
    case 'C': baseScore = 57; break;
    case 'D': baseScore = 42; break;
    case 'F': baseScore = 25; break;
    default: baseScore = 50;
  }

  // Handle +/- modifiers
  if (modifier === '+') baseScore += 5;
  else if (modifier === '-') baseScore -= 5;

  return Math.max(0, Math.min(100, baseScore));
}

/**
 * Extract health grade from database intelligence for a specific focus
 * Returns null if no database grade is available
 */
function getDatabaseGrade(
  intelligence: FoodIntelligence | undefined,
  focus: WellnessFocus
): { grade: HealthGrade; score: number; reason: string; pros: string[]; cons: string[] } | null {
  if (!intelligence?.focusGrades) return null;

  const gradeKey = WELLNESS_TO_GRADE_KEY[focus];
  const focusGrade = intelligence.focusGrades[gradeKey];

  if (!focusGrade) return null;

  return {
    grade: letterToHealthGrade(focusGrade.grade),
    score: focusGrade.score ?? letterGradeToScore(focusGrade.grade),
    reason: focusGrade.insight || '',
    pros: focusGrade.pros || [],
    cons: focusGrade.cons || [],
  };
}

/**
 * Check if database has grades for any of the selected focuses
 */
function hasDatabaseGrades(
  intelligence: FoodIntelligence | undefined,
  focuses: WellnessFocus[]
): boolean {
  if (!intelligence?.focusGrades) return false;
  return focuses.some(focus => {
    const gradeKey = WELLNESS_TO_GRADE_KEY[focus];
    return intelligence.focusGrades?.[gradeKey] !== undefined;
  });
}

// ============================================
// AI Recommendation Generation
// ============================================

/**
 * Build a complete FoodHealthProfile from basic nutrition data
 *
 * PRIORITY ORDER FOR GRADING:
 * 1. Database grades (from food intelligence) - most accurate, pre-computed by AI
 * 2. Algorithmic calculation - fallback when no database grades available
 *
 * @param food - Nutrition data for the food
 * @param focuses - Wellness focuses to grade against
 * @param intelligence - Optional food intelligence with pre-computed database grades
 */
export function buildFoodHealthProfile(
  food: ExtendedNutritionData,
  focuses: WellnessFocus[] = ['balanced'],
  intelligence?: FoodIntelligence
): FoodHealthProfile {
  const selectedFocuses = focuses.length === 0 ? ['balanced'] as WellnessFocus[] : focuses;
  const useDatabaseGrades = hasDatabaseGrades(intelligence, selectedFocuses);

  let grade: HealthGrade;
  let reason: string;
  let overallScore: number;
  let focusScores: Record<WellnessFocus, number>;

  if (useDatabaseGrades && intelligence) {
    // USE DATABASE GRADES (preferred - more accurate)
    focusScores = {} as Record<WellnessFocus, number>;
    let totalScore = 0;
    let gradeCount = 0;
    const reasons: string[] = [];

    // Calculate scores for ALL focuses using database grades where available
    for (const focus of Object.keys(WELLNESS_TO_GRADE_KEY) as WellnessFocus[]) {
      const dbGrade = getDatabaseGrade(intelligence, focus);
      if (dbGrade) {
        focusScores[focus] = dbGrade.score;
        if (selectedFocuses.includes(focus)) {
          totalScore += dbGrade.score;
          gradeCount++;
          if (dbGrade.reason) reasons.push(dbGrade.reason);
        }
      } else {
        // Fall back to algorithmic for focuses without database grades
        focusScores[focus] = calculateFocusScore(food, focus);
        if (selectedFocuses.includes(focus)) {
          totalScore += focusScores[focus];
          gradeCount++;
        }
      }
    }

    overallScore = gradeCount > 0 ? Math.round(totalScore / gradeCount) : 50;
    grade = scoreToGrade(overallScore);

    // Use database insight as reason, or generate one
    const primaryDbGrade = getDatabaseGrade(intelligence, selectedFocuses[0]);
    reason = primaryDbGrade?.reason ||
             (intelligence.insight ? intelligence.insight : generateGradeReason(food, grade, selectedFocuses, focusScores));
  } else {
    // USE ALGORITHMIC GRADES (fallback)
    const calculated = calculateHealthGrade(food, selectedFocuses);
    grade = calculated.grade;
    reason = calculated.reason;
    overallScore = calculated.overallScore;
    focusScores = calculated.focusScores;
  }

  const nutrientScores = calculateNutrientScores(food);

  // For focus impacts, prefer database pros/cons when available
  const focusImpacts = useDatabaseGrades && intelligence
    ? buildFocusImpactsFromDatabase(food, selectedFocuses, intelligence, focusScores)
    : calculateFocusImpacts(food, selectedFocuses);

  const conditionImpacts = calculateConditionImpacts(food, []); // No legacy conditions
  const alternatives = generateAlternatives({ ...food, healthGrade: grade });

  const profile: FoodHealthProfile = {
    ...food,
    healthGrade: grade,
    gradeReason: reason,
    overallScore,
    focusScores,
    nutrientScores,
    focusImpacts,
    conditionImpacts,
    alternatives,
    ...(intelligence && { intelligence }),
  };

  profile.aiRecommendation = generateAiRecommendation(profile);

  return profile;
}

/**
 * Build focus impacts using database pros/cons when available
 */
function buildFocusImpactsFromDatabase(
  food: ExtendedNutritionData,
  focuses: WellnessFocus[],
  intelligence: FoodIntelligence,
  focusScores: Record<WellnessFocus, number>
): FocusImpact[] {
  const impacts: FocusImpact[] = [];

  for (const focus of focuses) {
    if (focus === 'balanced') continue;

    const dbGrade = getDatabaseGrade(intelligence, focus);
    const score = focusScores[focus] ?? calculateFocusScore(food, focus);
    const rating = scoreToRating(score);

    if (dbGrade) {
      // Use database pros/cons
      impacts.push({
        focus,
        focusLabel: FOCUS_LABELS[focus],
        score,
        rating,
        highlights: dbGrade.pros.slice(0, 2),
        concerns: dbGrade.cons.slice(0, 2),
      });
    } else {
      // Fall back to algorithmic calculation
      const algorithmic = calculateFocusImpacts(food, [focus]);
      if (algorithmic.length > 0) {
        impacts.push(algorithmic[0]);
      }
    }
  }

  return impacts;
}

/**
 * Generate AI recommendation based on profile
 */
export function generateAiRecommendation(profile: FoodHealthProfile): string {
  const { healthGrade, nutrientScores, focusImpacts } = profile;

  const concerningImpacts = focusImpacts.filter(i => i.rating === 'poor' || i.rating === 'moderate');
  const positiveNutrients = nutrientScores.filter(n => n.impact === 'positive');
  const negativeNutrients = nutrientScores.filter(n => n.impact === 'negative');

  if (healthGrade === 'A' || healthGrade === 'B') {
    if (positiveNutrients.length > 0) {
      return `Great choice! This food is ${positiveNutrients.map(n => n.reason.toLowerCase()).join(' and ')}. ${
        concerningImpacts.length > 0 && concerningImpacts[0].concerns.length > 0
          ? `Just note: ${concerningImpacts[0].concerns[0].toLowerCase()}.`
          : 'Enjoy as part of a balanced diet.'
      }`;
    }
    return 'This is a nutritious choice. Enjoy as part of your balanced diet.';
  }

  if (concerningImpacts.length > 0 && concerningImpacts[0].concerns.length > 0) {
    return `Consider: This food has ${concerningImpacts[0].concerns[0].toLowerCase()}. ${
      profile.alternatives && profile.alternatives.length > 0
        ? 'Check out healthier alternatives below.'
        : 'Try pairing with vegetables to balance the meal.'
    }`;
  }

  if (negativeNutrients.length > 0) {
    return `Tip: This food is ${negativeNutrients.map(n => n.reason.toLowerCase()).join(' and ')}. Consider smaller portions or balancing with healthier sides.`;
  }

  return 'This is an average nutritional choice. Consider pairing with vegetables or lean protein.';
}
