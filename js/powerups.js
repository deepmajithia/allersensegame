/**
 * Powerup system for AllerSense: Mow On!
 * Handles powerup creation, collection, and effects
 */

class PowerupSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.powerups = [];
        this.activePowerups = {
            mask: 0,
            antihistamine: 0,
            equipment: 0
        };
        this.activeEffect = null;
        this.effectDuration = 0;
        
        // Powerup settings
        this.settings = {
            mask: {
                model: null, // Will be set when loaded
                scale: 0.5,
                duration: 15, // seconds
                effect: 'Reduces allergen exposure by 75%',
                color: 0x3498db
            },
            antihistamine: {
                model: null, // Will be set when loaded
                scale: 0.5,
                duration: 10, // seconds
                effect: 'Reduces allergy meter by 50%',
                color: 0xe74c3c
            },
            equipment: {
                model: null, // Will be set when loaded
                scale: 0.5,
                duration: 20, // seconds
                effect: 'Increases mowing speed and cutting radius',
                color: 0x2ecc71
            }
        };
        
        // Initialize powerup models
        this.initPowerupModels();
    }
    
    // Initialize powerup models
    initPowerupModels() {
        // For each powerup type, create a simple model
        Object.keys(this.settings).forEach(type => {
            this.createPowerupModel(type);
        });
    }
    
    // Create a simple model for a powerup type
    createPowerupModel(type) {
        const settings = this.settings[type];
        
        // Create a simple box geometry for now
        // In a full implementation, we would load detailed 3D models
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: settings.color,
            roughness: 0.3,
            metalness: 0.7,
            emissive: settings.color,
            emissiveIntensity: 0.3
        });
        
        const model = new THREE.Mesh(geometry, material);
        model.scale.set(settings.scale, settings.scale, settings.scale);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: settings.color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        model.add(glow);
        
        // Store the model
        this.settings[type].model = model;
    }
    
    // Spawn a powerup in the world
    spawnPowerup(type, position) {
        if (!this.settings[type]) return null;
        
        // Clone the model
        const powerupModel = this.settings[type].model.clone();
        
        // Set position
        if (position) {
            powerupModel.position.copy(position);
        } else {
            // Random position if none provided
            powerupModel.position.set(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
        }
        
        // Add to scene
        this.scene.add(powerupModel);
        
        // Store powerup data
        const powerup = {
            type: type,
            model: powerupModel,
            collected: false
        };
        
        this.powerups.push(powerup);
        return powerup;
    }
    
    // Update powerups (rotation, collection detection, etc.)
    update(deltaTime) {
        // Update powerup animations
        this.powerups.forEach(powerup => {
            if (!powerup.collected) {
                // Rotate powerup
                powerup.model.rotation.y += deltaTime * 2;
                
                // Bob up and down
                const hoverOffset = Math.sin(Date.now() * 0.002) * 0.2;
                powerup.model.position.y = 1 + hoverOffset;
                
                // Check if player collected this powerup
                const distance = this.player.position.distanceTo(powerup.model.position);
                if (distance < 2) {
                    this.collectPowerup(powerup);
                }
            }
        });
        
        // Update active powerup effect
        if (this.activeEffect) {
            this.effectDuration -= deltaTime;
            
            if (this.effectDuration <= 0) {
                this.deactivatePowerup();
            }
        }
    }
    
    // Collect a powerup
    collectPowerup(powerup) {
        if (!powerup.collected) {
            powerup.collected = true;
            
            // Remove from scene
            this.scene.remove(powerup.model);
            
            // Increment powerup count
            this.activePowerups[powerup.type]++;
            
            // Play collection sound
            // this.playCollectionSound(powerup.type);
            
            // Show collection message
            console.log(`Collected ${powerup.type} powerup!`);
            
            return true;
        }
        return false;
    }
    
    // Activate a powerup
    activatePowerup(type) {
        if (this.activePowerups[type] > 0 && !this.activeEffect) {
            // Decrement powerup count
            this.activePowerups[type]--;
            
            // Set active effect
            this.activeEffect = type;
            this.effectDuration = this.settings[type].duration;
            
            // Play activation sound
            // this.playActivationSound(type);
            
            // Show activation message
            console.log(`Activated ${type} powerup: ${this.settings[type].effect}`);
            
            return true;
        }
        return false;
    }
    
    // Deactivate current powerup
    deactivatePowerup() {
        if (this.activeEffect) {
            // Play deactivation sound
            // this.playDeactivationSound(this.activeEffect);
            
            // Show deactivation message
            console.log(`${this.activeEffect} powerup effect ended`);
            
            // Clear active effect
            this.activeEffect = null;
            this.effectDuration = 0;
        }
    }
    
    // Get active powerup effect
    getActivePowerupEffect() {
        return this.activeEffect;
    }
    
    // Get remaining effect duration
    getEffectDuration() {
        return this.effectDuration;
    }
    
    // Get count of a specific powerup
    getPowerupCount(type) {
        return this.activePowerups[type] || 0;
    }
    
    // Apply powerup effect to allergen exposure
    applyAllergenEffect(exposure) {
        if (this.activeEffect === 'mask') {
            // Mask reduces allergen exposure by 75%
            return exposure * 0.25;
        }
        return exposure;
    }
    
    // Apply powerup effect to allergy meter
    applyAllergyMeterEffect(currentLevel) {
        if (this.activeEffect === 'antihistamine') {
            // Antihistamine reduces allergy meter by 50%
            return currentLevel * 0.5;
        }
        return currentLevel;
    }
    
    // Apply powerup effect to mower
    applyMowerEffect(mower) {
        if (this.activeEffect === 'equipment') {
            // Equipment increases mowing speed and cutting radius
            return {
                speedMultiplier: 1.5,
                cuttingRadiusMultiplier: 1.5
            };
        }
        return {
            speedMultiplier: 1.0,
            cuttingRadiusMultiplier: 1.0
        };
    }
    
    // Spawn random powerups throughout the level
    spawnRandomPowerups(count) {
        const types = Object.keys(this.settings);
        
        for (let i = 0; i < count; i++) {
            const randomType = types[Math.floor(Math.random() * types.length)];
            this.spawnPowerup(randomType);
        }
    }
    
    // Clear all powerups
    clearPowerups() {
        this.powerups.forEach(powerup => {
            if (!powerup.collected) {
                this.scene.remove(powerup.model);
            }
        });
        
        this.powerups = [];
        this.activeEffect = null;
        this.effectDuration = 0;
    }
    
    // Reset powerup system
    reset() {
        this.clearPowerups();
        
        this.activePowerups = {
            mask: 0,
            antihistamine: 0,
            equipment: 0
        };
    }
}
