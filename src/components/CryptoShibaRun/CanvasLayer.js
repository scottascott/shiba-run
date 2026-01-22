import React, { useRef, useEffect } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from './Constants';
import { SHIBA_SPRITESHEET } from './Assets';

const CanvasLayer = ({ gameState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Fix for blurry canvas on Retina/High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    canvas.style.width = `${GAME_WIDTH}px`;
    canvas.style.height = `${GAME_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    let animationFrameId;

    // 1. Load the Assets
    const loadAssets = async () => {
      try {
        const response = await fetch(SHIBA_SPRITESHEET);
        const blob = await response.blob();
        const sprites = await createImageBitmap(blob);
        
        // Start the render loop once assets are ready
        render(sprites);
      } catch (e) {
        console.error("Sprite load failed:", e);
      }
    };

    // 2. The Render Loop
    const render = (sprites) => {
      // Clear Screen
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw Background (The Chart/Floor Line)
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.strokeStyle = '#00ff00'; // Green support line
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Shiba (The Placeholder Red Square)
      // Arguments: image, srcX, srcY, srcW, srcH, destX, destY, destW, destH
      // We are drawing it at X=50, Y=200 (sitting on the floor)
      ctx.drawImage(sprites, 0, 0, 50, 50, 50, GROUND_Y - 50, 50, 50);

      // Loop
      if (gameState === 'PLAYING' || gameState === 'IDLE') {
        animationFrameId = requestAnimationFrame(() => render(sprites));
      }
    };

    loadAssets();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return <canvas ref={canvasRef} />;
};

export default CanvasLayer;