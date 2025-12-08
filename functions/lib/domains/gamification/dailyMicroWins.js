"use strict";
/**
 * Daily MicroWins Cloud Function
 *
 * Initializes or retrieves today's MicroWins for a patient.
 * Uses the challenge library to generate personalized challenges.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrInitializeDailyMicroWins = getOrInitializeDailyMicroWins;
exports.updateMicroWinChallenge = updateMicroWinChallenge;
const firestore_1 = require("firebase-admin/firestore");
const challengeLibrary_1 = require("./challengeLibrary");
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
/**
 * Get or initialize today's MicroWins for a patient.
 * If no MicroWins exist for today, generate them from the library.
 */
async function getOrInitializeDailyMicroWins(patientId, challengeCount = 5) {
    const db = (0, firestore_1.getFirestore)();
    const date = getTodayDate();
    const microWinsRef = db.collection('patients').doc(patientId).collection('microWins').doc(date);
    const snapshot = await microWinsRef.get();
    if (snapshot.exists) {
        const data = snapshot.data();
        return {
            ...data,
            date,
        };
    }
    // Generate new challenges from the library
    const challenges = (0, challengeLibrary_1.generateDailyMicroWins)(challengeCount);
    const newMicroWins = {
        date,
        challenges: challenges.map((c) => ({
            ...c,
            completedAt: null,
        })),
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    await microWinsRef.set(newMicroWins);
    return {
        ...newMicroWins,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
/**
 * Update a challenge's completion status
 */
async function updateMicroWinChallenge(patientId, challengeId, action) {
    const db = (0, firestore_1.getFirestore)();
    const date = getTodayDate();
    const microWinsRef = db.collection('patients').doc(patientId).collection('microWins').doc(date);
    const snapshot = await microWinsRef.get();
    if (!snapshot.exists) {
        throw new Error(`No MicroWins found for date ${date}`);
    }
    const data = snapshot.data();
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
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return {
        ...data,
        challenges: updatedChallenges,
        updatedAt: new Date(),
    };
}
//# sourceMappingURL=dailyMicroWins.js.map