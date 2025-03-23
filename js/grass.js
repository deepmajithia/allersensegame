/**
 * Grass system for AllerSense: Mow On!
 * Handles grass rendering, physics, and cutting mechanics
 */

class GrassSystem {
    constructor(scene, groundSize) {
        this.scene = scene;
        this.groundSize = groundSize;
        this.grassMeshes = [];
        this.grassGrid = {};
        this.cutGrass = new Set();
        this.grassDensity = 0.5; // Grass density (0-1)
        this.grassHeight = 0.4;  // Height of uncut grass
        this.cutHeight = 0.1;    // Height of cut grass
        
        // Grass materials
        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x7cba3f,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.cutGrassMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a8c2d,
            roughness: 0.7,
            metalness: 0.1
        });
        
        // Initialize grass
        this.initGrass();
    }
    
    // Initialize grass across the ground
    initGrass() {
        const gridSize = 1; // Size of each grid cell
        const halfGroundSize = this.groundSize / 2;
        
        // Create grass in a grid pattern
        for (let x = -halfGroundSize; x < halfGroundSize; x += gridSize) {
            for (let z = -halfGroundSize; z < halfGroundSize; z += gridSize) {
                // Add some randomness to grass placement
                if (Math.random() < this.grassDensity) {
                    const offsetX = (Math.random() - 0.5) * 0.8;
                    const offsetZ = (Math.random() - 0.5) * 0.8;
                    const posX = x + offsetX;
                    const posZ = z + offsetZ;
                    
                    this.createGrassBlade(posX, posZ);
                    
                    // Store grass position in grid for efficient lookup
                    const gridKey = `${Math.floor(posX)},${Math.floor(posZ)}`;
                    if (!this.grassGrid[gridKey]) {
                        this.grassGrid[gridKey] = [];
                    }
                    this.grassGrid[gridKey].push(this.grassMeshes[this.grassMeshes.length - 1]);
                }
            }
        }
    }
    
    // Create a single grass blade
    createGrassBlade(x, z) {
        // Create a simple grass blade using a scaled cube
        const width = 0.05 + Math.random() * 0.05;
        const height = this.grassHeight * (0.8 + Math.random() * 0.4);
        const depth = width;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, this.grassMaterial);
        
        // Position the grass blade
        mesh.position.set(x, height / 2, z);
        
        // Add some random rotation for variety
        mesh.rotation.y = Math.random() * Math.PI;
        
        // Add slight random tilt
        mesh.rotation.x = (Math.random() - 0.5) * 0.2;
        mesh.rotation.z = (Math.random() - 0.5) * 0.2;
        
        // Store original height for cutting mechanics
        mesh.userData.originalHeight = height;
        mesh.userData.isCut = false;
        mesh.userData.gridPosition = {
            x: Math.floor(x),
            z: Math.floor(z)
        };
        
        this.scene.add(mesh);
        this.grassMeshes.push(mesh);
        
        return mesh;
    }
    
    // Cut grass at a specific position
    cutGrassAt(position, radius) {
        const posX = Math.floor(position.x);
        const posZ = Math.floor(position.z);
        const cutRadius = radius || 1;
        
        // Check grass in surrounding grid cells
        for (let x = posX - cutRadius; x <= posX + cutRadius; x++) {
            for (let z = posZ - cutRadius; z <= posZ + cutRadius; z++) {
                const gridKey = `${x},${z}`;
                const grassInCell = this.grassGrid[gridKey];
                
                if (grassInCell) {
                    grassInCell.forEach(grass => {
                        if (!grass.userData.isCut) {
                            const distance = Math.sqrt(
                                Math.pow(grass.position.x - position.x, 2) +
                                Math.pow(grass.position.z - position.z, 2)
                            );
                            
                            if (distance <= cutRadius) {
                                this.cutGrassBladeAt(grass);
                                this.cutGrass.add(grass.id);
                            }
                        }
                    });
                }
            }
        }
        
        return this.cutGrass.size; // Return number of cut grass blades for scoring
    }
    
    // Cut a specific grass blade
    cutGrassBladeAt(grass) {
        if (!grass.userData.isCut) {
            // Reduce height
            const newHeight = this.cutHeight;
            grass.scale.y = newHeight / grass.userData.originalHeight;
            
            // Update position to keep bottom at ground level
            grass.position.y = newHeight / 2;
            
            // Change material
            grass.material = this.cutGrassMaterial;
            
            // Mark as cut
            grass.userData.isCut = true;
            
            // Create grass clipping particle effect
            this.createGrassClippingEffect(grass.position);
        }
    }
    
    // Create particle effect for grass clippings
    createGrassClippingEffect(position) {
        // This would be implemented with a particle system
        // For now, we'll just have a placeholder
        // In a full implementation, this would create small green particles
        // that fly out from the cut grass position
    }
    
    // Update grass physics (bending in wind, etc.)
    update(windDirection, windStrength, deltaTime) {
        // Apply wind effect to grass
        this.grassMeshes.forEach(grass => {
            if (!grass.userData.isCut) {
                // Calculate wind effect based on direction and strength
                const windEffect = windStrength * 0.1;
                
                // Apply subtle swaying motion
                const time = Date.now() * 0.001;
                const swayAmount = Math.sin(time + grass.position.x * 0.5 + grass.position.z * 0.5) * windEffect;
                
                // Apply rotation based on wind direction
                grass.rotation.x = (Math.sin(time * 0.5) * 0.05 + windDirection.x * swayAmount) * 0.5;
                grass.rotation.z = (Math.cos(time * 0.7) * 0.05 + windDirection.z * swayAmount) * 0.5;
            }
        });
    }
    
    // Get percentage of grass cut (for scoring)
    getPercentageCut() {
        return (this.cutGrass.size / this.grassMeshes.length) * 100;
    }
    
    // Reset all grass to uncut state
    reset() {
        this.grassMeshes.forEach(grass => {
            if (grass.userData.isCut) {
                // Restore height
                grass.scale.y = 1;
                
                // Update position
                grass.position.y = grass.userData.originalHeight / 2;
                
                // Change material back
                grass.material = this.grassMaterial;
                
                // Mark as uncut
                grass.userData.isCut = false;
            }
        });
        
        this.cutGrass.clear();
    }
}
