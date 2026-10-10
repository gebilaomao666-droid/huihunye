# 后端（Cloudflare Workers + D1）

免费托管版后端，接口与 `java-backend` 完全一致，前端不用改调用。

## 首次部署

```bash
cd cf-backend
npx wrangler login                                   # 浏览器里授权一次
npx wrangler d1 create weikongbu                     # 把输出的 database_id 填进 wrangler.toml
npx wrangler d1 execute weikongbu --remote --file=schema.sql
npx wrangler deploy                                  # 输出的 *.workers.dev 地址填到前端 js/api.js 的 REMOTE_API
```

## 本地调试

```bash
npx wrangler d1 execute weikongbu --local --file=schema.sql
npx wrangler dev --port 8080
```

前端在 localhost 下会直接请求 `http://localhost:8080`。

## 日常

改完 `src/index.js` 后 `npx wrangler deploy` 即可。数据看：`npx wrangler d1 execute weikongbu --remote --command "select count(*) from sessions"`。
