# ImgPull

ImgPull 是一个“海外容器镜像国内获取与分发平台”。

它的目标很明确：

1. 用户搜索需要的镜像。
2. 系统优先检查本地 Harbor 默认缓存仓库。
3. 如果本地没有命中，再回退到 Docker Hub 搜索。
4. 镜像先进入默认缓存仓库。
5. 系统再把镜像分发到用户自己的专属命名空间。
6. 用户在控制台复制 `docker`、`nerdctl` 或 `crictl` 拉取命令，在自己的服务器上拉取镜像。

## 目录结构

```text
imgpull-review/
├─ config/
│  └─ app.config.json
├─ public/
│  ├─ install.html
│  ├─ index.html
│  ├─ console.html
│  ├─ deliveries.html
│  └─ admin.html
├─ kubeaszpull.db
├─ package.json
└─ server.js
```

## 安装要求

- Node.js 18 及以上
- Windows、Linux、macOS 均可运行
- 如需使用 Harbor 联动，请准备 Harbor 管理地址、账号和密码
- 如需使用 MySQL，请准备 MySQL 5 到 MySQL 8 的连接信息

## 安装步骤

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

详细安装说明见：

- [docs/INSTALL.md](docs/INSTALL.md)

## 首次安装

系统已支持首装引导。

未安装时，访问首页会自动跳转到：

```text
/install
```

安装页支持以下内容：

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
- 将安装配置写入 `config/app.config.json`

## 数据库说明

### SQLite

当前项目继续兼容仓库里的历史 SQLite 数据库：

```text
kubeaszpull.db
```

适合场景：

- 本地测试
- 单机部署
- 轻量试运行

不建议用于：

- 高并发生产环境
- 多实例共享写入场景

### MySQL

当前版本已支持：

- 安装时填写 MySQL 参数
- 安装页测试 MySQL 连接
- 保存 MySQL 配置

当前限制：

- 运行时主业务逻辑仍以 SQLite 兼容路径为主
- 也就是说，MySQL 目前已经具备“安装配置能力”，但运行时支持还没有完全切换完成

## 主要页面

- `/install` 首次安装页
- `/` 前台首页
- `/console` 用户控制台
- `/deliveries` 已交付镜像页
- `/admin` 管理后台

旧路径仍保留兼容跳转：

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
- 后台支持基础设置、Harbor 配置、缓存与任务概览

## 下一步建议

1. 完善 MySQL 运行时支持，而不只是安装与测试层支持。
2. 接入真实 Harbor / Docker 的 `pull -> cache -> tag/push` 执行链路。
3. 继续补充后台广告位、SEO、备案和内容管理能力。
