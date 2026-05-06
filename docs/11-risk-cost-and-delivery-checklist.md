# 11 风险、成本与交付清单

## 当前交付风险

当前版本只是演示版，风险主要来自用户误解：

- 误以为能真实同步镜像。
- 误以为 Worker 已经可用。
- 误以为支付已接入。
- 误以为云厂商 namespace 可自动读取。

页面必须明确：

- 当前为前端演示环境。
- 不会真实拉取或推送镜像。
- 不接真实支付。
- 不接真实 Worker。

## 技术风险

真实上线前必须验证：

- skopeo / crane 在目标环境是否稳定。
- 多架构镜像 digest 差异。
- 大镜像带宽和磁盘成本。
- registry 限流。
- 目标仓库权限。
- 自签名 Harbor 证书。
- Worker 中断后的 lease 恢复。
- 失败重试和幂等。

## 成本风险

成本来源：

- 出口带宽。
- 源镜像拉取流量。
- 目标仓库推送流量。
- Worker 磁盘临时缓存。
- 大镜像和多架构镜像。
- 失败但已消耗大量流量的任务。

P0 文档策略：

- 失败仍按任务返还积分。
- 记录失败成本和风控信息。
- 高成本任务后续可增加人工审核。

## 安全风险

重点风险：

- Registry 凭据泄露。
- OpenAPI AccessKey 泄露。
- Worker token 泄露。
- 日志输出敏感信息。
- 用户越权查看任务。
- taskNo 被误用为访问凭证。

要求：

- 密码只保存 hash。
- token 只保存 hash。
- secret 加密保存。
- 日志脱敏。
- 管理员不可查看明文凭据。
- 普通用户按 taskNo 查询仍要校验归属。
- 不提交 `.env`、authfile、token、AccessKey。

## 支付风险

P0 不接真实支付。

后续真实接入必须：

- 验签。
- 金额校验。
- 幂等处理。
- 重复回调处理。
- 到账幂等。
- 订单状态机。
- 对账。

## Worker 风险

后续真实 Worker 必须处理：

- claim_token。
- lease renew。
- cancel ack。
- cleanup done。
- heartbeat lost。
- attempt。
- 阶段日志。
- 凭据临时文件清理。
- Worker 版本兼容。

## 上线前检查清单

### 产品

- [ ] P0 页面人工评审通过。
- [ ] 文案不误导用户。
- [ ] 服务条款和隐私政策完成正式版本。
- [ ] ICP 备案和公安备案配置完成。

### 前端

- [ ] typecheck 通过。
- [ ] lint 通过。
- [ ] build 通过。
- [ ] 未登录保护通过。
- [ ] Mock Auth 清晰标注演示环境。

### 后端

- [ ] docker compose 可启动 PostgreSQL / Redis。
- [ ] Prisma migrate 通过。
- [ ] seed 通过。
- [ ] health API 通过。
- [ ] auth / users / admins / system-config 第一批 API 通过。

### Worker

- [ ] POC 实测完成。
- [ ] skopeo copy 成功。
- [ ] crane copy 成功。
- [ ] digest verify 结果可解释。
- [ ] 失败场景映射错误码。

### 安全

- [ ] secret 加密。
- [ ] token hash。
- [ ] 日志脱敏。
- [ ] 权限校验。
- [ ] 审计日志。

### 交付包

- [ ] 不包含 node_modules。
- [ ] 不包含 `.next`。
- [ ] 不包含 `dist`。
- [ ] 不包含 `.env`。
- [ ] 不包含 `*.log`。
- [ ] 不包含 `*.zip` 残留。
- [ ] 不包含 `*.tsbuildinfo`。
- [ ] 不包含 Worker POC 实测日志。
