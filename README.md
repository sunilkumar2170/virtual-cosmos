# 🌌 Virtual Cosmos

A 2D virtual environment where users can move around and interact with each other in real time. Chat is **proximity-based** — you can only chat with someone when you're close to them.

---

## 📸 Features

- 🕹 **2D Movement** — WASD / Arrow Keys to move your avatar
- 👥 **Real-Time Multiplayer** — See all connected users move in real time
- 📡 **Proximity Detection** — Chat connects when users are within 150px radius
- 💬 **Auto Chat** — Chat panel appears/disappears based on proximity
- 🗺 **World Zones** — Lounge, Work Zone, Game Room, Library, Music Room
- 🎨 **6 Avatar Colors** to choose from

---

## 🛠 Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, PixiJS 7, Tailwind CSS |
| Backend   | Node.js, Express, Socket.IO   |
| Database  | MongoDB (optional, in-memory fallback) |
| Realtime  | Socket.IO (WebSockets)        |

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- npm or yarn

### 1. Clone / Extract the project

```bash
cd virtual-cosmos
```

### 2. Start the Backend

```bash
cd server
npm install
npm run dev
```

Server will start at: `http://localhost:3001`

### 3. Start the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173`

### 4. Open in Browser

Open `http://localhost:5173` in **two or more browser tabs/windows** to test multiplayer.

---

## 🗂 Project Structure

```
virtual-cosmos/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LobbyScreen.jsx   # Entry screen / username + avatar picker
│   │   │   ├── CosmosCanvas.jsx  # Main PixiJS canvas + game loop
│   │   │   ├── ChatPanel.jsx     # Proximity chat UI
│   │   │   └── HUD.jsx           # Online count + controls overlay
│   │   ├── hooks/
│   │   │   └── useKeyboard.js    # Keyboard input hook
│   │   ├── utils/
│   │   │   ├── socket.js         # Socket.IO client
│   │   │   └── constants.js      # Avatars, world size, radius, speed
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                  # Node.js + Express + Socket.IO backend
    ├── src/
    │   └── index.js         # Main server: sockets, proximity, chat
    ├── .env
    └── package.json
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```
PORT=3001
CLIENT_URL=http://localhost:5173
# MONGODB_URI=mongodb://localhost:27017/virtual-cosmos  (optional)
```

### Client (`client/.env`)
```
VITE_SERVER_URL=http://localhost:3001
```

---

## 🔧 How Proximity Works

1. Every time a user moves, `user:move` is emitted to the server
2. Server calculates distance between all user pairs:
   ```
   distance = √((x1-x2)² + (y1-y2)²)
   ```
3. If `distance < 150px` → users join a shared Socket.IO room → `proximity:connect` event fires → chat panel appears
4. If `distance ≥ 150px` → users leave the room → `proximity:disconnect` → chat panel disappears

---

## 🌐 Deployment

To deploy online:
1. Deploy server to **Railway / Render / Heroku**
2. Set `VITE_SERVER_URL` in client `.env` to your deployed server URL
3. Deploy client to **Vercel / Netlify**

---

## 📋 Submission

Submit here: https://forms.gle/GtkmYbjw4FVkrCzB7

Include:
- GitHub repo link with this README
- Demo video (2–5 min) showing movement, proximity chat connect/disconnect
