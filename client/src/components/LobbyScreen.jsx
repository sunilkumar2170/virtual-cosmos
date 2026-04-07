import React, { useState } from 'react'
import { AVATARS } from '../utils/constants'

export default function LobbyScreen({ onJoin }) {
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('blue')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    onJoin(username.trim(), selectedAvatar)
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#0f0f1a]">
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌌</div>
          <h1 className="text-3xl font-bold text-white">Virtual Cosmos</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Move close to others to start chatting
          </p>
        </div>

        {/* Username input */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-2 font-medium">
            Your Name
          </label>
          <input
            type="text"
            maxLength={20}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your name..."
            className="w-full bg-[#0f0f1a] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Avatar selection */}
        <div className="mb-8">
          <label className="block text-gray-300 text-sm mb-3 font-medium">
            Choose Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map(({ id, color }) => {
              const hex = '#' + color.toString(16).padStart(6, '0')
              return (
                <button
                  key={id}
                  onClick={() => setSelectedAvatar(id)}
                  style={{ backgroundColor: hex }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedAvatar === id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
        >
          Enter Cosmos
        </button>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-500 text-xs space-y-1">
          <p>🕹 Use <kbd className="bg-[#0f0f1a] px-1 rounded">W A S D</kbd> or Arrow Keys to move</p>
          <p>💬 Move close to other users to chat</p>
        </div>
      </div>
    </div>
  )
}
