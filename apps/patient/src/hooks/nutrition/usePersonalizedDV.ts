/**
 * usePersonalizedDV Hook
 *
 * Fetches personalized Daily Values for a patient, for use in food comparison
 * and nutrition scoring. Falls back to FDA DVs if personalized data unavailable.
 *
 * Data flow:
 * 1. First tries to fetch from Firestore (patients/{uid}/nutritionTargets/current)
 * 2. If not available, falls back to generic FDA Daily Values
 *
 * The Firestore data is seeded via seedNutritionTargets() which uses the
 * DRI computation system with age/sex/health-condition adjustments.
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Simplified DV config for food comparison UI
 */
export interface DVConfig {
  dv: number;
  type: 'limit' | 'beneficial' | 'neutral';
}

/**
 * Personalized Daily Values record
 */
export type PersonalizedDVs = Record<string, DVConfig>;

/**
 * Full nutrient target from Firestore
 */
interface NutrientTarget {
  nutrientId: string;
  displayName: string;
  unit: string;
  target?: number;
  targetType?: 'RDA' | 'AI';
  upperLimit?: number;
  cdrrLimit?: number;
  dailyValue?: number;
  amdrMin?: number;
  amdrMax?: number;
  source: string;
}

/**
 * Stored nutrition targets document
 */
interface StoredNutritionTargets {
  calories: number;
  nutrients: Record<string, NutrientTarget>;
  profile: {
    ageYears: number;
    sex: 'male' | 'female';
    lifeStageGroup: string;
    activityLevel: string;
    goal: string;
  };
  sourceProfile?: {
    conditions?: string[];
  };
  computedAt: string;
}

// ============================================================================
// FDA BASELINE DVS (FALLBACK)
// ============================================================================

/**
 * FDA Daily Values as fallback when personalized data unavailable
 * Based on 2000 calorie diet (21 CFR 101.9)
 */
export const FDA_BASELINE_DVS: PersonalizedDVs = {
  // Macros
  calories: { dv: 2000, type: 'neutral' },
  protein: { dv: 50, type: 'beneficial' },
  carbs: { dv: 275, type: 'neutral' },
  fat: { dv: 78, type: 'neutral' },
  fiber: { dv: 28, type: 'beneficial' },
  sugar: { dv: 50, type: 'limit' },
  addedSugar: { dv: 25, type: 'limit' },

  // Nutrients to limit
  saturatedFat: { dv: 20, type: 'limit' },
  transFat: { dv: 0, type: 'limit' }, // No DV established - "minimize" is the guidance
  sodium: { dv: 2300, type: 'limit' },
  cholesterol: { dv: 0, type: 'neutral' }, // No DV per 2015-2020 guidelines

  // Fat breakdown (no DV)
  monounsaturatedFat: { dv: 0, type: 'neutral' },
  polyunsaturatedFat: { dv: 0, type: 'neutral' },

  // Fatty acids
  omega3: { dv: 1.6, type: 'beneficial' }, // ALA (plant omega-3)
  omega6: { dv: 17, type: 'neutral' },
  epaDha: { dv: 500, type: 'beneficial' }, // EPA+DHA - AHA recommendation (mg)

  // Minerals
  potassium: { dv: 4700, type: 'beneficial' },
  calcium: { dv: 1300, type: 'beneficial' },
  magnesium: { dv: 420, type: 'beneficial' },
  phosphorus: { dv: 1250, type: 'beneficial' },
  iron: { dv: 18, type: 'beneficial' },
  zinc: { dv: 11, type: 'beneficial' },
  copper: { dv: 0.9, type: 'beneficial' },
  manganese: { dv: 2.3, type: 'beneficial' },
  selenium: { dv: 55, type: 'beneficial' },
  iodine: { dv: 150, type: 'beneficial' },
  chromium: { dv: 35, type: 'beneficial' },
  molybdenum: { dv: 45, type: 'beneficial' },
  fluoride: { dv: 4, type: 'neutral' },

  // Vitamins
  vitaminA: { dv: 900, type: 'beneficial' },
  vitaminD: { dv: 20, type: 'beneficial' },
  vitaminE: { dv: 15, type: 'beneficial' },
  vitaminK: { dv: 120, type: 'beneficial' },
  vitaminC: { dv: 90, type: 'beneficial' },
  thiamin: { dv: 1.2, type: 'beneficial' },
  riboflavin: { dv: 1.3, type: 'beneficial' },
  niacin: { dv: 16, type: 'beneficial' },
  pantothenicAcid: { dv: 5, type: 'beneficial' },
  vitaminB6: { dv: 1.7, type: 'beneficial' },
  biotin: { dv: 30, type: 'beneficial' },
  folate: { dv: 400, type: 'beneficial' },
  vitaminB12: { dv: 2.4, type: 'beneficial' },
  choline: { dv: 550, type: 'beneficial' },

  // Other
  caffeine: { dv: 400, type: 'limit' },
  alcohol: { dv: 0, type: 'limit' },
  water: { dv: 0, type: 'neutral' },
  glycemicIndex: { dv: 0, type: 'neutral' },
  glycemicLoad: { dv: 0, type: 'neutral' },
};

// ============================================================================
// MAPPING HELPERS
// ============================================================================

/**
 * Map nutrient IDs from DRI system to our UI keys
 * DRI uses snake_case, UI uses camelCase
 */
const NUTRIENT_ID_MAP: Record<string, string> = {
  // DRI key -> UI key
  carbohydrate: 'carbs',
  total_fat: 'fat',
  saturated_fat: 'saturatedFat',
  trans_fat: 'transFat',
  added_sugars: 'addedSugar',
  vitamin_a: 'vitaminA',
  vitamin_c: 'vitaminC',
  vitamin_d: 'vitaminD',
  vitamin_e: 'vitaminE',
  vitamin_k: 'vitaminK',
  vitamin_b6: 'vitaminB6',
  vitamin_b12: 'vitaminB12',
  pantothenic_acid: 'pantothenicAcid',
};

/**
 * Nutrient classification (determines color coding)
 */
const NUTRIENT_TYPES: Record<string, 'limit' | 'beneficial' | 'neutral'> = {
  // Limit nutrients (lower is better)
  saturatedFat: 'limit',
  transFat: 'limit',
  sodium: 'limit',
  sugar: 'limit',
  addedSugar: 'limit',
  caffeine: 'limit',
  alcohol: 'limit',

  // Beneficial nutrients (higher is better)
  protein: 'beneficial',
  fiber: 'beneficial',
  potassium: 'beneficial',
  calcium: 'beneficial',
  magnesium: 'beneficial',
  phosphorus: 'beneficial',
  iron: 'beneficial',
  zinc: 'beneficial',
  copper: 'beneficial',
  manganese: 'beneficial',
  selenium: 'beneficial',
  iodine: 'beneficial',
  chromium: 'beneficial',
  molybdenum: 'beneficial',
  vitaminA: 'beneficial',
  vitaminD: 'beneficial',
  vitaminE: 'beneficial',
  vitaminK: 'beneficial',
  vitaminC: 'beneficial',
  thiamin: 'beneficial',
  riboflavin: 'beneficial',
  niacin: 'beneficial',
  pantothenicAcid: 'beneficial',
  vitaminB6: 'beneficial',
  biotin: 'beneficial',
  folate: 'beneficial',
  vitaminB12: 'beneficial',
  choline: 'beneficial',
  omega3: 'beneficial',
  epaDha: 'beneficial',
};

/**
 * Convert stored nutrition targets to simplified DV config
 */
function convertTargetsToDVs(targets: StoredNutritionTargets): PersonalizedDVs {
  const dvs: PersonalizedDVs = { ...FDA_BASELINE_DVS };

  // Update calories
  if (targets.calories) {
    dvs.calories = { dv: targets.calories, type: 'neutral' };
  }

  // Process each nutrient
  for (const [driKey, target] of Object.entries(targets.nutrients)) {
    // Map DRI key to UI key
    const uiKey = NUTRIENT_ID_MAP[driKey] ?? driKey;

    // Determine the DV value to use
    // Priority: target (RDA/AI) > dailyValue (FDA DV) > upperLimit
    let dv = 0;
    if (target.target) {
      dv = target.target;
    } else if (target.dailyValue) {
      dv = target.dailyValue;
    } else if (target.upperLimit) {
      dv = target.upperLimit;
    }

    // Determine nutrient type
    const type = NUTRIENT_TYPES[uiKey] ?? 'neutral';

    if (dv > 0 || FDA_BASELINE_DVS[uiKey]) {
      dvs[uiKey] = { dv, type };
    }
  }

  return dvs;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Query keys for personalized DVs
 */
export const personalizedDVKeys = {
  all: ['personalizedDV'] as const,
  user: (uid: string) => [...personalizedDVKeys.all, uid] as const,
};

/**
 * Hook to fetch personalized Daily Values
 *
 * Returns personalized DVs if available, otherwise FDA baseline DVs.
 * The personalized DVs are computed based on age, sex, activity level,
 * and health conditions.
 */
export function usePersonalizedDV(): {
  dvs: PersonalizedDVs;
  isPersonalized: boolean;
  isLoading: boolean;
  error: Error | null;
  profile: StoredNutritionTargets['profile'] | null;
} {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: personalizedDVKeys.user(user?.uid ?? ''),
    queryFn: async (): Promise<{
      dvs: PersonalizedDVs;
      isPersonalized: boolean;
      profile: StoredNutritionTargets['profile'] | null;
    }> => {
      if (!user?.uid) {
        return { dvs: FDA_BASELINE_DVS, isPersonalized: false, profile: null };
      }

      try {
        const db = getDb();
        const targetsRef = doc(db, 'patients', user.uid, 'nutritionTargets', 'current');
        const targetsSnap = await getDoc(targetsRef);

        if (!targetsSnap.exists()) {
          console.log('No personalized nutrition targets found, using FDA baseline');
          return { dvs: FDA_BASELINE_DVS, isPersonalized: false, profile: null };
        }

        const targets = targetsSnap.data() as StoredNutritionTargets;
        const dvs = convertTargetsToDVs(targets);

        console.log('Loaded personalized DVs:', {
          calories: dvs.calories.dv,
          profile: targets.profile,
        });

        return { dvs, isPersonalized: true, profile: targets.profile };
      } catch (err) {
        console.error('Error fetching personalized DVs:', err);
        return { dvs: FDA_BASELINE_DVS, isPersonalized: false, profile: null };
      }
    },
    enabled: !!user?.uid,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  return {
    dvs: data?.dvs ?? FDA_BASELINE_DVS,
    isPersonalized: data?.isPersonalized ?? false,
    isLoading,
    error: error as Error | null,
    profile: data?.profile ?? null,
  };
}

/**
 * Hook to get a single DV config for a nutrient
 */
export function useDVConfig(nutrientKey: string): DVConfig {
  const { dvs } = usePersonalizedDV();
  return dvs[nutrientKey] ?? { dv: 0, type: 'neutral' };
}

/**
 * Hook to calculate % DV for a value
 */
export function usePercentDV(nutrientKey: string, value: number): number {
  const config = useDVConfig(nutrientKey);
  if (!config || config.dv === 0) return 0;
  return Math.round((value / config.dv) * 100);
}
