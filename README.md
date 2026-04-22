# ImgPull

ImgPull 是一个“海外容器镜像国内获取与分发平台”。

它的核心流程是：

1. 用户在首页或控制台搜索镜像。
2. 系统优先查询本地 Harbor 默认缓存仓库。
3. 如果本地没有命中，再回退到 Docker Hub 搜索。
4. 镜像先进入默认缓存仓库。
5. 系统再把镜像分发到用户自己的专属命名空间。
6. 用户在控制台复制 `docker`、`nerdctl` 或 `crictl` 拉取命令，在自己的服务器上拉取镜像。

## 当前目录结构

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

## 首次安装

系统已支持首装引导。

未安装时，访问首页会自动跳转到：

```text
/install
```

安装页支持：

- 站点标题
- 站点副标题
- 管理员邮箱
- SQLite 路径
- MySQL 5 - 8 参数填写与连接测试
- Harbor 可选配置
- Harbor 连接测试
- 将安装配置写入 `config/app.config.json`

## 数据库说明

### SQLite

当前代码仍兼容仓库中的旧 SQLite 数据库：

```text
kubeaszpull.db
```

适合场景：

- 本地测试
- 单机部署
- 轻量初期运行

不建议用于：

- 高并发生产环境
- 多实例共享写入场景

### MySQL

当前版本已经支持：

- 安装时填写 MySQL 参数
- MySQL 连接测试
- MySQL 配置保存

当前限制：

- 运行时主要业务逻辑仍然优先兼容 SQLite 路径
- MySQL 目前属于“安装层准备完成”，还不是“运行层完全迁移完成”

也就是说，当前 MySQL 状态是：

- 可配置
- 可测试
- 可保存
- 暂未完全接管运行时业务

## 启动方式

安装依赖：

```bash
npm install
```

启动：

```bash
npm start
```

默认端口：

```text
3001
```

自定义端口：

```bash
PORT=8080 npm start
```

## 主要页面路径

- `/install`
- `/`
- `/console`
- `/deliveries`
- `/admin`

旧路径仍保留跳转兼容：

- `/v2`
- `/v2/console`
- `/v2/deliveries`
- `/v2/admin`

## 当前已完成整理

- 移除旧的 `v2` 页面文件命名
- 将首页、控制台、交付页、后台改为正式入口文件
- 新增首装引导
- 新增安装阶段数据库测试与 Harbor 测试
- 新增后台 Harbor 配置保存与连接测试
- 保留旧路径跳转，减少升级时的页面断链

## 下一步建议

1. 完成运行时 MySQL 支持，而不只是安装与测试层支持。
2. 将逻辑任务流替换为真实 Harbor / Docker 执行链路。
3. 接入 SMTP，让串码购买后可以自动发邮件。
4. 继续清理历史文案和部分旧数据模型命名。
