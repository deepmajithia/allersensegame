/**
 * Allergen system for AllerSense: Mow On!
 * Handles allergen particles, their behavior, and interaction with weather
 */

class AllergenSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.particles = [];
        this.particleGroups = {
            pollen: [],
            dust: [],
            mold: []
        };
        
        // Allergen settings
        this.settings = {
            pollen: {
                color: 0xffff00,
                size: 0.05,
                count: 200,
                speed: 0.2,
                allergyImpact: 1.5
            },
            dust: {
                color: 0xbbbbbb,
                size: 0.03,
                count: 150,
                speed: 0.15,
                allergyImpact: 1.0
            },
            mold: {
                color: 0x336633,
                size: 0.04,
                count: 100,
                speed: 0.1,
                allergyImpact: 2.0
            }
        };
        
        // Initialize allergen particles
        this.initAllergens();
    }
    
    // Initialize all allergen types
    initAllergens() {
        this.createParticleGroup('pollen');
        this.createParticleGroup('dust');
        this.createParticleGroup('mold');
    }
    
    // Create a group of particles for a specific allergen type
    createParticleGroup(type) {
        const settings = this.settings[type];
        
        // Create particle material
        const material = new THREE.PointsMaterial({
            color: settings.color,
            size: settings.size,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        // Create random particles in a large volume around the play area
        for (let i = 0; i < settings.count; i++) {
            // Random position in a 100x50x100 volume
            const x = (Math.random() - 0.5) * 100;
            const y = Math.random() * 50;
            const z = (Math.random() - 0.5) * 100;
            
            positions.push(x, y, z);
            
            // Random initial velocity
            const vx = (Math.random() - 0.5) * 0.1;
            const vy = (Math.random() - 0.5) * 0.05;
            const vz = (Math.random() - 0.5) * 0.1;
            
            velocities.push(vx, vy, vz);
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.velocities = velocities;
        particleSystem.userData.type = type;
        
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
        this.particleGroups[type].push(particleSystem);
    }
    
    // Update allergen particles based on weather conditions
    update(weather, deltaTime) {
        this.particles.forEach(particles => {
            const positions = particles.geometry.attributes.position.array;
            const velocities = particles.userData.velocities;
            const type = particles.userData.type;
            
            // Apply weather effects to particles
            const windEffect = weather.getWindEffect();
            const rainEffect = weather.getRainEffect();
            const sunEffect = weather.getSunEffect();
            
            // Get allergen-specific settings
            const settings = this.settings[type];
            
            // Update each particle
            for (let i = 0; i < positions.length; i += 3) {
                // Apply velocity
                positions[i] += velocities[i/3 * 3] * settings.speed * deltaTime;
                positions[i+1] += velocities[i/3 * 3 + 1] * settings.speed * deltaTime;
                positions[i+2] += velocities[i/3 * 3 + 2] * settings.speed * deltaTime;
                
                // Apply wind effect
                positions[i] += windEffect.direction.x * windEffect.strength * deltaTime;
                positions[i+1] += windEffect.direction.y * windEffect.strength * 0.2 * deltaTime;
                positions[i+2] += windEffect.direction.z * windEffect.strength * deltaTime;
                
                // Apply rain effect (pushes particles down)
                if (rainEffect > 0) {
                    positions[i+1] -= rainEffect * 0.1 * deltaTime;
                }
                
                // Apply sun effect (makes particles rise)
                if (sunEffect > 0) {
                    positions[i+1] += sunEffect * 0.05 * deltaTime;
                }
                
                // Boundary check - wrap particles around if they go too far
                if (positions[i] < -50) positions[i] = 50;
                if (positions[i] > 50) positions[i] = -50;
                if (positions[i+1] < 0) positions[i+1] = 50;
                if (positions[i+1] > 50) positions[i+1] = 0;
                if (positions[i+2] < -50) positions[i+2] = 50;
                if (positions[i+2] > 50) positions[i+2] = -50;
            }
            
            // Update the geometry
            particles.geometry.attributes.position.needsUpdate = true;
        });
        
        // Calculate player's allergen exposure
        return this.calculatePlayerExposure(weather);
    }
    
    // Calculate how much allergen the player is exposed to
    calculatePlayerExposure(weather) {
        let totalExposure = 0;
        const playerPosition = this.player.position.clone();
        
        // Check each particle system
        this.particles.forEach(particles => {
            const positions = particles.geometry.attributes.position.array;
            const type = particles.userData.type;
            const settings = this.settings[type];
            
            // Count particles near player
            let nearbyParticles = 0;
            for (let i = 0; i < positions.length; i += 3) {
                const particlePos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
                const distance = particlePos.distanceTo(playerPosition);
                
                // If particle is within 3 units of player, count it
                if (distance < 3) {
                    nearbyParticles++;
                }
            }
            
            // Calculate exposure based on particle count and allergen impact
            const typeExposure = (nearbyParticles / 10) * settings.allergyImpact;
            
            // Apply weather modifiers
            let weatherModifier = 1.0;
            
            // Pollen increases in sunny weather, decreases in rain
            if (type === 'pollen') {
                weatherModifier += weather.getSunEffect() * 0.5;
                weatherModifier -= weather.getRainEffect() * 0.8;
            }
            // Dust increases in dry and windy weather
            else if (type === 'dust') {
                weatherModifier += weather.getWindEffect().strength * 0.3;
                weatherModifier -= weather.getRainEffect() * 0.5;
            }
            // Mold increases in damp weather
            else if (type === 'mold') {
                weatherModifier += weather.getRainEffect() * 0.7;
                weatherModifier -= weather.getSunEffect() * 0.3;
            }
            
            // Ensure modifier is positive
            weatherModifier = Math.max(0.1, weatherModifier);
            
            // Add to total exposure
            totalExposure += typeExposure * weatherModifier;
        });
        
        return Math.min(totalExposure, 10); // Cap at 10 for game balance
    }
    
    // Set visibility of specific allergen types
    setAllergenVisibility(type, visible) {
        if (this.particleGroups[type]) {
            this.particleGroups[type].forEach(particles => {
                particles.visible = visible;
            });
        }
    }
    
    // Set all allergen visibilities
    setAllergensVisibility(visible) {
        this.particles.forEach(particles => {
            particles.visible = visible;
        });
    }
    
    // Reset the allergen system
    reset() {
        // Reset particle positions
        this.particles.forEach(particles => {
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = (Math.random() - 0.5) * 100;
                positions[i+1] = Math.random() * 50;
                positions[i+2] = (Math.random() - 0.5) * 100;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
        });
    }
}
