'use client'

import { useEffect, useRef, useState } from 'react'
import { Game } from './game/Game'
import ModOptionsMenu from './components/ModOptionsMenu'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [settings, setSettings] = useState({
    damageMultiplier: 1,
    movementSpeed: 'Standard' as 'Standard' | 'Fast' | 'Very Fast'
  })

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current, settings)
      gameRef.current.start()
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.updateSettings(settings)
    }
  }, [settings])

  const toggleOptions = () => {
    setShowOptions(!showOptions)
    if (gameRef.current) {
      if (!showOptions) {
        gameRef.current.pause()
      } else {
        gameRef.current.resume()
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 20px',
        borderRadius: 8,
        border: '2px solid #00ff88'
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 5, color: '#00ff88' }}>SmartTeammates</h1>
        <p style={{ fontSize: 12, color: '#aaa' }}>by Skyline</p>
      </div>

      <button
        onClick={toggleOptions}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '12px 24px',
          background: '#00ff88',
          color: '#000',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#00cc6a'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#00ff88'}
      >
        {showOptions ? 'CLOSE OPTIONS' : 'MOD OPTIONS'}
      </button>

      {showOptions && (
        <ModOptionsMenu
          settings={settings}
          onSettingsChange={setSettings}
          onClose={toggleOptions}
        />
      )}

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px 15px',
        borderRadius: 6,
        fontSize: 14,
        color: '#00ff88',
        border: '1px solid #00ff88'
      }}>
        <div>WASD: Move | Mouse: Aim | Click: Shoot | Space: Ability</div>
      </div>
    </div>
  )
}
