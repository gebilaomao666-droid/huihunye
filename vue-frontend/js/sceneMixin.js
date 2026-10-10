// 场景探索 / 谜题面板 / 烧黄纸问 / 道具特写 子系统 (从 app.js 抽出的方法 mixin)。
// 相关状态仍在主组件 data(); Vue 合并后 this 指向同一实例。
// 谜题全部数据驱动: PUZZLES[pzId].kind 决定用哪种面板(timing/code/road/drag/choice), item/steps 两类只靠热点完成。
import { getVisibleHotspots, resolveHotspot } from './rpg/sceneEngine.js?v=20260601-hotfix21';
import { gameRuntime } from './rpg/runtimeInstance.js?v=20260601-hotfix21';
import { PUZZLES, HINTS, HINT_SYSTEM } from './nodes.js?v=20260601-hotfix21';
import { playScream, playWhisper, playKnock, playTone } from './audio.js?v=20260601-hotfix21';

const PANEL_KINDS = ['timing', 'code', 'road', 'drag', 'choice'];

export const sceneMixin = {
    computed: {
        // 当前可以“烧黄纸问”的谜题: 面板里的那个 > 场景里第一个没解开的 > 节点级谜题
        hintPuzzleId() {
            if (this.screen !== 'game' || !this.currentNode) return null;
            if (this.puzzleVisible && this.puzzleId) return this.puzzleId;
            const nodeId = this.currentNodeId;
            if (this.sceneExploreVisible) {
                return Object.keys(PUZZLES).find((id) => PUZZLES[id].node === nodeId && !this.isPuzzleSolved(id)) || null;
            }
            const pz = this.currentNode.puzzle;
            return pz && !this.isPuzzleSolved(pz) ? pz : null;
        },
        hintIsPhone() {
            return !!this.currentNode && this.currentNode.chapter === HINT_SYSTEM.phoneChapter;
        },
        hintPapers() {
            return this.flags['hint:papers'] || 0;
        },
        shownHints() {
            const id = this.hintPuzzleId;
            if (!id) return [];
            const n = this.flags['hint:burned:' + id] || 0;
            const labels = this.hintIsPhone ? HINT_SYSTEM.phoneLabels : HINT_SYSTEM.labels;
            return (HINTS[id] || []).slice(0, n).map((text, i) => ({ label: labels[i], text }));
        },
        hintButtonText() {
            if (this.hintIsPhone) return '翻手机草稿箱';
            return `${HINT_SYSTEM.name}（黄纸 ${this.hintPapers} 张）`;
        },
        puzzleConfig() {
            return this.puzzleId ? PUZZLES[this.puzzleId] : null;
        }
    },
    methods: {
        showSceneExplore(image, title, hotspots, node = {}) {
            this.exploreSceneId = node.sceneId || this.currentNodeId || title || 'scene';
            this.exploreImage = image;
            this.exploreTitle = title;
            this.exploreHint = node.sceneHint || '点击场景里的可疑处。选中背包道具后，可以直接点场景物件使用。';
            this.exploreReturnNode = node.returnNode || null;
            this.exploreNoClose = !!node.sceneNoClose;
            this.exploreCloseText = node.closeText || (this.exploreReturnNode ? '退出场景' : this.t('close'));
            this.exploreAllHotspots = hotspots || [];
            this.refreshExploreHotspots();
            this.sceneExploreVisible = true;
        },
        reopenCurrentScene() {
            const n = this.currentNode;
            if (n && n.exploreScene) this.showSceneExplore(n.sceneImage, n.sceneTitle, n.hotspots || [], n);
        },
        refreshExploreHotspots() {
            this.exploreHotspots = getVisibleHotspots(this.exploreAllHotspots, {
                sceneId: this.exploreSceneId,
                inventory: this.inventory,
                flags: this.flags
            });
        },
        // 解开 = 记过 solved:旗标, 或成功旗标已全部到手(如抹眼睛这种靠多个热点完成的)
        isPuzzleSolved(id) {
            if (this.flags['solved:' + id]) return true;
            const sf = (PUZZLES[id] && PUZZLES[id].successFlags) || [];
            return sf.length > 0 && sf.every((f) => this.flags[f]);
        },
        // 热点 / 谜题共用: 落 flag 与道具变化
        _applyEffects({ flags, consumeItem, addItem }) {
            if (flags && Object.keys(flags).length) this.flags = { ...this.flags, ...flags };
            if (consumeItem) {
                this.inventory = gameRuntime.removeItem(this.inventory, consumeItem);
                if (this.selectedItem && this.selectedItem.key === consumeItem) this.selectedItem = null;
            }
            if (addItem) this.inventory = gameRuntime.addItem(this.inventory, addItem);
        },
        _puzzleSuccessEffects(id) {
            const pz = PUZZLES[id];
            const flags = { ['solved:' + id]: true };
            (pz.successFlags || []).forEach((f) => { flags[f] = true; });
            this._applyEffects({ flags, addItem: pz.successItem || null });
        },
        onHotspotClick(hs) {
            // “每点一次纸人迈一步”类: 计步, 到上限就死
            if (hs.stepPuzzle) { this._stepHotspot(hs); return; }
            const result = resolveHotspot(hs, {
                sceneId: this.exploreSceneId,
                inventory: this.inventory,
                flags: this.flags
            });
            const via = hs.label || hs.id || '可疑处';
            if (result.blocked) {
                if (result.lockedNext) {
                    this.sceneExploreVisible = false;
                    this.selectedItem = null;
                    this.goTo(result.lockedNext, via);
                    return;
                }
                // 需要的道具没有, 但背包材料够 → 提示去背包合成(不自动做, 保留解谜)
                const hint = hs.requireItem ? gameRuntime.combineHintFor(this.inventory, hs.requireItem) : null;
                this.showToast(hint || result.message);
                return;
            }
            const pz = hs.puzzle ? PUZZLES[hs.puzzle] : null;
            // 面板类谜题: 先开面板, 解开后才结算热点效果
            if (pz && PANEL_KINDS.includes(pz.kind)) {
                this.sceneExploreVisible = false;
                this.openPuzzle(hs.puzzle, { hotspot: hs, result, via, intro: hs.closeupText || '' });
                return;
            }
            const hadItem = result.addItem && gameRuntime.hasItem(this.inventory, result.addItem);
            this._applyEffects(result);
            if (hs.requireItem && this.selectedItem && this.selectedItem.key === hs.requireItem) this.selectedItem = null;
            if (pz) this._puzzleSuccessEffects(hs.puzzle);
            // 有特写时提示条等特写关掉再出, 免得叠在特写文字上
            if (hs.closeup) this._toastAfterCloseup = result.toast || null;
            else {
                if (result.toast) this.showToast(result.toast);
                else if (result.addItem && !hadItem) this.showToast(`获得道具：${this.getItemName(result.addItem)}`);
            }
            this.refreshExploreHotspots();
            this._hotspotFeedback(hs);
            if (result.addItem || result.consumeItem || (result.flags && Object.keys(result.flags).length)) {
                if (this.persistRun) this.persistRun({ submit: true });
            }
            const next = hs.deathNode || hs.nextNode || (pz && pz.successNext) || null;
            const text = [hs.closeup ? hs.closeupText : '', pz && pz.successText].filter(Boolean).join('\n\n');
            if (text) {
                this.showCloseup(hs.closeup ? (hs.closeupImage || '') : '', text, next, hs.closeupTitle || hs.label || '物件特写', '');
                this.closeupVia = via;
                if (next) this.sceneExploreVisible = false;
                return;
            }
            if (next) {
                this.sceneExploreVisible = false;
                this.selectedItem = null;
                this.goTo(next, via);
            }
        },
        _stepHotspot(hs) {
            const pz = PUZZLES[hs.stepPuzzle];
            const key = 'steps:' + hs.stepPuzzle;
            const n = (this.flags[key] || 0) + 1;
            this.flags = { ...this.flags, [key]: n };
            this.vibrate([60, 80, 60]);
            playKnock();
            if (n >= pz.limit) {
                this.sceneExploreVisible = false;
                this.goTo(pz.failNext, hs.label || hs.id);
                return;
            }
            const text = [hs.closeupText, pz.stepText[n - 1]].filter(Boolean).join('\n\n');
            this.showCloseup('', text, null, hs.closeupTitle || hs.label, '');
            if (this.persistRun) this.persistRun();
        },
        // 探索热点感官反馈: 死亡→尖叫+重震; 禁忌窥视→耳语+中震; 发现→轻音+轻震
        _hotspotFeedback(hs) {
            const hint = (hs.closeupTitle || '') + (hs.label || '');
            if (hs.deathNode) { this.vibrate([300, 200, 300]); playScream(); }
            else if (/别往|水里|水面|井|镜|血玉|倒影|盯/.test(hint)) { this.vibrate([60, 120, 60]); playWhisper(); }
            else if (hs.item || (hs.setFlags && Object.keys(hs.setFlags).length)) { this.vibrate([30, 60, 30]); playTone(180, 0.4, 'sine', 0.05); }
        },
        closeSceneExplore() {
            if (this.exploreNoClose) { this.showToast('它们还在往前走。逃不出这一圈。'); return; }
            this.sceneExploreVisible = false;
            this.selectedItem = null;
            if (this.exploreReturnNode) {
                const next = this.exploreReturnNode;
                const via = this.exploreCloseText || '退出场景';
                const fromNode = this.currentNodeId;
                this.exploreReturnNode = null;
                this.exploreCloseText = '';
                setTimeout(() => { if (this.currentNodeId === fromNode) this.goTo(next, via); }, 160);
            }
        },

        // ===== 谜题面板 =====
        openPuzzle(id, ctx = {}) {
            const pz = PUZZLES[id];
            if (!pz) return;
            this._stopPuzzleTimers();
            this.puzzleId = id;
            this.puzzleCtx = ctx;
            this.puzzleIntro = ctx.intro || '';
            this.puzzleMsg = '';
            this.puzzleInput = '';
            this.puzzleRoadStep = 0;
            this.puzzleRoadLook = 0;
            this.puzzleHeights = pz.kind === 'drag' ? [...pz.initial] : [];
            this.puzzlePhase = '';
            this.puzzleVisible = true;
            if (pz.kind === 'timing') this._startTiming();
        },
        _stopPuzzleTimers() {
            (this._puzzleTimers || []).forEach((t) => clearTimeout(t));
            this._puzzleTimers = [];
        },
        _puzzleLater(fn, ms) {
            this._puzzleTimers = this._puzzleTimers || [];
            this._puzzleTimers.push(setTimeout(fn, ms));
        },
        // 时机点击: 反光里先出现槐树, 窗口期内按铃成功; 早按不响可重试, 窗口过去就错过
        _startTiming() {
            const pz = PUZZLES[this.puzzleId];
            const lead = pz.leadMinMs + Math.random() * (pz.leadMaxMs - pz.leadMinMs);
            this.puzzlePhase = 'wait';
            const id = this.puzzleId;
            this._puzzleLater(() => {
                if (!this.puzzleVisible || this.puzzleId !== id) return;
                this.puzzlePhase = 'tree';
                this.vibrate([40]);
                this._puzzleLater(() => {
                    if (!this.puzzleVisible || this.puzzleId !== id || this.puzzlePhase !== 'tree') return;
                    this.puzzlePhase = 'gone';
                    this._puzzleFail(true);
                }, pz.windowMs);
            }, lead);
        },
        pressTiming() {
            if (this.puzzlePhase === 'tree') { this._puzzleSucceed(); return; }
            if (this.puzzlePhase === 'wait') {
                this.puzzleMsg = PUZZLES[this.puzzleId].earlyText;
                this.vibrate([20]);
                playKnock();
            }
        },
        // 数字锁
        onPuzzleKey(key) {
            const pz = PUZZLES[this.puzzleId];
            if (!pz || pz.kind !== 'code') return;
            if (key === 'clear') { this.puzzleInput = ''; return; }
            if (key === 'enter') {
                if (this.puzzleInput.length !== pz.length) { this.puzzleMsg = `要按满 ${pz.length} 下。`; return; }
                if (this.puzzleInput === pz.answer) this._puzzleSucceed();
                else { this.puzzleInput = ''; this._puzzleFail(false); }
                return;
            }
            if (this.puzzleInput.length < pz.length) { this.puzzleInput += key; playTone(320, 0.08, 'square', 0.03); }
        },
        // 三岔口: 先看纸偶(盯着它不动, 挪开眼再看才转), 再选路
        lookPuppet() {
            const pz = PUZZLES[this.puzzleId];
            this.puzzleRoadLook = this.puzzleRoadLook === 1 ? 2 : 1;
            this.puzzleMsg = this.puzzleRoadLook === 1 ? pz.stareText : pz.lookText.replace('{dir}', pz.answer[this.puzzleRoadStep]);
        },
        chooseRoad(dir) {
            const pz = PUZZLES[this.puzzleId];
            this.puzzleRoadLook = 0;
            if (dir === pz.answer[this.puzzleRoadStep]) {
                this.puzzleRoadStep += 1;
                if (this.puzzleRoadStep >= pz.answer.length) { this._puzzleSucceed(); return; }
                this.puzzleMsg = pz.passTexts[this.puzzleRoadStep - 1] || '';
                return;
            }
            this._puzzleFail(false);
        },
        // 摆香: 拖动每炷香调高低(鼠标/触摸统一用 pointer 事件, 轨道上 touch-action:none)
        startIncenseDrag(index, ev) {
            if (ev && ev.cancelable) ev.preventDefault();
            const track = ev.currentTarget;
            this.puzzleMsg = '';
            const pz = PUZZLES[this.puzzleId];
            const rect = track.getBoundingClientRect();
            const setFromY = (clientY) => {
                const ratio = 1 - (clientY - rect.top) / rect.height;
                const lv = Math.max(1, Math.min(pz.levels, Math.round(ratio * pz.levels)));
                if (this.puzzleHeights[index] !== lv) this.puzzleHeights.splice(index, 1, lv);
            };
            const move = (e) => { if (e.cancelable) e.preventDefault(); setFromY(e.clientY); };
            const up = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                window.removeEventListener('pointercancel', up);
                this._incenseDragEnd = null;
            };
            if (this._incenseDragEnd) this._incenseDragEnd();
            this._incenseDragEnd = up;
            window.addEventListener('pointermove', move, { passive: false });
            window.addEventListener('pointerup', up);
            window.addEventListener('pointercancel', up);
            setFromY(ev.clientY);
        },
        confirmIncense() {
            const pz = PUZZLES[this.puzzleId];
            const h = this.puzzleHeights;
            if (h.every((v) => v === h[0])) { this._puzzleSucceed(); return; }
            const sorted = [...h].sort((a, b) => a - b);
            if (sorted[0] === sorted[1] && sorted[2] > sorted[1]) {
                // 两短一长: 灰断香熄, 打乱重摆(不致死)
                this.puzzleMsg = pz.badText;
                this.puzzleHeights = h.map(() => 1 + Math.floor(Math.random() * pz.levels));
                playWhisper();
                return;
            }
            this.puzzleMsg = pz.unevenText;
        },
        // 四选一
        choosePuzzleOption(opt) {
            const pz = PUZZLES[this.puzzleId];
            if (opt === pz.answer) { this._puzzleSucceed(); return; }
            const extra = pz.specialFail && pz.specialFail.option === opt ? pz.specialFail.text : '';
            this._puzzleFail(false, extra);
        },
        _puzzleSucceed() {
            const id = this.puzzleId;
            const pz = PUZZLES[id];
            const ctx = this.puzzleCtx || {};
            this._stopPuzzleTimers();
            this.puzzleVisible = false;
            this.puzzleId = null;
            this.puzzleCtx = null;
            if (ctx.result) this._applyEffects(ctx.result);
            this._puzzleSuccessEffects(id);
            this.vibrate([50, 100, 50]);
            playTone(260, 0.5, 'sine', 0.06);
            if (this.persistRun) this.persistRun({ submit: true });
            const next = pz.successNext || (ctx.hotspot && ctx.hotspot.nextNode) || null;
            const via = ctx.via || pz.title || id;
            if (!next) this.reopenCurrentScene();
            if (pz.successText) {
                this.showCloseup('', pz.successText, next, pz.title || '', '');
                this.closeupVia = via;
                return;
            }
            if (next) this.goTo(next, via);
        },
        // 失败: 计数, 到上限(或 fatal)就跳失败节点, 否则留在面板里重来
        _puzzleFail(fatal, extraText = '') {
            const id = this.puzzleId;
            const pz = PUZZLES[id];
            const key = 'pzfail:' + id;
            const count = (this.flags[key] || 0) + 1;
            this.flags = { ...this.flags, [key]: count };
            this.vibrate([200]);
            if (fatal || (pz.maxFails && count >= pz.maxFails)) {
                this._stopPuzzleTimers();
                this.puzzleVisible = false;
                this.puzzleId = null;
                const via = (this.puzzleCtx && this.puzzleCtx.via) || pz.title || id;
                this.puzzleCtx = null;
                this.goTo(pz.failNext, via);
                return;
            }
            playWhisper();
            if (pz.kind === 'road') this.puzzleMsg = pz.failTexts[count - 1] || pz.failTexts[pz.failTexts.length - 1];
            else this.puzzleMsg = [pz.firstFailText, extraText].filter(Boolean).join('\n');
            if (this.persistRun) this.persistRun();
        },
        // 关闭 ≠ 失败: 只收起面板。来自探索热点的回到探索场景; 节点级谜题点对话框可重新打开
        closePuzzle() {
            const fromScene = !!(this.puzzleCtx && this.puzzleCtx.hotspot);
            this._stopPuzzleTimers();
            this.puzzleVisible = false;
            this.puzzleId = null;
            this.puzzleCtx = null;
            if (fromScene) { this.reopenCurrentScene(); return; }
            if (this.currentNode && this.currentNode.puzzle) this.showToast('点对话框可以再试一次。');
        },
        reopenNodePuzzle() {
            const n = this.currentNode;
            if (!n || !n.puzzle || this.puzzleVisible || this.isTyping || this.isPuzzleSolved(n.puzzle)) return false;
            this.openPuzzle(n.puzzle, { via: n.sceneName });
            return true;
        },

        // ===== 烧黄纸问 =====
        // 每章开头补满; 第一章是手机草稿箱(不耗黄纸)
        refillHintPapers(node) {
            if (!node || !node.chapter || node.isDeath || node.isEnding) return;
            if (this.flags['hint:chapter'] === node.chapter) return;
            const papers = node.chapter === HINT_SYSTEM.phoneChapter ? 0 : HINT_SYSTEM.papersPerChapter;
            this.flags = { ...this.flags, 'hint:chapter': node.chapter, 'hint:papers': papers };
        },
        burnHint() {
            const id = this.hintPuzzleId;
            if (!id) return;
            const key = 'hint:burned:' + id;
            const n = this.flags[key] || 0;
            if (n >= 3) { this.showToast('三级提示都已经看过了。'); return; }
            if (this.hintIsPhone) {
                this.flags = { ...this.flags, [key]: n + 1 };
                this.vibrate([30]);
                return;
            }
            if (this.hintPapers <= 0) { this.showToast('黄纸烧完了。下一章在长明灯前才补得上。'); return; }
            this._runHintBurns = (this._runHintBurns || 0) + 1;
            this.flags = { ...this.flags, [key]: n + 1, 'hint:papers': this.hintPapers - 1, 'hint:total': (this.flags['hint:total'] || 0) + 1 };
            playTone(140, 0.6, 'sine', 0.05);
            if (this.persistRun) this.persistRun();
        },

        // ===== 道具特写 =====
        showCloseup(image, text, nextNode, title = '物件特写', hint = '细看之后，点下方返回。') {
            this.achievementToast = null;   // 清掉残留 toast, 避免与特写文字重叠(互相遮盖)
            this.closeupImage = image;
            this.closeupText = text;
            this.closeupTitle = title;
            this.closeupHint = hint;
            this.closeupNextNode = nextNode;
            this.closeupVisible = true;
        },
        closeCloseup() {
            this.closeupVisible = false;
            this.closeupTitle = '';
            this.closeupHint = '';
            if (this._toastAfterCloseup) { this.showToast(this._toastAfterCloseup); this._toastAfterCloseup = null; }
            if (this.closeupNextNode) {
                const next = this.closeupNextNode;
                const via = this.closeupVia || '特写';
                this.closeupNextNode = null;
                this.closeupVia = null;
                this.sceneExploreVisible = false;
                this.goTo(next, via);
            }
        },
    }
};
