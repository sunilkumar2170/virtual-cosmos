import React from 'react'

export default function HUD({ onlineCount, connections }) {
  return (
    <>
      {/* Top left — player count */}
      <div className="absolute top-4 left-4 bg-[#1a1a2e]/90 border border-[#2a2a4a] rounded-xl px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-white text-sm font-medium">{onlineCount} online</span>
      </div>

      {/* Top center — connected badge */}
      {connections.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600/90 border border-green-500 rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-sm font-semibold">
            Connected with {connections.map(c => c.with.username).join(', ')}
          </span>
        </div>
      )}

      {/* Bottom left — controls */}
      <div className="absolute bottom-4 left-4 bg-[#1a1a2e]/80 border border-[#2a2a4a] rounded-xl px-4 py-2">
        <p className="text-gray-400 text-xs">
          🕹 <span className="text-gray-300">W A S D</span> or <span className="text-gray-300">Arrow Keys</span> to move
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          💬 Move close to others to chat
        </p>
      </div>
    </>
  )
}
