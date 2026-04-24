# Real Docker Executor Acceptance

Use this checklist on a machine that has Docker CLI access and a writable test registry.

## Required environment

```text
Docker CLI installed
docker pull works
docker tag works
docker login works for the target registry
docker push works for the target namespace/project
MySQL database initialized with schema.sql
```

## Start backend

```bash
EXECUTOR_DRIVER=docker npm start
```

PowerShell:

```powershell
$env:EXECUTOR_DRIVER="docker"
npm start
```

## Acceptance steps

1. Register a user.
2. Login and capture the token.
3. Add a real registry account with a test namespace/project.
4. Call `POST /api/v1/registries/:id/test`.
5. Create a sync task with a small Docker Hub public image, for example `hello-world:latest` or `nginx:alpine`.
6. Run `POST /internal/worker/cycle`.
7. Query `GET /api/v1/sync-tasks/:id`.
8. Query `GET /api/v1/my-images`.
9. Verify the target image can be pulled from the user registry.

## Expected successful status

```text
sync_tasks.status = success
sync_task_items.status = success
synced_images contains the target image
sync_task_logs contains pull, tag, login, push and logout messages
```

## Expected Docker command summary

The task log should correspond to:

```text
docker pull docker.io/library/<repo>:<tag>
docker tag docker.io/library/<repo>:<tag> <target-registry>/<namespace>/<repo>:<tag>
docker login <target-registry>
docker push <target-registry>/<namespace>/<repo>:<tag>
docker logout <target-registry>
```
