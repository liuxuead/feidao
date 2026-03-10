class GameSensorManager {
    constructor() {
        this.gyroscopeData = { x: 0, y: 0, z: 0 };
        this.accelerometerData = { x: 0, y: 0, z: 0 };
        this.accumulatedAngle = 0;
        this.lastGyroTime = 0;
        this.angleDecayRate = 0.95;
        this.isListening = false;
        this.onSensorUpdate = null;
    }

    async requestPermission() {
        return new Promise((resolve, reject) => {
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            resolve(true);
                        } else {
                            reject('Permission denied');
                        }
                    })
                    .catch(err => {
                        console.log('Sensor permission not required or not available');
                        resolve(false);
                    });
            } else {
                resolve(true);
            }
        });
    }

    startListening() {
        if (this.isListening) return;

        this.isListening = true;

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        }

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this.handleMotion.bind(this));
        }

        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    stopListening() {
        this.isListening = false;
        window.removeEventListener('deviceorientation', this.handleOrientation.bind(this));
        window.removeEventListener('devicemotion', this.handleMotion.bind(this));
        window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleOrientation(event) {
        if (event.gamma !== null && event.gamma !== undefined) {
            const gamma = event.gamma;
            const gyroZ = (gamma * Math.PI / 180) * 2;
            this.gyroscopeData.z = gyroZ;
            
            const currentTime = Date.now();
            if (this.lastGyroTime > 0) {
                const deltaTime = (currentTime - this.lastGyroTime) / 1000;
                const angleChange = gyroZ * deltaTime;
                this.accumulatedAngle += angleChange;
            }
            this.lastGyroTime = currentTime;
            
            this.accumulatedAngle *= this.angleDecayRate;
        }
        
        this.notifyUpdate();
    }

    handleMotion(event) {
        if (event.accelerationIncludingGravity) {
            this.accelerometerData.x = event.accelerationIncludingGravity.x || 0;
            this.accelerometerData.y = event.accelerationIncludingGravity.y || 0;
            this.accelerometerData.z = event.accelerationIncludingGravity.z || 0;
        }
        
        if (event.rotationRate) {
            this.gyroscopeData.x = event.rotationRate.alpha || 0;
            this.gyroscopeData.y = event.rotationRate.beta || 0;
            this.gyroscopeData.z = event.rotationRate.gamma || 0;
        }
        
        this.notifyUpdate();
    }

    handleMouseMove(event) {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const mouseX = event.clientX - rect.left;
        
        const normalizedX = (mouseX - centerX) / centerX;
        this.gyroscopeData.z = normalizedX * 0.5;
        
        const currentTime = Date.now();
        if (this.lastGyroTime > 0) {
            const deltaTime = (currentTime - this.lastGyroTime) / 1000;
            const angleChange = this.gyroscopeData.z * deltaTime * 10;
            this.accumulatedAngle += angleChange;
        }
        this.lastGyroTime = currentTime;
        this.accumulatedAngle *= this.angleDecayRate;
        
        this.notifyUpdate();
    }

    notifyUpdate() {
        if (this.onSensorUpdate && typeof this.onSensorUpdate === 'function') {
            this.onSensorUpdate(this.gyroscopeData, this.accelerometerData);
        }
    }

    getShakeAngle() {
        return Math.abs(this.accumulatedAngle);
    }

    getShakeAngleWithDirection() {
        return this.accumulatedAngle;
    }
}
