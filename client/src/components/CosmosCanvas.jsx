import React, { useEffect, useRef, useState } from 'react'
import socket from '../utils/socket'
import { useKeyboard } from '../hooks/useKeyboard'
import { getAvatarColor, WORLD_WIDTH, WORLD_HEIGHT, PROXIMITY_RADIUS, MOVE_SPEED } from '../utils/constants'
import ChatPanel from './ChatPanel'
import HUD from './HUD'

function hexToCSS(hex) {
  return '#' + hex.toString(16).padStart(6, '0')
}

export default function CosmosCanvas({ myUser }) {
  const canvasRef = useRef(null)
  const myPos = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 })
  const otherUsers = useRef({})
  const keys = useKeyboard()
  const animRef = useRef(null)
  const lastEmit = useRef(0)

  const [connections, setConnections] = useState([])
  const [onlineCount, setOnlineCount] = useState(1)

  const ZONES = [
    { x: 200,  y: 200,  w: 300, h: 200, label: '☕ Lounge'     },
    { x: 800,  y: 150,  w: 350, h: 250, label: '💻 Work Zone'  },
    { x: 1400, y: 300,  w: 280, h: 200, label: '🎮 Game Room'  },
    { x: 400,  y: 900,  w: 320, h: 220, label: '📚 Library'    },
    { x: 1100, y: 1000, w: 300, h: 200, label: '🎵 Music Room' },
  ]

  function drawAvatar(ctx, x, y, username, avatarId, isMe) {
    const color = hexToCSS(getAvatarColor(avatarId))

    if (isMe) {
      ctx.beginPath()
      ctx.arc(x, y, PROXIMITY_RADIUS, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.beginPath()
    ctx.ellipse(x, y + 26, 18, 6, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = isMe ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('😊', x, y + 1)

    const label = username + (isMe ? ' (you)' : '')
    ctx.font = 'bold 11px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.strokeStyle = 'rgba(0,0,0,0.9)'
    ctx.lineWidth = 3
    ctx.strokeText(label, x, y + 30)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x, y + 30)
  }

  function drawWorld(ctx, camX, camY) {
    const W = canvasRef.current.width
    const H = canvasRef.current.height

    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, W, H)

    const startGX = Math.floor(-camX / 60) * 60
    const startGY = Math.floor(-camY / 60) * 60
    ctx.fillStyle = 'rgba(42,42,80,0.7)'
    for (let gx = startGX; gx < -camX + W + 60; gx += 60) {
      for (let gy = startGY; gy < -camY + H + 60; gy += 60) {
        ctx.beginPath()
        ctx.arc(gx + camX, gy + camY, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ZONES.forEach(z => {
      const sx = z.x + camX
      const sy = z.y + camY
      if (sx + z.w < 0 || sy + z.h < 0 || sx > W || sy > H) return

      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(sx, sy, z.w, z.h, 16)
      } else {
        ctx.rect(sx, sy, z.w, z.h)
      }
      ctx.fillStyle = 'rgba(26,26,46,0.85)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(80,80,120,0.6)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = '13px Arial'
      ctx.fillStyle = '#8888aa'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(z.label, sx + 14, sy + 14)
    })

    Object.values(otherUsers.current).forEach(u => {
      drawAvatar(ctx, u.x + camX, u.y + camY, u.username, u.avatar, false)
    })

    drawAvatar(ctx, myPos.current.x + camX, myPos.current.y + camY, myUser.username, myUser.avatar, true)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function loop() {
      const k = keys.current
      let dx = 0, dy = 0

      if (k['ArrowUp']    || k['w'] || k['W']) dy -= MOVE_SPEED
      if (k['ArrowDown']  || k['s'] || k['S']) dy += MOVE_SPEED
      if (k['ArrowLeft']  || k['a'] || k['A']) dx -= MOVE_SPEED
      if (k['ArrowRight'] || k['d'] || k['D']) dx += MOVE_SPEED

      if (dx !== 0 || dy !== 0) {
        myPos.current.x = Math.max(30, Math.min(WORLD_WIDTH  - 30, myPos.current.x + dx))
        myPos.current.y = Math.max(30, Math.min(WORLD_HEIGHT - 30, myPos.current.y + dy))

        const now = Date.now()
        if (now - lastEmit.current > 33) {
          socket.emit('user:move', { x: myPos.current.x, y: myPos.current.y })
          lastEmit.current = now
        }
      }

      const camX = window.innerWidth  / 2 - myPos.current.x
      const camY = window.innerHeight / 2 - myPos.current.y

      drawWorld(ctx, camX, camY)
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [myUser])

  useEffect(() => {
    socket.on('users:current', (users) => {
      setOnlineCount(prev => prev + users.length)
      users.forEach(u => { otherUsers.current[u.userId] = u })
    })
    socket.on('user:joined', (u) => {
      setOnlineCount(prev => prev + 1)
      otherUsers.current[u.userId] = u
    })
    socket.on('user:moved', ({ userId, x, y }) => {
      if (otherUsers.current[userId]) {
        otherUsers.current[userId].x = x
        otherUsers.current[userId].y = y
      }
    })
    socket.on('user:left', ({ userId }) => {
      setOnlineCount(prev => Math.max(1, prev - 1))
      delete otherUsers.current[userId]
    })
    socket.on('proximity:connect', (data) => {
      setConnections(prev => {
        if (prev.find(c => c.roomId === data.roomId)) return prev
        return [...prev, data]
      })
    })
    socket.on('proximity:disconnect', ({ roomId }) => {
      setConnections(prev => prev.filter(c => c.roomId !== roomId))
    })

    return () => {
      socket.off('users:current')
      socket.off('user:joined')
      socket.off('user:moved')
      socket.off('user:left')
      socket.off('proximity:connect')
      socket.off('proximity:disconnect')
    }
  }, [])

  const activeConnection = connections[0] || null

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <HUD onlineCount={onlineCount} connections={connections} />
      {activeConnection && (
        <ChatPanel
          connection={activeConnection}
          onClose={() => setConnections(prev => prev.filter(c => c.roomId !== activeConnection.roomId))}
        />
      )}
    </div>
  )
}
