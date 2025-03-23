/**
 * Mowing Patterns system for AllerSense: Mow On!
 * Handles pattern objectives, tracking, and scoring
 */

class MowingPatterns {
    constructor(scene) {
        this.scene = scene;
        this.currentPattern = null;
        this.patternProgress = 0;
        this.patternCompletion = 0;
        this.patternLevel = 1;
        
        // Pattern definitions
        this.patterns = {
            // Level 1: Basic Techniques
            straightLine: {
                name: "Straight Line",
                level: 1,
                description: "Mow in perfectly straight parallel lines",
                guideColor: 0x00ff00,
                checkFunction: this.checkStraightLinePattern.bind(this)
            },
            perimeter: {
                name: "Perimeter",
                level: 1,
                description: "Cut clean edges around the border",
                guideColor: 0x00ff00,
                checkFunction: this.checkPerimeterPattern.bind(this)
            },
            obstacle: {
                name: "Obstacle Navigation",
                level: 1,
                description: "Clean cuts around obstacles",
                guideColor: 0x00ff00,
                checkFunction: this.checkObstaclePattern.bind(this)
            },
            coverage: {
                name: "Basic Coverage",
                level: 1,
                description: "Ensure no missed patches",
                guideColor: 0x00ff00,
                checkFunction: this.checkCoveragePattern.bind(this)
            },
            
            // Level 2: Intermediate Patterns
            stripe: {
                name: "Stripe",
                level: 2,
                description: "Create alternating direction stripes",
                guideColor: 0x0088ff,
                checkFunction: this.checkStripePattern.bind(this)
            },
            circular: {
                name: "Circular",
                level: 2,
                description: "Mow in concentric circles from outside in",
                guideColor: 0x0088ff,
                checkFunction: this.checkCircularPattern.bind(this)
            },
            diagonal: {
                name: "Diagonal",
                level: 2,
                description: "Cut at 45-degree angle patterns",
                guideColor: 0x0088ff,
                checkFunction: this.checkDiagonalPattern.bind(this)
            },
            section: {
                name: "Section Management",
                level: 2,
                description: "Divide lawn into efficient zones",
                guideColor: 0x0088ff,
                checkFunction: this.checkSectionPattern.bind(this)
            },
            
            // Level 3: Advanced Artistry
            checkerboard: {
                name: "Checkerboard",
                level: 3,
                description: "Create perpendicular stripe combinations",
                guideColor: 0xff8800,
                checkFunction: this.checkCheckerboardPattern.bind(this)
            },
            diamond: {
                name: "Diamond",
                level: 3,
                description: "Create complex geometric designs",
                guideColor: 0xff8800,
                checkFunction: this.checkDiamondPattern.bind(this)
            },
            spiral: {
                name: "Spiral",
                level: 3,
                description: "Perfect spiral from exterior to center",
                guideColor: 0xff8800,
                checkFunction: this.checkSpiralPattern.bind(this)
            },
            contour: {
                name: "Contour",
                level: 3,
                description: "Follow terrain changes effectively",
                guideColor: 0xff8800,
                checkFunction: this.checkContourPattern.bind(this)
            },
            
            // Level 4: Master Techniques
            multiDirectional: {
                name: "Multi-Directional",
                level: 4,
                description: "Combine multiple pattern types",
                guideColor: 0xff0000,
                checkFunction: this.checkMultiDirectionalPattern.bind(this)
            },
            custom: {
                name: "Custom Pattern",
                level: 4,
                description: "Design your own signature cuts",
                guideColor: 0xff0000,
                checkFunction: this.checkCustomPattern.bind(this)
            },
            specialty: {
                name: "Specialty Terrain",
                level: 4,
                description: "Master slopes and uneven ground",
                guideColor: 0xff0000,
                checkFunction: this.checkSpecialtyTerrainPattern.bind(this)
            },
            speedPrecision: {
                name: "Speed-Precision Balance",
                level: 4,
                description: "Maintain quality at top speed",
                guideColor: 0xff0000,
                checkFunction: this.checkSpeedPrecisionPattern.bind(this)
            }
        };
        
        // Visual guides for patterns
        this.patternGuides = {
            markers: [],
            lines: [],
            active: false
        };
    }
    
    // Set current pattern
    setPattern(patternKey) {
        if (this.patterns[patternKey]) {
            this.currentPattern = patternKey;
            this.patternProgress = 0;
            this.patternCompletion = 0;
            
            // Create visual guides for the pattern
            this.createPatternGuides(patternKey);
            
            return this.patterns[patternKey];
        }
        return null;
    }
    
    // Create visual guides for the current pattern
    createPatternGuides(patternKey) {
        // Clear existing guides
        this.clearPatternGuides();
        
        const pattern = this.patterns[patternKey];
        const guideColor = pattern.guideColor;
        
        // Create different guides based on pattern type
        switch (patternKey) {
            case 'straightLine':
                this.createStraightLineGuides(guideColor);
                break;
            case 'perimeter':
                this.createPerimeterGuides(guideColor);
                break;
            case 'circular':
                this.createCircularGuides(guideColor);
                break;
            case 'diagonal':
                this.createDiagonalGuides(guideColor);
                break;
            case 'spiral':
                this.createSpiralGuides(guideColor);
                break;
            // Add more pattern guide creators as needed
            default:
                // Default simple guide
                this.createDefaultGuides(guideColor);
                break;
        }
        
        this.patternGuides.active = true;
    }
    
    // Create straight line pattern guides
    createStraightLineGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create parallel lines
        for (let x = -40; x <= 40; x += 10) {
            const points = [
                new THREE.Vector3(x, 0.1, -40),
                new THREE.Vector3(x, 0.1, 40)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            
            this.scene.add(line);
            this.patternGuides.lines.push(line);
        }
    }
    
    // Create perimeter pattern guides
    createPerimeterGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create square perimeter
        const size = 40;
        const points = [
            new THREE.Vector3(-size, 0.1, -size),
            new THREE.Vector3(size, 0.1, -size),
            new THREE.Vector3(size, 0.1, size),
            new THREE.Vector3(-size, 0.1, size),
            new THREE.Vector3(-size, 0.1, -size)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        this.scene.add(line);
        this.patternGuides.lines.push(line);
    }
    
    // Create circular pattern guides
    createCircularGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create concentric circles
        for (let radius = 10; radius <= 40; radius += 10) {
            const curve = new THREE.EllipseCurve(
                0, 0,             // Center x, y
                radius, radius,   // X radius, Y radius
                0, 2 * Math.PI,   // Start angle, end angle
                false,            // Clockwise
                0                 // Rotation
            );
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(
                points.map(p => new THREE.Vector3(p.x, 0.1, p.y))
            );
            
            const circle = new THREE.Line(geometry, material);
            
            this.scene.add(circle);
            this.patternGuides.lines.push(circle);
        }
    }
    
    // Create diagonal pattern guides
    createDiagonalGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create diagonal lines
        for (let offset = -60; offset <= 60; offset += 15) {
            const points = [
                new THREE.Vector3(-40 + offset, 0.1, -40),
                new THREE.Vector3(40 + offset, 0.1, 40)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            
            this.scene.add(line);
            this.patternGuides.lines.push(line);
        }
    }
    
    // Create spiral pattern guides
    createSpiralGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create spiral
        const points = [];
        const turns = 3;
        const pointsPerTurn = 30;
        const totalPoints = turns * pointsPerTurn;
        
        for (let i = 0; i < totalPoints; i++) {
            const angle = (i / pointsPerTurn) * Math.PI * 2;
            const radius = 40 * (1 - i / totalPoints);
            
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const spiral = new THREE.Line(geometry, material);
        
        this.scene.add(spiral);
        this.patternGuides.lines.push(spiral);
    }
    
    // Create default simple guides
    createDefaultGuides(color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        
        // Create a simple square
        const size = 30;
        const points = [
            new THREE.Vector3(-size, 0.1, -size),
            new THREE.Vector3(size, 0.1, -size),
            new THREE.Vector3(size, 0.1, size),
            new THREE.Vector3(-size, 0.1, size),
            new THREE.Vector3(-size, 0.1, -size)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        this.scene.add(line);
        this.patternGuides.lines.push(line);
    }
    
    // Clear pattern guides
    clearPatternGuides() {
        // Remove lines
        this.patternGuides.lines.forEach(line => {
            this.scene.remove(line);
        });
        
        // Remove markers
        this.patternGuides.markers.forEach(marker => {
            this.scene.remove(marker);
        });
        
        this.patternGuides.lines = [];
        this.patternGuides.markers = [];
        this.patternGuides.active = false;
    }
    
    // Update pattern progress based on mower position and grass cutting
    updatePatternProgress(mowerPosition, grassSystem) {
        if (!this.currentPattern) return 0;
        
        // Get the check function for the current pattern
        const checkFunction = this.patterns[this.currentPattern].checkFunction;
        
        // Calculate pattern completion percentage
        this.patternCompletion = checkFunction(mowerPosition, grassSystem);
        
        // Update progress if completion increased
        if (this.patternCompletion > this.patternProgress) {
            this.patternProgress = this.patternCompletion;
        }
        
        return this.patternProgress;
    }
    
    // Get current pattern info
    getCurrentPatternInfo() {
        if (!this.currentPattern) return null;
        
        const pattern = this.patterns[this.currentPattern];
        return {
            name: pattern.name,
            level: pattern.level,
            description: pattern.description,
            progress: this.patternProgress,
            completion: this.patternCompletion
        };
    }
    
    // Get pattern display text
    getPatternDisplayText() {
        if (!this.currentPattern) return "No Pattern";
        
        const pattern = this.patterns[this.currentPattern];
        return `${pattern.name} (${this.patternLevel}/5)`;
    }
    
    // Set pattern level
    setPatternLevel(level) {
        this.patternLevel = level;
    }
    
    // Get random pattern for current level
    getRandomPatternForLevel(level) {
        const levelPatterns = Object.keys(this.patterns).filter(key => 
            this.patterns[key].level === level
        );
        
        if (levelPatterns.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * levelPatterns.length);
        return levelPatterns[randomIndex];
    }
    
    // Pattern check functions
    // These would be more sophisticated in a full implementation
    
    // Check straight line pattern
    checkStraightLinePattern(mowerPosition, grassSystem) {
        // Simplified implementation - check if grass is cut in straight lines
        // In a full implementation, this would analyze the cut grass pattern
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check perimeter pattern
    checkPerimeterPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check obstacle pattern
    checkObstaclePattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check coverage pattern
    checkCoveragePattern(mowerPosition, grassSystem) {
        // Simplified implementation - directly use percentage of grass cut
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check stripe pattern
    checkStripePattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check circular pattern
    checkCircularPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check diagonal pattern
    checkDiagonalPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check section pattern
    checkSectionPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check checkerboard pattern
    checkCheckerboardPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check diamond pattern
    checkDiamondPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check spiral pattern
    checkSpiralPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check contour pattern
    checkContourPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check multi-directional pattern
    checkMultiDirectionalPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check custom pattern
    checkCustomPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check specialty terrain pattern
    checkSpecialtyTerrainPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Check speed-precision pattern
    checkSpeedPrecisionPattern(mowerPosition, grassSystem) {
        // Simplified implementation
        return Math.min(grassSystem.getPercentageCut(), 100);
    }
    
    // Reset pattern system
    reset() {
        this.clearPatternGuides();
        this.currentPattern = null;
        this.patternProgress = 0;
        this.patternCompletion = 0;
    }
}
