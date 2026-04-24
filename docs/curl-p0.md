# Curl 测试示例

## 1. 注册

```bash
curl -X POST http://127.0.0.1:3001/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"StrongPass123!\"}"
```

## 2. 登录

```bash
curl -X POST http://127.0.0.1:3001/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"demo\",\"password\":\"StrongPass123!\"}"
```

## 3. 新增目标仓库

```bash
curl -X POST http://127.0.0.1:3001/api/v1/registries ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"我的 Harbor\",\"registry_type\":\"harbor\",\"registry_host\":\"harbor.example.com\",\"region\":\"cn-hz\",\"namespace_name\":\"demo\",\"username\":\"admin\",\"secret\":\"your-password\",\"is_default\":true}"
```

## 4. 测试目标仓库连接

```bash
curl -X POST http://127.0.0.1:3001/api/v1/registries/1/test ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. 创建同步任务

```bash
curl -X POST http://127.0.0.1:3001/api/v1/sync-tasks ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"registry_account_id\":1,\"overwrite_on_exists\":true,\"images\":[\"nginx:latest\",\"redis:7\"]}"
```

## 6. 查询任务列表

```bash
curl -X GET "http://127.0.0.1:3001/api/v1/sync-tasks?page=1&page_size=15" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. 查询任务详情

```bash
curl -X GET http://127.0.0.1:3001/api/v1/sync-tasks/1 ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 8. 取消任务

```bash
curl -X POST http://127.0.0.1:3001/api/v1/sync-tasks/1/cancel ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 9. 重试任务

```bash
curl -X POST http://127.0.0.1:3001/api/v1/sync-tasks/1/retry ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 10. 执行一轮 Worker

```bash
curl -X POST http://127.0.0.1:3001/internal/worker/cycle ^
  -H "Content-Type: application/json" ^
  -H "X-Worker-Token: YOUR_INTERNAL_WORKER_TOKEN" ^
  -d "{\"node_code\":\"local-node\",\"node_name\":\"本地节点\",\"region\":\"cn-local\"}"
```

## 11. 获取我的镜像

```bash
curl -X GET "http://127.0.0.1:3001/api/v1/my-images?page=1&page_size=15" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```
