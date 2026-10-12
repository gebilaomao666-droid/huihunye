// ===== 回魂夜 · 剧情节点数据 =====
// 本文件由 tools/build_nodes.mjs 从 docs/剧情定稿/*.md 生成, 不要手改; 改剧情请改 md 后重新生成:
//   node tools/build_nodes.mjs
// 110 个节点 | 23 种死法 | 10 个结局节点 | 10 个谜题

const EPITAPHS = [
    "最后一排的温座",
    "灰色的小圈",
    "刻歪的那一笔",
    "没点睛的纸人",
    "倒头饭的余火",
    "写了又抹的名字",
    "眼角那颗痣",
    "鞋尖朝里的布鞋",
    "梁下那双脚",
    "七十年没人叫的名字",
    "第五个指印",
    "没说出口的“到”"
];

const NODES = {
    "node01": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "末班车",
        "time": "23:30",
        "text": "末班车上只有你一个乘客。\n\n座位全空着，只有最后一排的坐垫是凹的。你坐下去。还是温的，像有人刚起身。\n\n手机停在母亲那条短信上：“爷爷走了，今晚务必回村。”九个字。三年来，那个家只给过你这九个字。\n\n村里人管那地方叫纸人村。家家会扎纸，爷爷扎得最好。他的纸人和真人一般高，眉眼齐全，只是从不点眼珠。\n\n小时候你最爱数他的手指，一遍遍数，总少一根。他左手只有四根指头，那道旧疤平得发亮。你问那根去了哪儿，他从不说，只是把你的小手整个攥进他冰凉粗糙的掌心里，攥得你指头发疼，压着嗓子说：“娃，长大别回这村。回来了，就走不脱了。”你那时只当是哄小孩的胡话，笑着挣开了他的手。\n\n你想给母亲回个电话。通讯录里，她的名字后面有个灰色的小圈。你不记得是什么时候加上的。拨出去，屏幕亮着，没有声音。\n\n车里没有报站。窗外没有灯。\n\n你抬起头。车厢里什么都太安静了，安静得像爷爷糊的那些纸人，正排成一排，听你来。",
        "bgImage": "img/bg/ch01_bus.jpg?v=74336def",
        "sceneImage": "img/bg/ch01_bus.jpg?v=74336def",
        "vibration": null,
        "signal": 4,
        "battery": 80,
        "fx": "flicker",
        "hideCharacter": true,
        "choices": [
            {
                "text": "压低身子，先看看这节车厢",
                "next": "node01_explore"
            }
        ]
    },

    "node01_explore": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "末班车车厢",
        "time": "23:41",
        "text": "你没有立刻抬头。\n\n手机的冷光贴着掌心，慢慢扫过车厢。扶手上有干掉的泥点。车窗外一片黑。\n\n前头的后视镜偶尔晃一下，像有人在镜子里眨眼。\n\n车不报站。你得自己知道在哪儿下。",
        "bgImage": "img/bg/ch01_bus.jpg?v=74336def",
        "sceneImage": "img/bg/ch01_bus.jpg?v=74336def",
        "sceneTitle": "末班车车厢",
        "sceneId": "late_bus_interior",
        "vibration": [
            20,
            40,
            20
        ],
        "signal": 4,
        "battery": 79,
        "fx": "flicker",
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node01",
        "closeText": "缩回座位",
        "sceneHint": "车不报站。看清车厢里的东西，自己判断在哪儿下车。",
        "hotspots": [
            {
                "id": "phone_message",
                "label": "手机冷光",
                "x": 58,
                "y": 84,
                "w": 10,
                "h": 10,
                "once": true,
                "closeup": true,
                "closeupTitle": "母亲的短信",
                "closeupText": "短信只有一句：“爷爷走了，今晚务必回村。”\n\n下面多了一条未发送的草稿，收件人是你自己：“别坐最后一排。”\n\n你没写过这条。",
                "closeupImage": "img/closeup/closeup_phone_message.jpg?v=20a7d869"
            },
            {
                "id": "seat_carving",
                "label": "椅背刻字",
                "x": 24,
                "y": 52,
                "w": 18,
                "h": 14,
                "once": true,
                "setFlags": {
                    "seat_carving_seen": true
                },
                "closeup": true,
                "closeupTitle": "指甲刻的字",
                "closeupText": "前排椅背上有一行字，是用指甲刻的。刻得很深，笔画里塞满黑泥。\n\n“见槐即下。过槐不归。”\n\n字迹很老。最后一笔拖得很长，像刻字的人被谁从座位上拽走了。",
                "closeupImage": "img/closeup/closeup_seat_carving.jpg?v=0140da74"
            },
            {
                "id": "bus_window",
                "label": "车窗反光",
                "x": 1,
                "y": 22,
                "w": 14,
                "h": 38,
                "once": true,
                "setFlags": {
                    "bus_window_seen": true
                },
                "closeup": true,
                "closeupTitle": "车窗外的头发",
                "closeupText": "车外没有路灯。玻璃却把车顶照得很清楚。\n\n一团湿黑的东西趴在车顶边上，长头发一缕一缕垂下来。你眨一下眼，头发离窗边又近了一点。\n\n玻璃里还映着车前方的路。比你从窗口直接看出去的，远得多。",
                "closeupImage": "img/closeup/closeup_bus_window_reflection.jpg?v=44862222"
            },
            {
                "id": "rearview_mirror",
                "label": "后视镜",
                "x": 46,
                "y": 24,
                "w": 10,
                "h": 8,
                "once": true,
                "setFlags": {
                    "bus_mirror_seen": true
                },
                "closeup": true,
                "closeupTitle": "后视镜",
                "closeupText": "司机没有回头。\n\n后视镜里，他的脖子歪向一边，歪得很平静，像睡落了枕。\n\n仪表盘上的时间停在 23:59。",
                "closeupImage": "img/closeup/closeup_rearview_mirror.jpg?v=470ad28a"
            },
            {
                "id": "driver_hands",
                "label": "司机的手",
                "x": 41,
                "y": 41,
                "w": 8,
                "h": 10,
                "once": true,
                "visibleWhenFlags": [
                    "bus_mirror_seen"
                ],
                "closeup": true,
                "closeupTitle": "司机的手",
                "closeupText": "那双手搭在方向盘上。白，僵，指甲缝里塞满黑泥。\n\n你数了两遍。左手只有四根手指。\n\n那只手在方向盘上轻轻敲了一下。像在等什么。",
                "closeupImage": "img/closeup/closeup_driver_hands.jpg?v=b5b3b14a"
            },
            {
                "id": "bus_bell",
                "label": "下车铃",
                "x": 70,
                "y": 24,
                "w": 6,
                "h": 10,
                "visibleWhenFlags": [
                    "bus_window_seen",
                    "seat_carving_seen"
                ],
                "puzzle": "pz_bus_bell",
                "closeup": true,
                "closeupTitle": "下车铃",
                "closeupText": "车门边有一只老式的下车铃，红漆掉得斑斑驳驳。\n\n你的手指搭上去。还不知道该什么时候按。"
            }
        ]
    },

    "node_dead_wild": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "荒野",
        "time": "00:10",
        "text": "槐树从玻璃里滑过去了。\n\n车没有停。路越来越窄，两边的庄稼换成了齐腰的野草。草尖上挂着黄裱纸，一串一串，像晾着的衣裳。\n\n车停在荒地中央。前门开了。\n\n门外站着一排纸人，提着红灯笼。灯笼上贴着“囍”字，一盏挨一盏，亮到看不见的地方。打头的那个没有眼珠，脸冲着车门，弯下腰。\n\n“新郎官，”它说，“下轿了。”\n\n你没动。司机那四根手指在方向盘上攥紧了，攥得发白。\n\n纸人不急。它们一个接一个上了车，把你从最后一排抬起来，抬得很稳，像抬一顶轿子。\n\n车开走的时候，最后一排的坐垫又凹了下去。还是温的。",
        "bgImage": "img/bg/ch01_bus.jpg?v=74336def",
        "deathCG": "img/death/death_06_bus.jpg?v=db1a0194",
        "fx": "flicker",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "纸人迎亲",
        "deathDesc": "见槐即下，过槐不归。椅背上那行字，是上一个没下车的人留的。"
    },

    "node04": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "村口槐树",
        "time": "00:15",
        "text": "车门在你身后合上。车没有开走，停在那儿亮着灯，像在看你。\n\n村路没有灯。远处几声狗叫，叫到一半就停了。\n\n村口的大槐树下，有个人背对着你蹲着，在烧纸。\n\n树杈上横着一根竹竿，竿上挂着两盏灯笼。一盏白，一盏红。\n\n白事门口挂红灯，是给死人娶亲。\n\n火堆里烧的不是纸钱，是剪好的红双喜。一个“囍”字卷起来，烧着烧着裂成两半，两个“喜”字分开，各自飘走了。",
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "sceneImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "vibration": null,
        "signal": 2,
        "battery": 65,
        "hideCharacter": true,
        "choices": [
            {
                "text": "绕开他，低头快步走",
                "next": "node05"
            },
            {
                "text": "停下来问路",
                "next": "node_dead1"
            }
        ]
    },

    "node_dead1": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "村路野草",
        "time": "00:16",
        "text": "转过来的那张脸，没有眉眼，没有鼻子，是一张被水泡平过的白纸。\n\n你的手机在口袋里疯了一样震。\n\n伸过来的不是手。是纸。干的，糙的，像砂纸贴着皮肤往里裹。纸边一道道划开你的脖子和手背，划出细口子，却一滴血都不见。\n\n它们把你往路边的野草里拖，越拖越深。到处是潮湿的纸浆味，混着沤烂的稻草气。\n\n草丛里密密麻麻立着纸人。这一村的纸人什么都不缺，单单缺一个会喘气的。它们一层一层往你身上糊，糊住你的腿，你的胸口，最后糊上你的脸。\n\n天快亮的时候，村口槐树下又多了一个蹲着的纸人。没有五官，白白一张脸冲着公路。\n\n下一班末班车经过时，它会慢慢抬起头，望着车窗里那个刚回村的人。",
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "vibration": [
            200,
            400,
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_01_lost_paper_people.jpg?v=f7d4f824",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "迷失",
        "deathDesc": "烧纸的晚上，别跟没有脸的东西搭话，也别出声。"
    },

    "node05": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "村口夜路",
        "time": "00:22",
        "text": "你低着头走。脚下一软。\n\n是青蛙。死的，一地都是，肚皮朝天，像被人从井里一捧一捧倒出来的。\n\n风把那堆火的灰吹过来，落在你肩上。\n\n灰是温的。",
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "sceneImage": "img/bg/ch01_dead_frogs.jpg?v=48e1c360",
        "vibration": [
            40,
            80,
            40
        ],
        "signal": 2,
        "battery": 60,
        "hideCharacter": true,
        "choices": [
            {
                "text": "踩着青蛙往老宅走",
                "next": "node05b"
            }
        ]
    },

    "node05b": {
        "chapter": "第一章：末班车与夜路",
        "sceneName": "老宅门口",
        "time": "00:25",
        "text": "老宅的门虚掩着。门槛上摆着一双男式布鞋，黑面白底，鞋尖朝里。\n\n你看了一眼自己的脚。是你的尺码。",
        "sceneImage": "img/closeup/shoes_inward.webp?v=5278d574",
        "vibration": [
            80,
            150,
            80,
            150,
            80
        ],
        "signal": 2,
        "battery": 58,
        "hideCharacter": true,
        "choices": [
            {
                "text": "跨过那双布鞋，进门",
                "next": "node06"
            }
        ]
    },

    "node06": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "老宅堂屋",
        "time": "00:45",
        "text": "你把门闩压下去。门外那串脚步声也停了，像有人把耳朵贴在门板上。\n\n堂屋正中停着黑漆棺，棺前长明灯绿得发青。供桌角压着一张黄裱纸，纸边被香灰糊住，只露出\"规矩\"两个字。\n\n你忽然意识到，这屋里所有东西都摆得太整齐了，像是在等你按顺序把守灵的局布好。",
        "vibration": null,
        "signal": 1,
        "battery": 55,
        "hideCharacter": true,
        "choices": [
            {
                "text": "进堂屋，一样一样看清楚",
                "next": "node06_explore"
            },
            {
                "text": "先看看棺材里是不是爷爷",
                "next": "node_dead3_v2"
            }
        ]
    },

    "node06_explore": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "老宅堂屋",
        "time": "00:46",
        "text": "你没有急着碰棺材。\n\n供桌上的香灰堆成细小的坟包，抽屉缝里露出一角发黑的瓷瓶。长明灯的火苗很小，却把棺材的影子拉得很长，像有个人正贴着地面慢慢站起来。\n\n你压着呼吸，先按规矩把堂屋布好：灯要稳，水要遮，棺要封，名字不能应。",
        "bgImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "sceneImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "sceneTitle": "老宅堂屋",
        "sceneId": "old_house_hall",
        "vibration": [
            20,
            40,
            20
        ],
        "signal": 1,
        "battery": 54,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node06",
        "closeText": "退回堂屋",
        "sceneHint": "先读黄纸，再找能稳灯、遮水、封棺的东西。背包里选中道具，可以直接点场景里的物件。",
        "hotspots": [
            {
                "id": "paper_note",
                "label": "黄裱纸",
                "x": 24,
                "y": 62,
                "w": 18,
                "h": 8,
                "once": true,
                "item": "note",
                "toast": "你把纸条折好，收进贴身的口袋。",
                "closeup": true,
                "closeupTitle": "黄裱纸条",
                "closeupText": "纸上是母亲的字。\n\n第一条，长明灯不能灭。第二条被香灰盖住半句，只剩“喊你……不能……”。第三条，别往水里看。\n\n背面也是母亲的字，比正面写得急：别回头。\n\n再往下一行是血写的，糊成一片。字是用指头抹的，抹字的手只有四根指头：别信写纸的人。",
                "closeupImage": "img/closeup/closeup_blood_note.jpg?v=df4c1d60"
            },
            {
                "id": "drawer_lamp_oil",
                "label": "抽屉",
                "x": 3,
                "y": 45,
                "w": 17,
                "h": 17,
                "once": true,
                "item": "lamp_oil",
                "closeup": true,
                "closeupTitle": "半盏灯油",
                "closeupText": "抽屉里放着半盏灯油，油面浮着一根黑发。\n\n你晃了一下。黑发慢慢沉下去，像被什么含住了。",
                "closeupImage": "img/item/item_incense.jpg?v=cf9be791"
            },
            {
                "id": "spirit_lamp",
                "label": "长明灯",
                "x": 64,
                "y": 36,
                "w": 12,
                "h": 13,
                "once": true,
                "requireItem": "lamp_oil",
                "lockedText": "长明灯的火苗一跳一跳。得先从背包里选中灯油续上。",
                "consumeItem": "lamp_oil",
                "setFlags": {
                    "lamp_relit": true
                },
                "toast": "灯油倒进去，火苗直了。",
                "closeup": true,
                "closeupTitle": "长明灯",
                "closeupText": "灯油倒进去，火苗忽地直了。\n\n供桌后的牌位齐齐响了一声，像有人同时咬紧了牙。",
                "closeupImage": "img/closeup/closeup_spirit_lamp_dim.jpg?v=16ebe7b5"
            },
            {
                "id": "altar_ash",
                "label": "香炉",
                "x": 43,
                "y": 36,
                "w": 15,
                "h": 11,
                "once": true,
                "visibleWhenFlags": [
                    "lamp_relit"
                ],
                "item": "red_string",
                "toast": "你从香灰底下拈出一截红绳。",
                "closeup": true,
                "closeupTitle": "香灰里的红绳",
                "closeupText": "香炉里插着三炷旧香，两短一长。\n\n爷爷在世时最忌讳这个，见了就要拔掉重插。他说，两短一长，是给死人点的。\n\n香灰底下压着一截红绳，被灰浸得发黑，绳结上缠着一点黄纸屑。不像装饰，像封口用的。",
                "closeupImage": "img/closeup/closeup_altar_ash_red_string.jpg?v=10e2f32b"
            },
            {
                "id": "yellow_paper_stack",
                "label": "供桌底下的黄纸",
                "x": 22,
                "y": 74,
                "w": 20,
                "h": 10,
                "visibleWhenFlags": [
                    "lamp_relit"
                ],
                "item": "yellow_paper",
                "toast": "你抽了一张黄裱纸。",
                "closeup": true,
                "closeupTitle": "一叠黄裱纸",
                "closeupText": "灯亮了，你才看见供桌底下压着一叠黄裱纸，裁得方方正正。\n\n是爷爷裁的。他裁纸从不用尺子。",
                "closeupImage": "img/item/yellow_paper.webp?v=9a220197"
            },
            {
                "id": "water_bowl_cover",
                "label": "供桌水碗",
                "x": 57,
                "y": 62,
                "w": 18,
                "h": 9,
                "once": true,
                "visibleWhenFlags": [
                    "lamp_relit"
                ],
                "hiddenWhenFlags": [
                    "water_covered"
                ],
                "requireItem": "yellow_paper",
                "lockedText": "水面没有映出你的脸，只映出棺材后面站着的一双脚。得找张黄纸把它盖住。",
                "consumeItem": "yellow_paper",
                "setFlags": {
                    "water_covered": true
                },
                "toast": "你把黄纸压在水碗上。碗底轻轻叩了一声。",
                "closeup": true,
                "closeupTitle": "被遮住的水碗",
                "closeupText": "黄纸盖住水面。纸背慢慢洇出一个湿手印。\n\n手印只有四根手指。它按在碗底，按得很稳，像在替你压住水里的什么。",
                "closeupImage": "img/closeup/water_bowl_handprint.webp?v=09fb301c"
            },
            {
                "id": "black_coffin_danger",
                "label": "黑漆棺",
                "x": 36,
                "y": 49,
                "w": 34,
                "h": 14,
                "hiddenWhenFlags": [
                    "lamp_relit"
                ],
                "deathNode": "node_dead3_v2"
            },
            {
                "id": "black_coffin_wait",
                "label": "黑漆棺",
                "x": 36,
                "y": 49,
                "w": 34,
                "h": 14,
                "visibleWhenFlags": [
                    "lamp_relit"
                ],
                "hiddenWhenFlags": [
                    "water_covered"
                ],
                "closeup": true,
                "closeupTitle": "还不能封的棺",
                "closeupText": "棺缝里一阵一阵往外吐冷气。你刚靠近，供桌水碗里的倒影先动了一下。\n\n空手去碰，只会让里面的东西记住你的手温。",
                "closeupImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a"
            },
            {
                "id": "black_coffin_seal",
                "label": "黑漆棺",
                "x": 36,
                "y": 49,
                "w": 34,
                "h": 14,
                "once": true,
                "visibleWhenFlags": [
                    "lamp_relit",
                    "water_covered"
                ],
                "requireItem": "paper_talisman",
                "lockedText": "棺缝里的冷气还在往外渗。空手不能碰。黄纸、红绳，爷爷封棺用的就是这两样。",
                "consumeItem": "paper_talisman",
                "item": "name_tag",
                "setFlags": {
                    "coffin_sealed": true
                },
                "toast": "镇棺符压住棺缝，棺底滑出一块旧孝牌。",
                "closeup": true,
                "closeupTitle": "被压住的黑棺",
                "closeupText": "镇棺符压下去，红绳自己绷紧了。棺里的抓挠声停了。\n\n棺底滑出一块旧孝牌。背面刻着你的全名，最后一个字刮得很深。",
                "closeupImage": "img/closeup/closeup_coffin_sealed_name_tag.jpg?v=fc2a0023"
            },
            {
                "id": "ancestral_tablet",
                "label": "祖先牌位",
                "x": 39,
                "y": 18,
                "w": 19,
                "h": 23,
                "once": true,
                "visibleWhenFlags": [
                    "coffin_sealed"
                ],
                "requireItem": "name_tag",
                "lockedText": "牌位底下空着一格，像在等一块小牌子。",
                "setFlags": {
                    "name_known": true
                },
                "toast": "你把孝牌立在牌位底下。门外若喊这个名字，不能答。",
                "closeup": true,
                "closeupTitle": "刻名旧孝牌",
                "closeupText": "你把孝牌立在祖先牌位底下。\n\n牌位一排排都是爷爷刻的，横平竖直。只有你这块，最后一个字那一笔斜出去一点。\n\n像刻的人手抖了。爷爷的手从来不抖。",
                "closeupImage": "img/closeup/tablet_crooked.webp?v=4a30dacf"
            },
            {
                "id": "locked_door_wait",
                "label": "反锁木门",
                "x": 76,
                "y": 22,
                "w": 21,
                "h": 36,
                "hiddenWhenFlags": [
                    "coffin_sealed"
                ],
                "closeup": true,
                "closeupTitle": "反锁的木门",
                "closeupText": "门闩已经压死了。门缝外没有脚步声，却有一股潮湿的泥土味慢慢钻进来。\n\n棺材还没压住。这时候开门，只会把屋里的东西也放出去。",
                "closeupImage": "img/closeup/closeup_locked_door.jpg?v=c32effa7"
            },
            {
                "id": "hall_ready_exit",
                "label": "坐回蒲团",
                "x": 76,
                "y": 22,
                "w": 21,
                "h": 36,
                "visibleWhenFlags": [
                    "lamp_relit",
                    "water_covered",
                    "coffin_sealed",
                    "name_known"
                ],
                "nextNode": "node08",
                "toast": "灯稳了，水遮了，棺也压住了。你坐回蒲团，等门外的人先开口。"
            }
        ]
    },

    "node_dead3_v2": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "黑漆棺",
        "time": "00:50",
        "text": "棺盖被你掀开一条缝，先涌出来的是冷气，裹着浓得发苦的樟脑，底下还垫着一层潮湿的土腥味。\n\n你借着指缝里那点光往里看。躺着的人是你。一样塌下去的眼袋，一样咬出茧的下唇，连左边眉骨那道小时候磕的疤都在；他肩头还沾着一小片灰。是你上车时蹭在车窗玻璃上的那一处，分毫不差。\n\n你正要松一口气，才发现哪里不对：他身上不是你那件外套，是一件你从没穿过的青灰寿衣，盘扣一直扣到喉结；他的胸口平平的，半天不起伏一下；那双睁着的眼睛干得没有一点反光，像两颗被擦过的玻璃珠。\n\n他冲你笑了。嘴角往上扯的那一刻，你脸上的肌肉也不受控地跟着扯起来，你想咬住，咬不住。你们在做同一个表情。\n\n他伸手攥住你的手腕。那只手比你凉，凉得像从井底捞上来的，指甲缝里塞满黑泥，蹭在你皮肤上，一路往下抹。他攥得很稳，很熟，像已经攥了你一整夜，只等你自己把手递过来。\n\n你被拖进去的时候，后背贴上的褥子还是温的。那是你刚刚腾出来的体温。棺盖从里面落下，暗闩“咔”地合上。\n\n隔着一层木板，盖子外面那个“你”替你吸进了今晚的第一口气，呼出来，长长的，舒服的。这屋子从来不缺活人，缺的，只是一个肯换名字的。",
        "vibration": [
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_double.webp?v=1dd724f0",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "替死",
        "deathDesc": "棺没封，人没到齐。先掀棺的那一个，就是替的那一个。"
    },

    "node08": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "老宅堂屋",
        "time": "01:30",
        "text": "你跪在蒲团上守灵。门外响起三下脚步，重得像拖着一身湿寿衣。脚步停住后，有人用指节轻轻叩门。\n\n你膝前的旧孝牌微微发凉。牌上的字是爷爷亲手刻的。小时候你蹲在他脚边看过，他那只只有四根手指的左手捏着刻刀，一笔一画都不肯含糊，嘴里念叨着：名字刻歪一笔，就不是这个人了。那时你只当是手艺人的讲究，此刻却像一句迟了很多年的叮嘱压在心口：名字，不能应。",
        "vibration": [
            80,
            150,
            80,
            150,
            80
        ],
        "signal": 1,
        "battery": 45,
        "hideCharacter": true,
        "choices": [
            {
                "text": "一动不动地听",
                "next": "node09"
            },
            {
                "text": "爬到门缝边看看外面是谁",
                "next": "node08b"
            },
            {
                "text": "掏出手机看有没有信号",
                "next": "node08c"
            }
        ]
    },

    "node08b": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "门缝",
        "time": "01:31",
        "text": "你爬到门缝边，往外看。\n\n外面站着一双红绣花鞋。鞋面湿透了，鞋尖正对着门缝，并得整整齐齐。\n\n像在等人来开门。\n\n你抬头。门缝外，一只血红的眼睛正回望着你。",
        "vibration": [
            200,
            100,
            200
        ],
        "signal": 1,
        "battery": 43,
        "sceneImage": "img/closeup/door_red_eye_wide.webp?v=468e98ac",
        "hideCharacter": true,
        "setFlags": {
            "saw_bride_shoes": true
        },
        "choices": [
            {
                "text": "捂住嘴，往后退",
                "next": "node09"
            }
        ]
    },

    "node08c": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "手机屏幕",
        "time": "01:31",
        "text": "你掏出手机。屏幕自己亮了，没等你按，画面就跳了出来。\n\n是一段老监控，糊得厉害。左上角歪歪扭扭写着【第三镜头】。\n\n画面里是这间堂屋。梁还是那根梁。\n\n梁下晃着一双脚。\n\n时间卡在二〇〇八年九月廿二，夜里十一点四十六分。秒数再也没往前跳过。",
        "vibration": [
            50,
            100,
            50
        ],
        "signal": 1,
        "battery": 44,
        "camAlert": true,
        "hideCharacter": true,
        "choices": [
            {
                "text": "把手机扣在膝盖上",
                "next": "node09"
            }
        ]
    },

    "node09": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "老宅堂屋",
        "time": "01:33",
        "text": "“开门啊，是我，我是你二伯。”\n\n门外的声音是哑的。它说来给爷爷送寿衣。\n\n然后它喊你的全名。一个字一个字，平得像照着孝牌念。\n\n前两个字一字不差。到第三个字，它卡住了，喉咙里咯了一下，念成了另一个音。\n\n你膝前那块孝牌，最后一个字刮得最深。\n\n第二条规矩终于补全了：喊你全名时，不能答。",
        "vibration": null,
        "signal": 1,
        "battery": 42,
        "hideCharacter": true,
        "choices": [
            {
                "text": "隔着门问：“怎么这么晚才来？”",
                "next": "node_dead2"
            },
            {
                "text": "死死捂住嘴，不出声",
                "next": "node10"
            },
            {
                "text": "假装咳嗽一声",
                "next": "node09b"
            }
        ]
    },

    "node09b": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "门缝",
        "time": "01:34",
        "text": "你咳嗽了一声。\n\n门外静了。\n\n门缝底下慢慢塞进来一张黄纸。朱砂写着一行八字：丙子 丁酉 壬午 庚子。\n\n是你的生辰。\n\n纸背面画着一个没有脸的纸人，胸口写好了你的名字。最后一个字，写得端端正正。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 1,
        "battery": 40,
        "hideCharacter": true,
        "choices": [
            {
                "text": "把纸撕碎",
                "next": "node10"
            }
        ]
    },

    "node_dead2": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "门外",
        "text": "你应了。\n\n门外那个声音停了一下。然后笑了。\n\n笑声很轻，贴着门缝进来，像等了很多年的人，终于等到一句回话。\n\n门闩自己滑开。门外伸进来很多只手，白得发青，指甲缝里全是泥。它们不抓你，只是托着你，一点一点，把你托出门槛。\n\n你最后看见的，是供桌上那三炷香。两短一长。",
        "bgImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "vibration": [
            300,
            200,
            300
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_answer.webp?v=bb618a6a",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "忌讳",
        "deathDesc": "喊你全名时，答的不是话，是命。"
    },

    "node10": {
        "chapter": "第二章：三条死规矩",
        "sceneName": "老宅堂屋",
        "time": "02:15",
        "text": "门外冷笑一声。脚步拖着潮气走远了。\n\n你刚松下一口气，窗缝灌进来一阵风。\n\n长明灯灭了。\n\n黑里，棺材又开始轻轻地响。压住它的红绳一点点绷紧，咯吱，咯吱，像马上就要断。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 35,
        "hideCharacter": true,
        "choices": [
            {
                "text": "摸黑去厨房找火",
                "next": "node11"
            },
            {
                "text": "躲在棺材边，哪儿也不去",
                "next": "node_dead3"
            }
        ]
    },

    "node11": {
        "chapter": "第三章：熄灭的灯与厨房",
        "sceneName": "后院厨房",
        "time": "02:22",
        "text": "你借着手机那点白光，摸进后院的厨房。\n\n先闻到的是馊。米饭放坏了的酸，底下压着一股焦糊。\n\n灶台上供着一碗倒头饭，白米堆得冒尖，竖插一双竹筷。是给爷爷的。\n\n七岁那年，你在这灶膛口烫了手，哭出了声。爷爷一把捂住你的嘴，四根手指捂得你喘不上气。\n\n“憋回去。”他说，“这屋子，不许人疼。”\n\n滴答。\n\n水声是从你头顶来的。",
        "vibration": [
            50,
            100,
            50,
            100,
            50
        ],
        "signal": 0,
        "battery": 30,
        "sceneImage": "img/bg/ch03_kitchen.jpg?v=9b3125aa",
        "bgImage": "img/bg/ch03_kitchen.jpg?v=9b3125aa",
        "hideCharacter": true,
        "exploreScene": true,
        "sceneId": "node11",
        "sceneTitle": "后院厨房",
        "returnNode": "node10",
        "closeText": "退出场景",
        "sceneHint": "找到能点着的火，回堂屋点灯。别掀水缸，别一直抬头。",
        "hotspots": [
            {
                "id": "damp_matches",
                "label": "灶台上的火柴",
                "x": 23,
                "y": 66,
                "w": 9,
                "h": 8,
                "once": true,
                "item": "damp_match",
                "closeup": true,
                "closeupTitle": "受潮的火柴",
                "closeupText": "一盒火柴，纸盒被潮气泡软了。\n\n你刮了一根。火柴头掉下半截，糊在指头上。点不着。",
                "closeupImage": "img/item/item_match.jpg?v=61868ce6"
            },
            {
                "id": "ceiling",
                "label": "天花板",
                "x": 25,
                "y": 0,
                "w": 50,
                "h": 16,
                "closeup": true,
                "closeupTitle": "头顶",
                "closeupText": "你抬头了。\n\n天花板上倒挂着一个人形，穿着爷爷生前最喜欢的那件中山装。脸朝着梁，四肢像蜘蛛一样张开。\n\n水从它嘴角滴下来。一滴，又一滴，都落在同一个地方：灶膛口。\n\n它的脖子咔地响了一声。你低下头，没再看。",
                "closeupImage": "img/char/grandpa_ghost.jpg?v=e4e8619e"
            },
            {
                "id": "stove",
                "label": "灶膛",
                "x": 41,
                "y": 81,
                "w": 14,
                "h": 18,
                "once": true,
                "requireItem": "damp_match",
                "lockedText": "灶膛口积着冷灰。拨开一点，底下好像还红着。你手里没有要烘的东西。",
                "consumeItem": "damp_match",
                "puzzle": "pz_damp_match",
                "closeup": true,
                "closeupTitle": "灶膛",
                "closeupText": "灶膛口积着冷灰。\n\n拨开一点，底下好像还红着。",
                "closeupImage": "img/closeup/hearth_ember.webp?v=d71aef87"
            },
            {
                "id": "water_vat",
                "label": "角落的水缸",
                "x": 67,
                "y": 52,
                "w": 26,
                "h": 40,
                "hiddenWhenFlags": [
                    "vat_seen"
                ],
                "nextNode": "node12"
            },
            {
                "id": "kitchen_exit",
                "label": "回堂屋点灯",
                "x": 2,
                "y": 76,
                "w": 20,
                "h": 20,
                "requireItem": "match",
                "lockedText": "手里没有能点着的火。回去也是摸黑。",
                "nextNode": "node13"
            }
        ]
    },

    "node12": {
        "chapter": "第三章：熄灭的灯与厨房",
        "sceneName": "水缸",
        "time": "02:28",
        "text": "你忘了纸条上的第三条规矩。你借着门缝里漏进来的月光，往水缸看了一眼。水面很静，静得像一块没人敢碰的镜子。\n\n倒影里不是你，是一个泡得发胀的女尸，长发在水里散开，慢慢浮上来贴着水面。她抬起一根白得透青的手指，在水面上一笔一画地写字。写的是你的名字。写完，她用手背轻轻一抹，名字散成涟漪；涟漪刚平，她又从头一笔一画地写起来，写了又抹，抹了又写，像非要把这个名字记到水里去不可。\n\n你这才发觉，她的嘴一直在一张一合，可声音并不是从她那儿来的。声音是从你背后、从盖着的缸盖底下漏上来的，又湿又闷，贴着你的后颈往上爬：“……回……来……了……”\n\n那声音的快慢，和她嘴唇开合的快慢，怎么也对不上。",
        "vibration": [
            150,
            300,
            150
        ],
        "signal": 0,
        "battery": 25,
        "bgImage": "img/bg/ch03_kitchen.jpg?v=9b3125aa",
        "hideCharacter": true,
        "setFlags": {
            "vat_seen": true
        },
        "choices": [
            {
                "text": "捂住手机屏幕，狂奔回堂屋",
                "next": "node13",
                "requireItem": "match"
            },
            {
                "text": "捂住手机屏幕，背过身退回灶台边",
                "next": "node11"
            },
            {
                "text": "问她是谁",
                "next": "node_dead5"
            }
        ]
    },

    "node_dead5": {
        "chapter": "第三章：熄灭的灯与厨房",
        "sceneName": "水缸",
        "time": "02:30",
        "text": "“我是谁？”\n\n她停了手。水面上那个写了一半的名字，不抹了。\n\n“我是你的新娘啊。”\n\n她从水里伸出手，扣住你的手腕。手是软的，泡得发胀，力气却大得出奇。\n\n你被拽进缸里。缸比看起来深。你往下沉，一直沉。\n\n缸底躺满了人。都是男人，都穿着喜服。他们睁着眼，朝旁边挪了挪，给你让出一个空位。",
        "bgImage": "img/bg/ch08_well.jpg?v=9e3d87fe",
        "vibration": [
            300,
            300,
            300
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_02_well.jpg?v=0ab25814",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "溺亡",
        "deathDesc": "她写了又抹，是在犹豫。你一开口，她就不用犹豫了。"
    },

    "node_dead3": {
        "chapter": "第三章：熄灭的灯与厨房",
        "sceneName": "黑漆棺旁",
        "time": "02:16",
        "text": "黑暗里，棺材盖贴着棺沿缓缓滑开，一股陈年樟脑混着甜腻香灰的味道漫了出来，闻久了，竟让人发困。\n\n一只冰冷的手摸上你的脸。那只手没有一丝温度，动作却轻得过分，顺着你的眉骨、鼻梁一路抚下来，像在哄一个熟睡的婴儿。你本该挣的，可浑身一点力气都提不起来，反倒觉得这片黑暗又软又暖，像被人替你掖好了被角。\n\n那只手把你往棺里安顿，一下一下，替你理平衣襟。然后你听见盖子合上的声音，紧接着是钉子。\n\n第一颗钉下去，你的左手再也抬不起来；第二颗，右脚没了知觉；钉声一下比一下闷，每一颗都钉死你身上的一处。等钉到最后一颗。就钉在你眼睛正上方那寸木头上时，你的眼睛还睁着，睁得好好的，却怎么也闭不上了。",
        "bgImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "vibration": [
            100,
            300,
            100
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_11_coffin.webp?v=dc2ca22f",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "伴娘",
        "deathDesc": "长明灯灭了，就等于给它们开了门。"
    },

    "node13": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "老宅堂屋",
        "time": "03:00",
        "text": "你连滚带爬跑回堂屋。手抖得厉害，划了三根才划着。\n\n长明灯重新亮起来。\n\n亮起来的那一圈里，多了东西。\n\n墙角那堆纸人全站起来了，围成一个圈，把你围在中间。",
        "vibration": [
            60,
            120,
            60
        ],
        "signal": 0,
        "battery": 20,
        "bgImage": "img/bg/ch04_paper_circle.webp?v=6021131f",
        "hideCharacter": true,
        "consumeItem": "match",
        "choices": [
            {
                "text": "先数清这一圈纸人",
                "next": "node13b"
            },
            {
                "text": "慢慢抬起头",
                "next": "node14"
            }
        ]
    },

    "node13b": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "纸人圈",
        "time": "03:02",
        "text": "你不看棺材，借着灯光一个一个数过去。\n\n一、二、三……十二。\n\n可你记得清清楚楚，墙角原本只堆着十一个。\n\n多出来的那个不是纸。它比别的高出半头，没有脸，浑身是慢慢蠕动的黑烟。胸口的位置浮着两点暗红，正对着你。\n\n它不动。可你知道，它一直在看你。",
        "vibration": [
            40,
            80,
            40,
            80
        ],
        "signal": 0,
        "battery": 18,
        "bgImage": "img/bg/ch04_paper_circle.webp?v=6021131f",
        "character": "img/char/it_shadow.jpg?v=8d01daac",
        "characterEmotion": "ghost",
        "characterPosition": "center",
        "characterFlicker": true,
        "choices": [
            {
                "text": "移开目光，抬头面对棺材",
                "next": "node14"
            },
            {
                "text": "盯着那团黑烟看",
                "next": "node_dead_shadow"
            }
        ]
    },

    "node14": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "纸人围灵",
        "time": "03:05",
        "text": "火光只够照亮一圈。\n\n十一个纸人围着你。一样高，一样白，脸上一样什么都没有。爷爷扎纸人从不点睛。你小时候问过为什么，他说：点了眼，它就看得见你了。\n\n可棺材两边那两个，眼眶里有墨。\n\n墨是新的，还没干透，顺着纸往下淌，在腮上拖出两道黑。它们的头正往你这边拧，纸颈子一下一下地响，像有人在隔壁慢慢撕一封信。\n\n“纸人缺一双眼睛。”左边那个开口了。嘴没动，声音是从纸里透出来的，“你的，正好。”\n\n你不能看它们的眼睛。也不能闭眼。闭上眼，你就不知道它们走到哪儿了。\n\n你左手攥着一把香灰。从供桌上抓的，还温着。\n\n纸脚擦过地砖。沙。沙。\n\n你数着。第三步，它们就够得着你的脸了。",
        "vibration": [
            80,
            160,
            80,
            160,
            80
        ],
        "signal": 0,
        "battery": 15,
        "sceneImage": "img/bg/ch04_paper_circle.webp?v=6021131f",
        "bgImage": "img/bg/ch04_paper_circle.webp?v=6021131f",
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "characterEmotion": "ghost",
        "characterPosition": "center",
        "characterFlicker": true,
        "item": "incense_ash",
        "exploreScene": true,
        "sceneId": "node14",
        "sceneTitle": "纸人围灵",
        "sceneNoClose": true,
        "sceneHint": "数眼睛，别数纸人。香灰盖得住墨。",
        "hotspots": [
            {
                "id": "altar_ash_handful",
                "label": "供桌香灰",
                "x": 42,
                "y": 84,
                "w": 16,
                "h": 14,
                "item": "incense_ash",
                "toast": "你又抓了一把香灰。还温着。"
            },
            {
                "id": "paper_blank",
                "label": "没有眼睛的纸人",
                "x": 3,
                "y": 14,
                "w": 13,
                "h": 55,
                "closeup": true,
                "closeupTitle": "空白的脸",
                "closeupText": "这一个脸上什么都没有。白的，平的，像一张还没写字的纸。\n\n沙。纸脚又往前擦了一步。",
                "closeupImage": "img/closeup/closeup_paper_blank.jpg?v=09e9d636",
                "stepPuzzle": "pz_wipe_eyes"
            },
            {
                "id": "paper_eye_3",
                "label": "第三个纸人",
                "x": 21,
                "y": 18,
                "w": 9,
                "h": 50,
                "once": true,
                "requireItem": "incense_ash",
                "lockedNext": "node_dead4",
                "consumeItem": "incense_ash",
                "setFlags": {
                    "eye3_wiped": true
                },
                "toast": "墨化开了，混着灰往下流。"
            },
            {
                "id": "paper_eye_8",
                "label": "第八个纸人",
                "x": 64,
                "y": 18,
                "w": 8,
                "h": 50,
                "once": true,
                "requireItem": "incense_ash",
                "lockedNext": "node_dead4",
                "consumeItem": "incense_ash",
                "setFlags": {
                    "eye8_wiped": true
                },
                "toast": "它的头垂下去了。"
            },
            {
                "id": "shadow",
                "label": "墙角的黑影",
                "x": 92,
                "y": 2,
                "w": 8,
                "h": 34,
                "deathNode": "node_dead_shadow"
            },
            {
                "id": "eyes_done",
                "label": "纸人垂头",
                "x": 40,
                "y": 44,
                "w": 20,
                "h": 14,
                "visibleWhenFlags": [
                    "eye3_wiped",
                    "eye8_wiped"
                ],
                "nextNode": "node15"
            }
        ]
    },

    "node15": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "老宅堂屋",
        "time": "03:12",
        "text": "你把香灰按进它的眼眶。墨化开了，混着灰往下流，像在哭。\n\n它的头慢慢垂下去。另一个也是。\n\n你这才看清眼珠是谁画的。笔锋细，起笔轻，是女人的手。每只眼角，她都多点了一颗小小的痣。\n\n墙角那团黑烟不见了。\n\n地上落着一张黄纸，叠成四方。打开，是一张手绘的图：灶台，水缸，水缸后面一道门，门底下画着一段往下走的台阶。\n\n线条很稳，横平竖直。是爷爷的笔法。",
        "vibration": [
            30,
            60,
            30,
            60,
            30,
            60,
            30
        ],
        "signal": 0,
        "battery": 10,
        "bgImage": "img/bg/ch04_paper_circle.webp?v=6021131f",
        "sceneImage": "img/closeup/paper_eye_mole.webp?v=ac5b09ef",
        "hideCharacter": true,
        "item": "map",
        "choices": [
            {
                "text": "把图揣进怀里，跪回棺前",
                "next": "node17"
            }
        ]
    },

    "node_dead_shadow": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "纸人圈",
        "time": "03:03",
        "text": "你和它对视了。\n\n那两点红光忽然放大。黑烟像被人猛吸一口气那样朝你涌来，从你的眼睛、鼻子、嘴里钻进身体。\n\n你想喊，喊不出；你想跑，腿已经不是你的了。\n\n最后一个念头是：原来\"它\"要的，从来都不是纸人的身体。",
        "vibration": [
            400,
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_09_possess.jpg?v=84ebf9ef",
        "character": "img/char/it_shadow.jpg?v=8d01daac",
        "characterEmotion": "ghost",
        "characterPosition": "center",
        "isDeath": true,
        "deathName": "附身",
        "deathDesc": "有些东西，看一眼就会被它记住；对视，就是请它进门。"
    },

    "node_dead4": {
        "chapter": "第四章：纸人围灵",
        "sceneName": "纸人圈",
        "time": "03:06",
        "text": "你看了它的眼睛。\n\n墨还没干。那对眼珠在纸上转了一下，对准了你。\n\n纸脸一下子贴到你鼻尖。浆糊味，朱砂味，还有一点胭脂的甜。\n\n两根纸指头按上你的眼皮。很轻，像替你合眼。\n\n然后世界黑了。\n\n黑里，你听见它在你面前慢慢眨了一下眼。它现在有一双好眼睛了。",
        "vibration": [
            500
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_04_sacrifice.jpg?v=6cc42673",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "纸替",
        "deathDesc": "纸人缺一双眼睛。现在，它有了。"
    },

    "node17": {
        "chapter": "第五章：出棺",
        "sceneName": "老宅堂屋",
        "time": "03:30",
        "text": "手机震了一下。信号满格，又一下掉空。电量只剩一格。\n\n短信一条接一条进来。发信人都是爷爷。\n\n“快跑。棺材里躺着的不是我。”\n\n“娃，对不起。当年那口棺材，本该是爷爷躺进去的。那根手指，那条命，爷爷都没还。”\n\n“别跑。它在门外，棺材里反而安全。”\n\n“不对。它就在你身后。”\n\n你盯着这几条短信，分不清哪一条是爷爷，哪一条是有东西借着他的号码，在学他说话。",
        "vibration": [
            100,
            50,
            100,
            50,
            100
        ],
        "signal": 0,
        "battery": 1,
        "bgImage": "img/bg/ch05_fog_hall.webp?v=1a3b6996",
        "hideCharacter": true,
        "choices": [
            {
                "text": "看向棺材",
                "next": "node18"
            },
            {
                "text": "先别动，稳住长明灯，守完这炷香",
                "next": "node5x_wait"
            },
            {
                "text": "慢慢回头",
                "next": "node_dead6"
            }
        ]
    },

    "node5x_wait": {
        "chapter": "第五章：出棺",
        "sceneName": "老宅堂屋",
        "time": "03:32",
        "text": "你没有回头，也没有看棺材。\n\n你盯着供桌。长明灯的火苗只剩绿豆大，一缩一缩。\n\n香炉里最后一炷香快烧到根了，香灰一节一节往下掉。门缝里钻进来一丝穿堂风，正吹着那点火。\n\n守完这炷香，大概还要四分钟。",
        "vibration": [
            40,
            40,
            40
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "稳住长明灯，守完这炷香",
                "next": "node5x_vigil"
            },
            {
                "text": "不管了，现在就冲门",
                "next": "node19"
            }
        ]
    },

    "node5x_vigil": {
        "chapter": "第五章：出棺",
        "sceneName": "守灵·添香",
        "time": "03:33",
        "text": "你跪回蒲团，借着那点将灭的光，把供桌一样一样守过去。\n\n灯要续。香要添。水碗别看。门外喊名，别应。",
        "bgImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "sceneImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "sceneTitle": "守灵·添香",
        "sceneId": "vigil_offering",
        "vibration": [
            20,
            40,
            20
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node18",
        "closeText": "坐回蒲团等天亮",
        "sceneHint": "摆好供，取到香，给长明灯续上。门外要是喊你全名，别应。",
        "hotspots": [
            {
                "id": "shrine_offering",
                "label": "神龛供桌",
                "x": 40,
                "y": 16,
                "w": 22,
                "h": 24,
                "once": true,
                "item": "incense",
                "setFlags": {
                    "offering_set": true
                },
                "toast": "你重新摆好供，抽出三炷新香。",
                "closeup": true,
                "closeupTitle": "神龛供桌",
                "closeupText": "供桌上插着三炷旧香，两短一长。长的那炷一直没烧。\n\n香脚边的水碗满得快溢出来。你余光扫到碗里映着一张脸，贴着你的肩膀往前探。\n\n你别开眼，抽出三炷新香。",
                "closeupImage": "img/closeup/closeup_shrine_offering.png?v=66464dff"
            },
            {
                "id": "spirit_lamp_feed",
                "label": "长明灯",
                "x": 63,
                "y": 34,
                "w": 13,
                "h": 14,
                "once": true,
                "visibleWhenFlags": [
                    "offering_set"
                ],
                "requireItem": "incense",
                "lockedText": "火苗只剩一点。得先从背包里选中香，引着火给灯续上，别空着手去够它。",
                "consumeItem": "incense",
                "setFlags": {
                    "lamp_steady": true
                },
                "toast": "长明灯直起来了，屋子重新亮了一圈。",
                "closeup": true,
                "closeupTitle": "续稳的长明灯",
                "closeupText": "你拿香小心地引过火，挑了挑灯芯。火苗忽地一直，屋子重新亮了一圈。\n\n供桌后的牌位齐齐响了一声，像有人同时松了口气。",
                "closeupImage": "img/closeup/closeup_spirit_lamp_dim.jpg?v=16ebe7b5"
            },
            {
                "id": "censer_grab_flame",
                "label": "香炉边将灭的火",
                "x": 43,
                "y": 40,
                "w": 16,
                "h": 11,
                "hiddenWhenFlags": [
                    "lamp_steady"
                ],
                "deathNode": "node5x_dead_burn"
            },
            {
                "id": "door_name_call",
                "label": "门外的喊声",
                "x": 77,
                "y": 22,
                "w": 20,
                "h": 36,
                "visibleWhenFlags": [
                    "lamp_steady"
                ],
                "hiddenWhenFlags": [
                    "call_resisted"
                ],
                "nextNode": "node5x_call"
            },
            {
                "id": "water_bowl_dont_look",
                "label": "供桌水碗",
                "x": 56,
                "y": 60,
                "w": 18,
                "h": 9,
                "visibleWhenFlags": [
                    "lamp_steady"
                ],
                "closeup": true,
                "closeupTitle": "水碗",
                "closeupText": "你只用余光扫过水碗。碗里的水纹自己晃了一下，像有人从碗底往上呼了口气。\n\n你别开脸。",
                "closeupImage": "img/closeup/water_bowl_handprint.webp?v=09fb301c"
            },
            {
                "id": "vigil_done_exit",
                "label": "坐回蒲团",
                "x": 30,
                "y": 66,
                "w": 24,
                "h": 14,
                "visibleWhenFlags": [
                    "offering_set",
                    "lamp_steady",
                    "call_resisted"
                ],
                "setFlags": {
                    "vigil_kept": true
                },
                "nextNode": "node18",
                "toast": "灯稳了，供摆好了，香守到了根。你坐回蒲团。棺材里，那声轻响还是来了。"
            }
        ]
    },

    "node5x_call": {
        "chapter": "第五章：出棺",
        "sceneName": "门外的喊声",
        "time": "03:34",
        "text": "门外有人在喊你。\n\n一个字一个字，把你的全名喊得又清又慢。声音是你妈的，和短信里一样的口气。\n\n她喊得越来越急，贴着门缝求你：应一声，就一声。\n\n喊到后来，声音哑了。哑了之后，有一句很轻的，不像是喊给门里听的：\n\n“饭在锅里。”\n\n然后又是你的全名。又清，又慢。",
        "vibration": [
            100,
            50,
            100,
            50,
            100
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "捂住耳朵，一声都不应",
                "next": "node5x_vigil",
                "setFlags": {
                    "call_resisted": true
                }
            },
            {
                "text": "忍不住应了一声",
                "next": "node_dead2"
            }
        ]
    },

    "node5x_dead_burn": {
        "chapter": "第五章：出棺",
        "sceneName": "供桌",
        "time": "03:37",
        "text": "火苗就要灭了。你顾不上规矩,空着手伸过去想拢住它。\n\n衣袖先擦过香炉,半截没烧尽的香火倒进了袖口。火没有大,却顺着布料一路往上爬,安安静静,像早就认得你。\n\n你拍,你打,火却越拍越旺。最后你撞翻了长明灯,满桌的灯油泼下来。整张供桌轰地烧成一团。\n\n你这才想起第一条规矩:长明灯不能灭。你拿命去够它,它就拿你的命来续。",
        "vibration": [
            500
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_08_burn.jpg?v=76c0d89f",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "续灯",
        "deathDesc": "长明灯不能灭。可它要的从来不是灯油，是替它烧的人。"
    },

    "node18": {
        "chapter": "第五章：出棺",
        "sceneName": "老宅堂屋",
        "time": "03:40",
        "text": "“砰。”的一声闷响从棺材里顶上来，棺盖被一股巨力掀飞，斜插在供桌脚下。\n\n先漫出来的不是人，是味道：陈年的樟脑，压着一股井水的腥，凉得直往你鼻腔里钻。接着是声音，极细的。嫁衣上的金线绷开了，压襟的铜钱互相磕碰，叮、叮，一下一下。\n\n一只穿红绣鞋的脚搭上棺沿。鞋底没沾一点香灰，却在往下滴水，一滴砸在地砖上，黑得发亮。然后是另一只脚。\n\n她坐起来的样子很慢，可那不是温柔的慢。是关节像泡胀的木头，一节一节往直了绷，每绷开一处就轻轻一响。长明灯的火苗被这股寒气压得几乎贴住灯油，她的影子却先于身体立上了墙，黑黑地罩下来。\n\n你往后退，小腿撞翻了身后的蒲团，膝盖一软跪坐在地。你想喊，喷出来的呼吸在面前结成了一团白雾。这屋里的温度，正一寸一寸往下掉。",
        "vibration": [
            200,
            100,
            200,
            100,
            200
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "红绣鞋。门缝外那双就是它。抢在她站直前，贴着墙根溜过去",
                "next": "node21",
                "requireFlag": "saw_bride_shoes"
            },
            {
                "text": "灯是你守稳的。趁她还没站直，摸去厨房找图上那道暗门",
                "next": "node15b",
                "requireItem": "map",
                "requireFlag": "vigil_kept"
            },
            {
                "text": "往门外跑",
                "next": "node19"
            },
            {
                "text": "跪下来求她",
                "next": "node_dead7"
            }
        ]
    },

    "node19": {
        "chapter": "第五章：出棺",
        "sceneName": "堂屋大门",
        "time": "03:42",
        "text": "你扑到门上。门闩拉不动。\n\n背后有水滴的声音，一下，一下，越来越近。\n\n门板上洇出水渍，从门缝里往里渗，慢慢聚成一个字：\n\n“留”\n\n你用肩膀撞门。门没动。按在门板上的手掌软软地塌了一下，你低头看，掌心的纹路正褪成黄纸的折痕。",
        "vibration": [
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "背抵着门，滑坐下去",
                "next": "node20"
            }
        ]
    },

    "node20": {
        "chapter": "第五章：出棺",
        "sceneName": "堂屋大门",
        "time": "03:43",
        "text": "口袋里的手机烫起来。你掏出来，屏幕上弹出一个框，关不掉：\n\n【你跑不掉的，你回头看看我】\n\n长明灯灭了。窗外那点月色也灭了。整间堂屋只剩这一块冷白的光。\n\n手机越来越潮，越来越黏，像攥着一块刚从水里捞出来的东西。你甩不掉它。\n\n关闭按钮变成了一个血红的“好”字。框角浮出一张白脸，等你点。你迟迟不点，它等不及了，在你眼皮底下，自己慢慢眨了一下眼。",
        "vibration": null,
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "闭上眼，把屏幕死死按在胸口",
                "next": "node21"
            },
            {
                "text": "点“好”",
                "next": "node_dead8"
            },
            {
                "text": "回头",
                "next": "node_dead6"
            }
        ]
    },

    "node21": {
        "chapter": "第五章：出棺",
        "sceneName": "老宅堂屋",
        "time": "03:44",
        "text": "屏幕贴着你的胸口，一下一下地跳，像第二颗心。\n\n过了很久，它不跳了。\n\n你睁开眼。屏幕上只剩一句话，排满了每一个能点的地方：【留下来陪我留下来陪我留下来陪我】\n\n棺材底下“咔”地一声轻响。像有道暗扣，被人从里面推开了。供桌后的墙裂开一道窄缝，一段石阶往下走，吐着冷气。\n\n大门那边，门闩自己落了地。",
        "vibration": [
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "顺着石阶下去",
                "next": "node22"
            },
            {
                "text": "撞开大门，往外跑",
                "next": "node_endA"
            }
        ]
    },

    "node_dead6": {
        "chapter": "第五章：出棺",
        "sceneName": "身后",
        "time": "03:36",
        "text": "你回头了。\n\n身后是穿红嫁衣的她。近，近得你能闻到她呼出来的东西。那不是气，是井水的凉，一股脑灌进你的口鼻。她垂着眼，睫毛上挂着的水珠抖了一下，滴在你脸上。\n\n“谢谢你回头。”她说，“这样我就能亲到你了。”\n\n她的嘴唇贴上你的额头。不是肉，是一片潮湿发软的纸。就从那一点开始，你额头的皮肤发硬、发黄，往四周一圈一圈地脆下去，知觉跟着退潮一样一层层抽走。先是额头，再是眼皮，然后你想眨眼，已经眨不动了。\n\n最后退掉的是听觉。你听见自己脑子里响起干纸被揉皱的声音，然后，连这声音也没有了。",
        "vibration": [
            500
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_03_lookback.jpg?v=076bd3b5",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "纸婚",
        "deathDesc": "回头，就是签约。"
    },

    "node_dead7": {
        "chapter": "第五章：出棺",
        "sceneName": "老宅堂屋",
        "time": "03:41",
        "text": "你跪了下来。她笑了，伸手抚摸你的头顶，那只手轻飘飘的，没有重量。\n\n“乖，”她说，“做我的纸新郎吧。”\n\n从她掌心贴着的地方起，有股力量开始往外抽你身上的水。你能清清楚楚地感觉到自己在变干：皮肤一寸寸绷紧，绷到极限再皱起来，像晒过头的纸被人攥了一把又松开，那种又紧又涩的撕拉感从头皮一路扯到脚跟。血不流了，汗收回去了，连眼眶里都被烘得发烫发干。\n\n等最后一丝潮气离开身体，你已经轻得能被风掀起来。你直起身，平平地、薄薄地，乖乖站到了她身后，和那些纸人排成一列。",
        "vibration": [
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_12_wedding.jpg?v=b65bff29",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "臣服",
        "deathDesc": "跪下去，就再也站不起来了。"
    },

    "node_dead8": {
        "chapter": "第五章：出棺",
        "sceneName": "手机屏幕",
        "time": "03:44",
        "text": "你点了“好”。\n\n屏幕一下子红透了。那张脸涨满了整块屏。\n\n“好。”她说，“你答应了。”\n\n摄像头闪了一下。\n\n她把你的灵魂，拍进了照片里。",
        "vibration": [
            300,
            300,
            300,
            300
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_13_photo.png?v=1f650f91",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "定格",
        "deathDesc": "点“好”的那一下，和应一声是一样的。"
    },

    "node_endA": {
        "chapter": "第五章：出棺",
        "sceneName": "村口",
        "time": "05:40",
        "text": "你没有回头，一直跑到天亮。\n\n村口停着回城的头班车。司机低着头，没说话。\n\n上车前，你还是看了老宅最后一眼。\n\n晨雾很薄。屋脊上倒挂着一个人，穿着爷爷生前最爱的那件中山装，四肢张开，脸朝着天，一动不动地目送你走。\n\n堂屋的窗纸后面，一点喜烛还红着。喜位上坐着一个人，蓝布褂子，头上蒙着红。她没有起来送你。\n\n门槛上那双布鞋还在。鞋尖朝外了。\n\n你逃出来了。这屋里欠的东西，一样没少，只是从你身上挪开，又落回了他们身上。\n\n车开动了。车窗外，那个穿红嫁衣的女人跟着跑了几步，停下了。她没有追。她抬起手，轻轻朝你挥了挥。\n\n不急。再过十年，又是七月十五，又会有一个人，收到一条“今晚务必回村”的短信。\n\n到那天，她还在这里。爷爷还挂在屋顶，母亲还坐在喜位。\n\n而你，会是那个收到短信、却假装早就不记得今晚的人。",
        "vibration": [
            40,
            80,
            40
        ],
        "signal": 1,
        "battery": 1,
        "endingCG": "img/ending/ending_a_escape.jpg?v=4019ac45",
        "fearScore": 45,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "A",
        "endingName": "残逃"
    },

    "node15b": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "厨房暗门",
        "time": "03:46",
        "text": "你贴着墙根挪进厨房。水缸还盖着，你没看它。\n\n缸后面的墙上有一道门，和图上画的一样。推开，是一段往下的石阶。\n\n两边的石壁上刻满了名字，一个摞一个，刻痕有新有旧。\n\n你看见了爷爷的名字。你爹的名字。\n\n还有你的。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 8,
        "hideCharacter": true,
        "choices": [
            {
                "text": "走下去",
                "next": "node22"
            }
        ]
    },

    "node22": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "石阶岔口",
        "time": "03:50",
        "text": "石阶到底，是个岔口。\n\n左手边一股腥，凉的，像井底翻上来的气。\n\n右手边透出一线红，暖的，像谁家办喜事忘了关的灯。\n\n正前方黑着，有风。风里有稻草和夜露的味道，是地面上的味道。",
        "vibration": [
            80,
            160,
            80
        ],
        "signal": 0,
        "battery": 5,
        "hideCharacter": true,
        "choices": [
            {
                "text": "往腥气那边走",
                "next": "node_explore_cave"
            },
            {
                "text": "往红光那边走",
                "next": "node23"
            },
            {
                "text": "顺着风往前摸",
                "next": "node24"
            }
        ]
    },

    "node_explore_cave": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "血池洞窟",
        "text": "腥气是从一口岩洞里来的。\n\n洞底积着一池暗红的水。池心浮着一颗拳头大的珠子，一动不动。\n\n岩壁上挂着蛛网。角落里散着几根白骨，指骨蜷着，攥着一样东西，像是谁临死前不肯撒手。",
        "sceneImage": "img/bg/ch04_basement.jpg?v=4589e052",
        "sceneTitle": "血池洞窟",
        "vibration": [
            100,
            50,
            100
        ],
        "signal": 0,
        "battery": 7,
        "hideCharacter": true,
        "exploreScene": true,
        "sceneId": "node_explore_cave",
        "returnNode": "node22",
        "closeText": "爬回石阶",
        "sceneHint": "洞里的东西都像在等你伸手。先找齐能找的，再去看那扇门。",
        "hotspots": [
            {
                "id": "bone_amulet",
                "label": "白骨里的东西",
                "x": 10,
                "y": 60,
                "w": 22,
                "h": 18,
                "once": true,
                "item": "bone_amulet",
                "setFlags": {
                    "bone_found": true
                },
                "toast": "你从指骨中间抠出一块骨符。",
                "closeup": true,
                "closeupTitle": "骨符",
                "closeupText": "巴掌大的一块骨符，刻着褪色的符纹。\n\n符纹正中是一个字：替。",
                "closeupImage": "img/closeup/closeup_ritual_bone_charm.png?v=2a4d8538"
            },
            {
                "id": "blood_pearl",
                "label": "池心的珠子",
                "x": 40,
                "y": 52,
                "w": 20,
                "h": 16,
                "deathNode": "node_dead_cave"
            },
            {
                "id": "spider_web",
                "label": "蛛网",
                "x": 74,
                "y": 8,
                "w": 20,
                "h": 22,
                "once": true,
                "setFlags": {
                    "web_note_seen": true
                },
                "closeup": true,
                "closeupTitle": "蛛网上的纸条",
                "closeupText": "蛛网上挂着一张泛黄的纸条，被潮气泡得发软。\n\n“那一夜，镜头替我记着。”\n\n铅笔写的，笔画发抖。写字的人另一只手里，像还攥着别的东西。",
                "closeupImage": "img/closeup/closeup_spider_web.jpg?v=c5a9e2b2"
            },
            {
                "id": "phone_replay",
                "label": "口袋里的手机",
                "x": 40,
                "y": 78,
                "w": 22,
                "h": 14,
                "once": true,
                "visibleWhenFlags": [
                    "web_note_seen"
                ],
                "setFlags": {
                    "cam_seen": true
                },
                "closeup": true,
                "closeupTitle": "第三镜头",
                "closeupText": "你掏出手机。屏幕自己亮了。\n\n【第三镜头】。还是堂屋那根梁。梁下那双脚还在晃。\n\n右下角的日子一动不动：二〇〇八年九月廿二。",
                "closeupImage": "img/closeup/closeup_phone_replay.jpg?v=79bb03de"
            },
            {
                "id": "stone_door",
                "label": "洞底的石门",
                "x": 42,
                "y": 14,
                "w": 22,
                "h": 30,
                "visibleWhenFlags": [
                    "bone_found",
                    "web_note_seen",
                    "cam_seen"
                ],
                "nextNode": "node_after_cave"
            }
        ]
    },

    "node_dead_cave": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "血池",
        "text": "你伸手去够那颗珠子。它睁开了。\n\n是一只眼睛。没有眼皮，泡得发白，黑眼仁在当中慢慢转过来，对准你。\n\n池水先是不动。然后从池底一圈一圈往上翻，像下面有什么换了口气。\n\n一只手从水里伸出来，扣住你的脚踝。手是软的，指甲很长，一下就陷进肉里。\n\n你被拖下去。池水是温的。\n\n你在水里睁着眼。池底铺满了眼睛，一颗挨一颗，全都在看你。它们缺了很多年的，就是一双还会眨的。",
        "signal": 0,
        "battery": 6,
        "deathCG": "img/death/death_10_blood_curse.jpg?v=7a7ad808",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "血池吞噬",
        "deathDesc": "洞里的东西都在等你伸手。等的不是你的手。"
    },

    "node_after_cave": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "石门",
        "text": "洞窟最里头，岩壁上嵌着一扇石门。\n\n门心是一圈石格，刻着零到九。要按四下。\n\n石格上落着一层细灰。只有三个格子边上的灰被抹掉了，像有人常来，常按。\n\n蛛网上那张纸条说：那一夜，镜头替我记着。",
        "signal": 0,
        "battery": 6,
        "hideCharacter": true,
        "choices": [
            {
                "text": "按石格",
                "next": "node_puzzle_door"
            },
            {
                "text": "原路回岔口",
                "next": "node22"
            }
        ]
    },

    "node_puzzle_door": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "石门",
        "text": "你把手按上石格。\n\n指尖一碰，“咔”地一响。像门后有人在数。",
        "signal": 0,
        "battery": 5,
        "hideCharacter": true,
        "puzzle": "pz_stone_door"
    },

    "node_puzzle_fail": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "石门",
        "text": "石格又“咔”了一声。这一回，门后没人数了。\n\n毒针从门缝里射出来，扎进你的颈侧。\n\n先是凉。凉顺着血往四肢走，走到哪儿，哪儿就不是你的了。\n\n舌根发苦，嘴里泛起铁锈和烂草药的味道。眼前的东西一层一层蚀成红色。\n\n你倒下去的时候，脸贴着石门。门上刻着一行小字，你现在才看清：\n\n“九月廿二。别记错。”",
        "signal": 0,
        "battery": 5,
        "deathCG": "img/death/death_05_suffocate.jpg?v=cbd253bb",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "机关毒针",
        "deathDesc": "那一夜的日子，手机替你记着。你没去翻。"
    },

    "node_puzzle_success": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "密室",
        "text": "石门往里沉，沉了一寸，又一寸。\n\n里面是一间密室。很小，很干，没有腥气。\n\n供桌上摆着一本族谱，一把生锈的钥匙压在上面，像镇纸。\n\n你把钥匙拿起来。铁锈贴着掌心，凉得发涩。柄上拴着一截褪色的布条，写着两个字：灵棚。",
        "signal": 0,
        "battery": 5,
        "hideCharacter": true,
        "item": "key",
        "choices": [
            {
                "text": "翻开族谱",
                "next": "node_genealogy"
            }
        ]
    },

    "node_genealogy": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "密室",
        "text": "族谱的纸脆得像枯叶。你一页页往后翻，翻到最后一页，手指沾上了暗红的印子。\n\n这一页是后来补进去的。字是血写的，一笔一笔，写得很慢：\n\n“莫氏绣禾。庚辰年七月十四日生，卒于戊戌年三月初三。”\n\n底下一行八字：庚辰 甲申 丁卯 丙午。\n\n再往下，按着一只血手印。四根手指。小指的位置空着。",
        "signal": 0,
        "battery": 4,
        "hideCharacter": true,
        "setFlags": {
            "knows_bride_name": true
        },
        "item": "genealogy",
        "choices": [
            {
                "text": "把族谱揣进怀里",
                "next": "node_after_genealogy"
            }
        ]
    },

    "node_after_genealogy": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "密室",
        "text": "你记下了那串生辰八字：庚辰年生，戊戌年没的。族谱上薄薄一行字，是这家人留给她的全部。\n\n族谱底下压着一方褪色的红绸，是条只绣了一半的喜帕：并蒂莲开了一朵，另一朵还空着针脚，丝线断在半途，像绣的人被人从针线前硬拽走，再没能坐回来。帕角用细线描着一行小字，是个年轻男人的名字，一笔一笔描了又描，描得起了毛。是她当年要嫁的那个人。绸子里还掖着半张没寄出的家书，墨都晕开了，只剩一句还认得出：“娘说，嫁过去就有好日子过了。”\n\n你忽然心里发堵。族谱上她只是一个姓、一串八字，可她活着的时候，也是个会偷偷绣喜帕、盼着过门的真姑娘。\n\n突然，身后传来纸页翻动的声音...",
        "signal": 0,
        "battery": 4,
        "bgImage": "img/bg/ch04_basement.jpg?v=4589e052",
        "sceneImage": "img/closeup/veil_embroidery_wide.webp?v=1ad2647e",
        "hideCharacter": true,
        "choices": [
            {
                "text": "猛然回头",
                "next": "node_dead_bride"
            },
            {
                "text": "保持不动",
                "next": "node_still"
            }
        ]
    },

    "node_still": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "密室",
        "text": "翻纸声停了。\n\n你一动不动。背后有一阵很轻的凉，贴着你的后颈，停了很久。\n\n然后，凉走了。\n\n你低头看怀里的族谱。最后一页底下，多了一行新写的血字：\n\n“谢谢你记得我。”",
        "signal": 0,
        "battery": 4,
        "hideCharacter": true,
        "choices": [
            {
                "text": "回到岔口",
                "next": "node22"
            }
        ]
    },

    "node_dead_bride": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "身后",
        "text": "她离你只有一寸。\n\n近得你能数清盖头上的金线。近得你闻见井水，闻见樟脑，闻见七十年没见过太阳的红绸。\n\n盖头底下是一片空白。没有眉，没有眼，没有嘴。\n\n你这才明白，不是她没有脸。\n\n是你从没看过她。\n\n那片空白慢慢贴上来，贴在你脸上。很凉，很软。等它揭开的时候，没有脸的那个人，换成了你。",
        "deathCG": "img/death/death_03_lookback.jpg?v=076bd3b5",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "回头杀",
        "deathDesc": "纸条背面写着：别回头。要回头，也得先看清她是谁。"
    },

    "node23": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "婚房",
        "text": "红光是从一间石室里漏出来的。\n\n石室正中摆着一张婚床。大红被褥铺得平平整整，枕头上一对鸳鸯，绣线褪成了粉。\n\n墙上贴满了泛黄的结婚照。新郎各个年代都有：长衫，中山装，的确良衬衫，西装。\n\n新娘都穿着同一件嫁衣，坐着同一个姿势。脸的位置，都被抠掉了。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 3,
        "sceneImage": "img/bg/ch06_bridal_room.webp?v=45ac1bd5",
        "hideCharacter": true,
        "exploreScene": true,
        "sceneId": "node23",
        "sceneTitle": "婚房",
        "returnNode": "node22",
        "closeText": "退出场景",
        "sceneHint": "一墙新郎，看手，别看脸。",
        "hotspots": [
            {
                "id": "photo_wall",
                "label": "照片墙",
                "x": 5,
                "y": 9,
                "w": 34,
                "h": 42,
                "once": true,
                "setFlags": {
                    "wall_seen": true
                },
                "closeup": true,
                "closeupTitle": "照片背面",
                "closeupText": "你揭下一张。背面写着：“纸新娘招亲，十年一轮。轮到你了。”\n\n再揭一张，还是这句。背面的日子都是同一天：七月十五。\n\n只有最角落那一张，背面写的是三月初三。",
                "closeupImage": "img/closeup/photo_wall_grooms.webp?v=48367d10"
            },
            {
                "id": "groom_wrong",
                "label": "其余的新郎",
                "x": 16,
                "y": 9,
                "w": 23,
                "h": 42,
                "visibleWhenFlags": [
                    "wall_seen"
                ],
                "closeup": true,
                "closeupTitle": "新郎的手",
                "closeupText": "你挨个看那些新郎的手。都是五根指头，搭在膝盖上，僵得像借来的。\n\n不是这些。",
                "closeupImage": "img/closeup/photo_wall_grooms.webp?v=48367d10"
            },
            {
                "id": "groom_four",
                "label": "角落那张照片",
                "x": 5,
                "y": 9,
                "w": 10,
                "h": 18,
                "once": true,
                "visibleWhenFlags": [
                    "wall_seen"
                ],
                "puzzle": "pz_groom",
                "closeup": true,
                "closeupTitle": "头一个新郎",
                "closeupText": "照片上的新郎很年轻，二十岁上下，穿着长衫，笑得有点僵。\n\n他的左手搭在膝上。四根手指。小指那儿缠着一圈红布，红得发黑。\n\n背面写着：戊戌年三月初三。你把照片翻过来，背面还粘着一小块，是从正面新娘脸上撕下来的。",
                "closeupImage": "img/closeup/photo_wall_fourfinger.webp?v=82fe8528"
            },
            {
                "id": "wedding_bed",
                "label": "婚床",
                "x": 40,
                "y": 62,
                "w": 30,
                "h": 22,
                "hiddenWhenFlags": [
                    "coffin_taken"
                ],
                "nextNode": "node22b"
            }
        ]
    },

    "node22b": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "婚床底下",
        "text": "你弯下腰，看向婚床底下。\n\n床底下整整齐齐码着十几口小棺材。纸糊的，巴掌长，每口都贴着标签，写着名字和日期。\n\n最上面那口，标签上写着你的名字。日期是今晚。\n\n日期那一栏的墨，正一点一点淡下去。像在等下一个“今晚”，重新写上。",
        "sceneImage": "img/bg/under_bed.jpg?v=8facf7be",
        "vibration": [
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 4,
        "hideCharacter": true,
        "choices": [
            {
                "text": "把写着你名字的小棺材揣进怀里",
                "next": "node23",
                "setFlags": {
                    "coffin_taken": true
                },
                "item": "mini_coffin"
            },
            {
                "text": "把小棺材推回去，当没看见",
                "next": "node_endC"
            }
        ]
    },

    "node_endC": {
        "chapter": "第六章：地下的喜房",
        "sceneName": "末班车",
        "time": "23:30",
        "text": "你把那口小棺推回床底，转身就走。没敢再看。\n\n身后，最上面那口的标签上，墨迹正一点一点淡下去，空出位置，等着重新写上一个名字。\n\n你醒在末班车最后一排。\n\n坐垫是温的。\n\n手机亮了一下。母亲发来短信：“爷爷走了，今晚务必回村。”电量满格，信号满格，时间停在 23:30。和这一切开始的那一刻，分毫不差。\n\n你忽然记起来了。这条路你走过很多回。每一回，你都在床底把那口小棺推回去，告诉自己这次总算逃掉了。\n\n爷爷还挂在屋顶。母亲还坐在喜位上。棺材里那个人安安静静，数着下一个十年。\n\n你推回去的不是棺材。是“今晚”。\n\n你看向车窗。车顶上那团湿黑的影子，也正回头看你。它一点都不急。这班车的终点，永远是同一个村口。",
        "vibration": [
            60,
            120,
            60
        ],
        "signal": 4,
        "battery": 80,
        "endingCG": "img/ending/ending_c_cycle.jpg?v=d379caae",
        "fearScore": 66,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "C",
        "endingName": "轮回"
    },

    "node24": {
        "chapter": "第七章：纸人村",
        "sceneName": "打谷场",
        "time": "04:08",
        "text": "风越来越大。石道往上斜，尽头是一块松动的石板。\n\n你顶开它爬出来。手底下是干稻草。\n\n你站在村口的打谷场上。场上站满了人，全都背对着你，一动不动。\n\n月光底下，你看清了。都是纸人，身上穿着村民的衣裳。\n\n场边搭着一座灵棚。白幡垂着，没有风。",
        "vibration": [
            150,
            300,
            150
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "低下头，混进纸人群",
                "next": "node25"
            },
            {
                "text": "走进那座灵棚",
                "next": "node7x_funeral_explore"
            },
            {
                "text": "大声喊",
                "next": "node_dead1"
            }
        ]
    },

    "node7x_funeral_explore": {
        "chapter": "第七章：纸人村",
        "sceneName": "村中灵棚",
        "time": "04:10",
        "text": "灵棚里点着一支白蜡。白幡垂得笔直。\n\n棚里也站着几个纸人，背对着你。这里多了一具棺木，一张遗照，一本摊开的族谱。\n\n棺木那头，有很轻的喘气声。\n\n纸人不喘气。",
        "bgImage": "img/bg/ch07_mourning_shed.webp?v=d89ad757",
        "sceneImage": "img/bg/ch07_mourning_shed.webp?v=d89ad757",
        "sceneTitle": "村中灵棚",
        "sceneId": "paper_village_funeral",
        "vibration": [
            20,
            40,
            20
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node24",
        "closeText": "退回打谷场",
        "sceneHint": "分清哪个是纸，哪个在喘气。别出声，别应名。",
        "hotspots": [
            {
                "id": "white_banner",
                "label": "白幡",
                "x": 26,
                "y": 12,
                "w": 14,
                "h": 56,
                "closeup": true,
                "closeupTitle": "不动的白幡",
                "closeupText": "白幡笔直垂着。棚外有夜风，幡一丝不动。\n\n幡上一行墨字，写的是你的姓。名字那两格被红笔圈着，空着。",
                "closeupImage": "img/closeup/closeup_white_banner.jpg?v=41096802"
            },
            {
                "id": "old_photo",
                "label": "遗照",
                "x": 42,
                "y": 28,
                "w": 16,
                "h": 32,
                "once": true,
                "item": "old_photo",
                "toast": "你把遗照取了下来。",
                "closeup": true,
                "closeupTitle": "多出一个人的遗照",
                "closeupText": "黑白遗照里是爷爷。照片上本该只有他一个人。\n\n现在他身后多站了一个穿红嫁衣的女人。左半张脸被香灰糊住，只露出右半张：淡淡一道眉，薄薄半边嘴唇。\n\n爷爷在笑。你从没见他这样笑过。",
                "closeupImage": "img/closeup/portrait_bride_behind.webp?v=4fdbb072"
            },
            {
                "id": "turning_puppet",
                "label": "供桌纸偶",
                "x": 9,
                "y": 30,
                "w": 14,
                "h": 62,
                "once": true,
                "item": "puppet",
                "toast": "你把纸偶塞进背包。隔着布，它还在你掌心里轻轻拧动。",
                "closeup": true,
                "closeupTitle": "会转头的纸偶",
                "closeupText": "巴掌大的纸偶，画着五官，脖子上缠着一圈红线。\n\n你正着看它，它脸朝供桌。你把视线挪开半寸，再回头看，它的脸已经转过来，正对着你。\n\n红线那头，连着族谱。",
                "closeupImage": "img/item/item_puppet.jpg?v=ad2546a9"
            },
            {
                "id": "clan_book",
                "label": "摊开的族谱",
                "x": 52,
                "y": 62,
                "w": 9,
                "h": 7,
                "closeup": true,
                "closeupTitle": "刮掉的一行",
                "closeupText": "族谱摊在爷爷那一辈。\n\n爷爷名字的下一行，原本写着一个女人。字被刀刮掉了，刮得很干净，纸都薄了。\n\n刮痕旁边还剩一个字没刮到：配。配的是爷爷年轻时的名字。那两个字被人用指头摸过很多遍，墨都摸淡了。",
                "closeupImage": "img/item/item_genealogy.jpg?v=5dcc9aad"
            },
            {
                "id": "funeral_coffin",
                "label": "灵棚棺木",
                "x": 32,
                "y": 76,
                "w": 38,
                "h": 20,
                "hiddenWhenFlags": [
                    "coffin_closed"
                ],
                "nextNode": "node7x_coffin_alive"
            },
            {
                "id": "coffin_lock",
                "label": "盖回的棺木",
                "x": 32,
                "y": 76,
                "w": 38,
                "h": 20,
                "once": true,
                "visibleWhenFlags": [
                    "coffin_closed"
                ],
                "requireItem": "key",
                "lockedText": "棺盖盖回去了，底下还在喘。棺头有一个铜扣，锁眼里全是锈。",
                "consumeItem": "key",
                "setFlags": {
                    "saved_villager": true
                },
                "puzzle": "pz_lock_coffin",
                "closeup": true,
                "closeupTitle": "锁上的棺",
                "closeupText": "你把钥匙插进铜扣。锈得很死，你拧了三下才拧动。咔。\n\n棺里的喘气声慢下来，匀了。像一个人终于敢睡着。\n\n他不用替你了。",
                "closeupImage": "img/closeup/closeup_coffin_sealed_name_tag.jpg?v=fc2a0023"
            },
            {
                "id": "blend_into_paper",
                "label": "混进纸人群",
                "x": 78,
                "y": 30,
                "w": 13,
                "h": 62,
                "nextNode": "node25"
            }
        ]
    },

    "node7x_coffin_alive": {
        "chapter": "第七章：纸人村",
        "sceneName": "灵棚棺木",
        "time": "04:12",
        "text": "你掀开棺盖。\n\n里面是个活人。胸口一起一伏，脸上盖着一张黄纸。指甲缝里全是新泥，像刚从土里被人拖出来。\n\n他身上穿着喜服，扣子扣到喉结。胸口别着一朵纸红花，花芯里写着你的八字。\n\n这手扎花的功夫，村里只有一个人有。他死前七天，还在给你备这个。\n\n黄纸鼓了起来。底下的人在喊，喊你的全名，又清楚，又恳切。",
        "vibration": [
            200,
            150,
            200,
            150
        ],
        "signal": 0,
        "battery": 1,
        "bgImage": "img/bg/ch07_mourning_shed.webp?v=d89ad757",
        "sceneImage": "img/closeup/coffin_alive.webp?v=11f0c4e8",
        "hideCharacter": true,
        "choices": [
            {
                "text": "心软，应一声，把他拉出来",
                "next": "node7x_answer_dead"
            },
            {
                "text": "咬住牙，一个字不应，盖回棺盖",
                "next": "node7x_funeral_explore",
                "setFlags": {
                    "coffin_closed": true
                }
            }
        ]
    },

    "node7x_answer_dead": {
        "chapter": "第七章：纸人村",
        "sceneName": "灵棚棺木",
        "time": "04:13",
        "text": "你应了。\n\n那一声刚出口，黄纸下的脸就不喘了。棺里的活人塌成一张人皮，瘪下去，像被抽走了骨头。\n\n而你忽然觉得胸口被抽空。你应的是你的名字，名字一旦递出去，就换不回来了。\n\n灵棚里所有纸人同时转过头，朝你伸出手。它们终于等到一个肯答话的。",
        "vibration": [
            400,
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_07_paper_replace.jpg?v=36b7f25b",
        "bgImage": "img/bg/ch07_mourning_shed.webp?v=d89ad757",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "应名",
        "deathDesc": "喊你全名的，从来不是要救你的人。"
    },

    "node25": {
        "chapter": "第七章：纸人村",
        "sceneName": "纸人队伍",
        "time": "04:15",
        "text": "你学着纸人的样子，低着头，一步一步地走。\n\n纸人们开始移动了，朝着老宅的方向走，浆糊和陈年香灰的味道一路跟着你。你不得不夹在他们中间。\n\n路过一个纸人时，你听到它压着嗓子说：“脚抬高些，别让脚跟沾地。纸人走路是不沾地的。你一脚踩实，活气就露出来了。”\n\n它的纸脸没有转过来，声音却轻得几乎散在风里：“早些年，我也是这么半夜回村奔丧的。一脚踩实，就再没走脱。”\n\n它顿了顿，糊着的嘴角动了一下，像替一整村人叹气：“这一队里，原先哪个不是活人。别学我们，站到天亮。”",
        "vibration": [
            50,
            100,
            50
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "saved_villager",
                "not": false,
                "text": "走出去很远，它又开了口，声音比刚才稳：“灵棚里那口棺，是你锁的？”\n\n你没应。\n\n“锁得好。”它说，“这家头一回，有人不肯拿别人的命来替。”"
            }
        ],
        "choices": [
            {
                "text": "把脚抬高",
                "next": "node26"
            }
        ]
    },

    "node26": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "村口槐树",
        "time": "04:18",
        "text": "你跑到了村口的老槐树下。树下站着一个人。是烧纸钱的那个。\n\n这次，他有脸了。是你的脸：一样的眉眼，一样磨破的衣领，连你额角那道小时候摔出来的疤都分毫不差。\n\n他没有朝你走，只是抬起手。你抬手，他也抬手；你喘气，他也喘气。你刚想张嘴，他的嘴唇却比你早动了半拍，用你的声音，替你把那句还没出口的话先说了出来：\n\n“从今天开始，你就是我，我就是你。”\n\n你僵在原地才发现，自己的嘴，从头到尾一下都没动过。",
        "vibration": [
            100,
            200,
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 1,
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "character": "img/char/mirror_player.jpg?v=309e0274",
        "characterEmotion": "ghost",
        "characterPosition": "right",
        "choices": [
            {
                "text": "质问他你是谁",
                "next": "node_dead10"
            },
            {
                "text": "顺着唢呐声拐上岔路",
                "next": "node9x_yinyang_road"
            },
            {
                "text": "被一只冰凉的手按住肩，拽向祠堂深处",
                "next": "node8x_hall"
            },
            {
                "text": "掏出那张带血的纸条",
                "next": "node26b",
                "requireItem": "note"
            }
        ]
    },

    "node_dead10": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "村口槐树",
        "time": "04:19",
        "text": "“你是谁？”\n\n他笑了。你脸上的肉也跟着往上扯。\n\n笑着笑着，他额角那道疤先裂开，皮从那儿往下淌，淌成灰白的纸浆。纸浆底下，还是你的脸。再往下淌，还是。\n\n“上一个。”他说，“上上一个。都是这么回村的，都在这棵树底下问过这句。”\n\n他抬起手。指头已经是纸了，又薄又干，贴上你的太阳穴，没有一点力气，却慢慢陷了进去。\n\n你想起母亲那条短信。九个字。你想不起是哪九个了。\n\n你想起自己的名字。前两个字还在。第三个，卡住了。",
        "vibration": [
            400,
            200,
            400
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_07_paper_replace.jpg?v=36b7f25b",
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "夺舍",
        "deathDesc": "问他是谁，等于承认你也不知道自己是谁。"
    },

    "node26b": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "村口槐树",
        "time": "04:19",
        "text": "你掏出那张纸条，翻到背面。\n\n月光底下，两行字都在发亮。母亲的字：别回头。四根指头抹的血字：别信写纸的人。\n\n另一个“你”盯着那两行字，往后退了一步。它的脸开始化，从额角那道疤开始，一点一点淌成纸浆。\n\n“写纸的人……”它的声音黏成一团，“连写纸的人，都在骗你。”\n\n它的嘴还在动。可这一回，没有比你快。",
        "vibration": [
            150,
            300,
            150
        ],
        "signal": 0,
        "battery": 1,
        "bgImage": "img/bg/ch01_village_gate_burning_paper.jpg?v=bfedf222",
        "hideCharacter": true,
        "choices": [
            {
                "text": "转身，一路跑回老宅",
                "next": "node28"
            }
        ]
    },

    "node8x_hall": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "祠堂",
        "time": "04:20",
        "text": "你没往回跑成。\n\n一只手从背后按住你的肩，凉得像浸过井水。你被推着往祠堂深处走，脚下的青砖一块块亮起红光，像有人提前铺好了喜路。\n\n祠堂正中摆着两把太师椅。左边那把空着。右边坐着新娘，红嫁衣，红盖头，纹丝不动。\n\n供桌后站着一个人，头上也蒙着一块红。是你母亲的身形，你母亲那件蓝布褂子。\n\n“你回来了。”她朝你招手，“时辰到了。先去后院打盆喜水，再盖盖头。规矩不能乱。”",
        "vibration": [
            80,
            160,
            80
        ],
        "signal": 0,
        "battery": 1,
        "character": "img/char/mother.jpg?v=99d90a6e",
        "characterEmotion": "fade",
        "characterPosition": "right",
        "choices": [
            {
                "text": "去后院打喜水",
                "next": "node8x_well_explore"
            },
            {
                "text": "不打水了，直接走到喜位前",
                "next": "node8x_veil"
            }
        ]
    },

    "node8x_well_explore": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "后院老井",
        "time": "04:21",
        "text": "后院只有一口老井。\n\n月亮不在天上，泡在井里，被水面晃成一张白脸。\n\n井台边搁着一只空木桶，井绳松松地垂进黑里。\n\n母亲在前头喊：打满一桶就回来，别往井里看。",
        "bgImage": "img/bg/ch08_well.jpg?v=9e3d87fe",
        "sceneImage": "img/bg/ch08_well.jpg?v=9e3d87fe",
        "sceneTitle": "后院老井",
        "sceneId": "ch08_backyard_well",
        "vibration": [
            30,
            60,
            30
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node8x_hall",
        "closeText": "回祠堂",
        "sceneHint": "先理井绳，挂上水桶，再摇辘轳打水。全程别低头。",
        "hotspots": [
            {
                "id": "well_rope",
                "label": "井绳",
                "x": 60,
                "y": 30,
                "w": 14,
                "h": 28,
                "once": true,
                "setFlags": {
                    "well_rope_ready": true
                },
                "toast": "你把缠死的井绳一圈圈理顺。",
                "closeup": true,
                "closeupTitle": "理顺的井绳",
                "closeupText": "井绳被水泡得发胀，每隔一段打着一个死结。\n\n你数到第七个结时，绳子自己抖了一下，像下面有人攥住了它。",
                "closeupImage": "img/item/item_red_string.jpg?v=883b684d"
            },
            {
                "id": "wood_bucket",
                "label": "木桶",
                "x": 20,
                "y": 55,
                "w": 18,
                "h": 20,
                "once": true,
                "requireFlag": "well_rope_ready",
                "lockedText": "井绳还乱成一团，先把绳子理顺再挂桶。",
                "setFlags": {
                    "bucket_hung": true
                },
                "closeup": true,
                "closeupTitle": "挂好的木桶",
                "closeupText": "木桶内壁结着一圈干掉的暗红，像很多年前装过别的东西。\n\n你把它挂上井绳。桶在井口轻轻打转，响得像新娘腕上的镯子。",
                "closeupImage": "img/item/item_incense.jpg?v=cf9be791"
            },
            {
                "id": "windlass_draw",
                "label": "辘轳",
                "x": 42,
                "y": 40,
                "w": 18,
                "h": 22,
                "once": true,
                "visibleWhenFlags": [
                    "bucket_hung"
                ],
                "item": "veil",
                "setFlags": {
                    "water_drawn": true
                },
                "toast": "桶升上来，水里泡着一块叠好的红绸。",
                "closeup": true,
                "closeupTitle": "打上来的喜水",
                "closeupText": "你死盯着自己的鞋尖摇辘轳，没敢抬眼。桶沉甸甸地升上来。\n\n水面上浮着一块叠得整整齐齐的红绸。是一方红盖头，边角还在滴水。\n\n针脚是母亲的。她给你缝过的每一颗扣子，都是这么收的线。",
                "closeupImage": "img/item/item_veil.jpg?v=97b2ee06"
            },
            {
                "id": "well_bottom_danger",
                "label": "井口",
                "x": 38,
                "y": 62,
                "w": 26,
                "h": 16,
                "deathNode": "node8x_dead_well",
                "closeup": true,
                "closeupTitle": "井底",
                "closeupText": "你忍不住探头往井里望了一眼。\n\n水面下不是石壁，是一张脸。肿胀发白，泡得没了五官，却分明在朝你笑。它穿着红嫁衣，正慢慢往上浮。",
                "closeupImage": "img/closeup/closeup_well_bottom.png?v=60b9b886"
            },
            {
                "id": "well_exit",
                "label": "回祠堂",
                "x": 78,
                "y": 22,
                "w": 18,
                "h": 30,
                "visibleWhenFlags": [
                    "water_drawn"
                ],
                "nextNode": "node8x_veil",
                "toast": "你拎着喜水和红盖头回祠堂。井里的水，又平了。"
            }
        ]
    },

    "node8x_dead_well": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "后院老井",
        "time": "04:22",
        "text": "你到底还是往井里看了。\n\n水底那张泡白的脸越浮越快，红嫁衣在黑水里散开，像血。她伸出手，从井里抓住了你探下来的脸。\n\n手很轻，却把你整个人往下拽。井口很小，你却一寸寸滑了进去，骨头咔咔地折叠。\n\n最后入水的，是你睁着的眼睛。井面合上，又泡着一轮惨白的月亮。",
        "vibration": [
            300,
            200,
            300,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/closeup/closeup_well_bottom.png?v=60b9b886",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "沉井",
        "deathDesc": "别往水里看。井底有人等了很久，等你低头。"
    },

    "node8x_veil": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "喜位",
        "time": "04:23",
        "text": "母亲把你按进左边那把太师椅。\n\n右边新娘的影子，正一寸一寸朝你这边歪过来。\n\n供桌上不知什么时候立着一面老镜子。镜面裂成蛛网，正对着你的椅子。\n\n母亲在你背后说：“盖头呢？没盖头，这拜不成。”\n\n她的声音有一点抖。像在拖。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 1,
        "sceneImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "hideCharacter": true,
        "exploreScene": true,
        "sceneId": "node8x_veil",
        "sceneTitle": "喜位",
        "returnNode": "node8x_hall",
        "closeText": "退出场景",
        "sceneHint": "别看那面镜子。能遮新娘脸的东西，也遮得住它。",
        "hotspots": [
            {
                "id": "broken_mirror",
                "label": "供桌上的破镜",
                "x": 26,
                "y": 44,
                "w": 11,
                "h": 20,
                "once": true,
                "requireItem": "veil",
                "lockedNext": "node8x_mirror",
                "consumeItem": "veil",
                "setFlags": {
                    "mirror_veiled": true
                },
                "puzzle": "pz_veil_mirror",
                "nextNode": "node8x_mother",
                "closeup": true,
                "closeupTitle": "蒙住的镜子",
                "closeupText": "你抖开那块湿盖头，蒙在镜面上。\n\n盖头底下，镜子轻轻磕了一下供桌，像里面有谁眨了一下眼，然后闭上了。\n\n背后，母亲长长出了一口气。",
                "closeupImage": "img/closeup/mirror_veiled.webp?v=b5b397f9"
            },
            {
                "id": "mother_behind",
                "label": "背后的母亲",
                "x": 76,
                "y": 25,
                "w": 14,
                "h": 45,
                "hiddenWhenFlags": [
                    "water_drawn"
                ],
                "nextNode": "node8x_well_explore",
                "toast": "她推着你往后院去：“先打喜水，再盖盖头。规矩不能乱。”"
            },
            {
                "id": "submit",
                "label": "闭上眼，等她来盖",
                "x": 44,
                "y": 58,
                "w": 13,
                "h": 22,
                "nextNode": "node_endB"
            }
        ]
    },

    "node8x_mirror": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "破镜",
        "time": "04:24",
        "text": "你的眼角瞟向那面裂镜。\n\n每一块碎片里都映着不同的东西。\n\n正中那块映出你自己。可你背后，紧贴着一个本不该在那儿的人。红嫁衣，红盖头，下巴抵在你肩窝里，盖头底下没有脸，只有湿漉漉的黑。\n\n她的手从背后绕过来，替你理喜服的领口。一下，又一下，理得很仔细。是新媳妇的手势。\n\n你没有回头。镜子里，她还在。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "vibration": [
            150,
            300,
            150,
            300
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "低下头，盯着自己的鞋尖",
                "next": "node8x_veil"
            },
            {
                "text": "抓起破镜，砸向新娘",
                "next": "node8x_dead_mirror"
            }
        ]
    },

    "node8x_dead_mirror": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "破镜",
        "time": "04:24",
        "text": "你抓起镜子，砸向新娘。\n\n镜子在半空碎成一阵冷光。每一片碎镜里都有一个红嫁衣的她。一百个她同时转头，看向一个砸镜子的你。\n\n镜子照过的东西，就被请了出来。\n\n她们从碎片里一齐迈出，红袖把你裹住。你最后看见的，是无数片碎镜里，自己已经蒙上了红盖头，正朝镜外的你温温地笑。",
        "vibration": [
            400,
            200,
            400
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_mirror_shards.webp?v=90d5306f",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "碎镜",
        "deathDesc": "镜面也算水。照出来的，砸不碎，只会被放出来。"
    },

    "node8x_mother": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "喜位",
        "time": "04:25",
        "text": "“娘。”\n\n她的手停在半空。过了很久，她自己掀开了头上那块红。\n\n底下没有脸。是一层湿透的纸浆，一道一道全是指甲抠出的沟。抠得最深的，是眼睛那两处。\n\n“想看看你，”她说，“抠了三年，没抠开。”\n\n“短信是我发的。我不想发，手不是我的了。纸条也是我写的。写那张的时候，手是我的。”\n\n她低下头。像你小时候考砸了，她不知道该先骂你，还是先给你盛饭。\n\n“你爹三十出头就走了。就在这堂屋，梁上。头天夜里，他还是坐末班车回来的。”\n\n“三年前娘老打电话催你相亲，八字都替你合好了。成了家的男人，她就不要了。你不接，娘就自己来了，想替你爹把这笔账接过来。可她要的是新郎。娘不是。”\n\n供桌那边，被盖头蒙住的破镜轻轻磕了一下。\n\n“你拉黑娘那天，娘在灶屋坐了一宿。”她说，“没怪你。”\n\n唢呐又响了一声，近了。她把一张写好名字的纸人往你手里塞，手抖得厉害。\n\n“快选。她快醒了。”",
        "vibration": [
            200,
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 0,
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "sceneImage": "img/closeup/mother_paperface.webp?v=b120defa",
        "character": "img/char/mother.jpg?v=99d90a6e",
        "characterEmotion": "fade",
        "characterPosition": "right",
        "choices": [
            {
                "text": "替她躺进喜位",
                "next": "node_endB"
            },
            {
                "text": "接过纸人，写下一个收短信的人",
                "next": "node_endG"
            },
            {
                "text": "握住她的手，这回不挣开",
                "next": "node8x_mother_free",
                "requireFlag": "mirror_veiled"
            }
        ]
    },

    "node8x_mother_free": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "喜位",
        "time": "04:26",
        "text": "她的手是纸，很轻。你握着，没有松。\n\n纸边割进掌心，有一点疼。你还是没有松。\n\n她低头看你们俩的手，看了很久。“傻娃，”她说，“疼娘做什么。”\n\n她没有抽回去。\n\n“娘不走，”她说，“娘陪你到天亮。”\n\n唢呐停了。供桌上那面破镜，在盖头底下再没动过。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "sceneImage": "img/closeup/hold_mother_hand.webp?v=386602b3",
        "character": "img/char/mother.jpg?v=99d90a6e",
        "characterEmotion": "normal",
        "characterPosition": "right",
        "setFlags": {
            "mother_freed": true
        },
        "choices": [
            {
                "text": "牵着她，回老宅",
                "next": "node28"
            }
        ]
    },

    "node9x_yinyang_road": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "阴阳路",
        "time": "04:20",
        "text": "你没往老宅跑，顺着那段唢呐声拐上了岔路。\n\n路两旁的野草齐到腰高，草尖上挂着一串串黄裱纸。天上那轮月亮是红的，像泡在水里太久的蛋黄，把整条路照成了暗红色。\n\n远处来了一支送亲的队伍。打头的两个纸扎童男童女，抬着一顶红轿，后面跟着一长串低着头的人。\n\n唢呐越吹越近。你数了数抬轿的人。八个，可只有七双脚沾着地。",
        "bgImage": "img/bg/ch08_yinyang_road.webp?v=017d9c9c",
        "vibration": [
            60,
            120,
            60
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "别回头，贴着草丛让队伍先过去",
                "next": "node9x_grave_explore"
            },
            {
                "text": "低头混进送亲的队伍里",
                "next": "node9x_join_procession"
            }
        ]
    },

    "node9x_join_procession": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "送亲队伍",
        "time": "04:21",
        "text": "你学着旁人的样子低下头，混进了送亲的队伍。\n\n没人抬头看你。可你越走越觉得不对。前后的人都没有影子，脚步声却整齐得像一个人在走。\n\n红轿的帘子被风掀开一条缝。轿里没有新娘，只有一件空荡荡的红嫁衣，正缓缓抬起袖子，朝你招手。\n\n抬轿的纸人忽然停下，齐声开口：\"新郎到了。换班吧。\"它们把轿杠往你肩上压。",
        "bgImage": "img/bg/ch09_graveyard.jpg?v=faab2df8",
        "vibration": [
            120,
            200,
            120
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "接过轿杠，替这支队伍抬下去",
                "next": "node_endB"
            },
            {
                "text": "甩开轿杠，往乱葬岗的灯光跑",
                "next": "node9x_bus_trap"
            }
        ]
    },

    "node9x_grave_explore": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "乱葬岗·新坟",
        "time": "04:21",
        "text": "送亲队伍从你面前淌过去，谁也没看你。\n\n队伍走远后，你发现自己站在一片乱葬岗里。最近的一座是新坟，土还是湿的，坟头插着白幡，烧了一半的纸钱在红月底下泛着暗红。\n\n坟前立着一块小小的名牌。你不想看，可你的脚自己往那边挪。",
        "bgImage": "img/bg/ch09_graveyard.jpg?v=faab2df8",
        "sceneImage": "img/bg/ch09_graveyard.jpg?v=faab2df8",
        "sceneTitle": "乱葬岗·新坟",
        "sceneId": "yinyang_graveyard",
        "vibration": [
            40,
            80,
            40
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node9x_yinyang_road",
        "closeText": "退回岔路",
        "sceneHint": "坟头有名牌，有纸扎童子。远处有一团灯光，坟后有三条岔路。",
        "hotspots": [
            {
                "id": "grave_name_tag",
                "label": "坟头名牌",
                "x": 40,
                "y": 55,
                "w": 22,
                "h": 18,
                "once": true,
                "closeup": true,
                "closeupTitle": "坟头的名牌",
                "closeupText": "名牌上是你的全名。最后一个字刮得很深，和那块旧孝牌一模一样。\n\n墨还没干。\n\n纸钱堆里压着半碗供水，水面映着你背后那顶红轿。你别开了眼。",
                "closeupImage": "img/closeup/closeup_new_grave.jpg?v=1e2cbad3"
            },
            {
                "id": "paper_children",
                "label": "纸扎童子",
                "x": 8,
                "y": 48,
                "w": 18,
                "h": 26,
                "closeup": true,
                "closeupTitle": "纸扎童男童女",
                "closeupText": "两个纸扎童子守在坟边。金童的牌子写着“引魂”，玉女的牌子写着“送嫁”。\n\n你一靠近，它们画着笑的脸齐齐转过来，纸做的嘴里漏出一句：“新人快上轿。”",
                "closeupImage": "img/closeup/closeup_new_grave.jpg?v=1e2cbad3"
            },
            {
                "id": "far_bus_light",
                "label": "远处的灯光",
                "x": 74,
                "y": 20,
                "w": 18,
                "h": 16,
                "nextNode": "node9x_bus_trap",
                "closeup": true,
                "closeupTitle": "岔路尽头的灯",
                "closeupText": "乱葬岗另一头停着一辆亮着灯的大巴。车门开着，司机低着头，一动不动。\n\n车牌和你来时坐的那班一模一样。它不该还在这里。",
                "closeupImage": "img/bg/ch09_graveyard.jpg?v=faab2df8"
            },
            {
                "id": "crossroads",
                "label": "坟后的三岔路",
                "x": 62,
                "y": 46,
                "w": 30,
                "h": 18,
                "requireItem": "puppet",
                "lockedText": "三条路一样宽，一样的黄土，一样挂着黄纸。你没有东西能替你认路。",
                "nextNode": "node9x_crossroads"
            }
        ]
    },

    "node9x_crossroads": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "三岔口",
        "time": "04:23",
        "text": "乱葬岗后头，路分成了三岔。\n\n三条路一样宽，一样的黄土，草尖上挂着一样的黄裱纸。\n\n背包里，纸偶又在拧动。\n\n红线那头连着族谱。它找的，是她的名字。",
        "bgImage": "img/bg/ch08_yinyang_road.webp?v=017d9c9c",
        "hideCharacter": true,
        "puzzle": "pz_puppet_road"
    },

    "node9x_bus_trap": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "末班车",
        "time": "04:25",
        "text": "你跌跌撞撞冲向那辆亮着灯的末班车。\n\n车门是开的。台阶上落了一层湿纸钱。司机低着头，帽檐压得很低，看不见脸。\n\n你刚踏上一只脚，司机仍低着头，喉咙里却爬出一个女人的声音。又软又慢，一个字一个字，念出了你的全名。\n\n\"……到站了。上车吧。\"\n\n它在等你应一声。",
        "bgImage": "img/bg/ch09_graveyard.jpg?v=faab2df8",
        "vibration": [
            150,
            300,
            150
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "答应一声“我在”，上车回城",
                "next": "node9x_dead_bus"
            },
            {
                "text": "咬住舌头不出声，转身硬闯进黑夜",
                "next": "node_endA"
            }
        ]
    },

    "node9x_dead_bus": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "末班车",
        "time": "04:26",
        "text": "车门在你身后合上。\n\n司机终于抬起头。帽檐底下是一张没有五官的白纸脸。\n\n车开了。乱葬岗飞快地往后退，红月亮缩成一盏长明灯，挂在车窗外头。\n\n你想下车。每一站的站牌上，写的都是你的名字。\n\n天亮后，村里人说末班车上少了一个乘客。最后一排的座位上只留着一双布鞋，还带着体温。",
        "bgImage": "img/bg/ch09_graveyard.jpg?v=faab2df8",
        "vibration": [
            200,
            400,
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_06_bus.jpg?v=db1a0194",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "失踪",
        "deathDesc": "阴阳路上，应一声，走错一步，都一样。这趟车再也不到站。"
    },

    "node_endB": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "祠堂",
        "time": "04:30",
        "text": "有人把红盖头盖在你头上。\n\n唢呐从很远的地方吹过来，又像是从你胸腔里响起来的。\n\n盖头掀开的时候，你坐在祠堂正中。身上是一套簇新的喜服，手腕上缠着红绳。红绳那头，系着右边那把太师椅。\n\n椅子上的人没有动。\n\n门外来了新的脚步声。那个人和你一样，以为自己只是回村奔丧。\n\n你想喊他别进来。可你张不开嘴。\n\n坐在喜位上的新郎，是不说话的。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 1,
        "endingCG": "img/ending/ending_b_replace.jpg?v=68af93e0",
        "fearScore": 78,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "B",
        "endingName": "替身"
    },

    "node_endG": {
        "chapter": "第八章：冥婚大典",
        "sceneName": "回城的车",
        "time": "05:40",
        "text": "你接过纸人。\n\n纸人的脸是空的。胸口留着一格，等你写名字。\n\n你不知道该写谁。口袋里的手机亮了一下。\n\n是一条正在发送的短信。收件人是个你不认识的号码。九个字：“爷爷走了，今晚务必回村。”\n\n你没有拦。\n\n你把那个号码，一笔一笔，写进纸人的胸口。\n\n纸人烧起来。火是红的。一个“囍”字卷起来，裂成两半，各自飘走了。\n\n你活下来了。\n\n天亮以后，你坐上回城的头班车。车上只有你一个人。你在最后一排坐下，坐垫被你捂得温温的。\n\n你知道十年以后，那个号码会收到什么。\n\n爷爷当年，大概也是这么坐着，看着窗外，一路没回头。",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 1,
        "endingCG": "img/ending/ending_g_hidden.jpg?v=49e89a59",
        "fearScore": 85,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "G",
        "endingName": "替罪羔羊"
    },

    "node28": {
        "chapter": "第九章：真相",
        "sceneName": "老宅堂屋",
        "time": "04:30",
        "text": "你跑回了老宅。\n\n堂屋里，长明灯又亮着。棺盖斜插在供桌脚下，没人扶起来。\n\n她坐在棺材边梳头。木梳一下一下从盖头底下穿过去，梳不到头发，只梳出水。\n\n“你跑了一圈，又回到这里。”她没有回头，“村口，祠堂，乱葬岗，都是这间屋。”\n\n她把梳子搁在棺沿上。“要么，你替我躺进去。要么，你找到那个真正该躺在这里的人。”",
        "vibration": [
            100,
            200,
            100
        ],
        "signal": 0,
        "battery": 1,
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "characterEmotion": "ghost",
        "characterPosition": "right",
        "characterFlicker": true,
        "condTexts": [
            {
                "flag": "mother_freed",
                "not": false,
                "text": "母亲的纸手还在你手里。她站在门槛外头，没有进来。\n\n这间屋，她一辈子都是低着头进的。"
            }
        ],
        "choices": [
            {
                "text": "问她，谁才是真正该躺在这里的人",
                "next": "node29"
            },
            {
                "text": "说你愿意替她",
                "next": "node_endB"
            },
            {
                "text": "冲向棺材",
                "next": "node_dead11"
            }
        ]
    },

    "node_dead11": {
        "chapter": "第九章：真相",
        "sceneName": "黑漆棺",
        "time": "04:31",
        "text": "你扑向棺材。她没有拦你，只侧过身，像主人家让客。\n\n你一脚踩空，跌了进去。\n\n棺里出奇地软。褥子是暖的，浮着新棉花晒过太阳的味道，底下压着一丝化不开的甜腐。\n\n盖子合上了。\n\n你听见她站起来。嫁衣上的金线一根一根绷紧，压襟的铜钱叮、叮地磕。她跨过门槛，鞋底滴着水，一步，一步，走远了。\n\n她没有回头。\n\n门外有人在用你的声音，喊一个女人的名字。喊得很亲。",
        "vibration": [
            200,
            400,
            200
        ],
        "signal": 0,
        "battery": 0,
        "deathCG": "img/death/death_11_coffin.webp?v=dc2ca22f",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "替嫁",
        "deathDesc": "有人进去，才能有人出来。她等这一下，等了七十年。"
    },

    "node29": {
        "chapter": "第九章：真相",
        "sceneName": "老宅堂屋",
        "time": "04:32",
        "text": "“你爷爷。”\n\n她的声音很轻。不像恨，像一句认了很多年的话，说出来已经不费力气了。\n\n“那年也是七月十五。他掀了我的盖头，看了一眼。夜里，棺材里躺的就换成了我。”\n\n“他说他还想活。想看儿子娶亲，看孙子出世。”\n\n她顿了顿。盖头底下那片空白，慢慢抬起来，对着你。\n\n“后来他把这条命推给你爹。你爹舍不得你，临了，又推给了你。”\n\n“三代人。我没等哪个新郎。我等一个肯停下来，看一眼我是谁的人。”\n\n“现在，只剩你了。”",
        "vibration": [
            200,
            100,
            200,
            100,
            200
        ],
        "signal": 0,
        "battery": 1,
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "characterEmotion": "ghost",
        "characterPosition": "right",
        "choices": [
            {
                "text": "闭上眼，想起爷爷临终前攥着你的手",
                "next": "node29b"
            },
            {
                "text": "先别急着开口，在堂屋布一座回魂法坛",
                "next": "node10x_ritual_prep"
            },
            {
                "text": "法坛已经布好了，回到坛前跪定",
                "next": "node10x_altar",
                "requireFlag": "altar_ready"
            }
        ]
    },

    "node29b": {
        "chapter": "第九章：真相",
        "sceneName": "回忆",
        "time": "04:33",
        "text": "你闭上眼。\n\n爷爷临终前攥着你的手，那只手只剩四根手指，凉得像浸过井水。他当时一直在说胡话，你没听清。现在那几句话，忽然清楚了。\n\n\"……我那年也是被人按进喜位的新郎。盖头一盖，唢呐一响，我才知道这门亲事，办的是我自己的丧。\"\n\n\"我怕。我太怕那口棺材了。所以我学了替死术，把命推给了你爹……你爹又推给了你。\"\n\n他的脸在你眼前一寸寸烂下去，中山装上沁出黑水，成了你在天花板上见过的那副模样。\n\n\"不是不疼你们。是这屋子，从来不许人疼。\"",
        "vibration": [
            120,
            200,
            120
        ],
        "signal": 0,
        "battery": 1,
        "bgImage": "img/bg/ch09_beam.webp?v=e5cf7133",
        "character": "img/char/grandpa_normal.jpg?v=58f58fd7",
        "characterEmotion": "fade",
        "characterPosition": "left",
        "choices": [
            {
                "text": "睁开眼，回到她面前",
                "next": "node29"
            }
        ]
    },

    "node10x_ritual_prep": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:35",
        "text": "你没有急着开口。\n\n念名字之前，得先把回魂的坛布好。爷爷做了一辈子白事，这一套你从小看到大。\n\n小棺摆在坛心。香点三炷。族谱对准她。\n\n长明灯的光只照到坛中央一小圈。圈外，红嫁衣在黑里轻轻晃。你低着头，一样一样摆，谁也没看谁。",
        "bgImage": "img/bg/ch10_ritual.jpg?v=25f44a54",
        "sceneImage": "img/bg/ch10_ritual.jpg?v=25f44a54",
        "sceneTitle": "回魂法坛",
        "sceneId": "soul_return_altar",
        "vibration": [
            40,
            80,
            40
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "exploreScene": true,
        "returnNode": "node29",
        "closeText": "退回女鬼面前",
        "sceneHint": "小棺摆坛心，骨符压小棺，三炷香要齐，族谱对准她。背包里选中道具后直接点场景。",
        "hotspots": [
            {
                "id": "altar_center",
                "label": "坛心",
                "x": 40,
                "y": 72,
                "w": 13,
                "h": 8,
                "once": true,
                "requireItem": "mini_coffin",
                "lockedText": "坛心空着一块，大小正好放下一口巴掌长的小棺。你手里没有。",
                "consumeItem": "mini_coffin",
                "setFlags": {
                    "coffin_placed": true
                },
                "closeup": true,
                "closeupTitle": "坛心的小棺",
                "closeupText": "你把写着你名字的小棺摆上坛心。\n\n棺里轻轻撞了一下，像在认地方。",
                "closeupImage": "img/item/mini_coffin.webp?v=0d6cbbb5"
            },
            {
                "id": "place_bone_charm",
                "label": "骨符与小棺",
                "x": 40,
                "y": 72,
                "w": 13,
                "h": 8,
                "once": true,
                "visibleWhenFlags": [
                    "coffin_placed"
                ],
                "requireItem": "bone_amulet",
                "lockedText": "小棺在坛心轻轻撞。空手按下去，只会被它含住。",
                "consumeItem": "bone_amulet",
                "setFlags": {
                    "charm_placed": true
                },
                "toast": "骨符压上小棺，撞动慢慢停了。",
                "closeup": true,
                "closeupTitle": "骨符压棺",
                "closeupText": "骨符压在写着你名字的小棺上。那个“替”字一点点吃进暗红。\n\n纸棺里的撞动慢下来，像被哄睡了。你听见极轻的一声：有人在棺里，跟着你的呼吸数数。",
                "closeupImage": "img/closeup/closeup_ritual_bone_charm.png?v=2a4d8538"
            },
            {
                "id": "incense_three",
                "label": "三炷香",
                "x": 46,
                "y": 52,
                "w": 8,
                "h": 19,
                "hiddenWhenFlags": [
                    "incense_set"
                ],
                "puzzle": "pz_incense",
                "closeup": true,
                "closeupTitle": "三炷香",
                "closeupText": "坛前插着三炷新香，长短不齐。\n\n你伸手去扶。香在你指缝里轻轻一沉，像有人从另一头往下按。",
                "closeupImage": "img/item/item_incense.jpg?v=cf9be791"
            },
            {
                "id": "genealogy_page",
                "label": "族谱缺页",
                "x": 29,
                "y": 72,
                "w": 10,
                "h": 8,
                "hiddenWhenFlags": [
                    "name_matched"
                ],
                "requireItem": "genealogy",
                "requireFlag": "knows_bride_name",
                "lockedText": "坛上空着一个对名字的位置。你手里没有她的那一页，连该对谁都不知道。",
                "puzzle": "pz_bazi",
                "closeup": true,
                "closeupTitle": "四张八字",
                "closeupText": "你把族谱摊在坛上，翻到血写的那一页。\n\n坛边压着四张红纸条，各写一行八字。墨都是新的。",
                "closeupImage": "img/closeup/closeup_genealogy_missing_page.png?v=2308b827"
            },
            {
                "id": "pick_blood_jade",
                "label": "坛角血玉",
                "x": 62,
                "y": 72,
                "w": 9,
                "h": 8,
                "once": true,
                "item": "blood_jade",
                "toast": "你拾起坛角那块血玉。它在你掌心里忽明忽暗。",
                "closeup": true,
                "closeupTitle": "忽明忽暗的血玉",
                "closeupText": "血玉冰凉，里面的红一下一下地涨，像有人在玉里呼吸。\n\n它亮，就是她近了。它暗，就是她退了。",
                "closeupImage": "img/item/item_blood_jade.jpg?v=c236a75d"
            },
            {
                "id": "pick_bell",
                "label": "供桌铜铃",
                "x": 30,
                "y": 62,
                "w": 9,
                "h": 9,
                "once": true,
                "item": "bell",
                "toast": "你拿起供桌边那只旧铜铃。它没动，自己响了一声。",
                "closeup": true,
                "closeupTitle": "自己响的铜铃",
                "closeupText": "铜铃旧得发黑，铃舌上缠着一圈头发。你没摇，它自己轻轻响了一声。\n\n铃声落下的地方，黑里很多张纸脸同时转过来，像在等一个新的、握铃的人。",
                "closeupImage": "img/item/item_bell.jpg?v=6e16f7d4"
            },
            {
                "id": "altar_water_bowl",
                "label": "坛前水碗",
                "x": 1,
                "y": 78,
                "w": 11,
                "h": 14,
                "closeup": true,
                "closeupTitle": "坛前那碗水",
                "closeupText": "坛前供着一碗清水。照理该映出你低头的脸。\n\n水面只映出红嫁衣的下摆，和一双没有脚的鞋。你移开了眼。",
                "closeupImage": "img/bg/ch08_well.jpg?v=9e3d87fe"
            },
            {
                "id": "kneel",
                "label": "在坛前跪定",
                "x": 38,
                "y": 86,
                "w": 24,
                "h": 12,
                "visibleWhenFlags": [
                    "incense_set"
                ],
                "setFlags": {
                    "altar_ready": true
                },
                "nextNode": "node10x_altar",
                "toast": "香齐了。你在坛前跪定。"
            }
        ]
    },

    "node10x_altar": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:40",
        "text": "你在坛前跪定。三炷香一样高，烟笔直往上，到你头顶，齐齐朝身后斜过去。\n\n坛对面那把椅子空着。她不在前头。\n\n烟斜向哪儿，她就在哪儿。\n\n长明灯一下一下地跳，像在替谁数着时辰。",
        "vibration": [
            60,
            120,
            60
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "念出她的名字",
                "next": "node10x_recite",
                "requireFlag": "name_matched"
            },
            {
                "text": "拿起骨符，在黄纸上写下自己的名字",
                "next": "node_endD",
                "requireFlag": "charm_placed"
            },
            {
                "text": "握紧那只铜铃",
                "next": "node10x_bell",
                "requireItem": "bell"
            },
            {
                "text": "先退开，回到她面前",
                "next": "node29"
            }
        ]
    },

    "node10x_recite": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:42",
        "text": "你张开嘴。\n\n第一个音出来，红烛矮了一截。香烟不再往你背后斜，齐齐转了个向，朝你嘴边聚过来，像急着把这个名字接过去。\n\n背后传来一声很轻的抽气。\n\n长明灯缩成一粒豆。再念下去，就收不回了。",
        "vibration": [
            50,
            100,
            50
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "一个音都不漏，念下去",
                "next": "node10x_turn"
            },
            {
                "text": "低头看掌心的血玉",
                "next": "node10x_jade",
                "requireItem": "blood_jade"
            },
            {
                "text": "名字卡在喉咙里，先咽回去",
                "next": "node10x_altar"
            }
        ]
    },

    "node10x_jade": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:43",
        "text": "你低头看血玉。\n\n玉里的红涨到最满，亮得像一颗心。\n\n玉面光滑，映出你低着的脸。你脸后面还有一张，正慢慢凑近。盖头底下一片空白，离你的后颈只剩一寸。\n\n它越亮，她越近。现在，它亮到头了。",
        "vibration": [
            120,
            200,
            120
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "移开眼，接着念",
                "next": "node10x_turn"
            },
            {
                "text": "盯着玉里那张脸",
                "next": "node_dead_bride"
            }
        ]
    },

    "node10x_bell": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:42",
        "text": "铜铃在你手里发凉。铃舌上缠着的头发，蹭着你的指缝。\n\n爷爷守灵的时候，手边也总搁着这么一只。你小时候问过，他说：铃响，门就归摇铃的人守。\n\n那时你只当是白事的规矩。\n\n黑里那些纸脸都转了过来，安安静静地等。等一个新的、握铃的人。\n\n背后也静了，像在让你自己选。",
        "vibration": [
            80,
            160,
            80
        ],
        "signal": 0,
        "battery": 1,
        "hideCharacter": true,
        "choices": [
            {
                "text": "摇响铜铃，接过这扇门",
                "next": "node_endG2",
                "requireItem": "bell"
            },
            {
                "text": "把铜铃轻轻放回供桌",
                "next": "node10x_altar"
            }
        ]
    },

    "node10x_turn": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:44",
        "text": "名字只剩最后一个音。\n\n你停住了。坛上三炷香烧得一样快，香灰积得一样长，谁也不肯先断。\n\n你想起爷爷捂住你嘴的那只手，想起你挣开的那只手，想起这屋里所有不肯回头的人。\n\n念完这个音，你得选。",
        "hideCharacter": true,
        "choices": [
            {
                "text": "念完，回头",
                "next": "node_endH",
                "requireFlags": [
                    "knows_bride_name",
                    "bride_face_seen",
                    "mother_freed",
                    "charm_placed"
                ],
                "elseNext": "node_dead_bride"
            },
            {
                "text": "念完，守着规矩，不回头",
                "next": "node_endE"
            }
        ]
    },

    "node_endD": {
        "chapter": "第十章：回魂",
        "sceneName": "回魂法坛",
        "time": "04:50",
        "text": "你把骨符从小棺上拿起来。小棺在坛心轻轻撞了一下，像在问你。\n\n你抽出一张黄裱纸，咬破指头，写自己的名字。一笔，一笔。最后一个字，你没有写歪。\n\n你把骨符压在名字上，连纸带符，按回小棺。\n\n火是从棺缝里自己起来的。不烫。\n\n地下的风停了。打谷场上，纸人们齐齐跪下。\n\n你觉得身上轻了。先是脚，再是手。皮肤一寸一寸绷紧，干了，薄了，变成纸的颜色。你没有挣。\n\n背后，她站了很久。\n\n“你替了。”她说，“和他们一样。”\n\n停了停，她又说：“只是这一回，替的是你自己。”\n\n天亮的时候，堂屋里多了一个纸新郎，眉眼齐全，没有点睛。他站在棺材边，替这家人守着。\n\n老宅头一回安静下来。安静得像爷爷糊的那些纸人，排成一排，在等谁来。",
        "vibration": [
            120,
            180,
            120
        ],
        "signal": 0,
        "battery": 1,
        "endingCG": "img/ending/ending_d_sacrifice.jpg?v=5dfeac47",
        "fearScore": 72,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "D",
        "endingName": "祭名"
    },

    "node_endE": {
        "chapter": "第十章：回魂",
        "sceneName": "老宅堂屋",
        "time": "05:30",
        "text": "最后一个音落下去。你没有回头。\n\n背后的人怔住了。很久，你听见她极轻地，把那几个字又念了一遍。\n\n“这是我的名字。”她的声音抖了，“好久……没人这么叫过我了。”\n\n红烛一盏一盏熄灭。地下那面墙上的结婚照，大概也在一张一张褪色。\n\n“原来我不是什么新娘。”她说，“我只是被你们家忘了的那个人。”\n\n有一阵很轻的风，从你背后绕到身前，停了一下。像道谢，又像道别。然后散了。\n\n天亮了。你一直没回头，所以你始终不知道，她长什么样。\n\n你走出堂屋。屋脊上，爷爷还倒挂在那儿，脸朝着天。喜位上那盏烛，还亮着。\n\n她走了。可这屋里，你只送走了一个人。",
        "vibration": [
            30,
            60,
            30
        ],
        "signal": 1,
        "battery": 1,
        "endingCG": "img/ending/ending_e_truth.jpg?v=333a7c16",
        "fearScore": 58,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "E",
        "endingName": "真名"
    },

    "node_endG2": {
        "chapter": "第十章：回魂",
        "sceneName": "老宅堂屋",
        "time": "05:20",
        "text": "你摇了铃。\n\n叮。\n\n所有纸脸同时低了下去，像一屋子人终于等到了主事的。\n\n背后那阵凉退开了。她回到棺里，自己合上了盖。她不急。门有人守了。\n\n天亮以后，你没走。\n\n你学会了扎纸。竹篾劈得匀，浆糊熬得稠。纸人和真人一般高，眉眼齐全，只是从不点眼珠。\n\n每到第十年的七月十五，你在堂屋坐一夜，等末班车进村。\n\n你也会有孙子。你会疼他。\n\n用这家人疼人的法子。",
        "endingCG": "img/ending/ending_g_keeper.webp?v=14baa150",
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "G",
        "endingName": "守门人"
    },

    "node_endH": {
        "chapter": "第十章：回魂",
        "sceneName": "村口",
        "time": "05:31",
        "text": "最后一个音落下，三炷香的灰同时断了。\n\n背后很静。你知道她在。纸条背面写着：别回头。你守了一整夜。\n\n你回头了。\n\n她有脸。眉毛淡，嘴唇薄，左眼角一颗小痣。盖头底下藏了七十年的，就是这样一张十八岁姑娘的脸。\n\n“莫绣禾。”你又叫了一遍。\n\n她看着你，像看一个迟到了很久的人。“他掀我盖头那天，也是这么看了一眼，”她说，“然后就走了。”\n\n族谱缺页上，爷爷那只四指血手印还缺着一根。你咬破左手小指，按在空着的那个位置上。\n\n疼。\n\n这屋子里，终于有人疼了一回。\n\n天亮了。屋脊上空了。族谱里，爷爷名字旁边空了七十年的那一格，墨自己洇开：原配，莫氏绣禾。你那块孝牌上，名字不见了，只剩木纹。\n\n村口停着头班车。司机回过头，脖子是直的。他左手只有四根指头，搭在方向盘上，看了你很久。\n\n“坐前头来。”他说。\n\n车开出去。你把母亲从黑名单里拉了出来。那九个字还在。\n\n你回了一个字：\n\n“到。”\n\n十年以后的七月十五，没有人再收到那条短信。老宅的门开着，堂屋里供着一块新牌位，上面的名字写得端端正正。\n\n这一家人，终于谁也不欠了。",
        "vibration": [
            30,
            60,
            30
        ],
        "signal": 0,
        "battery": 1,
        "endingCG": "img/ending/ending_h_perfect.jpg?v=dfee88dd",
        "fearScore": 96,
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "H",
        "endingName": "回魂"
    },

    "ng_01": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "纸扎铺",
        "time": "18:40",
        "text": "一九五八年，七月十五。天还没黑透，铺子里已经点了灯。\n\n你二十二岁，跟师父学扎纸人第六年。竹篾劈得匀，浆糊熬得稠，一张脸画下来，村里人说比活人还像活人。\n\n今天的活是莫家的。莫家闺女绣禾，十八岁，上个月没的。她爹托人来说，要配一门亲，纸的就行。\n\n师父把一沓白纸拍在你面前。“脸要活人的。”他说，“这家规矩，不认画出来的。”\n\n墙上挂着一面小镜子。镜子里那张脸，二十二岁，黑头发，眼睛有点凹。\n\n你拿起笔。",
        "bgImage": "img/ending/ending_g_keeper.webp?v=14baa150",
        "sceneImage": "img/ending/ending_g_keeper.webp?v=14baa150",
        "hideCharacter": true,
        "choices": [
            {
                "text": "照着镜子，画自己的脸",
                "next": "ng_02",
                "setFlags": {
                    "ng_own_face": true
                }
            },
            {
                "text": "画师父的脸",
                "next": "ng_01b"
            },
            {
                "text": "画完了，顺手给它点上眼睛",
                "next": "ng_dead2"
            }
        ]
    },

    "ng_01b": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "纸扎铺",
        "time": "18:50",
        "text": "你画了师父的脸。\n\n师父看了一眼，没说话。他走过来，一巴掌把那张脸撕了下来，纸屑落在你手背上，像一片一片指甲。\n\n“你当我没想过。”他把镜子摘下来，塞进你怀里，“这屋子只认年轻的。老的躺进去，它嫌。”\n\n他的左手扶着门框。你头一回注意到，那只手只有四根手指。\n\n你重新铺纸。镜子里那张脸，这回你看得很仔细。",
        "bgImage": "img/ending/ending_g_keeper.webp?v=14baa150",
        "hideCharacter": true,
        "choices": [
            {
                "text": "照着镜子，画自己的脸",
                "next": "ng_02",
                "setFlags": {
                    "ng_own_face": true
                }
            }
        ]
    },

    "ng_dead2": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "纸扎铺",
        "time": "18:55",
        "text": "你蘸了墨，在它眼眶里各点了一下。\n\n很小的两个点。点完你就后悔了。\n\n纸新郎的头慢慢抬起来。它的脸是你的脸，眼睛是你刚给的眼睛。它看了你一会儿，像在对镜子。\n\n然后它笑了。你没有笑。\n\n师父在门口站着，没有进来。他说：“我说过不点睛。”声音很轻，像在跟一个已经不在的人说话。\n\n纸新郎走出去了，走得很稳。它替你去了莫家，坐了喜位，掀了盖头。\n\n天亮以后，村里人见到你，都叫你那个名字。你照镜子。镜子里是一张白纸，眼眶里两个小点，不眨。",
        "bgImage": "img/ending/ending_g_keeper.webp?v=14baa150",
        "deathCG": "img/death/death_07_paper_replace.jpg?v=36b7f25b",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "点睛",
        "deathDesc": "纸人不点眼，是怕它认路。你给它点了，它第一个认的，是你。"
    },

    "ng_02": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "老宅堂屋",
        "time": "19:30",
        "text": "你抱着纸新郎进了莫家堂屋。\n\n黑漆棺材停在当中，棺盖没合严，露一道缝。供桌上三炷香，一盏长明灯，灯火是绿的。\n\n她坐在棺材边，穿红嫁衣，盖头盖到肩膀。她不动。屋里的老人也不动。他们排在墙根，一个挨一个，看着你怀里的纸人。\n\n莫家老爷子走过来，伸手摸了摸纸新郎的脸。摸得很慢，从眉毛摸到下巴。\n\n“像。”他说。\n\n他没有看纸人。他在看你。",
        "bgImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "sceneImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "ng_own_face",
                "not": false,
                "text": "纸新郎的脸贴着你的脸。你画它的时候觉得像，现在抱着它，觉得它比你更像你。"
            }
        ],
        "choices": [
            {
                "text": "把纸新郎立到喜位上",
                "next": "ng_03"
            },
            {
                "text": "先把这屋子看清楚",
                "next": "ng_02_explore"
            }
        ]
    },

    "ng_02_explore": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "老宅堂屋",
        "time": "19:35",
        "text": "你把纸新郎靠在门边，自己往屋里走了两步。\n\n没人拦你。那些老人的眼睛跟着你转，像一排挂在墙上的旧照片。",
        "bgImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "sceneImage": "img/bg/ch02_hall_explore_v2.jpg?v=76a8abba",
        "hideCharacter": true,
        "exploreScene": true,
        "sceneId": "ng_02_explore",
        "sceneTitle": "老宅堂屋",
        "returnNode": "ng_02",
        "closeText": "退出场景",
        "sceneHint": "点屋里的东西看一看。老人们不会拦你，他们只是看。",
        "hotspots": [
            {
                "id": "ng_water_bowl",
                "label": "供桌水碗",
                "x": 57,
                "y": 62,
                "w": 18,
                "h": 9,
                "closeup": true,
                "closeupTitle": "水碗",
                "closeupText": "供桌上一碗清水，照理该映出你低头的脸。\n\n水里有一张脸，是你的，眼睛却是闭着的。你眨了眨眼，它没眨。",
                "closeupImage": "img/closeup/water_bowl_handprint.webp?v=09fb301c"
            },
            {
                "id": "ng_genealogy",
                "label": "桌上的族谱",
                "x": 22,
                "y": 58,
                "w": 16,
                "h": 10,
                "once": true,
                "setFlags": {
                    "ng_saw_name": true
                },
                "closeup": true,
                "closeupTitle": "莫家的族谱",
                "closeupText": "族谱摊在桌上，翻到最新的一页。\n\n“莫氏绣禾”四个字，被人拿墨涂了。墨还没干透，底下的字透出来，一笔一笔，像还在挣。\n\n旁边空着一格，笔搁在格子边上。等一个名字。",
                "closeupImage": "img/closeup/closeup_genealogy_missing_page.png?v=2308b827"
            },
            {
                "id": "ng_lamp",
                "label": "长明灯",
                "x": 57,
                "y": 30,
                "w": 9,
                "h": 11,
                "closeup": true,
                "closeupTitle": "绿火的长明灯",
                "closeupText": "灯火是绿的。灯油浮着一根黑头发，很长。\n\n火苗冲你这边斜过来，像有人在灯后头吹气。你退了一步，它跟了一步。",
                "closeupImage": "img/closeup/closeup_spirit_lamp_dim.jpg?v=16ebe7b5"
            },
            {
                "id": "ng_tablet",
                "label": "祖宗牌位",
                "x": 39,
                "y": 18,
                "w": 19,
                "h": 23,
                "closeup": true,
                "closeupTitle": "歪着的牌位",
                "closeupText": "牌位歪着。最前头那一块是新的，木头还白，没刻字。\n\n你伸手想扶正。木头是温的，像刚从谁手里接过来。",
                "closeupImage": "img/closeup/tablet_crooked.webp?v=4a30dacf"
            },
            {
                "id": "ng_coffin",
                "label": "黑漆棺",
                "x": 34,
                "y": 46,
                "w": 30,
                "h": 12,
                "closeup": true,
                "closeupTitle": "没合严的棺盖",
                "closeupText": "棺盖留着一道缝。缝里黑。\n\n你凑近看。里面铺着褥子，枕头是新的。有人在里面轻轻翻了个身。\n\n她在棺材外头坐着。那里面躺的，是谁。",
                "closeupImage": "img/closeup/closeup_coffin_sealed_name_tag.jpg?v=fc2a0023"
            },
            {
                "id": "ng_paper_groom",
                "label": "门边的纸新郎",
                "x": 76,
                "y": 22,
                "w": 21,
                "h": 36,
                "closeup": true,
                "closeupTitle": "门边的纸新郎",
                "closeupText": "它靠在门边，脸冲着你。\n\n你画的眉毛，你画的嘴。你没点眼睛，可它的眼眶看起来一点也不空。\n\n它比刚才又像你了一点。",
                "closeupImage": "img/item/item_puppet.jpg?v=ad2546a9"
            }
        ]
    },

    "ng_03": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "喜位",
        "time": "20:30",
        "text": "唢呐响了。不知道从哪儿吹的，村里没人会这个调子。\n\n你把纸新郎往喜位上立。莫家老爷子按住你的手。\n\n“纸的替不了。”他说，“得活的坐一夜。”\n\n墙根那排老人一起站起来。他们的手很凉，很多，从你肩膀、胳膊、后腰一齐摁下去。师父就站在门口，低着头，没有看你。\n\n他们把你按进喜位。红绸从你头顶罩下来。\n\n纸新郎被立在你旁边，和你并排。它的脸贴着你的脸。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "sceneImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "hideCharacter": true,
        "choices": [
            {
                "text": "挣开",
                "next": "ng_dead1"
            },
            {
                "text": "坐下。坐一夜而已",
                "next": "ng_04"
            }
        ]
    },

    "ng_dead1": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "喜位",
        "time": "20:31",
        "text": "你挣。\n\n那些手没有用力，只是不松。你挣一下，它们就多一只。\n\n红绸裹到你脸上。里面是浆糊的味道，是你铺子里的浆糊。\n\n你还在挣，忽然觉得胳膊轻了。再挣，腿也轻了。你低头，看见自己的袖子瘪下去，像里头没有东西。\n\n唢呐停了。有人把你从喜位上抱起来，很轻，一只手就够。\n\n他们把你立到纸新郎原来的位置。纸新郎坐进了你的喜位。它的眼眶里，不知什么时候有了眼睛。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "deathCG": "img/death/death_12_wedding.jpg?v=b65bff29",
        "hideCharacter": true,
        "isDeath": true,
        "deathName": "喜服",
        "deathDesc": "这家人请你，是客气。按你，是规矩。你挣，就不算人了。"
    },

    "ng_04": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "喜位",
        "time": "23:00",
        "text": "唢呐早停了。老人们一个一个退出去，门从外头带上。\n\n屋里剩你，剩她，剩那盏绿火。\n\n盖头底下，她说话了。声音很轻，像隔着一层纸。\n\n“你是扎纸人的。”\n\n“你画了我的新郎。”\n\n“你看我一眼。就一眼。我想知道，你画我的时候，画的是谁。”",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "ng_saw_name",
                "not": false,
                "text": "你想起族谱上那四个被涂掉的字。她没有名字了。她只剩这一张盖头底下的脸。"
            }
        ],
        "choices": [
            {
                "text": "掀开盖头",
                "next": "ng_05",
                "setFlags": {
                    "ng_saw_face": true
                }
            },
            {
                "text": "守规矩，不掀",
                "next": "ng_04b"
            }
        ]
    },

    "ng_04b": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "喜位",
        "time": "23:10",
        "text": "你没有动。\n\n她等了很久。久到绿火矮下去一截。\n\n“好。”她说，“那你跟他们一样。”\n\n盖头底下传来一点声音，像在笑，又像在收拾什么。\n\n你忽然很困。困得像有人从后面按住你的眼皮。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "hideCharacter": true,
        "choices": [
            {
                "text": "撑不住了",
                "next": "ng_06"
            }
        ]
    },

    "ng_05": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "喜位",
        "time": "23:10",
        "text": "你掀开了盖头。\n\n她有脸。眉毛淡，嘴唇薄，左眼角一颗小痣。十八岁的姑娘，脸上没有一点死相，只是很白。\n\n她看着你。眼睛里有点亮，像很久没人叫过她，忽然被叫了一声。\n\n“你画我的时候，”她说，“画的是你自己。”\n\n她伸手，把你的盖头放下来。“记住我这张脸。后面的人，都不会再看了。”\n\n你忽然很困。困得像有人从后面按住你的眼皮。",
        "bgImage": "img/bg/ch05_shrine.jpg?v=0b9c7ba4",
        "sceneImage": "img/closeup/veil_embroidery_wide.webp?v=1ad2647e",
        "character": "img/char/bride_paper.jpg?v=284ebd86",
        "hideCharacter": true,
        "choices": [
            {
                "text": "撑不住了",
                "next": "ng_06"
            }
        ]
    },

    "ng_06": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "黑漆棺",
        "time": "00:00",
        "text": "你醒了。\n\n背后是褥子，头底下是新枕头。你伸手，手碰到木头。四面都是木头。\n\n棺盖合着。\n\n外面有人说话，是师父。他贴着棺盖，一个字一个字地说：\n\n“这家的规矩，新郎得躺一夜。躺到天亮，就是她的了。”\n\n“要么你躺着。要么，你找一个人替。”\n\n他的手指在棺盖上敲了四下。只有四下。",
        "bgImage": "img/bg/ch05_fog_hall.webp?v=1a3b6996",
        "sceneImage": "img/death/death_11_coffin.webp?v=dc2ca22f",
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "ng_saw_face",
                "not": false,
                "text": "黑里，你还看得见她那张脸。眼角一颗痣。她说后面的人都不会再看了。你是第一个看的，也是第一个躺进来的。"
            }
        ],
        "choices": [
            {
                "text": "拍棺盖，喊师父",
                "next": "ng_07"
            },
            {
                "text": "躺着。躺到天亮",
                "next": "ng_endY"
            }
        ]
    },

    "ng_07": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "老宅堂屋",
        "time": "00:30",
        "text": "棺盖掀开了。师父把你拽出来，拽得很急，像怕里面的东西改主意。\n\n他从怀里摸出一块骨头，巴掌长，磨得发白，上头刻着一个“替”字。\n\n“替死术。”他说，“不是不死。是把死往后推。”\n\n“推出去的活，接下的死。推一回，赔一根手指。推到没手指，就得自己躺。”\n\n他摊开左手。四根。\n\n“我推过一回。”他说，“推给我徒弟。”\n\n他看着你，眼睛里什么都没有。“你要推，就推给往后的人。你儿子，你孙子。他们还没生，不会怪你。”\n\n砧板上搁着一把切纸的刀。",
        "bgImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "sceneImage": "img/closeup/closeup_ritual_bone_charm.png?v=2a4d8538",
        "hideCharacter": true,
        "item": "bone_amulet",
        "choices": [
            {
                "text": "砍下一根手指，接过骨符",
                "next": "ng_08",
                "setFlags": {
                    "ng_pushed": true
                }
            },
            {
                "text": "把刀推回去",
                "next": "ng_endY"
            }
        ]
    },

    "ng_08": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "回忆",
        "time": "23:59",
        "text": "二零零八年，七月十五。\n\n你七十岁。左手四根手指，扎了一辈子纸人，一个都没点过睛。\n\n儿子三十出头，在城里开车。今晚他坐末班车回来，一进门就说饿。他脖子有点歪，小时候摔的。\n\n你给他盛了饭。饭里竖着筷子，你没拔。\n\n五十年了。那块骨头在你怀里一直是温的，今晚忽然凉了。你知道，债到期了。\n\n儿子吃完饭，在堂屋梁下站着，看长明灯。\n\n你摸着怀里的骨符。",
        "bgImage": "img/bg/ch09_beam.webp?v=e5cf7133",
        "sceneImage": "img/bg/ch09_beam.webp?v=e5cf7133",
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "ng_pushed",
                "not": false,
                "text": "你左手四根手指。砍下去那天疼了三个月，后来不疼了，只是扎纸的时候总觉得少捏住一点什么。"
            },
            {
                "flag": "ng_saw_face",
                "not": false,
                "text": "你想起她那张脸。五十年了，没人再看过。她在等的，一直不是新郎。"
            }
        ],
        "choices": [
            {
                "text": "把骨符塞进儿子手里",
                "next": "ng_09",
                "setFlags": {
                    "ng_pushed_son": true
                }
            },
            {
                "text": "自己躺进去，替他",
                "next": "ng_08b"
            }
        ]
    },

    "ng_08b": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "老宅堂屋",
        "time": "00:10",
        "text": "你把骨符放回供桌，自己掀开棺盖，躺了进去。\n\n褥子是旧的，还是五十年前那一床。\n\n你躺了一夜。天亮的时候，你从棺材里坐起来，身上一点事没有。\n\n堂屋梁上，儿子吊在那儿，脚离地一尺。中山装上沁着黑水，往下滴。\n\n这屋子不要老的。它嫌。\n\n骨符还在供桌上。它等的不是你躺，是你推。",
        "bgImage": "img/bg/ch09_beam.webp?v=e5cf7133",
        "hideCharacter": true,
        "choices": [
            {
                "text": "把骨符收回怀里",
                "next": "ng_09",
                "setFlags": {
                    "ng_pushed_son": true
                }
            }
        ]
    },

    "ng_09": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "回忆",
        "time": "05:00",
        "text": "二零二八年。你快九十了。\n\n床边坐着孙子，二十五岁，黑头发，眼睛有点凹。他攥着你的手。你的手只剩四根手指，凉得像浸过井水。\n\n你有很多话想说。\n\n想说那年你也是被按进喜位的新郎。想说你太怕那口棺材了。想说你把命推给了他爹，他爹又推给了他。\n\n想说不是不疼。是这屋子，从来不许人疼。\n\n可话到嘴边，都成了胡话。",
        "bgImage": "img/bg/ch02_living_room.jpg?v=f0aa3c8a",
        "character": "img/char/grandpa_normal.jpg?v=58f58fd7",
        "hideCharacter": true,
        "condTexts": [
            {
                "flag": "ng_pushed_son",
                "not": false,
                "text": "他爹走的第二天，你在堂屋坐了一夜。骨符在怀里又温了。它认下一个了。"
            },
            {
                "flag": "ng_saw_face",
                "not": false,
                "text": "你最想说的是她的脸。眉毛淡，嘴唇薄，左眼角一颗痣。七十年了，只有你看过。你想让他也看一眼。"
            }
        ],
        "choices": [
            {
                "text": "把话说清楚",
                "next": "ng_endZ"
            },
            {
                "text": "说不清了。攥紧他的手",
                "next": "ng_endZ"
            }
        ]
    },

    "ng_endZ": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "末班车",
        "time": "23:59",
        "text": "你没说清。你的手松了。\n\n孙子在床边坐了很久。然后他起身，去赶车。回老宅守灵，是规矩。\n\n末班车十一点五十九分进村。车上就他一个人。司机脖子歪着，左手搭在方向盘上，四根手指。\n\n他低头看手机。车窗外，一盏绿火跟着车跑。\n\n你在很远的地方看着这一切，像看一张你自己画的纸人。眉眼齐全，没有点睛。\n\n你想喊他，让他看她一眼。就一眼。\n\n可你已经是纸的了。纸的，喊不出声。\n\n车停了。他下了车。",
        "endingCG": "img/ending/ending_z_paper.webp?v=14b681f5",
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "Z",
        "endingName": "第一个新郎",
        "condTexts": [
            {
                "flag": "ng_saw_face",
                "not": false,
                "text": "她站在村口槐树底下，盖头盖到肩膀。七十年了，她还在等一个肯看的人。\n\n这一回，她等到的是你孙子。你画过他的脸。"
            }
        ]
    },

    "ng_endY": {
        "chapter": "二周目：第一个新郎",
        "sceneName": "黑漆棺",
        "time": "05:30",
        "text": "你躺着。\n\n棺盖外头，师父敲了很久。后来不敲了。再后来，天亮了。\n\n你没有儿子。没有孙子。没有二零零八年的梁，没有二零二八年的末班车。\n\n她坐在棺材边，梳了一夜的头。天亮的时候，她把梳子搁下，把盖头掀开一角，看了你一眼。\n\n“谢谢。”她说。\n\n这屋子安静了七十年。\n\n七十年后的七月十五，十一点五十九分，末班车还是进了村。车上坐着一个年轻人，低着头看手机，眼睛有点凹。\n\n你不认识他。\n\n这屋子，总能找到新郎。",
        "endingCG": "img/bg/ch05_fog_hall.webp?v=1a3b6996",
        "hideCharacter": true,
        "isEnding": true,
        "endingCode": "Y",
        "endingName": "不推"
    }
};

// 道具定义
const ITEMS = {
    "note": {
        "name": "带血的纸条",
        "desc": "母亲写的守灵规矩。正面三条，背面“别回头”，最底下一行四根指头抹的血字：别信写纸的人。",
        "image": "img/item/item_note.jpg?v=8bd0cfe7",
        "inspectImage": "img/closeup/closeup_blood_note.jpg?v=df4c1d60"
    },
    "lamp_oil": {
        "name": "半盏灯油",
        "desc": "抽屉里找到的旧灯油，油面曾浮着一根黑发。",
        "image": "img/item/item_incense.jpg?v=cf9be791",
        "inspectImage": "img/closeup/closeup_spirit_lamp_dim.jpg?v=16ebe7b5"
    },
    "red_string": {
        "name": "红绳",
        "desc": "从香灰里拈出的红绳，绳结处粘着黄纸屑。",
        "image": "img/item/item_red_string.jpg?v=883b684d",
        "inspectImage": "img/closeup/closeup_altar_ash_red_string.jpg?v=10e2f32b"
    },
    "yellow_paper": {
        "name": "黄裱纸",
        "desc": "供桌底下那叠，爷爷不用尺子裁的。可以盖水碗，也可以缠上红绳做符。供桌底下还能再抽。",
        "image": "img/item/yellow_paper.webp?v=9a220197",
        "combine": {
            "with": [
                "red_string"
            ],
            "result": "paper_talisman",
            "message": "你用红绳把黄纸一圈圈缠紧，缠成一道镇棺符。"
        }
    },
    "paper_talisman": {
        "name": "镇棺符",
        "desc": "黄裱纸缠红绳做成的符，能压住棺缝。",
        "image": "img/item/item_peach_talisman.jpg?v=506d9dbf"
    },
    "name_tag": {
        "name": "旧孝牌",
        "desc": "棺底滑出的旧孝牌，背面刻着你的全名，最后一个字刮得很深。",
        "image": "img/item/item_key.jpg?v=b5f50b99",
        "inspectImage": "img/closeup/closeup_coffin_sealed_name_tag.jpg?v=fc2a0023"
    },
    "damp_match": {
        "name": "受潮的火柴",
        "desc": "纸盒泡软了，刮一下掉半根火柴头。点不着。",
        "image": "img/item/item_match.jpg?v=61868ce6"
    },
    "match": {
        "name": "洋火",
        "desc": "在灶膛余火上烘干的火柴。还能用。",
        "image": "img/item/item_match.jpg?v=61868ce6"
    },
    "incense_ash": {
        "name": "一把香灰",
        "desc": "从供桌上抓的，还温着。香灰盖得住墨。",
        "image": "img/item/incense_ash.webp?v=eac501c3",
        "inspectImage": "img/closeup/closeup_altar_ash_red_string.jpg?v=10e2f32b"
    },
    "map": {
        "name": "爷爷画的图",
        "desc": "黄纸上手绘的灶台、水缸和水缸后面的暗门，横平竖直，是爷爷的笔法。",
        "image": "img/item/item_genealogy.jpg?v=5dcc9aad"
    },
    "incense": {
        "name": "香",
        "desc": "神龛香筒里抽出的三炷新香，可以引火给长明灯续上。",
        "image": "img/item/item_incense.jpg?v=cf9be791"
    },
    "bone_amulet": {
        "name": "骨符",
        "desc": "血池白骨攥着的护符。符纹正中一个字：替。",
        "image": "img/item/bone_charm.webp?v=b4739906",
        "inspectImage": "img/closeup/closeup_ritual_bone_charm.png?v=2a4d8538"
    },
    "key": {
        "name": "生锈钥匙",
        "desc": "密室族谱上压着的钥匙，柄上布条写着“灵棚”。",
        "image": "img/item/item_key.jpg?v=b5f50b99"
    },
    "genealogy": {
        "name": "族谱",
        "desc": "密室里那本。最后一页是血写的：莫氏绣禾，庚辰 甲申 丁卯 丙午。底下一只四指血手印，小指的位置空着。",
        "image": "img/item/item_genealogy.jpg?v=5dcc9aad",
        "inspectImage": "img/closeup/closeup_genealogy_missing_page.png?v=2308b827"
    },
    "mini_coffin": {
        "name": "纸棺材",
        "desc": "婚床底下那口巴掌长的小棺，标签上是你的名字，日期是今晚。里面有东西在轻轻动。",
        "image": "img/item/mini_coffin.webp?v=0d6cbbb5"
    },
    "photo": {
        "name": "结婚照碎片",
        "desc": "从戊戌年那张结婚照背面揭下来的，是新娘的左半张脸，眼角一颗小痣。另外半张不知去了哪儿。",
        "image": "img/item/item_photo.jpg?v=8ec4f0aa",
        "combine": {
            "with": [
                "old_photo"
            ],
            "result": "old_photo",
            "setFlags": {
                "bride_face_seen": true
            },
            "message": "你把碎片按到遗照上。香灰糊住的左半张，正好被碎片补上。眉毛淡，嘴唇薄，左眼角一颗小痣。是个十八岁的姑娘。"
        }
    },
    "old_photo": {
        "name": "爷爷的遗照",
        "desc": "灵棚里取下的黑白遗照。爷爷在笑，身后多了个穿红嫁衣的女人，左半张脸被香灰糊住。拼上碎片后，能看清她整张脸。",
        "image": "img/item/item_old_photo.jpg?v=aaafecb1",
        "inspectImage": "img/closeup/portrait_bride_behind.webp?v=4fdbb072"
    },
    "puppet": {
        "name": "会转头的纸偶",
        "desc": "巴掌大的纸偶，脖子缠着红线。你盯着它它不动，一移开眼它就转过头来。红线那头连着族谱。",
        "image": "img/item/item_puppet.jpg?v=ad2546a9",
        "inspectImage": "img/item/item_puppet.jpg?v=ad2546a9"
    },
    "veil": {
        "name": "红盖头",
        "desc": "从喜水里捞起的红盖头，针脚是母亲的，边角还在滴水。",
        "image": "img/item/item_veil.jpg?v=97b2ee06"
    },
    "blood_jade": {
        "name": "血玉",
        "desc": "坛角拾到的血玉，越亮她越近。玉面能照人。",
        "image": "img/item/item_blood_jade.jpg?v=c236a75d"
    },
    "bell": {
        "name": "铜铃",
        "desc": "供桌上的旧铜铃，铃舌缠着头发。守门人握的就是它，摇响便是接班。",
        "image": "img/item/item_bell.jpg?v=6e16f7d4"
    }
};

// 谜题玩法(数据驱动: 引擎按 kind 选面板)
const PUZZLES = {
    "pz_bus_bell": {
        "kind": "timing",
        "title": "下车铃",
        "windowMs": 3000,
        "leadMinMs": 3500,
        "leadMaxMs": 6500,
        "idleText": "玻璃里映着车前方的路。黑的，看不到头。",
        "treeText": "反光里，路边立起一棵老槐树，枝杈伸到路中间。",
        "earlyText": "铃不响。司机的四根手指在方向盘上敲了一下。你还可以再等。",
        "pressText": "按下车铃",
        "node": "node01_explore",
        "hotspot": "bus_bell",
        "answerText": "盯着车窗反光，槐树出现在反光里的那一刻按下车铃",
        "successNext": "node04",
        "successText": "铃响了一声。车没有刹，前门先开了一条细缝。冷风灌进来，带着槐花烂在泥里的甜味。你跳了下去。",
        "failNext": "node_dead_wild"
    },
    "pz_damp_match": {
        "kind": "item",
        "node": "node11",
        "hotspot": "stove",
        "answerText": "背包选中受潮火柴，点灶膛",
        "successItem": "match",
        "successText": "你把火柴盒贴着那点红，烘了好一会儿。纸盒慢慢硬回来。是烧倒头饭剩下的余火，捂了一整夜，没灭。你刮了一根。嚓。着了。"
    },
    "pz_wipe_eyes": {
        "kind": "steps",
        "counter": "paper_blank",
        "limit": 3,
        "failNext": "node_dead4",
        "stepText": [
            "沙。纸脚往前擦了一步。（第一步）",
            "沙。纸脚又往前擦了一步。它们离你只剩一步了。（第二步）"
        ],
        "node": "node14",
        "answerText": "第三个、第八个纸人（棺材两边那两个）；手里先攥着香灰",
        "successFlags": [
            "eye3_wiped",
            "eye8_wiped"
        ]
    },
    "pz_stone_door": {
        "kind": "code",
        "title": "石门",
        "length": 4,
        "maxFails": 2,
        "firstFailText": "毒针从门缝里射出，擦着颈侧钉进岩壁，只留一道血口。石格咔咔地退回原位——还能再按一次。",
        "node": "node_puzzle_door",
        "answerText": "0922",
        "successNext": "node_puzzle_success",
        "failNext": "node_puzzle_fail",
        "answer": "0922"
    },
    "pz_groom": {
        "kind": "item",
        "node": "node23",
        "hotspot": "groom_four",
        "answerText": "角落那张背面写着三月初三的照片，左手四指；取下背面的结婚照碎片，之后在背包里把碎片拼到爷爷的遗照上",
        "successItem": "photo",
        "successText": "你把那一小块揭下来。是新娘的左半张脸：一道细眉，一只眼睛，眼角一颗小小的痣。另外半张，不知去了哪儿。"
    },
    "pz_lock_coffin": {
        "kind": "item",
        "node": "node7x_funeral_explore",
        "hotspot": "coffin_lock",
        "answerText": "不应声，盖回棺盖；背包选中生锈钥匙，点棺头铜扣",
        "successFlags": [
            "saved_villager"
        ]
    },
    "pz_veil_mirror": {
        "kind": "item",
        "node": "node8x_veil",
        "hotspot": "broken_mirror",
        "answerText": "背包选中红盖头，点供桌上的破镜",
        "successFlags": [
            "mirror_veiled"
        ],
        "successNext": "node8x_mother",
        "failNext": "node8x_mirror"
    },
    "pz_puppet_road": {
        "kind": "road",
        "title": "三岔口",
        "maxFails": 3,
        "stareText": "你盯着纸偶。它一动不动，脸朝着你。",
        "lookText": "你把视线挪开半寸，再回头——纸偶的脸已经转向了「{dir}」边。",
        "failTexts": [
            "你走了很久，脚下又是这个岔口。红月沉到了树梢。",
            "又绕回来了。红月沉到了坟头，路上的黄纸一动不动。"
        ],
        "passTexts": [
            "第一个岔口过去了。前头又分成了三条。",
            "第二个岔口过去了。唢呐声远了一点。"
        ],
        "node": "node9x_crossroads",
        "answerText": "左、中、右",
        "successNext": "node28",
        "successText": "第三个岔口过去，唢呐声没了。路尽头是老宅的后墙，墙根下一道小门虚掩着。纸偶不动了，脸朝着门里。",
        "failNext": "node9x_dead_bus",
        "answer": [
            "左",
            "中",
            "右"
        ]
    },
    "pz_incense": {
        "kind": "drag",
        "title": "摆香",
        "sticks": 3,
        "levels": 10,
        "initial": [
            4,
            4,
            8
        ],
        "badText": "两短一长。三炷香的灰同时断落，香自己熄了。你得重摆。",
        "unevenText": "三炷香还长短不齐。",
        "node": "node10x_ritual_prep",
        "hotspot": "incense_three",
        "answerText": "三炷齐平",
        "successFlags": [
            "incense_set"
        ],
        "successText": "三炷香一样高了。烟笔直地升，到你头顶，齐齐朝你身后斜过去。"
    },
    "pz_bazi": {
        "kind": "choice",
        "title": "对八字",
        "maxFails": 2,
        "firstFailText": "墨洇开一团，又退了回去。背后那阵凉，近了一寸。",
        "specialFail": {
            "option": "丙子 丁酉 壬午 庚子",
            "text": "那是你自己的八字。这家人，一直是这么干的。"
        },
        "node": "node10x_ritual_prep",
        "hotspot": "genealogy_page",
        "answerText": "庚辰 甲申 丁卯 丙午",
        "successFlags": [
            "name_matched"
        ],
        "successText": "红纸条贴上缺页。血字一笔一笔自己接上来，接到“莫氏绣禾”四个字，停了，等你念第一个音。",
        "failNext": "node_dead_bride",
        "options": [
            "庚辰 甲申 丁卯 丙午",
            "戊辰 甲申 丁卯 丙午",
            "丙子 丁酉 壬午 庚子",
            "庚辰 甲申 丁酉 丙午"
        ],
        "answer": "庚辰 甲申 丁卯 丙午"
    }
};

// 烧黄纸问: 每个谜题三级提示
const HINTS = {
    "pz_bus_bell": [
        "手机草稿箱多出一条：“见槐即下，过槐不归。”",
        "手机草稿箱又多出一条：“车窗看得比你远。盯着玻璃，别盯司机。”",
        "一只四指血指印按在车窗上：车窗反光里出现槐树的那一刻，按下车铃。"
    ],
    "pz_damp_match": [
        "“倒头饭是谁烧的，火就还在谁那儿。”",
        "纸条上浮出一行字：“火柴受了潮，先烘。灶膛灰底下还红着。”",
        "四指血手印按在灶膛口：把受潮火柴拖到灶膛上，烘成洋火，回堂屋点灯。别掀水缸，别抬头。"
    ],
    "pz_wipe_eyes": [
        "“爷爷扎纸人从不点睛。多出来的眼，不是他画的。”",
        "纸条上浮出一行字：“数眼睛，别数纸人。香灰盖得住墨。”",
        "四指血手印按在两个纸人额头上：在供桌取香灰，抹第三个和第八个纸人的眼睛。别点那团黑影。"
    ],
    "pz_stone_door": [
        "“那一夜，镜头替我记着。”",
        "纸条上浮出一行字：“翻手机，第三镜头卡在哪一天？”",
        "四指血手印依次按在 0、9、2、2 四个石格上：九月廿二，按 0922。"
    ],
    "pz_groom": [
        "“十年一轮，轮了七回。头一个新郎，是这家的人。”",
        "纸条上浮出一行字：“看手，别看脸。”",
        "四指血手印按在角落那张照片上：点左手只有四根手指的那张，翻到背面拿碎片；到灵棚取到遗照后，两样合起来。"
    ],
    "pz_lock_coffin": [
        "“棺里喘气的那个，是替你预备的。”",
        "纸条上浮出一行字：“喊你名字的别应。可光盖回去不够，得锁上。锁上了，他就不用替你。”",
        "四指血手印按在棺头铜扣上：不应声，盖回棺盖，选中生锈钥匙点棺头铜扣。"
    ],
    "pz_veil_mirror": [
        "“喜堂里那面镜子，是她的眼睛。”",
        "纸条上浮出一行字：“新娘的盖头能遮新娘的脸，也遮得住她的眼。”",
        "四指血手印按在镜面上：在背包选红盖头，点供桌上的破镜。"
    ],
    "pz_puppet_road": [
        "“红线那头是族谱。它找的是她的名字。”",
        "纸条上浮出一行字：“别盯着它。挪开眼，再看它脸朝哪边。”",
        "四指血手印按在三条路口：每个岔口先点纸偶，移开视线再看，依次左、中、右。"
    ],
    "pz_incense": [
        "“两短一长是死人香。”",
        "纸条上浮出一行字：“三炷要齐，八字要对：她生在庚辰。”",
        "四指血手印按在三炷香上：把三炷香拖成一样高。"
    ],
    "pz_bazi": [
        "“名字写错一个字，就不是这个人了。”",
        "纸条上浮出一行字：“三炷要齐，八字要对：她生在庚辰。”",
        "四指血手印按在第一张红纸条上：选“庚辰 甲申 丁卯 丙午”。"
    ]
};

const HINT_SYSTEM = {
    "name": "烧黄纸问",
    "papersPerChapter": 3,
    "phoneChapter": "第一章：末班车与夜路",
    "noHintAchievement": "不问鬼神",
    "labels": [
        "烧第一张",
        "烧第二张",
        "烧第三张"
    ],
    "phoneLabels": [
        "草稿一",
        "草稿二",
        "草稿三"
    ]
};

// 节点BPM映射（心跳）
const BPM_MAP = {
    "node01": 60,
    "node01_explore": 78,
    "node04": 75,
    "node05": 80,
    "node05b": 90,
    "node06": 70,
    "node06_explore": 90,
    "node08": 85,
    "node08b": 98,
    "node08c": 100,
    "node09": 90,
    "node09b": 112,
    "node10": 95,
    "node11": 85,
    "node12": 90,
    "node13": 100,
    "node13b": 145,
    "node14": 110,
    "node15": 120,
    "node_dead_shadow": 230,
    "node17": 140,
    "node5x_wait": 150,
    "node5x_vigil": 110,
    "node5x_call": 165,
    "node5x_dead_burn": 235,
    "node18": 150,
    "node19": 160,
    "node20": 180,
    "node21": 200,
    "node15b": 140,
    "node22": 210,
    "node_explore_cave": 120,
    "node_dead_cave": 210,
    "node_after_cave": 130,
    "node_puzzle_door": 200,
    "node_puzzle_fail": 235,
    "node_puzzle_success": 190,
    "node_genealogy": 110,
    "node_after_genealogy": 200,
    "node_still": 195,
    "node23": 220,
    "node22b": 212,
    "node24": 230,
    "node7x_funeral_explore": 140,
    "node7x_coffin_alive": 165,
    "node7x_answer_dead": 230,
    "node25": 240,
    "node26": 250,
    "node26b": 160,
    "node8x_hall": 150,
    "node8x_well_explore": 120,
    "node8x_dead_well": 230,
    "node8x_veil": 200,
    "node8x_mirror": 175,
    "node8x_mother": 160,
    "node8x_mother_free": 150,
    "node9x_yinyang_road": 150,
    "node9x_join_procession": 230,
    "node9x_grave_explore": 115,
    "node9x_crossroads": 190,
    "node9x_bus_trap": 200,
    "node9x_dead_bus": 230,
    "node28": 270,
    "node29": 280,
    "node29b": 175,
    "node10x_ritual_prep": 110,
    "node10x_altar": 160,
    "node10x_recite": 160,
    "node10x_jade": 180,
    "node10x_bell": 160,
    "node10x_turn": 150,
    "ng_01": 150,
    "ng_01b": 150,
    "ng_02": 150,
    "ng_02_explore": 115,
    "ng_03": 150,
    "ng_04": 150,
    "ng_04b": 150,
    "ng_05": 150,
    "ng_06": 150,
    "ng_07": 150,
    "ng_08": 150,
    "ng_08b": 150,
    "ng_09": 150
};

// 节点音效映射
const SFX_MAP = {
    "node08": "knock",
    "node09": "knock",
    "node13b": "whisper",
    "node5x_call": "whisper",
    "node18": "knock",
    "node21": "tinnitus",
    "node7x_coffin_alive": "whisper",
    "node26": "whisper",
    "node8x_hall": "knock",
    "node8x_mirror": "tinnitus",
    "node9x_bus_trap": "whisper",
    "node29b": "whisper",
    "node10x_recite": "tinnitus"
};

// 短信映射(只保留附录 @sms 列表)
const MESSAGES = {
    "node06": {
        "from_sender": "未知号码",
        "content": "进门后，堂屋桌上有张纸条。记住上面的规矩，千万别回头。"
    },
    "node09": {
        "from_sender": "妈妈",
        "content": "别答应门外的任何人。包括我。"
    },
    "node22": {
        "from_sender": "妈妈",
        "content": "你在哪里？我怎么找不到你了？"
    },
    "node25": {
        "from_sender": "无服务",
        "content": "你已经是这里的人了。别挣扎了。"
    },
    "node28": {
        "from_sender": "无服务",
        "content": "她不会放过你的。除非，你替她。"
    }
};

// ===== 开发期引用完整性自检 (纯函数, 不改 NODES/ITEMS 结构) =====
function validateNodes(nodes, items, puzzles) {
    const problems = [];
    const pz = puzzles || {};
    const jumpFields = ['returnNode'];
    const itemExists = (key) => !!items[key];
    Object.keys(nodes).forEach(id => {
        const node = nodes[id];
        (node.choices || []).forEach((c, i) => {
            ['next', 'elseNext'].forEach(f => { if (c && c[f] && !nodes[c[f]]) problems.push(`节点 ${id}: choices[${i}].${f} -> '${c[f]}' 不存在`); });
            ['requireItem', 'item'].forEach(f => { if (c && c[f] && !itemExists(c[f])) problems.push(`节点 ${id}: choices[${i}].${f} -> '${c[f]}' 不在 ITEMS`); });
        });
        jumpFields.forEach(f => { if (node[f] && !nodes[node[f]]) problems.push(`节点 ${id}: ${f} -> '${node[f]}' 不存在`); });
        (node.hotspots || []).forEach((h, i) => {
            ['deathNode', 'nextNode', 'lockedNext'].forEach(f => { if (h[f] && !nodes[h[f]]) problems.push(`节点 ${id}: hotspots[${i}].${f} -> '${h[f]}' 不存在`); });
            ['item', 'requireItem', 'consumeItem'].forEach(f => { if (h[f] && !itemExists(h[f])) problems.push(`节点 ${id}: hotspots[${i}].${f} -> '${h[f]}' 不在 ITEMS`); });
            if (h.puzzle && !pz[h.puzzle]) problems.push(`节点 ${id}: hotspots[${i}].puzzle -> '${h.puzzle}' 不在 PUZZLES`);
        });
        ['item', 'consumeItem'].forEach(f => { if (node[f] && !itemExists(node[f])) problems.push(`节点 ${id}: ${f} -> '${node[f]}' 不在 ITEMS`); });
        if (node.puzzle && !pz[node.puzzle]) problems.push(`节点 ${id}: puzzle -> '${node.puzzle}' 不在 PUZZLES`);
        if (node.isDeath && (!node.deathName || !node.deathDesc)) problems.push(`死亡节点 ${id}: 缺 deathName 或 deathDesc`);
        if (node.isEnding && (!node.endingCode || !node.endingName)) problems.push(`结局节点 ${id}: 缺 endingCode 或 endingName`);
    });
    Object.keys(pz).forEach(k => {
        ['successNext', 'failNext'].forEach(f => { if (pz[k][f] && !nodes[pz[k][f]]) problems.push(`谜题 ${k}: ${f} -> '${pz[k][f]}' 不存在`); });
        if (pz[k].successItem && !itemExists(pz[k].successItem)) problems.push(`谜题 ${k}: successItem 不在 ITEMS`);
    });
    Object.keys(items).forEach(k => {
        const c = items[k].combine;
        if (c && (!itemExists(c.result) || (c.with || []).some(w => !itemExists(w)))) problems.push(`道具 ${k}: 组合引用了不存在的道具`);
    });
    return problems;
}

export { NODES, ITEMS, PUZZLES, HINTS, HINT_SYSTEM, BPM_MAP, SFX_MAP, MESSAGES, EPITAPHS, validateNodes };

// 仅本地开发时自动跑一次自检, 生产环境不执行
if (typeof window !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    const __issues = validateNodes(NODES, ITEMS, PUZZLES);
    if (__issues.length) console.warn('[nodes.js] 引用完整性发现 ' + __issues.length + ' 个问题:\n' + __issues.join('\n'));
    else console.log('[nodes.js] 引用完整性自检通过 (' + Object.keys(NODES).length + ' 个节点)');
}
