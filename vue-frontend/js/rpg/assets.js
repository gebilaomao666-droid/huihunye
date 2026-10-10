const CHAPTER_BACKGROUNDS = {
    '第一章：末班车与夜路': 'img/bg/ch01_bus.jpg',
    '第二章：三条死规矩': 'img/bg/ch02_living_room.jpg',
    '第三章：熄灭的灯与厨房': 'img/bg/ch03_kitchen.jpg',
    '第四章：纸人围灵': 'img/bg/ch02_living_room.jpg',
    '第五章：出棺': 'img/bg/ch02_living_room.jpg',
    '第六章：地下的喜房': 'img/bg/ch04_basement.jpg',
    '第七章：纸人村': 'img/bg/ch06_village_street.jpg',
    '第八章：冥婚大典': 'img/bg/ch05_shrine.jpg',
    '第九章：真相': 'img/bg/ch02_living_room.jpg',
    '第十章：回魂': 'img/bg/ch10_ritual.jpg',
    '二周目：第一个新郎': 'img/ending/ending_g_keeper.webp'
};

const SCENE_NAMES = {
    '第一章：末班车与夜路': '村路',
    '第二章：三条死规矩': '老宅堂屋',
    '第三章：熄灭的灯与厨房': '厨房',
    '第四章：纸人围灵': '堂屋',
    '第五章：出棺': '堂屋',
    '第六章：地下的喜房': '地下',
    '第七章：纸人村': '纸人村',
    '第八章：冥婚大典': '祠堂',
    '第九章：真相': '堂屋',
    '第十章：回魂': '回魂坛',
    '二周目：第一个新郎': '纸扎铺'
};

const CHAPTER_OBJECTIVES = [
    { match: ['末班车', '夜路'], text: '自己判断在哪儿下车' },
    { match: ['三条死规矩'], text: '记住规矩，守住长明灯' },
    { match: ['厨房'], text: '找到能点着的火' },
    { match: ['纸人围灵'], text: '数眼睛，别数纸人' },
    { match: ['出棺'], text: '别回头，守住这一夜' },
    { match: ['地下的喜房'], text: '找到被这家人藏起来的名字' },
    { match: ['纸人村'], text: '分清活人和纸人' },
    { match: ['冥婚'], text: '别让这场婚礼办成' },
    { match: ['真相'], text: '听她说完' },
    { match: ['回魂'], text: '把她的名字还给她' },
    { match: ['第一个新郎'], text: '看她一眼' }
];

// 界面实物素材(ui3: 暗红漆木 + 旧铜令牌 + 暗漆名牌 + 黄裱纸), 由 css/hhy.css 按界面打开时取用
const UI_ASSETS = {
    board: 'img/ui2/board.webp',
    boardMid: 'img/ui2/board_mid.webp',
    plaque: 'img/ui2/plaque.webp',
    tokA: 'img/ui2/tok_a.webp',
    tokB: 'img/ui2/tok_b.webp',
    tokC: 'img/ui2/tok_c.webp',
    tokD: 'img/ui2/tok_d.webp',
    tokTasselA: 'img/ui2/tokt_a.webp',
    tokTasselB: 'img/ui2/tokt_b.webp',
    sheet: 'img/ui2/sheet.webp',
    banner: 'img/ui2/banner.webp',
    slot: 'img/ui2/slot.webp',
    paperTile: 'img/ui2/paper_tile.webp'
};

// 立绘 → 对白板上的角色名牌
const CHARACTER_NAMES = {
    it_shadow: '它',
    bride_paper: '纸新娘',
    mother: '娘',
    grandpa_normal: '爷爷',
    grandpa_ghost: '爷爷',
    mirror_player: '另一个你',
    driver: '司机'
};

const OPTIONAL_ART_ASSETS = [
    'img/bg/ch01_bus.jpg',
    'img/closeup/closeup_phone_message.jpg',
    'img/closeup/closeup_bus_window_reflection.jpg',
    'img/closeup/closeup_bus_window_face.jpg',
    'img/closeup/closeup_rearview_mirror.jpg',
    'img/closeup/closeup_driver_hands.jpg',
    'img/bg/ch01_village_gate_burning_paper.jpg',
    'img/closeup/closeup_dead_frogs_ash.jpg',
    'img/closeup/closeup_wet_footprints.jpg',
    'img/item/item_note.jpg',
    'img/item/item_match.jpg',
    'img/item/item_red_string.jpg',
    'img/item/item_key.jpg',
    'img/item/item_peach_talisman.jpg'
];

function sceneNameForChapter(chapter = '') {
    return SCENE_NAMES[chapter] || chapter || '';
}

function objectiveForNode(node, state = {}) {
    if (state.selectedItem) return `使用：${state.selectedItem.name}`;
    if (state.sceneExploreVisible) return '搜查场景里的异常物件';
    if (node?.puzzle) return '解开眼前的机关';
    if (node?.exploreScene) return '进入场景调查';

    const chapter = node?.chapter || '';
    const entry = CHAPTER_OBJECTIVES.find((item) => item.match.some((word) => chapter.includes(word)));
    return entry?.text || '继续调查';
}

function speakerForCharacter(url = '') {
    const key = String(url).split('/').pop().replace(/\.[a-z0-9]+$/i, '');
    return CHARACTER_NAMES[key] || '';
}

function preloadImageList() {
    return [
        'img/death/death_12_wedding.jpg',
        'img/death/death_01_lost_paper_people.jpg',
        'img/death/death_09_possess.jpg',
        'img/bg/under_bed.jpg',
        'img/bg/ch02_hall_explore_v2.jpg',
        'img/closeup/closeup_blood_note.jpg',
        'img/closeup/closeup_spirit_lamp_dim.jpg',
        'img/closeup/closeup_altar_ash_red_string.jpg',
        'img/closeup/closeup_coffin_sealed_name_tag.jpg',
        ...Object.values(CHAPTER_BACKGROUNDS),
        ...Object.values(UI_ASSETS)
    ];
}

export {
    CHAPTER_BACKGROUNDS,
    OPTIONAL_ART_ASSETS,
    UI_ASSETS,
    sceneNameForChapter,
    speakerForCharacter,
    objectiveForNode,
    preloadImageList
};
