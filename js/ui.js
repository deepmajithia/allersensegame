/**
 * UI system for AllerSense: Mow On!
 * Handles UI elements, HUD, and minimap
 */

class UISystem {
    constructor(game) {
        this.game = game;
        this.elements = {
            allergyMeter: document.querySelector('#allergy-meter .meter-fill'),
            weatherValue: document.getElementById('weather-value'),
            patternValue: document.getElementById('pattern-value'),
            timerValue: document.getElementById('timer-value'),
            scoreValue: document.getElementById('score-value'),
            powerup1: document.getElementById('powerup-1'),
            powerup2: document.getElementById('powerup-2'),
            powerup3: document.getElementById('powerup-3'),
            minimap: document.getElementById('minimap'),
            startScreen: document.getElementById('start-screen'),
            gameUI: document.getElementById('game-ui'),
            pauseScreen: document.getElementById('pause-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score')
        };
        
        // Minimap context
        this.minimapContext = null;
        this.minimapSize = 200;
        this.minimapScale = 0.1; // Scale factor for converting world to minimap coordinates
        
        // Initialize UI
        this.initUI();
    }
    
    // Initialize UI elements
    initUI() {
        // Initialize minimap
        this.initMinimap();
        
        // Add event listeners for buttons
        document.getElementById('start-button').addEventListener('click', () => {
            this.game.startGame();
        });
        
        document.getElementById('resume-button').addEventListener('click', () => {
            this.game.resumeGame();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.game.restartGame();
        });
        
        document.getElementById('play-again-button').addEventListener('click', () => {
            this.game.restartGame();
        });
    }
    
    // Initialize minimap
    initMinimap() {
        // Create canvas for minimap
        const canvas = document.createElement('canvas');
        canvas.width = this.minimapSize;
        canvas.height = this.minimapSize;
        
        // Replace div with canvas
        this.elements.minimap.innerHTML = '';
        this.elements.minimap.appendChild(canvas);
        
        // Get context
        this.minimapContext = canvas.getContext('2d');
        
        // Set initial state
        this.clearMinimap();
    }
    
    // Clear minimap
    clearMinimap() {
        if (this.minimapContext) {
            // Fill background
            this.minimapContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.minimapContext.fillRect(0, 0, this.minimapSize, this.minimapSize);
            
            // Draw border
            this.minimapContext.strokeStyle = 'white';
            this.minimapContext.lineWidth = 2;
            this.minimapContext.strokeRect(0, 0, this.minimapSize, this.minimapSize);
        }
    }
    
    // Update minimap with player position and cut grass
    updateMinimap(playerPosition, cutGrassPositions) {
        if (!this.minimapContext) return;
        
        // Clear minimap
        this.clearMinimap();
        
        // Draw cut grass
        this.minimapContext.fillStyle = '#5a8c2d';
        cutGrassPositions.forEach(pos => {
            const x = (pos.x * this.minimapScale + this.minimapSize / 2);
            const y = (pos.z * this.minimapScale + this.minimapSize / 2);
            this.minimapContext.fillRect(x - 1, y - 1, 2, 2);
        });
        
        // Draw player position
        const playerX = (playerPosition.x * this.minimapScale + this.minimapSize / 2);
        const playerY = (playerPosition.z * this.minimapScale + this.minimapSize / 2);
        
        this.minimapContext.fillStyle = 'red';
        this.minimapContext.beginPath();
        this.minimapContext.arc(playerX, playerY, 3, 0, Math.PI * 2);
        this.minimapContext.fill();
        
        // Draw player direction
        const directionLength = 8;
        const dirX = playerX + Math.sin(playerPosition.rotation) * directionLength;
        const dirY = playerY + Math.cos(playerPosition.rotation) * directionLength;
        
        this.minimapContext.strokeStyle = 'red';
        this.minimapContext.beginPath();
        this.minimapContext.moveTo(playerX, playerY);
        this.minimapContext.lineTo(dirX, dirY);
        this.minimapContext.stroke();
    }
    
    // Update allergy meter
    updateAllergyMeter(value) {
        const percentage = Math.min(value * 10, 100);
        this.elements.allergyMeter.style.width = `${percentage}%`;
        
        // Change color based on value
        if (percentage < 30) {
            this.elements.allergyMeter.style.backgroundColor = '#4caf50';
        } else if (percentage < 70) {
            this.elements.allergyMeter.style.backgroundColor = '#ff9800';
        } else {
            this.elements.allergyMeter.style.backgroundColor = '#f44336';
        }
    }
    
    // Update weather display
    updateWeatherDisplay(weatherDescription) {
        this.elements.weatherValue.textContent = weatherDescription;
    }
    
    // Update pattern display
    updatePatternDisplay(patternText) {
        this.elements.patternValue.textContent = patternText;
    }
    
    // Update timer display
    updateTimerDisplay(seconds) {
        this.elements.timerValue.textContent = formatTime(seconds);
    }
    
    // Update score display
    updateScoreDisplay(score) {
        this.elements.scoreValue.textContent = score;
    }
    
    // Update powerup displays
    updatePowerupDisplays(powerups) {
        this.elements.powerup1.textContent = `1: Mask (${powerups.mask})`;
        this.elements.powerup2.textContent = `2: Antihistamine (${powerups.antihistamine})`;
        this.elements.powerup3.textContent = `3: Equipment (${powerups.equipment})`;
    }
    
    // Show game over screen
    showGameOver(finalScore) {
        this.elements.finalScore.textContent = finalScore;
        this.elements.gameUI.classList.add('hidden');
        this.elements.gameOverScreen.classList.remove('hidden');
    }
    
    // Show start screen
    showStartScreen() {
        this.elements.startScreen.classList.remove('hidden');
        this.elements.gameUI.classList.add('hidden');
        this.elements.pauseScreen.classList.add('hidden');
        this.elements.gameOverScreen.classList.add('hidden');
    }
    
    // Show game UI
    showGameUI() {
        this.elements.startScreen.classList.add('hidden');
        this.elements.gameUI.classList.remove('hidden');
        this.elements.pauseScreen.classList.add('hidden');
        this.elements.gameOverScreen.classList.add('hidden');
    }
    
    // Show pause screen
    showPauseScreen() {
        this.elements.pauseScreen.classList.remove('hidden');
    }
    
    // Hide pause screen
    hidePauseScreen() {
        this.elements.pauseScreen.classList.add('hidden');
    }
    
    // Reset UI to initial state
    reset() {
        this.updateAllergyMeter(0);
        this.updateScoreDisplay(0);
        this.updateTimerDisplay(60);
        this.updatePowerupDisplays({
            mask: 0,
            antihistamine: 0,
            equipment: 0
        });
        this.clearMinimap();
    }
}
