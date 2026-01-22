import React, { useState } from 'react';
import CanvasLayer from './CanvasLayer';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants';

const CryptoShibaRun = () => {
  // Simple state to start with
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'GAME_OVER'

  return (
    <div 
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT, 
        position: 'relative', 
        border: '1px solid #333',
        backgroundColor: '#111', // Dark crypto theme background
        margin: '0 auto'
      }}
    >
      <CanvasLayer gameState={gameState} />
      
      {/* Temporary UI to prove it works */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
        <p>Status: {gameState}</p>
      </div>
    </div>
  );
};

export default CryptoShibaRun;