import React, { useState } from 'react'
import LobbyScreen from './components/LobbyScreen'
import CosmosCanvas from './components/CosmosCanvas'
import socket from './utils/socket'

export default function App() {
  const [user, setUser] = useState(null) // { username, avatar }

  const handleJoin = (username, avatar) => {
    socket.connect()
    socket.emit('user:join', {
      username,
      avatar,
      x: 1000,
      y: 750,
    })
    setUser({ username, avatar })
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      {!user ? (
        <LobbyScreen onJoin={handleJoin} />
      ) : (
        <CosmosCanvas myUser={user} />
      )}
    </div>
  )
}
