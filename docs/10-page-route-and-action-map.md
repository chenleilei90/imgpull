# 10 页面路由与操作地图

## 公共路由

| 路由 | 页面 | P0 操作 |
| --- | --- | --- |
| `/` | 首页 | 了解产品、进入控制台、查看价格 |
| `/product` | 产品介绍 | 查看能力、流程、安全边界 |
| `/pricing` | 价格会员 | 查看积分、充值包、会员权益 |
| `/registries` | 支持仓库 | 查看 ACR / TCR / SWR / 火山云 / Harbor / Registry 支持说明 |
| `/help` | 帮助文档中心 | 搜索、按分类查看文章 |
| `/help/articles/:slug` | 帮助文章详情 | 阅读 Markdown 文章、查看相关文章 |
| `/error-codes` | 错误码中心 | 查询错误码和处理建议 |
| `/terms` | 服务条款 | 展示上线前占位条款 |
| `/privacy` | 隐私政策 | 展示上线前占位隐私说明 |
| `/login` | 登录 | 普通用户 / 管理员演示入口 |
| `/register` | 注册 | 前端演示注册入口 |

## 用户后台路由

| 路由 | 页面 | P0 操作 |
| --- | --- | --- |
| `/dashboard` | 用户仪表盘 | 查看积分、任务、仓库、消息 |
| `/dashboard/tasks/new` | 新建镜像任务 | 单个任务、批量导入、多目标项目选择 |
| `/dashboard/tasks` | 任务列表 | 搜索 taskNo / batchNo / 镜像地址，查看状态 |
| `/dashboard/tasks/:id` | 任务详情 | 查看结果、pull 命令、digest、日志、积分 |
| `/dashboard/registries` | 私有仓库管理 | 添加仓库、测试连接、维护项目 / namespace |
| `/dashboard/points` | 积分中心 | 查看余额、冻结、充值包、人工充值说明 |
| `/dashboard/orders` | 订单记录 | 查看人工充值和支付预留订单 |
| `/dashboard/activities` | 活动中心 | 查看活动和领取积分 |
| `/dashboard/messages` | 消息中心 | 查看站内消息和系统公告 |
| `/dashboard/settings` | 账号设置 | 查看账号信息和演示设置 |

## 管理员后台路由

| 路由 | 页面 | P0 操作 |
| --- | --- | --- |
| `/admin` | 管理员仪表盘 | 查看任务、用户、积分、系统摘要 |
| `/admin/tasks` | 任务管理 | 搜索 taskNo / batchNo / 用户 / 镜像，查看任务 |
| `/admin/tasks/:id` | 管理员任务详情 | 查看任务结果、Worker、失败原因 |
| `/admin/workers` | Worker 节点管理 | 节点统计、筛选、详情、编辑、注册指引、生命周期 mock |
| `/admin/users` | 用户管理 | 查看用户列表和详情 |
| `/admin/points` | 积分管理 | 查看流水、人工充值入口 |
| `/admin/orders` | 订单管理 | 查看订单、关闭订单 mock |
| `/admin/activities` | 活动管理 | 活动列表、启用、禁用 mock |
| `/admin/announcements` | 公告管理 | Markdown 公告管理 mock |
| `/admin/docs` | 帮助文档管理 | Markdown 文章新建、编辑、发布、下线、预览 |
| `/admin/error-codes` | 错误码管理 | 错误码维护 mock |
| `/admin/config` | 系统配置 | 基础、任务、计费、Worker、支付、通知、站点合规配置 |
| `/admin/audit-logs` | 操作日志 | 查看管理员操作日志 |
| `/admin/health` | 系统健康 | 查看服务和节点健康展示 |

## `/dashboard/tasks/new`

P0 操作：

- 单个镜像 Tab。
- 批量导入 Tab。
- 目标仓库选择。
- 项目 / namespace 搜索和多选。
- 摘要展示源镜像数、目标项目数、将创建任务数、预计冻结积分。
- 超过 50 个源镜像、3 个目标项目或 150 条任务时禁用提交。

规则：

```text
任务数 = 源镜像数 x 目标项目数
```

每条任务独立创建 ImageTask。

## `/dashboard/tasks`

显示：

- taskNo。
- batchNo。
- 单个任务 / 批量导入。
- sourceImage。
- targetImage。
- 目标项目。
- 状态 / 结果。
- 积分摘要。

搜索：

- taskNo。
- batchNo。
- 镜像地址。

taskNo 搜索大小写和横线不敏感。

## `/dashboard/tasks/:id`

第一层展示用户结果：

- taskNo。
- batchNo 和 batchIndex。
- 当前结果。
- sourceImage。
- targetImage。
- tag pull。
- digest pull。
- 积分冻结、消耗、返还。
- 错误说明和下一步建议。

第二层展示技术信息：

- task_status。
- billing_status。
- worker_status。
- current_stage。
- attempt。
- source digest。
- target digest。
- 阶段日志。
- 错误码。

## `/admin/workers`

P0 包含：

- 统计卡片点击过滤。
- 搜索 / 状态 / 执行器筛选。
- 只看运行中节点。
- 新增节点 Drawer。
- 编辑节点 Drawer。
- 节点详情 Drawer。
- 注册指引。
- 测试连接 mock。
- 模拟心跳。
- 生命周期操作确认。
- 软删除和恢复。
- 运行中任务展示。

说明：

- Worker 节点由管理员统一管理。
- 用户侧不提供添加 Worker 节点。
- 用户新建任务页只显示 Worker 可用性提示。
- 当前没有真实 Worker 程序或镜像。

## `/admin/docs`

P0 是基础 Markdown 帮助文章管理：

- 搜索文章。
- 分类筛选。
- 状态筛选。
- 新建文章。
- 编辑文章。
- 发布 / 下线。
- 预览。
- Markdown 编辑器。

P1 才做：

- 版本历史。
- 富文本模板。
- 审批流。
- 多语言。
- 附件上传。
- 后端全文搜索。

## Footer 和法务路由

Footer 链接：

- 服务条款：`/terms`
- 隐私政策：`/privacy`
- 用户协议：`/terms`
- 数据安全说明：`/privacy` 或 `/product`

备案：

- ICP 备案号待配置。
- 公安备案号待配置。

当前不写真实备案号。
