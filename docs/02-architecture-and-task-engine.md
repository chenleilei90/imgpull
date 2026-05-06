# 02 架构与任务引擎

## 当前阶段架构

当前仓库包含三部分：

- `frontend/`：Next.js + React + TypeScript + Tailwind，使用 mock data 和 mock auth。
- `backend/`：NestJS + Fastify + Prisma 后端脚手架，运行闭环暂缓。
- `worker-poc/`：Skopeo / Crane POC 脚本准备版，真实实测暂缓。

当前网站只用于页面演示和产品流程评审，不会真实同步镜像。

## 未来目标架构

```text
Browser
  -> Frontend
  -> Backend API
  -> PostgreSQL
  -> Redis
  -> Worker Nodes
  -> Source Registry
  -> Target Registry
```

核心职责：

- Frontend：用户和管理员操作界面。
- Backend：认证、用户、任务、积分、订单、仓库、Worker 协议和审计。
- PostgreSQL：业务数据和状态机。
- Redis：session/cache、rate limit、幂等短缓存、Worker heartbeat/lease 辅助。
- Worker：后续通过 skopeo / crane 执行 registry-to-registry copy。

## 任务状态模型

任务状态拆分为：

- `task_status`：任务业务状态。
- `billing_status`：积分结算状态。
- `worker_status`：Worker 执行状态。
- `current_stage`：当前执行阶段。

示例：

```text
task_status = running
billing_status = frozen
worker_status = running
current_stage = pushing
```

用户前台展示应组合成中文状态，例如“执行中”“已成功”“失败已返还”，不要把底层字段放在首页高优先级位置。

## ImageTask 执行模型

每条 ImageTask 独立执行：

- 独立 taskNo。
- 独立积分冻结。
- 独立 Worker claim。
- 独立 attempt。
- 独立 stage 和 logs。
- 独立 complete / fail。
- 独立结算或返还。

批量导入和多目标选择只是在创建时拆分多条 ImageTask，不改变 Worker 执行模型。

## Worker 调度原则

后续真实 Worker 推荐采用 Worker 主动领取任务：

1. Worker 通过 `X-Worker-Token` 上报 heartbeat。
2. Worker 调用 `/api/worker/tasks/claim` 领取任务。
3. 只有 online 节点能领取新任务。
4. maintenance / draining / disabled / retired / deleted 节点不接新任务。
5. `currentTasks < maxConcurrency` 才能继续接任务。
6. 后端按负载、权重、标签和健康状态选择任务。
7. Worker 执行期间续租 lease。
8. Worker 上报 stage、logs、complete 或 fail。

当前 frontend 中的 Worker 节点管理只是 mock UI，不会启动真实 Worker。

## Worker 生命周期状态

- `pending`：等待注册。
- `online`：在线可调度。
- `offline`：心跳丢失或不可达。
- `maintenance`：维护中，不接新任务。
- `draining`：排空中，不接新任务，等待当前任务完成。
- `disabled`：禁用，不参与调度。
- `retired`：退役，保留历史。
- `deleted`：软删除，不参与调度，默认隐藏。

## 执行器规划

P0 真实 Worker 开发前优先验证：

- `skopeo inspect`
- `skopeo copy`
- `crane copy`
- target digest verify

Docker CLI、nerdctl、crictl 可以作为兼容方案，但第一版不应强依赖 Docker daemon。

## 多架构策略

P0 默认保留 architecture 字段，前端演示可显示 `linux/amd64` 或 `all`。

真实 Worker 阶段需要明确：

- 单平台复制按指定 platform 计费和验证。
- 多架构复制按实际 manifest/layer 计算成本。
- digest 不一致时需要区分 registry 重写、单平台复制、多架构 manifest 差异和工具行为差异。

## 当前不实现的能力

- 不实现真实 Worker 调度。
- 不执行 skopeo / crane copy。
- 不下发真实凭据。
- 不做真实任务队列。
- 不接 Redis 可靠队列。
- 不接云厂商 OpenAPI。
- 不接生产 registry。
