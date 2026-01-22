import React, { useRef, useEffect } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, GAME_SPEED_START, GROUND_Y,
  SHIBA_WIDTH, SHIBA_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT 
} from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';
import { addInputListener } from './utils/inputManager';

const CanvasLayer = ({ gameState, setGameState, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef(null);
  
  // Game State Refs
  const shibaY = useRef(GROUND_Y - SHIBA_HEIGHT);
  const shibaVelocity = useRef(0);
  const obstacleX = useRef(GAME_WIDTH);
  const score = useRef(0);
  const gameSpeed = useRef(GAME_SPEED_START);
  
  // NEW: Track the ground movement
  const groundOffset = useRef(0);

  const frameCount = useRef(0); 
  const spritesRef = useRef(null);

  const onScoreUpdateRef = useRef(onScoreUpdate);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
  }, [onScoreUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId;

    const updatePhysics = () => {
      // 1. Gravity
      shibaVelocity.current += GRAVITY;
      shibaY.current += shibaVelocity.current;

      if (shibaY.current >= GROUND_Y - SHIBA_HEIGHT) {
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
      }

      // 2. Obstacle
      obstacleX.current -= gameSpeed.current;
      
      if (obstacleX.current < -OBSTACLE_WIDTH) {
        obstacleX.current = GAME_WIDTH + Math.random() * 200; 
        if (score.current > 0 && score.current % 500 === 0) {
           gameSpeed.current += 0.5;
        }
      }

      // 3. Move Ground (Sync with speed)
      // Increasing the offset moves the dash pattern to the Left
      groundOffset.current += gameSpeed.current;

      // 4. Score
      score.current += 1; 
      
      if (frameCount.current % 10 === 0 && onScoreUpdateRef.current) {
        onScoreUpdateRef.current(score.current);
      }
      
      // 5. Animation
      frameCount.current += 1;

      // 6. Collision
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

    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // --- MOVING FLOOR ---
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      
      ctx.strokeStyle = '#555'; 
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]); 
      
      // Apply the animation offset here
      ctx.lineDashOffset = groundOffset.current;
      
      ctx.stroke();
      
      // Reset dash settings so other things draw normally
      ctx.lineDashOffset = 0;
      ctx.setLineDash([]); 
      // --------------------

      // Obstacle
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(obstacleX.current, GROUND_Y - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);

      // Sprite Selection
      let spriteX = 0; 
      if (gameState === 'GAME_OVER') {
        spriteX = 150; 
      } else if (shibaY.current < GROUND_Y - SHIBA_HEIGHT) {
        spriteX = 100; 
      } else {
        const runFrame = Math.floor(frameCount.current / 10) % 2; 
        spriteX = runFrame * 50; 
      }

      // Draw Shiba
      if (spritesRef.current) {
        ctx.drawImage(spritesRef.current, spriteX, 0, 50, 50, 50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
      } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
      }
    };

    const loop = () => {
      if (gameState !== 'PLAYING') return;
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    const init = async () => {
      if (!spritesRef.current) {
        try {
          const response = await fetch(SHIBA_SPRITESHEET);
          const blob = await response.blob();
          spritesRef.current = await createImageBitmap(blob);
        } catch (e) { console.warn("Load failed", e); }
      }

      if (gameState === 'PLAYING') {
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
        obstacleX.current = GAME_WIDTH;
        score.current = 0;
        gameSpeed.current = GAME_SPEED_START;
        frameCount.current = 0;
        
        // Reset Ground Position
        groundOffset.current = 0;

        if (onScoreUpdateRef.current) onScoreUpdateRef.current(0);
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />;
};

export default CanvasLayer;