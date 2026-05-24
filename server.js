const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// rooms: Map<roomId, Map<socketId, username>>
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[+] Connexion : ${socket.id}`);

  // ----- Rejoindre un salon -----
  socket.on('join-room', ({ roomId, username }) => {
    socket.username = username.trim().slice(0, 20) || 'Anonyme';
    socket.roomId = roomId.trim().slice(0, 20) || 'general';

    if (!rooms.has(socket.roomId)) rooms.set(socket.roomId, new Map());
    const room = rooms.get(socket.roomId);
    room.set(socket.id, socket.username);
    socket.join(socket.roomId);

    // Envoyer la liste des pairs déjà présents au nouvel arrivant
    const existingPeers = [];
    room.forEach((name, id) => {
      if (id !== socket.id) existingPeers.push({ id, username: name });
    });
    socket.emit('existing-peers', existingPeers);

    // Notifier les autres
    socket.to(socket.roomId).emit('peer-joined', {
      id: socket.id,
      username: socket.username
    });

    // Mettre à jour la liste complète pour tous
    io.to(socket.roomId).emit('room-update', buildUserList(room));

    console.log(`[>] ${socket.username} a rejoint #${socket.roomId} (${room.size} users)`);
  });

  // ----- Signalisation WebRTC -----
  socket.on('offer', ({ to, offer }) => {
    io.to(to).emit('offer', { from: socket.id, username: socket.username, offer });
  });

  socket.on('answer', ({ to, answer }) => {
    io.to(to).emit('answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // ----- Mute broadcast -----
  socket.on('mute-state', ({ muted }) => {
    socket.to(socket.roomId).emit('peer-mute', { id: socket.id, muted });
  });

  // ----- Déconnexion -----
  socket.on('disconnect', () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.delete(socket.id);
      if (room.size === 0) {
        rooms.delete(socket.roomId);
      } else {
        io.to(socket.roomId).emit('peer-left', {
          id: socket.id,
          username: socket.username
        });
        io.to(socket.roomId).emit('room-update', buildUserList(room));
      }
    }
    console.log(`[-] Déconnexion : ${socket.username || socket.id}`);
  });
});

function buildUserList(room) {
  return Array.from(room.entries()).map(([id, username]) => ({ id, username }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
