import { KEYS, readRaw, writeRaw } from '../storage.js?v=20261010-pwa';

const PLAYER_ID_KEY = KEYS.playerId;

function createId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeItemKey(item) {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id || item.code || '';
}

function normalizeInventory(inventory = []) {
    const seen = new Set();
    const result = [];
    for (const item of inventory) {
        const key = normalizeItemKey(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        result.push(key);
    }
    return result;
}

function createGameRuntime({ nodes, items }) {
    return {
        getPlayerId() {
            let id = readRaw(PLAYER_ID_KEY);
            if (!id) {
                id = createId('player');
                writeRaw(PLAYER_ID_KEY, id);
            }
            return id;
        },

        getNode(nodeId) {
            return nodes[nodeId] || null;
        },

        normalizeItemKey,

        normalizeInventory,

        hasItem(inventory, itemKey) {
            if (!itemKey) return true;
            return normalizeInventory(inventory).includes(itemKey);
        },

        hasFlag(flags, flagKey) {
            if (!flagKey) return true;
            return Boolean(flags && flags[flagKey]);
        },

        hasAllFlags(flags, list) {
            return (list || []).every((f) => this.hasFlag(flags, f));
        },

        // 判定选项(requireFlags + elseNext): 总是可点, 由 resolveChoiceTarget 决定去向
        canUseChoice(choice, state) {
            if (!choice) return false;
            if (choice.requireItem && !this.hasItem(state.inventory, choice.requireItem)) return false;
            if (choice.requireFlag && !this.hasFlag(state.flags, choice.requireFlag)) return false;
            if (choice.requireFlags && !choice.elseNext && !this.hasAllFlags(state.flags, choice.requireFlags)) return false;
            const st = state && state.stats;
            if (st) {
                // 数值门控: 理智不足 / 恐惧过高时, 某些"冷静"选项不可用
                if (choice.requireSanityMin !== undefined && st.sanity < choice.requireSanityMin) return false;
                if (choice.requireFearMax !== undefined && st.fear > choice.requireFearMax) return false;
            }
            return true;
        },

        resolveChoiceTarget(choice, state) {
            if (choice.elseNext && !this.hasAllFlags(state.flags, choice.requireFlags)) return choice.elseNext;
            return choice.next;
        },

        getVisibleChoices(node, state) {
            // 条件不满足的选项: 配了 lockedText / showLocked 的保留为灰色锁定项(提示玩家这里还有路), 其余照旧隐藏
            const out = [];
            for (const choice of (node?.choices || [])) {
                if (!choice) continue;
                if (this.canUseChoice(choice, state)) out.push(choice);
                else if (choice.lockedText || choice.showLocked) out.push({ ...choice, locked: true });
            }
            return out;
        },

        addItem(inventory, item) {
            const key = normalizeItemKey(item);
            if (!key) return normalizeInventory(inventory);
            const next = normalizeInventory(inventory);
            if (!next.includes(key)) next.push(key);
            return next;
        },

        removeItem(inventory, item) {
            const key = normalizeItemKey(item);
            if (!key) return normalizeInventory(inventory);
            return normalizeInventory(inventory).filter((entry) => entry !== key);
        },

        getItem(item) {
            const key = normalizeItemKey(item);
            return items[key] || null;
        },

        // 配方查找: 选中的道具是配方主料或辅料都算(组合不分先后)
        findRecipe(item) {
            const key = normalizeItemKey(item);
            if (!key) return null;
            if (items[key]?.combine) return { base: key, recipe: items[key].combine };
            for (const k of Object.keys(items)) {
                const r = items[k]?.combine;
                if (r && (r.with || []).includes(key)) return { base: k, recipe: r };
            }
            return null;
        },

        combineItem(inventory, item) {
            const found = this.findRecipe(item);
            if (!found) {
                return { success: false, message: '这件东西暂时不能和其他道具组合。' };
            }
            const key = found.base;
            const recipe = found.recipe;

            const required = [key, ...(recipe.with || [])];
            const next = normalizeInventory(inventory);
            const missing = required.find((itemKey) => !next.includes(itemKey));
            if (missing) {
                const missingItem = this.getItem(missing);
                return { success: false, message: `还缺少：${missingItem?.name || missing}` };
            }

            // 两样原料都消耗; 产物与某个原料同名时该原料保留(碎片拼进遗照)
            let combined = next.filter((itemKey) => !required.includes(itemKey) || itemKey === recipe.result);
            combined = this.addItem(combined, recipe.result);

            const resultItem = this.getItem(recipe.result);
            return {
                success: true,
                inventory: combined,
                result: recipe.result,
                flags: { ...(recipe.setFlags || {}) },
                message: recipe.message || `组合获得：${resultItem?.name || recipe.result}`
            };
        },

        // 手动合成提示: 若需要的道具没有, 但背包里凑齐了某配方的全部材料,
        // 返回一句提示玩家"去背包合成"的话; 否则返回 null(让调用方走默认的"还缺东西"提示)。
        combineHintFor(inventory, targetKey) {
            if (!targetKey || this.hasItem(inventory, targetKey)) return null;
            for (const key of Object.keys(items)) {
                const recipe = items[key]?.combine;
                if (!recipe || recipe.result !== targetKey) continue;
                const need = [key, ...(recipe.with || [])];
                if (need.every((k) => this.hasItem(inventory, k))) {
                    const names = need.map((k) => items[k]?.name || k).join(' + ');
                    const result = items[targetKey]?.name || targetKey;
                    return `打开背包，把 ${names} 合成「${result}」，再来用在这里。`;
                }
            }
            return null;
        },

        applyNodeEffects(node, state) {
            const flags = { ...(state.flags || {}) };
            let inventory = normalizeInventory(state.inventory);

            if (node?.consumeItem) {
                inventory = this.removeItem(inventory, node.consumeItem);
            }
            if (node?.item) {
                inventory = this.addItem(inventory, node.item);
            }
            if (node?.setFlags) {
                Object.assign(flags, node.setFlags);
            }

            return { flags, inventory };
        },

        createSaveSnapshot(state) {
            return {
                nodeId: state.currentNodeId,
                choicePath: [...(state.choicePath || [])],
                inventory: normalizeInventory(state.inventory),
                flags: { ...(state.flags || {}) },
                playerStats: { ...(state.playerStats || {}) },
                bgImage: state.bgImageUrl || '',
                chapter: state.currentNode?.chapter || '未知',
                savedAt: new Date().toLocaleString('zh-CN')
            };
        }
    };
}

export { createGameRuntime };
