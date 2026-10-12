# 枕石书屋 · 前端

[![CI](https://github.com/ChanHsing1972/tomatomall-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ChanHsing1972/tomatomall-frontend/actions/workflows/ci.yml)

枕石书屋（TomatoMall）是 Vue 3、TypeScript、Element Plus 与 Vite 实现的书店和阅读应用，来自软件工程课程的团队项目。此仓库维护公开前端，后端源码继续保存在私有仓库中。

演示入口为 [zhenshi.qd.je](http://zhenshi.qd.je)。共享账号为 `demo`，密码为 `ZhenshiDemo2026!`。可以依次浏览书库、收藏图书、加入购物袋、创建订单、使用演示支付并打开阅读器。演示支付不会扣款，图书价格、评分、库存和阅读内容用于展示。个人资料页和管理入口需要相应账号权限。

## 已实现的功能

应用提供书目查询与关键词搜索、分类筛选、书籍详情、购物袋数量调整、订单列表与优惠券选择、收藏与评论、私信界面以及阅读主题、字体和章节切换。首页推荐和分类数量来自实际数据库，线上书目及封面地址沿用恢复的数据；原封面服务不可用时，浏览器自动显示带实际书名的本地 SVG 备用封面。空库初始化时使用项目提供的 SVG 演示封面。

网络请求使用同域 `/api` 和统一 token 拦截器，HTTP 200 中的业务失败仍会被拒绝。管理员路由具有前端守卫，真正的写权限由后端再次验证。AI 界面需要登录与可用的服务端 API 配置。公司介绍、招聘、客服、邮件订阅与商业文案属于界面示例，页面会标注演示性质；尚未发送的表单不会显示真实发送成功。

## 本地开发与验证

请安装 Node.js 24，然后运行 `npm ci` 和 `npm run dev`。开发服务器将 `/api` 转发至 `http://localhost:8080`；生产构建使用同域反向代理。只有特殊开发场景才需设置 `VITE_API_BASE_URL`，请勿写死历史服务器地址。

提交前运行 `npm run typecheck`、`npm test` 和 `npm run build`。类型检查保持严格模式，测试覆盖组件交互、同域请求、token 传递和业务错误。还可使用 `npm audit --registry=https://registry.npmjs.org` 检查依赖。

## 构建与发布

GitHub Actions 对 main 推送和 Pull Request 执行严格类型检查、测试、构建及生产依赖审计。main 验证通过后构建 Nginx 静态镜像，发布到 `ghcr.io/chanhsing1972/tomatomall-frontend`，同时使用 main 和提交 SHA 标签。发布结果记录在 `ci-status` 分支。服务器每 5 分钟安装测试通过的 main 镜像，并在健康验证失败时恢复上一版本。Actions 固定提交 SHA，Dependabot 每周维护依赖。

Docker 镜像通过 8080 端口提供静态资源、SPA 路由、健康检查和 `/api` 代理。数据库、Redis、HTTPS 证书与服务器发布脚本在私有后端仓库统一维护。入口 HTTP 在证书签发成功后自动重定向至 HTTPS；证书签发状态见部署交付记录，不能把尚未签发的证书描述为已启用。

[安全说明](SECURITY.md)、[参与维护](CONTRIBUTING.md)和[来源说明](NOTICE.md)记录隐私与项目来源。未路由的旧 Dashboard 备份放在 `docs/legacy` 中，仅用于历史参考，不参加应用编译。应用使用系统字体；历史字体资产仍保留原权利，未为全部历史代码重新授予开源许可。

线上书目来自恢复的原 SQL，当前为 54 本书和 6 个章节。共享 demo 是独立账户，原有用户的订单、联系方式和私信不向它开放。原 SQL 不存入此公开仓库。
