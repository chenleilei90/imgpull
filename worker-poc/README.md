# Worker POC 实测工具

本目录用于后续在真实测试环境验证 Skopeo / Crane 是否能完成 `registry-to-registry copy`。

当前目录不是正式 Worker：

- 不接平台后端。
- 不接数据库。
- 不接任务队列。
- 不接真实用户系统。
- 不接积分结算。
- 不接 Worker lease。
- 不接凭据下发。
- 不实现真实调度。
- 不保存任何真实密钥。

## 目录结构

```text
worker-poc/
  README.md
  env.example
  .gitignore
  scripts/
    00-check-tools.sh
    01-inspect-source.sh
    02-copy-skopeo.sh
    03-copy-crane.sh
    04-verify-target-digest.sh
    05-run-matrix.sh
    common.sh
  results/
    .gitkeep
    REPORT_TEMPLATE.md
```

## 安装工具

测试机需要安装：

- `skopeo`
- `crane`
- `jq`

可选：

- `docker`，仅用于本机准备 auth 或人工排障，POC 脚本不强制依赖。

检查命令：

```bash
bash worker-poc/scripts/00-check-tools.sh
```

## 配置环境

复制示例配置：

```bash
cp worker-poc/env.example worker-poc/.env
```

示例变量：

```env
SOURCE_IMAGE=docker.io/library/nginx:latest
TARGET_IMAGE=registry.example.com/project/nginx:latest
TARGET_IMAGE_CRANE=registry.example.com/project/nginx-crane:latest

SOURCE_AUTHFILE=
TARGET_AUTHFILE=

COPY_ALL_ARCH=true
PLATFORM=linux/amd64

SKOPEO_EXTRA_ARGS=
CRANE_EXTRA_ARGS=

RESULT_DIR=worker-poc/results
```

不要把真实账号、密码、token、AccessKey 写入项目文件。

`.env`、authfile、secret 文件不应提交，也不应进入交付包。

## Authfile 准备

Skopeo 可以使用 authfile：

```env
TARGET_AUTHFILE=/tmp/imgpull-poc/target-auth.json
```

要求：

- 只在 `.env` 中引用 authfile 路径。
- 不查看或输出 authfile 内容。
- 不把 authfile 放到项目目录。
- 不把账号密码写进 README、脚本、日志或报告。

Crane 的认证方式需要单独确认：

- 可使用临时 Docker config。
- 可使用 `crane auth login`。
- 不假设一定能复用 Skopeo authfile。

## 第一轮建议测试顺序

先测试单平台，降低带宽和排错成本：

```env
COPY_ALL_ARCH=false
PLATFORM=linux/amd64
```

执行：

```bash
bash worker-poc/scripts/01-inspect-source.sh
bash worker-poc/scripts/02-copy-skopeo.sh
bash worker-poc/scripts/04-verify-target-digest.sh
```

如果 Skopeo copy 成功，再执行 Crane 备用路径：

```bash
bash worker-poc/scripts/03-copy-crane.sh
```

单平台成功后，再测试多架构：

```env
COPY_ALL_ARCH=true
```

## 测试矩阵

第一轮建议：

- Docker Hub 公开镜像 -> 测试仓库。
- GHCR 公开镜像 -> 测试仓库。
- 多架构镜像。
- 单平台镜像。
- 目标认证失败。
- 目标 namespace 不存在。
- 目标无 push 权限。
- Harbor 自签名证书。
- 中断 copy。

GHCR 镜像不要在文档里写死不确定地址，实测时由测试人员确认可访问镜像。

失败场景要使用隔离账号和隔离配置：

- 正常 copy 使用正常 push robot account。
- 认证失败使用错误 authfile。
- 无 push 权限使用只有 pull 权限的 robot account。
- namespace 不存在使用不存在的测试 project / namespace。
- Harbor 自签名证书记录为 `REGISTRY_TLS_ERROR`，P0 不要求支持普通用户配置自签证书。

不要使用生产仓库、生产账号或生产权限。

## 结果记录

每轮测试记录：

- source image。
- target image。
- skopeo inspect 结果。
- skopeo copy 是否成功。
- crane copy 是否成功。
- source digest。
- target digest。
- digest 是否一致。
- 不一致原因判断。
- 错误日志路径。
- 是否能映射到平台错误码。

报告模板：

```text
worker-poc/results/REPORT_TEMPLATE.md
```

## 成功标准

- skopeo inspect 能拿到 source digest。
- skopeo copy 至少成功推送一个公开镜像到目标仓库。
- crane copy 至少验证一个备用路径。
- verify 能拿到 target digest。
- 至少 3 个失败场景能输出可识别错误。

## 安全要求

- 不提交 `.env`。
- 不提交 authfile。
- 不提交真实账号、密码、token、AccessKey。
- 不输出 authfile 内容。
- 不把测试日志里的敏感字段打包。
- `worker-poc/results/` 交付时只保留 `.gitkeep` 和 `REPORT_TEMPLATE.md`。
