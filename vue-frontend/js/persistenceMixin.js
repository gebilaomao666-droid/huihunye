// 存档 / 读档 / 设置持久化 子系统 (从 app.js 抽出的方法 mixin)。
// 相关状态 (saveSlots/playerStats/settings 等) 仍在主组件 data(); Vue 合并后 this 指向同一实例。
import { gameRuntime } from './rpg/runtimeInstance.js?v=20261010-warm';
import { KEYS, readJSON, writeJSON } from './storage.js?v=20261010-warm';
import { initAudio, resumeAudio } from './audio.js?v=20261010-warm';
import * as audioExt from './audio.js?v=20261010-warm';

export const persistenceMixin = {
    methods: {
        manualSave(slotIndex) {
            const save = {
                slot: slotIndex,
                nodeId: this.currentNodeId,
                nodeName: this.currentNode?.chapter || '未知',
                time: new Date().toLocaleString('zh-CN'),
                pathLength: this.choicePath.length,
                inventory: gameRuntime.normalizeInventory(this.inventory),
                flags: { ...this.flags },
                playerStats: { ...this.playerStats },
                ghostOpacity: this.ghostOpacity,
                choicePath: [...(this.choicePath || [])],
                pathVia: [...(this.pathVia || [])],
                bgImage: this.bgImageUrl || ''
            };
            // 确保saveSlots有3个位置
            while (this.saveSlots.length < 3) this.saveSlots.push(null);
            this.saveSlots[slotIndex] = save;
            writeJSON(KEYS.saves, this.saveSlots);
            if (audioExt.playUi) audioExt.playUi('save');
            this.showToast('存档已保存到槽位 ' + (slotIndex + 1));
        },
        async manualLoad(slotIndex) {
            const save = this.saveSlots[slotIndex];
            if (!save) {
                if (audioExt.playUi) audioExt.playUi('error');
                this.showToast('该存档槽为空');
                return;
            }
            if (!(await this.askConfirm('读取存档「' + save.nodeName + '」？\n存于 ' + save.time, { ok: '读取', okGlyph: '读' }))) return;
            if (!save.nodeId || !gameRuntime.getNode(save.nodeId)) {
                if (audioExt.playUi) audioExt.playUi('error');
                this.showToast('这个存档已经损坏，读不出来了。');
                return;
            }
            // 读档发生在用户点击里: 顺手初始化并恢复音频
            try { initAudio(); resumeAudio(); if (audioExt.playUi) audioExt.playUi('light'); } catch (e) {}
            if (this.stopRunTimers) this.stopRunTimers();
            this.currentNodeId = save.nodeId;
            this.inventory = gameRuntime.normalizeInventory(save.inventory || []);
            this.flags = { ...(save.flags || {}) };
            if (save.playerStats) this.playerStats = { ...this.playerStats, ...save.playerStats };
            if (typeof save.ghostOpacity === 'number') this.ghostOpacity = save.ghostOpacity;
            this.choicePath = Array.isArray(save.choicePath) ? [...save.choicePath] : [];
            this.pathVia = Array.isArray(save.pathVia) ? [...save.pathVia] : [];
            if (save.bgImage) this.bgImageUrl = save.bgImage;
            // 不问鬼神: 读档后沿用存档那一局烧过的黄纸数
            this._runHintBurns = Math.max(this._runHintBurns || 0, this.flags['hint:total'] || 0);
            if (this._closeOverlays) this._closeOverlays();
            this.showSaveMenu = false;
            this.showSaveMenuRpg = false;
            this.menuVisible = false;
            this.screen = 'game';
            if (this.ensureSession) this.ensureSession();
            // 恢复模式: 不再重复结算节点道具/flag/属性效果
            this.enterNode(save.nodeId, { restore: true });
        },
        toggleSaveMenu() {
            if (this.rpgMode) {
                this.showSaveMenuRpg = !this.showSaveMenuRpg;
                this.showSaveMenu = false;
                return;
            }
            this.showSaveMenu = !this.showSaveMenu;
        },
        manualSaveRpg(slotIndex) {
            const save = {
                slot: slotIndex,
                nodeId: this.currentNodeId,
                nodeName: this.currentNode?.chapter || '未知',
                time: new Date().toLocaleString('zh-CN'),
                pathLength: this.choicePath.length,
                bgImage: this.bgImageUrl || '',
                sanity: this.playerStats.sanity,
                fear: this.playerStats.fear,
                inventory: gameRuntime.normalizeInventory(this.inventory),
                flags: { ...this.flags },
                playerStats: { ...this.playerStats },
                ghostOpacity: this.ghostOpacity,
                choicePath: [...(this.choicePath || [])],
                pathVia: [...(this.pathVia || [])]
            };
            while (this.saveSlots.length < 3) this.saveSlots.push(null);
            this.saveSlots[slotIndex] = save;
            writeJSON(KEYS.saves, this.saveSlots);
            if (audioExt.playUi) audioExt.playUi('save');
            this.showToast('存档已保存到槽位 ' + (slotIndex + 1));
            this.showSaveMenuRpg = false;
        },
        async deleteSave(slotIndex) {
            if (!(await this.askConfirm('删除存档「' + (this.saveSlots[slotIndex]?.nodeName || '空槽位') + '」？\n删了就找不回来了。', { ok: '删除', okGlyph: '删' }))) return;
            while (this.saveSlots.length < 3) this.saveSlots.push(null);
            this.saveSlots[slotIndex] = null;
            writeJSON(KEYS.saves, this.saveSlots);
            this.showToast('存档已删除');
        },
        saveSettings() {
            const settings = {
                textSpeed: this.textSpeed,
                soundEnabled: this.soundEnabled,
                vibrationEnabled: this.vibrationEnabled,
                rpgMode: true
            };
            this.rpgMode = true;
            writeJSON(KEYS.settings, settings);
        },
        loadSettings() {
            try {
                const s = readJSON(KEYS.settings, {});
                if (s.textSpeed !== undefined) this.textSpeed = s.textSpeed;
                if (s.soundEnabled !== undefined) this.soundEnabled = s.soundEnabled;
                if (s.vibrationEnabled !== undefined) this.vibrationEnabled = s.vibrationEnabled;
            } catch(e) {}
            this.rpgMode = true;
        },
    }
};
