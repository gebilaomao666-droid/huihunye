// 手机短信 / 开机过场 子系统 (从 app.js 抽出的方法 mixin)。
// 相关状态 (smsVisible/phoneBootStep/smsHistory 等) 仍在主组件 data(); Vue 合并后 this 指向同一实例。
import { playKnock } from './audio.js?v=20261010-fin';

const CREEPY_SENDERS = ['未知号码', '无服务'];
const FINAL_SMS_NODES = ['node25', 'node28'];
const CREEPY_REPLIES = {
    '未知号码': ['你知道我在看着你吗？', '别回头。', '我一直在。'],
    '无服务': ['你跑不掉的。', '信号越来越弱了...', '就像你的生命一样。']
};
const CORRUPTED_NAMES = {
    '未知号码': ['你背后', '镜子里', '床底下'],
    '无服务': ['逃不掉', '留下来', '看着你']
};

export const smsMixin = {
    unmounted() {
        this._clearSmsTimers();
    },
    methods: {
        // 所有短信相关定时器都登记在这里, 关闭手机/换节点时统一清掉, 不会在关闭后偷偷改手机状态
        _smsLater(fn, ms) {
            this._smsTimers = this._smsTimers || [];
            const id = setTimeout(() => {
                this._smsTimers = (this._smsTimers || []).filter((x) => x !== id);
                fn();
            }, ms);
            this._smsTimers.push(id);
            return id;
        },
        _clearSmsTimers() {
            (this._smsTimers || []).forEach((id) => clearTimeout(id));
            this._smsTimers = [];
        },

        closeSms() {
            // 消息还没真正显示出来(正在输入)时不允许返回, 否则这条剧情短信就永远看不到了
            if (this.smsVisible && this.phoneBooting && this.phoneBootStep >= 1 && this.phoneBootStep < 5) {
                if (this.showToast) this.showToast('消息还在输入……');
                return;
            }
            this._clearSmsTimers();
            this.smsVisible = false;
            this.smsTyping = false;
            this.phoneBooting = false;
            this.phoneBootStep = 0;
            if (this.smsNextNode) {
                const next = this.smsNextNode;
                this.smsNextNode = null;
                setTimeout(() => this.enterNode(next), 300);
            }
        },

        // 换节点/重开时强制收起手机(不受"正在输入"限制)
        forceCloseSms() {
            this._clearSmsTimers();
            this.smsVisible = false;
            this.smsTyping = false;
            this.phoneBooting = false;
            this.phoneBootStep = 0;
            this.smsNextNode = null;
            this._smsPendingNode = null;
        },

        // ===== 展示手机短信对话框（手动开机过程）=====
        showSmsDialog(sender, content, nodeId) {
            this._clearSmsTimers();
            this.smsSender = sender;
            // 发件人与"是否诡异"在弹出时就固定; 后面发件人名字变异只影响显示
            this.smsOrigSender = sender;
            this.smsIsCreepy = CREEPY_SENDERS.includes(sender);
            this.smsHistory = [];
            this.smsCreepy = false;
            this.smsNextNode = null;
            this.smsContent = content;
            this.smsNodeId = nodeId;

            // 步骤1：手机从黑暗中滑入（黑屏状态），等待玩家点击
            this.phoneBooting = true;
            this.phoneBootStep = 1;
            this.smsVisible = true;

            this.vibrate([30, 50, 30]);
        },

        // ===== 玩家点击手机屏幕推进开机（带灵异化）=====
        handlePhoneClick() {
            if (!this.phoneBooting) return;

            const isCreepy = !!this.smsIsCreepy;
            const origSender = this.smsOrigSender || this.smsSender;
            const isFinal = FINAL_SMS_NODES.includes(this.smsNodeId);

            if (this.phoneBootStep === 1) {
                // 黑屏 → 锁屏
                this.phoneBootStep = 2;
                // 灵异化：时间错乱
                if (isCreepy) {
                    const evilTimes = ['04:44', '03:33', '23:59', '00:00'];
                    this.gameTime = evilTimes[Math.floor(Math.random() * evilTimes.length)];
                    this.smsDate = '1997年9月22日 星期一';
                } else {
                    this.smsDate = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
                }
                this.vibrate([40]);
            }
            else if (this.phoneBootStep === 2) {
                // 锁屏 → 通知弹出
                this.phoneBootStep = 3;
                // 灵异化：发件人变异(只改显示名)
                if (isCreepy && Math.random() > 0.3) {
                    const names = CORRUPTED_NAMES[origSender] || ['???'];
                    this.smsSender = names[Math.floor(Math.random() * names.length)];
                }
                this.vibrate([50, 50, 50]);
                playKnock();
            }
            else if (this.phoneBootStep === 3) {
                // 通知 → 解锁进入短信
                this.phoneBootStep = 4;
                this.smsTyping = true;
                this.vibrate([30]);

                const typingDelay = isCreepy ? 2500 : 1800;
                const nodeId = this.smsNodeId;

                this._smsLater(() => {
                    this.smsTyping = false;
                    this.phoneBootStep = 5;

                    // 添加收到的消息（带灵异化）
                    const msgTime = isCreepy
                        ? ['04:44', '03:33', '23:59', '00:00'][Math.floor(Math.random() * 4)]
                        : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

                    this.smsHistory.push({
                        type: 'received',
                        text: this.smsContent,
                        time: msgTime,
                        blood: isFinal,
                        glitch: isCreepy && Math.random() > 0.5
                    });
                    // 消息真正显示出来才算已读
                    this._smsShownNodes = this._smsShownNodes || new Set();
                    if (nodeId) this._smsShownNodes.add(nodeId);

                    if (isCreepy) this.smsCreepy = true;

                    this.$nextTick(() => {
                        const chat = this.$refs.smsChat;
                        if (chat) chat.scrollTop = chat.scrollHeight;
                    });

                    this.vibrate(isFinal ? [100, 100, 100, 100] : [50, 50, 50]);

                    // 自动回复（更灵异）
                    if (isCreepy && !isFinal) {
                        this._smsLater(() => {
                            this.smsTyping = true;
                            this._smsLater(() => {
                                this.smsTyping = false;
                                const replyList = CREEPY_REPLIES[origSender] || ['...'];
                                const replyText = replyList[Math.floor(Math.random() * replyList.length)];
                                this.smsHistory.push({
                                    type: 'received',
                                    text: replyText,
                                    time: '04:44',
                                    blood: false,
                                    glitch: true
                                });
                                this.$nextTick(() => {
                                    const chat = this.$refs.smsChat;
                                    if (chat) chat.scrollTop = chat.scrollHeight;
                                });
                                this.vibrate([80, 40, 80]);
                            }, 2000);
                        }, 3000);
                    }
                }, typingDelay);
            }
        },
    }
};
