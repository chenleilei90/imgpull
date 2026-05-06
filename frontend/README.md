# ImgPull Frontend

This is the projectized P0 static UI prototype for ImgPull.

## Scope

- React + TypeScript + Next.js + Tailwind CSS.
- Static mock data only.
- No real backend, database, login auth, payment SDK, Worker scheduler, or registry copy.
- `worker-poc/` remains deferred and is not part of this frontend runtime.

## Online Demo

Demo URL:

```text
https://www.iucloud.cn/
```

This deployment is the P0 frontend demo only:

- It uses mock data from `lib/mock-data.ts`.
- It does not connect to the real backend, database, payment provider, Worker, or registry.
- It cannot actually create image sync tasks, recharge points, start Worker nodes, or pull / push container images.
- Do not enter real registry passwords, tokens, AccessKeys, or production credentials in the demo environment.
- The login page provides mock user and admin demo entrances. Logging out clears the local mock session.

## Commands

```bash
npm install
npm run dev -- -H 0.0.0.0 -p 3001
npm run build
npm run lint
npm run typecheck
```

Production-style local preview after `npm run build`:

```bash
npx next start -H 127.0.0.1 -p 3001
```

## Route Groups

- Public site: home, product, pricing, supported registries, help, error codes, login, register.
- User dashboard: dashboard, tasks, task detail, registries, points, orders, activities, messages, settings.
- Admin dashboard: dashboard, tasks, workers, users, points, orders, activities, announcements, help, error codes, config, audit logs, health.

All data comes from `lib/mock-data.ts`.
