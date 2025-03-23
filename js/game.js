/**
 * Main game class for AllerSense: Mow On!
 * Coordinates all game systems and handles game state
 */

class Game {
    constructor() {
        // Game state
        this.state = {
            running: false,
            paused: false,
            gameOver: false,
            score: 0,
            time: 60, // Game time in seconds
            allergyLevel: 0,
            currentWeather: 'sunny'
        };
        
        // Game systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.grassSystem = null;
        this.allergenSystem = null;
        this.weatherSystem = null;
        this.powerupSystem = null;
        this.mower = null;
        this.patternSystem = null;
        this.uiSystem = null;
        this.audioSystem = null;
        
        // Game clock
        this.clock = new THREE.Clock();
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            escape: false,
            one: false,
            two: false,
            three: false
        };
        
        // Initialize game
        this.init();
    }
    
    // Initialize game systems
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 1.5, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').prepend(this.renderer.domElement);
        
        // Set up lighting
        this.setupLighting();
        
        // Create ground
        this.createGround();
        
        // Initialize game systems
        this.grassSystem = new GrassSystem(this.scene, 100);
        this.mower = new LawnMower(this.scene, this.camera);
        this.allergenSystem = new AllergenSystem(this.scene, this.mower);
        this.weatherSystem = new WeatherSystem(this.scene);
        this.powerupSystem = new PowerupSystem(this.scene, this.mower);
        this.patternSystem = new MowingPatterns(this.scene);
        this.audioSystem = new AudioSystem();
        this.uiSystem = new UISystem(this);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up window resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    // Set up lighting
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    // Create ground
    createGround() {
        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7cba3f,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        
        // Rotate and position ground
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    
    // Handle key down events
    onKeyDown(event) {
        if (!this.state.running || this.state.paused) return;
        
        switch (event.key.toLowerCase()) {
            case 'w':
                this.keys.forward = true;
                break;
            case 's':
                this.keys.backward = true;
                break;
            case 'a':
                this.keys.left = true;
                break;
            case 'd':
                this.keys.right = true;
                break;
            case ' ':
                if (!this.keys.space) {
                    this.keys.space = true;
                    this.toggleMower();
                }
                break;
            case 'escape':
                if (!this.keys.escape) {
                    this.keys.escape = true;
                    this.togglePause();
                }
                break;
            case '1':
                if (!this.keys.one) {
                    this.keys.one = true;
                    this.activatePowerup('mask');
                }
                break;
            case '2':
                if (!this.keys.two) {
                    this.keys.two = true;
                    this.activatePowerup('antihistamine');
                }
                break;
            case '3':
                if (!this.keys.three) {
                    this.keys.three = true;
                    this.activatePowerup('equipment');
                }
                break;
        }
        
        // Update mower movement
        this.updateMowerMovement();
    }
    
    // Handle key up events
    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.keys.forward = false;
                break;
            case 's':
                this.keys.backward = false;
                break;
            case 'a':
                this.keys.left = false;
                break;
            case 'd':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'escape':
                this.keys.escape = false;
                break;
            case '1':
                this.keys.one = false;
                break;
            case '2':
                this.keys.two = false;
                break;
            case '3':
                this.keys.three = false;
                break;
        }
        
        // Update mower movement
        if (this.state.running && !this.state.paused) {
            this.updateMowerMovement();
        }
    }
    
    // Update mower movement based on key state
    updateMowerMovement() {
        if (this.mower) {
            this.mower.setMovementState(
                this.keys.forward,
                this.keys.backward,
                this.keys.left,
                this.keys.right
            );
        }
    }
    
    // Toggle mower engine on/off
    toggleMower() {
        if (this.mower) {
            const isEngineOn = this.mower.toggleEngine();
            
            if (isEngineOn) {
                this.audioSystem.startEngine();
            } else {
                this.audioSystem.stopEngine();
            }
        }
    }
    
    // Activate powerup
    activatePowerup(type) {
        if (this.powerupSystem) {
            const activated = this.powerupSystem.activatePowerup(type);
            
            if (activated) {
                this.audioSystem.playSound('powerup_use');
                
                // Apply powerup effect to mower
                const effect = this.powerupSystem.applyMowerEffect(this.mower);
                this.mower.applyPowerupEffect(effect);
            }
        }
    }
    
    // Handle window resize
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Get delta time
        const delta = this.clock.getDelta();
        
        // Update game if running
        if (this.state.running && !this.state.paused) {
            this.update(delta);
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // Update game state
    update(delta) {
        // Update timer
        this.updateTimer(delta);
        
        // Update mower
        if (this.mower) {
            this.mower.update(delta, this.grassSystem);
            
            // Update audio based on mower state
            this.audioSystem.updateEngineSound(
                this.mower.isEngineOn,
                this.mower.velocity.length()
            );
        }
        
        // Update grass system
        if (this.grassSystem) {
            this.grassSystem.update(
                this.weatherSystem.getWindEffect().direction,
                this.weatherSystem.getWindEffect().strength,
                delta
            );
        }
        
        // Update weather system
        if (this.weatherSystem) {
            this.weatherSystem.update(delta);
            
            // Update UI with weather info
            this.uiSystem.updateWeatherDisplay(
                this.weatherSystem.getWeatherDescription()
            );
            
            // Update audio with weather info
            this.audioSystem.updateAmbientSounds(this.state.currentWeather);
        }
        
        // Update allergen system
        if (this.allergenSystem) {
            const allergenExposure = this.allergenSystem.update(this.weatherSystem, delta);
            
            // Apply powerup effect to allergen exposure
            let modifiedExposure = allergenExposure;
            if (this.powerupSystem) {
                modifiedExposure = this.powerupSystem.applyAllergenEffect(allergenExposure);
            }
            
            // Update allergy level
            this.updateAllergyLevel(modifiedExposure, delta);
        }
        
        // Update powerup system
        if (this.powerupSystem) {
            this.powerupSystem.update(delta);
            
            // Update UI with powerup info
            this.uiSystem.updatePowerupDisplays({
                mask: this.powerupSystem.getPowerupCount('mask'),
                antihistamine: this.powerupSystem.getPowerupCount('antihistamine'),
                equipment: this.powerupSystem.getPowerupCount('equipment')
            });
        }
        
        // Update pattern system
        if (this.patternSystem && this.mower && this.grassSystem) {
            const progress = this.patternSystem.updatePatternProgress(
                {
                    x: this.mower.position.x,
                    z: this.mower.position.z,
                    rotation: this.mower.rotation.y
                },
                this.grassSystem
            );
            
            // Update UI with pattern info
            this.uiSystem.updatePatternDisplay(
                this.patternSystem.getPatternDisplayText()
            );
            
            // Check if pattern is complete
            if (progress >= 100 && this.state.patternComplete !== true) {
                this.state.patternComplete = true;
                this.completePattern();
            }
        }
        
        // Update minimap
        if (this.uiSystem && this.mower && this.grassSystem) {
            // Get cut grass positions (simplified for prototype)
            const cutGrassPositions = [];
            // In a full implementation, we would get actual cut grass positions
            
            this.uiSystem.updateMinimap(
                {
                    x: this.mower.position.x,
                    z: this.mower.position.z,
                    rotation: this.mower.rotation.y
                },
                cutGrassPositions
            );
        }
        
        // Update score display
        this.uiSystem.updateScoreDisplay(this.state.score);
    }
    
    // Update game timer
    updateTimer(delta) {
        if (this.state.time > 0) {
            this.state.time -= delta;
            
            if (this.state.time <= 0) {
                this.state.time = 0;
                this.endGame();
            }
            
            // Update UI
            this.uiSystem.updateTimerDisplay(this.state.time);
        }
    }
    
    // Update allergy level
    updateAllergyLevel(exposure, delta) {
        // Increase allergy level based on exposure
        this.state.allergyLevel += exposure * delta * 0.1;
        
        // Apply powerup effect
        if (this.powerupSystem) {
            this.state.allergyLevel = this.powerupSystem.applyAllergyMeterEffect(
                this.state.allergyLevel
            );
        }
        
        // Cap allergy level
        this.state.allergyLevel = Math.min(Math.max(this.state.allergyLevel, 0), 10);
        
        // Update UI
        this.uiSystem.updateAllergyMeter(this.state.allergyLevel);
        
        // Check if allergy level is too high
        if (this.state.allergyLevel >= 10) {
            this.endGame();
        }
    }
    
    // Complete current pattern
    completePattern() {
        // Play completion sound
        this.audioSystem.playSound('pattern_complete');
        
        // Add score
        this.state.score += 100;
        
        // Set new pattern
        this.setRandomPattern();
    }
    
    // Set random pattern
    setRandomPattern() {
        if (this.patternSystem) {
            const patternKey = this.patternSystem.getRandomPatternForLevel(
                Math.min(Math.floor(this.state.score / 300) + 1, 4)
            );
            
            if (patternKey) {
                this.patternSystem.setPattern(patternKey);
                this.state.patternComplete = false;
            }
        }
    }
    
    // Start game
    startGame() {
        // Reset game state
        this.resetGame();
        
        // Show game UI
        this.uiSystem.showGameUI();
        
        // Start music
        this.audioSystem.startMusic();
        
        // Play start sound
        this.audioSystem.playSound('game_start');
        
        // Set initial pattern
        this.setRandomPattern();
        
        // Spawn initial powerups
        this.powerupSystem.spawnRandomPowerups(5);
        
        // Set game as running
        this.state.running = true;
        this.state.paused = false;
        this.state.gameOver = false;
    }
    
    // Pause game
    togglePause() {
        if (!this.state.running || this.state.gameOver) return;
        
        this.state.paused = !this.state.paused;
        
        if (this.state.paused) {
            // Show pause screen
            this.uiSystem.showPauseScreen();
            
            // Pause clock
            this.clock.stop();
        } else {
            // Hide pause screen
            this.uiSystem.hidePauseScreen();
            
            // Resume clock
            this.clock.start();
        }
    }
    
    // Resume game
    resumeGame() {
        if (this.state.paused) {
            this.togglePause();
        }
    }
    
    // End game
    endGame() {
        if (!this.state.running || this.state.gameOver) return;
        
        // Set game over state
        this.state.running = false;
        this.state.gameOver = true;
        
        // Play game over sound
        this.audioSystem.playSound('game_over');
        
        // Show game over screen
        this.uiSystem.showGameOver(this.state.score);
        
        // Stop engine sound
        this.audioSystem.stopEngine();
    }
    
    // Restart game
    restartGame() {
        this.startGame();
    }
    
    // Reset game state
    resetGame() {
        // Reset state
        this.state.running = false;
        this.state.paused = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.time = 60;
        this.state.allergyLevel = 0;
        this.state.patternComplete = false;
        
        // Reset systems
        if (this.mower) this.mower.reset();
        if (this.grassSystem) this.grassSystem.reset();
        if (this.allergenSystem) this.allergenSystem.reset();
        if (this.weatherSystem) this.weatherSystem.setRandomWeather();
        if (this.powerupSystem) this.powerupSystem.reset();
        if (this.patternSystem) this.patternSystem.reset();
        if (this.uiSystem) this.uiSystem.reset();
        
        // Reset clock
        this.clock.start();
    }
}
