import React, { useState, useEffect, useRef } from 'react'
import socket from '../utils/socket'

export default function ChatPanel({ connection, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typingUser, setTypingUser] = useState(null)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    if (!connection) return

    const handleMessage = (data) => {
      if (data.roomId && connection.roomId && data.roomId !== connection.roomId) return
      setMessages(prev => [...prev, data])
      setTypingUser(null)
    }

    const handleTyping = ({ username, roomId }) => {
      if (roomId !== connection.roomId) return
      setTypingUser(username)
      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setTypingUser(null), 2000)
    }

    socket.on('chat:message', handleMessage)
    socket.on('chat:typing', handleTyping)

    return () => {
      socket.off('chat:message', handleMessage)
      socket.off('chat:typing', handleTyping)
    }
  }, [connection])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    socket.emit('chat:typing', { roomId: connection.roomId })
  }

  const sendMessage = () => {
    if (!input.trim() || !connection) return
    socket.emit('chat:message', {
      roomId: connection.roomId,
      message: input.trim(),
    })
    setInput('')
  }

  const formatTime = (timestamp) => {
    const d = new Date(timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!connection) return null

  return (
    <div className="absolute bottom-4 right-4 w-80 bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: '420px', minHeight: '260px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16213e] border-b border-[#2a2a4a]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-semibold">
            Chatting with {connection.with.username}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-4">Say hello! 👋</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === socket.id ? 'items-end' : 'items-start'}`}>
            <span className="text-gray-400 text-xs mb-0.5">{msg.username}</span>
            <div className={`px-3 py-1.5 rounded-xl text-sm max-w-[220px] break-words ${
              msg.from === socket.id ? 'bg-purple-600 text-white' : 'bg-[#2a2a4a] text-gray-100'
            }`}>
              {msg.message}
            </div>
            {/* Timestamp */}
            <span className="text-gray-600 text-[10px] mt-0.5">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-gray-500 text-xs">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-2 border-t border-[#2a2a4a]">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
            e.stopPropagation()
          }}
          placeholder="Type a message..."
          className="flex-1 bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg px-3 py-1.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}