import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';
import { seedTestPatient, deleteTestPatient, seedArticles } from './seed/index';
import { getOrInitializeDailyMicroWins, updateMicroWinChallenge } from './domains/gamification/dailyMicroWins';
import * as careDataFunctions from './domains/care/careData';
import { seedCareData, clearCareData } from './seed/seedCareData';
import { clearMicroWins, seedMicroWins } from './seed/seedMicroWins';
import { seedHealthTrends, clearHealthTrends } from './seed/seedHealthTrends';
import { analyzeFoodPhoto as analyzeFoodPhotoFn, analyzeFoodText as analyzeFoodTextFn, openaiApiKey } from './domains/ai/foodAnalysis';
import { scanMenuPhoto as scanMenuPhotoFn } from './domains/ai/menuScanning';
import { searchFoods as searchFoodsFn, usdaApiKey } from './domains/ai/foodSearch';
import { compareFoodsWithAI, openaiApiKeyComparison, type WellnessFocus, type ComparisonFoodData } from './domains/ai/foodComparison';
import { gradeFoodWithAI, openaiApiKeyGrading, type GradingNutritionData } from './domains/ai/gradingRubric';

// Nutrition evaluation functions
import {
  evaluateNutritionDay,
  getNutritionTargets,
  getNutrientInfo,
  evaluateNutritionWeek,
} from './domains/nutrition';

// Initialize Firebase Admin
admin.initializeApp();

// Export seed functions (only for development)
export const seedTestPatientFn = https.onCall({ cors: true }, async () => {
  // Seed test patient
  const patientResult = await seedTestPatient();
  // Also seed articles
  await seedArticles();
  return patientResult;
});

export const deleteTestPatientFn = https.onCall({ cors: true }, async () => {
  return deleteTestPatient();
});

export const seedArticlesFn = https.onCall({ cors: true }, async () => {
  return seedArticles();
});

/**
 * Reseed MicroWins for test patient - clears existing and regenerates with new challenges
 */
export const reseedMicroWinsFn = https.onCall({ cors: true }, async (request) => {
  const patientId = request.data?.patientId || 'sarah-mitchell-test';

  // Clear existing micro-wins
  await clearMicroWins(patientId);

  // Reseed with new challenges
  await seedMicroWins({
    patientId,
    daysToSeed: 7,
    challengesPerDay: 5,
    completionRate: 0.7,
  });

  return { success: true, message: 'MicroWins reseeded successfully' };
});

/**
 * Reseed Health Trends for test patient - clears existing and regenerates 365 days of data
 */
export const reseedHealthTrendsFn = https.onCall({ cors: true }, async (request) => {
  const patientId = request.data?.patientId || 'sarah-mitchell-test';
  const daysToSeed = request.data?.daysToSeed || 365;

  // Clear existing health trends
  await clearHealthTrends(patientId);

  // Reseed with new data
  await seedHealthTrends({
    patientId,
    daysToSeed,
  });

  return { success: true, message: `Health trends reseeded (${daysToSeed} days)` };
});

// ============================================================================
// MICRO-WINS FUNCTIONS
// ============================================================================

/**
 * Get or initialize today's MicroWins for the authenticated patient
 */
export const getDailyMicroWins = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    const challengeCount = request.data?.challengeCount ?? 5;

    try {
      const microWins = await getOrInitializeDailyMicroWins(patientId, challengeCount);
      return microWins;
    } catch (error) {
      console.error('Error getting daily MicroWins:', error);
      throw new https.HttpsError('internal', 'Failed to get MicroWins');
    }
  }
);

/**
 * Complete or skip a MicroWin challenge
 */
export const completeMicroWin = https.onCall(
  { cors: true },
  async (request) => {
    const { patientId, challengeId, action } = request.data ?? {};

    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!challengeId) {
      throw new https.HttpsError('invalid-argument', 'Challenge ID is required');
    }
    if (!action || !['complete', 'skip', 'undo'].includes(action)) {
      throw new https.HttpsError('invalid-argument', 'Action must be "complete", "skip", or "undo"');
    }

    try {
      const microWins = await updateMicroWinChallenge(patientId, challengeId, action);
      return microWins;
    } catch (error) {
      console.error('Error completing MicroWin:', error);
      throw new https.HttpsError('internal', 'Failed to complete MicroWin');
    }
  }
);

// ============================================================================
// CARE DATA FUNCTIONS
// ============================================================================

/**
 * Get all care data for a patient
 */
export const getCareDataFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getCareData(patientId);
    } catch (error) {
      console.error('Error getting care data:', error);
      throw new https.HttpsError('internal', 'Failed to get care data');
    }
  }
);

/**
 * Get care team members
 */
export const getCareTeamFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getCareTeam(patientId);
    } catch (error) {
      console.error('Error getting care team:', error);
      throw new https.HttpsError('internal', 'Failed to get care team');
    }
  }
);

/**
 * Get medications
 */
export const getMedicationsFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getMedications(patientId);
    } catch (error) {
      console.error('Error getting medications:', error);
      throw new https.HttpsError('internal', 'Failed to get medications');
    }
  }
);

/**
 * Get today's medication schedule
 */
export const getMedicationScheduleFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getMedicationSchedule(patientId);
    } catch (error) {
      console.error('Error getting medication schedule:', error);
      throw new https.HttpsError('internal', 'Failed to get medication schedule');
    }
  }
);

/**
 * Log medication dose
 */
export const logMedicationDoseFn = https.onCall(
  { cors: true },
  async (request) => {
    const { patientId, doseId, action } = request.data ?? {};

    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!doseId) {
      throw new https.HttpsError('invalid-argument', 'Dose ID is required');
    }
    if (!action || !['taken', 'skipped'].includes(action)) {
      throw new https.HttpsError('invalid-argument', 'Action must be "taken" or "skipped"');
    }

    try {
      return await careDataFunctions.logMedicationDose(patientId, doseId, action);
    } catch (error) {
      console.error('Error logging medication dose:', error);
      throw new https.HttpsError('internal', 'Failed to log medication dose');
    }
  }
);

/**
 * Get tasks
 */
export const getTasksFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getTasks(patientId);
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new https.HttpsError('internal', 'Failed to get tasks');
    }
  }
);

/**
 * Complete a task
 */
export const completeTaskFn = https.onCall(
  { cors: true },
  async (request) => {
    const { patientId, taskId } = request.data ?? {};

    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!taskId) {
      throw new https.HttpsError('invalid-argument', 'Task ID is required');
    }

    try {
      return await careDataFunctions.completeTask(patientId, taskId);
    } catch (error) {
      console.error('Error completing task:', error);
      throw new https.HttpsError('internal', 'Failed to complete task');
    }
  }
);

/**
 * Get care plan goals
 */
export const getCarePlanGoalsFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getCarePlanGoals(patientId);
    } catch (error) {
      console.error('Error getting care plan goals:', error);
      throw new https.HttpsError('internal', 'Failed to get care plan goals');
    }
  }
);

/**
 * Get appointments
 */
export const getAppointmentsFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      return await careDataFunctions.getAppointments(patientId);
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw new https.HttpsError('internal', 'Failed to get appointments');
    }
  }
);

/**
 * Seed care data for a patient (development only)
 */
export const seedCareDataFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      await seedCareData({ patientId });
      return { success: true };
    } catch (error) {
      console.error('Error seeding care data:', error);
      throw new https.HttpsError('internal', 'Failed to seed care data');
    }
  }
);

/**
 * Clear care data for a patient (development only)
 */
export const clearCareDataFn = https.onCall(
  { cors: true },
  async (request) => {
    const patientId = request.data?.patientId;
    if (!patientId) {
      throw new https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
      await clearCareData(patientId);
      return { success: true };
    } catch (error) {
      console.error('Error clearing care data:', error);
      throw new https.HttpsError('internal', 'Failed to clear care data');
    }
  }
);

// ============================================================================
// AI FOOD ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze a food photo using GPT-4 Vision
 * Returns nutritional information for detected food items
 *
 * @param imageBase64 - Base64 encoded image data
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 */
export const analyzeFoodPhoto = https.onCall(
  {
    cors: true,
    secrets: [openaiApiKey],
  },
  async (request) => {
    const { imageBase64, detailLevel = 'essential' } = request.data ?? {};

    if (!imageBase64) {
      throw new https.HttpsError('invalid-argument', 'Image data is required');
    }

    // Validate base64 string (basic check)
    if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
      throw new https.HttpsError('invalid-argument', 'Invalid image data');
    }

    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
      throw new https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }

    try {
      // Note: detailLevel is accepted for backward compatibility but analysis always returns complete data
      // The UI filters what to display based on user preference
      // Photo analysis always uses 'full' model for best accuracy
      const result = await analyzeFoodPhotoFn(imageBase64, 'full');
      return result;
    } catch (error) {
      console.error('Error analyzing food photo:', error);
      // Pass through meaningful error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze food photo';
      // Use 'failed-precondition' for user-actionable errors
      const isUserActionable =
        errorMessage.toLowerCase().includes('no food') ||
        errorMessage.toLowerCase().includes('too many items') ||
        errorMessage.toLowerCase().includes('fewer food items');
      if (isUserActionable) {
        throw new https.HttpsError('failed-precondition', errorMessage);
      }
      throw new https.HttpsError('internal', errorMessage);
    }
  }
);

/**
 * Scan a restaurant menu photo using GPT-4 Vision
 * Returns extracted menu items with estimated nutritional information
 */
export const scanMenuPhoto = https.onCall(
  {
    cors: true,
    secrets: [openaiApiKey],
  },
  async (request) => {
    const { imageBase64 } = request.data ?? {};

    if (!imageBase64) {
      throw new https.HttpsError('invalid-argument', 'Image data is required');
    }

    // Validate base64 string (basic check)
    if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
      throw new https.HttpsError('invalid-argument', 'Invalid image data');
    }

    try {
      const result = await scanMenuPhotoFn(imageBase64);
      return result;
    } catch (error) {
      console.error('Error scanning menu photo:', error);
      throw new https.HttpsError('internal', 'Failed to scan menu photo');
    }
  }
);

/**
 * Search foods using USDA FoodData Central
 * Returns foods matching the query with nutrition information
 *
 * @param query - Search query string
 * @param limit - Max number of results (default 15)
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 */
export const searchFoods = https.onCall(
  {
    cors: true,
    secrets: [usdaApiKey],
  },
  async (request) => {
    const { query, limit, detailLevel = 'essential' } = request.data ?? {};

    if (!query || typeof query !== 'string') {
      throw new https.HttpsError('invalid-argument', 'Search query is required');
    }

    if (query.length < 2) {
      throw new https.HttpsError('invalid-argument', 'Query must be at least 2 characters');
    }

    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
      throw new https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }

    try {
      const results = await searchFoodsFn(query, limit || 15, detailLevel);
      return results;
    } catch (error) {
      console.error('Error searching foods:', error);
      throw new https.HttpsError('internal', 'Failed to search foods');
    }
  }
);

/**
 * Analyze food from text description using AI
 * Takes a natural language food description and returns nutritional estimates
 * Uses typical portion sizes for common foods when not specified
 *
 * Examples:
 * - "grilled chicken breast with rice and broccoli"
 * - "2 eggs, toast with butter, orange juice"
 * - "caesar salad"
 *
 * @param foodDescription - Natural language description of food
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 *
 * Returns items with servingMultiplier field that can be adjusted by user
 */
export const analyzeFoodText = https.onCall(
  {
    cors: true,
    secrets: [openaiApiKey],
  },
  async (request) => {
    const { foodDescription, detailLevel = 'essential' } = request.data ?? {};

    if (!foodDescription) {
      throw new https.HttpsError('invalid-argument', 'Food description is required');
    }

    if (typeof foodDescription !== 'string' || foodDescription.length < 2) {
      throw new https.HttpsError('invalid-argument', 'Food description must be at least 2 characters');
    }

    if (foodDescription.length > 500) {
      throw new https.HttpsError('invalid-argument', 'Food description must be less than 500 characters');
    }

    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
      throw new https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }

    try {
      // Note: detailLevel is accepted for backward compatibility but analysis always returns complete data
      // The UI filters what to display based on user preference
      const result = await analyzeFoodTextFn(foodDescription, false);
      return result;
    } catch (error) {
      console.error('Error analyzing food text:', error);
      throw new https.HttpsError('internal', 'Failed to analyze food description');
    }
  }
);

/**
 * Compare multiple foods using AI to provide contextual insights
 * Takes analyzed food data and user's wellness focuses, returns AI-generated comparison
 *
 * @param foods - Array of food nutrition data (2-5 foods)
 * @param userFocuses - Array of wellness focus IDs the user cares about
 *
 * Returns:
 * - verdict: Summary of which food is better and why
 * - winnerIndex: Index of the best food (0-based) or null
 * - contextualAnalysis: Deeper analysis of tradeoffs
 * - focusInsights: Insights specific to each selected focus
 * - surprises: Interesting nutritional facts
 * - recommendation: Optional practical tip
 */
export const compareFoodsAI = https.onCall(
  {
    cors: true,
    secrets: [openaiApiKeyComparison],
  },
  async (request) => {
    const { foods, userFocuses = ['balanced'] } = request.data ?? {};

    if (!foods || !Array.isArray(foods)) {
      throw new https.HttpsError('invalid-argument', 'Foods array is required');
    }

    if (foods.length < 2 || foods.length > 5) {
      throw new https.HttpsError('invalid-argument', 'Must provide 2-5 foods for comparison');
    }

    // Validate each food has required fields
    for (const food of foods) {
      if (!food.name || typeof food.calories !== 'number') {
        throw new https.HttpsError('invalid-argument', 'Each food must have name and calories');
      }
    }

    // Validate focuses
    const validFocuses: WellnessFocus[] = [
      'muscle_building',
      'heart_health',
      'energy_endurance',
      'weight_management',
      'brain_focus',
      'gut_health',
      'blood_sugar_balance',
      'bone_joint_support',
      'anti_inflammatory',
      'balanced',
    ];
    const focuses = (userFocuses as string[]).filter((f): f is WellnessFocus =>
      validFocuses.includes(f as WellnessFocus)
    );

    try {
      const result = await compareFoodsWithAI(foods as ComparisonFoodData[], focuses);
      return result;
    } catch (error) {
      console.error('Error comparing foods with AI:', error);
      throw new https.HttpsError('internal', 'Failed to compare foods');
    }
  }
);

/**
 * Grade a food for all 10 wellness focuses using AI
 *
 * Uses GPT-4o-mini for cost efficiency (~$0.0003 per grading)
 * Returns grades A-F for each focus based on a consistent rubric
 *
 * Params:
 * - nutrition: GradingNutritionData with name, calories, protein, carbs, fat, fiber, sugar, sodium
 *   and optional: saturatedFat, transFat, cholesterol, potassium, calcium, iron, magnesium
 *
 * Returns:
 * - focusGrades: Record<WellnessFocus, HealthGrade> (A-F for each of 10 focuses)
 * - overallGrade: HealthGrade (overall wellness grade)
 * - primaryConcerns: string[] (up to 3 main nutritional concerns)
 * - strengths: string[] (up to 3 nutritional strengths)
 */
export const gradeFoodAI = https.onCall(
  {
    cors: true,
    secrets: [openaiApiKeyGrading],
  },
  async (request) => {
    const { nutrition } = request.data ?? {};

    if (!nutrition || typeof nutrition !== 'object') {
      throw new https.HttpsError('invalid-argument', 'Nutrition data is required');
    }

    // Validate required fields
    const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'];
    for (const field of requiredFields) {
      if (nutrition[field] === undefined || nutrition[field] === null) {
        throw new https.HttpsError('invalid-argument', `Missing required field: ${field}`);
      }
    }

    try {
      const result = await gradeFoodWithAI(nutrition as GradingNutritionData);
      return result;
    } catch (error) {
      console.error('Error grading food with AI:', error);
      throw new https.HttpsError('internal', 'Failed to grade food');
    }
  }
);

// ============================================================================
// NUTRITION EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluate a single day's nutrition intake
 * Returns full evaluation with score, highlights, gaps, and summary
 */
export { evaluateNutritionDay };

/**
 * Get personalized nutrition targets for a user
 * Based on age, sex, activity level, and goals
 */
export { getNutritionTargets };

/**
 * Get educational information about a specific nutrient
 * Includes what it does, why it matters, and food sources
 */
export { getNutrientInfo };

/**
 * Evaluate multiple days of nutrition intake (up to 14 days)
 * Returns daily evaluations, average score, best day, and trend
 */
export { evaluateNutritionWeek };
