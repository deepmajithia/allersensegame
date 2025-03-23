/**
 * Weather system for AllerSense: Mow On!
 * Handles weather conditions, effects, and transitions
 */

class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentWeather = 'sunny'; // Default weather
        this.transitionProgress = 0;
        this.transitionDuration = 10; // Seconds for weather transition
        
        // Weather conditions and their properties
        this.weatherTypes = {
            sunny: {
                skyColor: 0x87ceeb,
                lightIntensity: 1.0,
                fogDensity: 0.003,
                windStrength: 0.2,
                rainIntensity: 0,
                allergenModifiers: {
                    pollen: 1.5,  // Pollen increases in sunny weather
                    dust: 1.0,
                    mold: 0.5     // Mold decreases in sunny weather
                },
                description: "Sunny (+Pollen, -Mold)"
            },
            cloudy: {
                skyColor: 0xb0c4de,
                lightIntensity: 0.7,
                fogDensity: 0.005,
                windStrength: 0.4,
                rainIntensity: 0,
                allergenModifiers: {
                    pollen: 1.0,
                    dust: 1.0,
                    mold: 0.8
                },
                description: "Cloudy"
            },
            rainy: {
                skyColor: 0x708090,
                lightIntensity: 0.5,
                fogDensity: 0.01,
                windStrength: 0.6,
                rainIntensity: 1.0,
                allergenModifiers: {
                    pollen: 0.3,  // Pollen decreases in rain
                    dust: 0.5,
                    mold: 1.5     // Mold increases in damp weather
                },
                description: "Rainy (-Pollen, +Mold)"
            },
            windy: {
                skyColor: 0x87ceeb,
                lightIntensity: 0.9,
                fogDensity: 0.002,
                windStrength: 1.0,
                rainIntensity: 0,
                allergenModifiers: {
                    pollen: 1.2,
                    dust: 1.5,    // Dust increases in windy weather
                    mold: 0.7
                },
                description: "Windy (+All Allergens)"
            },
            foggy: {
                skyColor: 0xd3d3d3,
                lightIntensity: 0.6,
                fogDensity: 0.03,
                windStrength: 0.1,
                rainIntensity: 0.2,
                allergenModifiers: {
                    pollen: 0.8,
                    dust: 0.7,
                    mold: 1.2
                },
                description: "Foggy (+Mold)"
            }
        };
        
        // Weather effects
        this.effects = {
            rain: null,
            fog: null,
            clouds: null,
            wind: {
                direction: new THREE.Vector3(1, 0, 0),
                strength: this.weatherTypes[this.currentWeather].windStrength
            }
        };
        
        // Initialize weather effects
        this.initWeatherEffects();
    }
    
    // Initialize weather visual effects
    initWeatherEffects() {
        // Initialize fog
        this.scene.fog = new THREE.FogExp2(
            this.weatherTypes[this.currentWeather].skyColor,
            this.weatherTypes[this.currentWeather].fogDensity
        );
        
        // Initialize rain particle system
        this.initRainEffect();
        
        // Initialize cloud system
        this.initCloudEffect();
        
        // Set initial wind direction (random)
        this.updateWindDirection();
    }
    
    // Initialize rain particle system
    initRainEffect() {
        const rainGeometry = new THREE.BufferGeometry();
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        
        // Create raindrops
        const rainCount = 5000;
        const positions = new Float32Array(rainCount * 3);
        
        for (let i = 0; i < rainCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i+1] = Math.random() * 50;
            positions[i+2] = (Math.random() - 0.5) * 100;
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create rain particle system
        this.effects.rain = new THREE.Points(rainGeometry, rainMaterial);
        this.effects.rain.visible = false; // Hide initially
        this.scene.add(this.effects.rain);
    }
    
    // Initialize cloud system
    initCloudEffect() {
        this.effects.clouds = [];
        
        // Create several cloud meshes
        for (let i = 0; i < 20; i++) {
            const cloudGeometry = new THREE.SphereGeometry(5 + Math.random() * 10, 8, 8);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                roughness: 1,
                metalness: 0
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position clouds randomly in the sky
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                30 + Math.random() * 20,
                (Math.random() - 0.5) * 200
            );
            
            // Scale clouds randomly
            const scale = 0.5 + Math.random() * 1.5;
            cloud.scale.set(scale, scale * 0.6, scale);
            
            // Store cloud speed
            cloud.userData.speed = 0.5 + Math.random() * 1.5;
            
            this.scene.add(cloud);
            this.effects.clouds.push(cloud);
        }
    }
    
    // Update weather conditions
    update(deltaTime) {
        // Update weather transition if in progress
        if (this.transitionProgress < this.transitionDuration) {
            this.transitionProgress += deltaTime;
            this.updateWeatherTransition();
        }
        
        // Update rain effect
        this.updateRainEffect(deltaTime);
        
        // Update cloud movement
        this.updateClouds(deltaTime);
        
        // Occasionally change wind direction
        if (Math.random() < 0.001) {
            this.updateWindDirection();
        }
    }
    
    // Update rain particles
    updateRainEffect(deltaTime) {
        if (this.effects.rain && this.weatherTypes[this.currentWeather].rainIntensity > 0) {
            this.effects.rain.visible = true;
            
            const positions = this.effects.rain.geometry.attributes.position.array;
            const rainSpeed = 10 * this.weatherTypes[this.currentWeather].rainIntensity;
            const windEffect = this.effects.wind.strength * 0.5;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move rain down
                positions[i+1] -= rainSpeed * deltaTime;
                
                // Apply wind to rain
                positions[i] += this.effects.wind.direction.x * windEffect * deltaTime;
                positions[i+2] += this.effects.wind.direction.z * windEffect * deltaTime;
                
                // Reset raindrop if it hits the ground
                if (positions[i+1] < 0) {
                    positions[i] = (Math.random() - 0.5) * 100;
                    positions[i+1] = 50; // Reset to top
                    positions[i+2] = (Math.random() - 0.5) * 100;
                }
            }
            
            this.effects.rain.geometry.attributes.position.needsUpdate = true;
        } else if (this.effects.rain) {
            this.effects.rain.visible = false;
        }
    }
    
    // Update cloud movement
    updateClouds(deltaTime) {
        const windStrength = this.effects.wind.strength;
        
        this.effects.clouds.forEach(cloud => {
            // Move clouds based on wind direction and strength
            cloud.position.x += this.effects.wind.direction.x * windStrength * cloud.userData.speed * deltaTime;
            cloud.position.z += this.effects.wind.direction.z * windStrength * cloud.userData.speed * deltaTime;
            
            // Wrap clouds around if they go too far
            if (cloud.position.x > 100) cloud.position.x = -100;
            if (cloud.position.x < -100) cloud.position.x = 100;
            if (cloud.position.z > 100) cloud.position.z = -100;
            if (cloud.position.z < -100) cloud.position.z = 100;
        });
    }
    
    // Update wind direction
    updateWindDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.effects.wind.direction.set(
            Math.cos(angle),
            0,
            Math.sin(angle)
        );
    }
    
    // Change weather to a new type
    changeWeather(newWeather) {
        if (this.weatherTypes[newWeather] && newWeather !== this.currentWeather) {
            this.previousWeather = this.currentWeather;
            this.currentWeather = newWeather;
            this.transitionProgress = 0;
            
            // Update wind strength immediately
            this.effects.wind.strength = this.weatherTypes[this.currentWeather].windStrength;
            
            return true;
        }
        return false;
    }
    
    // Update weather during transition
    updateWeatherTransition() {
        const progress = Math.min(this.transitionProgress / this.transitionDuration, 1);
        const easeProgress = easeInOut(progress); // Using utility function
        
        const prevWeather = this.weatherTypes[this.previousWeather];
        const nextWeather = this.weatherTypes[this.currentWeather];
        
        // Interpolate sky color
        const prevColor = new THREE.Color(prevWeather.skyColor);
        const nextColor = new THREE.Color(nextWeather.skyColor);
        const currentColor = new THREE.Color().lerpColors(prevColor, nextColor, easeProgress);
        
        // Update fog color and density
        if (this.scene.fog) {
            this.scene.fog.color = currentColor;
            this.scene.fog.density = lerp(
                prevWeather.fogDensity,
                nextWeather.fogDensity,
                easeProgress
            );
        }
        
        // Update directional light intensity if it exists
        const directionalLights = this.scene.children.filter(
            child => child instanceof THREE.DirectionalLight
        );
        
        if (directionalLights.length > 0) {
            directionalLights[0].intensity = lerp(
                prevWeather.lightIntensity,
                nextWeather.lightIntensity,
                easeProgress
            );
        }
    }
    
    // Get current weather description
    getWeatherDescription() {
        return this.weatherTypes[this.currentWeather].description;
    }
    
    // Get wind effect for other systems
    getWindEffect() {
        return {
            direction: this.effects.wind.direction,
            strength: this.effects.wind.strength
        };
    }
    
    // Get rain effect intensity (0-1)
    getRainEffect() {
        return this.weatherTypes[this.currentWeather].rainIntensity;
    }
    
    // Get sun effect intensity (0-1)
    getSunEffect() {
        // Sun effect is based on light intensity
        return this.weatherTypes[this.currentWeather].lightIntensity;
    }
    
    // Get allergen modifier for a specific type
    getAllergenModifier(allergenType) {
        return this.weatherTypes[this.currentWeather].allergenModifiers[allergenType] || 1.0;
    }
    
    // Set random weather
    setRandomWeather() {
        const weatherTypes = Object.keys(this.weatherTypes);
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        this.changeWeather(randomWeather);
    }
}
