# ImgPull 安装文档

## 1. 环境要求

- Node.js 18 及以上
- 支持 Windows、Linux、macOS
- 如需接入 Harbor，请准备：
  - Harbor 地址
  - Harbor 管理账号
  - Harbor 密码
- 如需安装时测试 MySQL，请准备：
  - MySQL 5 到 8 的主机、端口、库名、账号、密码

## 2. 安装依赖

```bash
npm install
```

## 3. 启动服务

```bash
npm start
```

默认监听端口：

```text
3001
```

如需自定义端口：

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

安装页需要填写的内容包括：

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
- 交付镜像页：`/deliveries`
- 后台管理页：`/admin`

旧路径仍兼容跳转：

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

当前版本已支持：

- 安装时填写 MySQL 参数
- 安装页测试 MySQL 连接
- 保存 MySQL 配置

当前限制：

- 运行时主逻辑仍以 SQLite 兼容路径为主
- 也就是说，MySQL 目前主要完成了安装和测试层支持，还没有把整套业务运行时完全切过去

## 7. Harbor 说明

当前版本已支持：

- 安装页 Harbor 可选配置
- 后台 Harbor 配置保存
- Harbor 连接测试

当前限制：

- 真实 Harbor API 联动仍需继续完善
- `pull -> cache -> tag/push` 的真实执行链路仍在后续补齐

## 8. 当前可用能力

- 首页输入串码
- 首页购买串码
- 用户控制台镜像搜索
- 用户项目管理
- 我的镜像查看
- 交付镜像查看
- 后台基础设置
- 后台 Harbor 设置
- 后台缓存与任务概览

## 9. 部署建议

建议先按下面顺序试跑：

1. 先用 SQLite 跑通完整安装流程
2. 再在后台补 Harbor 配置并测试连接
3. 等业务流程确认稳定后，再继续推进 MySQL 运行时支持和真实 Harbor 执行链路
