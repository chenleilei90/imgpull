# 04 UI 页面与设计系统

## 当前 UI 状态

`frontend/` 是 P0 前端演示版，基于 Next.js、React、TypeScript 和 Tailwind。当前只使用 mock data 和 mock auth，不接真实后端。

## 设计方向

ImgPull 使用蓝白云原生 SaaS 风格：

- 企业级。
- 清爽。
- 可信。
- 适合 DevOps 和云平台产品。
- 避免大面积黑色、安全厂商风和内部调试感。

## 设计色板

- 主色：`#2563EB`
- 主色 hover：`#1D4ED8`
- 主色浅底：`#EFF6FF`
- 辅助色：`#06B6D4`
- 页面背景：`#F6F9FF` / `#F8FAFC`
- 卡片背景：`#FFFFFF`
- 默认边框：`#E2E8F0` / `#E5EAF3`
- 主文本：`#0F172A`
- 次文本：`#475569`
- 弱文本：`#64748B`

状态色：

- 成功：绿色。
- 执行中：蓝色。
- 排队：橙色。
- 失败：红色。
- 返还：青绿或绿色。
- 冻结：黄色 / 橙色。

## 圆角与动效

- 页面容器：12px。
- Card：10px - 12px。
- Button / Input / Select / Textarea：8px - 10px。
- Table 容器：10px - 12px。
- Modal / Drawer：12px。
- CodeBlock：10px。
- Badge 可使用 pill，但不要所有元素都 pill 化。

动效：

- 150ms - 200ms ease-out。
- Card hover 轻微上移。
- Button hover 颜色加深或边框变蓝。
- Table row hover 使用浅蓝灰背景。
- 支持 `prefers-reduced-motion`。

## 公共页面

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

公共页面使用 PublicLayout 和 Footer。

Footer 包含：

- 产品。
- 解决方案。
- 支持与资源。
- 公司与法律。
- 公司名称、ICP备案号、公安备案号占位。

当前不写真实备案号，正式上线前必须配置真实 ICP、公安备案、服务条款和隐私政策。

## 用户后台页面

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

用户后台要求：

- 中文状态优先。
- 首页突出积分、任务、仓库、消息和快速创建任务。
- 任务详情先展示用户结果，再展示技术信息。
- 新建任务支持单个镜像、轻量批量导入、多目标项目选择。
- 用户只能看到 Worker 可用性提示，不能添加 Worker 节点。

## 管理员后台页面

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

管理员后台要求：

- PageHeader、StatCard、Table、Toolbar、Drawer 视觉统一。
- 风险操作使用警示样式和确认。
- Worker 节点管理必须说明当前只是前端演示，不存在真实 Worker 程序或镜像。

## 帮助中心

P0 帮助中心不是 FAQ 卡片页，而是文档中心：

- 搜索。
- 分类导航。
- 文章列表。
- Markdown 文章详情页。

用户侧：

- `/help`：帮助文档中心。
- `/help/articles/[slug]`：文章详情。

管理员侧：

- `/admin/docs`：基础 Markdown 帮助文章管理。

P0 管理员文章管理支持：

- 新建。
- 编辑。
- 发布 / 下线。
- 预览。
- Markdown 编辑器。

当前使用前端 mock data，不接真实后端。

P1 才做高级 CMS：

- 版本历史。
- 富文本模板。
- 审批流。
- 多语言。
- 附件上传。
- 后端全文搜索。

## 组件要求

推荐复用：

- PageHeader
- PageShell
- SectionCard
- DataToolbar
- DataTable
- StatusBadge
- MetricCard
- DetailDrawer
- FormPanel
- CodeBlock
- Footer
- Sidebar
- MarkdownEditor

## 禁止出现在用户可见页面的文案

- mock data
- fake
- TODO
- seed
- 调试
- 骨架
- P0 设计边界
- 乱码
- `???`
- `imgpull/worker:latest`

可出现：

- 演示模式。
- 前端演示环境。
- 示例数据。
