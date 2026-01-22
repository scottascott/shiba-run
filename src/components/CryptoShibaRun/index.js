import React, { useState, useMemo, useEffect } from "react";
import CanvasLayer from "./CanvasLayer";
import { GAME_WIDTH } from "./Constants";
import { SHIBA_SPRITESHEET } from "./Assets";

const CryptoShibaRun = () => {
    const [gameState, setGameState] = useState("IDLE");
    const [score, setScore] = useState(0);      // Final Score (Game Over)
    const [liveScore, setLiveScore] = useState(0); // Live Score (Playing)
    const [highScore, setHighScore] = useState(0);

    const handleGameOver = (finalScore) => {
        setScore(finalScore);
        if (finalScore > highScore) {
            setHighScore(finalScore);
        }
    };
    
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    return (
        <div
            style={{
                width: "100%",
                maxWidth: GAME_WIDTH,
                minHeight: "300px",
                aspectRatio: "800/300",
                position: "relative",
                border: "1px solid #333",
                backgroundColor: "#111",
                margin: "0 auto",
                overflow: "hidden",
                fontFamily: "monospace",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CanvasLayer 
                gameState={gameState} 
                setGameState={setGameState} 
                onGameOver={handleGameOver}
                onScoreUpdate={setLiveScore} // Connect the live score
            />

            {/* --- NEW: LIVE SCORE HUD (Only visible when PLAYING) --- */}
            {gameState === 'PLAYING' && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    pointerEvents: 'none', // Let clicks pass through to the game
                    border: '1px solid #333'
                }}>
                    <p style={{
                        color: '#00ff00', 
                        margin: 0, 
                        fontSize: '20px', // This stays BIG on mobile!
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}>
                        ₿ {liveScore}
                    </p>
                </div>
            )}

            {/* --- UI OVERLAY --- */}

            {gameState === "IDLE" && (
                <div style={overlayStyle}>
                    <div style={cardStyle}>
                        <h1 style={{ color: "#00ff00", fontSize: "clamp(20px, 5vw, 24px)", margin: 0 }}>CRYPTO SHIBA RUN</h1>
                        <p
                            style={{
                                color: "#fff",
                                marginTop: "10px",
                                fontSize: "14px",
                                animation: "blink 1.5s infinite",
                            }}
                        >
                            {isTouch ? "TAP SCREEN TO START" : "PRESS SPACE TO START"}
                        </p>
                    </div>
                </div>
            )}

            {gameState === "GAME_OVER" && (
                <div style={overlayStyle}>
                    <div style={cardStyle}>
                        <h2 style={{ color: "#ff4444", fontSize: "clamp(24px, 6vw, 30px)", margin: 0 }}>GOOD JOB!</h2>

                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundImage: `url(${SHIBA_SPRITESHEET})`,
                                backgroundRepeat: "no-repeat",
                                animation: "dance 0.6s steps(1) infinite",
                                backgroundSize: "300px 50px",
                                margin: "10px auto",
                                imageRendering: "pixelated",
                            }}
                        />

                        <style>
                            {`
                                @keyframes dance {
                                0% { background-position: -200px 0; }
                                50% { background-position: -250px 0; }
                                }
                            `}
                        </style>

                        <div
                            style={{
                                margin: "20px 0",
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "20px",
                            }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <p style={{ color: "#888", margin: "0 0 5px 0", fontSize: "10px", letterSpacing: "1px" }}>PORTFOLIO VALUE</p>
                                <p style={{ color: "#fff", fontSize: "20px", margin: 0, fontWeight: "bold" }}>₿ {score}</p>
                            </div>

                            <div style={{ width: "1px", height: "40px", backgroundColor: "#333" }}></div>

                            <div style={{ textAlign: "center" }}>
                                <p style={{ color: "#fbbf24", margin: "0 0 5px 0", fontSize: "10px", letterSpacing: "1px" }}>MY RECORD</p>
                                <p style={{ color: "#fbbf24", fontSize: "20px", margin: 0, fontWeight: "bold" }}>₿ {highScore}</p>
                            </div>
                        </div>

                        <button onClick={() => setGameState("PLAYING")} style={buttonStyle}>
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
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: "20px",
    boxSizing: "border-box",
};

const cardStyle = {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #444",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "300px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
};

const buttonStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#00ff00",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    marginTop: "10px",
    width: "100%",
    textTransform: "uppercase",
    letterSpacing: "1px",
};

export default CryptoShibaRun;