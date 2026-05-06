# ImgPull Backend Baseline

P0 backend scaffold for ImgPull. This project is still a baseline service; it only implements the first backend running loop.

## Scope

- NestJS + Fastify + TypeScript.
- PostgreSQL via Prisma.
- Redis reserved for session/cache, rate limit, idempotency short cache, and Worker heartbeat/lease helpers.
- First-batch APIs read local Prisma seed data for health, auth, users, admins, and system configs.

## Explicitly Not Implemented

- No real Worker execution.
- No real registry copy.
- No real registry credential dispatch.
- No real Alipay or WeChat Pay SDK.
- No production registry integration.
- No reliable task queue or Worker scheduler.

## Auth Boundary

P0 auth is designed around opaque session tokens. Only token hashes are stored. `JWT_SECRET` is present in `.env.example` only as a reserved future setting and must not be mixed into the P0 session flow.

## Local Seed Accounts

These accounts are for local development only and must not be used in production:

```text
User account: ops@example.test
User password: local-user-pass-2026

Admin account: super_admin
Admin password: local-admin-pass-2026
Admin role: super_admin
```

The seed writes password hashes only. It does not store plaintext passwords or session tokens.

## Commands

```bash
npm install
cp .env.example .env
docker compose up -d postgres redis
npx prisma validate
npx prisma migrate dev --name init_p0_baseline
npx prisma generate
npx prisma db seed
npm run typecheck
npm run lint
npm run build
npm run start:dev
```

## First Batch Smoke

```bash
export SMOKE_USER_ACCOUNT=ops@example.test
export SMOKE_USER_PASSWORD=local-user-pass-2026
export SMOKE_ADMIN_ACCOUNT=super_admin
export SMOKE_ADMIN_PASSWORD=local-admin-pass-2026
bash scripts/smoke-first-batch.sh
```

The smoke script masks session tokens and never prints passwords, `.env`, database URLs, or credential files.
