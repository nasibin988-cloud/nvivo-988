/**
 * Test Patient Seeding
 *
 * Seeds a complete test patient with realistic data for development.
 * Includes: profile, health data, appointments, medications, messages, MicroWins, etc.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { TEST_PATIENT_ID, TEST_PATIENT_PROFILE, TEST_CLINICIAN_ID, TEST_CLINICIAN_PROFILE } from './config/testPatient';
import { seedMicroWins, clearMicroWins } from './seedMicroWins';
import { seedCareData, clearCareData } from './seedCareData';
import { seedCardiacHealth, clearCardiacHealth } from './seedCardiacHealth';

/**
 * Seed all test data for the test patient
 */
export async function seedTestPatient(): Promise<{ success: boolean; patientId: string }> {
  const db = getFirestore();

  console.log('Starting test patient seed...');

  try {
    // 1. Create patient profile
    console.log('Creating patient profile...');
    await db.collection('patients').doc(TEST_PATIENT_ID).set(TEST_PATIENT_PROFILE);

    // 2. Create test clinician
    console.log('Creating test clinician...');
    await db.collection('clinicians').doc(TEST_CLINICIAN_ID).set(TEST_CLINICIAN_PROFILE);

    // 3. Seed MicroWins (7 days of history + today)
    console.log('Seeding MicroWins...');
    await seedMicroWins({
      patientId: TEST_PATIENT_ID,
      daysToSeed: 7,
      challengesPerDay: 5,
      completionRate: 0.7,
    });

    // 4. Seed streak data
    console.log('Seeding streak data...');
    await seedStreakData(TEST_PATIENT_ID);

    // 5. Seed wellness logs
    console.log('Seeding wellness logs...');
    await seedWellnessLogs(TEST_PATIENT_ID);

    // 6. Seed care data (care team, medications, tasks, goals, appointments)
    console.log('Seeding care data...');
    await seedCareData({ patientId: TEST_PATIENT_ID });

    // 7. Seed cardiac health data (plaque, lipids, biomarkers, BP/LDL trends)
    console.log('Seeding cardiac health data...');
    await seedCardiacHealth({ patientId: TEST_PATIENT_ID });

    console.log('Test patient seed complete!');
    return { success: true, patientId: TEST_PATIENT_ID };
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

  console.log('Deleting test patient data...');

  try {
    // Clear MicroWins
    await clearMicroWins(TEST_PATIENT_ID);

    // Clear care data
    await clearCareData(TEST_PATIENT_ID);

    // Clear cardiac health data
    await clearCardiacHealth(TEST_PATIENT_ID);

    // Clear streaks
    const streaksSnapshot = await db
      .collection('patients')
      .doc(TEST_PATIENT_ID)
      .collection('streaks')
      .get();
    const streaksBatch = db.batch();
    streaksSnapshot.docs.forEach((doc) => streaksBatch.delete(doc.ref));
    await streaksBatch.commit();

    // Clear wellness logs
    const wellnessSnapshot = await db
      .collection('patients')
      .doc(TEST_PATIENT_ID)
      .collection('wellnessLogs')
      .get();
    const wellnessBatch = db.batch();
    wellnessSnapshot.docs.forEach((doc) => wellnessBatch.delete(doc.ref));
    await wellnessBatch.commit();

    // Delete patient document
    await db.collection('patients').doc(TEST_PATIENT_ID).delete();

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
