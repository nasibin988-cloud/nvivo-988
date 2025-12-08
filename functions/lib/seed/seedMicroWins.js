"use strict";
/**
 * Seed MicroWins for test patient
 *
 * Creates daily MicroWin challenges for the past 7 days and today.
 * Uses the challenge library and randomly selects 3 challenges per day.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMicroWins = seedMicroWins;
exports.clearMicroWins = clearMicroWins;
const firestore_1 = require("firebase-admin/firestore");
const challengeLibrary_1 = require("../domains/gamification/challengeLibrary");
const dateUtils_1 = require("./utils/dateUtils");
/**
 * Seed MicroWins data for a patient
 */
async function seedMicroWins(options) {
    const { patientId, daysToSeed = 7, challengesPerDay = 3, completionRate = 0.7, } = options;
    const db = (0, firestore_1.getFirestore)();
    const batch = db.batch();
    console.log(`Seeding MicroWins for patient ${patientId}...`);
    // Track used challenge IDs to avoid repeats in recent days
    const recentlyUsedIds = [];
    // Seed past days (with some completed/skipped)
    for (let daysAgo = daysToSeed; daysAgo >= 1; daysAgo--) {
        const date = (0, dateUtils_1.getDateDaysAgo)(daysAgo);
        const dateStr = (0, dateUtils_1.formatDateYYYYMMDD)(date);
        // Select challenges, excluding recently used ones
        const templates = (0, challengeLibrary_1.selectRandomChallenges)(challengesPerDay, {
            excludeIds: recentlyUsedIds.slice(-15), // Avoid repeats in last 5 days (15 challenges)
        });
        // Track these as used
        templates.forEach((t) => recentlyUsedIds.push(t.id));
        // Create challenges with random completion status for past days
        const challenges = templates.map((template) => {
            const challenge = (0, challengeLibrary_1.templateToMicroWin)(template);
            const random = Math.random();
            if (random < completionRate) {
                // Completed
                challenge.completed = true;
                challenge.completedAt = new Date(date.getTime() + Math.random() * 12 * 60 * 60 * 1000 // Random time during the day
                );
            }
            else if (random < completionRate + 0.15) {
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
    const todayStr = (0, dateUtils_1.formatDateYYYYMMDD)(today);
    const todayChallenges = (0, challengeLibrary_1.generateDailyMicroWins)(challengesPerDay, {
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
async function clearMicroWins(patientId) {
    const db = (0, firestore_1.getFirestore)();
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
//# sourceMappingURL=seedMicroWins.js.map