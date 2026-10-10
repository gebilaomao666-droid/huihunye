function hotspotId(hotspot, index) {
    return hotspot.id || `hotspot_${index}`;
}

function hotspotDoneKey(sceneId, hotspot, index) {
    return `scene:${sceneId || 'unknown'}:${hotspotId(hotspot, index)}:done`;
}

function hasItem(inventory = [], itemKey) {
    if (!itemKey) return true;
    return inventory.includes(itemKey);
}

function isHotspotVisible(hotspot, state, index) {
    const flags = state.flags || {};
    if (hotspot.hiddenWhenFlag && flags[hotspot.hiddenWhenFlag]) return false;
    if (hotspot.hiddenWhenFlags && hotspot.hiddenWhenFlags.some((flag) => flags[flag])) return false;
    if (hotspot.visibleWhenFlag && !flags[hotspot.visibleWhenFlag]) return false;
    if (hotspot.visibleWhenFlags && hotspot.visibleWhenFlags.some((flag) => !flags[flag])) return false;
    if (hotspot.once && flags[hotspotDoneKey(state.sceneId, hotspot, index)]) return false;
    return true;
}

function getVisibleHotspots(hotspots = [], state = {}) {
    return hotspots
        .map((hotspot, index) => ({ ...hotspot, _index: index, _id: hotspotId(hotspot, index) }))
        .filter((hotspot) => isHotspotVisible(hotspot, state, hotspot._index));
}

function resolveHotspot(hotspot, state = {}) {
    const inventory = state.inventory || [];
    const flags = state.flags || {};

    // 条件不满足: 有 lockedNext(未满足跳转)的直接跳走, 否则只提示
    // 去解密友好: 背包里有该道具即可用, 不强制"先从背包选中"
    const flagMissing = hotspot.requireFlag && !flags[hotspot.requireFlag];
    const itemMissing = hotspot.requireItem && !hasItem(inventory, hotspot.requireItem);
    if (flagMissing || itemMissing) {
        return {
            blocked: true,
            lockedNext: hotspot.lockedNext || null,
            message: hotspot.lockedText || (itemMissing ? '还缺少能用在这里的东西。' : '这里还缺少某个前置条件。')
        };
    }

    const nextFlags = {};
    if (hotspot.setFlags) Object.assign(nextFlags, hotspot.setFlags);
    if (hotspot.once) nextFlags[hotspotDoneKey(state.sceneId, hotspot, hotspot._index || 0)] = true;

    return {
        blocked: false,
        addItem: hotspot.item || null,
        consumeItem: hotspot.consumeItem || null,
        flags: nextFlags,
        toast: hotspot.toast || null
    };
}

export { getVisibleHotspots, resolveHotspot };
