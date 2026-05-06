# ImgPull 镜像助手

ImgPull 是一个面向 DevOps、云原生工程师、运维和开发团队的镜像同步 SaaS 产品原型。目标是帮助用户把 Docker Hub、GHCR、Quay 等公开容器镜像同步到自己的私有镜像仓库，例如阿里云 ACR、腾讯云 TCR、华为云 SWR、火山云 CR、自建 Harbor 或通用 Docker Registry。

当前仓库是 **P0 前端演示版 + backend 脚手架基线 + Worker POC 准备版**。网站当前只用于页面演示和产品流程评审，不能真实拉取或推送镜像。

## 当前状态

- `frontend/`：Next.js + React + TypeScript + Tailwind 的可演示前端，使用 mock data 和 mock auth。
- `backend/`：NestJS + Fastify + Prisma 的后端脚手架候选版，运行闭环暂缓。
- `worker-poc/`：Skopeo / Crane POC 脚本准备版，真实实测暂缓。
- `prototype/`：早期静态 HTML 原型，保留作对照。
- `docs/`：P0/P1 产品、页面、架构、数据库、API 和 Worker 协议文档。

## 快速运行前端

需要 Node.js 20 或更高版本。

~~~bash
cd frontend
npm install
npm run dev -- --port 3001
~~~

浏览器打开：

~~~text
http://localhost:3001
~~~

如果 3001 被占用，可以换端口：

~~~bash
npm run dev -- --port 3002
~~~

## 前端验证命令

~~~bash
cd frontend
npm run typecheck
npm run lint
npm run build
~~~

## 演示登录方式

前端使用 mock auth，不接真实登录接口。

- 打开 `/login`
- 点击“以普通用户身份进入”进入 `/dashboard`
- 点击“以管理员身份进入”进入 `/admin`
- 未登录访问 `/dashboard/*` 或 `/admin/*` 会跳转登录页
- 普通用户访问 `/admin/*` 会被拦截回用户控制台

## 主要页面

公共页面：

- `/`
- `/product`
- `/pricing`
- `/registries`
- `/help`
- `/help/articles/[slug]`
- `/error-codes`
- `/terms`
- `/privacy`
- `/login`
- `/register`

用户后台：

- `/dashboard`
- `/dashboard/tasks/new`
- `/dashboard/tasks`
- `/dashboard/tasks/[id]`
- `/dashboard/registries`
- `/dashboard/points`
- `/dashboard/orders`
- `/dashboard/activities`
- `/dashboard/messages`
- `/dashboard/settings`

管理员后台：

- `/admin`
- `/admin/tasks`
- `/admin/tasks/[id]`
- `/admin/workers`
- `/admin/users`
- `/admin/points`
- `/admin/orders`
- `/admin/activities`
- `/admin/announcements`
- `/admin/docs`
- `/admin/error-codes`
- `/admin/config`
- `/admin/audit-logs`
- `/admin/health`

## P0 功能范围

P0 已覆盖前端演示闭环：

- 官网、价格、支持仓库、帮助中心、错误码、服务条款、隐私政策
- 用户后台、管理员后台、公共 Footer、备案占位
- mock 登录、路由保护、用户 / 管理员两种演示身份
- 单个镜像任务创建
- 轻量批量导入：最多 50 行源镜像、最多 3 个目标项目、最多创建 150 条独立 ImageTask
- 用户可见任务编号 `IMG-ABC-1234` 和批次编号 `BAT-ABC-1234`
- 任务列表、任务详情、同步结果、Digest、tag pull / digest pull 命令
- 私有仓库管理、项目 / namespace 手动维护口径
- 积分冻结、成功结算、失败返还、人工充值演示
- 消息中心和系统公告演示
- 帮助中心文档化和管理员 Markdown 文章管理
- 管理员 Worker 节点管理 mock：新增、编辑、详情、注册指引、生命周期操作

## 当前不做

当前版本不实现：

- 真实后端业务闭环
- 真实数据库运行和迁移验收
- 真实 Worker 程序
- 真实 Worker Docker 镜像或 Linux 二进制
- 真实 Skopeo / Crane registry copy
- 真实仓库凭据下发
- 真实支付宝 / 微信支付 SDK
- 真实支付回调
- 云厂商 OpenAPI 自动读取 namespace / project
- Harbor API 自动读取 project
- 生产 registry、生产账号或真实 AccessKey

## backend 说明

后端代码位于 `backend/`，当前是脚手架候选版，不是已验收上线服务。

本地运行需要 Docker Desktop、PostgreSQL、Redis：

~~~bash
cd backend
npm install
cp .env.example .env
docker compose up -d postgres redis
npx prisma validate
npx prisma migrate dev --name init_p0_baseline
npx prisma generate
npx prisma db seed
npm run typecheck
npm run lint
npm run build
npm run start:dev
~~~

健康检查目标：

~~~text
http://localhost:4000/api/health
~~~

后端运行闭环当前暂缓，前端不会请求真实后端。

## Worker POC 说明

Worker POC 位于 `worker-poc/`。它只用于后续在真实测试机上验证 Skopeo / Crane 是否能完成 registry-to-registry copy。

当前不会开发真实 Worker，也不会执行真实镜像同步。

基本检查：

~~~bash
bash worker-poc/scripts/00-check-tools.sh
~~~

实测前需要安装：

- skopeo
- crane
- jq
- 可选 docker

真实凭据、`.env` 和 authfile 不允许提交。

## 文档阅读顺序

建议按以下顺序阅读：

1. `docs/01-product-requirements.md`
2. `docs/09-final-product-baseline.md`
3. `docs/10-page-route-and-action-map.md`
4. `docs/04-ui-pages-and-design-system.md`
5. `docs/03-billing-membership.md`
6. `docs/05-registry-auth-research.md`
7. `docs/02-architecture-and-task-engine.md`
8. `docs/12-execution-backends-and-database-schema.md`
9. `docs/13-api-and-worker-contract.md`
10. `docs/15-worker-node-lifecycle.md`
11. `docs/14-closed-loop-audit.md`
12. `docs/11-risk-cost-and-delivery-checklist.md`
13. `docs/07-feature-completeness-audit.md`
14. `docs/06-mvp-decisions.md`
15. `docs/08-competitor-and-reference-research.md`

## 安全和提交规则

不要提交：

- `.env`
- authfile
- token
- password
- AccessKey / SecretKey
- `node_modules/`
- `.next/`
- `dist/`
- `*.log`
- `*.tsbuildinfo`
- Worker POC 实测日志

根目录 `.gitignore` 已覆盖这些规则。

## 下一步建议

1. 继续人工评审 P0 前端演示页面。
2. 前端确认后，再决定是否恢复 backend 运行闭环验收。
3. 真实 Worker 设计前，先执行 `worker-poc/` 的 Skopeo / Crane 实测。
4. 不要在 P0 再扩 P1/P2 功能，避免范围失控。
