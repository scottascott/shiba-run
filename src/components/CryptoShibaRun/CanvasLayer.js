import React, { useRef, useEffect } from "react";
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, GAME_SPEED_START, GROUND_Y, SHIBA_WIDTH, SHIBA_HEIGHT, OBSTACLE_TYPES } from "./Constants";
import { SHIBA_SPRITESHEET, CANDLE1, CANDLE2, CANDLE3, FISHER } from "./Assets";
import { addInputListener } from "./utils/inputManager";

const CanvasLayer = ({ gameState, setGameState, onGameOver, onScoreUpdate }) => {
    const canvasRef = useRef(null);

    // --- Game State Refs ---
    const shibaY = useRef(GROUND_Y - SHIBA_HEIGHT);
    const shibaVelocity = useRef(0);
    const score = useRef(0);
    const gameSpeed = useRef(GAME_SPEED_START);

    // NEW: Obstacle State (Now holds X *and* the current Type)
    // Default to the first type in the list
    const obstacleX = useRef(GAME_WIDTH);
    const obstacleType = useRef(OBSTACLE_TYPES[0]);

    const groundOffset = useRef(0);
    const frameCount = useRef(0);

    // Asset Refs (We need multiple now)
    const shibaSprite = useRef(null);
    const obsCandleSprite1 = useRef(null);
    const obsCandleSprite2 = useRef(null);
    const obsCandleSprite3 = useRef(null);
    const obsFisherSprite = useRef(null);

    const onScoreUpdateRef = useRef(onScoreUpdate);
    useEffect(() => {
        onScoreUpdateRef.current = onScoreUpdate;
    }, [onScoreUpdate]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
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

            // 2. Obstacle Movement
            obstacleX.current -= gameSpeed.current;

            // NEW: Reset Logic (Randomize!)
            // When obstacle goes off-screen...
            if (obstacleX.current < -obstacleType.current.width) {
                obstacleX.current = GAME_WIDTH + Math.random() * 200;

                // PICK A RANDOM OBSTACLE
                const randomIndex = Math.floor(Math.random() * OBSTACLE_TYPES.length);
                obstacleType.current = OBSTACLE_TYPES[randomIndex];

                // Speed Progression
                if (score.current > 0 && score.current % 500 === 0) {
                    gameSpeed.current += 0.5;
                }
            }

            // 3. Ground
            groundOffset.current += gameSpeed.current;

            // 4. Score
            score.current += 1;
            if (frameCount.current % 10 === 0 && onScoreUpdateRef.current) {
                onScoreUpdateRef.current(score.current);
            }

            // 5. Animation
            frameCount.current += 1;

            // 6. Collision (Dynamic Size!)
            const obsW = obstacleType.current.width;
            const obsH = obstacleType.current.height;

            // Since collision box is rectangular, we use the current type's dimensions
            if (
                50 < obstacleX.current + obsW &&
                50 + SHIBA_WIDTH > obstacleX.current &&
                shibaY.current < GROUND_Y - obsH + obsH && // simplified: shibaY < GROUND_Y
                shibaY.current + SHIBA_HEIGHT > GROUND_Y - obsH
            ) {
                handleCollision();
            }
        };

        const handleCollision = () => {
            setGameState("GAME_OVER");
            if (onGameOver) onGameOver(score.current);
        };

        const draw = () => {
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // --- Floor ---
            ctx.beginPath();
            ctx.moveTo(0, GROUND_Y);
            ctx.lineTo(GAME_WIDTH, GROUND_Y);
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 10]);
            ctx.lineDashOffset = groundOffset.current;
            ctx.stroke();
            ctx.lineDashOffset = 0;
            ctx.setLineDash([]);

            // --- NEW: Draw Correct Obstacle Sprite ---
            const type = obstacleType.current;
            let spriteToDraw = null;

            // Map the type name to the loaded sprite ref
            if (type.name === "CANDLE1") spriteToDraw = obsCandleSprite1.current;
            if (type.name === "CANDLE2") spriteToDraw = obsCandleSprite2.current;
            if (type.name === "CANDLE3") spriteToDraw = obsCandleSprite3.current;
            if (type.name === "FISHER") spriteToDraw = obsFisherSprite.current;

            if (spriteToDraw) {
                // Draw the image with its specific dimensions
                ctx.drawImage(spriteToDraw, obstacleX.current, GROUND_Y - type.height, type.width, type.height);
            } else {
                // Fallback Red Box (if image not loaded yet)
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(obstacleX.current, GROUND_Y - type.height, type.width, type.height);
            }

            // --- Draw Shiba ---
            let spriteX = 0;
            if (gameState === "GAME_OVER") {
                spriteX = 108;
            } else if (shibaY.current < GROUND_Y - SHIBA_HEIGHT) {
                spriteX = 72;
            } else {
                const runFrame = Math.floor(frameCount.current / 10) % 2;
                spriteX = runFrame * 36;
            }

            if (shibaSprite.current) {
                ctx.drawImage(shibaSprite.current, spriteX, 0, 36, 50, 50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
            } else {
                ctx.fillStyle = "red";
                ctx.fillRect(50, shibaY.current, SHIBA_WIDTH, SHIBA_HEIGHT);
            }
        };

        const loop = () => {
            if (gameState !== "PLAYING") return;
            updatePhysics();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        // --- Helper to Load Images ---
        const loadImage = async (src) => {
            const res = await fetch(src);
            const blob = await res.blob();
            return createImageBitmap(blob);
        };

        const init = async () => {
            // Load ALL assets in parallel
            try {
                const [shiba, small, large, bear, fisher] = await Promise.all([
                    !shibaSprite.current ? loadImage(SHIBA_SPRITESHEET) : shibaSprite.current,
                    !obsCandleSprite1.current ? loadImage(CANDLE1) : obsCandleSprite1.current,
                    !obsCandleSprite2.current ? loadImage(CANDLE2) : obsCandleSprite2.current,
                    !obsCandleSprite3.current ? loadImage(CANDLE3) : obsCandleSprite3.current,
                    !obsFisherSprite.current ? loadImage(FISHER) : obsFisherSprite.current,
                ]);

                shibaSprite.current = shiba;
                obsCandleSprite1.current = small;
                obsCandleSprite2.current = large;
                obsCandleSprite3.current = bear;
                obsFisherSprite.current = fisher;
            } catch (e) {
                console.warn("Asset load failed", e);
            }

            if (gameState === "PLAYING") {
                // Reset Game
                shibaY.current = GROUND_Y - SHIBA_HEIGHT;
                shibaVelocity.current = 0;
                obstacleX.current = GAME_WIDTH;
                obstacleType.current = OBSTACLE_TYPES[0]; // Reset to first type
                score.current = 0;
                gameSpeed.current = GAME_SPEED_START;
                frameCount.current = 0;
                groundOffset.current = 0;
                if (onScoreUpdateRef.current) onScoreUpdateRef.current(0);
                loop();
            } else {
                draw();
            }
        };

        init();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState]);

    // Input Handling
    useEffect(() => {
        const handleJump = () => {
            if (gameState === "PLAYING") {
                if (shibaY.current === GROUND_Y - SHIBA_HEIGHT) {
                    shibaVelocity.current = JUMP_STRENGTH;
                }
            } else if (gameState === "IDLE" || gameState === "GAME_OVER") {
                setGameState("PLAYING");
            }
        };
        return addInputListener(handleJump);
    }, [gameState, setGameState]);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block" }} />;
};

export default CanvasLayer;
