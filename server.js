// Minimal static file server for local development.
// The app talks directly to Firebase from the browser, so this server only
// serves the files in /public plus one dynamic route: it builds the Firebase
// config module from environment variables (.env) so the real project values
// never live in a committed file.
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Serve /firebase-config.js dynamically, injecting values from .env.
// The browser imports { auth, db } from this, same as a normal module.
app.get('/firebase-config.js', (req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  res.type('application/javascript').send(
    `import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = ${JSON.stringify(config, null, 2)};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
`
  );
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chat app running at http://localhost:${PORT}`);
});
