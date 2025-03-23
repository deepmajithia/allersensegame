/**
 * Audio system for AllerSense: Mow On!
 * Handles sound effects, engine sounds, and ambient music
 */

class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.engineSound = null;
        this.engineVolume = 0;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.muted = false;
        
        // Initialize audio
        this.initAudio();
    }
    
    // Initialize audio system
    initAudio() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain nodes for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioContext.destination);
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);
        
        // Load sounds
        this.loadSounds();
    }
    
    // Load all game sounds
    loadSounds() {
        // Engine sounds
        this.loadSound('engine_start', 'sounds/engine_start.mp3');
        this.loadSound('engine_idle', 'sounds/engine_idle.mp3', true);
        this.loadSound('engine_running', 'sounds/engine_running.mp3', true);
        this.loadSound('engine_stop', 'sounds/engine_stop.mp3');
        
        // Grass cutting sounds
        this.loadSound('grass_cut', 'sounds/grass_cut.mp3');
        
        // Powerup sounds
        this.loadSound('powerup_collect', 'sounds/powerup_collect.mp3');
        this.loadSound('powerup_use', 'sounds/powerup_use.mp3');
        
        // UI sounds
        this.loadSound('button_click', 'sounds/button_click.mp3');
        this.loadSound('game_start', 'sounds/game_start.mp3');
        this.loadSound('game_over', 'sounds/game_over.mp3');
        this.loadSound('pattern_complete', 'sounds/pattern_complete.mp3');
        
        // Ambient sounds
        this.loadSound('ambient_birds', 'sounds/ambient_birds.mp3', true);
        this.loadSound('ambient_wind', 'sounds/ambient_wind.mp3', true);
        this.loadSound('ambient_rain', 'sounds/ambient_rain.mp3', true);
        
        // Background music
        this.loadSound('music_main', 'sounds/music_main.mp3', true);
    }
    
    // Load a single sound
    loadSound(name, url, loop = false) {
        // In a real implementation, this would load actual sound files
        // For this prototype, we'll create placeholder audio nodes
        
        // Create oscillator for placeholder sounds
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        
        // Set different frequencies based on sound type
        if (name.includes('engine')) {
            oscillator.frequency.value = 100;
        } else if (name.includes('grass')) {
            oscillator.frequency.value = 300;
        } else if (name.includes('powerup')) {
            oscillator.frequency.value = 500;
        } else if (name.includes('button')) {
            oscillator.frequency.value = 200;
        } else if (name.includes('ambient')) {
            oscillator.frequency.value = 150;
        } else if (name.includes('music')) {
            oscillator.frequency.value = 250;
        } else {
            oscillator.frequency.value = 400;
        }
        
        // Create gain node for this sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        oscillator.connect(gainNode);
        
        // Connect to appropriate output
        if (name.includes('music')) {
            gainNode.connect(this.musicGain);
        } else {
            gainNode.connect(this.sfxGain);
        }
        
        // Store sound
        this.sounds[name] = {
            source: oscillator,
            gain: gainNode,
            loop: loop,
            playing: false,
            url: url // Store URL for reference
        };
        
        // Start oscillator (it will be silent until gain is increased)
        oscillator.start();
        
        // Special handling for engine sounds
        if (name === 'engine_idle' || name === 'engine_running') {
            if (name === 'engine_idle') {
                this.engineIdleSound = this.sounds[name];
            } else {
                this.engineRunningSound = this.sounds[name];
            }
        }
        
        // Special handling for music
        if (name === 'music_main') {
            this.music = this.sounds[name];
        }
    }
    
    // Play a sound
    playSound(name) {
        if (this.muted) return;
        
        const sound = this.sounds[name];
        if (!sound) return;
        
        // Reset gain to 0
        sound.gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Fade in
        sound.gain.gain.linearRampToValueAtTime(
            1, 
            this.audioContext.currentTime + 0.1
        );
        
        sound.playing = true;
        
        // If not a looping sound, schedule fade out
        if (!sound.loop) {
            // Duration based on sound type
            let duration = 1;
            if (name.includes('engine_start') || name.includes('engine_stop')) {
                duration = 2;
            } else if (name.includes('powerup')) {
                duration = 0.5;
            } else if (name.includes('button')) {
                duration = 0.2;
            }
            
            // Fade out
            sound.gain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + duration
            );
            
            // Mark as not playing after duration
            setTimeout(() => {
                sound.playing = false;
            }, duration * 1000);
        }
    }
    
    // Stop a sound
    stopSound(name) {
        const sound = this.sounds[name];
        if (!sound || !sound.playing) return;
        
        // Fade out
        sound.gain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.5
        );
        
        sound.playing = false;
    }
    
    // Update engine sound based on state
    updateEngineSound(isEngineOn, speed) {
        if (isEngineOn) {
            // Adjust engine sound based on speed
            if (this.engineIdleSound && this.engineRunningSound) {
                const speedFactor = Math.min(Math.abs(speed) / 5, 1);
                
                // Crossfade between idle and running sounds
                this.engineIdleSound.gain.gain.linearRampToValueAtTime(
                    1 - speedFactor,
                    this.audioContext.currentTime + 0.1
                );
                
                this.engineRunningSound.gain.gain.linearRampToValueAtTime(
                    speedFactor,
                    this.audioContext.currentTime + 0.1
                );
                
                // Adjust pitch based on speed
                this.engineIdleSound.source.frequency.linearRampToValueAtTime(
                    100 + speedFactor * 50,
                    this.audioContext.currentTime + 0.1
                );
                
                this.engineRunningSound.source.frequency.linearRampToValueAtTime(
                    150 + speedFactor * 100,
                    this.audioContext.currentTime + 0.1
                );
            }
        } else {
            // Engine off - silence both sounds
            if (this.engineIdleSound) {
                this.engineIdleSound.gain.gain.linearRampToValueAtTime(
                    0,
                    this.audioContext.currentTime + 0.1
                );
            }
            
            if (this.engineRunningSound) {
                this.engineRunningSound.gain.gain.linearRampToValueAtTime(
                    0,
                    this.audioContext.currentTime + 0.1
                );
            }
        }
    }
    
    // Start engine sound
    startEngine() {
        this.playSound('engine_start');
        
        // After start sound, fade in idle sound
        setTimeout(() => {
            if (this.engineIdleSound) {
                this.engineIdleSound.gain.gain.linearRampToValueAtTime(
                    1,
                    this.audioContext.currentTime + 0.5
                );
                this.engineIdleSound.playing = true;
            }
        }, 500);
    }
    
    // Stop engine sound
    stopEngine() {
        // Fade out engine sounds
        if (this.engineIdleSound) {
            this.engineIdleSound.gain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.2
            );
            this.engineIdleSound.playing = false;
        }
        
        if (this.engineRunningSound) {
            this.engineRunningSound.gain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.2
            );
            this.engineRunningSound.playing = false;
        }
        
        // Play stop sound
        this.playSound('engine_stop');
    }
    
    // Play grass cutting sound
    playGrassCutSound() {
        // Randomize pitch slightly for variety
        const sound = this.sounds['grass_cut'];
        if (sound) {
            sound.source.frequency.value = 300 + Math.random() * 50;
            this.playSound('grass_cut');
        }
    }
    
    // Start background music
    startMusic() {
        if (this.music && !this.music.playing) {
            this.music.gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.music.gain.gain.linearRampToValueAtTime(
                1,
                this.audioContext.currentTime + 2
            );
            this.music.playing = true;
        }
    }
    
    // Stop background music
    stopMusic() {
        if (this.music && this.music.playing) {
            this.music.gain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 1
            );
            this.music.playing = false;
        }
    }
    
    // Update ambient sounds based on weather
    updateAmbientSounds(weather) {
        const birdSound = this.sounds['ambient_birds'];
        const windSound = this.sounds['ambient_wind'];
        const rainSound = this.sounds['ambient_rain'];
        
        if (!birdSound || !windSound || !rainSound) return;
        
        // Adjust volumes based on weather
        switch (weather) {
            case 'sunny':
                birdSound.gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 1);
                windSound.gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1);
                rainSound.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                break;
                
            case 'cloudy':
                birdSound.gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 1);
                windSound.gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 1);
                rainSound.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                break;
                
            case 'rainy':
                birdSound.gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1);
                windSound.gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 1);
                rainSound.gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 1);
                break;
                
            case 'windy':
                birdSound.gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1);
                windSound.gain.gain.linearRampToValueAtTime(0.9, this.audioContext.currentTime + 1);
                rainSound.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                break;
                
            case 'foggy':
                birdSound.gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1);
                windSound.gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1);
                rainSound.gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1);
                break;
        }
        
        // Ensure all ambient sounds are playing
        if (!birdSound.playing) {
            birdSound.playing = true;
        }
        
        if (!windSound.playing) {
            windSound.playing = true;
        }
        
        if (!rainSound.playing) {
            rainSound.playing = true;
        }
    }
    
    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = volume;
        this.masterGain.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.1
        );
    }
    
    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.musicGain.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.1
        );
    }
    
    // Set SFX volume
    setSfxVolume(volume) {
        this.sfxVolume = volume;
        this.sfxGain.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.1
        );
    }
    
    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            this.masterGain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.1
            );
        } else {
            this.masterGain.gain.linearRampToValueAtTime(
                this.masterVolume,
                this.audioContext.currentTime + 0.1
            );
        }
        
        return this.muted;
    }
    
    // Stop all sounds
    stopAllSounds() {
        Object.keys(this.sounds).forEach(name => {
            const sound = this.sounds[name];
            sound.gain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.5
            );
            sound.playing = false;
        });
    }
}
