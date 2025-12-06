import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhwKJgyeE3Kzs_TfqkTPQWh8p4Y-4rpzE",
  authDomain: "nvivo-988.firebaseapp.com",
  projectId: "nvivo-988",
  storageBucket: "nvivo-988.firebasestorage.app",
  messagingSenderId: "393703137106",
  appId: "1:393703137106:web:25d32663c9c0512280248b"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let emulatorsConnected = false;

export function getApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getApp());
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

export function connectEmulators(): void {
  if (emulatorsConnected) return;

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    try {
      connectAuthEmulator(getAuthInstance(), 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(getDb(), '127.0.0.1', 8080);
      emulatorsConnected = true;
      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to emulators:', error);
    }
  }
}
