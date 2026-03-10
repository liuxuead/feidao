const TargetMovementType = {
    NONE: 'NONE',
    LEFT_RIGHT: 'LEFT_RIGHT',
    UP_DOWN: 'UP_DOWN',
    CIRCULAR: 'CIRCULAR'
};

const LevelConfigs = {
    LEVEL_1: {
        name: '第一关',
        backgroundImage: 'assets/images/level1_background.jpg',
        targetImage: 'assets/images/level1_target.png',
        handImage: 'assets/images/level1_hand.png',
        fogImage: 'assets/images/level1_fog.png',
        knifeImage: 'assets/images/level1_knife.png',
        friction: 0.995,
        maxRotationSpeed: 5,
        rotationSpeedMultiplier: 0.3,
        gyroThreshold: 0.5,
        qiDecayRate: 0.9965,
        qiMinThreshold: 30,
        qiMaxThreshold: 100,
        qiShakeIntervalMin: 167,
        qiShakeIntervalMax: 333,
        qiShakeDeviationMax: 150,
        qiStableIncrement: 10.4,
        qiUnstableIncrement: 1.3,
        launchAngleMin: 0,
        launchAngleMax: 90,
        aimSpeedMin: 0.5,
        aimSpeedMax: 3,
        aimAngleRange: 30,
        knifeSpeedMultiplier: 1,
        knifeBaseSpeed: 5,
        knifeSpeedMultiplierFromRotation: 1.5,
        knifeAngleAdjustThreshold: 3,
        knifeMaxAngleAdjustment: 15,
        knifeAngleAdjustCoefficient: 0.3,
        rotationStopThreshold: 0.05,
        powerIncrement: 0.5,
        powerDecrement: 0.5,
        pushThreshold: 8,
        pushDuration: 300,
        minPushPeak: 4,
        targetRadius: 150,
        targetCenterRadius: 50,
        targetMiddleRadius: 100,
        pointsCenter: 10,
        pointsMiddle: 5,
        targetMovement: null,
        nextLevelScore: 20
    },
    LEVEL_2: {
        name: '第二关',
        backgroundImage: 'assets/images/level2_background.jpg',
        targetImage: 'assets/images/level2_target.png',
        handImage: 'assets/images/level1_hand.png',
        fogImage: 'assets/images/level1_fog.png',
        knifeImage: 'assets/images/level1_knife.png',
        friction: 0.995,
        maxRotationSpeed: 7.5,
        rotationSpeedMultiplier: 0.45,
        gyroThreshold: 0.5,
        qiDecayRate: 0.9965,
        qiMinThreshold: 30,
        qiMaxThreshold: 100,
        pushThreshold: 8,
        pushDuration: 300,
        minPushPeak: 4,
        targetRadius: 150,
        targetCenterRadius: 50,
        targetMiddleRadius: 100,
        pointsCenter: 10,
        pointsMiddle: 5,
        knifeSpeedMultiplier: 1,
        targetMovement: null,
        nextLevelScore: 50
    },
    LEVEL_3: {
        name: '第三关',
        backgroundImage: 'assets/images/level3_background.jpg',
        targetImage: 'assets/images/level3_target.png',
        handImage: 'assets/images/level1_hand.png',
        fogImage: 'assets/images/level1_fog.png',
        knifeImage: 'assets/images/level1_knife.png',
        friction: 0.995,
        maxRotationSpeed: 7.5,
        rotationSpeedMultiplier: 0.45,
        gyroThreshold: 0.5,
        qiDecayRate: 0.9965,
        qiMinThreshold: 30,
        qiMaxThreshold: 100,
        pushThreshold: 8,
        pushDuration: 300,
        minPushPeak: 4,
        targetRadius: 150,
        targetCenterRadius: 50,
        targetMiddleRadius: 100,
        pointsCenter: 10,
        pointsMiddle: 5,
        knifeSpeedMultiplier: 1,
        targetMovement: {
            type: TargetMovementType.LEFT_RIGHT,
            speed: 1,
            range: 200
        },
        nextLevelScore: 80
    }
};

const WeaponTypes = {
    DAGGER: 'dagger',
    KNIFE: 'knife',
    SWORD: 'sword',
    DART: 'dart'
};

const WeaponConfigs = {
    dagger: {
        name: '匕首',
        bladeLength: 150,
        bladeWidth: 25,
        handleLength: 50,
        handleWidth: 20,
        speedMultiplier: 1.2,
        damageMultiplier: 1
    },
    knife: {
        name: '飞刀',
        bladeLength: 180,
        bladeWidth: 20,
        handleLength: 60,
        handleWidth: 18,
        speedMultiplier: 1,
        damageMultiplier: 1.2
    },
    sword: {
        name: '短剑',
        bladeLength: 220,
        bladeWidth: 35,
        handleLength: 90,
        handleWidth: 28,
        speedMultiplier: 0.8,
        damageMultiplier: 1.5
    },
    dart: {
        name: '飞镖',
        size: 150,
        bladeWidth: 20,
        speedMultiplier: 1.5,
        damageMultiplier: 0.8
    }
};
