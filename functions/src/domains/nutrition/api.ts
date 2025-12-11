/**
 * Nutrition API Module
 *
 * Cloud Functions for nutrition evaluation and insights.
 * These functions are exposed as Firebase Callable Functions.
 */

import { https } from 'firebase-functions/v2';
import type {
  NutritionUserProfile,
  DailyIntake,
  DayEvaluation,
  UserNutritionTargets,
} from '../../types/nutrition';
import { preloadAllData } from './data';
import { computeUserTargets } from './targets';
import { evaluateDay, evaluateDayWithTargets } from './evaluation';
import {
  getNutrientEducation,
  getWhyItMatters,
  getFoodSuggestions,
  type NutrientEducation,
} from './insights';

// Preload all nutrition data on cold start
preloadAllData();

// =============================================================================
// INPUT/OUTPUT TYPES
// =============================================================================

export interface EvaluateDayRequest {
  profile: NutritionUserProfile;
  intake: DailyIntake;
}

export interface EvaluateDayResponse {
  success: true;
  evaluation: DayEvaluation;
}

export interface GetTargetsRequest {
  profile: NutritionUserProfile;
}

export interface GetTargetsResponse {
  success: true;
  targets: UserNutritionTargets;
}

export interface GetNutrientInfoRequest {
  nutrientId: string;
}

export interface GetNutrientInfoResponse {
  success: true;
  nutrientId: string;
  education: NutrientEducation | null;
  whyItMatters: string;
  foodSuggestions: string[];
}

export interface EvaluateWeekRequest {
  profile: NutritionUserProfile;
  intakes: DailyIntake[];
}

export interface EvaluateWeekResponse {
  success: true;
  days: DayEvaluation[];
  averageScore: number;
  bestDay: { date: string; score: number } | null;
  trend: 'improving' | 'stable' | 'declining';
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

function validateProfile(profile: unknown): NutritionUserProfile {
  if (!profile || typeof profile !== 'object') {
    throw new https.HttpsError('invalid-argument', 'Profile is required');
  }

  const p = profile as Record<string, unknown>;

  if (!p.userId || typeof p.userId !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Profile.userId is required');
  }

  if (!p.dateOfBirth || typeof p.dateOfBirth !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Profile.dateOfBirth is required');
  }

  if (!p.sex || !['male', 'female'].includes(p.sex as string)) {
    throw new https.HttpsError('invalid-argument', 'Profile.sex must be "male" or "female"');
  }

  if (!p.activityLevel || !['sedentary', 'light', 'moderate', 'high', 'athlete'].includes(p.activityLevel as string)) {
    throw new https.HttpsError('invalid-argument', 'Profile.activityLevel must be one of: sedentary, light, moderate, high, athlete');
  }

  if (!p.goal || !['weight_loss', 'maintenance', 'weight_gain', 'muscle_gain', 'performance'].includes(p.goal as string)) {
    throw new https.HttpsError('invalid-argument', 'Profile.goal must be one of: weight_loss, maintenance, weight_gain, muscle_gain, performance');
  }

  return profile as NutritionUserProfile;
}

function validateIntake(intake: unknown): DailyIntake {
  if (!intake || typeof intake !== 'object') {
    throw new https.HttpsError('invalid-argument', 'Intake data is required');
  }

  const i = intake as Record<string, unknown>;

  if (!i.date || typeof i.date !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Intake.date is required');
  }

  if (!i.totals || typeof i.totals !== 'object') {
    throw new https.HttpsError('invalid-argument', 'Intake.totals is required');
  }

  // foods array is optional but must be array if present
  if (i.foods !== undefined && !Array.isArray(i.foods)) {
    throw new https.HttpsError('invalid-argument', 'Intake.foods must be an array');
  }

  return intake as DailyIntake;
}

// =============================================================================
// CALLABLE FUNCTION HANDLERS
// =============================================================================

/**
 * Handler for evaluateNutritionDay callable function
 */
export async function handleEvaluateDay(
  data: EvaluateDayRequest
): Promise<EvaluateDayResponse> {
  const profile = validateProfile(data.profile);
  const intake = validateIntake(data.intake);

  const evaluation = evaluateDay(profile, intake);

  return {
    success: true,
    evaluation,
  };
}

/**
 * Handler for getNutritionTargets callable function
 */
export async function handleGetTargets(
  data: GetTargetsRequest
): Promise<GetTargetsResponse> {
  const profile = validateProfile(data.profile);

  const targets = computeUserTargets(profile);

  return {
    success: true,
    targets,
  };
}

/**
 * Handler for getNutrientInfo callable function
 */
export async function handleGetNutrientInfo(
  data: GetNutrientInfoRequest
): Promise<GetNutrientInfoResponse> {
  const { nutrientId } = data;

  if (!nutrientId || typeof nutrientId !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Nutrient ID is required');
  }

  const education = getNutrientEducation(nutrientId);
  const whyItMatters = getWhyItMatters(nutrientId);
  const foodSuggestions = getFoodSuggestions(nutrientId, 10);

  return {
    success: true,
    nutrientId,
    education,
    whyItMatters,
    foodSuggestions,
  };
}

/**
 * Handler for evaluateNutritionWeek callable function
 */
export async function handleEvaluateWeek(
  data: EvaluateWeekRequest
): Promise<EvaluateWeekResponse> {
  const profile = validateProfile(data.profile);

  if (!data.intakes || !Array.isArray(data.intakes)) {
    throw new https.HttpsError('invalid-argument', 'Intakes array is required');
  }

  if (data.intakes.length === 0) {
    return {
      success: true,
      days: [],
      averageScore: 0,
      bestDay: null,
      trend: 'stable',
    };
  }

  if (data.intakes.length > 14) {
    throw new https.HttpsError('invalid-argument', 'Maximum 14 days of intake data allowed');
  }

  // Compute targets once for efficiency
  const targets = computeUserTargets(profile);

  // Evaluate each day
  const days: DayEvaluation[] = [];
  for (const intake of data.intakes) {
    const validatedIntake = validateIntake(intake);
    const evaluation = evaluateDayWithTargets(validatedIntake, targets);
    days.push(evaluation);
  }

  // Sort by date
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate average score
  const scores = days.map(d => d.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Find best day
  const bestDayEval = days.reduce(
    (best, day) => (day.score > (best?.score ?? 0) ? day : best),
    days[0]
  );
  const bestDay = bestDayEval
    ? { date: bestDayEval.date, score: bestDayEval.score }
    : null;

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (scores.length >= 4) {
    const midpoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) trend = 'improving';
    else if (secondAvg < firstAvg - 5) trend = 'declining';
  }

  return {
    success: true,
    days,
    averageScore,
    bestDay,
    trend,
  };
}

// =============================================================================
// FIREBASE CALLABLE FUNCTIONS
// =============================================================================

/**
 * Evaluate a single day's nutrition intake
 *
 * @param profile - User's nutrition profile (age, sex, activity, goal)
 * @param intake - Day's food intake with nutrient totals
 * @returns Full day evaluation with score, highlights, gaps, summary
 */
export const evaluateNutritionDay = https.onCall(
  { cors: true },
  async (request) => {
    const data = request.data as EvaluateDayRequest;
    return handleEvaluateDay(data);
  }
);

/**
 * Get personalized nutrition targets for a user
 *
 * @param profile - User's nutrition profile
 * @returns Computed daily targets for all nutrients
 */
export const getNutritionTargets = https.onCall(
  { cors: true },
  async (request) => {
    const data = request.data as GetTargetsRequest;
    return handleGetTargets(data);
  }
);

/**
 * Get educational information about a specific nutrient
 *
 * @param nutrientId - The nutrient identifier (e.g., 'vitamin_c', 'protein')
 * @returns Educational content, why it matters, food sources
 */
export const getNutrientInfo = https.onCall(
  { cors: true },
  async (request) => {
    const data = request.data as GetNutrientInfoRequest;
    return handleGetNutrientInfo(data);
  }
);

/**
 * Evaluate multiple days of nutrition intake (up to 14 days)
 *
 * @param profile - User's nutrition profile
 * @param intakes - Array of daily intake data
 * @returns Daily evaluations, average score, best day, trend
 */
export const evaluateNutritionWeek = https.onCall(
  { cors: true },
  async (request) => {
    const data = request.data as EvaluateWeekRequest;
    return handleEvaluateWeek(data);
  }
);
