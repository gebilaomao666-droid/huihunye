# 回魂夜 · 纸人招魂

一款中式民俗恐怖文字冒险游戏。七月十五，你坐末班车回纸人村给爷爷守灵，一夜之间要弄清这个家三代人欠下的是什么债。

- 十章剧情，八种结局，二十一种死法，每种死法都能留一句遗言给下一个守灵的人
- 场景探索、十道谜题，卡关可以烧黄裱纸问三级提示，不扣任何数值
- 电脑、手机竖屏、手机横屏都能玩，离线可玩

## 目录

```
回魂夜/
├── vue-frontend/        前端，纯静态，无需构建
│   ├── index.html       入口
│   ├── css/hhy.css      全站样式
│   ├── js/              游戏逻辑（Vue 3，CDN 引入）
│   │   ├── app.js       主程序：对白、分页、存档、成就
│   │   ├── nodes.js     剧情数据（由 docs/剧情定稿 生成，不要手改）
│   │   ├── audio.js     音效与环境声
│   │   └── *Mixin.js    探索、谜题、短信、存档等模块
│   ├── img/             美术素材
│   ├── audio/           音频素材（ogg + mp3）
│   ├── fonts/           字体（OFL 授权）
│   └── tools/           build_nodes.mjs：剧情 Markdown → nodes.js
├── docs/剧情定稿/       剧情正文（按章分文件，FORMAT.md 是写法说明）
├── audio_v2/            音频源文件与授权说明
├── cf-backend/          线上后端（Cloudflare Workers + D1，免费托管）
├── java-backend/        自建服务器用的后端（Spring Boot），接口与 cf-backend 相同
├── scripts/             校验与部署脚本
└── deploy/              服务器部署配置
```

## 本地运行

前端是纯静态页面，任何静态服务器都行：

```bash
cd vue-frontend
python -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/
```

直接双击 index.html 也能打开，但字体和音频用的是相对路径，个别浏览器会拦截，建议走服务器。

## 改剧情

剧情写在 `docs/剧情定稿/` 的 Markdown 里，改完重新生成数据：

```bash
cd vue-frontend
node tools/build_nodes.mjs          # 生成 js/nodes.js
node tools/build_nodes.mjs --check  # 只校验不写
```

生成时会检查选项跳转、旗标、道具、谜题线索是否闭合，有问题会直接报出来。写法见 `docs/剧情定稿/FORMAT.md`。

## 后端（可选）

后端提供遗言板、死亡和结局统计、成就同步。前端在拿不到后端时会自动降级为本地存储，不影响游玩。

线上用的是 `cf-backend/`（Cloudflare Workers + D1，免费），部署步骤见该目录的 README。前端请求的后端地址写在 `vue-frontend/js/api.js` 的 `REMOTE_API`。

`java-backend/` 是同一套接口的 Spring Boot 3 实现，适合自己有服务器的情况：

```bash
cd java-backend
mvn spring-boot:run
```

建表语句在 `sql/schema.sql`，数据库连接写在 `application.properties`（已忽略，不入库，参考 `.env.example`）。

## 部署

```bash
python scripts/deploy_frontend.py
```

脚本只上传 `vue-frontend/` 下的运行文件，以下划线开头的目录、`tools/`、测试截图都不会上传。

## 素材授权

- 字体：龙藏体、马善政、志莽行，均为 SIL Open Font License
- 音频：见 `audio_v2/CREDITS.md`，CC0 与 CC BY 素材已逐条注明来源
- 美术：本作原创，源文件体积较大未入库

## 许可

代码以 MIT 许可发布。剧情、美术、音频编排为原创内容，保留所有权利。
