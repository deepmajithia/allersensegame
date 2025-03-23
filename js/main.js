/**
 * Main entry point for AllerSense: Mow On!
 * Initializes the game and handles startup
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();
    
    // Add event listeners for buttons that need direct access to game instance
    document.getElementById('start-button').addEventListener('click', () => {
        game.startGame();
    });
    
    document.getElementById('resume-button').addEventListener('click', () => {
        game.resumeGame();
    });
    
    document.getElementById('restart-button').addEventListener('click', () => {
        game.restartGame();
    });
    
    document.getElementById('play-again-button').addEventListener('click', () => {
        game.restartGame();
    });
    
    // Log game initialization
    console.log('AllerSense: Mow On! initialized');
});

// Handle errors
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
});
