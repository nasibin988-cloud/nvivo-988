"use strict";
/**
 * Test Patient Configuration
 *
 * Central configuration for the test patient used in development/seeding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_CLINICIAN_PROFILE = exports.TEST_CLINICIAN_ID = exports.TEST_PATIENT_NUTRITION_PROFILE = exports.TEST_PATIENT_PROFILE = exports.TEST_PATIENT_ID = void 0;
exports.TEST_PATIENT_ID = 'sarah-mitchell-test';
exports.TEST_PATIENT_PROFILE = {
    id: exports.TEST_PATIENT_ID,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@test.nvivo.health',
    dateOfBirth: '1985-03-15',
    gender: 'female',
    phone: '+1 (555) 123-4567',
    address: {
        street: '123 Health Lane',
        city: 'Wellness City',
        state: 'CA',
        zip: '90210',
    },
    emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'spouse',
        phone: '+1 (555) 987-6543',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
};
/**
 * Test patient nutrition profile for DRI calculations
 *
 * Sarah Mitchell (39F):
 * - 165 cm (5'5"), 62 kg (137 lbs)
 * - Moderately active (exercises 3-4x/week)
 * - Goal: Maintenance with heart health focus
 * - No special conditions
 *
 * This generates personalized nutrition targets based on:
 * - Mifflin-St Jeor for calorie needs (~1750 kcal)
 * - Age/sex-specific DRIs for micronutrients
 */
exports.TEST_PATIENT_NUTRITION_PROFILE = {
    userId: exports.TEST_PATIENT_ID, // Will be replaced with actual auth UID
    dateOfBirth: '1985-03-15',
    sex: 'female',
    weightKg: 62,
    heightCm: 165,
    activityLevel: 'moderate',
    goal: 'maintenance',
    isPregnant: false,
    isLactating: false,
    conditions: [], // No special conditions for test patient
};
exports.TEST_CLINICIAN_ID = 'test-clinician-001';
exports.TEST_CLINICIAN_PROFILE = {
    id: exports.TEST_CLINICIAN_ID,
    firstName: 'Dr. Emily',
    lastName: 'Chen',
    email: 'emily.chen@nvivo.health',
    specialty: 'Internal Medicine',
    npi: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
};
//# sourceMappingURL=testPatient.js.map