# 09 最终产品基线

## 当前冻结版本

当前仓库基线：

```text
P0 前端演示版 + backend 脚手架基线 + Worker POC 准备版
```

当前只能演示页面和产品流程，不能真实同步镜像。

## P0 产品边界

P0 做：

- 完整前端页面。
- Mock Auth。
- Mock Data。
- 单个镜像任务。
- 轻量批量导入。
- 多目标项目选择。
- taskNo / batchNo 展示和搜索。
- 积分冻结、结算、返还展示。
- 管理员人工充值展示。
- Worker 节点管理 mock。
- 帮助文档中心。
- Markdown 帮助文章管理。
- Footer、备案和合规占位。
- Backend scaffold。
- Worker POC 脚本准备。

P0 不做：

- 真实后端运行闭环。
- 真实数据库连接。
- 真实 API。
- 真实 Worker。
- 真实 registry copy。
- 真实凭据下发。
- 真实支付。
- 云厂商 OpenAPI。

## 用户主流程

1. 用户登录演示账号。
2. 用户进入仪表盘查看积分、任务和消息。
3. 用户添加私有仓库和项目 / namespace。
4. 用户创建单个任务，或使用批量导入。
5. 用户选择一个或多个目标项目。
6. 系统展示任务数量、预计冻结积分和可用余额。
7. 用户提交任务。
8. 系统展示 batchNo 和 taskNo。
9. 用户在任务列表和任务详情查看同步结果。
10. 成功任务展示 tag pull 和 digest pull。
11. 失败任务展示错误码和积分返还。

## 管理员主流程

1. 管理员登录演示入口。
2. 管理员查看仪表盘和系统健康。
3. 管理员管理任务、用户、订单和积分。
4. 管理员人工充值。
5. 管理员管理 Worker 节点 mock。
6. 管理员维护公告、帮助文章和错误码。
7. 管理员配置站点、合规和系统参数。
8. 管理员查看操作日志。

## 任务状态

底层状态由四部分组成：

- `task_status`
- `billing_status`
- `worker_status`
- `current_stage`

前端组合展示为：

- 排队中。
- 执行中。
- 已成功。
- 已失败。
- 已返还。
- 已取消。

## 成功结果标准

任务成功页应展示：

- taskNo。
- sourceImage。
- targetImage。
- source digest。
- target digest。
- tag pull。
- digest pull。
- 积分冻结、消耗、返还。
- attempt。
- 阶段日志。

Digest 是稳定结果，tag 可能被覆盖。

## 失败结果标准

失败任务应展示：

- 错误码。
- 失败原因。
- attempt 日志。
- billing_status = refunded。
- 积分返还流水。
- 用户消息通知。

## Worker 说明

当前 `/admin/workers` 必须清晰提示：

- 当前只是前端演示。
- 没有真实 Worker 程序。
- 没有真实 Worker 镜像。
- 不会启动 Worker。
- 不会拉取或推送镜像。
- 新增节点、测试连接、模拟心跳都是 mock。

未来真实 Worker 需要：

- `imgpull-worker` 程序。
- heartbeat。
- claim。
- lease。
- stage。
- logs。
- complete / fail。
- skopeo / crane copy。
- 短期凭据。
- 结算和返还。

## 帮助中心基线

P0 帮助中心是文档中心：

- `/help`：搜索、分类、文章列表。
- `/help/articles/[slug]`：Markdown 文章详情。
- `/admin/docs`：基础 Markdown 文章管理。

P1 才做高级 CMS。

## 合规展示基线

P0 包含：

- Footer。
- 服务条款页。
- 隐私政策页。
- 公司名称占位。
- ICP 备案号待配置。
- 公安备案号待配置。

禁止伪造真实备案号或公司资质。

## 后续上线前必须补齐

- 后端运行闭环。
- 真实认证。
- 密码和 token hash。
- registry secret 加密。
- Worker token 校验。
- 真实 Worker。
- Worker POC 实测。
- 支付验签。
- 生产日志脱敏。
- 运维监控。
- 真实服务条款、隐私政策、ICP备案和公安备案。
