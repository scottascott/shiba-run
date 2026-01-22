import React, { useRef, useEffect } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, GAME_SPEED_START, GROUND_Y,
  SHIBA_WIDTH, SHIBA_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT 
} from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';
import { addInputListener } from './utils/inputManager';

const CanvasLayer = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef(null);
  
  // --- Mutable Game State (Refs for performance) ---
  const shibaY = useRef(GROUND_Y - SHIBA_HEIGHT);
  const shibaVelocity = useRef(0);
  const obstacleX = useRef(GAME_WIDTH);
  const score = useRef(0);
  const gameSpeed = useRef(GAME_SPEED_START);
  
  // Animation State
  const frameCount = useRef(0); 

  // Asset Cache
  const spritesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // --- Retina/High-DPI Fix & Responsive Logic ---
    const dpr = window.devicePixelRatio || 1;
    
    // Internal Resolution (Physics coordinates) - ALWAYS 800x300
    // We strictly set the canvas buffer size here.
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    
    // Scale all drawing operations by dpr so we can use logical pixels
    ctx.scale(dpr, dpr);

    let animationFrameId;

    // --- Physics Logic ---
    const updatePhysics = () => {
      // 1. Gravity & Jump
      shibaVelocity.current += GRAVITY;
      shibaY.current += shibaVelocity.current;

      // Floor Collision
      if (shibaY.current >= GROUND_Y - SHIBA_HEIGHT) {
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
      }

      // 2. Obstacle Movement
      obstacleX.current -= gameSpeed.current;
      
      // Reset Obstacle & Increase Score
      if (obstacleX.current < -OBSTACLE_WIDTH) {
        obstacleX.current = GAME_WIDTH + Math.random() * 200; // Randomize gap slightly
        
        // Difficulty Progression: Speed up every 500 points
        if (score.current > 0 && score.current % 500 === 0) {
           gameSpeed.current += 0.5;
        }
      }

      // 3. Score (Portfolio Value)
      score.current += 1; 
      
      // 4. Animation Frame Count
      frameCount.current += 1;

      // 5. Collision Detection
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

      // Determine Sprite Frame
      let spriteX = 0; // Default: Run Frame 1 (0px)

      if (gameState === 'GAME_OVER') {
        spriteX = 150; // Dead Frame (Frame 3)
      } else if (shibaY.current < GROUND_Y - SHIBA_HEIGHT) {
        spriteX = 100; // Jump Frame (Frame 2)
      } else {
        // Run Animation: Switch every 10 frames (approx 6 times/sec)
        // Modulo 2 flips between 0 and 1
        const runFrame = Math.floor(frameCount.current / 10) % 2; 
        spriteX = runFrame * 50; 
      }

      // Draw Shiba
      if (spritesRef.current) {
        ctx.drawImage(
          spritesRef.current, 
          spriteX, 0, 50, 50, // Source: Grab specific frame
          50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT // Dest: Draw on screen
        );
      } else {
        // FALLBACK: Red Square if sprite hasn't loaded
        ctx.fillStyle = 'red';
        ctx.fillRect(50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
      }

      // Live Score
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`₿ ${score.current}`, GAME_WIDTH - 120, 30); 
    };

    // --- The Loop ---
    const loop = () => {
      if (gameState !== 'PLAYING') return;
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    // --- Initialization ---
    const init = async () => {
      // 1. Load Assets (if not cached)
      if (!spritesRef.current) {
        try {
          const response = await fetch(SHIBA_SPRITESHEET);
          const blob = await response.blob();
          spritesRef.current = await createImageBitmap(blob);
        } catch (e) { console.warn("Load failed", e); }
      }

      // 2. Handle State
      if (gameState === 'PLAYING') {
        // RESET VARIABLES ON START
        shibaY.current = GROUND_Y - SHIBA_HEIGHT;
        shibaVelocity.current = 0;
        obstacleX.current = GAME_WIDTH;
        score.current = 0;
        gameSpeed.current = GAME_SPEED_START;
        frameCount.current = 0;
        loop();
      } else if (gameState === 'GAME_OVER') {
        // Draw one last frame to show the collision/dead sprite
        draw();
      } else {
        // IDLE state
        draw(); 
      }
    };

    init();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]); // Re-run effect when gameState changes

  // --- Input Handling ---
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

  // CSS handles the visual width (100%), JS handles the internal resolution
  return <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />;
};

export default CanvasLayer;