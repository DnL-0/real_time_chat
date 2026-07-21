// Minimal static file server for local development.
// The app now talks directly to Firebase from the browser, so this server
// only needs to hand out the files in /public. No Socket.IO, no chat logic.
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chat app running at http://localhost:${PORT}`);
});
