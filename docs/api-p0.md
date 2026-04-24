# P0 API 文档草案

Base URL:

```text
/api/v1
```

统一返回结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误返回结构：

```json
{
  "code": 40001,
  "message": "目标仓库认证失败",
  "data": null
}
```

## 1. 认证与用户

### 1.1 注册

- `POST /api/v1/auth/register`

请求体：

```json
{
  "username": "leilei",
  "email": "leilei@example.com",
  "password": "StrongPass123!"
}
```

返回：

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": 1
  }
}
```

### 1.2 登录

- `POST /api/v1/auth/login`

请求体：

```json
{
  "account": "leilei",
  "password": "StrongPass123!"
}
```

返回：

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "session-or-bearer-token",
    "user": {
      "id": 1,
      "username": "leilei",
      "email": "leilei@example.com",
      "user_type": "user"
    }
  }
}
```

### 1.3 登出

- `POST /api/v1/auth/logout`

### 1.4 获取当前用户

- `GET /api/v1/me`

返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "username": "leilei",
    "email": "leilei@example.com",
    "user_type": "user",
    "current_plan": {
      "code": "free",
      "name": "免费版"
    }
  }
}
```

### 1.5 发起找回密码

- `POST /api/v1/auth/password/forgot`

### 1.6 重置密码

- `POST /api/v1/auth/password/reset`

## 2. 我的仓库

### 2.1 获取仓库列表

- `GET /api/v1/registries`

查询参数：

- `page`
- `page_size`

### 2.2 新增仓库

- `POST /api/v1/registries`

请求体：

```json
{
  "name": "我的阿里云ACR",
  "registry_type": "acr",
  "registry_host": "registry.cn-hangzhou.aliyuncs.com",
  "region": "cn-hangzhou",
  "namespace_name": "leilei",
  "username": "leilei",
  "secret": "******",
  "remark": "默认仓库"
}
```

### 2.3 编辑仓库

- `PUT /api/v1/registries/{id}`

### 2.4 删除仓库

- `DELETE /api/v1/registries/{id}`

### 2.5 设为默认仓库

- `POST /api/v1/registries/{id}/set-default`

### 2.6 测试仓库连接

- `POST /api/v1/registries/{id}/test`

返回：

```json
{
  "code": 0,
  "message": "测试完成",
  "data": {
    "status": "success",
    "test_code": "ok",
    "test_message": "连接成功，具备Push权限"
  }
}
```

## 3. 镜像同步任务

### 3.1 创建同步任务

- `POST /api/v1/sync-tasks`

请求体：

```json
{
  "registry_account_id": 2,
  "overwrite_on_exists": true,
  "images": [
    "nginx:latest",
    "redis:7",
    "docker.io/library/mysql:8.0"
  ]
}
```

返回：

```json
{
  "code": 0,
  "message": "任务已创建",
  "data": {
    "task_id": 1001,
    "task_no": "T202604240001"
  }
}
```

### 3.2 获取任务列表

- `GET /api/v1/sync-tasks`

查询参数：

- `page`
- `page_size`
- `status`
- `keyword`
- `registry_account_id`
- `start_time`
- `end_time`

### 3.3 获取任务详情

- `GET /api/v1/sync-tasks/{id}`

### 3.4 获取任务明细日志

- `GET /api/v1/sync-task-items/{id}/logs`

### 3.5 取消任务

- `POST /api/v1/sync-tasks/{id}/cancel`

返回：

```json
{
  "code": 0,
  "message": "取消请求已提交",
  "data": {
    "task_id": 1001
  }
}
```

### 3.6 重试任务

- `POST /api/v1/sync-tasks/{id}/retry`

## 4. 我的镜像

### 4.1 获取我的镜像列表

- `GET /api/v1/my-images`

查询参数：

- `page`
- `page_size`
- `keyword`
- `registry_account_id`

### 4.2 获取单条镜像详情

- `GET /api/v1/my-images/{id}`

### 4.3 重新同步单条镜像

- `POST /api/v1/my-images/{id}/resync`

## 5. 控制台与套餐

### 5.1 获取控制台总览

- `GET /api/v1/dashboard`

返回数据建议包含：

- 今日同步次数
- 本月同步次数
- 成功率
- 当前套餐
- 剩余额度
- 默认仓库
- 最近任务

### 5.2 获取当前套餐与额度

- `GET /api/v1/billing/plan`

### 5.3 获取账单记录

- `GET /api/v1/billing/orders`

## 6. API Key

### 6.1 获取 API Key 列表

- `GET /api/v1/api-keys`

### 6.2 创建 API Key

- `POST /api/v1/api-keys`

请求体：

```json
{
  "name": "CI任务",
  "scope": "task:create,task:read,registry:read"
}
```

返回：

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "key": "sk_live_xxx_only_return_once"
  }
}
```

### 6.3 删除 API Key

- `DELETE /api/v1/api-keys/{id}`

## 7. Worker 内部接口

### 7.1 领取待执行任务

- `POST /internal/worker/tasks/claim`

### 7.2 回写任务状态

- `POST /internal/worker/task-items/{id}/status`

### 7.3 写入任务日志

- `POST /internal/worker/task-items/{id}/logs`

## 8. 状态枚举

### 8.1 任务主状态

- `pending_validate`
- `queued`
- `running`
- `partial_success`
- `success`
- `failed`
- `canceled`

### 8.2 任务明细状态

- `pending_validate`
- `validated`
- `queued`
- `pulling`
- `tagging`
- `pushing`
- `success`
- `failed`
- `canceled`
