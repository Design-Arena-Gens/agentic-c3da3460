import React from 'react'

interface Settings {
  damageMultiplier: number
  movementSpeed: 'Standard' | 'Fast' | 'Very Fast'
}

interface ModOptionsMenuProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  onClose: () => void
}

export default function ModOptionsMenu({ settings, onSettingsChange, onClose }: ModOptionsMenuProps) {
  const handleDamageChange = (value: number) => {
    onSettingsChange({ ...settings, damageMultiplier: value })
  }

  const handleSpeedChange = (speed: 'Standard' | 'Fast' | 'Very Fast') => {
    onSettingsChange({ ...settings, movementSpeed: speed })
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: 40,
      borderRadius: 12,
      border: '3px solid #00ff88',
      minWidth: 500,
      boxShadow: '0 10px 50px rgba(0,255,136,0.3)',
      zIndex: 1000
    }}>
      <h2 style={{
        fontSize: 28,
        marginBottom: 30,
        color: '#00ff88',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2
      }}>
        Mod Options
      </h2>

      <div style={{ marginBottom: 30 }}>
        <label style={{
          display: 'block',
          marginBottom: 12,
          fontSize: 16,
          color: '#00ff88',
          fontWeight: 'bold'
        }}>
          Bot Damage Multiplier: {settings.damageMultiplier}x
        </label>
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={settings.damageMultiplier}
          onChange={(e) => handleDamageChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 8,
            background: '#333',
            borderRadius: 4,
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#888',
          marginTop: 5
        }}>
          <span>1x</span>
          <span>2x</span>
          <span>3x</span>
          <span>4x</span>
          <span>5x</span>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <label style={{
          display: 'block',
          marginBottom: 12,
          fontSize: 16,
          color: '#00ff88',
          fontWeight: 'bold'
        }}>
          Bot Movement Speed
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['Standard', 'Fast', 'Very Fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: settings.movementSpeed === speed ? '#00ff88' : '#333',
                color: settings.movementSpeed === speed ? '#000' : '#fff',
                border: settings.movementSpeed === speed ? '2px solid #00ff88' : '2px solid #555',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '15px',
          background: '#00ff88',
          color: '#000',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 'bold',
          marginTop: 10,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#00cc6a'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#00ff88'}
      >
        APPLY & CLOSE
      </button>
    </div>
  )
}
