// 菜单 / 背包面板 / 道具操作 子系统 (从 app.js 抽出的方法 mixin)。
// 相关状态仍在主组件 data(); Vue 合并后 this 指向同一实例。
import { gameRuntime } from './rpg/runtimeInstance.js?v=20261012-end';

export const uiMixin = {
    methods: {
        // 关闭所有顶层模态(可保留一个), 保证同一时刻只开一个面板, 避免互相遮盖
        _closeOverlays(except) {
            for (const k of ['menuVisible', 'inventoryVisible', 'settingsVisible', 'showSaveMenuRpg', 'showEndingBook', 'showSaveMenu', 'showAchievementMenu', 'shareCardVisible']) {
                if (k !== except && k in this) this[k] = false;
            }
        },
        toggleMenu() {
            const open = !this.menuVisible;
            this._closeOverlays('menuVisible');
            this.menuVisible = open;
        },
        toggleInventory() {
            const open = !this.inventoryVisible;
            this._closeOverlays('inventoryVisible');
            this.inventoryVisible = open;
            this.selectedItem = null;
        },
        // ===== 手机壳: 添加到桌面 / 全屏 =====
        setupMobileShell() {
            const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
            this.isPhone = mq('(pointer: coarse)') || (navigator.maxTouchPoints || 0) > 0;
            this.isStandalone = mq('(display-mode: standalone)') || mq('(display-mode: fullscreen)') || navigator.standalone === true;
            this.installHintVisible = this.isPhone && !this.isStandalone;
            window.addEventListener('appinstalled', () => { this.installHintVisible = false; this.showToast('已添加到桌面，从桌面打开就是全屏。'); });
            const sync = () => { this.fullscreenOn = !!(document.fullscreenElement || document.webkitFullscreenElement); };
            document.addEventListener('fullscreenchange', sync);
            document.addEventListener('webkitfullscreenchange', sync);
        },
        async installApp() {
            const ev = window.__installPrompt;
            if (ev && ev.prompt) {
                window.__installPrompt = null;
                try { ev.prompt(); const r = await ev.userChoice; if (r && r.outcome === 'accepted') this.installHintVisible = false; } catch (e) {}
                return;
            }
            const ua = navigator.userAgent || '';
            let how;
            if (/MicroMessenger/i.test(ua)) how = '微信里不能直接添加。\n点右上角「…」选「在浏览器打开」，再从浏览器菜单里「添加到主屏幕」。';
            else if (/iPhone|iPad|iPod/i.test(ua)) how = '用 Safari 打开本页，点底部「分享」按钮，选「添加到主屏幕」。';
            else how = '点浏览器菜单（右上角「⋮」或底部「≡」），选「添加到主屏幕」或「安装应用」。';
            await this.askConfirm(how, { ok: '知道了', okGlyph: '好' });
        },
        enterFullscreen() {
            if (!this.isPhone || this.isStandalone) return;
            const el = document.documentElement;
            const fn = el.requestFullscreen || el.webkitRequestFullscreen;
            if (!fn || document.fullscreenElement || document.webkitFullscreenElement) return;
            try { const r = fn.call(el, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => {}); } catch (e) {}
        },
        toggleFullscreen() {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                const fn = document.exitFullscreen || document.webkitExitFullscreen;
                try { const r = fn && fn.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) {}
            } else {
                this.enterFullscreen();
            }
        },
        toggleSettings() {
            const open = !this.settingsVisible;
            this._closeOverlays('settingsVisible');
            this.settingsVisible = open;
        },
        toggleSaveMenuRpg() {
            const open = !this.showSaveMenuRpg;
            this._closeOverlays('showSaveMenuRpg');
            this.showSaveMenuRpg = open;
        },
        menuContinue() {
            this.menuVisible = false;
        },
        menuAction(action) {
            this.menuVisible = false;
            if (action === 'save') {
                this.showSaveMenuRpg = true;
            } else if (action === 'load') {
                this.showSaveMenuRpg = true;
            } else if (action === 'settings') {
                this.settingsVisible = true;
            } else if (action === 'book') {
                this.showEndingBook = true;
            } else if (action === 'achievements') {
                this.showAchievementMenu = true;
            }
        },
        // 返回主菜单: 当前进度先落成本地续玩快照, 回到开始界面可"继续上次"
        async menuReturnTitle() {
            this.menuVisible = false;
            const ok = await this.askConfirm('返回标题？\n当前进度会自动保存，可在标题页点「继续上次」接着玩。', { ok: '返回', okGlyph: '归' });
            if (!ok) return;
            if (this.persistRun) this.persistRun({ submit: true });
            this.menuVisible = false;
            this.resetRun({ keepSnapshot: true });
        },
        // 退出游戏: 清空本局(会话/节点/道具/flag/路径/属性/检查点), 回到开始界面; 手动存档位不受影响。不再刷新页面
        async menuQuit() {
            this.menuVisible = false;
            const ok = await this.askConfirm('退出本局？\n本局进度会清空（手动存档不受影响）。', { ok: '退出', okGlyph: '退' });
            if (!ok) return;
            this.menuVisible = false;
            this.playerName = '';
            this.resetRun({ keepSnapshot: false });
        },
        // 道具长按(≥450ms)展示介绍特写; 抑制随后的点击选中
        startItemPress(itemKey, ev) {
            this._longPressed = false;
            // 记录起点, 手指移动超过 10px(滑动道具栏)就取消长按
            const e = ev || window.event;
            const pt = e && e.touches && e.touches[0] ? e.touches[0] : e;
            this._itemPressOrigin = pt && typeof pt.clientX === 'number' ? { x: pt.clientX, y: pt.clientY } : null;
            if (this._itemPressTimer) clearTimeout(this._itemPressTimer);
            if (!itemKey) return;
            this._itemPressTimer = setTimeout(() => {
                this._itemPressTimer = null;
                this._longPressed = true;
                const item = gameRuntime.getItem(itemKey);
                if (item) {
                    this.showCloseup(
                        item.inspectImage || item.image || '',
                        item.inspectText || item.desc || '没有发现更多线索。',
                        null,
                        item.name || '道具',
                        '长按查看介绍 · 点下方返回。'
                    );
                }
            }, 450);
        },
        moveItemPress(ev) {
            if (!this._itemPressTimer) return;
            const pt = ev && ev.touches && ev.touches[0];
            if (!pt) return;
            if (!this._itemPressOrigin) { this._itemPressOrigin = { x: pt.clientX, y: pt.clientY }; return; }
            const dx = pt.clientX - this._itemPressOrigin.x;
            const dy = pt.clientY - this._itemPressOrigin.y;
            if (dx * dx + dy * dy > 100) this.endItemPress();
        },
        endItemPress() {
            if (this._itemPressTimer) { clearTimeout(this._itemPressTimer); this._itemPressTimer = null; }
        },
        selectInventoryItem(index) {
            if (this._longPressed) { this._longPressed = false; return; }
            const itemKey = this.inventory[index];
            this.selectInventoryKey(itemKey);
        },
        selectInventoryKey(itemKey) {
            if (this._longPressed) { this._longPressed = false; return; }
            if (!itemKey) {
                this.selectedItem = null;
                return;
            }
            const item = gameRuntime.getItem(itemKey) || { name: '未知物品', desc: '无法识别此物品。' };
            this.selectedItem = { ...item, key: itemKey };
            if (this.sceneExploreVisible) {
                this.inventoryVisible = false;
                this.showToast(`已选中：${this.selectedItem.name}`);
            }
        },
        inspectSelectedItem() {
            if (!this.selectedItem) return;
            const title = this.selectedItem.inspectTitle || this.selectedItem.name || '道具详情';
            const text = this.selectedItem.inspectText || this.selectedItem.desc || '没有发现更多线索。';
            const image = this.selectedItem.inspectImage || this.selectedItem.image || '';
            this.inventoryVisible = false;
            this.showCloseup(image, text, null, title, '细看道具，可能会发现下一步用法。');
        },
        canCombineSelectedItem() {
            return Boolean(this.selectedItem && gameRuntime.findRecipe(this.selectedItem.key));
        },
        combineSelectedItem() {
            if (!this.selectedItem) return;
            const result = gameRuntime.combineItem(this.inventory, this.selectedItem.key);
            this.showToast(result.message);
            if (!result.success) return;
            this.inventory = result.inventory;
            if (result.flags && Object.keys(result.flags).length) this.flags = { ...this.flags, ...result.flags };
            this.selectedItem = null;
            if (this.persistRun) this.persistRun({ submit: true });
        },
        // 探索界面内就地合成(顶部"合成"按钮调用), 合成后刷新热点, 免去退出开背包
        craftInExplore(baseKey) {
            const result = gameRuntime.combineItem(this.inventory, baseKey);
            this.showToast(result.message);
            if (!result.success) return;
            this.inventory = result.inventory;
            if (result.flags && Object.keys(result.flags).length) this.flags = { ...this.flags, ...result.flags };
            this.selectedItem = null;
            if (this.refreshExploreHotspots) this.refreshExploreHotspots();
            if (this.persistRun) this.persistRun({ submit: true });
        },
        getItemName(itemKey) {
            return gameRuntime.getItem(itemKey)?.name || '未知物品';
        },
        getItemImage(itemKey) {
            const item = gameRuntime.getItem(itemKey);
            return item ? item.image : null;
        },
    }
};
