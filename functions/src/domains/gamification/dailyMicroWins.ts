/**
 * Daily MicroWins Cloud Function
 *
 * Initializes or retrieves today's MicroWins for a patient.
 * Uses the challenge library to generate personalized challenges.
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { generateDailyMicroWins } from './challengeLibrary';

export interface MicroWinChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
  completedAt: Date | null;
}

export interface MicroWins {
  date: string;
  challenges: MicroWinChallenge[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get or initialize today's MicroWins for a patient.
 * If no MicroWins exist for today, generate them from the library.
 */
export async function getOrInitializeDailyMicroWins(
  patientId: string,
  challengeCount: number = 5
): Promise<MicroWins> {
  const db = getFirestore();
  const date = getTodayDate();
  const microWinsRef = db.collection('patients').doc(patientId).collection('microWins').doc(date);

  const snapshot = await microWinsRef.get();

  if (snapshot.exists) {
    const data = snapshot.data() as MicroWins;
    return {
      ...data,
      date,
    };
  }

  // Generate new challenges from the library
  const challenges = generateDailyMicroWins(challengeCount);

  const newMicroWins: MicroWins = {
    date,
    challenges: challenges.map((c) => ({
      ...c,
      completedAt: null,
    })),
    createdAt: FieldValue.serverTimestamp() as unknown as FirebaseFirestore.Timestamp,
    updatedAt: FieldValue.serverTimestamp() as unknown as FirebaseFirestore.Timestamp,
  };

  await microWinsRef.set(newMicroWins);

  return {
    ...newMicroWins,
    createdAt: new Date() as unknown as FirebaseFirestore.Timestamp,
    updatedAt: new Date() as unknown as FirebaseFirestore.Timestamp,
  };
}

/**
 * Update a challenge's completion status
 */
export async function updateMicroWinChallenge(
  patientId: string,
  challengeId: string,
  action: 'complete' | 'skip' | 'undo'
): Promise<MicroWins> {
  const db = getFirestore();
  const date = getTodayDate();
  const microWinsRef = db.collection('patients').doc(patientId).collection('microWins').doc(date);

  const snapshot = await microWinsRef.get();

  if (!snapshot.exists) {
    throw new Error(`No MicroWins found for date ${date}`);
  }

  const data = snapshot.data() as MicroWins;
  const updatedChallenges = data.challenges.map((c) => {
    if (c.id === challengeId) {
      if (action === 'undo') {
        return {
          ...c,
          completed: false,
          skipped: false,
          completedAt: null,
        };
      }
      return {
        ...c,
        completed: action === 'complete',
        skipped: action === 'skip',
        completedAt: action === 'complete' ? new Date() : null,
      };
    }
    return c;
  });

  await microWinsRef.update({
    challenges: updatedChallenges,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    ...data,
    challenges: updatedChallenges,
    updatedAt: new Date() as unknown as FirebaseFirestore.Timestamp,
  };
}
