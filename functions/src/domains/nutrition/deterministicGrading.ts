/**
 * Deterministic Food Grading System
 *
 * Uses published, peer-reviewed algorithms for consistent, reproducible food grades.
 * No AI calls needed - pure mathematical formulas based on nutrition science.
 *
 * Algorithms implemented:
 * 1. Nutri-Score (EU) for overall grade
 * 2. Threshold-based scoring for focus grades (based on DRI/AHA/WHO guidelines)
 * 3. Satiety Score (Holt 1995 research)
 * 4. Dietary Inflammatory Index (DII) coefficients
 */

// ============================================================================
// TYPES
// ============================================================================

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type WellnessFocus =
  | 'balanced'
  | 'muscle_building'
  | 'heart_health'
  | 'energy_endurance'
  | 'weight_management'
  | 'brain_focus'
  | 'gut_health'
  | 'blood_sugar_balance'
  | 'bone_joint_support'
  | 'anti_inflammatory';

export interface NutritionInput {
  // Required macros
  calories: number;
  protein: number;
  carbs: number;
  fat: number;

  // Important for grading
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat: number;

  // Optional - enhance accuracy
  transFat?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  vitaminC?: number;
  vitaminD?: number;
  omega3?: number;
  water?: number;

  // Food metadata
  servingGrams?: number;
  isBeverage?: boolean;
  foodGroup?: string;
}

export interface FocusGradeResult {
  grade: HealthGrade;
  score: number; // 0-100
  insight: string;
  pros: string[];
  cons: string[];
}

export interface DeterministicGradingResult {
  // Overall (Nutri-Score based)
  overallGrade: HealthGrade;
  overallScore: number; // 0-100
  nutriScorePoints: number; // Raw Nutri-Score (-15 to +40)

  // Focus-specific grades
  focusGrades: Record<WellnessFocus, FocusGradeResult>;

  // Derived metrics
  satietyScore: number; // 0-100
  inflammatoryIndex: number; // negative = anti-inflammatory

  // Analysis summary
  primaryConcerns: string[];
  strengths: string[];
}

// ============================================================================
// NUTRI-SCORE ALGORITHM
// Official EU algorithm for overall food quality grading
// Reference: https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score
// ============================================================================

/**
 * Calculate Nutri-Score negative points (Points A)
 * Higher = worse
 */
function calculateNegativePoints(nutrition: NutritionInput): number {
  const servingGrams = nutrition.servingGrams || 100;

  // Normalize to per 100g
  const energyKJ = (nutrition.calories * 4.184) / servingGrams * 100;
  const sugarsPer100g = (nutrition.sugar / servingGrams) * 100;
  const satFatPer100g = (nutrition.saturatedFat / servingGrams) * 100;
  const sodiumPer100g = (nutrition.sodium / servingGrams) * 100;

  let points = 0;

  // Energy points (0-10)
  if (nutrition.isBeverage) {
    // Beverages: stricter energy thresholds
    const energyThresholds = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
    points += energyThresholds.filter(t => energyKJ > t).length;
  } else {
    // Foods
    const energyThresholds = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
    points += energyThresholds.filter(t => energyKJ > t).length;
  }

  // Sugar points (0-10)
  if (nutrition.isBeverage) {
    const sugarThresholds = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5];
    points += sugarThresholds.filter(t => sugarsPer100g > t).length;
  } else {
    const sugarThresholds = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
    points += sugarThresholds.filter(t => sugarsPer100g > t).length;
  }

  // Saturated fat points (0-10)
  const satFatThresholds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  points += satFatThresholds.filter(t => satFatPer100g > t).length;

  // Sodium points (0-10)
  const sodiumThresholds = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];
  points += sodiumThresholds.filter(t => sodiumPer100g > t).length;

  return Math.min(40, points); // Cap at 40
}

/**
 * Calculate Nutri-Score positive points (Points C)
 * Higher = better
 */
function calculatePositivePoints(nutrition: NutritionInput): number {
  const servingGrams = nutrition.servingGrams || 100;

  // Normalize to per 100g
  const fiberPer100g = (nutrition.fiber / servingGrams) * 100;
  const proteinPer100g = (nutrition.protein / servingGrams) * 100;

  let points = 0;

  // Fiber points (0-5)
  const fiberThresholds = [0.9, 1.9, 2.8, 3.7, 4.7];
  points += fiberThresholds.filter(t => fiberPer100g > t).length;

  // Protein points (0-5)
  const proteinThresholds = [1.6, 3.2, 4.8, 6.4, 8.0];
  points += proteinThresholds.filter(t => proteinPer100g > t).length;

  // Fruits/vegetables/nuts points (0-5)
  // We estimate based on food group and vitamin C content
  const vitaminC = nutrition.vitaminC || 0;
  const foodGroup = nutrition.foodGroup?.toLowerCase() || '';

  let fvnPoints = 0;
  if (foodGroup.includes('fruit') || foodGroup.includes('vegetable')) {
    fvnPoints = 5; // Whole fruits/vegetables
  } else if (foodGroup.includes('nut') || foodGroup.includes('legume')) {
    fvnPoints = 4;
  } else if (vitaminC > 50) {
    fvnPoints = 3; // Significant fruit/veg content
  } else if (vitaminC > 20) {
    fvnPoints = 2;
  } else if (vitaminC > 5) {
    fvnPoints = 1;
  }

  points += fvnPoints;

  return Math.min(15, points); // Cap at 15
}

/**
 * Calculate final Nutri-Score grade
 * Returns both the grade (A-E mapped to A-F) and the raw score
 */
function calculateNutriScore(nutrition: NutritionInput): { grade: HealthGrade; score: number; points: number } {
  const negativePoints = calculateNegativePoints(nutrition);
  const positivePoints = calculatePositivePoints(nutrition);

  // Special rule: if negative points >= 11, protein doesn't count unless fiber >= 5
  let finalPositive = positivePoints;
  if (negativePoints >= 11) {
    const servingGrams = nutrition.servingGrams || 100;
    const fiberPer100g = (nutrition.fiber / servingGrams) * 100;
    const proteinPer100g = (nutrition.protein / servingGrams) * 100;

    // Calculate protein points to potentially exclude
    const proteinThresholds = [1.6, 3.2, 4.8, 6.4, 8.0];
    const proteinPoints = proteinThresholds.filter(t => proteinPer100g > t).length;

    // Only count protein if fiber is high enough or FVN is 5
    const fiberPoints = [0.9, 1.9, 2.8, 3.7, 4.7].filter(t => fiberPer100g > t).length;
    const foodGroup = nutrition.foodGroup?.toLowerCase() || '';
    const isFVN5 = foodGroup.includes('fruit') || foodGroup.includes('vegetable');

    if (fiberPoints < 5 && !isFVN5) {
      finalPositive = positivePoints - proteinPoints;
    }
  }

  const finalScore = negativePoints - finalPositive;

  // Convert to grade
  // Nutri-Score ranges: A (-1 or less), B (0-2), C (3-10), D (11-18), E (19+)
  // We map E to F for consistency with our system
  let grade: HealthGrade;
  if (nutrition.isBeverage) {
    // Beverages have stricter thresholds
    if (finalScore <= 1) grade = 'A';
    else if (finalScore <= 5) grade = 'B';
    else if (finalScore <= 9) grade = 'C';
    else if (finalScore <= 13) grade = 'D';
    else grade = 'F';
  } else {
    if (finalScore <= -1) grade = 'A';
    else if (finalScore <= 2) grade = 'B';
    else if (finalScore <= 10) grade = 'C';
    else if (finalScore <= 18) grade = 'D';
    else grade = 'F';
  }

  // Convert to 0-100 score (inverted, since lower Nutri-Score = better)
  // Range is roughly -15 to +40
  const normalizedScore = Math.round(100 - ((finalScore + 15) / 55) * 100);
  const clampedScore = Math.max(0, Math.min(100, normalizedScore));

  return { grade, score: clampedScore, points: finalScore };
}

// ============================================================================
// FOCUS-SPECIFIC GRADING
// Threshold-based scoring using DRI/AHA/WHO guidelines
// ============================================================================

/**
 * Calculate a score component based on value and thresholds
 * Returns 0-100 contribution
 */
function scoreComponent(
  value: number,
  thresholds: { excellent: number; good: number; fair: number; poor: number },
  higherIsBetter: boolean = true
): number {
  if (higherIsBetter) {
    if (value >= thresholds.excellent) return 100;
    if (value >= thresholds.good) return 80;
    if (value >= thresholds.fair) return 60;
    if (value >= thresholds.poor) return 40;
    return 20;
  } else {
    // Lower is better
    if (value <= thresholds.excellent) return 100;
    if (value <= thresholds.good) return 80;
    if (value <= thresholds.fair) return 60;
    if (value <= thresholds.poor) return 40;
    return 20;
  }
}

function scoreToGrade(score: number): HealthGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Grade for Balanced/General nutrition
 */
function gradeBalanced(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Key factors: protein adequacy, fiber, moderate calories, low sat fat
  const proteinScore = scoreComponent(n.protein, { excellent: 20, good: 15, fair: 10, poor: 5 });
  const fiberScore = scoreComponent(n.fiber, { excellent: 8, good: 5, fair: 3, poor: 1 });
  const satFatScore = scoreComponent(n.saturatedFat, { excellent: 2, good: 4, fair: 6, poor: 10 }, false);
  const sodiumScore = scoreComponent(n.sodium, { excellent: 300, good: 500, fair: 700, poor: 1000 }, false);
  const sugarScore = scoreComponent(n.sugar, { excellent: 5, good: 10, fair: 15, poor: 25 }, false);

  // Weight: protein 25%, fiber 25%, satFat 20%, sodium 15%, sugar 15%
  const score = Math.round(
    proteinScore * 0.25 +
    fiberScore * 0.25 +
    satFatScore * 0.20 +
    sodiumScore * 0.15 +
    sugarScore * 0.15
  );

  // Generate insights
  if (n.protein >= 15) pros.push('Good protein content');
  if (n.fiber >= 5) pros.push('Good fiber source');
  if (n.saturatedFat <= 3) pros.push('Low saturated fat');

  if (n.saturatedFat > 6) cons.push('High in saturated fat');
  if (n.sodium > 700) cons.push('High sodium');
  if (n.sugar > 15) cons.push('High sugar content');
  if (n.fiber < 2) cons.push('Low fiber');

  return {
    grade: scoreToGrade(score),
    score,
    insight: generateBalancedInsight(score, n),
    pros,
    cons,
  };
}

function generateBalancedInsight(score: number, n: NutritionInput): string {
  if (score >= 85) return 'Nutrient-dense with balanced macros and minimal negatives.';
  if (score >= 70) return 'Good nutritional profile with minor areas for improvement.';
  if (score >= 55) return 'Moderate nutrition - consider balancing with healthier options.';
  if (score >= 40) return 'Several nutritional concerns - best enjoyed occasionally.';
  return 'Low nutritional value relative to calories.';
}

/**
 * Grade for Muscle Building focus
 * Prioritizes protein, lenient on calories/fat
 */
function gradeMuscleBuilding(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Protein is king here
  // DRI: 0.8g/kg, athletes: 1.6-2.2g/kg
  // Per meal: 25-40g optimal for muscle protein synthesis
  const proteinScore = scoreComponent(n.protein, { excellent: 30, good: 20, fair: 12, poor: 6 });

  // Protein quality indicator (complete proteins)
  // Approximated by presence of animal protein or legumes
  const foodGroup = n.foodGroup?.toLowerCase() || '';
  const isCompleteProtein =
    foodGroup.includes('meat') ||
    foodGroup.includes('fish') ||
    foodGroup.includes('egg') ||
    foodGroup.includes('dairy') ||
    foodGroup.includes('legume');
  const qualityBonus = isCompleteProtein ? 10 : 0;

  // Moderate carbs for energy (not penalized)
  const carbScore = n.carbs >= 15 && n.carbs <= 60 ? 80 : 60;

  // Leucine-rich foods (estimated by protein density)
  const proteinDensity = n.calories > 0 ? (n.protein / n.calories) * 100 : 0;
  const densityScore = scoreComponent(proteinDensity, { excellent: 15, good: 10, fair: 5, poor: 2 });

  // Weight: protein 60%, quality bonus, density 20%, carbs 10%
  const score = Math.round(
    proteinScore * 0.60 +
    qualityBonus +
    densityScore * 0.20 +
    carbScore * 0.10
  );

  if (n.protein >= 25) pros.push('Excellent protein for muscle synthesis');
  else if (n.protein >= 18) pros.push('Good protein content');
  if (isCompleteProtein) pros.push('Complete amino acid profile');
  if (proteinDensity > 10) pros.push('High protein density');

  if (n.protein < 8) cons.push('Very low protein');
  if (n.calories > 600 && n.protein < 20) cons.push('High calories without proportional protein');

  return {
    grade: scoreToGrade(score),
    score,
    insight: n.protein >= 25
      ? 'Excellent for muscle protein synthesis with optimal protein content.'
      : n.protein >= 18
        ? 'Good protein source to support muscle building.'
        : n.protein >= 10
          ? 'Moderate protein - pair with other protein sources.'
          : 'Low protein content - not ideal for muscle building alone.',
    pros,
    cons,
  };
}

/**
 * Grade for Heart Health focus
 * Strict on sat fat, sodium, cholesterol
 */
function gradeHeartHealth(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // AHA guidelines: <6% of calories from sat fat, <2300mg sodium/day
  const satFatScore = scoreComponent(n.saturatedFat, { excellent: 2, good: 4, fair: 7, poor: 12 }, false);
  const sodiumScore = scoreComponent(n.sodium, { excellent: 300, good: 500, fair: 800, poor: 1200 }, false);
  const transFatScore = (n.transFat || 0) > 0.5 ? 0 : 100;
  const cholesterolScore = scoreComponent(n.cholesterol || 0, { excellent: 50, good: 100, fair: 150, poor: 250 }, false);

  // Positive factors
  const fiberScore = scoreComponent(n.fiber, { excellent: 8, good: 5, fair: 3, poor: 1 });
  const potassiumScore = n.potassium ? scoreComponent(n.potassium, { excellent: 500, good: 300, fair: 150, poor: 50 }) : 50;

  // Omega-3 bonus
  const omega3Bonus = (n.omega3 || 0) > 0.5 ? 10 : 0;

  // Weight: satFat 30%, sodium 25%, transFat 10%, cholesterol 10%, fiber 15%, potassium 10%
  const score = Math.round(
    satFatScore * 0.30 +
    sodiumScore * 0.25 +
    transFatScore * 0.10 +
    cholesterolScore * 0.10 +
    fiberScore * 0.15 +
    potassiumScore * 0.10 +
    omega3Bonus
  );

  if (n.saturatedFat <= 3) pros.push('Low saturated fat');
  if (n.sodium <= 400) pros.push('Low sodium');
  if (n.fiber >= 5) pros.push('Heart-healthy fiber');
  if ((n.potassium || 0) >= 300) pros.push('Good potassium source');
  if ((n.omega3 || 0) > 0.5) pros.push('Contains omega-3 fatty acids');

  if (n.saturatedFat > 7) cons.push('High saturated fat');
  if (n.sodium > 800) cons.push('High sodium');
  if ((n.transFat || 0) > 0) cons.push('Contains trans fat');
  if ((n.cholesterol || 0) > 150) cons.push('High cholesterol');

  return {
    grade: scoreToGrade(score),
    score,
    insight: score >= 85
      ? 'Heart-healthy profile with low saturated fat and sodium.'
      : score >= 70
        ? 'Generally supportive of heart health with minor concerns.'
        : score >= 55
          ? 'Some heart health concerns - balance with cardio-protective foods.'
          : 'Multiple heart health risk factors present.',
    pros,
    cons,
  };
}

/**
 * Grade for Energy & Endurance focus
 * Complex carbs, iron, B vitamins
 */
function gradeEnergyEndurance(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Complex carbs (approximated by carbs - sugar ratio)
  const complexCarbRatio = n.carbs > 0 ? (n.carbs - n.sugar) / n.carbs : 0;
  const carbScore = n.carbs >= 30 && complexCarbRatio >= 0.6 ? 100 :
                    n.carbs >= 20 && complexCarbRatio >= 0.5 ? 80 :
                    n.carbs >= 10 ? 60 : 40;

  // Iron (important for oxygen transport)
  const ironScore = n.iron ? scoreComponent(n.iron, { excellent: 4, good: 2.5, fair: 1.5, poor: 0.5 }) : 50;

  // Magnesium (ATP production)
  const magScore = n.magnesium ? scoreComponent(n.magnesium, { excellent: 80, good: 50, fair: 25, poor: 10 }) : 50;

  // Fiber for sustained release
  const fiberScore = scoreComponent(n.fiber, { excellent: 6, good: 4, fair: 2, poor: 1 });

  // Penalize simple sugars without fiber (blood sugar spikes)
  const sugarPenalty = n.sugar > 15 && n.fiber < 3 ? 20 : 0;

  // Weight: carbs 35%, iron 20%, magnesium 15%, fiber 20%, plus penalty
  const score = Math.round(
    carbScore * 0.35 +
    ironScore * 0.20 +
    magScore * 0.15 +
    fiberScore * 0.20 +
    10 // base points
  ) - sugarPenalty;

  if (complexCarbRatio >= 0.7 && n.carbs >= 25) pros.push('Good complex carbohydrates');
  if ((n.iron || 0) >= 3) pros.push('Iron for oxygen transport');
  if ((n.magnesium || 0) >= 50) pros.push('Magnesium for ATP production');
  if (n.fiber >= 4) pros.push('Sustained energy release');

  if (n.sugar > 15 && n.fiber < 3) cons.push('High sugar may cause energy crash');
  if (n.carbs < 10) cons.push('Low carbs may limit endurance');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Excellent sustained energy source with complex carbs and key minerals.'
      : score >= 70
        ? 'Good for energy with sustained release nutrients.'
        : score >= 55
          ? 'Moderate energy profile - may not sustain long activity.'
          : 'Limited energy-supporting nutrients.',
    pros,
    cons,
  };
}

/**
 * Grade for Weight Management focus
 * Strict on calories, reward satiety (protein, fiber)
 */
function gradeWeightManagement(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Calorie density (calories per gram)
  const servingGrams = n.servingGrams || 100;
  const calorieDensity = n.calories / servingGrams;

  // Low calorie density = more food volume for fewer calories
  const densityScore = scoreComponent(calorieDensity, { excellent: 0.8, good: 1.2, fair: 1.8, poor: 2.5 }, false);

  // Protein for satiety (4 cal/g but very satiating)
  const proteinScore = scoreComponent(n.protein, { excellent: 25, good: 18, fair: 12, poor: 5 });

  // Fiber for fullness
  const fiberScore = scoreComponent(n.fiber, { excellent: 8, good: 5, fair: 3, poor: 1 });

  // Penalize high sugar (insulin spikes increase hunger)
  const sugarScore = scoreComponent(n.sugar, { excellent: 3, good: 8, fair: 15, poor: 25 }, false);

  // Weight: calorie density 30%, protein 30%, fiber 25%, sugar 15%
  const score = Math.round(
    densityScore * 0.30 +
    proteinScore * 0.30 +
    fiberScore * 0.25 +
    sugarScore * 0.15
  );

  if (calorieDensity <= 1.0) pros.push('Low calorie density');
  if (n.protein >= 18) pros.push('High protein for satiety');
  if (n.fiber >= 5) pros.push('Fiber promotes fullness');
  if (n.calories <= 200 && n.protein >= 10) pros.push('Low cal with good protein');

  if (calorieDensity > 2.0) cons.push('High calorie density');
  if (n.sugar > 15) cons.push('High sugar may increase hunger');
  if (n.calories > 500 && n.protein < 15) cons.push('High calories without satiety');

  return {
    grade: scoreToGrade(score),
    score,
    insight: score >= 85
      ? 'Excellent for weight management - filling with controlled calories.'
      : score >= 70
        ? 'Supportive of weight goals with good satiety factors.'
        : score >= 55
          ? 'Moderate - watch portions to fit calorie goals.'
          : 'High calorie density with limited satiety.',
    pros,
    cons,
  };
}

/**
 * Grade for Brain & Focus
 * Omega-3, antioxidants, stable blood sugar
 */
function gradeBrainFocus(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Omega-3 (critical for brain)
  const omega3Score = n.omega3 ? scoreComponent(n.omega3, { excellent: 1, good: 0.5, fair: 0.2, poor: 0.05 }) : 40;

  // Low glycemic (stable energy for brain)
  const glycemicScore = n.sugar < 8 && n.fiber >= 3 ? 100 :
                        n.sugar < 12 && n.fiber >= 2 ? 80 :
                        n.sugar < 18 ? 60 : 40;

  // Antioxidants (approximated by vitamin C, vitamin E)
  const vitCScore = n.vitaminC ? scoreComponent(n.vitaminC, { excellent: 30, good: 15, fair: 8, poor: 2 }) : 50;

  // Choline (not in input but important)
  // We approximate by food group
  const foodGroup = n.foodGroup?.toLowerCase() || '';
  const cholineBonus = foodGroup.includes('egg') || foodGroup.includes('fish') ? 15 : 0;

  // Trans fat is particularly bad for brain
  const transFatPenalty = (n.transFat || 0) > 0 ? 15 : 0;

  // Weight: omega3 30%, glycemic 25%, antioxidants 20%, fiber 15%, plus bonuses
  const score = Math.round(
    omega3Score * 0.30 +
    glycemicScore * 0.25 +
    vitCScore * 0.20 +
    scoreComponent(n.fiber, { excellent: 6, good: 4, fair: 2, poor: 1 }) * 0.15 +
    10 + cholineBonus
  ) - transFatPenalty;

  if ((n.omega3 || 0) >= 0.5) pros.push('Omega-3s for brain health');
  if (n.sugar < 8 && n.fiber >= 3) pros.push('Stable blood sugar for focus');
  if ((n.vitaminC || 0) >= 15) pros.push('Antioxidants protect brain cells');
  if (cholineBonus > 0) pros.push('Contains choline for neurotransmitters');

  if ((n.transFat || 0) > 0) cons.push('Trans fat harms brain function');
  if (n.sugar > 20) cons.push('High sugar impairs focus');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Brain-boosting nutrients with stable energy release.'
      : score >= 70
        ? 'Supportive of cognitive function and focus.'
        : score >= 55
          ? 'Some brain benefits but watch sugar content.'
          : 'Limited brain-supporting nutrients.',
    pros,
    cons,
  };
}

/**
 * Grade for Gut Health focus
 * Fiber is king, prebiotics, fermented
 */
function gradeGutHealth(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Fiber is primary (daily target: 25-35g)
  // Per meal: 8g+ is excellent
  const fiberScore = scoreComponent(n.fiber, { excellent: 8, good: 5, fair: 3, poor: 1 });

  // Prebiotic foods bonus (approximated by food group)
  const foodGroup = n.foodGroup?.toLowerCase() || '';
  const prebioticBonus =
    foodGroup.includes('legume') ||
    foodGroup.includes('onion') ||
    foodGroup.includes('garlic') ||
    foodGroup.includes('banana') ||
    foodGroup.includes('oat') ? 15 : 0;

  // Fermented foods bonus
  const fermentedBonus =
    foodGroup.includes('yogurt') ||
    foodGroup.includes('kefir') ||
    foodGroup.includes('kimchi') ||
    foodGroup.includes('sauerkraut') ? 15 : 0;

  // Ultra-processed foods harm gut (approximated by trans fat, high sodium)
  const processedPenalty =
    ((n.transFat || 0) > 0 ? 10 : 0) +
    (n.sodium > 1000 ? 10 : 0);

  // Weight: fiber 70%, plus bonuses minus penalty
  const score = Math.round(
    fiberScore * 0.70 +
    20 + prebioticBonus + fermentedBonus
  ) - processedPenalty;

  if (n.fiber >= 8) pros.push('Excellent fiber for microbiome');
  else if (n.fiber >= 5) pros.push('Good fiber content');
  if (prebioticBonus > 0) pros.push('Contains prebiotic fibers');
  if (fermentedBonus > 0) pros.push('Fermented - live probiotics');

  if (n.fiber < 2) cons.push('Very low fiber');
  if (processedPenalty > 10) cons.push('Processing may harm gut health');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Excellent for gut health with high fiber and beneficial compounds.'
      : score >= 70
        ? 'Good fiber source supporting digestive health.'
        : score >= 55
          ? 'Moderate fiber - aim for more fiber-rich foods.'
          : 'Low fiber content - not ideal for gut health.',
    pros,
    cons,
  };
}

/**
 * Grade for Blood Sugar Balance
 * Low glycemic, fiber, protein
 */
function gradeBloodSugar(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Sugar is primary concern
  const sugarScore = scoreComponent(n.sugar, { excellent: 3, good: 8, fair: 15, poor: 25 }, false);

  // Fiber slows glucose absorption
  const fiberScore = scoreComponent(n.fiber, { excellent: 8, good: 5, fair: 3, poor: 1 });

  // Protein moderates blood sugar response
  const proteinScore = scoreComponent(n.protein, { excellent: 20, good: 12, fair: 6, poor: 3 });

  // Complex vs simple carbs
  const complexCarbRatio = n.carbs > 0 ? (n.carbs - n.sugar) / n.carbs : 1;
  const carbQualityScore = complexCarbRatio >= 0.8 ? 100 :
                           complexCarbRatio >= 0.6 ? 80 :
                           complexCarbRatio >= 0.4 ? 60 : 40;

  // Very high carbs without fiber is worse
  const carbLoadPenalty = n.carbs > 50 && n.fiber < 5 ? 15 : 0;

  // Weight: sugar 35%, fiber 25%, protein 20%, carb quality 20%
  const score = Math.round(
    sugarScore * 0.35 +
    fiberScore * 0.25 +
    proteinScore * 0.20 +
    carbQualityScore * 0.20
  ) - carbLoadPenalty;

  if (n.sugar < 5) pros.push('Very low sugar');
  if (n.fiber >= 5) pros.push('Fiber slows glucose absorption');
  if (n.protein >= 15 && n.carbs < 30) pros.push('Protein moderates blood sugar');
  if (complexCarbRatio >= 0.7) pros.push('Complex carbohydrates');

  if (n.sugar > 15) cons.push('High sugar content');
  if (n.carbs > 50 && n.fiber < 5) cons.push('High carb load without fiber');
  if (complexCarbRatio < 0.5) cons.push('Mostly simple carbs');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Excellent for blood sugar stability with minimal glucose impact.'
      : score >= 70
        ? 'Good blood sugar profile with balanced macros.'
        : score >= 55
          ? 'Moderate blood sugar impact - pair with protein/fiber.'
          : 'May cause blood sugar spikes.',
    pros,
    cons,
  };
}

/**
 * Grade for Bone & Joint Support
 * Calcium, vitamin D, anti-inflammatory
 */
function gradeBoneJoint(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Calcium (DRI: 1000mg/day, so ~300mg per meal is good)
  const calciumScore = n.calcium ? scoreComponent(n.calcium, { excellent: 300, good: 150, fair: 75, poor: 25 }) : 40;

  // Vitamin D (helps calcium absorption)
  const vitDScore = n.vitaminD ? scoreComponent(n.vitaminD, { excellent: 5, good: 2.5, fair: 1, poor: 0.3 }) : 40;

  // Magnesium (bone matrix)
  const magScore = n.magnesium ? scoreComponent(n.magnesium, { excellent: 80, good: 50, fair: 25, poor: 10 }) : 40;

  // High sodium causes calcium loss
  const sodiumPenalty = n.sodium > 800 ? scoreComponent(n.sodium, { excellent: 400, good: 600, fair: 1000, poor: 1500 }, false) * 0.2 : 0;

  // Omega-3 for joint inflammation
  const omega3Bonus = (n.omega3 || 0) >= 0.5 ? 10 : 0;

  // Weight: calcium 35%, vitD 25%, magnesium 20%, plus bonuses
  const score = Math.round(
    calciumScore * 0.35 +
    vitDScore * 0.25 +
    magScore * 0.20 +
    15 + omega3Bonus
  ) - Math.round(sodiumPenalty);

  if ((n.calcium || 0) >= 150) pros.push('Good calcium for bones');
  if ((n.vitaminD || 0) >= 2) pros.push('Vitamin D aids calcium absorption');
  if ((n.magnesium || 0) >= 50) pros.push('Magnesium for bone matrix');
  if ((n.omega3 || 0) >= 0.5) pros.push('Omega-3 supports joint health');

  if ((n.calcium || 0) < 50) cons.push('Low calcium content');
  if (n.sodium > 1000) cons.push('High sodium may deplete calcium');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Excellent bone-building nutrients present.'
      : score >= 70
        ? 'Good support for bone and joint health.'
        : score >= 55
          ? 'Some bone-supporting nutrients.'
          : 'Limited bone-building nutrients.',
    pros,
    cons,
  };
}

/**
 * Grade for Anti-Inflammatory focus
 * Omega-3, antioxidants, avoid processed
 */
function gradeAntiInflammatory(n: NutritionInput): FocusGradeResult {
  const pros: string[] = [];
  const cons: string[] = [];

  // Omega-3 is most important
  const omega3Score = n.omega3 ? scoreComponent(n.omega3, { excellent: 1, good: 0.5, fair: 0.2, poor: 0.05 }) : 40;

  // Saturated fat promotes inflammation
  const satFatScore = scoreComponent(n.saturatedFat, { excellent: 2, good: 4, fair: 7, poor: 12 }, false);

  // Sugar promotes inflammation
  const sugarScore = scoreComponent(n.sugar, { excellent: 5, good: 10, fair: 15, poor: 25 }, false);

  // Antioxidants (vitamin C as proxy)
  const antioxidantScore = n.vitaminC ? scoreComponent(n.vitaminC, { excellent: 30, good: 15, fair: 8, poor: 2 }) : 50;

  // Fiber (supports anti-inflammatory gut bacteria)
  const fiberScore = scoreComponent(n.fiber, { excellent: 6, good: 4, fair: 2, poor: 1 });

  // Trans fat is highly inflammatory
  const transFatPenalty = (n.transFat || 0) > 0 ? 20 : 0;

  // Colorful plants bonus (approximated by food group)
  const foodGroup = n.foodGroup?.toLowerCase() || '';
  const plantBonus =
    foodGroup.includes('fruit') ||
    foodGroup.includes('vegetable') ||
    foodGroup.includes('berry') ? 10 : 0;

  // Weight: omega3 25%, satFat 25%, sugar 20%, antioxidants 15%, fiber 15%
  const score = Math.round(
    omega3Score * 0.25 +
    satFatScore * 0.25 +
    sugarScore * 0.20 +
    antioxidantScore * 0.15 +
    fiberScore * 0.15 +
    plantBonus
  ) - transFatPenalty;

  if ((n.omega3 || 0) >= 0.5) pros.push('Anti-inflammatory omega-3s');
  if (n.saturatedFat <= 3) pros.push('Low saturated fat');
  if ((n.vitaminC || 0) >= 15) pros.push('Antioxidants reduce inflammation');
  if (plantBonus > 0) pros.push('Plant compounds with anti-inflammatory effects');

  if ((n.transFat || 0) > 0) cons.push('Trans fat promotes inflammation');
  if (n.saturatedFat > 7) cons.push('High saturated fat is pro-inflammatory');
  if (n.sugar > 15) cons.push('Excess sugar increases inflammation');

  return {
    grade: scoreToGrade(Math.max(0, score)),
    score: Math.max(0, score),
    insight: score >= 85
      ? 'Strong anti-inflammatory profile with protective nutrients.'
      : score >= 70
        ? 'Generally anti-inflammatory with some beneficial compounds.'
        : score >= 55
          ? 'Neutral inflammation impact.'
          : 'Pro-inflammatory factors present.',
    pros,
    cons,
  };
}

// ============================================================================
// DERIVED METRICS
// ============================================================================

/**
 * Calculate Satiety Score based on Holt 1995 research
 * Reference: Holt et al., "A Satiety Index of common foods", European Journal of Clinical Nutrition, 1995
 *
 * Factors that increase satiety: protein, fiber, water content, volume
 * Factors that decrease satiety: fat, energy density
 */
function calculateSatietyScore(n: NutritionInput): number {
  const servingGrams = n.servingGrams || 100;

  // Protein effect (strong positive correlation)
  const proteinPer100g = (n.protein / servingGrams) * 100;
  const proteinContribution = Math.min(30, proteinPer100g * 1.5);

  // Fiber effect (strong positive correlation)
  const fiberPer100g = (n.fiber / servingGrams) * 100;
  const fiberContribution = Math.min(25, fiberPer100g * 5);

  // Water content effect (positive correlation - volume without calories)
  const waterPer100g = n.water ? (n.water / servingGrams) * 100 : 50; // Estimate if not provided
  const waterContribution = Math.min(20, waterPer100g * 0.25);

  // Energy density effect (negative correlation)
  const energyDensity = (n.calories / servingGrams) * 100;
  const densityPenalty = Math.min(25, energyDensity * 0.08);

  // Fat effect (slight negative correlation, but less than energy density)
  const fatPer100g = (n.fat / servingGrams) * 100;
  const fatPenalty = Math.min(15, fatPer100g * 0.3);

  // Base score + contributions - penalties
  const score = 40 + proteinContribution + fiberContribution + waterContribution - densityPenalty - fatPenalty;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate simplified Dietary Inflammatory Index (DII)
 * Based on Shivappa et al., "Designing and developing a literature-derived,
 * population-based dietary inflammatory index", Public Health Nutrition, 2014
 *
 * Full DII uses 45 nutrients, we use the most impactful ones available
 * Negative = anti-inflammatory, Positive = pro-inflammatory
 */
function calculateInflammatoryIndex(n: NutritionInput): number {
  // Simplified coefficients based on DII research
  // Each nutrient's inflammatory effect per typical serving

  let index = 0;

  // PRO-INFLAMMATORY (positive contribution)
  // Saturated fat: +0.373 per 10g
  index += n.saturatedFat * 0.0373;

  // Trans fat: ~+0.5 per g (estimated from research)
  index += (n.transFat || 0) * 0.5;

  // Sugar: +0.1 per 10g
  index += n.sugar * 0.01;

  // Cholesterol: +0.021 per 50mg
  index += (n.cholesterol || 0) * 0.00042;

  // ANTI-INFLAMMATORY (negative contribution)
  // Fiber: -0.663 per 10g
  index -= n.fiber * 0.0663;

  // Omega-3: -0.436 per g
  index -= (n.omega3 || 0) * 0.436;

  // Magnesium: -0.484 per 100mg
  index -= (n.magnesium || 0) * 0.00484;

  // Vitamin C: -0.424 per 50mg
  index -= (n.vitaminC || 0) * 0.00848;

  // Vitamin E: -0.419 per 5mg
  // (not in our input, but would be here)

  // Iron: -0.032 per 5mg (mild anti-inflammatory effect)
  index -= (n.iron || 0) * 0.0064;

  // Round to 2 decimal places
  return Math.round(index * 100) / 100;
}

// ============================================================================
// MAIN GRADING FUNCTION
// ============================================================================

/**
 * Calculate deterministic grades for all focuses
 * No AI calls - pure mathematical formulas
 */
export function calculateDeterministicGrades(nutrition: NutritionInput): DeterministicGradingResult {
  // Calculate Nutri-Score for overall grade
  const nutriScore = calculateNutriScore(nutrition);

  // Calculate all focus grades
  const focusGrades: Record<WellnessFocus, FocusGradeResult> = {
    balanced: gradeBalanced(nutrition),
    muscle_building: gradeMuscleBuilding(nutrition),
    heart_health: gradeHeartHealth(nutrition),
    energy_endurance: gradeEnergyEndurance(nutrition),
    weight_management: gradeWeightManagement(nutrition),
    brain_focus: gradeBrainFocus(nutrition),
    gut_health: gradeGutHealth(nutrition),
    blood_sugar_balance: gradeBloodSugar(nutrition),
    bone_joint_support: gradeBoneJoint(nutrition),
    anti_inflammatory: gradeAntiInflammatory(nutrition),
  };

  // Calculate derived metrics
  const satietyScore = calculateSatietyScore(nutrition);
  const inflammatoryIndex = calculateInflammatoryIndex(nutrition);

  // Compile primary concerns and strengths from all focus grades
  const allConcerns: string[] = [];
  const allStrengths: string[] = [];

  for (const result of Object.values(focusGrades)) {
    allConcerns.push(...result.cons);
    allStrengths.push(...result.pros);
  }

  // Deduplicate and limit
  const uniqueConcerns = [...new Set(allConcerns)].slice(0, 5);
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);

  return {
    overallGrade: nutriScore.grade,
    overallScore: nutriScore.score,
    nutriScorePoints: nutriScore.points,
    focusGrades,
    satietyScore,
    inflammatoryIndex,
    primaryConcerns: uniqueConcerns,
    strengths: uniqueStrengths,
  };
}

/**
 * Quick grade for a single focus (more efficient when you only need one)
 */
export function gradeSingleFocus(nutrition: NutritionInput, focus: WellnessFocus): FocusGradeResult {
  switch (focus) {
    case 'balanced': return gradeBalanced(nutrition);
    case 'muscle_building': return gradeMuscleBuilding(nutrition);
    case 'heart_health': return gradeHeartHealth(nutrition);
    case 'energy_endurance': return gradeEnergyEndurance(nutrition);
    case 'weight_management': return gradeWeightManagement(nutrition);
    case 'brain_focus': return gradeBrainFocus(nutrition);
    case 'gut_health': return gradeGutHealth(nutrition);
    case 'blood_sugar_balance': return gradeBloodSugar(nutrition);
    case 'bone_joint_support': return gradeBoneJoint(nutrition);
    case 'anti_inflammatory': return gradeAntiInflammatory(nutrition);
  }
}

/**
 * Get Nutri-Score only (for overall grade without focus grades)
 */
export function getNutriScore(nutrition: NutritionInput): { grade: HealthGrade; score: number } {
  const result = calculateNutriScore(nutrition);
  return { grade: result.grade, score: result.score };
}
