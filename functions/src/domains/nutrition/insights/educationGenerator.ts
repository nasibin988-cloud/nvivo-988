/**
 * Education Generator
 *
 * Generates educational content about nutrients from the JSON definitions.
 * All content is descriptive and educational (FDA compliant).
 */

import { nutritionData } from '../data';

export interface NutrientEducation {
  nutrientId: string;
  displayName: string;
  whatItDoes: string;
  foodSources: string[];
  deficiencySigns?: string;
  excessRisks?: string;
  specialNotes?: string;
}

/**
 * Get educational information about a nutrient
 */
export function getNutrientEducation(nutrientId: string): NutrientEducation | null {
  const nutrient = nutritionData.getNutrient(nutrientId);
  if (!nutrient) return null;

  const education = nutrient.education;

  // Parse food sources from the string (usually comma-separated in the JSON)
  const foodSources = education?.foodSources
    ? parseFoodSources(education.foodSources)
    : getDefaultFoodSources(nutrientId);

  return {
    nutrientId,
    displayName: nutrient.displayName,
    whatItDoes: education?.importance ?? getDefaultDescription(nutrientId),
    foodSources,
    deficiencySigns: education?.deficiencySigns,
    excessRisks: education?.excessRisks,
    specialNotes: education?.specialConsiderations,
  };
}

/**
 * Parse food sources from a string into an array
 */
function parseFoodSources(sourcesStr: string): string[] {
  // Handle common formats: comma-separated, "include X, Y, and Z"
  return sourcesStr
    .replace(/^.*?include\s+/i, '')
    .replace(/\s+and\s+/g, ', ')
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50) // Filter out long descriptions
    .slice(0, 8); // Limit to 8 sources
}

/**
 * Get default food sources for common nutrients
 */
function getDefaultFoodSources(nutrientId: string): string[] {
  const defaults: Record<string, string[]> = {
    protein: ['Meat', 'Poultry', 'Fish', 'Eggs', 'Dairy', 'Legumes', 'Nuts'],
    fiber: ['Whole grains', 'Vegetables', 'Fruits', 'Legumes', 'Nuts', 'Seeds'],
    vitamin_c: ['Citrus fruits', 'Bell peppers', 'Strawberries', 'Broccoli', 'Tomatoes'],
    vitamin_d: ['Fatty fish', 'Fortified milk', 'Egg yolks', 'Sunlight exposure'],
    calcium: ['Dairy products', 'Fortified plant milks', 'Leafy greens', 'Tofu'],
    iron: ['Red meat', 'Poultry', 'Beans', 'Fortified cereals', 'Spinach'],
    potassium: ['Bananas', 'Potatoes', 'Beans', 'Yogurt', 'Salmon', 'Avocado'],
    magnesium: ['Nuts', 'Seeds', 'Whole grains', 'Leafy greens', 'Legumes'],
    zinc: ['Oysters', 'Beef', 'Crab', 'Fortified cereals', 'Pumpkin seeds'],
    vitamin_a: ['Sweet potatoes', 'Carrots', 'Spinach', 'Eggs', 'Fortified milk'],
    vitamin_e: ['Nuts', 'Seeds', 'Vegetable oils', 'Spinach', 'Broccoli'],
    vitamin_k: ['Leafy greens', 'Broccoli', 'Brussels sprouts', 'Cabbage'],
    folate: ['Leafy greens', 'Legumes', 'Fortified grains', 'Asparagus', 'Eggs'],
    vitamin_b12: ['Meat', 'Fish', 'Dairy', 'Eggs', 'Fortified cereals'],
    sodium: ['Table salt', 'Processed foods', 'Canned goods', 'Restaurant meals'],
    saturated_fat: ['Fatty meats', 'Full-fat dairy', 'Butter', 'Coconut oil'],
    added_sugars: ['Sodas', 'Candy', 'Baked goods', 'Sweetened cereals'],
  };

  return defaults[nutrientId] ?? ['Various whole foods'];
}

/**
 * Get default description for common nutrients
 */
function getDefaultDescription(nutrientId: string): string {
  const defaults: Record<string, string> = {
    protein: 'Essential for building and repairing tissues, making enzymes and hormones.',
    fiber: 'Supports digestive health, helps maintain healthy cholesterol levels, and promotes satiety.',
    vitamin_c: 'Supports immune function, collagen production, and acts as an antioxidant.',
    vitamin_d: 'Important for bone health, immune function, and calcium absorption.',
    calcium: 'Essential for strong bones and teeth, muscle function, and nerve signaling.',
    iron: 'Necessary for oxygen transport in blood and energy production.',
    potassium: 'Helps regulate fluid balance, muscle contractions, and nerve signals.',
    magnesium: 'Involved in hundreds of enzymatic reactions, muscle and nerve function.',
    zinc: 'Supports immune function, wound healing, and protein synthesis.',
    vitamin_a: 'Important for vision, immune function, and cell growth.',
    vitamin_e: 'Acts as an antioxidant, protecting cells from damage.',
    vitamin_k: 'Essential for blood clotting and bone metabolism.',
    folate: 'Critical for cell division and DNA synthesis, especially important during pregnancy.',
    vitamin_b12: 'Necessary for nerve function, red blood cell formation, and DNA synthesis.',
    sodium: 'Helps regulate fluid balance and blood pressure. Most people consume more than needed.',
    saturated_fat: 'A type of fat found in animal products. High intake is associated with increased cholesterol.',
    added_sugars: 'Sugars added during processing. Excess intake is linked to various health concerns.',
    carbohydrate: 'The body\'s primary source of energy for physical activity and brain function.',
    total_fat: 'Provides energy, supports cell growth, and helps absorb certain vitamins.',
    cholesterol: 'Used to build cells and make vitamins and hormones. Body produces what it needs.',
  };

  return defaults[nutrientId] ?? 'An important nutrient for overall health.';
}

/**
 * Get a brief "why it matters" message for a nutrient
 */
export function getWhyItMatters(nutrientId: string): string {
  const education = getNutrientEducation(nutrientId);
  if (!education) return 'This nutrient supports your overall health.';

  // Return a shortened version of whatItDoes
  const full = education.whatItDoes;
  if (full.length <= 100) return full;

  // Truncate at sentence boundary
  const firstSentence = full.split(/[.!?]/)[0];
  return firstSentence + '.';
}

/**
 * Get food suggestions for improving a nutrient
 */
export function getFoodSuggestions(nutrientId: string, count: number = 3): string[] {
  const education = getNutrientEducation(nutrientId);
  if (!education) return [];
  return education.foodSources.slice(0, count);
}

/**
 * Get all nutrients by category with education
 */
export function getNutrientsByCategory(category: string): NutrientEducation[] {
  const nutrients = nutritionData.getNutrientsByCategory(category);
  return nutrients
    .map((n) => getNutrientEducation(n.nutrientId))
    .filter((e): e is NutrientEducation => e !== null);
}
