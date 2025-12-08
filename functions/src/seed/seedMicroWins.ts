/**
 * Seed MicroWins for test patient
 *
 * Creates daily MicroWin challenges for the past 7 days and today.
 * Uses the challenge library and randomly selects 3 challenges per day.
 */

import { getFirestore } from 'firebase-admin/firestore';
import {
  generateDailyMicroWins,
  selectRandomChallenges,
  templateToMicroWin,
} from '../domains/gamification/challengeLibrary';
import { formatDateYYYYMMDD, getDateDaysAgo } from './utils/dateUtils';

interface SeedMicroWinsOptions {
  patientId: string;
  daysToSeed?: number; // How many days of history to create (default: 7)
  challengesPerDay?: number; // Challenges per day (default: 3)
  completionRate?: number; // Probability a past challenge is completed (default: 0.7)
}

/**
 * Seed MicroWins data for a patient
 */
export async function seedMicroWins(options: SeedMicroWinsOptions): Promise<void> {
  const {
    patientId,
    daysToSeed = 7,
    challengesPerDay = 3,
    completionRate = 0.7,
  } = options;

  const db = getFirestore();
  const batch = db.batch();

  console.log(`Seeding MicroWins for patient ${patientId}...`);

  // Track used challenge IDs to avoid repeats in recent days
  const recentlyUsedIds: string[] = [];

  // Seed past days (with some completed/skipped)
  for (let daysAgo = daysToSeed; daysAgo >= 1; daysAgo--) {
    const date = getDateDaysAgo(daysAgo);
    const dateStr = formatDateYYYYMMDD(date);

    // Select challenges, excluding recently used ones
    const templates = selectRandomChallenges(challengesPerDay, {
      excludeIds: recentlyUsedIds.slice(-15), // Avoid repeats in last 5 days (15 challenges)
    });

    // Track these as used
    templates.forEach((t) => recentlyUsedIds.push(t.id));

    // Create challenges with random completion status for past days
    const challenges = templates.map((template) => {
      const challenge = templateToMicroWin(template);
      const random = Math.random();

      if (random < completionRate) {
        // Completed
        challenge.completed = true;
        (challenge as { completedAt: Date | null }).completedAt = new Date(
          date.getTime() + Math.random() * 12 * 60 * 60 * 1000 // Random time during the day
        );
      } else if (random < completionRate + 0.15) {
        // Skipped (15% chance)
        challenge.skipped = true;
      }
      // Otherwise: left incomplete (rare for past days)

      return challenge;
    });

    const docRef = db.collection('patients').doc(patientId).collection('microWins').doc(dateStr);
    batch.set(docRef, {
      date: dateStr,
      challenges,
      createdAt: date,
    });
  }

  // Seed today (fresh, uncompleted challenges)
  const today = new Date();
  const todayStr = formatDateYYYYMMDD(today);

  const todayChallenges = generateDailyMicroWins(challengesPerDay, {
    excludeIds: recentlyUsedIds.slice(-9), // Avoid repeats from last 3 days
  });

  const todayDocRef = db.collection('patients').doc(patientId).collection('microWins').doc(todayStr);
  batch.set(todayDocRef, {
    date: todayStr,
    challenges: todayChallenges,
    createdAt: today,
  });

  await batch.commit();

  console.log(`Seeded ${daysToSeed + 1} days of MicroWins (${challengesPerDay} challenges each)`);
}

/**
 * Clear all MicroWins for a patient (for testing)
 */
export async function clearMicroWins(patientId: string): Promise<void> {
  const db = getFirestore();
  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('microWins')
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log(`Cleared ${snapshot.size} MicroWins documents for patient ${patientId}`);
}
