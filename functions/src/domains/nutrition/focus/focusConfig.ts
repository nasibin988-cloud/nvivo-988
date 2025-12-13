/**
 * Nutrition Focus Configuration
 *
 * Defines the 10 nutrition focuses with their weight adjustments,
 * nutrient emphases, and custom thresholds.
 */

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

export interface FocusWeights {
  adequacy: number;
  moderation: number;
  balance: number;
}

export interface NutritionFocusConfig {
  id: NutritionFocusId;
  name: string;
  description: string;
  weights: FocusWeights;
  /** Multipliers for nutrient emphasis in MAR calculation (default 1.0) */
  nutrientEmphasis: Record<string, number>;
  /** Custom limit overrides (stricter than default) */
  limitOverrides: Record<string, number>;
  /** Custom target multipliers */
  targetMultipliers: Record<string, number>;
  /** Whether to assess glycemic impact */
  glycemicImpactEnabled: boolean;
  /** Whether to use DII-style scoring */
  inflammatoryIndexEnabled: boolean;
  /** Calorie tolerance (default ±15%) */
  calorieTolerancePercent: number;
}

/**
 * All 10 nutrition focus configurations
 */
export const FOCUS_CONFIGS: Record<NutritionFocusId, NutritionFocusConfig> = {
  // ═══════════════════════════════════════════════════════════════════
  // BALANCED - Default, well-rounded nutrition
  // ═══════════════════════════════════════════════════════════════════
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Overall nutrition balance following dietary guidelines',
    weights: { adequacy: 50, moderation: 30, balance: 20 },
    nutrientEmphasis: {},
    limitOverrides: {},
    targetMultipliers: {},
    glycemicImpactEnabled: false,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // MUSCLE BUILDING - High protein for growth
  // ═══════════════════════════════════════════════════════════════════
  muscle_building: {
    id: 'muscle_building',
    name: 'Muscle Building',
    description: 'High protein diet for muscle growth and athletic performance',
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    nutrientEmphasis: {
      protein: 2.0, // Double emphasis on protein
      vitaminD: 1.3,
      magnesium: 1.3,
      zinc: 1.3,
      vitaminB6: 1.2,
      vitaminB12: 1.2,
    },
    limitOverrides: {},
    targetMultipliers: {
      protein: 2.0, // 1.6g/kg vs 0.8g/kg RDA
    },
    glycemicImpactEnabled: false,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 20, // More lenient on surplus
  },

  // ═══════════════════════════════════════════════════════════════════
  // HEART HEALTH - Cardioprotective diet
  // ═══════════════════════════════════════════════════════════════════
  heart_health: {
    id: 'heart_health',
    name: 'Heart Health',
    description: 'Cardioprotective diet emphasizing fiber, omega-3, and limiting sodium/saturated fat',
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    nutrientEmphasis: {
      fiber: 1.5,
      potassium: 1.5,
      magnesium: 1.5,
      // omega3 would be here if tracked separately
    },
    limitOverrides: {
      saturatedFat: 0.7, // 7% of calories vs 10%
      sodium: 1500, // 1500mg vs 2300mg
      cholesterol: 200, // 200mg vs 300mg
    },
    targetMultipliers: {
      fiber: 1.2, // Aim higher
      potassium: 1.1,
    },
    glycemicImpactEnabled: false,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENERGY - Sustained energy levels
  // ═══════════════════════════════════════════════════════════════════
  energy: {
    id: 'energy',
    name: 'Energy',
    description: 'Diet optimized for sustained energy through low-GI carbs and B-vitamins',
    weights: { adequacy: 50, moderation: 25, balance: 25 },
    nutrientEmphasis: {
      fiber: 1.5, // Low GI indicator
      iron: 1.3,
      thiamin: 1.3,
      riboflavin: 1.3,
      niacin: 1.3,
      vitaminB6: 1.3,
      vitaminB12: 1.3,
    },
    limitOverrides: {},
    targetMultipliers: {},
    glycemicImpactEnabled: true, // Sugar:fiber ratio matters
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // WEIGHT MANAGEMENT - Calorie-conscious
  // ═══════════════════════════════════════════════════════════════════
  weight_management: {
    id: 'weight_management',
    name: 'Weight Management',
    description: 'Calorie-controlled diet emphasizing nutrient density and satiety',
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    nutrientEmphasis: {
      protein: 1.3, // Satiety and muscle preservation
      fiber: 1.5, // Satiety
    },
    limitOverrides: {},
    targetMultipliers: {},
    glycemicImpactEnabled: true,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 10, // Stricter calorie tolerance
  },

  // ═══════════════════════════════════════════════════════════════════
  // BRAIN & FOCUS - Cognitive support
  // ═══════════════════════════════════════════════════════════════════
  brain_focus: {
    id: 'brain_focus',
    name: 'Brain & Focus',
    description: 'Diet supporting cognitive function through omega-3, B-vitamins, and antioxidants',
    weights: { adequacy: 50, moderation: 25, balance: 25 },
    nutrientEmphasis: {
      // omega3 would be 2.0 if tracked separately
      vitaminB6: 1.5,
      vitaminB12: 1.5,
      folate: 1.5,
      vitaminC: 1.3, // Antioxidant
      vitaminE: 1.3, // Antioxidant
      choline: 1.5,
    },
    limitOverrides: {
      saturatedFat: 0.8, // Stricter - linked to cognitive decline
    },
    targetMultipliers: {},
    glycemicImpactEnabled: true, // Blood sugar spikes affect focus
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // GUT HEALTH - Fiber & prebiotics
  // ═══════════════════════════════════════════════════════════════════
  gut_health: {
    id: 'gut_health',
    name: 'Gut Health',
    description: 'High-fiber diet supporting microbiome health',
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    nutrientEmphasis: {
      fiber: 3.0, // Triple emphasis
    },
    limitOverrides: {},
    targetMultipliers: {
      fiber: 1.3, // Aim for upper end (35-38g)
    },
    glycemicImpactEnabled: false,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // BLOOD SUGAR - Low glycemic impact
  // ═══════════════════════════════════════════════════════════════════
  blood_sugar: {
    id: 'blood_sugar',
    name: 'Blood Sugar',
    description: 'Diet optimized for glycemic control with low-GI carbs and high fiber',
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    nutrientEmphasis: {
      fiber: 2.0,
      magnesium: 1.3, // Glucose metabolism
      chromium: 1.3, // If tracked
    },
    limitOverrides: {
      addedSugar: 0.5, // <5% of calories (half of 10%)
    },
    targetMultipliers: {
      fiber: 1.2,
    },
    glycemicImpactEnabled: true, // Primary consideration
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // BONE & JOINT - Calcium and Vitamin D focus
  // ═══════════════════════════════════════════════════════════════════
  bone_joint: {
    id: 'bone_joint',
    name: 'Bone & Joint',
    description: 'Diet supporting bone density and joint health',
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    nutrientEmphasis: {
      calcium: 2.0,
      vitaminD: 2.0,
      vitaminK: 1.5,
      magnesium: 1.3,
      phosphorus: 1.2,
      vitaminC: 1.2, // Collagen synthesis
      protein: 1.2, // Bone matrix
    },
    limitOverrides: {},
    targetMultipliers: {},
    glycemicImpactEnabled: false,
    inflammatoryIndexEnabled: false,
    calorieTolerancePercent: 15,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ANTI-INFLAMMATORY - Reduce inflammation
  // ═══════════════════════════════════════════════════════════════════
  anti_inflammatory: {
    id: 'anti_inflammatory',
    name: 'Anti-Inflammatory',
    description: 'Diet minimizing chronic inflammation through antioxidants and healthy fats',
    weights: { adequacy: 45, moderation: 30, balance: 25 },
    nutrientEmphasis: {
      // omega3 would be 2.0 if tracked
      vitaminC: 1.5,
      vitaminE: 1.5,
      selenium: 1.3,
      zinc: 1.3,
      fiber: 1.5,
    },
    limitOverrides: {
      saturatedFat: 0.7, // <7% of calories
      addedSugar: 0.5, // <5% of calories
    },
    targetMultipliers: {},
    glycemicImpactEnabled: true,
    inflammatoryIndexEnabled: true, // Use DII-style scoring
    calorieTolerancePercent: 15,
  },
};

/**
 * Get focus configuration by ID
 */
export function getFocusConfig(focusId: NutritionFocusId): NutritionFocusConfig {
  return FOCUS_CONFIGS[focusId] ?? FOCUS_CONFIGS.balanced;
}

/**
 * Get all available focus IDs
 */
export function getAllFocusIds(): NutritionFocusId[] {
  return Object.keys(FOCUS_CONFIGS) as NutritionFocusId[];
}

/**
 * Get focus display info for UI
 */
export function getFocusDisplayInfo(): Array<{ id: NutritionFocusId; name: string; description: string }> {
  return Object.values(FOCUS_CONFIGS).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}
