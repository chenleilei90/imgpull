# 05 仓库认证与项目管理

## P0 后端协议能力

P0 后端协议统一按 Docker Registry V2 push 规划。阿里云 ACR、腾讯云 TCR、华为云 SWR、火山云 CR、Harbor 和通用 Docker Registry 在 P0 中作为 UI 预设和帮助说明，不接各云厂商 OpenAPI。

## Registry 推送凭据

Registry 推送凭据用于：

- docker login。
- skopeo copy。
- crane copy。
- 推送镜像到目标仓库。

常见形式：

- 用户名 + 密码。
- Robot Account。
- Token。

字段规划：

- `usernameEncrypted`
- `passwordEncrypted`
- `secretKeyVersion`
- `secretRotatedAt`
- `lastResolvedAt`
- `resolveCount`

要求：

- 管理员不可查看明文。
- 日志不可输出密钥。
- Worker 后续只能获取短期 credentialsRef。
- 每个任务独立临时 authfile。
- 不写入全局 `~/.docker/config.json`。

## 云厂商 OpenAPI 凭据

OpenAPI 凭据不是 P0 必需项，P1 才做。

OpenAPI 凭据用于：

- 读取 namespace / project 列表。
- 刷新项目缓存。
- 测试 OpenAPI 连接。

它不等于 Registry 推送凭据。

用户不配置 OpenAPI 凭据时，功能仍可用，只是项目列表需要手动维护。

## P0 项目 / namespace 管理

P0 不自动读取项目列表。

P0 做法：

- 用户在私有仓库管理中手动维护项目 / namespace。
- 新建任务时从已维护列表中选择。
- 支持项目搜索和多选。
- 项目不存在时提示用户先去云厂商或 Harbor 控制台创建。

P0 目标项目状态：

- 正常。
- 测试失败。
- namespace 需提前创建。
- 无 push 权限。

## P1 自动读取规划

优先级：

1. Harbor project 自动读取。
2. 阿里云 ACR namespace 自动读取。
3. 腾讯云 TCR namespace 自动读取。
4. 华为云 SWR namespace / organization 自动读取。
5. 火山云 CR namespace 自动读取。

Provider Adapter：

- `HarborProjectProvider`
- `AliyunAcrNamespaceProvider`
- `TencentTcrNamespaceProvider`
- `HuaweiSwrNamespaceProvider`
- `VolcengineCrNamespaceProvider`

每个 adapter 负责：

- `testConnection`
- `listNamespaces / listProjects`
- `normalizeResult`
- `mapErrorCode`

## P1 数据模型预留

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

## P1 API 预留

- `GET /api/registries/:id/projects`
- `POST /api/registries/:id/projects`
- `POST /api/registries/:id/projects/sync`
- `DELETE /api/registries/:id/projects/:projectId`
- `POST /api/registries/:id/provider-credentials`
- `POST /api/registries/:id/provider-credentials/test`
- `DELETE /api/registries/:id/provider-credentials`

## 错误码

- `PROVIDER_AUTH_FAILED`
- `PROVIDER_PERMISSION_DENIED`
- `PROVIDER_REGION_INVALID`
- `PROVIDER_INSTANCE_NOT_FOUND`
- `PROVIDER_NAMESPACE_SYNC_FAILED`
- `PROVIDER_RATE_LIMITED`
- `PROVIDER_TLS_ERROR`
- `PROVIDER_API_UNAVAILABLE`

## 安全边界

- 云厂商 AccessKey 必须加密保存。
- 管理员不可查看明文。
- 日志不可输出 AccessKey / SecretKey。
- 不建议用户填写主账号 AccessKey，应使用最小权限子账号。
- OpenAPI 凭据和 Registry 推送凭据分开管理。
- 读取 namespace 不等于拥有 push 权限。
- 任务创建时仍要校验目标项目状态和 push 权限。

## 目标仓库策略

P0 明确：

- 不自动创建目标仓库或项目。
- 目标 namespace / project 必须提前存在。
- 测试连接优先验证登录和 push 权限。
- Harbor 自签名证书需要管理员在 Worker 节点配置可信 CA。
