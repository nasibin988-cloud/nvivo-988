/**
 * Test Patient Seeding
 *
 * Seeds a complete test patient with realistic data for development.
 * Includes: profile, health data, appointments, medications, messages, MicroWins, etc.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { TEST_PATIENT_PROFILE, TEST_CLINICIAN_ID, TEST_CLINICIAN_PROFILE, TEST_PATIENT_NUTRITION_PROFILE } from './config/testPatient';
import { seedMicroWins, clearMicroWins } from './seedMicroWins';
import { seedCareData, clearCareData } from './seedCareData';
import { seedCardiacHealth, clearCardiacHealth } from './seedCardiacHealth';
import { seedHealthTrends, clearHealthTrends } from './seedHealthTrends';
import { seedNutritionTargets, clearNutritionTargets } from './seedNutritionTargets';
// Re-export seedArticles for convenience
export { seedArticles, clearArticles } from './seedArticles';

// Test credentials
const TEST_EMAIL = 'sarah.mitchell@test.nvivo.health';
const TEST_PASSWORD = 'TestPatient2024!';

/**
 * Seed all test data for the test patient
 */
export async function seedTestPatient(): Promise<{ success: boolean; patientId: string; email: string; password: string; message: string }> {
  const db = getFirestore();
  const auth = getAuth();

  console.log('Starting test patient seed...');

  try {
    // 1. Create or get Firebase Auth user
    let authUser;
    try {
      authUser = await auth.getUserByEmail(TEST_EMAIL);
      console.log('Found existing auth user:', authUser.uid);
    } catch {
      // User doesn't exist, create it
      authUser = await auth.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        displayName: `${TEST_PATIENT_PROFILE.firstName} ${TEST_PATIENT_PROFILE.lastName}`,
      });
      console.log('Created new auth user:', authUser.uid);
    }

    const patientId = authUser.uid;

    // 2. Create patient profile with Auth UID as document ID
    console.log('Creating patient profile...');
    await db.collection('patients').doc(patientId).set({
      ...TEST_PATIENT_PROFILE,
      id: patientId,
    });

    // 3. Create test clinician
    console.log('Creating test clinician...');
    await db.collection('clinicians').doc(TEST_CLINICIAN_ID).set(TEST_CLINICIAN_PROFILE);

    // 4. Seed MicroWins (7 days of history + today)
    console.log('Seeding MicroWins...');
    await seedMicroWins({
      patientId,
      daysToSeed: 7,
      challengesPerDay: 5,
      completionRate: 0.7,
    });

    // 5. Seed streak data
    console.log('Seeding streak data...');
    await seedStreakData(patientId);

    // 6. Seed wellness logs
    console.log('Seeding wellness logs...');
    await seedWellnessLogs(patientId);

    // 7. Seed care data (care team, medications, tasks, goals, appointments)
    console.log('Seeding care data...');
    await seedCareData({ patientId });

    // 8. Seed cardiac health data (plaque, lipids, biomarkers, BP/LDL trends)
    console.log('Seeding cardiac health data...');
    await seedCardiacHealth({ patientId });

    // 9. Seed comprehensive health trends (365 days of metrics)
    console.log('Seeding health trends data...');
    await seedHealthTrends({ patientId, daysToSeed: 365 });

    // 10. Seed personalized nutrition targets (DRI-based)
    console.log('Seeding nutrition targets...');
    await seedNutritionTargets({
      patientId,
      nutritionProfile: TEST_PATIENT_NUTRITION_PROFILE,
    });

    console.log('Test patient seed complete!');
    return {
      success: true,
      patientId,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      message: `Test patient ${TEST_PATIENT_PROFILE.firstName} ${TEST_PATIENT_PROFILE.lastName} created successfully`,
    };
  } catch (error) {
    console.error('Error seeding test patient:', error);
    throw error;
  }
}

/**
 * Delete all test patient data
 */
export async function deleteTestPatient(): Promise<{ success: boolean }> {
  const db = getFirestore();
  const auth = getAuth();

  console.log('Deleting test patient data...');

  try {
    // Get the auth user to find the patient ID
    let patientId: string;
    try {
      const authUser = await auth.getUserByEmail(TEST_EMAIL);
      patientId = authUser.uid;
      // Delete the auth user
      await auth.deleteUser(patientId);
      console.log('Deleted auth user:', patientId);
    } catch {
      console.log('Auth user not found, skipping auth deletion');
      return { success: true };
    }

    // Clear MicroWins
    await clearMicroWins(patientId);

    // Clear care data
    await clearCareData(patientId);

    // Clear cardiac health data
    await clearCardiacHealth(patientId);

    // Clear health trends
    await clearHealthTrends(patientId);

    // Clear nutrition targets
    await clearNutritionTargets(patientId);

    // Clear streaks
    const streaksSnapshot = await db
      .collection('patients')
      .doc(patientId)
      .collection('streaks')
      .get();
    const streaksBatch = db.batch();
    streaksSnapshot.docs.forEach((doc) => streaksBatch.delete(doc.ref));
    await streaksBatch.commit();

    // Clear wellness logs
    const wellnessSnapshot = await db
      .collection('patients')
      .doc(patientId)
      .collection('wellnessLogs')
      .get();
    const wellnessBatch = db.batch();
    wellnessSnapshot.docs.forEach((doc) => wellnessBatch.delete(doc.ref));
    await wellnessBatch.commit();

    // Delete patient document
    await db.collection('patients').doc(patientId).delete();

    // Delete clinician document
    await db.collection('clinicians').doc(TEST_CLINICIAN_ID).delete();

    console.log('Test patient data deleted!');
    return { success: true };
  } catch (error) {
    console.error('Error deleting test patient:', error);
    throw error;
  }
}

/**
 * Seed streak data for a patient
 */
async function seedStreakData(patientId: string): Promise<void> {
  const db = getFirestore();
  const now = new Date();

  // Create a 5-day streak (current streak)
  const streakDoc = db.collection('patients').doc(patientId).collection('streaks').doc('current');
  await streakDoc.set({
    type: 'daily_engagement',
    currentStreak: 5,
    longestStreak: 12,
    lastActivityDate: now,
    streakStartDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  });
}

/**
 * Seed wellness logs for a patient
 */
async function seedWellnessLogs(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();

  // Create wellness logs for the past 7 days
  for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dateStr = formatDate(date);
    const docRef = db.collection('patients').doc(patientId).collection('wellnessLogs').doc(dateStr);

    batch.set(docRef, {
      date: dateStr,
      mood: getRandomMood(),
      energy: getRandomEnergy(),
      sleep: {
        hours: 5 + Math.random() * 4, // 5-9 hours
        quality: Math.floor(Math.random() * 3) + 3, // 3-5 rating
      },
      notes: daysAgo === 0 ? 'Feeling good today!' : null,
      createdAt: date,
      updatedAt: date,
    });
  }

  await batch.commit();
  console.log('Seeded 8 days of wellness logs');
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRandomMood(): string {
  const moods = ['great', 'good', 'okay', 'low', 'bad'];
  const weights = [0.15, 0.35, 0.30, 0.15, 0.05]; // Weighted towards positive
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < moods.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) return moods[i];
  }
  return 'okay';
}

function getRandomEnergy(): string {
  const levels = ['high', 'moderate', 'low'];
  const weights = [0.25, 0.50, 0.25];
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) return levels[i];
  }
  return 'moderate';
}
