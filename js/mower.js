/**
 * Lawn Mower class for AllerSense: Mow On!
 * Handles mower movement, physics, and cutting mechanics
 */

class LawnMower {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.speed = 5; // Base movement speed
        this.turnSpeed = 2; // Turning speed
        this.cuttingRadius = 1.2; // Radius of grass cutting
        this.isEngineOn = false; // Engine state
        this.engineStartTime = 0; // For engine sound pitch
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Mower parts
        this.mowerParts = {
            body: null,
            wheels: [],
            blade: null,
            handlebar: null
        };
        
        // Create the mower model
        this.createMowerModel();
    }
    
    // Create the lawn mower 3D model
    createMowerModel() {
        // Create mower body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.5,
            metalness: 0.7
        });
        this.mowerParts.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mowerParts.body.position.y = 0.4;
        
        // Create wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Front left wheel
        const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelFL.rotation.z = Math.PI / 2;
        wheelFL.position.set(-0.7, 0.3, 0.7);
        this.mowerParts.wheels.push(wheelFL);
        
        // Front right wheel
        const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelFR.rotation.z = Math.PI / 2;
        wheelFR.position.set(0.7, 0.3, 0.7);
        this.mowerParts.wheels.push(wheelFR);
        
        // Back left wheel
        const wheelBL = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelBL.rotation.z = Math.PI / 2;
        wheelBL.position.set(-0.7, 0.3, -0.7);
        this.mowerParts.wheels.push(wheelBL);
        
        // Back right wheel
        const wheelBR = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelBR.rotation.z = Math.PI / 2;
        wheelBR.position.set(0.7, 0.3, -0.7);
        this.mowerParts.wheels.push(wheelBR);
        
        // Create blade
        const bladeGeometry = new THREE.CylinderGeometry(1, 1, 0.05, 16);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.3,
            metalness: 0.9
        });
        this.mowerParts.blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.mowerParts.blade.position.y = 0.1;
        
        // Create handlebar
        const handlebarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const handlebarMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.5
        });
        this.mowerParts.handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
        this.mowerParts.handlebar.position.set(0, 0.8, -1);
        this.mowerParts.handlebar.rotation.x = Math.PI / 4;
        
        // Create handlebar grip
        const gripGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
        const gripMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9,
            metalness: 0.1
        });
        const grip = new THREE.Mesh(gripGeometry, gripMaterial);
        grip.position.y = 0.5;
        grip.rotation.x = Math.PI / 2;
        this.mowerParts.handlebar.add(grip);
        
        // Create mower group
        this.mowerGroup = new THREE.Group();
        this.mowerGroup.add(this.mowerParts.body);
        this.mowerParts.wheels.forEach(wheel => this.mowerGroup.add(wheel));
        this.mowerGroup.add(this.mowerParts.blade);
        this.mowerGroup.add(this.mowerParts.handlebar);
        
        // Position mower
        this.mowerGroup.position.set(0, 0, 0);
        
        // Add to scene
        this.scene.add(this.mowerGroup);
        
        // Set up camera position relative to mower
        this.updateCameraPosition();
    }
    
    // Update mower position and rotation
    update(deltaTime, grassSystem) {
        // Apply movement based on input
        this.updateMovement(deltaTime);
        
        // Update mower position
        this.mowerGroup.position.copy(this.position);
        this.mowerGroup.rotation.y = this.rotation.y;
        
        // Update camera position
        this.updateCameraPosition();
        
        // Update blade rotation if engine is on
        if (this.isEngineOn) {
            this.mowerParts.blade.rotation.y += deltaTime * 10;
            
            // Cut grass if moving and engine is on
            if (this.isMoving()) {
                grassSystem.cutGrassAt(this.position, this.cuttingRadius);
            }
        }
        
        // Update wheel rotation based on movement
        this.updateWheelRotation(deltaTime);
    }
    
    // Update mower movement based on input
    updateMovement(deltaTime) {
        // Calculate movement direction
        const moveX = 0;
        let moveZ = 0;
        
        if (this.moveForward) moveZ = -1;
        if (this.moveBackward) moveZ = 1;
        
        // Apply rotation from left/right movement
        if (this.moveLeft) this.rotation.y += this.turnSpeed * deltaTime;
        if (this.moveRight) this.rotation.y -= this.turnSpeed * deltaTime;
        
        // Calculate velocity based on rotation
        this.velocity.x = Math.sin(this.rotation.y) * moveZ * this.speed;
        this.velocity.z = Math.cos(this.rotation.y) * moveZ * this.speed;
        
        // Apply velocity to position
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Boundary check - keep mower within play area
        const boundaryLimit = 45;
        this.position.x = clamp(this.position.x, -boundaryLimit, boundaryLimit);
        this.position.z = clamp(this.position.z, -boundaryLimit, boundaryLimit);
    }
    
    // Update camera position relative to mower
    updateCameraPosition() {
        // Position camera behind and slightly above mower
        const cameraOffset = new THREE.Vector3(0, 1.5, 2);
        
        // Rotate offset based on mower rotation
        cameraOffset.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        // Set camera position
        this.camera.position.copy(this.position).add(cameraOffset);
        
        // Make camera look at mower
        this.camera.lookAt(
            this.position.x,
            this.position.y + 0.5,
            this.position.z
        );
    }
    
    // Update wheel rotation based on movement
    updateWheelRotation(deltaTime) {
        if (this.isMoving()) {
            const speed = this.velocity.length();
            const rotationSpeed = speed * 2;
            
            this.mowerParts.wheels.forEach(wheel => {
                wheel.rotation.x += rotationSpeed * deltaTime;
            });
        }
    }
    
    // Toggle engine on/off
    toggleEngine() {
        this.isEngineOn = !this.isEngineOn;
        
        if (this.isEngineOn) {
            this.engineStartTime = Date.now();
            // Play engine start sound
            // this.playEngineStartSound();
        } else {
            // Play engine stop sound
            // this.playEngineStopSound();
        }
        
        return this.isEngineOn;
    }
    
    // Check if mower is moving
    isMoving() {
        return this.moveForward || this.moveBackward;
    }
    
    // Set movement state
    setMovementState(forward, backward, left, right) {
        this.moveForward = forward;
        this.moveBackward = backward;
        this.moveLeft = left;
        this.moveRight = right;
    }
    
    // Apply powerup effect to mower
    applyPowerupEffect(effect) {
        if (effect.speedMultiplier) {
            this.speed = 5 * effect.speedMultiplier;
        } else {
            this.speed = 5;
        }
        
        if (effect.cuttingRadiusMultiplier) {
            this.cuttingRadius = 1.2 * effect.cuttingRadiusMultiplier;
        } else {
            this.cuttingRadius = 1.2;
        }
    }
    
    // Get mower position
    getPosition() {
        return this.position.clone();
    }
    
    // Reset mower to starting position
    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.isEngineOn = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.speed = 5;
        this.cuttingRadius = 1.2;
        
        // Update mower position
        this.mowerGroup.position.copy(this.position);
        this.mowerGroup.rotation.y = this.rotation.y;
        
        // Update camera position
        this.updateCameraPosition();
    }
}
