// ===== 音频引擎 v2: 全部改为真实录音文件(audio/v2/), 不再用振荡器合成 =====
// 结构: 三组总线 bgm / amb(环境) / sfx(事件+界面+心跳) → master(-3dB 余量) → 限幅器 → 扬声器
// 格式: ogg 优先, Safari/iOS(WebKit 对 ogg 支持不稳)直接用 mp3; ogg 解码失败也自动回退 mp3。
// 加载: 首次用户手势后才建/解锁 AudioContext; 只预载界面音+心跳+当前章节用到的文件, 不在开局全量下载。
// 素材授权见 audio/v2/CREDITS.md(含必须署名的 CC BY 列表)。

let audioCtx = null;
// 音效总开关(由设置面板"音效"同步): 关掉后音效/环境/心跳/BGM 全部静音并停止
let sfxEnabled = true;

const V2_BASE = 'audio/v2/';
const V2_VER = 'b1';           // 替换 audio/v2 下某个文件内容时手动 +1
// BGM 缓存版本: 仅在"替换 BGM 文件内容"时手动 +1, 免得每次部署都重下数 MB 音频。
const AUDIO_VER = 'a3';

// 各组增益(线性)。v2 素材已归一: 音效 -16 LUFS, 环境 -18 LUFS, 峰值 ≤ -1 dBFS;
// BGM 仍用原有 audio/bgm_*.mp3(约 -11~-13 LUFS, 峰值贴 0 dBFS), 所以 BGM 组压得更低。
const GROUP_GAIN = { bgm: 0.5, amb: 0.6, sfx: 0.9 };
const MASTER_GAIN = 0.708;     // -3 dB 余量, 多层叠加时不爆

let busMaster = null, busBgm = null, busAmb = null, busSfx = null, limiter = null, limiterTrim = null, meterNode = null;

// ---------- 素材表 ----------
// 场景(节点 sceneName)→ 环境层 [文件, 增益]; 最多两条, 场景切换时交叉淡变
const AMB_HALL = [['amb_house_night_creak', 0.7], ['amb_candles_hall', 0.6]];
const SCENE_AMB = {
    '末班车': [['amb_wind_paper_window', 0.45]],
    '末班车车厢': [['amb_wind_paper_window', 0.45]],
    '荒野': [['amb_wind_paper_window', 0.6]],
    '回城的车': [['amb_wind_paper_window', 0.4]],
    '村口槐树': [['amb_dog_far', 0.7], ['amb_joss_paper_fire', 0.45]],
    '村路野草': [['amb_dog_far', 0.6], ['amb_wind_paper_window', 0.5]],
    '村口夜路': [['amb_dog_far', 0.7], ['amb_wind_paper_window', 0.45]],
    '村口': [['amb_dog_far', 0.5], ['amb_wind_paper_window', 0.4]],
    '老宅堂屋': AMB_HALL, '门缝': AMB_HALL, '门外': AMB_HALL, '手机屏幕': AMB_HALL,
    '黑漆棺': AMB_HALL, '黑漆棺旁': AMB_HALL, '守灵·添香': AMB_HALL, '供桌': AMB_HALL,
    '门外的喊声': [['amb_house_night_creak', 0.6], ['amb_wind_paper_window', 0.5]],
    '堂屋大门': [['amb_house_night_creak', 0.7], ['amb_wind_paper_window', 0.45]],
    '后院厨房': [['amb_house_night_creak', 0.6], ['amb_wind_paper_window', 0.5]],
    '水缸': [['amb_house_night_creak', 0.5], ['amb_well_drip', 0.55]],
    '纸人圈': AMB_HALL, '纸人围灵': AMB_HALL,
    '厨房暗门': [['amb_cellar_drip', 0.6], ['amb_house_night_creak', 0.35]],
    '石阶岔口': [['amb_cellar_drip', 0.65], ['amb_wind_paper_window', 0.3]],
    '血池洞窟': [['amb_cellar_drip', 0.7], ['amb_well_drip', 0.35]],
    '血池': [['amb_cellar_drip', 0.7], ['amb_well_drip', 0.35]],
    '石门': [['amb_cellar_drip', 0.6]],
    '密室': [['amb_cellar_drip', 0.45]],
    '婚房': [['amb_candles_hall', 0.55], ['amb_cellar_drip', 0.35]],
    '婚床底下': [['amb_candles_hall', 0.5], ['amb_cellar_drip', 0.35]],
    '打谷场': [['amb_wind_paper_window', 0.6], ['amb_dog_far', 0.4]],
    '纸人队伍': [['amb_wind_paper_window', 0.6], ['amb_dog_far', 0.35]],
    '村中灵棚': [['amb_candles_hall', 0.6], ['amb_wind_paper_window', 0.45]],
    '灵棚棺木': [['amb_candles_hall', 0.6], ['amb_wind_paper_window', 0.4]],
    '祠堂': AMB_HALL, '喜位': AMB_HALL, '破镜': AMB_HALL,
    '后院老井': [['amb_well_drip', 0.7], ['amb_wind_paper_window', 0.4]],
    '阴阳路': [['amb_wind_paper_window', 0.6], ['amb_joss_paper_fire', 0.3]],
    '送亲队伍': [['amb_wind_paper_window', 0.55]],
    '乱葬岗·新坟': [['amb_wind_paper_window', 0.55], ['amb_joss_paper_fire', 0.45]],
    '三岔口': [['amb_wind_paper_window', 0.6]],
    '回忆': [['amb_house_night_creak', 0.4]],
    '回魂法坛': [['amb_candles_hall', 0.65], ['amb_house_night_creak', 0.45]],
};
// 个别节点覆盖场景环境(长明灯被风吹灭: 蜡烛声撤掉, 换成风)
const NODE_AMB = {
    node10: [['amb_house_night_creak', 0.75], ['amb_wind_paper_window', 0.55]],
};
// 章节兜底(场景没配时按章)
const CHAPTER_AMB = {
    1: [['amb_wind_paper_window', 0.5]],
    2: AMB_HALL, 3: [['amb_house_night_creak', 0.6], ['amb_wind_paper_window', 0.5]], 4: AMB_HALL, 5: AMB_HALL,
    6: [['amb_cellar_drip', 0.6]], 7: [['amb_wind_paper_window', 0.6]], 8: AMB_HALL, 9: AMB_HALL, 10: AMB_HALL,
};
// 环境里偶发的远处点缀(唢呐远远飘来), 每 25~55 秒一次
const SCENE_SPOTS = {
    '打谷场': ['sfx_suona_far'], '纸人队伍': ['sfx_suona_far'], '阴阳路': ['sfx_suona_far'],
    '乱葬岗·新坟': ['sfx_suona_far'], '三岔口': ['sfx_suona_far'], '村中灵棚': ['sfx_suona_far'],
};

// 节点事件音: [文件, 延迟毫秒 | 'end'(正文打完时), 增益]。没有映射的节点不放事件音。
// nodes.js 的 SFX_MAP(knock/whisper/tinnitus/scream)先按 KIND_SFX 兜底; NODE_EVENTS 里有条目的节点以这里为准。
const KIND_SFX = {
    knock: [['sfx_knock_door_room', 0, 0.9]],
    whisper: [['sfx_whisper_ear', 300, 0.85]],
    tinnitus: [['sfx_tinnitus', 0, 0.55]],
    scream: [['sfx_scream_room', 0, 0.9]],
};
const NODE_EVENTS = {
    // 第一章
    node05: [['sfx_door_creak_open', 'end', 0.7]],
    // 第二章
    node06: [['sfx_door_bolt_room', 150, 0.9], ['sfx_coffin_scratch_inside', 'end', 0.8]],
    node08: [['sfx_footsteps_approach', 200, 0.85], ['sfx_knock_door_room', 'end', 0.95]],
    node08b: [['sfx_stinger_hit_mid', 'end', 0.85]],
    node08c: [['sfx_tinnitus', 600, 0.35]],
    node09: [['sfx_knock_slow_room', 0, 0.95]],
    node09b: [['sfx_paper_page_turn', 'end', 0.8]],
    node10: [['sfx_footsteps_recede', 0, 0.8], ['sfx_coffin_scratch_inside', 'end', 0.75]],
    // 第三章
    node12: [['sfx_wet_squelch', 'end', 0.8], ['sfx_stinger_hit_low', 'end', 0.85]],
    // 第四章
    node13: [['sfx_match_strike', 200, 0.85], ['sfx_oil_lamp_light', 1200, 0.75], ['sfx_paper_effigy_rustle_room', 'end', 0.8]],
    node13b: [['sfx_whisper_ear', 'end', 0.85], ['sfx_stinger_hit_mid', 'end', 0.7]],
    node15: [['sfx_paper_effigy_rustle', 400, 0.8]],
    // 第五章
    node5x_call: [['sfx_knock_slow_room', 0, 0.8], ['sfx_whisper_ear', 'end', 0.85]],
    node18: [['sfx_slam_room', 0, 1.0], ['sfx_stinger_hit_low', 0, 0.8], ['sfx_coffin_lid_slide_room', 700, 0.7]],
    node19: [['sfx_door_bolt', 100, 0.9], ['sfx_wet_drag_room', 'end', 0.8]],
    node20: [['sfx_breath_ear', 'end', 0.8]],
    // 第六章
    node22: [['sfx_wet_drag', 'end', 0.5]],
    node_puzzle_door: [['sfx_bone_crack', 0, 0.9]],
    node_puzzle_success: [['sfx_coffin_lid_slide_room', 0, 0.8]],
    node_genealogy: [['sfx_paper_page_turn', 0, 0.8], ['sfx_paper_page_turn', 1600, 0.7]],
    node_still: [['sfx_breath_ear', 600, 0.8]],
    node22b: [['sfx_stinger_hit_mid', 'end', 0.8]],
    node23: [['sfx_woman_cry_far', 1500, 0.55]],
    // 第七章
    node24: [['sfx_paper_effigy_rustle_room', 'end', 0.85]],
    node7x_coffin_alive: [['sfx_coffin_lid_slide', 0, 0.8], ['sfx_breath_slow', 1500, 0.6], ['sfx_whisper_ear', 'end', 0.8]],
    node25: [['sfx_paper_effigy_rustle', 300, 0.75], ['sfx_cloth_drag', 1600, 0.6]],
    // 第八章
    node26: [['sfx_whisper_ear', 'end', 0.85]],
    node8x_hall: [['sfx_cloth_drag_room', 200, 0.75], ['sfx_gong_room', 'end', 0.7]],
    node8x_veil: [['sfx_cloth_drag_room', 400, 0.6]],
    node8x_mirror: [['sfx_tinnitus', 0, 0.45], ['sfx_stinger_gong_swell', 'end', 0.9]],
    node8x_mother: [['sfx_woman_cry_wall', 300, 0.8]],
    node8x_well_explore: [['sfx_wet_squelch', 2500, 0.4]],
    node9x_yinyang_road: [['sfx_suona_far', 300, 0.8]],
    node9x_join_procession: [['sfx_gong_procession', 0, 0.75], ['sfx_suona_phrase_1', 1500, 0.6]],
    node9x_bus_trap: [['sfx_whisper_ear', 'end', 0.85]],
    // 第九章
    node28: [['sfx_woman_cry_far', 600, 0.6], ['sfx_wet_squelch', 'end', 0.5]],
    node29b: [['sfx_whisper_ear', 'end', 0.75]],
    // 第十章
    node10x_altar: [['sfx_qing_room', 300, 0.7]],
    node10x_recite: [['sfx_muyu_roll', 0, 0.6], ['sfx_tinnitus', 'end', 0.45]],
    node10x_jade: [['sfx_stinger_gong_swell', 'end', 0.9]],
    node10x_bell: [['sfx_bell_copper', 400, 0.6]],
    node_endG2: [['sfx_bell_copper_room', 300, 0.8]],
};
// 死亡节点(isDeath): 低频 stinger + 尖叫
const DEATH_EVENTS = [['sfx_stinger_hit_low', 0, 0.9], ['sfx_scream_room', 120, 0.85]];
// 界面音
const UI_SFX = {
    flip: ['ui_paper_flip', 0.45],        // 打字开始/切节点
    press: ['ui_paper_press', 0.7],       // 按下黄纸(选项确认/按键)
    confirm: ['ui_confirm', 0.6],
    save: ['ui_save', 0.7],
    error: ['ui_error', 0.75],
    reveal: ['ui_reveal', 0.7],           // 提示揭开/线索出现
    light: ['ui_incense_light', 0.7],     // 开始游戏/读档/烧黄纸点火
};
const PRELOAD_ALWAYS = ['ui_paper_flip', 'ui_paper_press', 'ui_confirm', 'ui_save', 'ui_error', 'ui_reveal', 'ui_incense_light',
    'sfx_heartbeat_slow', 'sfx_heartbeat_fast', 'sfx_knock_door', 'sfx_whisper_ear'];

// 心跳两档: 慢档素材约 67bpm, 快档约 106bpm; 用 playbackRate 贴近当前 BPM
const HB = { slow: { id: 'sfx_heartbeat_slow', bpm: 67 }, fast: { id: 'sfx_heartbeat_fast', bpm: 106 } };

// ---------- 底层: 上下文/总线/加载 ----------
function initAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    busMaster = audioCtx.createGain(); busMaster.gain.value = MASTER_GAIN;
    // 保护性限幅: 只在多层叠加冲顶时介入, 平时不动
    limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.2;
    // 规范里 DynamicsCompressor 会自动加"补偿增益"(满幅点被压了多少就按 0.6 次方提回来), 这里反向抵掉, 保住 -3dB 余量
    const th = -6, ratio = 20, fullRangeDb = th + (0 - th) / ratio;
    limiterTrim = audioCtx.createGain(); limiterTrim.gain.value = Math.pow(10, (0.6 * fullRangeDb) / 20);
    busMaster.connect(limiter); limiter.connect(limiterTrim); limiterTrim.connect(audioCtx.destination);
    busBgm = audioCtx.createGain(); busBgm.gain.value = GROUP_GAIN.bgm; busBgm.connect(busMaster);
    busAmb = audioCtx.createGain(); busAmb.gain.value = GROUP_GAIN.amb; busAmb.connect(busMaster);
    busSfx = audioCtx.createGain(); busSfx.gain.value = GROUP_GAIN.sfx; busSfx.connect(busMaster);
    if (sfxEnabled) preloadIds(PRELOAD_ALWAYS);
}

function resumeAudio() {
    initAudio();
    if (audioCtx && audioCtx.state !== 'running') { try { audioCtx.resume(); } catch (e) {} }
}

// 首次用户手势解锁(iOS 需要在手势里 resume + 播一个静音 buffer)
let unlocked = false;
const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'];
function unlockOnGesture() {
    initAudio();
    if (!audioCtx) return;
    try {
        if (audioCtx.state !== 'running') audioCtx.resume();
        const b = audioCtx.createBuffer(1, 1, 22050);
        const s = audioCtx.createBufferSource(); s.buffer = b; s.connect(audioCtx.destination); s.start(0);
    } catch (e) {}
    if (!unlocked) { unlocked = true; UNLOCK_EVENTS.forEach((t) => window.removeEventListener(t, unlockOnGesture, true)); }
}
if (typeof window !== 'undefined') UNLOCK_EVENTS.forEach((t) => window.addEventListener(t, unlockOnGesture, { capture: true, passive: true }));

let preferExt = null;
function pickExt() {
    if (preferExt) return preferExt;
    let ogg = '';
    try { ogg = document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"'); } catch (e) {}
    const ua = navigator.userAgent || '';
    const webkitOnly = /iP(hone|ad|od)/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|Android/.test(ua));
    preferExt = (!webkitOnly && ogg) ? 'ogg' : 'mp3';
    return preferExt;
}
function urlFor(id, ext) {
    const dir = id.startsWith('amb_') ? 'ambience/' : 'sfx/';
    return V2_BASE + dir + id + '.' + ext + '?v=' + V2_VER;
}
function decode(buf) {
    return new Promise((resolve, reject) => {
        try {
            const p = audioCtx.decodeAudioData(buf, resolve, reject);   // 旧 Safari 只认回调
            if (p && p.then) p.then(resolve, reject);
        } catch (e) { reject(e); }
    });
}
const buffers = new Map();   // id -> AudioBuffer
const loading = new Map();   // id -> Promise
const failed = new Set();
async function fetchDecode(id, ext) {
    const res = await fetch(urlFor(id, ext));
    if (!res.ok) throw new Error(res.status + ' ' + id + '.' + ext);
    return decode(await res.arrayBuffer());
}
function loadBuffer(id) {
    if (!audioCtx || failed.has(id)) return Promise.resolve(null);
    if (buffers.has(id)) return Promise.resolve(buffers.get(id));
    if (loading.has(id)) return loading.get(id);
    const ext = pickExt();
    const p = fetchDecode(id, ext)
        .catch((e) => {
            if (ext !== 'ogg') throw e;
            preferExt = 'mp3';             // 这台设备解不了 ogg: 之后统一走 mp3
            return fetchDecode(id, 'mp3');
        })
        .then((b) => { buffers.set(id, b); loading.delete(id); return b; })
        .catch((e) => { console.warn('[audio] 加载失败', id, e && e.message); failed.add(id); loading.delete(id); return null; });
    loading.set(id, p);
    return p;
}
function preloadIds(ids) { if (!audioCtx) return; ids.forEach((id) => { if (id) loadBuffer(id); }); }

// ---------- 一次性事件音 ----------
const liveVoices = new Set();
const playedLog = [];          // 最近发声记录 [时间ms, 素材id], 仅供 QA 读取
const MAX_VOICES = 10;
function startVoice(buf, gain, opts = {}) {
    if (!audioCtx || !sfxEnabled || !buf) return null;
    if (liveVoices.size >= MAX_VOICES) { const old = liveVoices.values().next().value; stopVoice(old, 0.05); }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    if (opts.rate) src.playbackRate.value = opts.rate;
    const g = audioCtx.createGain();
    g.gain.value = gain;
    src.connect(g); g.connect(opts.bus || busSfx);
    const v = { src, g, id: opts.id };
    src.onended = () => { liveVoices.delete(v); try { g.disconnect(); } catch (e) {} };
    src.start();
    liveVoices.add(v);
    playedLog.push([Math.round(performance.now()), opts.id]);
    if (playedLog.length > 300) playedLog.shift();
    return v;
}
function stopVoice(v, fade = 0.15) {
    if (!v || !audioCtx) return;
    liveVoices.delete(v);
    try {
        const t = audioCtx.currentTime;
        v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + fade);
        v.src.stop(t + fade + 0.02);
    } catch (e) {}
}
// 播放一个素材; 尚未加载时边下边等, 超过 maxWait 毫秒才到就丢弃(避免事件音迟到乱响)
function playId(id, gain = 0.8, opts = {}) {
    if (!audioCtx || !sfxEnabled || !id) return;
    const buf = buffers.get(id);
    if (buf) { startVoice(buf, gain, { ...opts, id }); return; }
    const asked = performance.now();
    const maxWait = opts.maxWait != null ? opts.maxWait : 1500;
    const token = opts.token;
    loadBuffer(id).then((b) => {
        if (!b || performance.now() - asked > maxWait) return;
        if (token != null && token !== nodeToken) return;
        startVoice(b, gain, { ...opts, id });
    });
}

// ---------- 对外: 兼容旧接口 ----------
function setSfxEnabled(v) {
    sfxEnabled = !!v;
    if (!sfxEnabled) {
        stopHeartbeat(true);
        stopBgm(true);
        const keep = ambWanted, keepSpots = ambSpots;
        stopAmbience(true);
        ambWanted = keep; ambSpots = keepSpots;      // 记住, 重新打开时恢复
        liveVoices.forEach((x) => stopVoice(x, 0.1));
    } else if (audioCtx) {
        preloadIds(PRELOAD_ALWAYS);
        if (curChapter) preloadChapter(curChapter);
        if (ambWanted) applyAmbience(ambWanted, true, ambSpots);
    }
}

// 旧代码里 playTone 是"给个频率响一下"的界面反馈; 现在按原调用的用途映射到真实素材(不再有振荡器):
//   320Hz 短方波=密码键   180Hz=发现线索   260Hz=解谜成功   140Hz=烧黄纸看提示
//   200Hz 锯齿=监控警报   100Hz 短=关闭监控   100Hz 长=结局余韵
function playTone(freq, duration, type = 'sine', vol = 0.1) {
    if (!audioCtx || !sfxEnabled) return;
    if (freq >= 300 && duration < 0.2) { playUi('press'); return; }
    if (freq === 180) { playUi('reveal'); return; }
    if (freq === 260) { playId('sfx_qing', 0.55); return; }
    if (freq === 140) { playUi('light'); setTimeout(() => playUi('reveal'), 350); return; }
    if (freq === 200 && type === 'sawtooth') { playId('sfx_stinger_hit_high', 0.55); return; }
    if (freq <= 110 && duration >= 2) { playId('sfx_qing_room', 0.7); return; }
    if (freq <= 110) { playUi('flip'); return; }
    playUi('press');
}

function playUi(name) {
    const u = UI_SFX[name];
    if (u) playId(u[0], u[1], { maxWait: 600 });
}

function playScream() { playId('sfx_scream_room', 0.85); }
function playKnock() { playId('sfx_knock_door', 0.85); }
function playWhisper() { playId(Math.random() < 0.7 ? 'sfx_whisper_ear' : 'sfx_breath_ear', 0.8); }
function playTinnitus() { playId('sfx_tinnitus', 0.5); }
function playJumpscareSfx() { playId('sfx_stinger_suona_crack', 1.0, { maxWait: 800 }); }
// 唢呐悲句: 改为三段真实葬仪唢呐录音随机一段(室内混响版)
function playSuonaPhrase(_destGain, volScale = 1) {
    const n = 1 + Math.floor(Math.random() * 3);
    playId('sfx_suona_phrase_' + n + '_room', 0.6 * (volScale || 1));
}

// ---------- 心跳: 慢/快两档循环, 随 BPM 变速 ----------
let hb = null;            // { tier, v, rate }
let hbFadeTimer = null;
let heartbeatToken = 0;
function stopHeartbeat(immediate = false) {
    heartbeatToken++;
    if (hbFadeTimer) { clearTimeout(hbFadeTimer); hbFadeTimer = null; }
    if (hb) { stopVoice(hb.v, immediate ? 0.05 : 0.8); hb = null; }
}
function playHeartbeat(bpm) {
    if (!audioCtx || !sfxEnabled || !(bpm > 0)) return;
    const token = ++heartbeatToken;
    const tier = bpm <= 88 ? 'slow' : 'fast';
    const rate = Math.max(0.8, Math.min(1.9, bpm / HB[tier].bpm));
    const level = bpm <= 70 ? 0.35 : bpm <= 100 ? 0.5 : bpm <= 160 ? 0.62 : 0.75;
    if (hbFadeTimer) { clearTimeout(hbFadeTimer); hbFadeTimer = null; }
    const t = audioCtx.currentTime;
    if (hb && hb.tier === tier) {
        hb.v.src.playbackRate.cancelScheduledValues(t);
        hb.v.src.playbackRate.setTargetAtTime(rate, t, 0.4);
        hb.v.g.gain.cancelScheduledValues(t); hb.v.g.gain.setValueAtTime(hb.v.g.gain.value, t);
        hb.v.g.gain.setTargetAtTime(level, t, 0.3);
        hb.rate = rate;
    } else {
        if (hb) stopVoice(hb.v, 0.6);
        hb = null;
        loadBuffer(HB[tier].id).then((buf) => {
            if (!buf || token !== heartbeatToken || !sfxEnabled) return;
            const v = startVoice(buf, 0, { rate, id: HB[tier].id });
            if (!v) return;
            liveVoices.delete(v);          // 心跳自己管理, 不占事件音配额
            v.src.loop = true;
            v.g.gain.setTargetAtTime(level, audioCtx.currentTime, 0.25);
            hb = { tier, v, rate };
        });
    }
    // 平静时只跳十来下就淡出(和旧版一致), 紧张时一直跳到下个节点
    if (bpm <= 65) hbFadeTimer = setTimeout(() => { if (token === heartbeatToken) stopHeartbeat(false); }, 9000);
}

// ---------- 环境层 ----------
const ambLive = new Map();   // id -> voice
let ambWanted = null;        // 当前应在播的 [[id,gain]...]
let ambSpots = null;
let ambKey = '';
let spotTimer = null;
const ambRecent = new Set();   // 最近用过的环境 id(按使用先后)
const AMB_KEEP = 4;
function stopAmbience(immediate = false) {
    if (spotTimer) { clearTimeout(spotTimer); spotTimer = null; }
    ambLive.forEach((v) => stopVoice(v, immediate ? 0.1 : 2.5));
    ambLive.clear();
    ambKey = '';
    ambWanted = null; ambSpots = null;
}
function applyAmbience(layers, force = false, spots = null) {
    ambWanted = layers; ambSpots = spots;
    if (!audioCtx || !sfxEnabled) return;
    const key = layers.map((l) => l[0] + ':' + l[1]).join('|') + '#' + (spots || []).join(',');
    if (key === ambKey && !force) return;
    ambKey = key;
    const want = new Map(layers.map((l) => [l[0], l[1]]));
    // 不再需要的层淡出(约 2.5 秒), 新层同时淡入 = 交叉淡变
    ambLive.forEach((v, id) => { if (!want.has(id)) { stopVoice(v, 2.5); ambLive.delete(id); } });
    want.forEach((gain, id) => {
        const cur = ambLive.get(id);
        if (cur) {
            const t = audioCtx.currentTime;
            cur.g.gain.cancelScheduledValues(t); cur.g.gain.setValueAtTime(cur.g.gain.value, t);
            cur.g.gain.setTargetAtTime(gain, t, 0.8);
            return;
        }
        loadBuffer(id).then((buf) => {
            if (!buf || !sfxEnabled || ambLive.has(id) || !ambWanted || !ambWanted.some((l) => l[0] === id)) return;
            const src = audioCtx.createBufferSource();
            src.buffer = buf; src.loop = true;
            const g = audioCtx.createGain(); g.gain.value = 0;
            src.connect(g); g.connect(busAmb);
            src.start(0, Math.random() * buf.duration * 0.9);
            g.gain.setTargetAtTime(gain, audioCtx.currentTime, 0.9);
            ambLive.set(id, { src, g, id });
        });
    });
    // 偶发点缀
    if (spotTimer) { clearTimeout(spotTimer); spotTimer = null; }
    if (spots && spots.length) {
        const fire = () => {
            spotTimer = setTimeout(() => {
                playId(spots[Math.floor(Math.random() * spots.length)], 0.45, { bus: busAmb, maxWait: 4000 });
                fire();
            }, 25000 + Math.random() * 30000);
        };
        fire();
    }
    // 环境 buffer 解码后单条 7~25MB: 只留最近用过的 AMB_KEEP 条(含正在播的), 更早的释放, 再用时走 HTTP 缓存
    want.forEach((g, id) => { ambRecent.delete(id); ambRecent.add(id); });
    while (ambRecent.size > AMB_KEEP) {
        const oldest = ambRecent.values().next().value;
        ambRecent.delete(oldest);
        if (!want.has(oldest)) buffers.delete(oldest);
    }
}

// ---------- 节点驱动 ----------
const CN_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
function chapterNum(ch) {
    const m = /第([一二三四五六七八九十]+)章/.exec(ch || '');
    if (!m) return 0;
    const s = m[1];
    if (s === '十') return 10;
    if (s.length === 2 && s[0] === '十') return 10 + CN_NUM[s[1]];
    return CN_NUM[s] || 0;
}
let nodeToken = 0;
let endQueue = [];
const playedNodes = new Set();   // 本局已放过事件音的节点: 从探索/特写返回同一节点时不重复敲门/落闩
let chapterFiles = {};    // 章节号 -> Set(文件 id)(由 audioRegisterNodes 计算)
let sfxKindMap = {};
let curChapter = 0;
let prefetchTimer = null;

function ambienceFor(nodeId, node) {
    if (NODE_AMB[nodeId]) return NODE_AMB[nodeId];
    return SCENE_AMB[node.sceneName] || CHAPTER_AMB[chapterNum(node.chapter)] || null;
}
function eventsFor(nodeId, node, kind) {
    if (NODE_EVENTS[nodeId]) return NODE_EVENTS[nodeId];
    if (node && node.isDeath) return DEATH_EVENTS;
    return (kind && KIND_SFX[kind]) || [];
}

// app 启动时登记全部节点, 用来算每章要预载哪些文件
function audioRegisterNodes(nodes, sfxMap) {
    sfxKindMap = sfxMap || {};
    chapterFiles = {};
    Object.keys(nodes || {}).forEach((id) => {
        const n = nodes[id];
        const c = chapterNum(n.chapter);
        const set = chapterFiles[c] || (chapterFiles[c] = new Set());
        if (!n.isDeath && !n.isEnding && !n.isFinal) (ambienceFor(id, n) || []).forEach((l) => set.add(l[0]));
        (SCENE_SPOTS[n.sceneName] || []).forEach((x) => set.add(x));
        eventsFor(id, n, sfxKindMap[id]).forEach((e) => set.add(e[0]));
    });
}
function preloadChapter(c) {
    const set = chapterFiles[c];
    if (set) preloadIds(Array.from(set));
}
// 进入新章 8 秒后, 顺手预取下一章的事件音(小文件; 环境音不提前下)
function prefetchNextChapterEvents(c) {
    const set = chapterFiles[c + 1];
    if (set) preloadIds(Array.from(set).filter((id) => !id.startsWith('amb_')));
}

// 每进一个节点调用一次(替代旧的 SFX_MAP 分支)
function audioEnterNode(nodeId, node, sfxKind) {
    if (!node) return;
    const token = ++nodeToken;
    endQueue = [];
    initAudio();
    const c = chapterNum(node.chapter);
    if (c && c !== curChapter) {
        curChapter = c;
        if (sfxEnabled) preloadChapter(c);
        if (prefetchTimer) clearTimeout(prefetchTimer);
        prefetchTimer = setTimeout(() => { if (sfxEnabled) prefetchNextChapterEvents(c); }, 8000);
    }
    // 环境: 结局/最终淡出交给结局 BGM; 死亡维持当前环境
    if (node.isEnding || node.isFinal) { stopHeartbeat(false); stopAmbience(false); }
    else if (!node.isDeath) {
        const layers = ambienceFor(nodeId, node);
        if (layers) applyAmbience(layers, false, SCENE_SPOTS[node.sceneName] || null);
    }
    // 事件音(每局每个节点只放一次; 死亡每次都放)
    if (playedNodes.has(nodeId) && !node.isDeath) return;
    playedNodes.add(nodeId);
    eventsFor(nodeId, node, sfxKind).forEach(([id, at, gain]) => {
        if (at === 'end') endQueue.push([id, gain]);
        else if (!at) playId(id, gain, { token });
        else setTimeout(() => { if (token === nodeToken) playId(id, gain, { token }); }, at);
    });
}
// 正文打完(或被玩家点掉)时调用: 放 'end' 事件(惊吓 stinger 等落在字出完的那一下)
function audioTextDone() {
    const q = endQueue; endQueue = [];
    const token = nodeToken;
    q.forEach(([id, gain], i) => setTimeout(() => { if (token === nodeToken) playId(id, gain, { token }); }, i * 60));
}
// 回到开始界面/重开: 停环境和心跳
function audioReset() {
    nodeToken++; endQueue = []; curChapter = 0; playedNodes.clear();
    stopHeartbeat(true);
    stopAmbience(false);
}

// ===== BGM(真实音频文件, 经 WebAudio 的 bgm 总线) =====
const BGM_FILES = {
    base:    'audio/bgm_ambient_loop.mp3',   // 全程氛围铺底(可循环)
    wedding: 'audio/bgm_suona_climax.mp3',   // 冥婚/阴阳: 唢呐送葬悲调
    ritual:  'audio/bgm_suona_climax.mp3',   // 回魂: 同上
    ending:  'audio/bgm_ending_relief.mp3',  // 感人结局: 哀婉释怀
};
const BGM_VOL = { base: 0.5, wedding: 0.62, ritual: 0.62, ending: 0.66 };
const liveBgm = new Set();   // { el, g, fadeTimer }
let bgmToken = 0;

function killBgm(b) {
    if (!b) return;
    if (b.fadeTimer) { clearInterval(b.fadeTimer); b.fadeTimer = null; }
    try { b.el.pause(); } catch (e) {}
    try { if (b.g) b.g.disconnect(); } catch (e) {}
    liveBgm.delete(b);
}
function fadeBgm(b, to, ms, onDone) {
    if (b.g && audioCtx) {
        const t = audioCtx.currentTime;
        b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t);
        b.g.gain.linearRampToValueAtTime(to, t + ms / 1000);
        if (onDone) setTimeout(onDone, ms + 50);
        return;
    }
    // 没有 WebAudio 时退回元素音量
    if (b.fadeTimer) clearInterval(b.fadeTimer);
    const from = b.el.volume, steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    b.fadeTimer = setInterval(() => {
        i++;
        b.el.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
        if (i >= steps) { clearInterval(b.fadeTimer); b.fadeTimer = null; if (onDone) onDone(); }
    }, 50);
}
function startBgm(mood = 'base') {
    initAudio();
    if (!sfxEnabled) return;
    stopBgm(false);                     // 旧曲淡出, 新曲淡入 = 交叉淡变
    const token = bgmToken;
    const target = BGM_VOL[mood] || 0.5;
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    const b = { el, g: null, fadeTimer: null };
    if (audioCtx) {
        try {
            const srcNode = audioCtx.createMediaElementSource(el);
            b.g = audioCtx.createGain(); b.g.gain.value = 0;
            srcNode.connect(b.g); b.g.connect(busBgm);
        } catch (e) { b.g = null; }
    }
    if (!b.g) el.volume = 0;
    let started = false;
    el.addEventListener('canplay', () => {
        if (started) return;
        started = true;
        if (token !== bgmToken) { killBgm(b); return; }
        liveBgm.add(b);
        el.play().then(() => {
            if (token !== bgmToken) { killBgm(b); return; }
            fadeBgm(b, b.g ? target : target * GROUP_GAIN.bgm, 2500);
        }).catch(() => killBgm(b));
    }, { once: true });
    el.addEventListener('error', () => { console.warn('[audio] BGM 加载失败', mood); killBgm(b); }, { once: true });
    el.src = (BGM_FILES[mood] || BGM_FILES.base) + '?v=' + AUDIO_VER;
    el.load();
}
function stopBgm(immediate = false) {
    bgmToken++;
    for (const b of Array.from(liveBgm)) {
        if (immediate) killBgm(b);
        else fadeBgm(b, 0, 1500, () => killBgm(b));
    }
}

// ---------- 调试/验收用只读状态(QA 脚本读取) ----------
let meterPeak = 0, meterTimer = null;
function audioDebugState() {
    return {
        ctx: audioCtx ? audioCtx.state : 'none',
        ext: preferExt,
        sfxEnabled,
        chapter: curChapter,
        ambience: Array.from(ambLive.keys()),
        heartbeat: hb ? { tier: hb.tier, rate: +hb.rate.toFixed(2) } : null,
        bgm: liveBgm.size,
        voices: Array.from(liveVoices).map((v) => v.id),
        loaded: Array.from(buffers.keys()),
        failed: Array.from(failed),
        peak: meterPeak,
        played: playedLog.slice(),
    };
}
// 电平表(只在 QA 时手动打开): 记录限幅器输出的最大采样峰值
function audioMeter(on) {
    if (!audioCtx) return;
    if (on && !meterNode) {
        meterNode = audioCtx.createAnalyser(); meterNode.fftSize = 2048;
        limiterTrim.connect(meterNode);
        const data = new Float32Array(meterNode.fftSize);
        meterTimer = setInterval(() => {
            meterNode.getFloatTimeDomainData(data);
            for (let i = 0; i < data.length; i++) { const a = Math.abs(data[i]); if (a > meterPeak) meterPeak = a; }
        }, 40);
    } else if (!on && meterNode) { clearInterval(meterTimer); try { limiterTrim.disconnect(meterNode); } catch (e) {} meterNode = null; }
}
if (typeof window !== 'undefined') window.__hhyAudio = { state: audioDebugState, meter: audioMeter, resetPeak: () => { meterPeak = 0; } };

export {
    initAudio, resumeAudio, playTone, playHeartbeat, playScream, playKnock, playWhisper, playTinnitus,
    startBgm, stopBgm, playSuonaPhrase, playJumpscareSfx, setSfxEnabled,
    // v2 新增(调用方用命名空间可选调用, 即使浏览器缓存了旧 audio.js 也不会让 app 崩)
    playUi, audioEnterNode, audioTextDone, audioRegisterNodes, audioReset, stopHeartbeat,
};
