import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';
import { seedTestPatient, deleteTestPatient } from './seed';

// Initialize Firebase Admin
admin.initializeApp();

// Export seed functions (only for development)
export const seedTestPatientFn = https.onCall({ cors: true }, async () => {
  return seedTestPatient();
});

export const deleteTestPatientFn = https.onCall({ cors: true }, async () => {
  return deleteTestPatient();
});
