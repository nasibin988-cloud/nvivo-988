import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';
import { seedTestPatient, deleteTestPatient } from './seed';
import { getOrInitializeDailyMicroWins, updateMicroWinChallenge } from './domains/gamification/dailyMicroWins';
import * as careDataFunctions from './domains/care/careData';
import { seedCareData, clearCareData } from './seed/seedCareData';
import { clearMicroWins, seedMicroWins } from './seed/seedMicroWins';
import { seedHealthTrends, clearHealthTrends } from './seed/seedHealthTrends';
import { analyzeFoodPhoto as analyzeFoodPhotoFn, openaiApiKey } from './domains/ai/foodAnalysis';
import { scanMenuPhoto as scanMenuPhotoFn } from './domains/ai/menuScanning';
import { searchFoods as searchFoodsFn, usdaApiKey } from './domains/ai/foodSearch';

// Initialize Firebase Admin
admin.initializeApp();

// Export seed functions (only for development)
export const seedTestPatientFn = https.onCall({ cors: true }, async () => {
  return seedTestPatient();
});

export const deleteTestPatientFn = https.onCall({ cors: true }, async () => {
  return deleteTestPatient();
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
 */
export const analyzeFoodPhoto = https.onCall(
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
      const result = await analyzeFoodPhotoFn(imageBase64);
      return result;
    } catch (error) {
      console.error('Error analyzing food photo:', error);
      throw new https.HttpsError('internal', 'Failed to analyze food photo');
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
 */
export const searchFoods = https.onCall(
  {
    cors: true,
    secrets: [usdaApiKey],
  },
  async (request) => {
    const { query, limit } = request.data ?? {};

    if (!query || typeof query !== 'string') {
      throw new https.HttpsError('invalid-argument', 'Search query is required');
    }

    if (query.length < 2) {
      throw new https.HttpsError('invalid-argument', 'Query must be at least 2 characters');
    }

    try {
      const results = await searchFoodsFn(query, limit || 15);
      return results;
    } catch (error) {
      console.error('Error searching foods:', error);
      throw new https.HttpsError('internal', 'Failed to search foods');
    }
  }
);
