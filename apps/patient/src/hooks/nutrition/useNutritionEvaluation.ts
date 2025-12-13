/**
 * useNutritionEvaluation Hook
 *
 * Evaluates a day's nutrition intake using the Cloud Functions API.
 * Returns a comprehensive evaluation with:
 * - Overall score (0-100)
 * - Score breakdown (beneficial, limit, balance)
 * - Per-nutrient evaluations
 * - Highlights (things you did well)
 * - Gaps (areas for improvement)
 * - Natural language summary
 *
 * Uses React Query for caching and automatic background refetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export interface NutritionUserProfile {
  userId: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  weightKg?: number;
  heightCm?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
  goal: 'weight_loss' | 'maintenance' | 'weight_gain' | 'muscle_gain' | 'performance';
  isPregnant?: boolean;
  isLactating?: boolean;
  conditions?: string[];
}

export interface DailyIntake {
  date: string;
  foods: Array<{
    foodId?: string;
    name: string;
    servingSize?: string;
    nutrients: Array<{ nutrientId: string; amount: number; unit: string }>;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    loggedAt: string;
  }>;
  totals: Record<string, number>;
}

export interface NutrientEvaluation {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number | null;
  upperLimit: number | null;
  unit: string;
  percentOfTarget: number | null;
  percentOfLimit: number | null;
  classification: 'beneficial' | 'limit' | 'risk' | 'neutral' | 'context_dependent';
  status: string;
  statusLabel: string;
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
}

export interface ScoreBreakdown {
  adequacy: {
    points: number;
    maxPoints: number;
    mar: number;
  };
  moderation: {
    points: number;
    maxPoints: number;
  };
  balance: {
    points: number;
    maxPoints: number;
  };
}

export interface DayEvaluation {
  date: string;
  score: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  mar: number;
  breakdown: ScoreBreakdown;
  nutrients: NutrientEvaluation[];
  highlights: Array<{
    nutrientId: string;
    displayName: string;
    percentOfTarget: number;
    message: string;
  }>;
  gaps: Array<{
    nutrientId: string;
    displayName: string;
    intake: number;
    target: number;
    percentOfTarget: number;
    unit: string;
    severity: 'low' | 'moderate' | 'severe';
    suggestion: string;
  }>;
  summary: string;
  focus: {
    id: string;
    name: string;
  };
  calories: {
    consumed: number;
    target: number;
    percentOfTarget: number;
  };
}

interface EvaluateDayRequest {
  profile: NutritionUserProfile;
  intake: DailyIntake;
  focusId?: string;
}

interface EvaluateDayResponse {
  success: boolean;
  evaluation: DayEvaluation;
}

// Nutrition focus type
export type NutritionFocusId =
  | 'balanced'
  | 'muscle_building'
  | 'heart_health'
  | 'energy'
  | 'weight_management'
  | 'brain_focus'
  | 'gut_health'
  | 'blood_sugar'
  | 'bone_joint'
  | 'anti_inflammatory';

// Extended patient profile from Firestore (includes health data)
interface PatientProfileData {
  dateOfBirth?: string;
  sex?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
  dietaryGoals?: string[];
  healthConditions?: string[];
  isPregnant?: boolean;
  isLactating?: boolean;
  bmr?: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const nutritionEvaluationKeys = {
  all: ['nutritionEvaluation'] as const,
  day: (uid: string, date: string) => [...nutritionEvaluationKeys.all, 'day', uid, date] as const,
  week: (uid: string, startDate: string) => [...nutritionEvaluationKeys.all, 'week', uid, startDate] as const,
};

// ============================================================================
// HELPERS
// ============================================================================

async function getPatientProfileData(uid: string): Promise<PatientProfileData | null> {
  const db = getDb();
  const profileRef = doc(db, 'patients', uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    return null;
  }

  return profileSnap.data() as PatientProfileData;
}

function mapActivityLevel(
  level?: string
): 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete' {
  const levelMap: Record<string, 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete'> = {
    sedentary: 'sedentary',
    light: 'light',
    lightly_active: 'light',
    moderate: 'moderate',
    moderately_active: 'moderate',
    active: 'high',
    very_active: 'athlete',
    athlete: 'athlete',
  };
  return levelMap[level?.toLowerCase() ?? ''] ?? 'moderate';
}

function mapNutritionGoal(
  goals?: string[]
): 'weight_loss' | 'maintenance' | 'weight_gain' | 'muscle_gain' | 'performance' {
  if (!goals || goals.length === 0) return 'maintenance';

  const firstGoal = goals[0].toLowerCase().replace(/\s+/g, '_');
  const goalMap: Record<string, 'weight_loss' | 'maintenance' | 'weight_gain' | 'muscle_gain' | 'performance'> = {
    weight_loss: 'weight_loss',
    lose_weight: 'weight_loss',
    maintenance: 'maintenance',
    maintain: 'maintenance',
    weight_gain: 'weight_gain',
    gain_weight: 'weight_gain',
    muscle_gain: 'muscle_gain',
    build_muscle: 'muscle_gain',
    performance: 'performance',
    athletic_performance: 'performance',
  };
  return goalMap[firstGoal] ?? 'maintenance';
}

function buildProfile(uid: string, profileData: PatientProfileData | null): NutritionUserProfile {
  return {
    userId: uid,
    dateOfBirth: profileData?.dateOfBirth ?? '1990-01-01',
    sex: (profileData?.sex as 'male' | 'female') ?? 'male',
    weightKg: profileData?.weight,
    heightCm: profileData?.height,
    activityLevel: mapActivityLevel(profileData?.activityLevel),
    goal: mapNutritionGoal(profileData?.dietaryGoals),
    isPregnant: profileData?.isPregnant,
    isLactating: profileData?.isLactating,
    conditions: profileData?.healthConditions,
  };
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to evaluate a single day's nutrition using V2 MAR-based scoring
 *
 * @param date - The date to evaluate (YYYY-MM-DD format)
 * @param totals - Nutrient totals for the day (e.g., { protein: 80, vitamin_c: 90, ... })
 * @param focusId - Optional nutrition focus (default: 'balanced')
 * @param enabled - Whether to run the query
 */
export function useNutritionDayEvaluation(
  date: string,
  totals: Record<string, number> | null,
  focusId: NutritionFocusId = 'balanced',
  enabled: boolean = true
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...nutritionEvaluationKeys.day(user?.uid ?? '', date), focusId],
    queryFn: async (): Promise<DayEvaluation | null> => {
      if (!user?.uid || !totals) return null;

      // Fetch patient profile data from Firestore
      const profileData = await getPatientProfileData(user.uid);
      const profile = buildProfile(user.uid, profileData);

      const intake: DailyIntake = {
        date,
        foods: [],
        totals,
      };

      const functions = getFunctions();
      // Use V2 API for comprehensive MAR-based scoring
      const evaluateFn = httpsCallable<EvaluateDayRequest, EvaluateDayResponse>(
        functions,
        'evaluateNutritionDayV2'
      );

      const response = await evaluateFn({ profile, intake, focusId });
      return response.data.evaluation;
    },
    enabled: enabled && !!user?.uid && !!totals && Object.keys(totals).length > 0,
    staleTime: 60000, // 1 minute - evaluation can change if user logs more food
    gcTime: 300000, // 5 minutes cache
  });
}

/**
 * Mutation hook for evaluating nutrition on-demand using V2 scoring
 * Use this when you need to evaluate without caching (e.g., preview before saving)
 */
export function useEvaluateNutrition() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      totals,
      focusId = 'balanced',
    }: {
      date: string;
      totals: Record<string, number>;
      focusId?: NutritionFocusId;
    }): Promise<DayEvaluation> => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Fetch patient profile data from Firestore
      const profileData = await getPatientProfileData(user.uid);
      const profile = buildProfile(user.uid, profileData);

      const intake: DailyIntake = {
        date,
        foods: [],
        totals,
      };

      const functions = getFunctions();
      // Use V2 API for comprehensive MAR-based scoring
      const evaluateFn = httpsCallable<EvaluateDayRequest, EvaluateDayResponse>(
        functions,
        'evaluateNutritionDayV2'
      );

      const response = await evaluateFn({ profile, intake, focusId });
      return response.data.evaluation;
    },
    onSuccess: (data, variables) => {
      // Update the cache with the new evaluation
      queryClient.setQueryData(
        [...nutritionEvaluationKeys.day(user?.uid ?? '', variables.date), variables.focusId ?? 'balanced'],
        data
      );
    },
  });
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get color class for score display
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get background color class for score display
 */
export function getScoreBgClass(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}
