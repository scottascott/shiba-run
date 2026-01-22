import React, { useState } from 'react';
import CanvasLayer from './CanvasLayer';
import { GAME_WIDTH } from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';

const CryptoShibaRun = () => {
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'GAME_OVER'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  return (
    <div 
      style={{ 
        // --- RESPONSIVE CONTAINER ---
        width: '100%', 
        maxWidth: GAME_WIDTH, 
        // Enforce a minimum height so UI never overflows on mobile
        minHeight: '300px', 
        // Keep the aspect ratio on Desktop, but allow minHeight to override on Mobile
        aspectRatio: '800/300', 
        
        position: 'relative', 
        border: '1px solid #333',
        backgroundColor: '#111', 
        margin: '0 auto',
        overflow: 'hidden',
        fontFamily: 'monospace',
        userSelect: 'none',

        // Vertical Centering (for when container is taller than canvas on mobile)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CanvasLayer 
        gameState={gameState} 
        setGameState={setGameState} 
        onGameOver={handleGameOver} 
      />
      
      {/* --- UI OVERLAY --- */}
      
      {/* 1. START SCREEN */}
      {gameState === 'IDLE' && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h1 style={{color: '#00ff00', fontSize: 'clamp(20px, 5vw, 24px)', margin: 0}}>CRYPTO SHIBA RUN</h1>
            <p style={{color: '#fff', marginTop: '10px', fontSize: '14px'}}>PRESS SPACE TO START</p>
          </div>
        </div>
      )}

      {/* 2. GAME OVER / SCORE SCREEN */}
      {gameState === 'GAME_OVER' && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h2 style={{color: '#ff4444', fontSize: 'clamp(24px, 6vw, 30px)', margin: 0}}>MARKET CRASH!</h2>
            
            {/* --- DANCING SHIBA ANIMATION --- */}
            {/* This uses the sprite sheet as a background and flips between 2 frames */}
            <div style={{
              width: '50px',
              height: '50px',
              backgroundImage: `url(${SHIBA_SPRITESHEET})`,
              backgroundRepeat: 'no-repeat',
              // Animation: Toggle between Frame 4 (-200px) and Frame 5 (-250px)
              animation: 'dance 0.6s steps(1) infinite', 
              backgroundSize: '300px 50px', // Full width of sprite sheet (6 frames * 50px)
              margin: '10px auto',
              imageRendering: 'pixelated' 
            }} />
            
            {/* Inject the keyframes strictly for this component */}
            <style>
              {`
                @keyframes dance {
                  0% { background-position: -200px 0; }
                  50% { background-position: -250px 0; }
                }
              `}
            </style>
            {/* ------------------------------- */}

            <div style={{margin: '15px 0', textAlign: 'center', width: '100%'}}>
              <p style={{color: '#888', margin: '5px', fontSize: '12px'}}>PORTFOLIO VALUE</p>
              <p style={{color: '#fff', fontSize: '24px', margin: '5px'}}>₿ {score}</p>
              
              <div style={{width: '100%', height: '1px', background: '#333', margin: '10px 0'}}></div>

              <p style={{color: '#fbbf24', margin: '5px', fontSize: '12px'}}>ATH (ALL TIME HIGH)</p>
              <p style={{color: '#fbbf24', fontSize: '20px', margin: '5px'}}>₿ {highScore}</p>
            </div>

            <button 
              onClick={() => setGameState('PLAYING')}
              style={buttonStyle}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---

const overlayStyle = {
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  zIndex: 10,
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  backgroundColor: 'rgba(0,0,0,0.8)', 
  padding: '20px', 
  boxSizing: 'border-box'
};

const cardStyle = {
  backgroundColor: '#1a1a1a', 
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #444',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '300px', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
};

const buttonStyle = {
  padding: '12px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#00ff00',
  color: '#000',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  marginTop: '10px',
  width: '100%',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

export default CryptoShibaRun;