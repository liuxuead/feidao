class Game {
    constructor(canvas, sensorManager, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sensorManager = sensorManager;
        this.audioManager = audioManager;
        
        this.isRunning = false;
        this.currentLevel = 1;
        this.levelConfig = LevelConfigs.LEVEL_1;
        this.currentWeapon = WeaponTypes.KNIFE;
        
        this.score = 0;
        this.qiCharge = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.power = 0;
        
        this.isPushing = false;
        this.isFlying = false;
        this.knife = null;
        this.flyingKnives = [];
        
        this.target = { x: 0, y: 0, offsetX: 0 };
        this.images = {};
        this.imagesLoaded = false;
        
        this.lastShakeTimes = [];
        this.lastGyroTime = 0;
        this.pushStartTime = 0;
        this.pushAccelHistory = [];
        
        this.resize();
        this.setupEventListeners();
    }

    async loadImages() {
        const imagePaths = {
            background: this.levelConfig.backgroundImage,
            target: this.levelConfig.targetImage,
            hand: this.levelConfig.handImage,
            fog: this.levelConfig.fogImage,
            knife: this.levelConfig.knifeImage
        };

        const promises = Object.entries(imagePaths).map(([name, path]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[name] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = path;
            });
        });

        await Promise.all(promises);
        this.imagesLoaded = true;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.target.x = this.canvas.width / 2;
        this.target.y = this.canvas.height * 0.25;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        });
    }

    handleClick(e) {
        this.qiCharge = Math.min(this.qiCharge + 20, 100);
        if (this.qiCharge >= 30) {
            this.launchKnife();
        }
    }

    setLevel(levelNum) {
        const levels = [LevelConfigs.LEVEL_1, LevelConfigs.LEVEL_2, LevelConfigs.LEVEL_3];
        this.currentLevel = levelNum;
        this.levelConfig = levels[levelNum - 1];
        this.imagesLoaded = false;
        this.loadImages();
        this.target.offsetX = 0;
    }

    setWeapon(weaponType) {
        this.currentWeapon = weaponType;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.sensorManager.startListening();
        this.sensorManager.onSensorUpdate = (gyro, accel) => this.updateSensorData(gyro, accel);
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
        this.sensorManager.stopListening();
    }

    updateSensorData(gyro, accel) {
        const config = this.levelConfig;
        
        const gyroZ = gyro.z || 0;
        if (Math.abs(gyroZ) > config.gyroThreshold) {
            this.rotationSpeed += gyroZ * config.rotationSpeedMultiplier;
        }
        
        this.rotationSpeed = Math.max(-config.maxRotationSpeed, 
            Math.min(config.maxRotationSpeed, this.rotationSpeed));
        
        this.rotation += this.rotationSpeed;
        this.rotationSpeed *= config.friction;
        
        if (Math.abs(this.rotationSpeed) < config.rotationStopThreshold) {
            this.rotationSpeed = 0;
        }
        
        this.updateQiCharge(gyroZ);
        this.updatePushDetection(accel);
    }

    updateQiCharge(gyroZ) {
        const config = this.levelConfig;
        const currentTime = Date.now();
        
        if (Math.abs(gyroZ) > 0.3) {
            if (currentTime - this.lastGyroTime > config.qiShakeIntervalMin) {
                this.lastShakeTimes.push(currentTime);
                
                while (this.lastShakeTimes.length > 0 && 
                       currentTime - this.lastShakeTimes[0] > 1000) {
                    this.lastShakeTimes.shift();
                }
                
                if (this.lastShakeTimes.length >= 2) {
                    let isStable = true;
                    for (let i = 1; i < this.lastShakeTimes.length; i++) {
                        const interval = this.lastShakeTimes[i] - this.lastShakeTimes[i - 1];
                        if (interval < config.qiShakeIntervalMin || 
                            interval > config.qiShakeIntervalMax) {
                            isStable = false;
                            break;
                        }
                    }
                    
                    if (isStable) {
                        this.qiCharge = Math.min(this.qiCharge + config.qiStableIncrement, 
                            config.qiMaxThreshold);
                    } else {
                        this.qiCharge = Math.min(this.qiCharge + config.qiUnstableIncrement, 
                            config.qiMaxThreshold);
                    }
                }
            }
            this.lastGyroTime = currentTime;
        }
        
        this.qiCharge *= config.qiDecayRate;
        this.qiCharge = Math.max(0, this.qiCharge);
    }

    updatePushDetection(accel) {
        const config = this.levelConfig;
        const accelMag = Math.sqrt(
            (accel.x || 0) ** 2 + 
            (accel.y || 0) ** 2 + 
            (accel.z || 0) ** 2
        );
        
        this.pushAccelHistory.push(accelMag);
        if (this.pushAccelHistory.length > 10) {
            this.pushAccelHistory.shift();
        }
        
        const avgAccel = this.pushAccelHistory.reduce((a, b) => a + b, 0) / 
            this.pushAccelHistory.length;
        
        if (!this.isPushing && avgAccel > config.pushThreshold && !this.isFlying) {
            this.isPushing = true;
            this.pushStartTime = Date.now();
        }
        
        if (this.isPushing) {
            this.power += config.powerIncrement;
            
            if (Date.now() - this.pushStartTime > config.pushDuration) {
                if (this.power > config.minPushPeak && this.qiCharge >= config.qiMinThreshold) {
                    this.launchKnife();
                }
                this.isPushing = false;
                this.power = 0;
            }
        } else {
            this.power = Math.max(0, this.power - config.powerDecrement);
        }
    }

    launchKnife() {
        if (this.isFlying) return;
        
        const config = this.levelConfig;
        const weaponConfig = WeaponConfigs[this.currentWeapon];
        
        this.isFlying = true;
        this.audioManager.playThrow();
        
        const launchAngle = -this.rotation * Math.PI / 180 - Math.PI / 2;
        const speed = (config.knifeBaseSpeed + Math.abs(this.rotationSpeed) * 
            config.knifeSpeedMultiplierFromRotation) * 
            config.knifeSpeedMultiplier * weaponConfig.speedMultiplier;
        
        let angleAdjustment = 0;
        if (Math.abs(this.rotationSpeed) > config.knifeAngleAdjustThreshold) {
            angleAdjustment = Math.sign(this.rotationSpeed) * 
                Math.min(Math.abs(this.rotationSpeed) * config.knifeAngleAdjustCoefficient, 
                config.knifeMaxAngleAdjustment);
        }
        
        const finalAngle = launchAngle + angleAdjustment * Math.PI / 180;
        
        this.knife = {
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.7,
            vx: Math.cos(finalAngle) * speed,
            vy: Math.sin(finalAngle) * speed,
            rotation: this.rotation,
            rotationSpeed: this.rotationSpeed * 0.5,
            weapon: this.currentWeapon
        };
        
        this.qiCharge = 0;
        this.rotationSpeed *= 0.5;
    }

    update() {
        if (!this.isRunning) return;
        
        const config = this.levelConfig;
        
        if (config.targetMovement) {
            const time = Date.now() / 1000;
            switch (config.targetMovement.type) {
                case TargetMovementType.LEFT_RIGHT:
                    this.target.offsetX = Math.sin(time * config.targetMovement.speed) * 
                        config.targetMovement.range;
                    break;
                case TargetMovementType.UP_DOWN:
                    break;
                case TargetMovementType.CIRCULAR:
                    break;
            }
        }
        
        if (this.knife) {
            this.knife.x += this.knife.vx;
            this.knife.y += this.knife.vy;
            this.knife.rotation += this.knife.rotationSpeed;
            this.knife.vy += 0.1;
            
            const targetX = this.target.x + this.target.offsetX;
            const targetY = this.target.y;
            const dx = this.knife.x - targetX;
            const dy = this.knife.y - targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.targetRadius) {
                this.audioManager.playHit();
                
                if (distance < config.targetCenterRadius) {
                    this.score += config.pointsCenter;
                } else if (distance < config.targetMiddleRadius) {
                    this.score += config.pointsMiddle;
                }
                
                this.flyingKnives.push({ ...this.knife, stuck: true });
                this.knife = null;
                this.isFlying = false;
                
                if (this.score >= config.nextLevelScore && this.currentLevel < 3) {
                    this.setLevel(this.currentLevel + 1);
                }
            } else if (this.knife.y > this.canvas.height + 100 || 
                       this.knife.x < -100 || this.knife.x > this.canvas.width + 100) {
                this.knife = null;
                this.isFlying = false;
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const config = this.levelConfig;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.imagesLoaded) {
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('加载中...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        if (this.images.background) {
            ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.images.fog) {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(this.images.fog, 0, 0, this.canvas.width, this.canvas.height);
            ctx.globalAlpha = 1;
        }
        
        const targetX = this.target.x + this.target.offsetX;
        const targetY = this.target.y;
        
        if (this.images.target) {
            const targetSize = config.targetRadius * 2;
            ctx.drawImage(this.images.target, 
                targetX - targetSize / 2, targetY - targetSize / 2, 
                targetSize, targetSize);
        }
        
        this.flyingKnives.forEach(knife => {
            this.drawWeapon(knife.x, knife.y, knife.rotation, knife.weapon);
        });
        
        if (this.knife) {
            this.drawWeapon(this.knife.x, this.knife.y, this.knife.rotation, this.knife.weapon);
        } else {
            const handX = this.canvas.width / 2;
            const handY = this.canvas.height * 0.7;
            
            if (this.images.hand) {
                ctx.save();
                ctx.translate(handX, handY);
                ctx.rotate(this.rotation * Math.PI / 180);
                const handSize = 150;
                ctx.drawImage(this.images.hand, -handSize / 2, -handSize / 2, handSize, handSize);
                ctx.restore();
            }
            
            this.drawQiBar(handX, handY + 100);
        }
        
        this.updateUI();
    }

    drawWeapon(x, y, rotation, weaponType) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        
        switch (weaponType) {
            case WeaponTypes.DAGGER:
                this.drawDagger(ctx);
                break;
            case WeaponTypes.KNIFE:
                this.drawKnife(ctx);
                break;
            case WeaponTypes.SWORD:
                this.drawSword(ctx);
                break;
            case WeaponTypes.DART:
                this.drawDart(ctx);
                break;
            default:
                this.drawKnife(ctx);
        }
        
        ctx.restore();
    }

    drawDagger(ctx) {
        const bladeLength = 150;
        const bladeWidth = 25;
        const handleLength = 50;
        const handleWidth = 20;
        
        ctx.fillStyle = '#78909C';
        ctx.beginPath();
        ctx.moveTo(0, -bladeLength);
        ctx.lineTo(bladeWidth / 2, 15);
        ctx.lineTo(0, 25);
        ctx.lineTo(-bladeWidth / 2, 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#424242';
        ctx.fillRect(-handleWidth / 2, 25, handleWidth, handleLength);
    }

    drawKnife(ctx) {
        const bladeLength = 180;
        const bladeWidth = 20;
        const handleLength = 60;
        const handleWidth = 18;
        
        const gradient = ctx.createLinearGradient(0, -bladeLength, 0, 25);
        gradient.addColorStop(0, '#B0BEC5');
        gradient.addColorStop(0.5, '#78909C');
        gradient.addColorStop(1, '#546E7A');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -bladeLength);
        ctx.lineTo(bladeWidth / 2, 15);
        ctx.lineTo(0, 25);
        ctx.lineTo(-bladeWidth / 2, 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#424242';
        ctx.fillRect(-handleWidth / 2, 25, handleWidth, handleLength);
    }

    drawSword(ctx) {
        const bladeLength = 220;
        const bladeWidth = 35;
        const handleLength = 90;
        const handleWidth = 28;
        
        const gradient = ctx.createLinearGradient(0, -bladeLength, 0, 20);
        gradient.addColorStop(0, '#CFD8DC');
        gradient.addColorStop(0.5, '#90A4AE');
        gradient.addColorStop(1, '#607D8B');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -bladeLength);
        ctx.lineTo(bladeWidth / 2, 10);
        ctx.lineTo(0, 20);
        ctx.lineTo(-bladeWidth / 2, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-handleWidth, 10);
        ctx.lineTo(handleWidth, 10);
        ctx.stroke();
        
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(-handleWidth / 2, 20, handleWidth, handleLength);
    }

    drawDart(ctx) {
        const size = 150;
        const bladeWidth = 20;
        
        for (let i = 0; i < 4; i++) {
            const angle = i * 90 * Math.PI / 180;
            ctx.save();
            ctx.rotate(angle);
            
            if (i === 0) {
                const gradient = ctx.createLinearGradient(0, -size / 2, 0, 0);
                gradient.addColorStop(0, '#FF5252');
                gradient.addColorStop(1, '#D32F2F');
                ctx.fillStyle = gradient;
            } else {
                const gradient = ctx.createLinearGradient(0, -size / 2, 0, 0);
                gradient.addColorStop(0, '#B0BEC5');
                gradient.addColorStop(1, '#607D8B');
                ctx.fillStyle = gradient;
            }
            
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(bladeWidth / 2, -25);
            ctx.lineTo(-bladeWidth / 2, -25);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    drawQiBar(x, y) {
        const ctx = this.ctx;
        const barWidth = 200;
        const barHeight = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
        
        const qiPercent = this.qiCharge / 100;
        const gradient = ctx.createLinearGradient(
            x - barWidth / 2, y, 
            x - barWidth / 2 + barWidth * qiPercent, y
        );
        gradient.addColorStop(0, '#FF5722');
        gradient.addColorStop(1, '#FFC107');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - barWidth / 2, y, barWidth * qiPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('qi').textContent = Math.round(this.qiCharge);
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}
