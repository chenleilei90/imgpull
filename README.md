# ImgPull

ImgPull 是一个“海外容器镜像国内获取与分发平台”。

它的核心流程是：

1. 用户搜索镜像。
2. 系统优先检查本地 Harbor 默认缓存仓库。
3. 本地没有时，再回源到 Docker Hub。
4. 镜像先进入默认缓存仓库。
5. 系统再把镜像分发到用户自己的专属命名空间。
6. 用户在控制台复制 `docker`、`nerdctl` 或 `crictl` 拉取命令，在自己的服务器上拉取镜像。

## 目录结构

```text
imgpull/
├─ config/
├─ docs/
│  └─ INSTALL.md
├─ public/
│  ├─ install.html
│  ├─ index.html
│  ├─ console.html
│  ├─ deliveries.html
│  └─ admin.html
├─ package.json
├─ README.md
└─ server.js
```

## 环境要求

- Node.js 18 或更高版本
- Windows、Linux、macOS 均可运行
- 如果要接 Harbor，请准备 Harbor 地址、账号和密码
- 如果要测试或使用 MySQL，请准备 MySQL 5 到 8 的连接信息
- 如果要启用邮件发送，请准备 SMTP 主机、端口、账号、密码和发件邮箱
- 如果要启用真实分发链路，请确认部署机器已经安装 Docker，并且服务进程有权限执行：
  - `docker login`
  - `docker pull`
  - `docker tag`
  - `docker push`

## 安装方式

1. 安装依赖

```bash
npm install
```

2. 启动服务

```bash
npm start
```

3. 默认端口

```text
3001
```

4. 自定义端口

Linux / macOS:

```bash
PORT=8080 npm start
```

Windows PowerShell:

```powershell
$env:PORT=8080
npm start
```

更完整的安装说明见：

- [docs/INSTALL.md](docs/INSTALL.md)

## 首次安装

未安装时，访问首页会自动跳转到：

```text
/install
```

安装页支持：

- 站点标题
- 站点副标题
- 管理员邮箱
- 数据库类型选择
  - SQLite
  - MySQL 5 到 8
- SQLite 文件路径
- MySQL 主机、端口、数据库、用户名、密码
- Harbor 可选配置
- Harbor 连接测试

安装配置会保存到：

```text
config/app.config.json
```

## 数据库说明

### SQLite

当前版本继续兼容仓库里的历史 SQLite 数据。

适合：

- 本地测试
- 单机部署
- 轻量试运行

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
- MySQL 目前已具备安装配置能力，但运行时还未完全切换

## 主要页面

- `/install` 首次安装页
- `/` 前台首页
- `/console` 用户控制台
- `/deliveries` 已交付镜像页
- `/admin` 管理后台

兼容入口仍保留：

- `/v2`
- `/v2/console`
- `/v2/deliveries`
- `/v2/admin`

## 当前已实现

- 正式入口文件整理完成
- 删除旧版 `v2` 页面命名
- 接入首次安装流程
- 支持安装时选择 SQLite 或 MySQL
- 支持 Harbor 可选配置和连接测试
- 支持 SMTP 邮件配置、连接测试与串码邮件发送
- 首页支持串码输入与购买串码
- 用户控制台支持镜像搜索、项目管理、我的镜像、任务查看
- 交付页支持复制专属镜像拉取命令
- 后台支持基础设置、Harbor 配置、SMTP 配置、执行链路配置、缓存与任务概览
- 支持将排队任务推进成真实的 Docker 执行链路
  - `docker login`
  - `docker pull`
  - `docker tag`
  - `docker push`
- 支持后台自动轮询执行排队任务

## 当前建议

1. 继续完善 MySQL 运行时支持，而不只是安装与测试层支持。
2. 继续补 Harbor API 级同步和任务日志细化能力。
3. 继续补后台广告位、SEO、备案和内容管理能力。
