import React, { useState } from 'react';
import CanvasLayer from './CanvasLayer';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants';

const CryptoShibaRun = () => {
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'GAME_OVER'

  return (
    <div 
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT, 
        position: 'relative', 
        border: '1px solid #333',
        backgroundColor: '#111', 
        margin: '0 auto',
        overflow: 'hidden'
      }}
    >
      <CanvasLayer gameState={gameState} setGameState={setGameState} />
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#0f0', fontFamily: 'monospace' }}>
        <p>STATUS: {gameState}</p>
        {gameState === 'IDLE' && <p>PRESS SPACE TO START</p>}
      </div>
    </div>
  );
};

export default CryptoShibaRun;