const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // username -> socket.id
const lastSeen = {}; // store last seen timestamps

// Serve static files
app.use(express.static('public'));

io.on('connection', (socket) => {
  let currentUser = '';

  socket.on('join', (username) => {
    currentUser = username;
    users[username] = socket.id;

    // Tell the joining user who's online
    socket.emit('online-users', Object.keys(users));

    // Tell others this user is online
    socket.broadcast.emit('user-status', {
      user: username,
      status: 'online',
    });
  });

  socket.on('private-message', ({ to, message, from, time }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit('private-message', { from, message, time });
    } else {
      socket.emit('user-not-found', to);
    }
  });

  socket.on('disconnect', () => {
    if (currentUser) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lastSeen[currentUser] = time;
      delete users[currentUser];

      // Broadcast offline status and last seen
      io.emit('user-status', {
        user: currentUser,
        status: 'offline',
        lastSeen: time
      });
    }
  });
});

// 🔧 Listen on all IPs so other devices can connect
const PORT = 3000;
server.listen(PORT, '192.168.26.40', () => {
  console.log(`🌐 Server running at http://192.168.26.40:${PORT}`);
});
