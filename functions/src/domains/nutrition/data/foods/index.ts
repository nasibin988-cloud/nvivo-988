/**
 * Food Database Index
 *
 * Exports the comprehensive USDA-validated food database with 500+ foods.
 * All nutrition values are per 100g edible portion from USDA FoodData Central.
 */

import baseFoodsData from './base_foods.json';
import preparationsData from './preparations.json';
import aliasesData from './aliases.json';
import categoriesData from './categories.json';

const baseFoods = baseFoodsData as Record<string, unknown>;
const preparations = preparationsData as Record<string, unknown>;
const aliases = aliasesData as Record<string, unknown>;
const categories = categoriesData as Record<string, unknown>;

// Types
export interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  vitaminE?: number;
  vitaminK?: number;
  folate?: number;
  omega3?: number;
  phosphorus?: number;
}

export interface FocusGrade {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  insight: string;
  pros: string[];
  cons: string[];
}

export interface FocusGrades {
  heart_health: FocusGrade;
  weight_management: FocusGrade;
  blood_sugar: FocusGrade;
  muscle_building: FocusGrade;
  gut_health: FocusGrade;
  brain_focus: FocusGrade;
  balanced: FocusGrade;
  bone_joint: FocusGrade;
  anti_inflammatory: FocusGrade;
}

export interface StandardServing {
  amount: number;
  unit: string;
  description: string;
}

export interface FoodEntry {
  id: string;
  name: string;
  fdcId?: string;
  nutritionPer100g: NutritionPer100g;
  standardServing?: StandardServing;
  focusGrades?: FocusGrades;
}

export interface PreparationModifier {
  name: string;
  multipliers: Record<string, number>;
  notes?: string;
}

export interface FoodAlias {
  canonical: string;
  aliases: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export type FocusGoal =
  | 'heart_health'
  | 'weight_management'
  | 'blood_sugar'
  | 'muscle_building'
  | 'gut_health'
  | 'brain_focus'
  | 'balanced'
  | 'bone_joint'
  | 'anti_inflammatory';

// Extract metadata
const { _meta, ...foods } = baseFoods as Record<string, unknown>;

// Export raw data
export const foodDatabase = foods as Record<string, FoodEntry>;
export const foodMeta = _meta as {
  description: string;
  version: string;
  lastUpdated: string;
  totalFoods: number;
  source: string;
  units: string;
  usdaValidated: boolean;
};

export const preparationModifiers = preparations as {
  metadata: { description: string; version: string };
  preparations: Record<string, PreparationModifier>;
};

export const foodAliases = aliases as {
  metadata: { description: string; totalMappings: number };
  aliases: Record<string, FoodAlias>;
};

export const foodCategories = categories as {
  metadata: { description: string; version: string };
  categories: FoodCategory[];
};

// Helper functions

/**
 * Get a food by its ID
 */
export function getFood(id: string): FoodEntry | undefined {
  return foodDatabase[id];
}

/**
 * Get a food by alias (returns canonical food entry)
 */
export function getFoodByAlias(alias: string): FoodEntry | undefined {
  const normalizedAlias = alias.toLowerCase().trim();

  // Check if it's a direct ID
  if (foodDatabase[normalizedAlias]) {
    return foodDatabase[normalizedAlias];
  }

  // Check aliases
  for (const [canonicalId, aliasEntry] of Object.entries(foodAliases.aliases)) {
    if (aliasEntry.aliases.includes(normalizedAlias)) {
      return foodDatabase[canonicalId];
    }
  }

  return undefined;
}

/**
 * Search foods by name (fuzzy matching)
 */
export function searchFoods(query: string, limit = 10): FoodEntry[] {
  const normalizedQuery = query.toLowerCase().trim();
  const results: Array<{ food: FoodEntry; score: number }> = [];

  for (const food of Object.values(foodDatabase)) {
    const name = food.name.toLowerCase();
    const id = food.id.toLowerCase();

    // Exact match gets highest score
    if (name === normalizedQuery || id === normalizedQuery) {
      results.push({ food, score: 100 });
      continue;
    }

    // Starts with query
    if (name.startsWith(normalizedQuery) || id.startsWith(normalizedQuery)) {
      results.push({ food, score: 80 });
      continue;
    }

    // Contains query
    if (name.includes(normalizedQuery) || id.includes(normalizedQuery)) {
      results.push({ food, score: 60 });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.food);
}

/**
 * Get foods by category
 */
export function getFoodsByCategory(categoryId: string): FoodEntry[] {
  const category = foodCategories.categories.find(c => c.id === categoryId);
  if (!category) return [];

  return category.examples
    .map(id => foodDatabase[id])
    .filter((f): f is FoodEntry => f !== undefined);
}

/**
 * Get all food IDs
 */
export function getAllFoodIds(): string[] {
  return Object.keys(foodDatabase);
}

/**
 * Get total food count
 */
export function getTotalFoodCount(): number {
  return foodMeta.totalFoods;
}

/**
 * Calculate nutrition for a specific amount of food
 */
export function calculateNutrition(
  food: FoodEntry,
  amountGrams: number
): NutritionPer100g {
  const multiplier = amountGrams / 100;

  const result: NutritionPer100g = {
    calories: Math.round(food.nutritionPer100g.calories * multiplier),
    protein: Number((food.nutritionPer100g.protein * multiplier).toFixed(1)),
    carbs: Number((food.nutritionPer100g.carbs * multiplier).toFixed(1)),
    fat: Number((food.nutritionPer100g.fat * multiplier).toFixed(1)),
    fiber: Number((food.nutritionPer100g.fiber * multiplier).toFixed(1)),
    sugar: Number((food.nutritionPer100g.sugar * multiplier).toFixed(1)),
    sodium: Math.round(food.nutritionPer100g.sodium * multiplier),
  };

  // Apply multiplier to optional fields if present
  const optionalFields: Array<keyof NutritionPer100g> = [
    'saturatedFat',
    'cholesterol',
    'potassium',
    'calcium',
    'iron',
    'magnesium',
    'vitaminA',
    'vitaminC',
    'vitaminD',
    'vitaminB12',
    'vitaminE',
    'vitaminK',
    'folate',
    'omega3',
    'phosphorus',
  ];

  for (const field of optionalFields) {
    const value = food.nutritionPer100g[field];
    if (value !== undefined) {
      // Use index assignment with type assertion
      (result as unknown as Record<string, number | undefined>)[field] = Number(
        (value * multiplier).toFixed(2)
      );
    }
  }

  return result;
}

/**
 * Apply preparation modifier to nutrition values
 */
export function applyPreparationModifier(
  nutrition: NutritionPer100g,
  preparationId: string
): NutritionPer100g {
  const prep = preparationModifiers.preparations[preparationId];
  if (!prep) return nutrition;

  const result = { ...nutrition };

  for (const [field, multiplier] of Object.entries(prep.multipliers)) {
    const key = field as keyof NutritionPer100g;
    const value = result[key];
    if (value !== undefined && typeof value === 'number') {
      // Use index assignment with type assertion
      (result as unknown as Record<string, number | undefined>)[key] = Number(
        (value * multiplier).toFixed(2)
      );
    }
  }

  return result;
}

/**
 * Get grade for a food on a specific focus goal
 */
export function getFocusGrade(
  food: FoodEntry,
  focusGoal: FocusGoal
): FocusGrade | undefined {
  return food.focusGrades?.[focusGoal];
}

// Default export with all utilities
export default {
  foods: foodDatabase,
  meta: foodMeta,
  preparations: preparationModifiers,
  aliases: foodAliases,
  categories: foodCategories,
  getFood,
  getFoodByAlias,
  searchFoods,
  getFoodsByCategory,
  getAllFoodIds,
  getTotalFoodCount,
  calculateNutrition,
  applyPreparationModifier,
  getFocusGrade,
};
