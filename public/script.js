
const socket = io();
let currentUser = '';
let toUser = '';

function join() {
  const usernameInput = document.getElementById('username');
  const toUserInput = document.getElementById('toUser');

  currentUser = usernameInput.value.trim();
  toUser = toUserInput.value.trim();

  if (!currentUser || !toUser) {
    alert('Both usernames are required');
    return;
  }

  socket.emit('join', currentUser);

  document.getElementById('currentUser').textContent = currentUser;
  document.getElementById('targetUser').textContent = toUser;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

function send() {
  const input = document.getElementById('message');
  const msg = input.value.trim();

  if (!msg || !toUser) return;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Emit to server
  socket.emit('private-message', {
    to: toUser,
    message: msg,
    from: currentUser,
    time: timestamp
  });

  // Show on sender's chat box
  addMessage(msg, 'from-me', timestamp);
  input.value = '';
}


function addMessage(msg, type, time = '') {
  const chat = document.getElementById('chat-box');
  const bubble = document.createElement('div');
  bubble.className = `message ${type}`;
  bubble.innerHTML = `
    <div>${msg}</div>
    <div style="font-size: 11px; text-align: right; margin-top: 4px; color: #777;">${time}</div>
  `;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}


socket.on('private-message', ({ from, message, time }) => {
  addMessage(`${from}: ${message}`, 'from-them', time);
});

socket.on('user-not-found', (user) => {
  addMessage(`⚠️ User "${user}" not found or offline`, 'from-them');
});

socket.on('user-status', ({ user, status, lastSeen }) => {
  if (user === toUser) {
    const el = document.getElementById('userStatus');
    if (status === 'online') {
      el.textContent = '🟢 Online';
      el.style.color = 'green';
    } else {
      el.textContent = `⚫ Offline (last seen at ${lastSeen})`;
      el.style.color = 'gray';
    }
  }
});

socket.on('online-users', (list) => {
  if (list.includes(toUser)) {
    const statusEl = document.getElementById('userStatus');
    statusEl.textContent = '🟢 Online';
    statusEl.style.color = 'green';
  }
});
