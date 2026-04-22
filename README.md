# ImgPull

ImgPull is a Docker image fetch and distribution service for domestic mirror delivery.

Core flow:

1. Users search for an image on the homepage.
2. The system checks the local Harbor cache first.
3. If the image is missing locally, the system falls back to Docker Hub.
4. The image is stored in the default cache project.
5. The image is then distributed to the user's dedicated namespace.
6. The user copies a `docker`, `nerdctl`, or `crictl` command from the console and pulls it on their own server.

## Current structure

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

## First-time install

The app now supports a first-run install wizard.

When the system is not installed yet, opening the homepage will redirect to:

```text
/install
```

The install wizard supports:

- site title
- site subtitle
- admin email
- SQLite path
- MySQL 5 - 8 connection test
- optional Harbor config
- Harbor test connection
- writing install config to `config/app.config.json`

## SQLite note

The current codebase still keeps compatibility with the existing SQLite database file:

```text
kubeaszpull.db
```

This is useful for:

- local testing
- single-machine deployment
- lightweight early-stage operation

But it is not recommended for high-concurrency production use.

The install page already shows this as a warning.

## MySQL note

The install layer already supports:

- MySQL parameter input
- MySQL connection test
- saving MySQL config

Current limitation:

- runtime business logic still primarily uses the existing SQLite-compatible path
- MySQL is prepared as install-time configuration, but full runtime migration is still a follow-up task

So the current MySQL status is:

- install-ready
- test-ready
- config-ready
- not fully runtime-migrated yet

## Start

Install dependencies:

```bash
npm install
```

Run:

```bash
npm start
```

Default port:

```text
3001
```

Override with env:

```bash
PORT=8080 npm start
```

## Main routes

- `/install`
- `/`
- `/console`
- `/deliveries`
- `/admin`

Legacy routes are still redirected:

- `/v2`
- `/v2/console`
- `/v2/deliveries`
- `/v2/admin`

## What has been normalized

- removed `v2` page filenames from the main flow
- promoted homepage, console, deliveries, and admin into canonical filenames
- added install wizard
- added install-time DB test and Harbor test endpoints
- added admin-side Harbor config save and test support
- kept old route redirects to reduce breakage

## Next recommended work

1. Finish full runtime MySQL support instead of config-only preparation.
2. Replace the logical task flow with real Harbor and Docker execution.
3. Add SMTP delivery so purchase codes can be mailed automatically.
4. Continue cleaning remaining legacy text and data model naming such as `user_projects_v2`.
