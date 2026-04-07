require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const User = require("./models/User");
const Session = require("./models/Session");

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const PROXIMITY_RADIUS = 150;

function getDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getRoomId(id1, id2) {
  return [id1, id2].sort().join("_");
}

function checkProximity(socketId) {
  const user = users[socketId];
  if (!user) return;

  Object.entries(users).forEach(([otherId, other]) => {
    if (otherId === socketId) return;

    const dist = getDistance(user, other);
    const roomId = getRoomId(socketId, otherId);

    if (dist < PROXIMITY_RADIUS) {
      const socket = io.sockets.sockets.get(socketId);
      const otherSocket = io.sockets.sockets.get(otherId);

      if (socket && otherSocket) {
        socket.join(roomId);
        otherSocket.join(roomId);

        io.to(socketId).emit("proximity:connect", {
          with: { id: otherId, username: other.username, avatar: other.avatar },
          roomId,
        });
        io.to(otherId).emit("proximity:connect", {
          with: { id: socketId, username: user.username, avatar: user.avatar },
          roomId,
        });
      }
    } else {
      const socket = io.sockets.sockets.get(socketId);
      const otherSocket = io.sockets.sockets.get(otherId);

      if (socket && otherSocket) {
        const wasConnected = socket.rooms.has(roomId) || otherSocket.rooms.has(roomId);

        if (wasConnected) {
          socket.leave(roomId);
          otherSocket.leave(roomId);
          io.to(socketId).emit("proximity:disconnect", { with: otherId, roomId });
          io.to(otherId).emit("proximity:disconnect", { with: socketId, roomId });
        }
      }
    }
  });
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user:join", async ({ username, avatar, x, y }) => {
    users[socket.id] = { userId: socket.id, username, avatar, x, y };

    // User DB mein save karo
    try {
      await User.findOneAndUpdate(
        { username },
        { username, avatar, lastSeen: new Date() },
        { upsert: true }
      );
      await Session.create({ socketId: socket.id, username, avatar });
    } catch (e) {
      console.log("DB user save error:", e.message);
    }

    socket.emit("users:current", Object.values(users).filter(u => u.userId !== socket.id));
    socket.broadcast.emit("user:joined", users[socket.id]);
    console.log(`${username} joined the cosmos`);
  });

  socket.on("user:move", ({ x, y }) => {
    if (!users[socket.id]) return;
    users[socket.id].x = x;
    users[socket.id].y = y;
    socket.broadcast.emit("user:moved", { userId: socket.id, x, y });
    checkProximity(socket.id);
  });

  socket.on("chat:message", async ({ roomId, message }) => {
    if (!users[socket.id]) return;

    const msg = {
      from: socket.id,
      username: users[socket.id].username,
      avatar: users[socket.id].avatar,
      message,
      roomId,
      timestamp: new Date().toISOString(),
    };

    
    try {
      await Message.create({
        roomId,
        from: socket.id,
        username: users[socket.id].username,
        message,
      });
    } catch (e) {
      console.log("DB message save error:", e.message);
    }

    io.to(roomId).emit("chat:message", msg);
  });

  socket.on("chat:typing", ({ roomId }) => {
    if (!users[socket.id]) return;
    socket.to(roomId).emit("chat:typing", {
      username: users[socket.id].username,
      roomId,
    });
  });

  socket.on("disconnect", async () => {
    if (users[socket.id]) {
     
      try {
        await Session.findOneAndUpdate(
          { socketId: socket.id },
          { leaveTime: new Date() }
        );
      } catch (e) {
        console.log("DB session update error:", e.message);
      }

      console.log(`${users[socket.id].username} left the cosmos`);
      socket.broadcast.emit("user:left", { userId: socket.id });
      delete users[socket.id];
    }
  });
});

app.get("/health", (req, res) => res.json({ status: "ok", users: Object.keys(users).length }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});