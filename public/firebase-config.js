// Firebase setup — this file initializes the connection and exports the
// pieces the rest of the app uses (auth + Firestore database).
//
// Uses the Firebase v10 "modular" SDK loaded straight from Google's CDN,
// so there's no build step and no npm install needed for Firebase itself.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// TODO: Replace this whole object with the firebaseConfig from your
// Firebase Console (Project settings -> Your apps -> web app).
// These values are NOT secret — they identify your project to Firebase.
const firebaseConfig = {
  apiKey: 'PASTE_ME',
  authDomain: 'PASTE_ME',
  projectId: 'PASTE_ME',
  storageBucket: 'PASTE_ME',
  messagingSenderId: 'PASTE_ME',
  appId: 'PASTE_ME',
};

const app = initializeApp(firebaseConfig);

// Shared instances used everywhere else in the app.
export const auth = getAuth(app);
export const db = getFirestore(app);
