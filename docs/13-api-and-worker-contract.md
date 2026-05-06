# 13 API 与 Worker 协议

## 当前边界

当前 API 文档是合约预留。`frontend/` 不接真实 API，`backend/` 是脚手架候选版，Worker 不会真实执行镜像复制。

## 用户认证

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

P0 后端建议使用 opaque session token，数据库只保存 tokenHash。

## 管理员认证

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

P0 只支持 `super_admin`，不做 RBAC。

## 用户任务 API

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `POST /api/tasks/:id/cancel`
- `POST /api/tasks/:id/retry`

任务搜索：

- taskNo。
- batchNo。
- sourceImage。
- targetImage。

taskNo 搜索大小写、横线、空格不敏感。

## 批量任务 API

`POST /api/tasks/batch`

请求示例：

```json
{
  "registryAccountId": 1,
  "targetProjects": ["ops", "platform"],
  "architecture": "linux/amd64",
  "items": [
    {
      "sourceImage": "docker.io/library/nginx:latest"
    },
    {
      "sourceImage": "ghcr.io/acme/api:v1.8"
    }
  ],
  "idempotencyKey": "batch-20260504-001"
}
```

返回示例：

```json
{
  "batchNo": "BAT-QNX-8042",
  "sourceCount": 2,
  "targetCount": 2,
  "createdCount": 4,
  "estimatedFrozenPoints": 40,
  "tasks": [
    {
      "id": "task-001",
      "taskNo": "IMG-QNX-8042",
      "sourceImage": "docker.io/library/nginx:latest",
      "targetImage": "registry.example.com/ops/nginx:latest",
      "taskStatus": "queued",
      "billingStatus": "frozen"
    }
  ]
}
```

说明：

- 当前只是 API 合约预留。
- 后续真实后端中，batch 只是创建多条 ImageTask。
- Worker 仍然按单任务领取和执行。
- 积分仍然按单任务冻结和结算。

## 任务创建上限

P0：

- 源镜像最多 50 行。
- 目标项目最多 3 个。
- 单次最多 150 条 ImageTask。

超过上限返回业务错误。

## Registry API

P0：

- `GET /api/registries`
- `POST /api/registries`
- `GET /api/registries/:id`
- `PUT /api/registries/:id`
- `DELETE /api/registries/:id`
- `POST /api/registries/:id/test`

项目 / namespace：

- `GET /api/registries/:id/projects`
- `POST /api/registries/:id/projects`
- `DELETE /api/registries/:id/projects/:projectId`

P0 项目由用户手动维护。

## P1 Provider API 预留

- `POST /api/registries/:id/projects/sync`
- `POST /api/registries/:id/provider-credentials`
- `POST /api/registries/:id/provider-credentials/test`
- `DELETE /api/registries/:id/provider-credentials`

用于 Harbor / 云厂商 OpenAPI 项目自动读取。P0 不实现。

## 积分与订单 API

- `GET /api/points/account`
- `GET /api/points/transactions`
- `GET /api/recharge-packages`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

`POST /api/orders` P0 只允许 `payChannel = manual`。支付宝 / 微信返回暂未开通或预留状态。

## 管理员人工充值 API

`POST /api/admin/manual-recharges`

请求示例：

```json
{
  "userId": 1,
  "amountCents": 1000,
  "points": 100,
  "payChannel": "manual",
  "remark": "线下收款，管理员确认到账",
  "idempotencyKey": "manual-recharge-20260502-0001"
}
```

该接口必须幂等，并在事务里同时写入：

- `recharge_orders`
- `payment_records`
- `point_transactions`
- `point_account`
- `admin_audit_logs`
- `user_messages`

`POST /api/admin/users/:id/points/adjust` 保留为积分修正接口，不等同于人工充值。

## 支付预留 API

- `POST /api/payments/alipay/notify`
- `POST /api/payments/wechat/notify`

P0 不实现 SDK、不生成二维码、不真实验签。后续真实接入必须做签名验签、金额校验、订单状态幂等、到账幂等。

## 消息、公告、帮助和错误码

用户侧：

- `GET /api/messages`
- `GET /api/announcements`
- `GET /api/announcements/:id`
- `GET /api/help/articles`
- `GET /api/help/articles/:slug`
- `GET /api/error-codes/:code`

管理员侧：

- `GET /api/admin/announcements`
- `POST /api/admin/announcements`
- `PUT /api/admin/announcements/:id`
- `GET /api/admin/docs`
- `POST /api/admin/docs`
- `PUT /api/admin/docs/:id`
- `POST /api/admin/docs/:id/publish`
- `POST /api/admin/docs/:id/offline`
- `GET /api/admin/error-codes`
- `POST /api/admin/error-codes`
- `PUT /api/admin/error-codes/:id`

## 管理员任务 API

- `GET /api/admin/tasks`
- `GET /api/admin/tasks/:id`
- `POST /api/admin/tasks/:id/cancel`
- `POST /api/admin/tasks/:id/retry`

## 管理员订单 API

- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `POST /api/admin/orders/:id/close`

## 管理员活动 API

- `GET /api/admin/activities`
- `POST /api/admin/activities`
- `PUT /api/admin/activities/:id`
- `POST /api/admin/activities/:id/enable`
- `POST /api/admin/activities/:id/disable`

用户侧：

- `GET /api/activities`
- `GET /api/activities/:id`
- `POST /api/activities/:id/claim`

## Worker API

Worker 鉴权：

- 所有 Worker 请求携带 `X-Worker-Token`。
- 任务租约相关接口携带 `X-Claim-Token`。
- claimToken 不允许放 URL query 或 body。
- 后端真实 worker_id 必须从 Worker Token 解析。
- 不信任 body.workerId。

接口：

- `POST /api/worker/heartbeat`
- `POST /api/worker/tasks/claim`
- `POST /api/worker/tasks/:id/lease/renew`
- `POST /api/worker/tasks/:id/control`
- `POST /api/worker/tasks/:id/credentials/resolve`
- `POST /api/worker/tasks/:id/stage`
- `POST /api/worker/tasks/:id/logs`
- `POST /api/worker/tasks/:id/complete`
- `POST /api/worker/tasks/:id/fail`
- `POST /api/worker/tasks/:id/cancel-ack`
- `POST /api/worker/tasks/:id/cleanup-done`

`credentials/resolve` 当前只能返回 mock / not implemented，不返回真实凭据。

## Worker 执行阶段

建议阶段：

- `validating`
- `resolving_source`
- `estimating`
- `pulling`
- `pushing`
- `verifying`
- `settling`
- `refunding`
- `cleanup`

阶段和日志必须带 attemptNo。

## 成功验证

成功条件应包含：

- source digest 已解析。
- target digest 已解析。
- target manifest digest 与预期一致，或记录可解释差异。
- 生成 tag pull 和 digest pull 命令。

## 安全边界

- 不输出 token、password、authfile。
- 不把 taskNo 当安全凭证。
- 普通用户访问任务仍校验归属。
- 管理员操作写 audit log。
- Registry 凭据和 OpenAPI 凭据分开。
