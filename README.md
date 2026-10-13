# 枕石书屋 · 前端

[![CI](https://github.com/ChanHsing1972/tomatomall-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ChanHsing1972/tomatomall-frontend/actions/workflows/ci.yml)

枕石书屋（TomatoMall）是 Vue 3、TypeScript、Element Plus 与 Vite 实现的书店和阅读应用，来自软件工程课程的团队项目。此仓库维护公开前端，后端源码继续保存在私有仓库中。

演示入口为 [zhenshi.qd.je](https://zhenshi.qd.je)。共享账号为 `demo`，密码为 `ZhenshiDemo2026!`。可以依次浏览书库、收藏图书、加入购物袋、创建订单、使用支付宝沙箱支付并打开阅读器。支付宝沙箱使用测试资金，图书价格、评分、库存和阅读内容用于展示。个人资料页和管理入口需要相应账号权限。

## 已实现的功能

应用提供书目查询与关键词搜索、分类筛选、书籍详情、购物袋数量调整、订单列表与优惠券选择、收藏与评论、私信界面以及阅读主题、字体和章节切换。首页推荐和分类数量来自实际数据库，线上书目经过 ISBN 去重、字段拆分与简介整理，真实封面在服务器同域托管，保留图片来源和校验记录。公开目录按九个主分类组织，评分及卡片排版按原设计保留。

网络请求使用同域 `/api` 和统一 token 拦截器，HTTP 200 中的业务失败仍会被拒绝。管理员路由具有前端守卫，真正的写权限由后端再次验证。独立 AI 页面根据当前上架书目选书，通过服务器内部网关使用模型服务，前端没有模型密钥。主页沿用原有区块与桌面排版，社区、订阅和公司文案保留原设计；这些展示区块不代表已经接入邮件或商业运营服务。订单、AI 与消息页面采用一致的大标题、留白、细分隔线和蓝色操作链接，手机视口具有独立适配。

## 本地开发与验证

请安装 Node.js 24。只修改前端并使用线上真实书目预览时，在本地仓库运行：

```sh
cd /Users/chenxin/Documents/1-Dev/3-Archive/2024-10-tomatomall/tomatomall-frontend
npm ci --cache .npm-cache
npm run dev:online
```

打开终端显示的地址，默认是 `http://localhost:3000`。修改 `src` 中的 Vue、TypeScript 或 CSS 文件并保存后，Vite 会自动更新浏览器。主页位于 `src/views/Home.vue`，订单位于 `src/views/mall/Orders.vue`，AI 页面位于 `src/views/AI.vue`，AI 对话组件位于 `src/components/AIConversation.vue`，消息列表位于 `src/views/user/MessageList.vue`。按 `Ctrl+C` 停止预览。

`dev:online` 将 `/api` 与 `/catalog-covers` 通过开发代理转发至 `https://zhenshi.qd.je`，无需启动本地 Java、MySQL 或 Redis。此模式使用线上数据，登录后的下单、评论及消息操作也会写入线上数据库；仅修改本地页面文件不会发布网站。依赖缓存放在已忽略的 `.npm-cache` 目录，避免旧全局 npm 缓存的权限问题。

同时开发本地后端时，运行 `npm run dev`，默认代理目标为 `http://localhost:8080`；也可用 `DEV_API_PROXY=http://localhost:你的端口 npm run dev` 指定地址。生产构建仍使用同域反向代理，通常保持 `VITE_API_BASE_URL` 为空。

两个本地仓库的 `main` 已对齐各自 GitHub 仓库，`origin` 指向 GitHub。开始新修改前运行 `git pull --ff-only`，再用 `git switch -c feat/你的修改名称` 建立工作分支并提交。向 `main` 推送通过流水线后会发布网站，普通本地保存和预览不会触发部署。

提交前运行 `npm run typecheck`、`npm test` 和 `npm run build`。类型检查保持严格模式，测试覆盖组件交互、同域请求、token 传递和业务错误。还可使用 `npm audit --registry=https://registry.npmjs.org` 检查依赖。

## 构建与发布

GitHub Actions 对 main 推送和 Pull Request 执行严格类型检查、测试、构建及生产依赖审计。main 验证通过后构建 Nginx 静态镜像，发布到 `ghcr.io/chanhsing1972/tomatomall-frontend`，同时使用 main 和提交 SHA 标签。发布结果记录在 `ci-status` 分支。服务器每 5 分钟安装测试通过的 main 镜像，并在健康验证失败时恢复上一版本。Actions 固定提交 SHA，Dependabot 每周维护依赖。

Docker 镜像通过 8080 端口提供静态资源、SPA 路由、健康检查和 `/api` 代理。数据库、Redis、HTTPS 证书与服务器发布脚本在私有后端仓库统一维护。入口已启用 ZeroSSL 正式证书，HTTP 自动重定向至 HTTPS，服务器定时检查续期。

[安全说明](SECURITY.md)、[参与维护](CONTRIBUTING.md)和[来源说明](NOTICE.md)记录隐私与项目来源。未路由的旧 Dashboard 备份放在 `docs/legacy` 中，仅用于历史参考，不参加应用编译。应用使用系统字体；历史字体资产仍保留原权利，未为全部历史代码重新授予开源许可。

线上书目来自恢复的原 SQL，当前为 52 个唯一 ISBN 的书目和 6 个章节。共享 demo 是独立账户，原有用户的订单、联系方式和私信不向它开放。原 SQL 不存入此公开仓库。

开发时可用 `DEV_API_PROXY` 指向测试后端；默认仍为 `http://localhost:8080`。骨架屏按实际书籍卡片、订单、消息行及详情尺寸占位，并支持减少动态效果设置。测试包含沙箱地址限制、订单金额与筛选、AI 请求互斥、中文输入法回车和失败重试。
