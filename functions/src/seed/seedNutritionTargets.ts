/**
 * Seed Nutrition Targets
 *
 * Computes and stores personalized nutrition targets for a patient
 * based on their demographics and health profile.
 */

import { getFirestore } from 'firebase-admin/firestore';
import type { NutritionUserProfile, UserNutritionTargets } from '../types/nutrition';
import { computeUserTargets } from '../domains/nutrition/targets';

/**
 * Seed options for nutrition targets
 */
interface SeedNutritionTargetsOptions {
  patientId: string;
  nutritionProfile: NutritionUserProfile;
}

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
export async function seedNutritionTargets(
  options: SeedNutritionTargetsOptions
): Promise<UserNutritionTargets> {
  const { patientId, nutritionProfile } = options;
  const db = getFirestore();

  // Update profile with actual patient ID
  const profile: NutritionUserProfile = {
    ...nutritionProfile,
    userId: patientId,
  };

  // Compute personalized targets
  console.log(`Computing nutrition targets for patient ${patientId}...`);
  const targets = computeUserTargets(profile);

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
export async function clearNutritionTargets(patientId: string): Promise<void> {
  const db = getFirestore();

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
export async function getNutritionTargets(
  patientId: string
): Promise<UserNutritionTargets | null> {
  const db = getFirestore();

  const targetsDoc = await db
    .collection('patients')
    .doc(patientId)
    .collection('nutritionTargets')
    .doc('current')
    .get();

  if (!targetsDoc.exists) {
    return null;
  }

  return targetsDoc.data() as UserNutritionTargets;
}
