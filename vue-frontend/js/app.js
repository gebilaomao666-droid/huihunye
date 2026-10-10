import { apiPost, apiGet, isApiOffline } from './api.js?v=20261010-pwa';
import { initAudio, resumeAudio, playTone, playHeartbeat, playScream, playKnock, playWhisper, playTinnitus, startBgm, stopBgm, playSuonaPhrase, playJumpscareSfx, setSfxEnabled } from './audio.js?v=20261010-pwa';
// v2 音频新增接口用命名空间按需调用(浏览器若还缓存着旧 audio.js 也不会因缺导出而整页报错)
import * as audioExt from './audio.js?v=20261010-pwa';
import { NODES, ITEMS, HINT_SYSTEM, BPM_MAP, SFX_MAP, MESSAGES } from './nodes.js?v=20261010-pwa';
import { t, setLang, getLang } from './i18n.js?v=20261010-pwa';
import { gameRuntime } from './rpg/runtimeInstance.js?v=20261010-pwa';
import { getVisibleHotspots, resolveHotspot } from './rpg/sceneEngine.js?v=20261010-pwa';
import { CHAPTER_BACKGROUNDS, objectiveForNode, sceneNameForChapter, speakerForCharacter } from './rpg/assets.js?v=20261010-pwa';
import { KEYS, readJSON, writeJSON, readRaw, writeRaw, remove as removeKey } from './storage.js?v=20261010-pwa';
import { sceneMixin } from './sceneMixin.js?v=20261010-pwa';
import { uiMixin } from './uiMixin.js?v=20261010-pwa';
import { smsMixin } from './smsMixin.js?v=20261010-pwa';
import { persistenceMixin } from './persistenceMixin.js?v=20261010-pwa';

const { createApp } = Vue;

// 理智过低时随机注入的幻觉句池
const HALLUCINATIONS = [
    '（你眼角的余光里，墙上的影子比你多动了一下。）',
    '（有人在你耳边很轻地、很慢地数着数：……四，五。）',
    '（你低头看自己的手，怎么数都数不清到底有几根手指。）',
    '（屋子里飘着一股香灰味，可这里并没有点香。）',
    '（你听见自己的名字被人念了一遍——声音是从你身后传来的。）'
];

const DEFAULT_STATS = () => ({ sanity: 100, maxSanity: 100, fear: 0, maxFear: 100 });

// 结局代号 → 结局名(从剧情数据取; 同一代号有多个收尾时名字用“/”连起来, 如 G)
const ENDING_NAMES = {};
Object.values(NODES).forEach((n) => {
    if (!n || !n.endingCode || !n.endingName) return;
    const names = ENDING_NAMES[n.endingCode] ? ENDING_NAMES[n.endingCode].split('/') : [];
    if (!names.includes(n.endingName)) names.push(n.endingName);
    ENDING_NAMES[n.endingCode] = names.join('/');
});
const ALL_ENDING_CODES = Object.keys(ENDING_NAMES);
const ALL_DEATH_NODE_IDS = Object.keys(NODES).filter((id) => NODES[id] && NODES[id].isDeath);
const TRUE_ENDING_CODE = 'H';
// 收集册「死法」页: 每种死法一块木牌(同名死法只算一块, 按剧情顺序)
const DEATH_CATALOG = [];
ALL_DEATH_NODE_IDS.forEach((id) => {
    const n = NODES[id];
    const name = n.deathName || '无名之死';
    const hit = DEATH_CATALOG.find((d) => d.name === name);
    if (hit) hit.ids.push(id);
    else DEATH_CATALOG.push({ id, ids: [id], name, desc: n.deathDesc || '', chapter: n.chapter || '' });
});
const NUMERALS = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
const PAPER_CLOSEUP = /纸|符|帖|字条|遗书|书信|族谱|名册|黄裱|告示/;

// 本地内置成就表(不依赖后端; 有后端时只做同步)
const ACHIEVEMENT_DEFS = [
    { code: 'first_death', name: '初尝死味', desc: '第一次死亡', icon: '💀', rarity: 'common' },
    { code: 'survivor', name: '幸存者', desc: '走到任意一个结局', icon: '🕯️', rarity: 'common' },
    ...ALL_ENDING_CODES.map((c) => ({
        code: 'ending_' + c, name: '结局·' + ENDING_NAMES[c], desc: '打出结局「' + ENDING_NAMES[c] + '」',
        icon: '📜', rarity: c === TRUE_ENDING_CODE ? 'legendary' : (c === 'G' ? 'rare' : 'common'), secret: true
    })),
    { code: 'true_end', name: '回魂', desc: '打出真结局', icon: '🏮', rarity: 'legendary', secret: true },
    { code: 'all_endings', name: '全结局收集', desc: '解锁全部 ' + ALL_ENDING_CODES.length + ' 个结局', icon: '📖', rarity: 'epic' },
    { code: 'all_deaths', name: '死过九回', desc: '体验全部 ' + ALL_DEATH_NODE_IDS.length + ' 种死法', icon: '☠️', rarity: 'rare' },
    { code: 'no_death', name: '无伤通关', desc: '一局里一次没死就走到结局', icon: '✨', rarity: 'legendary' },
    { code: 'speedrun', name: '速通大师', desc: '10 分钟内走到结局', icon: '⚡', rarity: 'epic' },
    { code: 'no_hint', name: HINT_SYSTEM.noHintAchievement, desc: '整局一张黄纸都没烧，走到结局', icon: '🕯️', rarity: 'epic', secret: true },
    { code: 'night_owl', name: '夜猫子', desc: '在真实时间 23:00-04:00 之间入宅', icon: '🌙', rarity: 'common' },
];

const Rpg2DStage = {
    props: {
        screen: String,
        rpgMode: Boolean,
        bgImageUrl: String,
        bgImageVisible: Boolean,
        bgImageTransition: Boolean,
        sceneIntroActive: Boolean,
        characterVisible: Boolean,
        characterUrl: String,
        characterEmotion: String,
        characterPosition: String,
        characterFlicker: Boolean,
        noiseActive: Boolean,
        ghostOpacity: Number,
        chapter: String,
        paused: Boolean
    },
    computed: {
        stageStyle() {
            return {
                '--ghost-opacity': this.ghostOpacity || 0
            };
        },
        backdropStyle() {
            const image = this.bgImageUrl
                ? `url("${this.bgImageUrl}")`
                : 'linear-gradient(180deg, #090303, #000)';
            return {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.68)), ${image}`
            };
        },
        chapterMood() {
            if (!this.chapter) return 'mood-road';
            if (this.chapter.includes('末班车') || this.chapter.includes('夜路')) return 'mood-road';
            if (['三条', '纸人围灵', '出棺', '真相'].some((w) => this.chapter.includes(w))) return 'mood-house';
            if (this.chapter.includes('厨房')) return 'mood-kitchen';
            if (this.chapter.includes('地下')) return 'mood-basement';
            if (this.chapter.includes('纸人村')) return 'mood-village';
            if (this.chapter.includes('冥婚')) return 'mood-wedding';
            return 'mood-ritual';
        }
    },
    template: `
        <div
            id="rpg-2d-stage"
            v-if="screen === 'game'"
            :class="[
                chapterMood,
                {
                    'is-rpg': rpgMode,
                    transitioning: bgImageTransition,
                    'scene-intro-view': sceneIntroActive,
                    'has-character': characterVisible,
                    noisy: noiseActive,
                    'stage-paused': paused
                }
            ]"
            :style="stageStyle"
        >
            <div class="stage-layer stage-backdrop" :style="backdropStyle"></div>
            <div class="stage-layer stage-mid"></div>
            <div class="stage-layer stage-light left"></div>
            <div class="stage-layer stage-light right"></div>
            <div class="stage-layer stage-paper paper-a"></div>
            <div class="stage-layer stage-paper paper-b"></div>
            <div class="stage-layer stage-paper paper-c"></div>
            <transition name="char-slide">
                <div
                    id="character-portrait"
                    v-if="characterVisible"
                    :class="[characterEmotion, characterPosition, { flicker: characterFlicker }]"
                >
                    <img :src="characterUrl" class="char-img" alt="">
                    <div class="char-shadow"></div>
                </div>
            </transition>
            <div class="stage-layer stage-foreground"></div>
            <div id="vignette"></div>
            <div id="scanlines"></div>
            <div id="noise" v-if="noiseActive"></div>
        </div>
    `
};

createApp({
    mixins: [sceneMixin, uiMixin, smsMixin, persistenceMixin],
    components: {
        'rpg-2d-stage': Rpg2DStage
    },
    data() {
        return {
            // 屏幕状态
            screen: 'start',
            chapterCheckpoint: null,
            loading: true,

            // 玩家信息
            playerName: '',
            sessionId: null,
            playerId: '',

            // 游戏状态
            currentNodeId: 'node01',
            currentNode: null,
            choicePath: [],
            pathVia: [],          // 与 choicePath 对齐: 该步是从哪个探索热点/出口走的(选项为 null)
            resumeInfo: null,     // 开始界面"继续上次"用的续玩快照
            starting: false,
            lastWordSubmitting: false,
            lastWordSent: false,
            inventory: [],
            flags: {},
            deathCount: 0,

            // 文字显示
            displayText: '',
            isTyping: false,
            fullText: '',
            typeTextToken: 0,
            typeTextTimer: null,
            // 对白分页: 当前页序号 / 总页数 / 本页已打完在等翻页
            pageIndex: 0,
            pageCount: 1,
            pageWaiting: false,

            // 恐怖氛围
            ghostOpacity: 0.01,
            signalBars: 4,
            batteryPercent: 80,
            gameTime: '23:30',
            showStatusBar: true,
            showChapter: true,
            chapterTitle: '',
            chapterTitleVisible: false,
            noiseActive: false,
            uiShatter: false,
            stageIntroActive: false,
            stageIntroTimer: null,
            sceneIntroActive: false,
            sceneIntroDarkening: false,
            sceneIntroAfterClose: null,

            // Jumpscare
            jumpscareVisible: false,

            // 手机短信UI
            smsVisible: false,
            smsSender: '',
            smsContent: '',
            smsHistory: [],
            smsTyping: false,
            smsCreepy: false,
            smsDate: '',

            // 遗言
            lastWordInput: '',
            randomLastWord: null,

            // 场景图片
            sceneImageVisible: false,
            sceneImageUrl: '',
            sceneImageNext: null,
            sceneImageAfterClose: null,
            sceneImageReady: false,
            sceneImageCloseQueued: false,

            // ===== 新增：场景背景系统 =====
            bgImageVisible: false,
            bgImageUrl: '',
            bgImageTransition: false,

            // ===== 新增：角色立绘系统 =====
            characterVisible: false,
            characterUrl: '',
            characterEmotion: 'normal',   // normal | grin | angry | fade | ghost
            characterPosition: 'right',   // left | right | center
            characterFlicker: false,

            // ===== 新增：死亡CG系统 =====
            deathCGVisible: false,
            deathCGUrl: '',
            deathCGName: '',
            deathCGDesc: '',

            // ===== 新增：结局插图系统 =====
            endingCGVisible: false,
            endingCGUrl: '',

            // 监控画面
            camAlertVisible: false,
            camAlertNext: null,

            // 手机开机过程
            phoneBooting: false,
            phoneBootStep: 0,

            // 弹幕
            danmuList: [],
            danmuId: 0,

            // 统计
            stats: { total_sessions: 0, total_deaths: 0 },
            onlineInfo: null,
            deathCountGlobal: 0,
            lastDeathInfo: null,

            // 结局
            endingText: '',

            // 多周目 / 收集
            endingCollection: [],
            showEndingBook: false,
            saveSlots: [],
            showSaveMenu: false,

            // 成就系统
            achievements: [],
            showAchievementMenu: false,
            achievementToast: null,
            lang: getLang(),
            gameStartTime: null,

            // 分享卡片
            shareCardVisible: false,
            shareCardDataUrl: '',

            // 场景探索
            sceneExploreVisible: false,
            exploreSceneId: '',
            exploreImage: '',
            exploreHotspots: [],
            exploreAllHotspots: [],
            exploreTitle: '',
            exploreHint: '',
            exploreReturnNode: null,
            exploreCloseText: '',
            exploreNoClose: false,

            // 谜题面板(数据见 nodes.js PUZZLES)
            puzzleVisible: false,
            puzzleId: null,
            puzzleCtx: null,
            puzzleIntro: '',
            puzzleMsg: '',
            puzzleInput: '',
            puzzlePhase: '',
            puzzleRoadStep: 0,
            puzzleRoadLook: 0,
            puzzleHeights: [],
            allEndingCodes: ALL_ENDING_CODES,

            // 确认弹窗(askConfirm)
            confirmState: null,
            // 收集册
            bookTab: 'ending',
            epitaphs: [],
            deathsSeenList: [],

            // 道具特写
            closeupVisible: false,
            closeupImage: '',
            closeupTitle: '',
            closeupText: '',
            closeupHint: '',
            closeupNextNode: null,

            // 耳机检测
            headphoneWarned: false,

            // 真实时间彩蛋
            realHour: new Date().getHours(),
            isLateNight: new Date().getHours() >= 0 && new Date().getHours() < 5,
            lunarDate: '',
            showEasterEgg: false,
            easterEggText: '',

            // ===== RPG系统 =====
            rpgMode: true,
            showRpgHud: true,
            playerStats: DEFAULT_STATS(),
            menuVisible: false,
            inventoryVisible: false,
            settingsVisible: false,
            // 手机: 「添加到桌面」与全屏
            isPhone: false,
            isStandalone: false,
            installHintVisible: false,
            fullscreenOn: false,
            showSaveMenuRpg: false,
            pageHidden: false,
            selectedItem: null,
            textSpeed: 3,
            soundEnabled: true,
            vibrationEnabled: true,
        };
    },

    computed: {
        // 性能: 页面不可见或全屏面板/图层盖住舞台时, 暂停舞台层的无限循环动画(灯笼/纸钱/扫描线等)
        stagePaused() {
            return this.pageHidden || this.menuVisible || this.inventoryVisible || this.settingsVisible ||
                this.showSaveMenuRpg || this.showSaveMenu || this.showEndingBook || this.showAchievementMenu ||
                this.sceneImageVisible || this.sceneExploreVisible || this.puzzleVisible || this.closeupVisible ||
                this.deathCGVisible || this.endingCGVisible || this.smsVisible || this.camAlertVisible || this.shareCardVisible;
        },
        // 剧情推进度 0→1: 综合 ghostOpacity(每次选择递增, 已持久化)与恐惧值; 驱动对白颜色由米黄渐变到血红
        storyProgress() {
            const g = Math.min(Math.max(this.ghostOpacity || 0, 0), 1);
            const fear = (this.playerStats && this.playerStats.fear) ? this.playerStats.fear / 100 : 0;
            return Math.min(g * 0.7 + fear * 0.3, 1);
        },
        // 对白颜色: 在 JS 端线性插值(陈旧米黄 #e7d6b0 → 血红 #bf2018), 比 CSS color-mix 在旧 webview 更可靠
        storyInkColor() {
            const p = this.storyProgress;
            const a = [232, 217, 176], b = [226, 128, 104];   // 米黄 → 血色米红(底是暗红漆板, 纯血红看不清)
            const c = a.map((v, i) => Math.round(v + (b[i] - v) * p));
            return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        },
        storyInkGlow() {
            const p = this.storyProgress;
            return `0 2px 3px #000, 0 0 ${(p * 11).toFixed(1)}px rgba(176,22,14,${(p * 0.6).toFixed(2)})`;
        },
        // 探索界面内可就地合成的配方: 背包里材料齐、产物还没有的(免去退出开背包)
        craftableRecipes() {
            const inv = this.inventory || [];
            const out = [];
            for (const key of Object.keys(ITEMS)) {
                const recipe = ITEMS[key] && ITEMS[key].combine;
                if (!recipe || !recipe.result) continue;
                const keepsResult = [key, ...(recipe.with || [])].includes(recipe.result);
                if (inv.includes(recipe.result) && !keepsResult) continue;   // 已经有成品了(拼合类配方除外)
                const need = [key, ...(recipe.with || [])];
                if (need.every((k) => inv.includes(k))) {
                    out.push({ baseKey: key, resultName: (ITEMS[recipe.result] && ITEMS[recipe.result].name) || recipe.result });
                }
            }
            return out;
        },
        currentChapter() {
            return this.currentNode?.chapter || '';
        },
        // 对白板左上角的角色名牌: 有立绘时按立绘认人
        speakerName() {
            if (!this.characterVisible || !this.characterUrl) return '';
            return speakerForCharacter(this.characterUrl);
        },
        // 纸类线索(纸条/符/庚帖/族谱…)的特写写在黄纸上, 其余写在漆板上
        closeupIsPaper() {
            return PAPER_CLOSEUP.test(this.closeupTitle || '');
        },
        isAchToast() {
            return typeof this.achievementToast === 'string' && this.achievementToast.startsWith('解锁成就');
        },
        deathCatalog() {
            const seen = this.deathsSeenList || [];
            return DEATH_CATALOG.map((d) => ({ ...d, seen: d.ids.some((id) => seen.includes(id)) }));
        },
        bookTabs() {
            return [
                { key: 'ending', name: '结局', count: this.endingCollection.length + '/' + this.allEndingCodes.length },
                { key: 'death', name: '死法', count: this.deathCatalog.filter((d) => d.seen).length + '/' + this.deathCatalog.length },
                { key: 'epitaph', name: '墓志铭', count: String(this.epitaphs.length) }
            ];
        },
        bookProgressText() {
            if (this.bookTab === 'death') return '见过的死法 ' + this.deathCatalog.filter((d) => d.seen).length + ' / ' + this.deathCatalog.length + '　点木牌看死因';
            if (this.bookTab === 'epitaph') return '封入黄裱纸的话 ' + this.epitaphs.length + ' 句';
            return '收集进度 ' + this.endingCollection.length + ' / ' + this.allEndingCodes.length;
        },
        currentSceneName() {
            return this.currentNode?.sceneName || sceneNameForChapter(this.currentNode?.chapter || '');
        },
        currentObjective() {
            return objectiveForNode(this.currentNode, {
                selectedItem: this.selectedItem,
                sceneExploreVisible: this.sceneExploreVisible
            });
        },
        exploreProgressText() {
            if (!this.sceneExploreVisible) return '';
            const total = this.exploreAllHotspots.length || 0;
            const visible = this.exploreHotspots.length || 0;
            if (!total) return '暂无可调查目标';
            return `可疑处 ${visible}/${total}`;
        },
        visibleChoices() {
            return gameRuntime.getVisibleChoices(this.currentNode, {
                inventory: this.inventory,
                flags: this.flags,
                stats: this.playerStats
            });
        }
    },

    watch: {
        // 收集册每次打开都重读本地的死法/墓志铭(死亡、封遗言都在别处写)
        showEndingBook(v) { if (v) this.loadBookData(); }
    },

    mounted() {
        // index.html 的 window.onerror 只在挂载前显示错误页; 挂载后只记日志, 不再整页变红
        window.__hhsAppMounted = true;
        this.playerId = gameRuntime.getPlayerId();
        this.inventory = gameRuntime.normalizeInventory(this.inventory);

        // 预加载恐怖资源
        // 性能: 不在首屏立即预加载(会和 JS 模块抢连接), 改为空闲时只预加载开场章节, 之后按章节懒加载(见 preloadAssets)
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
        // 首页空闲时就把第一章的图拉下来: 手机网络慢, 否则一进游戏公交车要等好几秒才显影
        idle(() => { this.preloadAssets(); this.preloadAssets('第一章：末班车与夜路'); }, { timeout: 4000 });
        this.pageHidden = document.hidden;
        document.addEventListener('visibilitychange', () => { this.pageHidden = document.hidden; });
        this.setupMobileShell();

        // 本地数据(同步读取, 不依赖后端)
        this.deathCount = parseInt(readRaw(KEYS.deathCount, '0'), 10) || 0;
        this.endingCollection = readJSON(KEYS.endings, []);
        if (!Array.isArray(this.endingCollection)) this.endingCollection = [];
        this.saveSlots = readJSON(KEYS.saves, []);
        if (!Array.isArray(this.saveSlots)) this.saveSlots = [];
        this.chapterCheckpoint = readJSON(KEYS.checkpoint, null);
        this.loadSettings();
        setSfxEnabled(this.soundEnabled);
        if (audioExt.audioRegisterNodes) audioExt.audioRegisterNodes(NODES, SFX_MAP);
        this.achievements = this.buildLocalAchievements();
        this.detectResume();

        // 先进开始界面; 统计/遗言/成就/云端续玩全部后台进行, 回来再填(后端挂起也不会卡在"正在连接老宅")
        this.loading = false;
        this.loadGlobalData();
        this.loadAchievements();
        this.checkRemoteResume();

        // 桌面端键盘操作: 空格/回车跳过打字, 1~9 选项, Esc 关面板
        this._keydownHandler = (e) => this.onGlobalKeydown(e);
        window.addEventListener('keydown', this._keydownHandler);

        // 03:33 实时彩蛋: 定时检查, 玩家在该时刻会看到"阴气最重之时"提示
        this.checkTimeEasterEgg();
        this._easterEggTimer = setInterval(() => this.checkTimeEasterEgg(), 30000);
    },

    unmounted() {
        if (this._easterEggTimer) clearInterval(this._easterEggTimer);
        if (this._keydownHandler) window.removeEventListener('keydown', this._keydownHandler);
    },

    methods: {
        // ===== i18n =====
        t(key) { return t(key); },

        // ===== 确认弹窗: 替代浏览器 confirm(), 返回 Promise<boolean> =====
        askConfirm(message, opts = {}) {
            if (this.confirmState && this.confirmState.resolve) this.confirmState.resolve(false);
            const lines = String(message || '').split('\n').filter((l) => l.trim());
            return new Promise((resolve) => {
                this.confirmState = {
                    title: opts.title || lines.shift() || '确认',
                    lines,
                    ok: opts.ok || '确定',
                    okGlyph: opts.okGlyph || '准',
                    cancel: opts.cancel || '取消',
                    resolve
                };
            });
        },
        answerConfirm(ok) {
            const st = this.confirmState;
            this.confirmState = null;
            if (st && st.resolve) st.resolve(!!ok);
        },

        // 标题页主令牌: 没写名讳先提示; 有上次进度时重新入宅要确认
        async onStartPrimary() {
            if (this.starting) return;
            if (!(this.playerName || '').trim()) {
                this.showToast('先在名牌上写下你的名讳。');
                const el = this.$refs.nameInput;
                if (el && el.focus) el.focus();
                return;
            }
            if (this.resumeInfo) {
                const ok = await this.askConfirm('重新入宅？\n上次的进度会清空（手动存档不受影响）。', { ok: '重新入宅', okGlyph: '入' });
                if (!ok) return;
            }
            this.startGame();
        },

        // 正文分段(空行分段, 段内换行并进同一段)
        paras(text) {
            return String(text || '').split(/\n\s*\n/).map((p) => p.replace(/\n/g, '')).filter((p) => p.trim());
        },
        numeral(i) {
            if (i < 10) return NUMERALS[i];
            const n = i + 1, d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
            return (n >= 20 ? d[Math.floor(n / 10)] : '') + '十' + d[n % 10];
        },
        titleLen(name) { return Math.max(2, Array.from(String(name || '')).length); },
        achGlyph(a) {
            const name = String((a && a.name) || '').replace(/^结局·/, '');
            return Array.from(name)[0] || '成';
        },
        switchLang() {
            const next = this.lang === 'zh' ? 'en' : 'zh';
            setLang(next);
            this.lang = next;
            document.title = this.lang === 'zh' ? '回魂夜 · 纸人招魂' : 'Soul Return';
        },

        // ===== 成就系统 =====
        buildLocalAchievements() {
            const localUnlocked = readJSON(KEYS.achievements, []);
            const unlocked = Array.isArray(localUnlocked) ? localUnlocked : [];
            return ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlocked: unlocked.includes(a.code) }));
        },

        // 后端成就只用来合并"服务器上已解锁"的状态; 成就定义以本地表为准(无后端也完整可用)
        async loadAchievements() {
            const data = await apiGet('/api/player_achievements/' + encodeURIComponent(this.playerId || ''));
            const list = data && (data.achievements || data.unlocked);
            if (!Array.isArray(list)) return;
            const serverCodes = list.map((a) => (typeof a === 'string' ? a : (a && (a.code || a.achievement_code)))).filter(Boolean);
            this.achievements.forEach((a) => { if (serverCodes.includes(a.code)) a.unlocked = true; });
        },

        unlockAchievement(code) {
            const def = this.achievements.find(a => a.code === code);
            if (!def) return;
            const localUnlocked = readJSON(KEYS.achievements, []);
            const list = Array.isArray(localUnlocked) ? localUnlocked : [];
            if (def.unlocked && list.includes(code)) return;
            if (!list.includes(code)) {
                list.push(code);
                writeJSON(KEYS.achievements, list);
            }
            const wasUnlocked = def.unlocked;
            def.unlocked = true;
            if (!wasUnlocked) this.queueAchievementToast(def.name);
            // 同步到服务器(离线时 apiPost 直接返回 null)
            if (this.playerId) {
                apiPost('/api/achievement/unlock', {
                    player_id: this.playerId,
                    code: code,
                    session_id: this.sessionId
                });
            }
        },

        // 同一时刻可能连解多个成就(结局 + 全收集 + 真结局), 排队依次显示, 不互相覆盖
        queueAchievementToast(name) {
            this._achQueue = this._achQueue || [];
            this._achQueue.push(name);
            if (this._achShowing) return;
            const next = () => {
                const n = this._achQueue.shift();
                if (!n) { this._achShowing = false; return; }
                this._achShowing = true;
                this.showAchievementToast(n);
                setTimeout(next, 2600);
            };
            next();
        },

        showAchievementToast(name) {
            const msg = `解锁成就：${name}`;
            this.achievementToast = msg;
            setTimeout(() => { if (this.achievementToast === msg) this.achievementToast = null; }, 2500);
        },

        toggleAchievementMenu() {
            const open = !this.showAchievementMenu;
            if (this._closeOverlays) this._closeOverlays('showAchievementMenu');
            this.showAchievementMenu = open;
        },

        getAchievementRarityColor(rarity) {
            const colors = { common: '#8a7a5a', rare: '#4a90d9', epic: '#9b59b6', legendary: '#ffd700' };
            return colors[rarity] || '#8a7a5a';
        },

        // ===== 分享卡片 =====
        // 分享卡: 暂无界面入口(下一阶段重做界面时接入), 保持可用且不报错
        generateShareCard() {
            const W = 800, H = 450;
            const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.scale(dpr, dpr);

            ctx.fillStyle = '#0a0505';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
            ctx.strokeStyle = '#8a0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, W - 40, H - 40);

            ctx.fillStyle = '#c9a86c';
            ctx.font = 'bold 36px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText('《回魂夜》存活报告', W / 2, 80);

            ctx.fillStyle = '#8a7a5a';
            ctx.font = '20px "Noto Serif SC", serif';
            ctx.textAlign = 'left';
            const total = ALL_ENDING_CODES.length || 8;
            const endings = this.endingCollection.length;
            const achievements = this.achievements.filter(a => a.unlocked).length;
            const fear = (this.currentNode && this.currentNode.fearScore) || (this.playerStats ? this.playerStats.fear : 0);
            ctx.fillText(`结局收集: ${endings}/${total}`, 80, 150);
            ctx.fillText(`死亡次数: ${this.deathCount}`, 80, 190);
            ctx.fillText(`成就解锁: ${achievements}/${this.achievements.length}`, 80, 230);
            ctx.fillText(`恐惧值: ${fear}`, 80, 270);

            ctx.fillStyle = '#3a1515';
            ctx.fillRect(80, 310, 640, 30);
            ctx.fillStyle = '#8a0000';
            ctx.fillRect(80, 310, 640 * Math.min(endings / total, 1), 30);

            ctx.fillStyle = '#5a3a1a';
            ctx.font = '14px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.gameUrl() + ' | 它记得你。', W / 2, 400);

            this.shareCardDataUrl = canvas.toDataURL('image/png');
            this.shareCardVisible = true;
        },

        // 当前部署地址(不再写死已过期的服务器)
        gameUrl() {
            return location.origin + location.pathname.replace(/index\.html$/, '');
        },

        closeShareCard() {
            this.shareCardVisible = false;
        },

        // ===== 耳机检测 =====
        checkHeadphones() {
            if (this.headphoneWarned) return;
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices().then(devices => {
                    const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
                    const hasHeadphones = audioOutputs.some(d =>
                        d.label.toLowerCase().includes('head') ||
                        d.label.toLowerCase().includes('ear') ||
                        d.label.toLowerCase().includes('bluetooth')
                    );
                    if (!hasHeadphones && audioOutputs.length > 0) {
                        this.headphoneWarned = true;
                        alert(`⚠️ 警告：未检测到耳机/耳塞。\n为了最佳恐怖体验，建议佩戴耳机。\n（回魂夜是一个声音沉浸体验）`);
                    }
                }).catch(() => {});
            }
        },

        // ===== 实时彩蛋 =====
        checkTimeEasterEgg() {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            if (h === 3 && m >= 33 && m <= 35) {
                this.showEasterEgg = true;
                this.easterEggText = '03:33 - 阴气最重之时。它醒着。';
                setTimeout(() => { this.showEasterEgg = false; }, 5000);
            }
            if (h >= 0 && h < 5) {
                this.isLateNight = true;
            }
        },

        getLunarDate() {
            // Simplified lunar date (approximation for common years)
            const lunarMonths = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
            const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
            const now = new Date();
            // Use a simple offset-based approximation for 2025-2026
            const base = new Date(2025, 0, 29); // 2025-01-29 = Chinese New Year
            const diff = Math.floor((now - base) / 86400000);
            if (diff < 0) return '';
            const lunarMonthDays = [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29]; // 2025 approx
            let d = diff;
            let monthIdx = 0;
            while (d >= lunarMonthDays[monthIdx] && monthIdx < 11) {
                d -= lunarMonthDays[monthIdx];
                monthIdx++;
            }
            const dayIdx = d;
            return `${lunarMonths[monthIdx]}月${lunarDays[dayIdx]}`;
        },

        // ===== 场景探索 =====
        showToast(msg) {
            this.achievementToast = msg;
            setTimeout(() => { if (this.achievementToast === msg) this.achievementToast = null; }, 2500);
        },
        vibrate(pattern) {
            try {
                if (!this.vibrationEnabled || !navigator.vibrate) return;
                if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
                navigator.vibrate(pattern);
            } catch (e) {}
        },

        // ===== 全局数据加载 =====


        loadGlobalData() {
            apiGet('/api/stats').then((stats) => { if (stats && typeof stats === 'object') this.stats = { ...this.stats, ...stats }; });
            apiGet('/api/last-word/random').then((lw) => { if (lw && lw.has_word) this.randomLastWord = lw.content; });
        },

        // ===== 预加载恐怖资源 =====
        // 性能: 原来开局就全量预加载 32 张图(约 11MB, 含 UI 大贴图)。改为按章节懒加载:
        // 只预加载“当前章节”节点用到的背景/立绘/CG/特写, UI 贴图交给 CSS 在面板打开时再取
        preloadAssets(chapter) {
            const ch = chapter || '第一章：末班车与夜路';
            this._preloadedChapters = this._preloadedChapters || new Set();
            this._preloadedImgs = this._preloadedImgs || new Set();
            const list = [];
            if (!chapter) list.push('img/death/death_12_wedding.jpg', 'img/death/death_09_possess.jpg'); // 惊吓/监控弹层要零延迟
            if (chapter && !this._preloadedChapters.has(ch)) {
            this._preloadedChapters.add(ch);
            list.push(CHAPTER_BACKGROUNDS[ch]);
            Object.values(NODES).forEach((n) => {
                if (!n || n.chapter !== ch) return;
                list.push(n.bgImage, n.sceneImage, n.character, n.deathCG, n.endingCG, n.closeupImage);
                (n.hotspots || []).forEach((h) => list.push(h && h.closeupImage));
            });
            }
            list.forEach((src) => {
                if (!src || typeof src !== 'string' || this._preloadedImgs.has(src)) return;
                this._preloadedImgs.add(src);
                const img = new Image();
                img.decoding = 'async';
                img.src = src;
            });
        },

        // ===== 开始游戏 =====
        // 新开一局(开始界面"入宅守灵"/"重新开始"、死亡/结局"重新来过")
        startGame() {
            if (this._starting) return;          // 防重入: 连点不会进两次第一个节点
            this._starting = true;
            this.starting = true;
            try {
                try { initAudio(); resumeAudio(); if (audioExt.playUi) audioExt.playUi('light'); } catch (e) {}
                this.resetRun({ keepSnapshot: false, stayOnScreen: true });
                this.gameStartTime = Date.now();
                this._runDeaths = 0;
                this._runHintBurns = 0;
                this.screen = 'game';
                this.enterFullscreen();          // 手机浏览器: 进游戏就全屏, 藏掉地址栏
                this.showDanmuPreview();
                this.checkNightOwl();
                this.ensureSession();            // 会话请求在后台, 不阻塞进入游戏
                this.enterNode('node01');
            } finally {
                setTimeout(() => { this._starting = false; this.starting = false; }, 400);
            }
        },

        // 开始界面"继续上次"
        continueRun() {
            const info = this.resumeInfo;
            if (!info || !info.snap || this._starting) return;
            const snap = info.snap;
            if (!this.getNodeData(snap.nodeId)) { this.resumeInfo = null; return; }
            this._starting = true;
            this.starting = true;
            try {
                try { initAudio(); resumeAudio(); if (audioExt.playUi) audioExt.playUi('light'); } catch (e) {}
                this.stopRunTimers();
                this.inventory = gameRuntime.normalizeInventory(snap.inventory || []);
                this.flags = { ...(snap.flags || {}) };
                this.playerStats = { ...DEFAULT_STATS(), ...(snap.playerStats || {}) };
                this.choicePath = Array.isArray(snap.choicePath) ? [...snap.choicePath] : [];
                this.pathVia = Array.isArray(snap.pathVia) ? [...snap.pathVia] : [];
                if (typeof snap.ghostOpacity === 'number') this.ghostOpacity = snap.ghostOpacity;
                if (snap.sessionId) this.sessionId = snap.sessionId;
                if (snap.playerName && !this.playerName) this.playerName = snap.playerName;
                this._runDeaths = snap.runDeaths || 0;
                this._runHintBurns = snap.hintBurns || 0;
                this.gameStartTime = Date.now() - (snap.elapsedMs || 0);
                this.resumeInfo = null;
                this.screen = 'game';
                this.ensureSession();
                this.enterNode(snap.nodeId, { restore: true });
            } finally {
                setTimeout(() => { this._starting = false; this.starting = false; }, 400);
            }
        },

        // 读本地续玩快照(无后端也能续玩)
        detectResume() {
            const snap = readJSON(KEYS.run, null);
            const node = snap && snap.nodeId ? this.getNodeData(snap.nodeId) : null;
            if (node && !node.isDeath && !node.isEnding && !node.isFinal) {
                this.resumeInfo = { source: 'local', snap, chapter: node.chapter || '未知章节' };
                if (snap.playerName && !this.playerName) this.playerName = snap.playerName;
            } else {
                this.resumeInfo = null;
            }
        },

        // 本地没有快照、但有后端会话时, 后台问一下服务器有没有进度(超时/离线就当没有)
        async checkRemoteResume() {
            if (this.resumeInfo) return;
            const sid = readRaw(KEYS.session);
            if (!sid) return;
            const saved = await apiGet('/api/progress/' + encodeURIComponent(sid));
            if (this.screen !== 'start' || this.resumeInfo) return;
            if (!saved || !saved.node_id) return;
            const node = this.getNodeData(saved.node_id);
            if (!node || node.isDeath || node.isEnding || node.isFinal) return;
            const parse = (v, fb) => { if (v == null) return fb; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch (e) { return fb; } };
            const flags = parse(saved.flags, {}) || {};
            const stats = flags.__stats || null;
            delete flags.__stats;
            const path = parse(saved.choice_path, []);
            this.resumeInfo = {
                source: 'remote',
                chapter: node.chapter || '未知章节',
                snap: {
                    nodeId: saved.node_id,
                    inventory: parse(saved.inventory, []) || [],
                    flags,
                    playerStats: stats,
                    choicePath: Array.isArray(path) ? path : [],
                    pathVia: [],
                    ghostOpacity: typeof saved.ghost_opacity === 'number' ? saved.ghost_opacity : 0.01,
                    sessionId: sid
                }
            };
        },

        // 后台建会话(有后端才会成功); 同一局只会建一个
        async ensureSession() {
            if (this.sessionId || this._sessionPending) return;
            this._sessionPending = true;
            const runId = this._runId;
            try {
                const res = await apiPost('/api/session', {
                    user_agent: navigator.userAgent,
                    name: this.playerName
                });
                if (res && res.session_id && this._runId === runId && !this.sessionId) {
                    this.sessionId = res.session_id;
                    writeRaw(KEYS.session, this.sessionId);
                    if (this.screen === 'game' && this.currentNodeId) {
                        this.submitProgress(this.currentNodeId);
                        this.persistRun();
                    }
                }
            } finally {
                this._sessionPending = false;
            }
        },

        // 本局所有定时器/监听/弹层统一收尾
        stopRunTimers() {
            if (this.stageIntroTimer) { clearTimeout(this.stageIntroTimer); this.stageIntroTimer = null; }
            if (this.typeTextTimer) { clearTimeout(this.typeTextTimer); this.typeTextTimer = null; }
            if (this._deathCGTimer) { clearTimeout(this._deathCGTimer); this._deathCGTimer = null; }
            if (this._endingCGTimer) { clearTimeout(this._endingCGTimer); this._endingCGTimer = null; }
            if (this._finalTimer) { clearTimeout(this._finalTimer); this._finalTimer = null; }
            if (this._jumpscareTimer) { clearTimeout(this._jumpscareTimer); this._jumpscareTimer = null; }
            this.typeTextToken += 1;
            this._typeFinish = null;
            this.pageWaiting = false;
            this._stopPuzzleTimers();
            if (this.forceCloseSms) this.forceCloseSms();
        },

        // 重置本局: 节点/道具/flag/路径/属性/检查点/ghost/会话, 停 BGM 与定时器
        // keepSnapshot=true(返回主菜单): 保留本地续玩快照, 开始界面可"继续上次"
        resetRun(opts = {}) {
            this._runId = (this._runId || 0) + 1;
            this.stopRunTimers();
            if (!opts.keepSnapshot) {
                removeKey(KEYS.run);
                removeKey(KEYS.session);
                removeKey(KEYS.checkpoint);
                removeKey(KEYS.ghost);
                removeKey(KEYS.rpgStats);
                this.chapterCheckpoint = null;
            }
            this.sessionId = null;
            this.currentNodeId = 'node01';
            this.currentNode = null;
            this.inventory = [];
            this.flags = {};
            this.choicePath = [];
            this.pathVia = [];
            this.playerStats = DEFAULT_STATS();
            this.ghostOpacity = 0.01;
            this.displayText = '';
            this.fullText = '';
            this.isTyping = false;
            this.lastDeathInfo = null;
            this.deathCountGlobal = 0;
            this.onlineInfo = null;
            this.endingText = '';
            this.endingCGVisible = false;
            this.deathCGVisible = false;
            this.jumpscareVisible = false;
            this.uiShatter = false;
            this.noiseActive = false;
            this.sceneExploreVisible = false;
            this.closeupVisible = false;
            this.closeupNextNode = null;
            this.puzzleVisible = false;
            this.puzzleId = null;
            this.puzzleCtx = null;
            this.camAlertVisible = false;
            this.sceneImageVisible = false;
            this.sceneIntroActive = false;
            this.stageIntroActive = false;
            this.characterVisible = false;
            this.selectedItem = null;
            this.lastWordInput = '';
            this.lastWordSent = false;
            this.lastWordSubmitting = false;
            this.menuVisible = false;
            if (this._closeOverlays) this._closeOverlays();
            this._seenNodes = new Set();
            this._lastChapterShown = null;
            this._smsShownNodes = new Set();
            document.body.classList.remove('final-flash');
            stopBgm(true);
            if (audioExt.audioReset) audioExt.audioReset();
            this._bgmMood = null;
            if (!opts.stayOnScreen) this.screen = 'start';
            if (opts.keepSnapshot) this.detectResume(); else this.resumeInfo = null;
        },

        // 落本地续玩快照; submit=true 时顺带向后端提交一次进度
        persistRun(opts = {}) {
            if (this.screen !== 'game' || !this.currentNodeId) return;
            const node = this.currentNode;
            if (node && (node.isDeath || node.isEnding || node.isFinal)) return;
            writeJSON(KEYS.run, {
                v: 1,
                nodeId: this.currentNodeId,
                inventory: gameRuntime.normalizeInventory(this.inventory),
                flags: { ...this.flags },
                playerStats: { ...this.playerStats },
                choicePath: [...this.choicePath],
                pathVia: [...(this.pathVia || [])],
                ghostOpacity: this.ghostOpacity,
                sessionId: this.sessionId,
                playerName: this.playerName,
                runDeaths: this._runDeaths || 0,
                hintBurns: this._runHintBurns || 0,
                elapsedMs: this.gameStartTime ? Date.now() - this.gameStartTime : 0,
                savedAt: Date.now()
            });
            if (opts.submit) this.submitProgress(this.currentNodeId);
        },

        getNodeData(nodeId) {
            return (nodeId && gameRuntime.getNode(nodeId)) || null;
        },

        // 统一跳转: 记录路径(含探索热点/出口) 再进入节点
        goTo(nodeId, via) {
            if (!this.getNodeData(nodeId)) {
                console.warn('[goTo] 目标节点不存在, 已忽略:', nodeId);
                return;
            }
            this.pathVia = this.pathVia || [];
            while (this.pathVia.length < this.choicePath.length) this.pathVia.push(null);
            this.choicePath.push(this.currentNodeId);
            this.pathVia.push(via || null);
            this.enterNode(nodeId);
        },

        checkNightOwl() {
            const h = new Date().getHours();
            if (h >= 23 || h < 4) this.unlockAchievement('night_owl');
        },

        // ===== 显示开场弹幕遗言 =====
        showDanmuPreview() {
            if (this.randomLastWord) {
                this.showDanmu('【前人遗言】' + this.randomLastWord);
            }
        },

        // ===== 声音总开关(同步 BGM) =====
        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            setSfxEnabled(this.soundEnabled);
            this.saveSettings();
            if (!this.soundEnabled) { stopBgm(true); this._bgmMood = null; }
            else { resumeAudio(); this._bgmMood = null; this._updateBgm(this.currentNode); }
        },
        // ===== 按章节/进度更新背景音乐(程序化氛围乐 + 后期唢呐) =====
        _updateBgm(node) {
            if (!node) return;
            if (!this.soundEnabled) { stopBgm(); this._bgmMood = null; return; }
            const ch = node.chapter || '';
            let mood = 'base';
            if (node.isEnding || node.isFinal) mood = 'ending';        // 结局: 唢呐送葬句
            else if (ch.includes('冥婚') || ch.includes('阴阳')) mood = 'wedding';
            else if (ch.includes('回魂')) mood = 'ritual';
            // 死亡节点不专门切 BGM(由 scream 等音效承担), 维持原氛围
            if (node.isDeath) return;
            if (mood !== this._bgmMood) {
                this._bgmMood = mood;
                startBgm(mood);
            }
        },

        // ===== 进入节点 =====
        async enterNode(nodeId, opts = {}) {
            // restore=true: 读档/续玩/回到本章开头, 不再重复结算节点道具/flag/属性/ghost 等副作用
            const restore = !!(opts && opts.restore);
            if (!this.getNodeData(nodeId)) {
                console.warn('[enterNode] 目标节点不存在, 已忽略:', nodeId);
                return;
            }
            this._stopPuzzleTimers();
            this.lastDeathInfo = null;
            this.deathCountGlobal = 0;
            this.lastWordSent = false;
            if (this._deathCGTimer) { clearTimeout(this._deathCGTimer); this._deathCGTimer = null; }
            if (this._endingCGTimer) { clearTimeout(this._endingCGTimer); this._endingCGTimer = null; }
            this.deathCGVisible = false;
            this.endingCGVisible = false;
            if (this.stageIntroTimer) {
                clearTimeout(this.stageIntroTimer);
                this.stageIntroTimer = null;
            }
            if (this.typeTextTimer) {
                clearTimeout(this.typeTextTimer);
                this.typeTextTimer = null;
            }
            this.typeTextToken += 1;
            this.stageIntroActive = false;
            this.sceneIntroActive = false;
            this.sceneIntroDarkening = false;
            this.sceneIntroAfterClose = null;
            this.sceneImageVisible = false;
            this.sceneImageReady = false;
            this.sceneImageCloseQueued = false;
            this.sceneImageAfterClose = null;
            this.sceneImageNext = null;
            this.sceneExploreVisible = false;
            this.closeupVisible = false;
            this.puzzleVisible = false;
            this.puzzleId = null;
            this.puzzleCtx = null;
            this.camAlertVisible = false;
            this.currentNodeId = nodeId;
            let node = this.getNodeData(nodeId);
            if (!node) return;
            // 多周目文本注入
            node = this.injectNewGamePlusText(node);
            this.currentNode = node;
            if (node.chapter) this.preloadAssets(node.chapter); // 进入新章节时才预加载该章图片(已加载过的章节直接跳过)

            this._updateBgm(node);

            if (!restore) {
                const effects = gameRuntime.applyNodeEffects(node, {
                    inventory: this.inventory,
                    flags: this.flags
                });
                this.inventory = effects.inventory;
                this.flags = effects.flags;

                // 更新RPG属性
                this.updatePlayerStats(node);
            }
            // 烧黄纸问: 每章开头补满黄纸
            this.refillHintPapers(node);

            // 更新状态栏
            this.updateStatusBar(node, restore);

            // ===== 场景背景切换 =====
            this.updateBackground(node);

            // ===== 角色立绘切换 =====
            this.updateCharacter(node);

            // 章节标题(去抖: 仅进入新章时弹一次, 避免同章连刷反复闪同一标题)
            if (node.chapter && node.chapter !== this._lastChapterShown) {
                this._lastChapterShown = node.chapter;
                this.chapterTitle = node.chapter;
                this.chapterTitleVisible = true;
                setTimeout(() => { this.chapterTitleVisible = false; }, 3000);
                // 章节续关: 进入新章时记录, 死亡后可回到本章开头(降低长流程劝退)
                if (!node.isDeath && !node.isEnding && !node.isFinal) {
                    this.chapterCheckpoint = {
                        nodeId, chapter: node.chapter,
                        inventory: gameRuntime.normalizeInventory(this.inventory),
                        flags: { ...this.flags },
                        playerStats: { ...this.playerStats },
                        ghostOpacity: this.ghostOpacity,
                        choicePath: [...this.choicePath],
                        pathVia: [...(this.pathVia || [])]
                    };
                    writeJSON(KEYS.checkpoint, this.chapterCheckpoint);
                }
            }

            // 震动
            if (node.vibration) this.vibrate(node.vibration);

            // 音效 + 心跳(用前端 BPM_MAP 同帧起跳, 覆盖全部节点, 不再等后端往返)
            resumeAudio();
            playHeartbeat(BPM_MAP[nodeId] || 60);
            const sfx = SFX_MAP[nodeId];
            if (audioExt.audioEnterNode) {
                // 环境层按场景交叉淡变 + 按节点放事件音(敲门/抓挠/脚步/stinger…), 没有映射的节点不放
                audioExt.audioEnterNode(nodeId, node, sfx);
            } else {
                if (sfx === 'knock') playKnock();
                else if (sfx === 'tinnitus') playTinnitus();
                else if (sfx === 'whisper') playWhisper();
                else if (sfx === 'scream') playScream();
                if (nodeId.startsWith('node_dead')) playScream();
            }

            // 后端交互(只做统计, 离线时立即返回) + 本地短信剧情 + 本地续玩快照
            if (!restore) this.fetchBackendData(nodeId);
            else this.submitProgress(nodeId);
            this.triggerNodeMessage(nodeId);
            this.persistRun();

            // 文字
            let text = node.text || '';
            // 条件段: 有/无某旗标时接在正文后
            (node.condTexts || []).forEach((c) => {
                if (Boolean(this.flags[c.flag]) !== Boolean(c.not)) text += '\n\n' + c.text;
            });
            // 理智过低: 注入幻觉(节点可配 hallucinationText, 否则用通用句池)
            if (this.playerStats.sanity < 30 && !node.isDeath && !node.isEnding && !node.isFinal) {
                text = text + '\n\n' + (node.hallucinationText || HALLUCINATIONS[Math.floor(Math.random() * HALLUCINATIONS.length)]);
            }
            this.fullText = text;
            this.displayText = '';

            // 死亡/结局节点的对话框是隐藏的, 逐字打字只会让玩家对着空屏干等: 直接给全文并进入结算
            const showInstant = () => {
                this.typeTextToken += 1;
                if (this.typeTextTimer) { clearTimeout(this.typeTextTimer); this.typeTextTimer = null; }
                this._typeFinish = null;
                this.pageWaiting = false;
                this.isTyping = false;
                this.displayText = text.replace(/\n/g, '<br>');
            };
            const playText = () => {
                this.stageIntroActive = false;
                // 检查是否是死亡/结局/最终节点/监控画面/场景图片
                if (node.isDeath) {
                    showInstant();
                    this.handleDeath(node);
                } else if (node.isFinal) {
                    showInstant();
                    this.handleFinal(node);
                } else if (node.isEnding) {
                    showInstant();
                    this.handleEnding(node);
                } else if (node.exploreScene) {
                    this.typeText(text, () => {
                        this.showSceneExplore(node.sceneImage, node.sceneTitle, node.hotspots || [], node);
                    });
                } else if (node.camAlert) {
                    this.typeText(text, () => {
                        this.camAlertVisible = true;
                        this.camAlertNext = node.camNext || null;
                        this.noiseActive = true;
                        playTone(200, 0.5, 'sawtooth', 0.05);
                        this.vibrate([100, 50, 100, 50, 200]);
                    });
                } else if (node.puzzle) {
                    this.typeText(text, () => {
                        if (this.currentNodeId === nodeId) this.openPuzzle(node.puzzle, { via: node.sceneName });
                    });
                } else if (node.closeupItem) {
                    this.typeText(text, () => {
                        this.showCloseup(node.closeupImage, node.closeupText, node.closeupNextNode || null);
                    });
                } else if (node.sceneImageNext) {
                    this.typeText(text, () => {
                        setTimeout(() => this.enterNode(node.sceneImageNext), 300);
                    });
                } else {
                    this.typeText(text);
                }
            };

            const showSceneBeforeText = () => {
                this.stageIntroActive = false;
                this.isTyping = false;
                this.sceneImageUrl = node.sceneImage;
                this.sceneImageNext = null;
                this.sceneImageAfterClose = playText;
                this.sceneImageReady = false;
                this.sceneImageCloseQueued = false;
                this.sceneImageVisible = true;
                setTimeout(() => {
                    this.sceneImageReady = true;
                    if (this.sceneImageCloseQueued) this.closeSceneImage();
                }, 300);
                this.vibrate([50, 100, 50]);
            };

            const shouldShowSceneBeforeText = Boolean(
                node.sceneImage &&
                !node.exploreScene &&
                !node.isDeath &&
                !node.isFinal &&
                !node.isEnding &&
                !node.camAlert &&
                !node.puzzle &&
                !node.closeupItem
            );

            const presentNode = shouldShowSceneBeforeText ? showSceneBeforeText : playText;

            // 仅首次进入该节点放开场过场动画; 退回/重进时直接呈现, 不重演"剧情过场"
            this._seenNodes = this._seenNodes || new Set();
            const firstVisit = !this._seenNodes.has(nodeId);
            this._seenNodes.add(nodeId);
            const shouldPreviewStage = firstVisit && this.rpgMode && !shouldShowSceneBeforeText && !node.isDeath && !node.isFinal && !node.isEnding;
            if (shouldPreviewStage) {
                this.stageIntroActive = true;
                this.isTyping = true;
                this.stageIntroTimer = setTimeout(presentNode, nodeId === 'node01' ? 950 : 520);
            } else {
                presentNode();
            }

            // 物品获取
            if (node.item) {
                const itemKey = gameRuntime.normalizeItemKey(node.item);
                const itemData = gameRuntime.getItem(itemKey);
                if (itemData && itemData.image) {
                    setTimeout(() => {
                        this.showCloseup(itemData.image, `获得了【${itemData.name}】\n${itemData.desc}`, null);
                    }, 500);
                }
            }
        },

        // ===== 场景背景切换 =====
        updateBackground(node) {
            // 优先使用节点显式配置，否则按章节自动匹配
            let bgImage = node.bgImage;
            if (!bgImage && this.rpgMode && node.sceneImage && !node.sceneImageNext && !node.exploreScene) {
                bgImage = node.sceneImage;
            }
            if (!bgImage && !node.clearBg && node.chapter) {
                bgImage = CHAPTER_BACKGROUNDS[node.chapter];
            }

            if (bgImage) {
                // 如果背景变化，先做过渡
                if (this.bgImageUrl && this.bgImageUrl !== bgImage) {
                    this.bgImageTransition = true;
                    setTimeout(() => {
                        this.bgImageUrl = bgImage;
                        this.bgImageTransition = false;
                    }, 400);
                } else {
                    this.bgImageUrl = bgImage;
                }
                this.bgImageVisible = true;
            } else if (node.clearBg) {
                // 显式清除背景
                this.bgImageVisible = false;
                this.bgImageUrl = '';
            }
            // 色调分级
            if (node.colorGrade) {
                document.body.className = '';
                document.body.classList.add('grade-' + node.colorGrade);
            }
        },

        // ===== 角色立绘切换 =====
        updateCharacter(node) {
            if (node.character) {
                this.characterUrl = node.character;
                this.characterEmotion = node.characterEmotion || 'normal';
                this.characterPosition = node.characterPosition || 'right';
                this.characterFlicker = node.characterFlicker || false;
                this.characterVisible = true;
            } else if (node.hideCharacter) {
                this.characterVisible = false;
            }
        },

        // ===== 对白分页 =====
        // 按自然段(空行)切页: 每页最多 3 段且不超过 170 字, 绝不从段中间切; 单段超长就独占一页。
        // 真正渲染时还会按对白区高度再收(见 typeText 里的 fitPage), 手机竖屏放不下 3 段时自动少放
        splitParagraphs(text) {
            return String(text || '').split(/\n[ \t　]*\n+/)
                .map((p) => p.replace(/^\n+|\n+$/g, ''))
                .filter((p) => p.trim());
        },
        packPages(paras) {
            const PAGE_MAX_PARAS = 3;
            const PAGE_MAX_CHARS = 170;
            const len = (p) => Array.from(p.replace(/\s/g, '')).length;
            const pages = [];
            let cur = [];
            let curLen = 0;
            for (const p of paras) {
                const l = len(p);
                if (cur.length && (cur.length >= PAGE_MAX_PARAS || curLen + l > PAGE_MAX_CHARS)) {
                    pages.push(cur);
                    cur = [];
                    curLen = 0;
                }
                cur.push(p);
                curLen += l;
            }
            if (cur.length) pages.push(cur);
            return pages;
        },
        paginateText(text) {
            const paras = this.splitParagraphs(text);
            return paras.length ? this.packPages(paras) : [[String(text || '')]];
        },

        // ===== 打字机效果(带分页) =====
        // 整个节点文本打完前 isTyping 一直为 true(选项/探索/回到等按钮都要等最后一页);
        // 非末页打完 → pageWaiting=true 显示“下一页”标记, 再点对白框/空格/回车才翻页;
        // audioTextDone 与 onDone 只在最后一页打完时触发一次
        typeText(text, onDone) {
            this.typeTextToken += 1;
            const token = this.typeTextToken;
            if (this.typeTextTimer) {
                clearTimeout(this.typeTextTimer);
                this.typeTextTimer = null;
            }
            this.isTyping = true;
            this.pageWaiting = false;
            const pages = this.paginateText(text);
            this.pageIndex = 0;
            this.pageCount = pages.length;
            // 文字速度映射：1=慢(80ms), 5=快(15ms)
            const speedMap = { 1: 80, 2: 50, 3: 30, 4: 20, 5: 12 };
            const baseDelay = speedMap[this.textSpeed] || 30;
            const esc = (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch);
            const boxSel = '#rpg-dialog .dialog-text, #story-text';
            const areaOf = (el) => el.closest('.dialog-text-area') || el;

            const runPage = (p) => {
                if (token !== this.typeTextToken) return;
                this.pageIndex = p;
                this.pageCount = pages.length;
                this.pageWaiting = false;
                this._typeInQuote = false;
                if (audioExt.playUi) audioExt.playUi('flip');   // 翻纸: 新一页正文开始
                let chars = [];
                let i = 0;
                const pageText = () => pages[p].join('\n\n');

                // 本页打完(自然打完或点击跳过): 末页 → 收尾并触发后续; 非末页 → 停住等翻页
                const finishPage = () => {
                    if (token !== this.typeTextToken) return;
                    if (this.typeTextTimer) {
                        clearTimeout(this.typeTextTimer);
                        this.typeTextTimer = null;
                    }
                    this.displayText = pageText().replace(/\n/g, '<br>');
                    if (p >= pages.length - 1) {
                        this._typeFinish = null;
                        this.pageWaiting = false;
                        this.isTyping = false;
                        if (audioExt.audioTextDone) audioExt.audioTextDone();
                        if (onDone) onDone();
                        return;
                    }
                    this.pageWaiting = true;
                    this._typeFinish = () => {
                        if (token !== this.typeTextToken) return;
                        this._typeFinish = null;
                        runPage(p + 1);
                    };
                };
                this._typeFinish = finishPage;

                // 性能: 开始时一次性渲染本页全文(每个字一个初始隐藏的 span), 之后只给 span 加 class 逐个显示
                const render = () => {
                    chars = Array.from(pageText());
                    let html = '';
                    for (const ch of chars) html += ch === '\n' ? '<br class="tw-c">' : '<span class="tw-c">' + esc(ch) + '</span>';
                    this.displayText = html + '<span class="cursor"></span>';
                };
                render();
                if (!chars.length) { finishPage(); return; }

                // 对白容器可能因 v-if 重建(innerHTML 会回到全隐藏状态), 发现容器换了就重新取并补齐已显示的字
                let boxes = [];
                const collect = () => {
                    const els = document.querySelectorAll(boxSel);
                    if (els.length === boxes.length && boxes.every((b, k) => b.el === els[k] && b.el.isConnected)) return;
                    boxes = Array.from(els).map((el) => {
                        const spans = el.getElementsByClassName('tw-c');
                        for (let k = 0; k < i && k < spans.length; k++) spans[k].classList.add('tw-on');
                        return { el, spans: Array.from(spans), cursor: el.querySelector('.cursor') };
                    });
                };

                const step = () => {
                    if (token !== this.typeTextToken || this._typeFinish !== finishPage) return;
                    if (i >= chars.length) { finishPage(); return; }
                    collect();
                    const from = i;
                    let lastCh = '';
                    for (let c = 0; c < 2 && i < chars.length; c++) {
                        const ch = chars[i++];
                        lastCh = ch;
                        if (ch === '“' || ch === '「') this._typeInQuote = true;
                        else if (ch === '”' || ch === '」') this._typeInQuote = false;
                    }
                    for (const b of boxes) {
                        for (let k = from; k < i; k++) if (b.spans[k]) b.spans[k].classList.add('tw-on');
                        const last = b.spans[i - 1];
                        if (b.cursor && last) last.after(b.cursor);
                        // 长文本自动跟随(单段超长独占一页时仍可能溢出): 新字跑出对白区可视范围时滚动
                        // 注意隐藏的字也占位，不能直接滚到底，要按最新那个字的位置滚
                        if (last) {
                            const area = areaOf(b.el);
                            if (area.scrollHeight > area.clientHeight + 2) {
                                const areaTop = area.getBoundingClientRect().top;
                                const r = last.getBoundingClientRect();
                                const need = area.scrollTop + (r.bottom - areaTop) - area.clientHeight + 8;
                                if (need > area.scrollTop) area.scrollTop = need;
                            }
                        }
                    }
                    let delay = baseDelay + Math.random() * (baseDelay * 0.5);
                    if (this._typeInQuote) delay *= 2.2;                          // 引号内鬼台词放慢
                    if ('。！？…'.includes(lastCh)) delay += baseDelay * 4;        // 句末重顿
                    else if ('，、；'.includes(lastCh)) delay += baseDelay * 1.5;  // 逗号轻顿
                    this.typeTextTimer = setTimeout(step, delay);
                };

                // 按高度再收: 隐藏的字也占位, 渲染后对白区若要滚动且本页不止一段,
                // 把末段挪出去, 与后面各页的段落重新装页, 再量一次; 量完才开始逐字
                const fitPage = () => {
                    if (token !== this.typeTextToken || this._typeFinish !== finishPage) return;
                    const els = document.querySelectorAll(boxSel);
                    const areas = Array.from(els).map(areaOf);
                    areas.forEach((a) => { a.scrollTop = 0; });
                    const area = areas.find((a) => a.clientHeight > 0);
                    if (area && pages[p].length > 1 && area.scrollHeight > area.clientHeight + 2) {
                        const rest = [pages[p].pop()].concat(...pages.slice(p + 1));
                        pages.splice(p + 1, pages.length, ...this.packPages(rest));
                        this.pageCount = pages.length;
                        render();
                        this.$nextTick(fitPage);
                        return;
                    }
                    step();
                };
                this.$nextTick(fitPage);
            };

            runPage(0);
        },

        // 跳过打字: 一次显示全文并触发后续(供“点击跳过”调用; 不在打字中则返回 false)
        skipTyping() {
            if (!this.isTyping || typeof this._typeFinish !== 'function') return false;
            this._typeFinish();
            return true;
        },

        // ===== 状态栏更新 =====
        updateStatusBar(node, restore = false) {
            if (node.time) this.gameTime = node.time;
            if (node.signal !== undefined) this.signalBars = node.signal;
            if (node.battery !== undefined) this.batteryPercent = node.battery;
            if (!restore) this.ghostOpacity = Math.min(this.ghostOpacity + 0.03, 1.0);
            writeRaw(KEYS.ghost, this.ghostOpacity.toString());
        },

        // ===== 做出选择 =====
        makeChoice(choice) {
            if (!choice) return;
            if (choice.locked || !gameRuntime.canUseChoice(choice, { inventory: this.inventory, flags: this.flags, stats: this.playerStats })) {
                if (audioExt.playUi) audioExt.playUi('error');
                this.showToast(choice.lockedText || '还缺少关键线索。');
                return;
            }
            initAudio();
            resumeAudio();
            if (audioExt.playUi) audioExt.playUi('press');   // 按下黄纸: 选项确认
            if (choice.vibration) this.vibrate(choice.vibration);
            if (choice.statEffect) this.applyStatEffect(choice.statEffect);
            this.ghostOpacity = Math.min(this.ghostOpacity + 0.04, 1.0);
            // 判定选项: 旗标齐了去 next, 不齐去 elseNext; 选项自带的 setFlags/获得道具先落地
            const next = gameRuntime.resolveChoiceTarget(choice, { flags: this.flags });
            if (choice.setFlags) this.flags = { ...this.flags, ...choice.setFlags };
            if (choice.item) this.inventory = gameRuntime.addItem(this.inventory, choice.item);
            this.goTo(next, null);
        },

        // 应用数值变化 (选择/节点的 statEffect: { sanity, fear } 增量, 自动钳制)
        applyStatEffect(e) {
            if (!e) return;
            const s = this.playerStats;
            if (e.sanity) s.sanity = Math.max(0, Math.min(s.maxSanity, s.sanity + e.sanity));
            if (e.fear) s.fear = Math.max(0, Math.min(s.maxFear, s.fear + e.fear));
        },

        // ===== 关闭短信 =====
        // ===== 关闭监控画面 =====
        closeCamAlert() {
            if (!this.camAlertVisible) return;   // 防重入
            this.camAlertVisible = false;
            this.noiseActive = false;
            playTone(100, 0.3, 'sine', 0.05);
            this.vibrate([50, 30, 50]);
            const fromNode = this.currentNodeId;
            const next = this.camAlertNext;
            if (next) {
                setTimeout(() => { if (this.currentNodeId === fromNode) this.enterNode(next); }, 300);
            }
        },

        // ===== 关闭场景图片 =====
        closeSceneImage() {
            if (!this.sceneImageReady) {
                this.sceneImageCloseQueued = true;
                return;
            }
            this.sceneImageVisible = false;
            this.sceneImageReady = false;
            this.sceneImageCloseQueued = false;
            if (this.sceneImageAfterClose) {
                const afterClose = this.sceneImageAfterClose;
                this.sceneImageAfterClose = null;
                this.isTyping = true;
                this.displayText = '<span class="cursor"></span>';
                setTimeout(afterClose, 160);
                return;
            }
            if (this.sceneImageNext) {
                const next = this.sceneImageNext;
                this.sceneImageNext = null;
                setTimeout(() => this.enterNode(next), 400);
            }
        },

        // ===== 关闭舞台开场图 =====
        closeSceneIntro() {
            if (!this.sceneIntroActive || this.sceneIntroDarkening) return;
            this.sceneIntroDarkening = true;
            const afterClose = this.sceneIntroAfterClose;
            this.sceneIntroAfterClose = null;
            this.vibrate([35, 50, 35]);
            setTimeout(() => {
                this.sceneIntroActive = false;
                this.sceneIntroDarkening = false;
                if (afterClose) {
                    this.isTyping = true;
                    this.displayText = '<span class="cursor"></span>';
                    setTimeout(afterClose, 120);
                }
            }, 620);
        },

        // ===== 获取节点的默认下一个节点 =====
        getNextFromChoices(node) {
            if (node.choices && node.choices.length > 0) {
                return node.choices[0].next;
            }
            return null;
        },

        // ===== 后端数据交互 =====
        // 只做统计/进度上报, 全部不 await; 离线时 apiPost 立即返回 null
        fetchBackendData(nodeId) {
            if (!this.sessionId) return;
            const node = this.getNodeData(nodeId);
            this.submitProgress(nodeId);
            apiPost('/api/node_visit', { node_id: nodeId });
            apiPost('/api/event', {
                session_id: this.sessionId,
                event_type: 'enter_node',
                node_id: nodeId,
                payload: JSON.stringify({ chapter: node?.chapter, time: node?.time })
            });
        },

        submitProgress(nodeId) {
            if (!this.sessionId || !nodeId) return;
            const node = this.getNodeData(nodeId);
            if (!node || node.isDeath || node.isEnding || node.isFinal) return;
            apiPost('/api/progress', {
                session_id: this.sessionId,
                node_id: nodeId,
                chapter: node.chapter,
                time_in_game: node.time,
                // 后端字段是字符串列, 统一序列化成 JSON 字符串
                choice_path: JSON.stringify(this.choicePath),
                ghost_opacity: this.ghostOpacity,
                inventory: JSON.stringify(gameRuntime.normalizeInventory(this.inventory)),
                // 后端 Progress 没有属性列: 把 playerStats 一并塞进 flags 的 __stats, 续玩时取出
                flags: JSON.stringify({ ...this.flags, __stats: { ...this.playerStats } })
            });
        },

        // 剧情短信改用本地 MESSAGES 表触发(无后端也有); 同一节点本局只弹一次(真正显示后才算已读)
        triggerNodeMessage(nodeId) {
            const msg = MESSAGES[nodeId];
            if (!msg || !this._smsLater) return;
            this._smsShownNodes = this._smsShownNodes || new Set();
            if (this._smsShownNodes.has(nodeId) || this._smsPendingNode === nodeId) return;
            if (this.smsVisible && this.smsNodeId === nodeId) return;
            this._smsPendingNode = nodeId;
            const runId = this._runId;
            this._smsLater(() => {
                this._smsPendingNode = null;
                if (this._runId !== runId || this.screen !== 'game') return;
                if (this.smsVisible) return;
                this.showSmsDialog(msg.from_sender, msg.content, nodeId);
            }, msg.delay_ms || 500);
        },

        // ===== 死亡处理 =====
        async handleDeath(node) {
            this.deathCount++;
            writeRaw(KEYS.deathCount, this.deathCount.toString());
            this._runDeaths = (this._runDeaths || 0) + 1;
            const nodeId = this.currentNodeId;
            this.unlockAchievement('first_death');
            this.trackDeathSeen(nodeId);

            // ===== 死亡CG展示 =====
            if (node.deathCG) {
                this.deathCGUrl = node.deathCG;
                this.deathCGName = node.deathName || '无名之死';
                this.deathCGDesc = node.deathDesc || '';
                this.deathCGVisible = true;
                // 3.5 秒后淡出CG，显示死亡界面
                if (this._deathCGTimer) clearTimeout(this._deathCGTimer);
                this._deathCGTimer = setTimeout(() => {
                    this._deathCGTimer = null;
                    this.deathCGVisible = false;
                }, 3500);
            }

            // 氛围音效: 不再等网络
            playWhisper();

            // 社交数据: 先取"上一个死在这里的人"(并过滤掉自己), 再提交自己的死亡; 全部不阻塞界面
            const sid = this.sessionId;
            if (!sid) return;
            const runId = this._runId;
            const [dc, last] = await Promise.all([apiGet('/api/death-count'), apiGet('/api/last_death')]);
            if (this._runId !== runId || this.currentNodeId !== nodeId) return;
            if (dc && typeof dc.count === 'number') this.deathCountGlobal = dc.count + 1;   // +1: 算上自己这次
            if (last && !last.error && last.session_id !== sid) this.lastDeathInfo = last;
            apiPost('/api/death', {
                session_id: sid,
                node_id: nodeId,
                death_name: node.deathName,
                death_desc: node.deathDesc,
                chapter: node.chapter
            });
        },

        trackDeathSeen(nodeId) {
            if (!nodeId || !ALL_DEATH_NODE_IDS.includes(nodeId)) return;
            const seen = readJSON(KEYS.deathsSeen, []);
            const list = Array.isArray(seen) ? seen : [];
            if (!list.includes(nodeId)) { list.push(nodeId); writeJSON(KEYS.deathsSeen, list); }
            if (ALL_DEATH_NODE_IDS.every((id) => list.includes(id))) this.unlockAchievement('all_deaths');
        },

        // ===== 最终结局处理 =====
        handleFinal(node) {
            this.uiShatter = true;
            removeKey(KEYS.run);
            if (this._finalTimer) clearTimeout(this._finalTimer);
            this._finalTimer = setTimeout(() => {
                this._finalTimer = null;
                this.triggerJumpscare(() => {
                    // 标题由结局界面的 .ending-title 显示, 这里只放正文
                    this.showEnding('你今晚最好别关灯。');
                });
            }, 2000);
        },

        // ===== 普通结局处理 =====
        handleEnding(node) {
            this.uiShatter = true;
            document.body.classList.add('final-flash');
            // 结局正文: 标题由 .ending-title 显示, 在线人数由 .online-stats 显示, 这里都不再拼
            this.endingText = node.text || '';
            removeKey(KEYS.run);   // 本局已结束, 不再提供"继续上次"

            // ===== 结局CG展示: 3.5 秒后自动淡出, 也可点击关闭 =====
            if (node.endingCG) {
                this.endingCGUrl = node.endingCG;
                this.endingCGVisible = true;
                if (this._endingCGTimer) clearTimeout(this._endingCGTimer);
                this._endingCGTimer = setTimeout(() => {
                    this._endingCGTimer = null;
                    this.endingCGVisible = false;
                }, 3500);
            }

            // 记录结局(+ 成就)
            if (node.endingCode) {
                this.recordEnding(node.endingCode, node.endingName);
            }

            // 提交结果(不等)
            const fearScore = node.fearScore || 50;
            if (this.sessionId && node.endingCode) {
                apiPost('/api/result', {
                    session_id: this.sessionId,
                    fear_score: fearScore,
                    ending_type: node.endingCode,
                    answers: this.buildAnswers()
                });
            }

            // 在线氛围: 回来以后再填, 不阻塞结局文字
            const runId = this._runId;
            apiGet('/api/online').then((online) => {
                if (online && this._runId === runId && !online.error) this.onlineInfo = online;
            });
        },

        closeEndingCG() {
            if (this._endingCGTimer) { clearTimeout(this._endingCGTimer); this._endingCGTimer = null; }
            this.endingCGVisible = false;
        },

        // ===== Jumpscare =====
        triggerJumpscare(onDone) {
            this.jumpscareVisible = true;
            playJumpscareSfx();   // 音效开关关掉时内部静音
            this.vibrate([100, 50, 100, 50, 200, 100, 200]);
            if (this._jumpscareTimer) clearTimeout(this._jumpscareTimer);
            this._jumpscareTimer = setTimeout(() => {
                this._jumpscareTimer = null;
                this.jumpscareVisible = false;
                if (onDone) onDone();
            }, 2500);
        },

        // ===== 显示结局文字 =====
        showEnding(text) {
            this.endingText = text;
            this.vibrate([50, 50, 50, 50, 50, 50, 50, 50]);
            playTone(100, 3, 'sine', 0.2);
        },

        // ===== 构建答案记录 =====
        buildAnswers() {
            const answers = [];
            for (let i = 0; i < this.choicePath.length; i++) {
                const nodeId = this.choicePath[i];
                const node = this.getNodeData(nodeId);
                if (!node) continue;
                const nextId = i < this.choicePath.length - 1 ? this.choicePath[i + 1] : this.currentNodeId;
                const via = this.pathVia ? this.pathVia[i] : null;
                const choice = !via && node.choices ? node.choices.find(c => c.next === nextId) : null;
                if (choice) {
                    answers.push({
                        question_index: i,
                        question_text: (node.text || '').substring(0, 50),
                        choice_index: node.choices.indexOf(choice),
                        choice_text: choice.text,
                        node_id: nodeId,
                        chapter: node.chapter
                    });
                } else if (via || node.exploreScene || node.puzzle) {
                    // 探索场景/谜题: 按热点或出口记录
                    answers.push({
                        question_index: i,
                        question_text: (node.text || '').substring(0, 50),
                        choice_index: -1,
                        choice_text: '探索：' + (via || '场景出口') + ' → ' + nextId,
                        node_id: nodeId,
                        chapter: node.chapter
                    });
                }
            }
            return answers;
        },

        // ===== 提交遗言 =====
        async submitLastWord() {
            if (this.lastWordSubmitting || this.lastWordSent) return;
            const val = (this.lastWordInput || '').trim();
            if (!val) { this.showToast('先写点什么。'); return; }
            if (!this.sessionId || isApiOffline()) {
                this.recordEpitaph(val);
                this.lastWordSent = true;
                this.lastWordInput = '';
                this.showToast('黄裱纸无处可寄，先压进了你的收集册（墓志铭）。');
                return;
            }
            this.lastWordSubmitting = true;
            try {
                const endingName = this.currentNode?.deathName || this.currentNode?.endingName || '未知结局';
                const res = await apiPost('/api/last-word', {
                    session_id: this.sessionId,
                    content: val,
                    ending_name: endingName,
                    player_name: this.playerName
                });
                if (res && !res.error) {
                    this.recordEpitaph(val);
                    this.lastWordSent = true;
                    this.lastWordInput = '';
                    this.showToast('你的遗言已被封入黄裱纸。');
                } else {
                    this.showToast('黄裱纸没能送出去，稍后再试。');
                }
            } finally {
                this.lastWordSubmitting = false;
            }
        },

        // ===== 重新开始 =====
        // 章节续关: 恢复本章开头的存点(不刷新页面)
        restartFromCheckpoint() {
            const cp = this.chapterCheckpoint;
            if (!cp || !this.getNodeData(cp.nodeId)) return;
            this.stopRunTimers();
            this.inventory = gameRuntime.normalizeInventory(cp.inventory || []);
            this.flags = { ...(cp.flags || {}) };
            if (cp.playerStats) this.playerStats = { ...this.playerStats, ...cp.playerStats };
            if (cp.ghostOpacity !== undefined) this.ghostOpacity = cp.ghostOpacity;
            if (Array.isArray(cp.choicePath)) this.choicePath = [...cp.choicePath];
            if (Array.isArray(cp.pathVia)) this.pathVia = [...cp.pathVia];
            this.uiShatter = false;
            this.lastWordInput = '';
            document.body.classList.remove('final-flash');
            this.currentNodeId = cp.nodeId;
            // 恢复模式: 不再重复结算本章开头节点的效果
            this.enterNode(cp.nodeId, { restore: true });
        },
        // 死亡/结局界面"重新来过": 清空本局直接新开, 不再刷新页面
        restartGame() {
            this.startGame();
        },

        // ===== 多周目文本注入 =====
        // 点对话框: 正在打字 → 跳过显示全文(并照常触发后续); 节点密码锁被关掉 → 重新打开
        onDialogClick() {
            if (this.skipTyping && this.skipTyping()) return true;
            if (this.reopenNodePuzzle && this.reopenNodePuzzle()) return true;
            return false;
        },

        // 选项按钮此刻是否在界面上(与 #choices-rpg 的显示条件一致, 且没有面板盖着)
        choicesOnScreen() {
            const n = this.currentNode;
            if (this.screen !== 'game' || !n || this.stageIntroActive || this.isTyping || this.sceneImageVisible) return false;
            if (n.isDeath || n.isFinal || n.isEnding || n.exploreScene || n.puzzle) return false;
            return !this.anyOverlayOpen();
        },

        anyOverlayOpen() {
            return !!(this.confirmState || this.menuVisible || this.inventoryVisible || this.settingsVisible || this.showSaveMenuRpg || this.showSaveMenu ||
                this.showEndingBook || this.showAchievementMenu || this.shareCardVisible || this.closeupVisible || this.puzzleVisible ||
                this.smsVisible || this.sceneExploreVisible || this.camAlertVisible || this.sceneIntroActive);
        },

        // Esc: 关最上层的面板; 没有面板时打开菜单
        closeTopOverlay() {
            if (this.confirmState) { this.answerConfirm(false); return true; }
            if (this.shareCardVisible) { this.closeShareCard(); return true; }
            if (this.closeupVisible) { this.closeCloseup(); return true; }
            if (this.puzzleVisible) { this.closePuzzle(); return true; }
            if (this.smsVisible) { this.closeSms(); return true; }
            if (this.showAchievementMenu) { this.showAchievementMenu = false; return true; }
            if (this.showEndingBook) { this.showEndingBook = false; return true; }
            if (this.showSaveMenuRpg) { this.showSaveMenuRpg = false; return true; }
            if (this.showSaveMenu) { this.showSaveMenu = false; return true; }
            if (this.settingsVisible) { this.settingsVisible = false; return true; }
            if (this.inventoryVisible) { this.inventoryVisible = false; return true; }
            if (this.menuVisible) { this.menuVisible = false; return true; }
            if (this.sceneExploreVisible) { this.closeSceneExplore(); return true; }
            if (this.screen === 'game' && this.toggleMenu) { this.toggleMenu(); return true; }
            return false;
        },

        onGlobalKeydown(e) {
            if (!e || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
            const tag = (e.target && e.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                if (e.key === 'Escape' && e.target.blur) e.target.blur();
                return;
            }
            if (e.key === 'Escape') {
                if (this.closeTopOverlay()) e.preventDefault();
                return;
            }
            if (this.screen !== 'game') return;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (e.repeat) return;
                if (this.onDialogClick()) return;
                if (this.sceneImageVisible) { this.closeSceneImage(); return; }
                if (this.sceneIntroActive) { this.closeSceneIntro(); return; }
                if (this.camAlertVisible) { this.closeCamAlert(); return; }
                if (this.closeupVisible) { this.closeCloseup(); return; }
                if (this.endingCGVisible) { this.closeEndingCG(); return; }
                return;
            }
            if (/^[1-9]$/.test(e.key) && this.choicesOnScreen()) {
                const choice = this.visibleChoices[Number(e.key) - 1];
                if (choice) { e.preventDefault(); this.makeChoice(choice); }
            }
        },

        injectNewGamePlusText(node) {
            if (this.deathCount <= 0) return node;
            const dc = this.deathCount;
            let text = node.text;
            // 根据死亡次数注入提示
            if (dc >= 2 && this.currentNodeId === 'node04') {
                text += '\n\n（你记得上一次，烧纸的人转过头来...是一张白纸脸。）';
            }
            if (dc >= 3 && this.currentNodeId === 'node09') {
                text += '\n\n（你死在这里两次了。这一次，不要出声。）';
            }
            if (dc >= 5 && this.currentNodeId === 'node14') {
                text = '【第' + dc + '次尝试】\n\n' + text;
            }
            return { ...node, text };
        },

        // ===== 存档系统 =====
        // ===== 结局收集册 =====
        toggleEndingBook() {
            const open = !this.showEndingBook;
            if (this._closeOverlays) this._closeOverlays('showEndingBook');
            this.showEndingBook = open;
        },
        loadBookData() {
            const seen = readJSON(KEYS.deathsSeen, []);
            this.deathsSeenList = Array.isArray(seen) ? seen : [];
            const eps = readJSON(KEYS.epitaphs, []);
            this.epitaphs = Array.isArray(eps) ? eps.slice().reverse() : [];
        },
        // 死法木牌: 点开看死因(特写层在收集册之上)
        openDeathCard(d) {
            if (!d || !d.seen) return;
            this.showCloseup('', (d.chapter ? d.chapter + '\n\n' : '') + d.desc, null, '死法 · ' + d.name, '');
        },
        // 遗言一律先压进自己的收集册(墓志铭); 有后端再寄出去
        recordEpitaph(text) {
            const list = readJSON(KEYS.epitaphs, []);
            const arr = Array.isArray(list) ? list : [];
            arr.push({ text, name: this.playerName || '', ending: this.currentNode?.deathName || this.currentNode?.endingName || '', at: Date.now() });
            while (arr.length > 30) arr.shift();
            writeJSON(KEYS.epitaphs, arr);
        },
        recordEnding(code, name) {
            if (!this.endingCollection.includes(code)) {
                this.endingCollection.push(code);
                writeJSON(KEYS.endings, this.endingCollection);
            }
            this.unlockAchievement('survivor');
            this.unlockAchievement('ending_' + code);
            if (code === TRUE_ENDING_CODE) this.unlockAchievement('true_end');
            if (ALL_ENDING_CODES.length && ALL_ENDING_CODES.every((c) => this.endingCollection.includes(c))) this.unlockAchievement('all_endings');
            if (!this._runDeaths) this.unlockAchievement('no_death');
            if (!this._runHintBurns) this.unlockAchievement('no_hint');
            if (this.gameStartTime && Date.now() - this.gameStartTime < 10 * 60 * 1000) this.unlockAchievement('speedrun');
        },

        // ===== 真实时间彩蛋 =====
        checkRealTimeEasterEgg() {
            const h = new Date().getHours();
            const isJuly15 = false; // 可扩展农历判断
            if (h >= 0 && h < 5) {
                return '凌晨的黑暗最深。你确定要在这个时间打开它吗？';
            }
            if (h === 3 || h === 4) {
                return '现在是' + h + ':44。你知道这个时间意味着什么吗？';
            }
            return null;
        },

        // ===== 分享结局卡片 =====
        shareEnding() {
            const isDeath = this.currentNode?.isDeath;
            const name = this.currentNode?.endingName || this.currentNode?.deathName || '未知结局';
            const gameName = this.lang === 'zh' ? '回魂夜' : 'Soul Return';
            const url = this.gameUrl();
            const text = isDeath
                ? `我在《${gameName}》中死在了【${name}】\n你敢来试试吗？`
                : `我在《${gameName}》中打出了结局【${name}】\n你敢来试试吗？`;
            if (navigator.share) {
                navigator.share({ title: gameName + ' · ' + name, text, url }).catch(() => {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text + '\n' + url)
                    .then(() => this.showToast('分享文案已复制到剪贴板'))
                    .catch(() => this.showToast('复制失败，请手动复制'));
            } else {
                this.showToast('浏览器不支持自动复制：' + url);
            }
        },

        // ===== 结局名称查询 =====
        getEndingName(code) {
            return ENDING_NAMES[code] || '未知';
        },

        // ===== 弹幕 =====
        showDanmu(text) {
            const id = this.danmuId++;
            // 性能: 改用 CSS animation(translateX, 合成层完成), 不再 rAF 逐帧写 left + 读 offsetWidth 强制重排;
            // 时长按约 72px/s 固定计算(与旧版 60Hz 下速度一致, 不随刷新率变化), 结束时 @animationend 调 removeDanmu
            const seconds = (window.innerWidth + String(text).length * 15) / 72;
            this.danmuList.push({
                id,
                text,
                style: { top: Math.round(Math.random() * 100) + 'px', animationDuration: seconds.toFixed(2) + 's' }
            });
        },
        removeDanmu(id) {
            const idx = this.danmuList.findIndex(d => d.id === id);
            if (idx >= 0) this.danmuList.splice(idx, 1);
        },

        // ===== 选项延迟动画 =====
        choiceDelay(idx) {
            return { animationDelay: (idx * 0.15) + 's' };
        },

        // ===== RPG系统 =====
        updatePlayerStats(node) {
            if (!node) return;
            const s = this.playerStats;
            // 根据节点类型自动计算理智/恐惧变化
            if (node.statEffect) {
                this.applyStatEffect(node.statEffect);
            } else if (node.isEnding) {
                s.fear = Math.max(s.fear - 20, 0);
                s.sanity = Math.min(s.sanity + 10, s.maxSanity);
            } else if (node.vibration && node.vibration.length > 0) {
                // 有震动的恐怖节点
                const intensity = node.vibration.reduce((a, b) => a + b, 0);
                const d = intensity > 400 ? 15 : (intensity > 200 ? 10 : 5);
                s.sanity = Math.max(s.sanity - d, 0);
                s.fear = Math.min(s.fear + d, s.maxFear);
            } else if (!node.isDeath) {
                // 普通节点：略微恢复理智
                s.sanity = Math.min(s.sanity + 2, s.maxSanity);
            }
            // 保存RPG属性
            writeJSON(KEYS.rpgStats, s);
        },
    }
}).mount('#app');









