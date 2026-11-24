// ============================================================================
// S.N.A.X. ARCADE: SAUCE BLASTER 3D (SHOOTER MÓVIL + PC)
// - En Celular/Táctil: Mira centrada libre de dedos; deslizar gira la cámara
//   con amplio rango en todas las direcciones y alta sensibilidad + botón FUEGO.
// - En PC/Mouse: Apuntado directo con cursor + clic izquierdo.
// ============================================================================

const DEFAULT_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbylvNCwAIEdpA9eZVyysRwldPQSklgHcyywPIHVqB6qkPGu5IlngXCgEqCtazrA5FP3/exec";

function getSheetsWebAppUrl() {
    return localStorage.getItem('snax_sheets_url') || DEFAULT_SHEETS_WEBAPP_URL;
}

// --- Web Audio API Synthesizer ---
let soundEnabled = true;
let audioCtx = null;
let bgmInterval = null;
let bgmStep = 0;

const BGM_LEAD = [
    329.63, 0, 392.00, 440.00,
    493.88, 0, 440.00, 392.00,
    329.63, 493.88, 587.33, 493.88,
    440.00, 392.00, 329.63, 0
];
const BGM_BASS = [
    82.41, 82.41, 110.00, 110.00,
    123.47, 123.47, 98.00, 98.00,
    82.41, 82.41, 146.83, 146.83,
    110.00, 98.00, 82.41, 0
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function startBGM() {
    stopBGM();
    if (!soundEnabled) return;
    initAudio();
    bgmStep = 0;
    bgmInterval = setInterval(() => {
        if (!soundEnabled || gameState !== 'PLAYING' || !audioCtx) return;
        const now = audioCtx.currentTime;
        const lead = BGM_LEAD[bgmStep % BGM_LEAD.length];
        const bass = BGM_BASS[bgmStep % BGM_BASS.length];

        if (lead > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(lead, now);
            gain.gain.setValueAtTime(0.022, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.14);
        }
        if (bass > 0) {
            const oscB = audioCtx.createOscillator();
            const gainB = audioCtx.createGain();
            oscB.type = 'triangle';
            oscB.frequency.setValueAtTime(bass, now);
            gainB.gain.setValueAtTime(0.045, now);
            gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            oscB.connect(gainB);
            gainB.connect(audioCtx.destination);
            oscB.start(now);
            oscB.stop(now + 0.15);
        }
        bgmStep++;
    }, 165);
}

function stopBGM() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'shoot_atomic') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
    } else if (type === 'shoot_mango') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'shoot_bbq') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.16);
        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'shoot_ranch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
    } else if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.setValueAtTime(620, now + 0.04);
        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'hit_crit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(784, now);
        osc.frequency.setValueAtTime(1046.5, now + 0.05);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
    } else if (type === 'kill') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(880, now + 0.10);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'damage') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(42, now + 0.30);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.30);
        osc.start(now);
        osc.stop(now + 0.30);
    } else if (type === 'reward') {
        osc.type = 'square';
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const times = [0, 0.08, 0.16, 0.24, 0.34, 0.42];
        notes.forEach((f, i) => osc.frequency.setValueAtTime(f, now + times[i]));
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.60);
        osc.start(now);
        osc.stop(now + 0.60);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(175, now + 0.20);
        osc.frequency.linearRampToValueAtTime(55, now + 0.65);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
    }
}

// --- Arsenal de Salsas S.N.A.X. (Mira 100% estable sin retroceso) ---
const WEAPONS = [
    {
        id: 'atomic',
        name: 'ATOMIC',
        key: '1',
        hex: 0xef4444,
        cssHex: '#ef4444',
        cooldown: 0.16,
        speed: 62,
        damage: 28,
        spread: 0.012,
        count: 1,
        splash: 0,
        sound: 'shoot_atomic',
        desc: 'Ráfaga continua rápida para derretir objetivos veloces.'
    },
    {
        id: 'mango',
        name: 'MANGO HAB.',
        key: '2',
        hex: 0xf97316,
        cssHex: '#f97316',
        cooldown: 0.36,
        speed: 50,
        damage: 44,
        spread: 0.008,
        count: 1,
        splash: 3.6,
        sound: 'shoot_mango',
        desc: 'Proyectil explosivo pesado con daño de área.'
    },
    {
        id: 'bbq',
        name: 'BBQ',
        key: '3',
        hex: 0xd97706,
        cssHex: '#d97706',
        cooldown: 0.34,
        speed: 54,
        damage: 24,
        spread: 0.085,
        count: 3,
        splash: 0,
        sound: 'shoot_bbq',
        desc: 'Escopeta de 3 chorros devastadora a corta distancia.'
    },
    {
        id: 'ranch',
        name: 'RANCH / LIMÓN',
        key: '4',
        hex: 0x22c55e,
        cssHex: '#22c55e',
        cooldown: 0.25,
        speed: 78,
        damage: 50,
        spread: 0.003,
        count: 1,
        splash: 0,
        sound: 'shoot_ranch',
        desc: 'Disparo láser preciso de alta velocidad y alto impacto.'
    }
];

// --- Premios Oficiales S.N.A.X. ---
const REWARD_TIERS = [
    {
        id: 'disc10',
        points: 3000,
        title: '10% DE DESCUENTO',
        shortLabel: '10% OFF',
        code: 'SNAX10',
        desc: 'En tu próximo pedido de alitas o boneless'
    },
    {
        id: 'freefries',
        points: 6000,
        title: 'PAPAS FRANCESAS O GAJO GRATIS',
        shortLabel: 'PAPAS GRATIS',
        code: 'PAPAS8BIT',
        desc: 'Orden de papas francesas o gajo gratis en tu combo'
    },
    {
        id: 'extrapcs',
        points: 9500,
        title: '+3 PIEZAS EXTRA GRATIS',
        shortLabel: '+3 PIEZAS',
        code: '3EXTRAS',
        desc: '3 alitas o boneless extra gratis en tu orden'
    },
    {
        id: 'grandwings',
        points: 22000,
        title: '🔥 ORDEN DE ALITAS GRANDES GRATIS',
        shortLabel: 'ALITAS GRANDES',
        code: 'ALITASGRATIS',
        desc: 'PREMIO MAYOR • Orden grande de alitas bañadas en tu salsa favorita',
        isGrandPrize: true
    }
];

// --- Referencias DOM ---
const startScreen = document.getElementById('start-screen');
const gameArena = document.getElementById('game-arena');
const gameCanvas = document.getElementById('game-canvas');
const damageVignette = document.getElementById('damage-vignette');

const loginBox = document.getElementById('login-box');
const lockedPlayerBanner = document.getElementById('locked-player-banner');
const lockedPlayerDisplay = document.getElementById('locked-player-display');
const playerNameInput = document.getElementById('player-name-input');
const loginErrorMsg = document.getElementById('login-error-msg');
const sheetsStatusPill = document.getElementById('sheets-status-pill');

const startBtn = document.getElementById('start-btn');
const forceLandscapeBtn = document.getElementById('force-landscape-btn');
const soundToggleStartBtn = document.getElementById('sound-toggle-start');

const waveBadgeEl = document.getElementById('wave-badge');
const comboBadgeEl = document.getElementById('combo-badge');
const scoreValEl = document.getElementById('score-val');
const streakValEl = document.getElementById('streak-val');
const livesContainerEl = document.getElementById('lives-container');
const pauseBtn = document.getElementById('pause-btn');

const crosshairEl = document.getElementById('crosshair');
const crosshairRingEl = document.getElementById('crosshair-ring');
const crosshairDotEl = document.getElementById('crosshair-dot');
const crosshairSauceTagEl = document.getElementById('crosshair-sauce-tag');
const mobileAimHintEl = document.getElementById('mobile-aim-hint');
const mobileFireBtn = document.getElementById('mobile-fire-btn');
const popupContainer = document.getElementById('popup-container');

const rotateDrumBtn = document.getElementById('rotate-drum-btn');
const sauceDrumSlotsEl = document.getElementById('sauce-drum-slots');

const pauseScreen = document.getElementById('pause-screen');
const pauseSummaryEl = document.getElementById('pause-summary');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseSoundBtn = document.getElementById('pause-sound-btn');
const exitMenuBtn = document.getElementById('exit-menu-btn');

const gameOverScreen = document.getElementById('gameover-screen');
const finalCommentEl = document.getElementById('final-comment');
const finalPlayerNameEl = document.getElementById('final-player-name');
const finalScoreEl = document.getElementById('final-score');
const highscoreValEl = document.getElementById('highscore-val');
const finalRankProfileEl = document.getElementById('final-rank-profile');
const startHighscoreEl = document.getElementById('start-highscore');

const unlockedCouponBox = document.getElementById('unlocked-coupon-box');
const noCouponHint = document.getElementById('no-coupon-hint');
const couponTitleEl = document.getElementById('coupon-title');
const couponDescEl = document.getElementById('coupon-desc');
const couponCodeTextEl = document.getElementById('coupon-code-text');
const copyCouponBtn = document.getElementById('copy-coupon-btn');
const allUnlockedBadgesEl = document.getElementById('all-unlocked-badges');
const restartBtn = document.getElementById('restart-btn');
const gameOverMenuBtn = document.getElementById('gameover-menu-btn');

const rewardToast = document.getElementById('reward-toast');
const rewardToastTitle = document.getElementById('reward-toast-title');
const rewardToastCode = document.getElementById('reward-toast-code');

const openGuideBtn = document.getElementById('open-guide-btn');
const closeGuideBtn = document.getElementById('close-guide-btn');
const guideModal = document.getElementById('guide-modal');

const openRewardsBtn = document.getElementById('open-rewards-btn');
const closeRewardsBtn = document.getElementById('close-rewards-btn');
const rewardsModal = document.getElementById('rewards-modal');
const rewardsCatalogList = document.getElementById('rewards-catalog-list');

// --- Estado General ---
let gameState = 'START';
let currentWeaponIndex = 0;
let fireCooldown = 0;
let isFiring = false;
let isTouchControlMode = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

let score = 0;
let lives = 3;
let streak = 0;
let maxStreak = 0;
let enemiesDefeated = 0;
let shotsFired = 0;
let shotsHit = 0;
let wave = 1;
let enemiesSpawnedInWave = 0;
let enemiesPerWave = 9;
let spawnTimer = 0;

let currentPlayerName = (localStorage.getItem('snax_player_name') || '').trim();
let highscore = parseInt(localStorage.getItem('snax_blaster3d_highscore') || '0', 10);
let unlockedRewardsThisRun = [];
let rewardToastTimeout = null;

// --- Variables Three.js ---
let scene, camera, renderer, raycaster;
let weaponGroup, drumGroup, muzzleLight, muzzleFlashMesh;
let fryerBubbles = [];
let neonStrips = [];
let enemies = [];
let projectiles = [];
let particles = [];

let aimWorldPoint = new THREE.Vector3(0, 1.5, -12);
let camYaw = 0;
let camPitch = -0.09;

// Configuración de Sensibilidad y Rango Libre de Cámara Táctil
const TOUCH_LOOK_SENSITIVITY = 0.0052;
const MAX_CAM_YAW = 1.35;      // ~77° hacia izquierda y derecha (>154° panorámico libre)
const MIN_CAM_PITCH = -0.65;   // Mirar hacia abajo hasta el mostrador
const MAX_CAM_PITCH = 0.55;    // Mirar libremente hacia arriba

let weaponKickZ = 0;
let targetDrumAngle = 0;
let currentDrumAngle = 0;
let animFrameId = null;
let lastFrameTime = 0;

// --- Orientación Horizontal en Móvil ---
async function requestLandscapeMode() {
    try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
        }
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape').catch(() => {});
        }
    } catch (_) {}
}
forceLandscapeBtn.addEventListener('click', requestLandscapeMode);

// --- Inicialización de Login y Modales ---
function syncPlayerLoginUI() {
    if (currentPlayerName) {
        loginBox.classList.add('hidden');
        playerNameInput.value = currentPlayerName;
        playerNameInput.disabled = true;
        lockedPlayerDisplay.textContent = currentPlayerName.toUpperCase();
        lockedPlayerBanner.classList.remove('hidden');
    } else {
        loginBox.classList.remove('hidden');
        playerNameInput.disabled = false;
        lockedPlayerBanner.classList.add('hidden');
    }
}
syncPlayerLoginUI();
startHighscoreEl.textContent = highscore;

function syncSheetsStatusUI() {
    const url = getSheetsWebAppUrl();
    if (url && url.startsWith('http')) {
        sheetsStatusPill.textContent = 'CONECTADO';
    } else {
        sheetsStatusPill.textContent = 'MODO LOCAL';
    }
}
syncSheetsStatusUI();

async function sendToGoogleSheets(payload) {
    const url = getSheetsWebAppUrl();
    if (!url || !url.startsWith('http')) return;
    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn('Error al enviar a Google Sheets:', err);
    }
}

function buildCatalogModals() {
    const arsenalGrid = document.getElementById('arsenal-guide-grid');
    arsenalGrid.innerHTML = '';
    WEAPONS.forEach(w => {
        const card = document.createElement('div');
        card.className = 'bg-black/75 border border-slate-700 rounded-lg p-2.5 flex items-start gap-2.5';
        card.innerHTML = `
            <span class="w-4 h-4 rounded-full shrink-0 mt-0.5 border border-white" style="background:${w.cssHex}"></span>
            <div>
                <div class="pixel-font text-[9px] text-white">[${w.key}] ${w.name}</div>
                <div class="text-xs text-gray-300 leading-snug mt-0.5">${w.desc}</div>
            </div>
        `;
        arsenalGrid.appendChild(card);
    });

    rewardsCatalogList.innerHTML = '';
    REWARD_TIERS.forEach(tier => {
        const card = document.createElement('div');
        card.className = tier.isGrandPrize
            ? 'bg-gradient-to-r from-red-950 to-amber-950 border-2 border-yellow-400 rounded-lg p-2.5 flex items-center justify-between gap-2'
            : 'bg-gray-900 border border-amber-500/50 rounded-lg p-2.5 flex items-center justify-between gap-2';
        card.innerHTML = `
            <div>
                <div class="pixel-font text-[8px] text-amber-400">${tier.points.toLocaleString()} PTS</div>
                <div class="pixel-font text-[9px] text-white mt-0.5">${tier.title}</div>
                <div class="text-[11px] text-gray-300 leading-tight mt-0.5">${tier.desc}</div>
            </div>
            <span class="pixel-font text-[8px] bg-black border border-yellow-400 text-yellow-400 px-2 py-1 rounded shrink-0">${tier.code}</span>
        `;
        rewardsCatalogList.appendChild(card);
    });
}
buildCatalogModals();

// --- Tambor Giratorio de Salsas ---
function buildWeaponDrumUI() {
    sauceDrumSlotsEl.innerHTML = '';
    WEAPONS.forEach((w, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.idx = String(idx);
        btn.className = `drum-slot px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border-2 flex items-center gap-1 sm:gap-1.5 bg-zinc-900/95 shrink-0 ${idx === currentWeaponIndex ? 'active border-white shadow-lg' : 'border-zinc-700 opacity-75'}`;
        btn.innerHTML = `
            <span class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white shrink-0" style="background:${w.cssHex}"></span>
            <span class="pixel-font text-[7px] sm:text-[8px] text-white">${w.name}</span>
            <span class="pixel-font text-[8px] text-yellow-300 hidden md:inline">[${w.key}]</span>
        `;
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            selectWeapon(idx);
        });
        sauceDrumSlotsEl.appendChild(btn);
    });
}

function selectWeapon(idx) {
    const newIndex = ((idx % WEAPONS.length) + WEAPONS.length) % WEAPONS.length;
    if (newIndex !== currentWeaponIndex) {
        currentWeaponIndex = newIndex;
        targetDrumAngle = -currentWeaponIndex * (Math.PI / 2);
        playSound('switch');
    }
    const w = WEAPONS[currentWeaponIndex];
    crosshairRingEl.style.borderColor = w.cssHex;
    crosshairRingEl.style.boxShadow = `0 0 12px ${w.cssHex}`;
    crosshairDotEl.style.backgroundColor = w.cssHex;
    crosshairSauceTagEl.textContent = w.name;
    crosshairSauceTagEl.style.borderColor = w.cssHex;

    if (muzzleFlashMesh) {
        muzzleFlashMesh.material.color.setHex(w.hex);
        muzzleLight.color.setHex(w.hex);
    }
    buildWeaponDrumUI();
}

function rotateWeaponDrum(dir = 1) {
    selectWeapon(currentWeaponIndex + dir);
}
rotateDrumBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    rotateWeaponDrum(1);
});

// --- Texturas Procedurales para el Spot 3D de Cocina S.N.A.X. ---
function createCheckeredFloorTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#181c28';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#262c3d';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillRect(128, 128, 128, 128);
    ctx.strokeStyle = '#0f121a';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(128, 128, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 18);
    return tex;
}

function createTileWallTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#141926';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#242d42';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 4);
    return tex;
}

function createSnaxSignTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#090b12';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 46px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S.N.A.X. KITCHEN', 256, 64);
    return new THREE.CanvasTexture(c);
}

// --- Inicialización de Escena 3D ---
function initThreeScene() {
    if (renderer) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090c14);
    scene.fog = new THREE.FogExp2(0x090c14, 0.020);

    camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3.35, 8.6);
    camera.rotation.order = 'YXZ';
    camera.rotation.x = -0.09;

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const hemiLight = new THREE.HemisphereLight(0xfff1d6, 0x1e293b, 0.90);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.15);
    dirLight.position.set(5, 11, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 42;
    const d = 14;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const leftNeonLight = new THREE.PointLight(0xef4444, 1.4, 22);
    leftNeonLight.position.set(-7.5, 4.2, -6);
    scene.add(leftNeonLight);

    const rightNeonLight = new THREE.PointLight(0xf59e0b, 1.4, 22);
    rightNeonLight.position.set(7.5, 4.2, -6);
    scene.add(rightNeonLight);

    const floorMat = new THREE.MeshStandardMaterial({
        map: createCheckeredFloorTexture(),
        roughness: 0.35,
        metalness: 0.15
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 42), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -10;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({
        map: createTileWallTexture(),
        roughness: 0.45,
        metalness: 0.1
    });

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 42), wallMat);
    leftWall.position.set(-10.5, 4, -10);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 42), wallMat);
    rightWall.position.set(10.5, 4, -10);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 0.6), wallMat);
    backWall.position.set(0, 4, -27);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const neonRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const neonYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    [-10.15, 10.15].forEach(xPos => {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 38), neonRedMat);
        strip.position.set(xPos, 3.6, -10);
        scene.add(strip);
        neonStrips.push(strip);
    });

    const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(9.2, 2.2, 0.3),
        new THREE.MeshBasicMaterial({ map: createSnaxSignTexture() })
    );
    signBoard.position.set(0, 5.4, -26.5);
    scene.add(signBoard);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(14, 1.4, 26), steelMat);
    hood.position.set(0, 7.6, -12);
    scene.add(hood);

    [-16, -6, 3].forEach(zPos => {
        const lampShade = new THREE.Mesh(
            new THREE.ConeGeometry(0.75, 0.55, 16),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
        );
        lampShade.position.set(0, 6.6, zPos);
        scene.add(lampShade);

        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        bulb.position.set(0, 6.3, zPos);
        scene.add(bulb);
    });

    const oilMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    [-8.4, 8.4].forEach(xPos => {
        [-15, -7, 1].forEach(zPos => {
            const fryerBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 3.4), steelMat);
            fryerBody.position.set(xPos, 0.9, zPos);
            fryerBody.castShadow = true;
            fryerBody.receiveShadow = true;
            scene.add(fryerBody);

            const oilPool = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.8), oilMat);
            oilPool.rotation.x = -Math.PI / 2;
            oilPool.position.set(xPos, 1.82, zPos);
            scene.add(oilPool);

            for (let b = 0; b < 4; b++) {
                const bubble = new THREE.Mesh(
                    new THREE.SphereGeometry(0.11, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0xfef08a })
                );
                bubble.position.set(
                    xPos + (Math.random() - 0.5) * 1.3,
                    1.85,
                    zPos + (Math.random() - 0.5) * 2.1
                );
                bubble.userData = {
                    baseY: 1.85,
                    phase: Math.random() * Math.PI * 2,
                    speed: 3.5 + Math.random() * 2.5
                };
                scene.add(bubble);
                fryerBubbles.push(bubble);
            }
        });
    });

    const counterBase = new THREE.Mesh(
        new THREE.BoxGeometry(19, 1.35, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.4 })
    );
    counterBase.position.set(0, 0.67, 5.1);
    counterBase.receiveShadow = true;
    scene.add(counterBase);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.16, 1.5), steelMat);
    counterTop.position.set(0, 1.4, 5.1);
    scene.add(counterTop);

    const counterNeon = new THREE.Mesh(new THREE.BoxGeometry(19.1, 0.1, 0.08), neonYellowMat);
    counterNeon.position.set(0, 1.3, 4.42);
    scene.add(counterNeon);

    buildFirstPersonBlaster();
}

function buildFirstPersonBlaster() {
    weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.68, -0.62, -1.25);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.28 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4, roughness: 0.3 });
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.72), bodyMat);
    weaponGroup.add(receiver);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.42, 16), nozzleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, -0.52);
    weaponGroup.add(barrel);

    drumGroup = new THREE.Group();
    drumGroup.position.set(0, 0.15, -0.14);

    const drumCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.28, 16),
        accentMat
    );
    drumCore.rotation.x = Math.PI / 2;
    drumGroup.add(drumCore);

    WEAPONS.forEach((w, i) => {
        const angle = i * (Math.PI / 2);
        const canister = new THREE.Mesh(
            new THREE.CylinderGeometry(0.048, 0.048, 0.30, 12),
            new THREE.MeshStandardMaterial({ color: w.hex, roughness: 0.3, metalness: 0.2 })
        );
        canister.rotation.x = Math.PI / 2;
        canister.position.set(Math.sin(angle) * 0.095, Math.cos(angle) * 0.095, 0);
        drumGroup.add(canister);
    });
    weaponGroup.add(drumGroup);

    muzzleFlashMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 })
    );
    muzzleFlashMesh.position.set(0, 0.03, -0.78);
    weaponGroup.add(muzzleFlashMesh);

    muzzleLight = new THREE.PointLight(0xef4444, 0, 7);
    muzzleLight.position.set(0, 0.15, -0.9);
    weaponGroup.add(muzzleLight);

    camera.add(weaponGroup);
    scene.add(camera);
}

// --- Creación de Personajes Enemigos 3D Articulados y Detallados ---
function createEnemyHealthTexture(ratio, tagText, hexColor) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);

    ctx.fillStyle = 'rgba(9, 11, 18, 0.88)';
    ctx.fillRect(18, 4, 220, 26);
    ctx.fillStyle = hexColor;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, 128, 22);

    ctx.fillStyle = '#090b12';
    ctx.fillRect(28, 36, 200, 16);
    ctx.fillStyle = ratio > 0.45 ? '#22c55e' : '#ef4444';
    ctx.fillRect(31, 39, Math.max(0, Math.round(194 * ratio)), 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 36, 200, 16);

    return new THREE.CanvasTexture(c);
}

function createEnemyMesh(typeKey, weakWeapon, isBoss = false) {
    const root = new THREE.Group();
    const scale = isBoss ? 1.50 : 1.02;
    root.scale.set(scale, scale, scale);

    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 1.15;
    root.add(bodyGroup);

    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const browMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    function makeLeg(xOffset) {
        const pivot = new THREE.Group();
        pivot.position.set(xOffset, 0.65, 0);

        const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.52, 10), legMat);
        calf.position.y = -0.26;
        calf.castShadow = true;
        pivot.add(calf);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.46), shoeMat);
        shoe.position.set(0, -0.54, 0.08);
        shoe.castShadow = true;
        pivot.add(shoe);

        return pivot;
    }

    const leftLeg = makeLeg(-0.30);
    const rightLeg = makeLeg(0.30);
    root.add(leftLeg);
    root.add(rightLeg);

    if (typeKey === 'wing') {
        const meatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 });
        const meat = new THREE.Mesh(new THREE.SphereGeometry(0.64, 16, 14), meatMat);
        meat.scale.set(0.92, 1.22, 0.85);
        meat.castShadow = true;
        bodyGroup.add(meat);

        const boneMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const boneStick = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.55, 10), boneMat);
        boneStick.position.set(0, 0.78, 0);
        bodyGroup.add(boneStick);

        const knobL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), boneMat);
        knobL.position.set(-0.11, 1.02, 0);
        const knobR = knobL.clone();
        knobR.position.x = 0.11;
        bodyGroup.add(knobL, knobR);
    } else if (typeKey === 'boneless') {
        const crustMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 });
        const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), crustMat);
        core.castShadow = true;
        bodyGroup.add(core);

        const crumbMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });
        for (let i = 0; i < 6; i++) {
            const bump = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), crumbMat);
            const a = (i / 6) * Math.PI * 2;
            bump.position.set(Math.cos(a) * 0.48, (i % 2 === 0 ? 0.22 : -0.2), Math.sin(a) * 0.48);
            bodyGroup.add(bump);
        }
    } else if (typeKey === 'fries') {
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
        const carton = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.92, 0.62), boxMat);
        carton.castShadow = true;
        bodyGroup.add(carton);

        const fryMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
        for (let f = -3; f <= 3; f++) {
            const stick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.68 + Math.abs(f % 2) * 0.15, 0.12), fryMat);
            stick.position.set(f * 0.13, 0.62, (f % 2) * 0.08);
            stick.rotation.z = f * -0.05;
            stick.castShadow = true;
            bodyGroup.add(stick);
        }
    } else {
        const skinMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.55 });
        const pulpMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
        for (let w = -1; w <= 1; w++) {
            const wedgeGroup = new THREE.Group();
            const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.15, 12, 1, false, 0, Math.PI), skinMat);
            const inner = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.12, 0.72), pulpMat);
            wedgeGroup.add(outer, inner);
            wedgeGroup.position.set(w * 0.34, 0.08, Math.abs(w) * -0.1);
            wedgeGroup.rotation.z = w * -0.18;
            wedgeGroup.castShadow = true;
            bodyGroup.add(wedgeGroup);
        }
    }

    [-0.22, 0.22].forEach((xEye, idx) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), eyeWhiteMat);
        eye.position.set(xEye, 0.14, 0.54);
        bodyGroup.add(eye);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), pupilMat);
        pupil.position.set(xEye, 0.14, 0.67);
        bodyGroup.add(pupil);

        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.055, 0.06), browMat);
        brow.position.set(xEye, 0.30, 0.62);
        brow.rotation.z = idx === 0 ? -0.28 : 0.28;
        bodyGroup.add(brow);
    });

    if (isBoss) {
        const crown = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.34, 0.34, 8),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 })
        );
        crown.position.set(0, 1.15, 0);
        bodyGroup.add(crown);
    }

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 1.0, 28),
        new THREE.MeshBasicMaterial({ color: weakWeapon.hex, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    root.add(ring);

    const tagLabel = isBoss ? `👑 JEFE • ${weakWeapon.name}` : weakWeapon.name;
    const hpTex = createEnemyHealthTexture(1.0, tagLabel, weakWeapon.cssHex);
    const hpSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hpTex, transparent: true }));
    hpSprite.scale.set(2.2, 0.55, 1);
    hpSprite.position.set(0, 2.55, 0);
    root.add(hpSprite);

    return {
        root,
        bodyGroup,
        leftLeg,
        rightLeg,
        hpSprite,
        tagLabel
    };
}

// --- Generación y Comportamiento de Enemigos ---
const ENEMY_TYPES = [
    { key: 'wing', name: 'ALITA REBELDE', baseHp: 110, baseSpeed: 4.3, points: 45 },
    { key: 'boneless', name: 'BONELESS RUDOS', baseHp: 150, baseSpeed: 3.7, points: 55 },
    { key: 'fries', name: 'ESCUADRÓN PAPAS', baseHp: 90, baseSpeed: 5.2, points: 40 },
    { key: 'wedges', name: 'PAPAS GAJO', baseHp: 130, baseSpeed: 4.5, points: 50 }
];

function spawnEnemy(forceBoss = false) {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const weakWeapon = (type.key === 'fries' || type.key === 'wedges')
        ? (Math.random() < 0.65 ? WEAPONS[3] : WEAPONS[2])
        : WEAPONS[Math.floor(Math.random() * WEAPONS.length)];

    const waveScale = 1 + (wave - 1) * 0.22;
    const maxHp = Math.round(type.baseHp * waveScale * (forceBoss ? 3.5 : 1));
    const speed = type.baseSpeed * (1 + (wave - 1) * 0.08) * (forceBoss ? 0.78 : 1);

    const meshParts = createEnemyMesh(type.key, weakWeapon, forceBoss);
    const laneX = (Math.random() - 0.5) * 11.4;
    const startZ = -22 - Math.random() * 3;
    meshParts.root.position.set(laneX, 0, startZ);
    scene.add(meshParts.root);

    enemies.push({
        ...meshParts,
        type,
        weakWeapon,
        isBoss: forceBoss,
        hp: maxHp,
        maxHp,
        speed,
        walkPhase: Math.random() * Math.PI * 2
    });
}

// --- Sistema Dual de Apuntado (Shooter Móvil vs PC Mouse) ---
function setControlMode(touchMode) {
    isTouchControlMode = touchMode;
    if (isTouchControlMode) {
        mobileFireBtn.classList.remove('hidden');
        mobileAimHintEl.classList.remove('hidden');
        crosshairEl.style.left = '50%';
        crosshairEl.style.top = '45%';
        updateAimFromCenterCrosshair();
    } else {
        mobileFireBtn.classList.add('hidden');
        mobileAimHintEl.classList.add('hidden');
    }
}

// Proyección libre del rayo de apuntado (soporta mirar hacia piso, enemigos, muros o techo)
function computeAimPointFromRay(ray) {
    if (ray.direction.y < -0.02) {
        const t = (1.15 - ray.origin.y) / ray.direction.y;
        const clampedT = Math.max(2.5, Math.min(32, t));
        aimWorldPoint.copy(ray.origin).addScaledVector(ray.direction, clampedT);
    } else {
        aimWorldPoint.copy(ray.origin).addScaledVector(ray.direction, 26);
    }
}

// En modo móvil: la mira está fija en el centro (50%, 45%) y la cámara rota libremente
function updateAimFromCenterCrosshair() {
    crosshairEl.style.left = '50%';
    crosshairEl.style.top = '45%';

    if (!camera || !raycaster) return;
    camera.rotation.y = camYaw;
    camera.rotation.x = camPitch;
    camera.updateMatrixWorld();

    // Raycast en el punto exacto de la mira central (y = +0.10 en NDC equivale a top: 45%)
    raycaster.setFromCamera(new THREE.Vector2(0, 0.10), camera);
    computeAimPointFromRay(raycaster.ray);
}

// En modo PC (Mouse): el cursor mueve la mira directamente
function updateAimFromMouse(clientX, clientY) {
    const screenX = Math.max(8, Math.min(window.innerWidth - 8, clientX));
    const screenY = Math.max(8, Math.min(window.innerHeight - 8, clientY));

    crosshairEl.style.left = `${screenX}px`;
    crosshairEl.style.top = `${screenY}px`;

    const normX = (screenX / window.innerWidth) * 2 - 1;
    const normY = -(screenY / window.innerHeight) * 2 + 1;

    camYaw = -normX * 0.22;
    camPitch = -0.09 + normY * 0.16;

    if (!camera || !raycaster) return;

    raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
    computeAimPointFromRay(raycaster.ray);
}

// --- Disparo 3D ---
function fireWeapon() {
    if (gameState !== 'PLAYING' || fireCooldown > 0) return;
    const w = WEAPONS[currentWeaponIndex];
    fireCooldown = w.cooldown;
    shotsFired++;

    weaponKickZ = 0.14;

    muzzleFlashMesh.material.opacity = 0.95;
    muzzleLight.intensity = 3.2;
    crosshairEl.classList.add('crosshair-fire');
    setTimeout(() => crosshairEl.classList.remove('crosshair-fire'), 80);

    playSound(w.sound);

    const muzzleOrigin = new THREE.Vector3(0, 0.03, -0.78).applyMatrix4(weaponGroup.matrixWorld);
    const baseDir = aimWorldPoint.clone().sub(muzzleOrigin).normalize();

    for (let i = 0; i < w.count; i++) {
        const dir = baseDir.clone();
        dir.x += (Math.random() - 0.5) * w.spread;
        dir.y += (Math.random() - 0.5) * w.spread;
        dir.normalize();

        const blob = new THREE.Mesh(
            new THREE.SphereGeometry(w.splash > 0 ? 0.22 : 0.15, 10, 10),
            new THREE.MeshBasicMaterial({ color: w.hex })
        );
        blob.position.copy(muzzleOrigin);
        scene.add(blob);

        projectiles.push({
            mesh: blob,
            velocity: dir.multiplyScalar(w.speed),
            weapon: w,
            life: 1.4
        });
    }
}

function spawnSplashParticles(pos, hexColor, count = 14) {
    for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(
            new THREE.BoxGeometry(0.13, 0.13, 0.13),
            new THREE.MeshBasicMaterial({ color: hexColor })
        );
        p.position.copy(pos);
        scene.add(p);

        particles.push({
            mesh: p,
            vel: new THREE.Vector3(
                (Math.random() - 0.5) * 9,
                2.5 + Math.random() * 6,
                (Math.random() - 0.5) * 9
            ),
            life: 0.45 + Math.random() * 0.25
        });
    }
}

// --- Popups Flotantes y HUD ---
function createPopup(text, color = '#facc15') {
    const popup = document.createElement('div');
    popup.className = 'absolute left-1/2 top-1/4 -translate-x-1/2 pixel-font text-[10px] sm:text-xs font-bold pointer-events-none transition-all duration-700 ease-out whitespace-nowrap z-30';
    popup.style.color = color;
    popup.style.textShadow = '2px 2px 0px #000';
    popup.textContent = text;
    popupContainer.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.transform = 'translate(-50%, -34px)';
        popup.style.opacity = '0';
    });
    setTimeout(() => popup.remove(), 700);
}

function updateHUD() {
    scoreValEl.textContent = String(score).padStart(6, '0');
    streakValEl.textContent = streak;
    waveBadgeEl.textContent = `OLEADA ${wave}`;

    if (streak >= 6) {
        comboBadgeEl.classList.remove('hidden');
    } else {
        comboBadgeEl.classList.add('hidden');
    }

    livesContainerEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = i < lives
            ? 'inline-block w-3 h-3 rounded-sm bg-red-500 border border-yellow-300 shadow-[0_0_6px_#ef4444]'
            : 'inline-block w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-600';
        livesContainerEl.appendChild(dot);
    }
}

function showRewardToast(tier) {
    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToastTitle.textContent = tier.title;
    rewardToastCode.textContent = tier.code;
    rewardToast.classList.remove('hidden');
    rewardToastTimeout = setTimeout(() => {
        rewardToast.classList.add('hidden');
    }, 3500);
}

function checkMilestoneRewards() {
    for (const tier of REWARD_TIERS) {
        if (score >= tier.points && !unlockedRewardsThisRun.some(r => r.id === tier.id)) {
            unlockedRewardsThisRun.push(tier);
            playSound('reward');
            showRewardToast(tier);
        }
    }
}

// --- Bucle Principal de Simulación 3D ---
function animate(now) {
    if (gameState !== 'PLAYING') return;
    animFrameId = requestAnimationFrame(animate);

    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    if (isTouchControlMode) {
        updateAimFromCenterCrosshair();
    } else {
        camera.rotation.y += (camYaw - camera.rotation.y) * Math.min(1, dt * 10);
        camera.rotation.x += (camPitch - camera.rotation.x) * Math.min(1, dt * 10);
        camera.updateMatrixWorld();
    }

    weaponGroup.lookAt(aimWorldPoint);
    weaponGroup.rotateY(Math.PI);

    if (fireCooldown > 0) fireCooldown -= dt;
    if (isFiring && fireCooldown <= 0) {
        fireWeapon();
    }

    weaponKickZ = Math.max(0, weaponKickZ - dt * 1.4);
    weaponGroup.position.z = -1.25 + weaponKickZ;
    weaponGroup.position.y = -0.62 + Math.sin(now * 0.008) * 0.010;

    currentDrumAngle += (targetDrumAngle - currentDrumAngle) * Math.min(1, dt * 16);
    drumGroup.rotation.z = currentDrumAngle;

    if (muzzleFlashMesh.material.opacity > 0) {
        muzzleFlashMesh.material.opacity = Math.max(0, muzzleFlashMesh.material.opacity - dt * 11);
        muzzleLight.intensity = Math.max(0, muzzleLight.intensity - dt * 32);
    }

    // Animar burbujas en las freidoras
    for (const b of fryerBubbles) {
        const waveVal = Math.sin(now * 0.001 * b.userData.speed + b.userData.phase);
        b.position.y = b.userData.baseY + Math.max(0, waveVal) * 0.22;
        const s = 0.7 + Math.max(0, waveVal) * 0.6;
        b.scale.set(s, s, s);
    }

    // Control de Oleadas Intensas
    if (enemiesSpawnedInWave < enemiesPerWave) {
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
            const isLastBoss = enemiesSpawnedInWave === enemiesPerWave - 1;
            spawnEnemy(isLastBoss);
            enemiesSpawnedInWave++;
            spawnTimer = Math.max(0.55, 1.55 - wave * 0.09);
        }
    } else if (enemies.length === 0) {
        wave++;
        enemiesSpawnedInWave = 0;
        enemiesPerWave = Math.min(24, 7 + wave * 2);
        spawnTimer = 0.85;
        createPopup(`🔥 ¡OLEADA ${wave}!`, '#38bdf8');
        updateHUD();
    }

    // Actualizar Proyectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.life -= dt;
        proj.mesh.position.addScaledVector(proj.velocity, dt);

        let hitHandled = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const hitRadius = enemy.isBoss ? 1.38 : 0.92;
            const enemyCenter = enemy.root.position.clone().add(new THREE.Vector3(0, 1.15, 0));

            if (proj.mesh.position.distanceTo(enemyCenter) <= hitRadius) {
                shotsHit++;
                hitHandled = true;

                const isCritical = proj.weapon.id === enemy.weakWeapon.id;
                const dmg = proj.weapon.damage * (isCritical ? 2 : 1);

                applyDamageToEnemy(j, dmg, isCritical, proj.weapon.hex);

                if (proj.weapon.splash > 0) {
                    for (let k = enemies.length - 1; k >= 0; k--) {
                        if (k === j || !enemies[k]) continue;
                        if (enemies[k].root.position.distanceTo(enemy.root.position) <= proj.weapon.splash) {
                            applyDamageToEnemy(k, Math.round(proj.weapon.damage * 0.65), false, proj.weapon.hex);
                        }
                    }
                }
                break;
            }
        }

        if (hitHandled || proj.life <= 0 || proj.mesh.position.y <= 0.05) {
            spawnSplashParticles(proj.mesh.position, proj.weapon.hex, hitHandled ? 12 : 5);
            scene.remove(proj.mesh);
            projectiles.splice(i, 1);
        }
    }

    // Actualizar Enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.walkPhase += dt * (enemy.speed * 3.8);

        enemy.root.position.z += enemy.speed * dt;
        enemy.root.position.x += Math.sin(enemy.walkPhase * 0.42) * dt * 1.45;
        enemy.root.position.x = Math.max(-7.2, Math.min(7.2, enemy.root.position.x));

        enemy.leftLeg.rotation.x = Math.sin(enemy.walkPhase) * 0.72;
        enemy.rightLeg.rotation.x = -Math.sin(enemy.walkPhase) * 0.72;
        enemy.bodyGroup.position.y = 1.15 + Math.abs(Math.cos(enemy.walkPhase)) * 0.16;
        enemy.bodyGroup.rotation.z = Math.sin(enemy.walkPhase) * 0.09;

        if (enemy.root.position.z >= 4.15) {
            scene.remove(enemy.root);
            enemies.splice(i, 1);

            lives--;
            streak = 0;
            playSound('damage');
            createPopup('💥 ¡INVADIERON EL MOSTRADOR! -1 VIDA', '#ef4444');

            damageVignette.style.opacity = '1';
            setTimeout(() => { damageVignette.style.opacity = '0'; }, 260);

            updateHUD();
            if (lives <= 0) {
                triggerGameOver();
                return;
            }
        }
    }

    // Actualizar Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        p.vel.y -= 18 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.scale.setScalar(Math.max(0.01, p.life * 1.8));
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

function applyDamageToEnemy(index, dmg, isCritical, hexColor) {
    const enemy = enemies[index];
    if (!enemy) return;

    enemy.hp -= dmg;
    enemy.root.position.z -= 0.16;

    if (enemy.hp <= 0) {
        const mult = streak >= 6 ? 2 : 1;
        const bossMult = enemy.isBoss ? 3 : 1;
        const critBonus = isCritical ? 20 : 0;
        const earned = (enemy.type.points * bossMult + critBonus) * mult;

        score += earned;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        enemiesDefeated++;

        playSound(isCritical ? 'hit_crit' : 'kill');
        spawnSplashParticles(enemy.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), hexColor, 22);

        const label = enemy.isBoss
            ? `👑 ¡JEFE DERROTADO! +${earned}`
            : (isCritical ? `⚡ CRÍTICO x2 +${earned}` : `+${earned} PTS`);
        createPopup(label, isCritical ? '#facc15' : '#4ade80');

        scene.remove(enemy.root);
        enemies.splice(index, 1);

        checkMilestoneRewards();
        updateHUD();
    } else {
        if (isCritical) playSound('hit_crit');
        const ratio = Math.max(0, enemy.hp / enemy.maxHp);
        enemy.hpSprite.material.map.dispose();
        enemy.hpSprite.material.map = createEnemyHealthTexture(ratio, enemy.tagLabel, enemy.weakWeapon.cssHex);
    }
}

// --- Controles Multitouch Shooter (Celular) y Mouse Directo (PC) ---
let dragAimPointerId = null;
let lastDragX = 0;
let lastDragY = 0;
let fireButtonPointerId = null;

// Área principal de pantalla:
// - En Touch: deslizar mueve la cámara/mira central libremente sin tapar objetivos.
// - En Mouse: mover apunta directamente y clic izquierdo dispara.
gameCanvas.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;

    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        if (!isTouchControlMode) setControlMode(true);
        if (dragAimPointerId === null) {
            dragAimPointerId = e.pointerId;
            lastDragX = e.clientX;
            lastDragY = e.clientY;
            gameCanvas.setPointerCapture(e.pointerId);
        }
    } else {
        // Modo PC Mouse
        if (isTouchControlMode) setControlMode(false);
        if (e.button === 2) {
            rotateWeaponDrum(1);
            return;
        }
        if (e.button === 0) {
            updateAimFromMouse(e.clientX, e.clientY);
            isFiring = true;
            fireWeapon();
        }
    }
});

gameCanvas.addEventListener('pointermove', (e) => {
    if (gameState !== 'PLAYING') return;

    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        if (e.pointerId === dragAimPointerId) {
            const dx = e.clientX - lastDragX;
            const dy = e.clientY - lastDragY;
            lastDragX = e.clientX;
            lastDragY = e.clientY;

            camYaw = Math.max(-MAX_CAM_YAW, Math.min(MAX_CAM_YAW, camYaw - dx * TOUCH_LOOK_SENSITIVITY));
            camPitch = Math.max(MIN_CAM_PITCH, Math.min(MAX_CAM_PITCH, camPitch - dy * TOUCH_LOOK_SENSITIVITY));
            updateAimFromCenterCrosshair();
        }
    } else {
        if (isTouchControlMode) setControlMode(false);
        updateAimFromMouse(e.clientX, e.clientY);
    }
});

function releaseCanvasPointer(e) {
    if (e.pointerId === dragAimPointerId) {
        dragAimPointerId = null;
    }
    if (e.pointerType === 'mouse') {
        isFiring = false;
    }
}

gameCanvas.addEventListener('pointerup', releaseCanvasPointer);
gameCanvas.addEventListener('pointercancel', releaseCanvasPointer);
gameCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Botón Táctil Independiente de Disparo (Pulgar Derecho)
mobileFireBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (gameState !== 'PLAYING') return;
    fireButtonPointerId = e.pointerId;
    mobileFireBtn.setPointerCapture(e.pointerId);
    mobileFireBtn.classList.add('firing');
    isFiring = true;
    fireWeapon();
});

function releaseMobileFireBtn(e) {
    e.stopPropagation();
    if (e.pointerId === fireButtonPointerId || fireButtonPointerId === null) {
        fireButtonPointerId = null;
        isFiring = false;
        mobileFireBtn.classList.remove('firing');
    }
}

mobileFireBtn.addEventListener('pointerup', releaseMobileFireBtn);
mobileFireBtn.addEventListener('pointercancel', releaseMobileFireBtn);

window.addEventListener('wheel', (e) => {
    if (gameState !== 'PLAYING') return;
    rotateWeaponDrum(e.deltaY > 0 ? 1 : -1);
}, { passive: true });

// Atajos de Teclado
window.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput) return;
    if (e.code === 'Digit1' || e.code === 'Numpad1') selectWeapon(0);
    else if (e.code === 'Digit2' || e.code === 'Numpad2') selectWeapon(1);
    else if (e.code === 'Digit3' || e.code === 'Numpad3') selectWeapon(2);
    else if (e.code === 'Digit4' || e.code === 'Numpad4') selectWeapon(3);
    else if (e.code === 'Tab' || e.code === 'KeyC') {
        e.preventDefault();
        if (gameState === 'PLAYING') rotateWeaponDrum(1);
    } else if (e.code === 'Space') {
        if (gameState === 'PLAYING') {
            e.preventDefault();
            fireWeapon();
        }
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') pauseGame();
        else if (gameState === 'PAUSED') resumeGame();
    }
});

window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (isTouchControlMode) updateAimFromCenterCrosshair();
});

// --- Flujo de Partida (Inicio, Pausa, Game Over) ---
function clearEntities() {
    enemies.forEach(e => scene.remove(e.root));
    projectiles.forEach(p => scene.remove(p.mesh));
    particles.forEach(pt => scene.remove(pt.mesh));
    enemies = [];
    projectiles = [];
    particles = [];
}

function resetInputState() {
    isFiring = false;
    dragAimPointerId = null;
    fireButtonPointerId = null;
    mobileFireBtn.classList.remove('firing');
}

async function startGame() {
    if (!currentPlayerName) {
        const typedName = playerNameInput.value.trim();
        if (!typedName) {
            loginErrorMsg.classList.remove('hidden');
            playerNameInput.focus();
            return;
        }
        currentPlayerName = typedName;
        localStorage.setItem('snax_player_name', currentPlayerName);
    }

    syncPlayerLoginUI();
    loginErrorMsg.classList.add('hidden');
    await requestLandscapeMode();

    initAudio();
    initThreeScene();
    clearEntities();
    resetInputState();

    if (animFrameId) cancelAnimationFrame(animFrameId);

    score = 0;
    lives = 3;
    streak = 0;
    maxStreak = 0;
    enemiesDefeated = 0;
    shotsFired = 0;
    shotsHit = 0;
    wave = 1;
    enemiesSpawnedInWave = 0;
    enemiesPerWave = 9;
    spawnTimer = 0.35;
    camYaw = 0;
    camPitch = -0.09;
    camera.rotation.y = 0;
    camera.rotation.x = -0.09;
    weaponKickZ = 0;
    unlockedRewardsThisRun = [];

    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToast.classList.add('hidden');

    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    gameArena.classList.remove('hidden');

    setControlMode(('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (!isTouchControlMode) {
        updateAimFromMouse(window.innerWidth * 0.5, window.innerHeight * 0.45);
    }

    selectWeapon(0);
    updateHUD();

    gameState = 'PLAYING';
    lastFrameTime = performance.now();
    startBGM();
    animFrameId = requestAnimationFrame(animate);
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    resetInputState();
    stopBGM();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    pauseSummaryEl.textContent = `Oleada ${wave} • ${score} PTS`;
    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('flex');
}

function resumeGame() {
    if (gameState !== 'PAUSED') return;
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameState = 'PLAYING';
    lastFrameTime = performance.now();
    startBGM();
    animFrameId = requestAnimationFrame(animate);
}

function exitToMainMenu() {
    stopBGM();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameState = 'START';
    resetInputState();
    clearEntities();

    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    gameArena.classList.add('hidden');
    startScreen.classList.remove('hidden');

    syncPlayerLoginUI();
    startHighscoreEl.textContent = highscore;
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    resetInputState();
    stopBGM();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    rewardToast.classList.add('hidden');
    playSound('gameover');

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('snax_blaster3d_highscore', String(highscore));
        startHighscoreEl.textContent = highscore;
        finalCommentEl.textContent = `¡NUEVO RÉCORD 3D, ${currentPlayerName.toUpperCase()}!`;
    } else {
        finalCommentEl.textContent = `Caíste en la Oleada ${wave}`;
    }

    const accuracyPct = shotsFired > 0 ? Math.min(100, Math.round((shotsHit / shotsFired) * 100)) : 0;

    let rankLabel = 'APRENDIZ';
    if (score >= 22000) rankLabel = 'LEYENDA SNAX';
    else if (score >= 9500) rankLabel = 'COMANDANTE PICANTE';
    else if (score >= 6000) rankLabel = 'FRANCOTIRADOR BBQ';
    else if (score >= 3000) rankLabel = 'ARTILLERO PRO';

    finalPlayerNameEl.textContent = currentPlayerName.toUpperCase();
    finalScoreEl.textContent = score;
    highscoreValEl.textContent = highscore;
    finalRankProfileEl.textContent = `${rankLabel} (${accuracyPct}%)`;

    let topCouponCode = 'NINGUNO';
    let allUnlockedCodes = 'NINGUNO';

    if (unlockedRewardsThisRun.length > 0) {
        const topReward = unlockedRewardsThisRun[unlockedRewardsThisRun.length - 1];
        topCouponCode = topReward.code;
        allUnlockedCodes = unlockedRewardsThisRun.map(r => r.code).join(', ');

        couponTitleEl.textContent = topReward.title;
        couponDescEl.textContent = topReward.desc;
        couponCodeTextEl.textContent = topReward.code;
        copyCouponBtn.textContent = 'COPIAR';

        allUnlockedBadgesEl.innerHTML = '';
        unlockedRewardsThisRun.forEach(r => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'pixel-font text-[7px] px-1.5 py-0.5 rounded border ' +
                (r.id === topReward.id ? 'bg-yellow-400 text-black border-white' : 'bg-gray-800 text-yellow-300 border-yellow-500/40');
            chip.textContent = r.shortLabel;
            chip.addEventListener('click', () => {
                couponTitleEl.textContent = r.title;
                couponDescEl.textContent = r.desc;
                couponCodeTextEl.textContent = r.code;
                copyCouponBtn.textContent = 'COPIAR';
            });
            allUnlockedBadgesEl.appendChild(chip);
        });

        unlockedCouponBox.classList.remove('hidden');
        noCouponHint.classList.add('hidden');
    } else {
        unlockedCouponBox.classList.add('hidden');
        noCouponHint.classList.remove('hidden');
    }

    sendToGoogleSheets({
        juego: 'SAUCE BLASTER 3D',
        jugador: currentPlayerName,
        puntuacion: score,
        precision: `${accuracyPct}%`,
        detalle: `Oleada: ${wave} | Eliminados: ${enemiesDefeated}`,
        comboMax: maxStreak,
        rango: `${rankLabel} (${score} PTS)`,
        cupon: topCouponCode,
        cuponesPartida: allUnlockedCodes
    });

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
}

// --- Eventos de Interfaz ---
copyCouponBtn.addEventListener('click', () => {
    const code = couponCodeTextEl.textContent;
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        copyCouponBtn.textContent = '¡COPIADO!';
        setTimeout(() => { copyCouponBtn.textContent = 'COPIAR'; }, 2000);
    } catch (_) {
        copyCouponBtn.textContent = code;
    }
    document.body.removeChild(tempInput);
});

openGuideBtn.addEventListener('click', () => {
    guideModal.classList.remove('hidden');
    guideModal.classList.add('flex');
});
closeGuideBtn.addEventListener('click', () => {
    guideModal.classList.add('hidden');
    guideModal.classList.remove('flex');
});

openRewardsBtn.addEventListener('click', () => {
    rewardsModal.classList.remove('hidden');
    rewardsModal.classList.add('flex');
});
closeRewardsBtn.addEventListener('click', () => {
    rewardsModal.classList.add('hidden');
    rewardsModal.classList.remove('flex');
});

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame();
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
pauseRestartBtn.addEventListener('click', startGame);
exitMenuBtn.addEventListener('click', exitToMainMenu);
restartBtn.addEventListener('click', startGame);
gameOverMenuBtn.addEventListener('click', exitToMainMenu);

function toggleAudio() {
    soundEnabled = !soundEnabled;
    soundToggleStartBtn.textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
    pauseSoundBtn.textContent = soundEnabled ? '🔊 SONIDO: ON' : '🔇 SONIDO: OFF';
    if (soundEnabled && gameState === 'PLAYING') startBGM();
    else stopBGM();
}
soundToggleStartBtn.addEventListener('click', toggleAudio);
pauseSoundBtn.addEventListener('click', toggleAudio);
