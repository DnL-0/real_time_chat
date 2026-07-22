// Initializes Firebase once and shares the auth + Firestore handles app-wide.
// Values come from NEXT_PUBLIC_* env vars (see .env.local). They are not secret.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// getApps() guards against re-initializing on Next.js hot reloads.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Realtime Database powers presence only (instant online/offline via
// onDisconnect). Only initialize when the env var looks like a real RTDB URL,
// so a missing/typo'd value leaves presence inactive instead of crashing.
const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? '';
const looksLikeRtdbUrl =
  dbUrl.includes('firebaseio.com') || dbUrl.includes('firebasedatabase.app');
export const rtdb = looksLikeRtdbUrl ? getDatabase(app) : null;
