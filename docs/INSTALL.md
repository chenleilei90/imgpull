# ImgPull 安装文档

## 1. 环境要求

- Node.js 18 或更高版本
- 支持 Windows、Linux、macOS
- 如果要对接 Harbor，请准备：
  - Harbor 地址
  - Harbor 账号
  - Harbor 密码
- 如果要测试或使用 MySQL，请准备：
  - MySQL 5 到 8 的主机、端口、库名、账号、密码
- 如果要开启邮件发送，请准备：
  - SMTP 主机
  - SMTP 端口
  - SMTP 用户名
  - SMTP 密码或授权码
  - 发件邮箱
- 如果要开启真实镜像执行链路，请确认部署机器已经安装 Docker，并且服务进程有权限执行：
  - `docker login`
  - `docker pull`
  - `docker tag`
  - `docker push`

## 2. 安装依赖

```bash
npm install
```

## 3. 启动服务

```bash
npm start
```

默认端口：

```text
3001
```

自定义端口：

Linux / macOS:

```bash
PORT=8080 npm start
```

Windows PowerShell:

```powershell
$env:PORT=8080
npm start
```

## 4. 首次安装流程

浏览器访问：

```text
http://127.0.0.1:3001
```

如果系统尚未安装，会自动跳转到：

```text
/install
```

安装页需要填写：

- 站点标题
- 站点副标题
- 管理员邮箱
- 数据库类型
  - SQLite
  - MySQL 5 到 8
- SQLite 文件路径
- MySQL 主机、端口、数据库、用户名、密码
- Harbor 可选配置
  - 是否在安装时启用
  - Harbor 地址
  - 默认缓存仓库名
  - Harbor 用户名
  - Harbor 密码

安装页支持：

- 数据库连接测试
- Harbor 连接测试
- 保存安装配置

安装配置会写入：

```text
config/app.config.json
```

## 5. 安装完成后的主要页面

- 首页：`/`
- 安装页：`/install`
- 用户控制台：`/console`
- 已交付镜像页：`/deliveries`
- 后台管理页：`/admin`

兼容入口仍保留：

- `/v2`
- `/v2/console`
- `/v2/deliveries`
- `/v2/admin`

## 6. 数据库说明

### SQLite

当前项目继续兼容历史 SQLite 数据库：

```text
kubeaszpull.db
```

适合：

- 本地测试
- 单机试运行
- 轻量部署

不建议直接用于：

- 高并发生产环境
- 多实例共享写入场景

### MySQL

当前版本已经支持：

- 安装时填写 MySQL 参数
- 安装页测试 MySQL 连接
- 保存 MySQL 配置

当前限制：

- 运行时主业务逻辑仍以 SQLite 兼容路径为主
- MySQL 目前主要完成了安装和测试层支持，运行时还未完全切换

## 7. Harbor、SMTP 与执行链路说明

当前版本已经支持：

- Harbor 配置保存
- Harbor 连接测试
- SMTP 配置保存
- SMTP 连接测试
- 购买串码后按配置尝试发送邮件
- 后台启用真实执行链路后，通过 Docker 执行：
  - `docker login`
  - `docker pull`
  - `docker tag`
  - `docker push`
- 后台自动轮询执行排队任务

当前限制：

- 真实 Harbor API 级同步仍需继续完善
- 真实执行链路已经接上，但仍建议先在测试环境验证 Docker 权限、Harbor 权限和仓库路径策略

## 8. 部署建议

建议按下面顺序试跑：

1. 先用 SQLite 跑通完整安装流程。
2. 再在后台补 Harbor、SMTP 和执行链路配置，并逐项测试。
3. 先用一个测试镜像验证分发任务。
4. 等业务流程稳定后，再继续推进 MySQL 运行时支持。
