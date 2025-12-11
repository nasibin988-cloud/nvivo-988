"use strict";
/**
 * Seed Nutrition Targets
 *
 * Computes and stores personalized nutrition targets for a patient
 * based on their demographics and health profile.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedNutritionTargets = seedNutritionTargets;
exports.clearNutritionTargets = clearNutritionTargets;
exports.getNutritionTargets = getNutritionTargets;
const firestore_1 = require("firebase-admin/firestore");
const targets_1 = require("../domains/nutrition/targets");
/**
 * Seed personalized nutrition targets for a patient
 *
 * Stores targets in: patients/{patientId}/nutritionTargets/current
 *
 * The targets include:
 * - Calorie target (based on Mifflin-St Jeor)
 * - All micronutrient targets (RDA/AI with age/sex adjustments)
 * - Upper limits where applicable
 * - AMDR ranges for macros
 */
async function seedNutritionTargets(options) {
    const { patientId, nutritionProfile } = options;
    const db = (0, firestore_1.getFirestore)();
    // Update profile with actual patient ID
    const profile = {
        ...nutritionProfile,
        userId: patientId,
    };
    // Compute personalized targets
    console.log(`Computing nutrition targets for patient ${patientId}...`);
    const targets = (0, targets_1.computeUserTargets)(profile);
    // Store in Firestore
    const targetsRef = db
        .collection('patients')
        .doc(patientId)
        .collection('nutritionTargets')
        .doc('current');
    await targetsRef.set({
        ...targets,
        // Also store the profile used for calculation
        sourceProfile: {
            dateOfBirth: profile.dateOfBirth,
            sex: profile.sex,
            weightKg: profile.weightKg,
            heightCm: profile.heightCm,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
            isPregnant: profile.isPregnant,
            isLactating: profile.isLactating,
            conditions: profile.conditions,
        },
        updatedAt: new Date(),
    });
    console.log(`Stored nutrition targets for patient ${patientId}:`);
    console.log(`  - Calorie target: ${targets.calories} kcal`);
    console.log(`  - Life stage: ${targets.profile.lifeStageGroup}`);
    console.log(`  - Nutrients computed: ${Object.keys(targets.nutrients).length}`);
    return targets;
}
/**
 * Clear nutrition targets for a patient
 */
async function clearNutritionTargets(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const targetsSnapshot = await db
        .collection('patients')
        .doc(patientId)
        .collection('nutritionTargets')
        .get();
    if (targetsSnapshot.empty) {
        console.log('No nutrition targets to clear');
        return;
    }
    const batch = db.batch();
    targetsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Cleared ${targetsSnapshot.size} nutrition target documents`);
}
/**
 * Get current nutrition targets for a patient
 */
async function getNutritionTargets(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const targetsDoc = await db
        .collection('patients')
        .doc(patientId)
        .collection('nutritionTargets')
        .doc('current')
        .get();
    if (!targetsDoc.exists) {
        return null;
    }
    return targetsDoc.data();
}
//# sourceMappingURL=seedNutritionTargets.js.map