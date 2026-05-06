# 12 执行后端与数据库模型

## 后端技术栈

规划：

- Node.js
- TypeScript
- NestJS
- Fastify adapter
- PostgreSQL
- Prisma
- Redis
- Docker Compose

当前 `backend/` 是脚手架候选版，运行闭环暂缓。

## 认证模型

P0 后端认证建议使用 opaque session token：

- 登录成功生成随机 session token。
- 数据库只保存 tokenHash。
- 不保存明文 token。
- 不在日志输出 token。
- 用户和管理员密码只保存 passwordHash。
- 推荐 argon2 或 bcrypt。

模型：

- `UserSession`
- `AdminSession`
- `LoginLog`

## 核心模型清单

必须包含：

- `User`
- `Admin`
- `UserSession`
- `AdminSession`
- `LoginLog`
- `RegistryAccount`
- `ImageTask`
- `ImageTaskBatch`
- `ImageTaskAttempt`
- `ImageTaskStage`
- `ImageTaskLog`
- `PointAccount`
- `PointTransaction`
- `RechargeOrder`
- `PaymentRecord`
- `RechargePackage`
- `MembershipPlan`
- `UserMembership`
- `WorkerNode`
- `WorkerHeartbeat`
- `UserMessage`
- `Announcement`
- `HelpArticle`
- `ErrorCode`
- `AdminAuditLog`
- `SystemConfig`
- `SystemJob`
- `Activity`
- `ActivityClaim`

## ImageTask

关键字段：

- `id`
- `taskNo`
- `taskNoNormalized`
- `userId`
- `registryAccountId`
- `batchId`
- `batchNo`
- `batchIndex`
- `sourceImage`
- `targetImage`
- `targetProject`
- `architecture`
- `taskStatus`
- `billingStatus`
- `workerStatus`
- `currentStage`
- `estimatedSizeBytes`
- `pulledBytes`
- `pushedBytes`
- `estimatedPoints`
- `frozenPoints`
- `consumedPoints`
- `refundedPoints`
- `sourceManifestDigest`
- `targetManifestDigest`
- `targetDigest`
- `assignedWorkerId`
- `claimToken`
- `claimExpiresAt`
- `claimedAt`
- `lastWorkerReportAt`
- `currentAttempt`
- `cancelRequestedAt`
- `startedAt`
- `finishedAt`
- `settledAt`
- `refundedAt`
- `idempotencyKey`
- `createdAt`
- `updatedAt`

约束：

- `taskNo unique`
- `taskNoNormalized unique`
- `idempotencyKey unique`
- `userId + createdAt index`
- `taskStatus + createdAt index`
- `workerStatus + claimExpiresAt index`

## ImageTaskBatch

用于批量导入展示和排查，不改变 Worker 执行模型。

字段：

- `id`
- `batchNo`
- `userId`
- `sourceType = manual_text`
- `sourceCount`
- `targetCount`
- `totalCount`
- `validCount`
- `invalidCount`
- `createdTaskCount`
- `estimatedFrozenPoints`
- `status`
- `createdAt`

约束：

- `batchNo unique`

## taskNo 生成

格式：

```text
IMG-ABC-1234
BAT-ABC-1234
```

后端创建任务时：

1. 生成 `IMG-ABC-1234`。
2. `taskNoNormalized = IMGABC1234`。
3. 写库时使用 unique 保证唯一。
4. 冲突时最多重试 10 次。
5. 超过重试次数后重新生成或使用更长编号。

taskNo 不是安全凭证。

## PointAccount

字段：

- `id`
- `userId`
- `balancePoints`
- `frozenPoints`
- `totalEarnedPoints`
- `totalConsumedPoints`
- `version`
- `updatedAt`

约束：

- `userId unique`

## PointTransaction

字段：

- `id`
- `userId`
- `balanceBefore`
- `frozenBefore`
- `balanceDelta`
- `frozenDelta`
- `balanceAfter`
- `frozenAfter`
- `type`
- `refType`
- `refId`
- `idempotencyKey`
- `createdAt`

约束：

- `idempotencyKey unique`
- `userId + createdAt index`

类型：

- `register_bonus`
- `task_freeze`
- `task_settle`
- `task_refund`
- `manual_recharge`
- `admin_adjust`
- `activity_reward`
- `membership_grant`

## RechargeOrder 与 PaymentRecord

`RechargeOrder`：

- `orderNo unique`
- `orderType`
- `payChannel`
- `status`
- `amountCents`
- `points`
- `paidAt`
- `closedAt`
- `idempotencyKey unique`

`PaymentRecord`：

- `provider`
- `providerTradeNo`
- `amountCents`
- `status`
- `paidAt`
- `rawPayload`
- `idempotencyKey unique`

## RegistryAccount

字段：

- `id`
- `userId`
- `name`
- `provider`
- `registryUrl`
- `namespace`
- `usernameEncrypted`
- `passwordEncrypted`
- `secretKeyVersion`
- `secretRotatedAt`
- `lastResolvedAt`
- `resolveCount`
- `status`
- `createdAt`
- `updatedAt`

P0 项目 / namespace 手动维护。P1 再接 `RegistryProject`。

## P1 Registry Provider 模型

`RegistryProviderCredential`：

- `id`
- `userId`
- `registryAccountId`
- `provider`
- `accessKeyEncrypted`
- `secretKeyEncrypted`
- `region`
- `instanceId`
- `status`
- `lastTestAt`
- `lastSyncAt`
- `secretKeyVersion`
- `createdAt`
- `updatedAt`

`RegistryProject`：

- `id`
- `registryAccountId`
- `provider`
- `projectName`
- `namespaceName`
- `displayName`
- `source = manual / provider_api`
- `canPush`
- `status`
- `lastSyncedAt`
- `lastSyncStatus`
- `lastSyncErrorCode`
- `createdAt`
- `updatedAt`

`RegistryProjectSyncLog`：

- `id`
- `registryAccountId`
- `provider`
- `status`
- `totalCount`
- `errorCode`
- `errorMessage`
- `startedAt`
- `finishedAt`

## WorkerNode

字段：

- `id`
- `name`
- `workerId`
- `tokenHash`
- `tokenVersion`
- `tokenRotatedAt`
- `region`
- `labels`
- `executorType`
- `status`
- `maxConcurrency`
- `currentTasks`
- `weight`
- `version`
- `lastHeartbeatAt`
- `lastError`
- `failureRate`
- `successRate`
- `createdAt`
- `updatedAt`

token 只保存 hash，不保存明文。

## WorkerHeartbeat

字段：

- `id`
- `workerId`
- `status`
- `currentTasks`
- `maxConcurrency`
- `freeDiskBytes`
- `reportedAt`

索引：

- `workerId + reportedAt`

## HelpArticle

字段：

- `id`
- `slug`
- `title`
- `summary`
- `category`
- `status`
- `contentMarkdown`
- `updatedAt`
- `readingMinutes`
- `tags`

约束：

- `slug unique`

## Activity 与 ActivityClaim

`Activity`：

- `id`
- `title`
- `type`
- `rewardPoints`
- `status`
- `startAt`
- `endAt`
- `createdAt`

`ActivityClaim`：

- `id`
- `activityId`
- `userId`
- `pointTransactionId`
- `claimedAt`
- `idempotencyKey`

约束：

- `activityId + userId unique`
- `idempotencyKey unique`

## 关键枚举

- `task_status`
- `billing_status`
- `worker_status`
- `current_stage`
- `order_status`
- `pay_channel`
- `point_transaction_type`
- `worker_node_status`
- `registry_account_status`
- `help_article_status`

## Redis 用途

P0 Redis 只用于：

- session/cache。
- rate limit。
- idempotency short cache。
- Worker heartbeat/lease 辅助。

P0 不使用 Redis Pub/Sub 作为可靠任务队列。后续如需队列，可考虑 BullMQ、Redis Streams 或独立消息队列。
