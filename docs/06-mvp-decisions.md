# 06 MVP 决策

## P0 目标

P0 目标是完成可演示的产品闭环：

- 前台官网和产品说明。
- 用户后台完整任务流程。
- 管理员后台基础运营和节点管理。
- Mock Auth。
- Mock Data。
- 轻量批量导入。
- 多目标项目选择。
- 帮助文档中心。
- Footer、备案和合规占位。
- Backend scaffold。
- Worker POC 脚本准备。

当前不要求真实上线，不做真实镜像复制。

## 技术决策

前端：

- Next.js
- React
- TypeScript
- Tailwind CSS
- Mock data

后端脚手架：

- Node.js
- TypeScript
- NestJS
- Fastify adapter
- PostgreSQL
- Prisma
- Redis

Worker POC：

- Skopeo inspect / copy
- Crane copy
- Digest verify

## P0 已纳入

### 用户流程

- 注册 / 登录演示。
- 用户配置私有仓库。
- 用户维护项目 / namespace。
- 新建单个镜像任务。
- 批量粘贴镜像地址。
- 多目标项目选择。
- 积分预估和冻结说明。
- 任务列表、任务详情、日志、错误码。
- tag pull 和 digest pull。
- 消息中心。
- 积分中心和订单记录。

### 管理员流程

- 用户管理。
- 任务管理。
- Worker 节点管理。
- 积分管理。
- 人工充值。
- 订单管理。
- 活动管理。
- 公告管理。
- Markdown 帮助文章管理。
- 错误码管理。
- 系统配置。
- 操作日志。
- 系统健康。

### 商业闭环

- 注册赠送积分。
- 活动赠送积分。
- 管理员人工充值。
- 积分冻结、结算、失败返还。
- 支付宝 / 微信支付模型和 UI 预留。

## P0 不做

- 不接真实后端 API。
- 不接真实数据库运行闭环。
- 不接真实 Worker。
- 不执行 registry copy。
- 不接真实支付。
- 不接支付 SDK。
- 不生成支付二维码。
- 不接云厂商 OpenAPI。
- 不接 Harbor API。
- 不自动读取 namespace / project。
- 不自动创建 namespace / project。
- 不做真实凭据下发。
- 不做真实调度器。
- 不做 CSV / Excel 上传。
- 不做 docker-compose / Kubernetes YAML 解析。
- 不做定时同步。
- 不做批量模板。
- 不做团队空间和权限系统。

## 为什么 P0 不接真实 Worker

真实 Worker 涉及：

- 任务 claim / lease。
- Worker token。
- 凭据解密和短期下发。
- skopeo / crane 真实执行。
- 失败重试。
- digest 校验。
- 成本统计。
- 积分结算。
- 安全审计。

这些能力需要先完成后端运行闭环和 Worker POC 实测，再进入真实 Worker 设计。

## 为什么 P0 不自动读取 namespace

项目 / namespace 自动读取依赖 Harbor API 或云厂商 OpenAPI。不同厂商 API、权限、区域、实例 ID、错误码都不同。

P0 先采用手动维护，保证产品流程可演示；P1 再逐步接 provider adapter。

## 当前冻结状态

当前版本冻结为：

```text
P0 前端演示版 + backend 脚手架基线 + Worker POC 准备版
```

这不是正式上线版本。

## 下一步建议

1. 前端人工评审和视觉收口。
2. 后端第一批运行闭环：Docker、PostgreSQL、Redis、Prisma migrate、seed、health。
3. Worker POC 实测。
4. 真实 Worker 设计。
5. 支付和生产安全设计。
