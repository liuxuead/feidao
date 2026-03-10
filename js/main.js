document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const sensorBtn = document.getElementById('sensor-btn');
    const levelSelector = document.getElementById('level-selector');
    const weaponSelector = document.getElementById('weapon-selector');
    
    const sensorManager = new GameSensorManager();
    const audioManager = new AudioManager();
    let game = null;
    
    startBtn.addEventListener('click', async () => {
        await audioManager.init();
        audioManager.resume();
        
        levelSelector.classList.remove('hidden');
        weaponSelector.classList.remove('hidden');
        startBtn.classList.add('hidden');
        sensorBtn.classList.remove('hidden');
        
        if (!game) {
            game = new Game(canvas, sensorManager, audioManager);
            await game.loadImages();
        }
    });
    
    sensorBtn.addEventListener('click', async () => {
        try {
            const granted = await sensorManager.requestPermission();
            if (granted !== false) {
                sensorBtn.textContent = '体感已启用';
            }
        } catch (error) {
            console.log('Sensor permission:', error);
            alert('体感功能需要设备支持并授予权限才能使用，您也可以使用鼠标控制游戏。');
        }
    });
    
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            if (game) {
                game.setLevel(level);
            }
        });
    });
    
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const weapon = btn.dataset.weapon;
            if (game) {
                game.setWeapon(weapon);
            }
        });
    });
    
    canvas.addEventListener('click', () => {
        audioManager.resume();
    });
    
    canvas.addEventListener('touchstart', () => {
        audioManager.resume();
    });
});
