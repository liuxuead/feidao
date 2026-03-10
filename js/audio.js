class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            await this.loadSounds();
        } catch (error) {
            console.log('Audio initialization failed:', error);
        }
    }

    async loadSounds() {
        const soundFiles = {
            dao1: 'assets/audio/dao1.wav',
            dao2: 'assets/audio/dao2.wav',
            dao3: 'assets/audio/dao3.wav',
            dao4: 'assets/audio/dao4.wav',
            ding1: 'assets/audio/ding1.wav'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                this.sounds[name] = await this.loadAudioFile(path);
            } catch (error) {
                console.log(`Failed to load ${name}:`, error);
            }
        }
    }

    async loadAudioFile(path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = path;
            audio.preload = 'auto';
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
        });
    }

    playSound(name, volume = 1) {
        if (!this.initialized) return;
        
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = volume;
            sound.play().catch(err => console.log('Play sound failed:', err));
        }
    }

    playThrow() {
        const sounds = ['dao1', 'dao2', 'dao3', 'dao4'];
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        this.playSound(randomSound, 0.7);
    }

    playHit() {
        this.playSound('ding1', 0.8);
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
