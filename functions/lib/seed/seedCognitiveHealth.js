"use strict";
/**
 * Cognitive Health Seed Data
 * Seeds cognitive health data for the test patient
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCognitiveHealth = seedCognitiveHealth;
exports.clearCognitiveHealth = clearCognitiveHealth;
const firestore_1 = require("firebase-admin/firestore");
async function seedCognitiveHealth(options) {
    const { patientId } = options;
    const db = (0, firestore_1.getFirestore)();
    console.log(`Seeding cognitive health for patient ${patientId}...`);
    // Get date strings
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];
    const cognitiveHealthData = {
        brainMRI: {
            status: 'Normal',
            date: formatDate(threeMonthsAgo),
            findings: 'No significant abnormalities detected. Brain structure appears normal for age.',
        },
        cognitiveAssessment: {
            moca: 27, // Montreal Cognitive Assessment (0-30, 26+ is normal)
            date: formatDate(lastMonth),
        },
        strokeRisk: {
            bloodPressure: {
                value: '128/82',
                status: 'on-target',
            },
            carotidPlaque: {
                value: 'Minimal',
                status: 'on-target',
            },
            hba1c: {
                value: 5.7,
                status: 'attention', // Pre-diabetic range
            },
        },
        mentalHealth: {
            dass21: {
                depression: 4, // Normal (0-9)
                anxiety: 6, // Normal (0-7)
                stress: 10, // Normal (0-14)
                date: formatDate(lastMonth),
            },
            qols: {
                score: 85, // Quality of Life Score (0-100)
                date: formatDate(lastMonth),
            },
            // moodTrend and sleepQuality will be populated from wellness logs by the hook
        },
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    // Save to cognitiveHealth/latest
    await db
        .collection('patients')
        .doc(patientId)
        .collection('cognitiveHealth')
        .doc('latest')
        .set(cognitiveHealthData);
    console.log('Cognitive health data seeded successfully');
}
async function clearCognitiveHealth(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const cognitiveRef = db
        .collection('patients')
        .doc(patientId)
        .collection('cognitiveHealth');
    const snapshot = await cognitiveRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared cognitive health data for patient ${patientId}`);
}
//# sourceMappingURL=seedCognitiveHealth.js.map