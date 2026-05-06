# 15 Worker 节点生命周期

## 当前阶段说明

当前 `/admin/workers` 只是前端演示页面：

- 当前没有真实 Worker 程序。
- 当前没有真实 Worker 镜像。
- 当前不会真的启动 Worker。
- 当前不会真的拉取或推送镜像。
- 新增节点、测试连接、模拟心跳都是前端 mock。

真实同步镜像必须等后续完成 backend 运行闭环和 Worker 程序。

## Worker 节点是什么

Worker 节点本质上是一台能执行镜像同步任务的服务器、虚拟机、容器实例或后续 Kubernetes Pod。

管理员负责部署和管理 Worker 节点。普通用户不添加 Worker 节点。用户只配置自己的私有仓库并提交任务。

## 生命周期状态

| 状态 | 含义 | 是否接新任务 |
| --- | --- | --- |
| pending | 等待注册 | 否 |
| online | 在线可调度 | 是 |
| offline | 心跳丢失或不可达 | 否 |
| maintenance | 维护中 | 否 |
| draining | 排空中 | 否 |
| disabled | 禁用 | 否 |
| retired | 退役 | 否 |
| deleted | 软删除 | 否 |

## 生命周期操作

pending：

- 查看注册指引。
- 禁用。

online：

- 进入维护。
- 排空。
- 禁用。

maintenance：

- 恢复上线。
- 禁用。

draining：

- 恢复上线。
- 退役。

offline：

- 禁用。
- 退役。

disabled：

- 启用。
- 退役。

retired：

- 软删除。

deleted：

- 已软删除，不参与调度。
- 可以恢复或最终清理占位。

风险操作必须有确认文案。

## 注册指引

P0 前端只展示未来部署方式占位。

### Linux 服务器部署

```bash
IMGPULL_API_ENDPOINT=https://api.example.com \
IMGPULL_WORKER_TOKEN=worker_token_demo_**** \
IMGPULL_EXECUTOR=skopeo \
./imgpull-worker
```

说明：

- `./imgpull-worker` 是未来要开发的 Worker 二进制。
- 当前不会真的运行。
- 服务器需要能访问平台 API、源 Registry 和目标 Registry。
- 服务器需要安装 skopeo / crane，或由未来 Worker 程序内置执行环境。

### Docker 容器部署

```bash
docker run -d --name imgpull-worker \
  -e IMGPULL_API_ENDPOINT=https://api.example.com \
  -e IMGPULL_WORKER_TOKEN=worker_token_demo_**** \
  -e IMGPULL_EXECUTOR=skopeo \
  registry.example.com/imgpull/worker:v0.1.0
```

说明：

- 这是未来 Worker 镜像占位。
- 当前没有真实镜像。
- 正式接入前要先开发 Worker 程序并构建发布镜像。
- token 必须 masked。
- 不展示真实 token。
- 不展示真实生产域名。

禁止使用 `imgpull/worker:latest` 这种看起来可真实拉取的镜像名。

## 真实 Worker 需要实现

- `imgpull-worker` 程序。
- heartbeat。
- claim。
- lease renew。
- control。
- credentials resolve。
- stage。
- logs。
- complete。
- fail。
- cancel ack。
- cleanup done。
- skopeo / crane registry-to-registry copy。
- 短期凭据和脱敏日志。
- 任务成功结算和失败返还。
- Docker 镜像或 Linux 二进制发布。

## 任务分配原则

真实阶段推荐 Worker 主动 claim：

- Worker 请求 `/api/worker/tasks/claim`。
- 只允许 online 节点领取任务。
- maintenance / draining / disabled / retired / deleted 节点不接新任务。
- `currentTasks < maxConcurrency` 才能接任务。
- 后端按负载、权重、标签和健康状态选择节点。
- Worker 执行期间续租 lease。
- Worker 完成后上报 complete 或 fail。

## 用户侧展示

用户新建任务页只显示：

```text
当前可用 Worker 节点：3 个。
任务会根据节点状态、并发、权重和队列长度自动排队执行。
```

如果没有可用节点：

```text
当前暂无可用 Worker 节点，任务提交后将进入队列，管理员恢复节点后继续执行。
```

用户后台不提供添加 Worker 节点入口。

## 安全要求

- Worker token 只保存 hash。
- 明文 token 只展示一次或以 masked 形式展示。
- 日志不输出 token。
- 不下发长期 registry 凭据。
- 每任务独立临时 authfile。
- 任务结束清理临时文件。
