/**
 * useNutritionTargetsV2 Hook
 *
 * Fetches personalized nutrition targets from the Cloud Functions API.
 * This is the new DRI-based system that provides:
 * - Per-nutrient targets with RDA/AI values
 * - Upper limits for nutrients with toxicity concerns
 * - AMDR ranges for macronutrients
 * - Personalization based on age, sex, activity level, and goals
 *
 * This hook replaces the client-side calculation in useNutritionTargets
 * with server-side computation using official DRI reference data.
 */

import { useQuery } from '@tanstack/react-query';
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

export interface NutrientTarget {
  nutrientId: string;
  displayName: string;
  unit: string;
  target?: number;           // RDA or AI value
  targetType?: 'RDA' | 'AI'; // Which type of recommendation
  upperLimit?: number;       // UL - Tolerable Upper Intake Level
  cdrrLimit?: number;        // Chronic Disease Risk Reduction limit
  dailyValue?: number;       // FDA Daily Value for % calculations
  amdrMin?: number;          // AMDR minimum (grams)
  amdrMax?: number;          // AMDR maximum (grams)
  amdrMinPercent?: number;   // AMDR minimum (% of calories)
  amdrMaxPercent?: number;   // AMDR maximum (% of calories)
  source: string;            // Where this value came from
}

export interface UserNutritionTargets {
  calories: number;
  nutrients: Record<string, NutrientTarget>;
  profile: {
    ageYears: number;
    sex: 'male' | 'female';
    lifeStageGroup: string;
    activityLevel: string;
    goal: string;
  };
  computedAt: string;
}

interface GetTargetsRequest {
  profile: NutritionUserProfile;
}

interface GetTargetsResponse {
  success: boolean;
  targets: UserNutritionTargets;
}

// Extended patient profile from Firestore
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
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const nutritionTargetsKeys = {
  all: ['nutritionTargetsV2'] as const,
  user: (uid: string) => [...nutritionTargetsKeys.all, 'user', uid] as const,
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
 * Hook to get personalized nutrition targets from the server
 *
 * Returns DRI-based targets computed from the user's profile.
 * Results are cached for 5 minutes since targets don't change frequently.
 */
export function useNutritionTargetsV2() {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionTargetsKeys.user(user?.uid ?? ''),
    queryFn: async (): Promise<UserNutritionTargets | null> => {
      if (!user?.uid) return null;

      // Fetch patient profile data from Firestore
      const profileData = await getPatientProfileData(user.uid);
      const profile = buildProfile(user.uid, profileData);

      const functions = getFunctions();
      const getTargetsFn = httpsCallable<GetTargetsRequest, GetTargetsResponse>(
        functions,
        'getNutritionTargets'
      );

      const response = await getTargetsFn({ profile });
      return response.data.targets;
    },
    enabled: !!user?.uid,
    staleTime: 300000, // 5 minutes - targets don't change often
    gcTime: 600000, // 10 minutes cache
  });
}

/**
 * Hook to get just the calorie target
 */
export function useCalorieTargetV2(): number {
  const { data: targets } = useNutritionTargetsV2();
  return targets?.calories ?? 2000;
}

/**
 * Hook to get a specific nutrient's target
 */
export function useNutrientTarget(nutrientId: string): NutrientTarget | null {
  const { data: targets } = useNutritionTargetsV2();
  return targets?.nutrients[nutrientId] ?? null;
}

/**
 * Hook to get macro targets (protein, carbs, fat)
 */
export function useMacroTargets(): {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const { data: targets } = useNutritionTargetsV2();

  return {
    protein: targets?.nutrients['protein']?.target ?? 50,
    carbs: targets?.nutrients['carbohydrate']?.target ?? 250,
    fat: targets?.nutrients['total_fat']?.target ?? 65,
    fiber: targets?.nutrients['fiber']?.target ?? 28,
  };
}

/**
 * Get percentage of target for a nutrient intake
 */
export function calculateTargetPercent(
  intake: number,
  target: NutrientTarget | null
): number | null {
  if (!target || !target.target) return null;
  return Math.round((intake / target.target) * 100);
}

/**
 * Get percentage of upper limit for a nutrient intake
 */
export function calculateLimitPercent(
  intake: number,
  target: NutrientTarget | null
): number | null {
  if (!target || !target.upperLimit) return null;
  return Math.round((intake / target.upperLimit) * 100);
}
