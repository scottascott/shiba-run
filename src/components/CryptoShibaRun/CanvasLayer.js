import React, { useRef, useEffect } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, GAME_SPEED_START, GROUND_Y,
  SHIBA_WIDTH, SHIBA_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT 
} from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';
import { addInputListener } from './utils/inputManager';

const CanvasLayer = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef(null);
  
  // Mutable Game State
  const shibaY = useRef(GROUND_Y - SHIBA_HEIGHT);
  const shibaVelocity = useRef(0);
  const obstacleX = useRef(GAME_WIDTH);
  const score = useRef(0);
  const gameSpeed = useRef(GAME_SPEED_START);

  const spritesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Retina/High-DPI Fix
    const dpr = window.devicePixelRatio || 1;
    
    // Internal Resolution (Physics coordinates) - ALWAYS 800x300
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    
    // Scale all drawing operations by dpr
    ctx.scale(dpr, dpr);

    // NOTE: We REMOVED canvas.style.width assignment here. 
    // We let CSS handle the visual size now.

    let animationFrameId;

    // --- Physics Logic ---
    const updatePhysics = () => {
      // 1. Gravity & Jump
      shibaVelocity.current += GRAVITY;
      shibaY.current += shibaVelocity.current;

      if (shibaY.current >= GROUND_Y - SHIBA_HEIGHT) {
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
      }

      // 2. Obstacle Movement
      obstacleX.current -= gameSpeed.current;
      
      // Reset Obstacle & Increase Score
      if (obstacleX.current < -OBSTACLE_WIDTH) {
        obstacleX.current = GAME_WIDTH + Math.random() * 200; 
        if (score.current > 0 && score.current % 500 === 0) {
           gameSpeed.current += 0.5;
        }
      }

      // 3. Score
      score.current += 1; 

      // 4. Collision
      if (
        50 < obstacleX.current + OBSTACLE_WIDTH &&
        50 + SHIBA_WIDTH > obstacleX.current &&
        shibaY.current < (GROUND_Y - OBSTACLE_HEIGHT) + OBSTACLE_HEIGHT &&
        shibaY.current + SHIBA_HEIGHT > GROUND_Y - OBSTACLE_HEIGHT
      ) {
        handleCollision();
      }
    };

    const handleCollision = () => {
      setGameState('GAME_OVER');
      if (onGameOver) onGameOver(score.current);
    };

    // --- Drawing Logic ---
    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Floor
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Obstacle
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(obstacleX.current, GROUND_Y - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);

      // Shiba
      if (spritesRef.current) {
        ctx.drawImage(spritesRef.current, 0, 0, 50, 50, 50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
      } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
      }

      // Live Score - Moved slightly left to ensure visibility on small screens
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`₿ ${score.current}`, GAME_WIDTH - 120, 30); 
    };

    const loop = () => {
      if (gameState !== 'PLAYING') return;
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    // --- Initialization ---
    const init = async () => {
      if (!spritesRef.current) {
        try {
          const response = await fetch(SHIBA_SPRITESHEET);
          const blob = await response.blob();
          spritesRef.current = await createImageBitmap(blob);
        } catch (e) { console.warn("Load failed", e); }
      }

      if (gameState === 'PLAYING') {
        // RESET
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
        obstacleX.current = GAME_WIDTH;
        score.current = 0;
        gameSpeed.current = GAME_SPEED_START;
        loop();
      } else if (gameState === 'GAME_OVER') {
        draw();
      } else {
        draw(); 
      }
    };

    init();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]); 

  // --- Inputs ---
  useEffect(() => {
    const handleJump = () => {
      if (gameState === 'PLAYING') {
        if (shibaY.current === GROUND_Y - SHIBA_HEIGHT) {
          shibaVelocity.current = JUMP_STRENGTH;
        }
      } else if (gameState === 'IDLE' || gameState === 'GAME_OVER') {
        setGameState('PLAYING');
      }
    };
    return addInputListener(handleJump);
  }, [gameState, setGameState]);

  // CSS Scaling happens here
  return <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />;
};

export default CanvasLayer;