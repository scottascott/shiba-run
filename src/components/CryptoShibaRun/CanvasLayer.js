import React, { useRef, useEffect } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, GAME_SPEED_START, GROUND_Y } from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';
import { addInputListener } from './utils/inputManager';

const CanvasLayer = ({ gameState, setGameState }) => {
  const canvasRef = useRef(null);
  
  // Physics State
  const shibaY = useRef(GROUND_Y - 50);
  const shibaVelocity = useRef(0);
  const obstacleX = useRef(GAME_WIDTH); 
  const score = useRef(0);

  // Assets
  const spritesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Retina/High-DPI Fix
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== GAME_WIDTH * dpr) {
      canvas.width = GAME_WIDTH * dpr;
      canvas.height = GAME_HEIGHT * dpr;
      canvas.style.width = `${GAME_WIDTH}px`;
      canvas.style.height = `${GAME_HEIGHT}px`;
      ctx.scale(dpr, dpr);
    }

    let animationFrameId;

    // --- 1. The Game Loop ---
    const loop = () => {
      if (gameState !== 'PLAYING') return;

      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    // --- 2. Physics Logic ---
    const updatePhysics = () => {
      // Gravity
      shibaVelocity.current += GRAVITY;
      shibaY.current += shibaVelocity.current;

      // Floor Collision
      if (shibaY.current >= GROUND_Y - 50) {
        shibaY.current = GROUND_Y - 50;
        shibaVelocity.current = 0;
      }

      // Obstacle Movement
      obstacleX.current -= GAME_SPEED_START;
      
      // Reset Obstacle if off-screen
      if (obstacleX.current < -50) {
        obstacleX.current = GAME_WIDTH;
        score.current += 1;
      }
    };

    // --- 3. Drawing Logic ---
    const draw = () => {
      // Clear Screen
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // A. Draw Floor
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // B. Draw Obstacle (Red Candle)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(obstacleX.current, GROUND_Y - 40, 20, 40);

      // C. Draw Shiba
      if (spritesRef.current) {
        // Draw Sprite if loaded
        ctx.drawImage(spritesRef.current, 0, 0, 50, 50, 50, shibaY.current, 50, 50);
      } else {
        // FALLBACK: Draw Red Square if sprite missing/loading
        ctx.fillStyle = 'red'; // Shiba Color
        ctx.fillRect(50, shibaY.current, 50, 50);
      }
    };

    // --- 4. Initialization ---
    const init = async () => {
      // Load assets
      if (!spritesRef.current) {
        try {
          const response = await fetch(SHIBA_SPRITESHEET);
          const blob = await response.blob();
          spritesRef.current = await createImageBitmap(blob);
        } catch (e) {
          console.warn("Sprite load failed, using fallback square:", e);
        }
      }
      
      // Force an initial draw so we see the "Idle" state
      draw();

      if (gameState === 'PLAYING') {
        loop();
      }
    };

    init();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    const handleJump = () => {
      if (gameState === 'PLAYING') {
        if (shibaY.current === GROUND_Y - 50) {
          shibaVelocity.current = JUMP_STRENGTH;
        }
      } else if (gameState === 'IDLE') {
        setGameState('PLAYING');
      }
    };

    return addInputListener(handleJump);
  }, [gameState, setGameState]);

  return <canvas ref={canvasRef} />;
};

export default CanvasLayer;