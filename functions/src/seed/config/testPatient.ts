/**
 * Test Patient Configuration
 *
 * Central configuration for the test patient used in development/seeding.
 */

export const TEST_PATIENT_ID = 'test-patient-001';

export const TEST_PATIENT_PROFILE = {
  id: TEST_PATIENT_ID,
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
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

export const TEST_CLINICIAN_ID = 'test-clinician-001';

export const TEST_CLINICIAN_PROFILE = {
  id: TEST_CLINICIAN_ID,
  firstName: 'Dr. Emily',
  lastName: 'Chen',
  email: 'emily.chen@nvivo.health',
  specialty: 'Internal Medicine',
  npi: '1234567890',
  createdAt: new Date(),
  updatedAt: new Date(),
};
