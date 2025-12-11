/**
 * useWeeklyNutrition Hook
 *
 * Evaluates multiple days of nutrition intake using the Cloud Functions API.
 * Provides weekly/trend view with:
 * - Daily evaluations for each day
 * - Average score across the period
 * - Best performing day
 * - Trend direction (improving, stable, declining)
 * - Consistent patterns (nutrients that are always high/low)
 *
 * Useful for:
 * - Weekly summary views
 * - Trend charts
 * - Pattern identification
 */

import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';
import type { DayEvaluation } from './useNutritionEvaluation';

// ============================================================================
// TYPES
// ============================================================================

interface NutritionUserProfile {
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

interface DailyIntake {
  date: string;
  foods: Array<Record<string, unknown>>;
  totals: Record<string, number>;
}

interface EvaluateWeekRequest {
  profile: NutritionUserProfile;
  intakes: DailyIntake[];
}

interface EvaluateWeekResponse {
  success: boolean;
  days: DayEvaluation[];
  averageScore: number;
  bestDay: { date: string; score: number } | null;
  trend: 'improving' | 'stable' | 'declining';
}

export interface WeeklyNutritionData {
  days: DayEvaluation[];
  averageScore: number;
  bestDay: { date: string; score: number } | null;
  trend: 'improving' | 'stable' | 'declining';
  daysLogged: number;
  daysInPeriod: number;
  consistentHighlights: string[];
  consistentGaps: string[];
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

export const weeklyNutritionKeys = {
  all: ['weeklyNutrition'] as const,
  range: (uid: string, startDate: string, endDate: string) =>
    [...weeklyNutritionKeys.all, uid, startDate, endDate] as const,
  week: (uid: string, weekStartDate: string) =>
    [...weeklyNutritionKeys.all, 'week', uid, weekStartDate] as const,
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

function findConsistentPatterns(messages: string[]): string[] {
  const counts = new Map<string, number>();

  for (const msg of messages) {
    // Extract the nutrient name (first word or two)
    const nutrient = msg.split(' ').slice(0, 2).join(' ');
    counts.set(nutrient, (counts.get(nutrient) ?? 0) + 1);
  }

  // Return patterns that appear multiple times
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nutrient]) => nutrient);
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to evaluate multiple days of nutrition data
 *
 * @param intakes - Array of daily intake data (date + totals)
 * @param enabled - Whether to run the query
 */
export function useWeeklyNutrition(
  intakes: Array<{ date: string; totals: Record<string, number> }>,
  enabled: boolean = true
) {
  const { user } = useAuth();

  // Create a stable key from the dates
  const dateRange = intakes.length > 0
    ? `${intakes[0].date}-${intakes[intakes.length - 1].date}`
    : 'empty';

  return useQuery({
    queryKey: weeklyNutritionKeys.range(user?.uid ?? '', dateRange, String(intakes.length)),
    queryFn: async (): Promise<WeeklyNutritionData | null> => {
      if (!user?.uid || intakes.length === 0) return null;

      // Fetch patient profile data from Firestore
      const profileData = await getPatientProfileData(user.uid);
      const profile = buildProfile(user.uid, profileData);

      // Convert to DailyIntake format
      const dailyIntakes: DailyIntake[] = intakes.map((i) => ({
        date: i.date,
        foods: [],
        totals: i.totals,
      }));

      const functions = getFunctions();
      const evaluateWeekFn = httpsCallable<EvaluateWeekRequest, EvaluateWeekResponse>(
        functions,
        'evaluateNutritionWeek'
      );

      const response = await evaluateWeekFn({ profile, intakes: dailyIntakes });
      const data = response.data;

      // Extract consistent patterns
      const consistentHighlights = findConsistentPatterns(
        data.days.flatMap((d) => d.highlights)
      );
      const consistentGaps = findConsistentPatterns(
        data.days.flatMap((d) => d.gaps)
      );

      return {
        days: data.days,
        averageScore: data.averageScore,
        bestDay: data.bestDay,
        trend: data.trend,
        daysLogged: data.days.length,
        daysInPeriod: intakes.length,
        consistentHighlights,
        consistentGaps,
      };
    },
    enabled: enabled && !!user?.uid && intakes.length > 0,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
  });
}

/**
 * Hook to get the current week's nutrition data
 * Fetches data for the last 7 days
 */
export function useCurrentWeekNutrition(
  dailyTotals: Map<string, Record<string, number>>,
  enabled: boolean = true
) {
  // Get the last 7 days of data
  const today = new Date();
  const intakes: Array<{ date: string; totals: Record<string, number> }> = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const totals = dailyTotals.get(dateStr);

    if (totals && Object.keys(totals).length > 0) {
      intakes.push({ date: dateStr, totals });
    }
  }

  return useWeeklyNutrition(intakes, enabled);
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get trend icon name based on trend direction
 */
export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return 'TrendingUp';
    case 'declining':
      return 'TrendingDown';
    default:
      return 'Minus';
  }
}

/**
 * Get trend color class
 */
export function getTrendColorClass(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return 'text-green-600';
    case 'declining':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get trend label text
 */
export function getTrendLabel(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return 'Improving';
    case 'declining':
      return 'Needs attention';
    default:
      return 'Stable';
  }
}

/**
 * Format score for display with appropriate emoji
 */
export function formatScoreWithEmoji(score: number): string {
  if (score >= 90) return `${score} 🌟`;
  if (score >= 75) return `${score} ✨`;
  if (score >= 60) return `${score} 👍`;
  if (score >= 40) return `${score} 📈`;
  return `${score} 💪`;
}
