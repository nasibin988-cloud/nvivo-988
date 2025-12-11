/**
 * useNutrientInfo Hook
 *
 * Fetches educational information about specific nutrients from the
 * Cloud Functions API. Provides:
 * - What the nutrient does in the body
 * - Why it matters for health
 * - Food sources rich in this nutrient
 * - Reference data (functions, deficiency signs, etc.)
 *
 * Useful for:
 * - Displaying info when user taps on a nutrient
 * - Educational content in nutrition gaps
 * - Food recommendations
 */

import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';

// ============================================================================
// TYPES
// ============================================================================

export interface NutrientEducation {
  nutrientId: string;
  displayName: string;
  category: string;
  whatItDoes: string;
  deficiencySigns?: string[];
  toxicityRisks?: string[];
  foodSources: string[];
  absorptionFactors?: string[];
  synergies?: string[];
  timing?: string;
}

export interface NutrientInfoResponse {
  success: boolean;
  nutrientId: string;
  education: NutrientEducation | null;
  whyItMatters: string;
  foodSuggestions: string[];
}

interface GetNutrientInfoRequest {
  nutrientId: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const nutrientInfoKeys = {
  all: ['nutrientInfo'] as const,
  nutrient: (nutrientId: string) => [...nutrientInfoKeys.all, nutrientId] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to get educational information about a nutrient
 *
 * @param nutrientId - The nutrient ID (e.g., 'vitamin_c', 'protein', 'iron')
 * @param enabled - Whether to run the query
 */
export function useNutrientInfo(nutrientId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: nutrientInfoKeys.nutrient(nutrientId),
    queryFn: async (): Promise<NutrientInfoResponse> => {
      const functions = getFunctions();
      const getInfoFn = httpsCallable<GetNutrientInfoRequest, NutrientInfoResponse>(
        functions,
        'getNutrientInfo'
      );

      const response = await getInfoFn({ nutrientId });
      return response.data;
    },
    enabled: enabled && !!nutrientId,
    staleTime: 3600000, // 1 hour - educational content rarely changes
    gcTime: 86400000, // 24 hours cache - can keep this a long time
  });
}

/**
 * Prefetch nutrient info for a list of nutrients
 * Useful when showing a list of gaps/highlights
 */
export function usePrefetchNutrientInfo() {
  const functions = getFunctions();

  return async (nutrientIds: string[]): Promise<void> => {
    // This would use queryClient.prefetchQuery in a real implementation
    // For now, just a placeholder that can be enhanced
    const getInfoFn = httpsCallable<GetNutrientInfoRequest, NutrientInfoResponse>(
      functions,
      'getNutrientInfo'
    );

    await Promise.all(
      nutrientIds.slice(0, 5).map((nutrientId) =>
        getInfoFn({ nutrientId }).catch(() => null)
      )
    );
  };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get a short description for a nutrient
 */
export function getNutrientShortDescription(nutrientId: string): string {
  const descriptions: Record<string, string> = {
    protein: 'Essential for muscle and tissue repair',
    carbohydrate: 'Primary source of energy',
    total_fat: 'Energy storage and nutrient absorption',
    fiber: 'Supports digestive health',
    vitamin_c: 'Immune support and antioxidant',
    vitamin_d: 'Bone health and immune function',
    vitamin_a: 'Vision and immune health',
    vitamin_b12: 'Nerve function and blood cells',
    calcium: 'Bone and teeth strength',
    iron: 'Oxygen transport in blood',
    potassium: 'Heart and muscle function',
    sodium: 'Fluid balance (limit intake)',
    magnesium: 'Muscle and nerve function',
    zinc: 'Immune function and wound healing',
    folate: 'Cell growth and DNA synthesis',
  };

  return descriptions[nutrientId] ?? 'Important for overall health';
}

/**
 * Get category color for a nutrient
 */
export function getNutrientCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    macronutrient: 'bg-blue-100 text-blue-800',
    vitamin: 'bg-orange-100 text-orange-800',
    mineral: 'bg-green-100 text-green-800',
    water_soluble_vitamin: 'bg-yellow-100 text-yellow-800',
    fat_soluble_vitamin: 'bg-purple-100 text-purple-800',
    electrolyte: 'bg-cyan-100 text-cyan-800',
  };

  return colors[category.toLowerCase()] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Format food sources for display
 */
export function formatFoodSources(sources: string[], limit: number = 5): string {
  const limited = sources.slice(0, limit);
  const formatted = limited.join(', ');

  if (sources.length > limit) {
    return `${formatted}, and more...`;
  }
  return formatted;
}
