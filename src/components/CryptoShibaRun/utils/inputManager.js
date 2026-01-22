// Handles keyboard and touch events
export const addInputListener = (onJump) => {
    const handlePress = (e) => {
      // Spacebar, Up Arrow, or Screen Tap
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.type === 'touchstart') {
        e.preventDefault(); // Stop page scrolling
        onJump();
      }
    };
  
    // Passive: false is needed for touchstart to preventDefault
    window.addEventListener('keydown', handlePress);
    window.addEventListener('touchstart', handlePress, { passive: false });
  
    // Cleanup function to remove listeners
    return () => {
      window.removeEventListener('keydown', handlePress);
      window.removeEventListener('touchstart', handlePress);
    };
  };