/**
 * Nutrition Types
 *
 * Shared TypeScript definitions for the nutrition evaluation system.
 * These types mirror the JSON schema files which are the single source of truth.
 */

// =============================================================================
// Core Enums and Literals
// =============================================================================

/** Biological sex for DRI lookup */
export type Sex = 'male' | 'female';

/** Life stage groups matching DRI tables */
export type LifeStageGroup =
  | 'infants_0_6mo'
  | 'infants_7_12mo'
  | 'children_1_3'
  | 'children_4_8'
  | 'children_9_13'
  | 'adolescents_14_18'
  | 'adults_19_30'
  | 'adults_31_50'
  | 'adults_51_70'
  | 'adults_70_plus'
  | 'pregnancy_14_18'
  | 'pregnancy_19_30'
  | 'pregnancy_31_50'
  | 'lactation_14_18'
  | 'lactation_19_30'
  | 'lactation_31_50';

/** Types of Dietary Reference Intakes */
export type DriType = 'RDA' | 'AI' | 'UL' | 'AMDR' | 'CDRR' | 'EAR';

/** Activity level for calorie calculation */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';

/** User's nutrition goal */
export type NutritionGoal =
  | 'weight_loss'
  | 'maintenance'
  | 'weight_gain'
  | 'muscle_gain'
  | 'performance';

/** Nutrient classification for evaluation */
export type NutrientClassification = 'beneficial' | 'limit' | 'risk' | 'neutral' | 'context_dependent';

/** Evaluation status for beneficial nutrients */
export type BeneficialStatus = 'excellent' | 'good' | 'below_target' | 'low';

/** Evaluation status for limit nutrients */
export type LimitStatus = 'well_within' | 'moderate' | 'approaching_limit' | 'exceeds_limit';

/** Combined evaluation status */
export type EvaluationStatus = BeneficialStatus | LimitStatus | 'adequate' | 'unknown';

// =============================================================================
// Nutrient Definition Types (from nutrient_definitions.json)
// =============================================================================

/** Clinical interpretation guidance for a nutrient */
export interface ClinicalInterpretation {
  lowIntake: string;
  adequateIntake: string;
  highIntake: string;
  context?: string;
}

/** Educational information about a nutrient */
export interface NutrientEducation {
  whatItDoes: string;
  foodSources: string[];
  absorptionNotes?: string;
  specialConsiderations?: string[];
}

/** Complete nutrient definition from JSON */
export interface NutrientDefinition {
  nutrientId: string;
  displayName: string;
  shortName?: string;
  unit: string;
  category: string;
  subCategory?: string;
  description?: string;
  classification: NutrientClassification;
  education?: NutrientEducation;
  clinicalInterpretation?: ClinicalInterpretation;
}

// =============================================================================
// DRI Types (from dri_values.json)
// =============================================================================

/** Single DRI entry for a nutrient/life-stage/sex combination */
export interface DriEntry {
  nutrientId: string;
  lifeStageGroup: LifeStageGroup;
  sex: Sex | 'both';
  type: DriType;
  value: number | null;
  unit: string;
  footnote?: string;
}

/** AMDR (Acceptable Macronutrient Distribution Range) */
export interface AmdrRange {
  nutrientId: string;
  lifeStageGroup: LifeStageGroup;
  minPercent: number;
  maxPercent: number;
  kcalPerGram: number;
}

// =============================================================================
// FDA Daily Values (from fda_daily_values.json)
// =============================================================================

/** FDA Daily Value entry */
export interface FdaDailyValue {
  nutrientId: string;
  unit: string;
  adults_and_children_4plus: number | null;
  children_1_3: number | null;
  infants: number | null;
  pregnancy_lactation: number | null;
  notes?: string[];
}

// =============================================================================
// User Profile Types
// =============================================================================

/** User profile for nutrition calculations */
export interface NutritionUserProfile {
  userId: string;
  dateOfBirth: string; // ISO date string
  sex: Sex;
  weightKg?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  isPregnant?: boolean;
  isLactating?: boolean;
  conditions?: string[]; // e.g., 'ckd_stage_3_4', 'hypertension', 'diabetes_type_2'
}

/** Age information derived from profile */
export interface AgeInfo {
  years: number;
  months: number;
  lifeStageGroup: LifeStageGroup;
}

/** Energy calculation result */
export interface EnergyCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  activityMultiplier: number;
  goalAdjustment: number;
  method: 'mifflin_st_jeor' | 'default';
}

// =============================================================================
// Target Types
// =============================================================================

/** Personalized target for a single nutrient */
export interface NutrientTarget {
  nutrientId: string;
  displayName: string;
  unit: string;
  target?: number; // Primary target (RDA or AI)
  targetType?: 'RDA' | 'AI';
  upperLimit?: number; // UL
  cdrrLimit?: number; // CDRR (for sodium)
  dailyValue?: number; // FDA DV
  amdrMin?: number; // AMDR min in grams
  amdrMax?: number; // AMDR max in grams
  amdrMinPercent?: number;
  amdrMaxPercent?: number;
  source: string; // e.g., "RDA adults_19_30 male"
}

/** Complete set of user's personalized targets */
export interface UserNutritionTargets {
  calories: number;
  nutrients: Record<string, NutrientTarget>;
  profile: {
    ageYears: number;
    sex: Sex;
    lifeStageGroup: LifeStageGroup;
    activityLevel: ActivityLevel;
    goal: NutritionGoal;
  };
  computedAt: string; // ISO timestamp
}

// =============================================================================
// Intake and Evaluation Types
// =============================================================================

/** Single nutrient intake amount */
export interface NutrientIntake {
  nutrientId: string;
  amount: number;
  unit: string;
}

/** Food item with nutrients */
export interface FoodIntake {
  foodId?: string;
  name: string;
  servingSize?: string;
  nutrients: NutrientIntake[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: string; // ISO timestamp
}

/** Daily intake totals */
export interface DailyIntake {
  date: string; // YYYY-MM-DD
  foods: FoodIntake[];
  totals: Record<string, number>; // nutrientId -> total amount
}

/** Evaluation result for a single nutrient */
export interface NutrientEvaluation {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number | null;
  upperLimit: number | null;
  unit: string;
  percentOfTarget: number | null;
  percentOfLimit: number | null;
  classification: NutrientClassification;
  status: EvaluationStatus;
  statusLabel: string;
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
}

/** Evaluation result for a food item */
export interface FoodEvaluation {
  food: FoodIntake;
  nutrients: NutrientEvaluation[];
  highlights: string[];
  concerns: string[];
}

/** Score breakdown by category */
export interface ScoreBreakdown {
  beneficial: number; // 0-40
  limit: number; // 0-40
  balance: number; // 0-20
}

/** Complete day evaluation */
export interface DayEvaluation {
  date: string;
  score: number; // 0-100
  scoreLabel: string;
  scoreColor: 'green' | 'yellow' | 'orange' | 'red';
  breakdown: ScoreBreakdown;
  nutrients: NutrientEvaluation[];
  highlights: string[];
  gaps: string[];
  summary: string;
}

// =============================================================================
// Insight Types
// =============================================================================

/** Educational insight about a nutrient */
export interface NutrientInsight {
  nutrientId: string;
  displayName: string;
  title: string;
  body: string;
  foodSources?: string[];
  learnMoreUrl?: string;
}

/** Gap in nutrition (nutrient below target) */
export interface NutrientGap {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number;
  percentOfTarget: number;
  unit: string;
  suggestion: string;
}

/** Daily nutrition summary */
export interface DailySummary {
  score: number;
  caloriesConsumed: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sodiumMg: number;
  topHighlights: string[];
  topGaps: string[];
}

// =============================================================================
// History and Trends Types
// =============================================================================

/** Weekly score summary */
export interface WeeklyScore {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;
  averageScore: number;
  daysLogged: number;
  scores: { date: string; score: number }[];
}

/** Nutrient trend over time */
export interface NutrientTrend {
  nutrientId: string;
  displayName: string;
  unit: string;
  target: number | null;
  dataPoints: { date: string; value: number }[];
  averageIntake: number;
  trend: 'improving' | 'stable' | 'declining';
}

// =============================================================================
// Gamification Types
// =============================================================================

/** Streak information */
export interface StreakInfo {
  currentLoggingStreak: number;
  longestLoggingStreak: number;
  currentScoreStreak: number; // Days with score >= 75
  lastLogDate: string | null;
}

/** Achievement definition */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'score' | 'milestone' | 'discovery';
  requirement: string;
  unlockedAt?: string; // ISO timestamp when unlocked
}

// =============================================================================
// API Response Types
// =============================================================================

/** Response from evaluateDay function */
export interface EvaluateDayResponse {
  success: boolean;
  evaluation?: DayEvaluation;
  error?: string;
}

/** Response from getNutritionTargets function */
export interface GetTargetsResponse {
  success: boolean;
  targets?: UserNutritionTargets;
  error?: string;
}

/** Response from getNutrientInfo function */
export interface GetNutrientInfoResponse {
  success: boolean;
  nutrient?: NutrientDefinition;
  target?: NutrientTarget;
  education?: NutrientEducation;
  error?: string;
}
