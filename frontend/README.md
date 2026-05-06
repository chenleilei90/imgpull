# ImgPull Frontend

This is the projectized P0 static UI prototype for ImgPull.

## Scope

- React + TypeScript + Next.js + Tailwind CSS.
- Static mock data only.
- No real backend, database, login auth, payment SDK, Worker scheduler, or registry copy.
- `worker-poc/` remains deferred and is not part of this frontend runtime.

## Commands

```bash
npm install
npm run build
npm run lint
npm run typecheck
```

## Route Groups

- Public site: home, product, pricing, supported registries, help, error codes, login, register.
- User dashboard: dashboard, tasks, task detail, registries, points, orders, activities, messages, settings.
- Admin dashboard: dashboard, tasks, workers, users, points, orders, activities, announcements, help, error codes, config, audit logs, health.

All data comes from `lib/mock-data.ts`.
