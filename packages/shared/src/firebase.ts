import { initializeApp, getApps, getApp as getFirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions as getFirebaseFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDhwKJgyeE3Kzs_TfqkTPQWh8p4Y-4rpzE",
  authDomain: "nvivo-988.firebaseapp.com",
  projectId: "nvivo-988",
  storageBucket: "nvivo-988.firebasestorage.app",
  messagingSenderId: "393703137106",
  appId: "1:393703137106:web:25d32663c9c0512280248b"
};

// Initialize Firebase app
function initApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getFirebaseApp();
}

const app = initApp();

let emulatorsConnected = false;

export function getApp() {
  return app;
}

export function getAuthInstance() {
  return getAuth(app);
}

export function getDb() {
  return getFirestore(app);
}

export function getFunctions() {
  return getFirebaseFunctions(app);
}

export function connectEmulators(): void {
  if (emulatorsConnected) return;

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    try {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const functions = getFirebaseFunctions(app);
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      emulatorsConnected = true;
      console.log('✅ Connected to Firebase emulators');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already been called')) {
        emulatorsConnected = true;
        console.log('✅ Firebase emulators already connected');
      } else {
        console.error('❌ Failed to connect to emulators:', error);
      }
    }
  }
}
