document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const sensorBtn = document.getElementById('sensor-btn');
    const menuSelector = document.getElementById('menu-selector');
    const playBtn = document.getElementById('play-btn');
    
    const sensorManager = new GameSensorManager();
    const audioManager = new AudioManager();
    let game = null;
    let selectedLevel = 1;
    let selectedWeapon = 'knife';
    
    startBtn.addEventListener('click', async () => {
        await audioManager.init();
        audioManager.resume();
        
        menuSelector.classList.remove('hidden');
        startBtn.classList.add('hidden');
        sensorBtn.classList.remove('hidden');
        
        document.querySelector('.level-btn[data-level="1"]').classList.add('selected');
        document.querySelector('.weapon-btn[data-weapon="knife"]').classList.add('selected');
        
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
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLevel = parseInt(btn.dataset.level);
            checkCanPlay();
        });
    });
    
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.weapon-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedWeapon = btn.dataset.weapon;
            checkCanPlay();
        });
    });
    
    function checkCanPlay() {
        if (selectedLevel && selectedWeapon) {
            playBtn.classList.remove('hidden');
        }
    }
    
    playBtn.addEventListener('click', () => {
        if (game) {
            game.setLevel(selectedLevel);
            game.setWeapon(selectedWeapon);
            menuSelector.classList.add('hidden');
            game.start();
        }
    });
    
    canvas.addEventListener('click', () => {
        audioManager.resume();
    });
    
    canvas.addEventListener('touchstart', () => {
        audioManager.resume();
    });
});
