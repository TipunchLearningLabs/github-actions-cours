# 🧪 tasks-api — Environment Variables in GitHub Actions

> **Objective**: a minimal REST API (Node.js + Express + MongoDB Atlas) used as course support to practice **environment variables, variables and secrets in GitHub Actions**.
> **Prerequisites**: Node.js ≥ 22, pnpm, a free MongoDB Atlas cluster, a GitHub repository.
> **Workflow**: [`.github/workflows/C-01-tasks-api.yaml`](../.github/workflows/C-01-tasks-api.yaml)

## 📑 Table of Contents

1. [Mental Model](#-mental-model)
2. [Project Overview](#️-chapter-1-project-overview)
3. [Environment Variables](#-chapter-2-environment-variables)
4. [Run Locally](#️-chapter-3-run-locally)
5. [Tests](#-chapter-4-tests)
6. [GitHub Actions](#-chapter-5-github-actions)
7. [Exercises](#-chapter-6-exercises)
8. [Troubleshooting](#-troubleshooting)
9. [Best Practices](#-best-practices)
10. [Resources](#-resources)

------

## 🧠 Mental Model

The code never contains the connection string. It only reads `process.env`. **Who** fills `process.env` depends on where the code runs:

```text
                       ┌────────────────────────────┐
                       │   src/config.js            │
                       │   reads process.env        │
                       │   MONGODB_URI (required)   │
                       │   MONGODB_DB_NAME, PORT    │
                       └─────────────▲──────────────┘
                                     │
           ┌─────────────────────────┴──────────────────────────┐
           │                                                    │
   LOCAL (your laptop)                                 CI (GitHub Actions)
   ┌──────────────────┐                    ┌──────────────────────────────────┐
   │ .env (gitignored)│                    │ secrets.MONGODB_URI   (masked)   │
   │ loaded by        │                    │ vars.MONGODB_DB_NAME  (visible)  │
   │ process.load-    │                    │        │                         │
   │ EnvFile()        │                    │        ▼                         │
   └────────┬─────────┘                    │ jobs.<job>.env  →  process.env   │
            │                              └───────────────┬──────────────────┘
            └──────────────────┬───────────────────────────┘
                               ▼
                     ┌───────────────────┐
                     │  MongoDB Atlas    │
                     │  <db>        (app)│
                     │  <db>_test   (int)│
                     │  <db>_e2e    (e2e)│
                     └───────────────────┘
```

> **Analogy**: the application is a car and the environment variables are the ignition key. The same car (code) starts with a different key in each garage (local, CI, prod). You never weld the key to the dashboard.

| Value | Sensitive? | Local | GitHub Actions |
|---|---|---|---|
| `MONGODB_URI` | ✅ yes (password inside) | `.env` | **Secret** `secrets.MONGODB_URI` |
| `MONGODB_DB_NAME` | ❌ no | `.env` | **Variable** `vars.MONGODB_DB_NAME` |
| `PORT` | ❌ no | `.env` | workflow `env:` |

------

## 🏗️ Chapter 1: Project Overview

### 1.1 📂 Structure

```text
tasks-api/
├── src/
│   ├── config.js        # reads and validates environment variables
│   ├── db.js            # MongoDB connection
│   ├── validation.js    # pure payload validation (unit-tested)
│   ├── app.js           # Express routes (DB injected → testable)
│   └── server.js        # entry point: config → DB → HTTP server
├── tests/
│   ├── unit/            # Vitest, no database
│   └── integration/     # Vitest + Supertest, real MongoDB
├── e2e/                 # Playwright API tests against the running server
├── .env.example         # template, committed
├── .env                 # real values, gitignored
├── playwright.config.js
└── vitest.config.js
```

### 1.2 🛣️ Endpoints

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| `GET` | `/health` | Pings MongoDB, returns the DB name | 200 | 500 |
| `GET` | `/tasks` | Lists tasks (newest first) | 200 | — |
| `GET` | `/tasks/:id` | Gets one task | 200 | 404 |
| `POST` | `/tasks` | Creates `{ title, done? }` | 201 | 400 |
| `PATCH` | `/tasks/:id` | Updates `title` and/or `done` | 200 | 400, 404 |
| `DELETE` | `/tasks/:id` | Deletes a task | 204 | 404 |

A task looks like this:

```json
{
  "id": "6730f1c2a1b2c3d4e5f60718",
  "title": "Learn GitHub Actions",
  "done": false,
  "createdAt": "2026-11-05T14:00:00.000Z"
}
```

Validation rules: `title` is a required non-empty string (max 100 chars), `done` is an optional boolean.

------

## 🔐 Chapter 2: Environment Variables

### 2.1 📝 The variables

| Name | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ | — | Atlas connection string (`mongodb+srv://...`) |
| `MONGODB_DB_NAME` | ❌ | `tasks` | Database name |
| `PORT` | ❌ | `3000` | HTTP port |

### 2.2 🧠 How they are loaded

`src/config.js` does two things:

```javascript
// 1. Load .env if it exists. Already-defined variables are NOT overwritten,
//    so a value set by the shell or by GitHub Actions always wins.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

// 2. Validate and apply defaults: fail fast when MONGODB_URI is missing.
export function loadConfig(env = process.env) {
  if (!env.MONGODB_URI) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }
  // ...
}
```

> 💡 **Note**: `process.loadEnvFile()` is built into Node.js (≥ 21.7), so the `dotenv` package isn't needed.

> 💡 **Note**: in CI there is no `.env` file. Step 1 does nothing and every value comes from the job's `env:`.

Priority order, verified with `MONGODB_DB_NAME=from_shell pnpm start`:

```text
shell / CI env   >   .env file   >   default in config.js
```

------

## 🛠️ Chapter 3: Run Locally

### 3.1 ☁️ Prepare MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access**: create a user with *Read and write to any database*.
3. **Network Access**: add your IP. For GitHub-hosted runners, add `0.0.0.0/0` (see [Troubleshooting](#-troubleshooting)).
4. **Connect → Drivers**: copy the `mongodb+srv://...` string.

### 3.2 🚀 Start the API

```bash
cd tasks-api
pnpm install

# Create your local configuration and paste the Atlas URI into it
cp .env.example .env

pnpm dev          # node --watch, restarts on file change
# or
pnpm start
```

### 3.3 🔎 Try it

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn GitHub Actions"}'

curl http://localhost:3000/tasks

# Replace <id> with the id returned above
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" -d '{"done": true}'

curl -X DELETE http://localhost:3000/tasks/<id>
```

------

## 🧪 Chapter 4: Tests

### 4.1 🏗️ The test pyramid

```text
          ┌─────────┐   e2e (Playwright)      real HTTP server + Atlas, DB "<name>_e2e"
          │   e2e   │   pnpm test:e2e
        ┌─┴─────────┴─┐ integration (Vitest)  Express app in-memory + Atlas, DB "<name>_test"
        │ integration │ pnpm test:integration
      ┌─┴─────────────┴─┐ unit (Vitest)       pure functions, no DB, no network
      │      unit       │ pnpm test:unit
      └─────────────────┘
```

| Command | Needs `MONGODB_URI`? | What it tests |
|---|---|---|
| `pnpm test:unit` | ❌ | `validateTask`, `loadConfig` |
| `pnpm test:integration` | ✅ | every route through Supertest |
| `pnpm test:e2e` | ✅ | starts `pnpm start`, then calls the API over HTTP |
| `pnpm test` | ✅ | unit + integration |

> ⚠️ **Warning**: integration tests empty and then **drop** the `<MONGODB_DB_NAME>_test` database. Your main database is never touched.

### 4.2 🎭 Why Playwright without a browser?

Playwright isn't only a browser tool. Its `request` fixture sends real HTTP requests, which suits a REST API:

```javascript
test("full task lifecycle", async ({ request }) => {
  const created = await request.post("/tasks", { data: { title: "E2E task" } });
  expect(created.status()).toBe(201);
});
```

Because no browser is launched, `pnpm exec playwright install` isn't needed, locally or in CI.

The `webServer` block in `playwright.config.js` starts the API before the tests. It **inherits `process.env`**, so `MONGODB_URI` and `MONGODB_DB_NAME` pass from the CI job into the server. The `/health` test checks this: it asserts that the server reports the database name the job configured.

------

## ⚙️ Chapter 5: GitHub Actions

### 5.1 📝 Configure the repository

**Settings → Secrets and variables → Actions**

| Tab | Type | Name | Value |
|---|---|---|---|
| Secrets | Repository secret | `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/...` |
| Variables | Repository variable | `MONGODB_DB_NAME` | `tasks_ci` (optional) |

Or with the GitHub CLI:

```bash
# Read the secret from stdin so it never lands in your shell history
gh secret set MONGODB_URI < /dev/stdin
gh variable set MONGODB_DB_NAME --body "tasks_ci"
```

### 5.2 🏗️ Pipeline

```text
 push (tasks-api/**) / workflow_dispatch
                │
                ▼
      ┌──────────────────┐     ┌───────────────────────┐     ┌──────────────────────┐
      │   unit-tests     │────►│  integration-tests    │────►│     e2e-tests        │
      │ no env needed    │     │ env: secrets + vars   │     │ env: secrets + vars  │
      │                  │     │ DB: <name>_test       │     │ DB: <name>_e2e       │
      └──────────────────┘     └───────────────────────┘     └──────────┬───────────┘
                                                                        ▼
                                                            artifact: playwright-report
```

### 5.3 🧠 Where variables are defined

```yaml
# Workflow level → every job
env:
  PORT: 3000

jobs:
  integration-tests:
    # Job level → every step of this job
    env:
      MONGODB_URI: ${{ secrets.MONGODB_URI }}                 # secret: masked in logs
      MONGODB_DB_NAME: ${{ vars.MONGODB_DB_NAME || 'tasks' }} # variable with fallback
```

| Syntax | Evaluated by | When |
|---|---|---|
| `${{ secrets.X }}`, `${{ vars.X }}`, `${{ env.X }}` | GitHub, **before** the step runs | in YAML |
| `$X` in `run:` | the shell, **during** the step | at runtime |

Other points shown in the workflow:

- **Masking**: the "Show configuration" step prints `$MONGODB_URI`, and the log shows `***`.
- **Fail fast**: "Check required secret" stops the job with a clear `::error::` if the secret is missing. An undefined secret is an empty string, not an error.
- **Fallback**: `vars.MONGODB_DB_NAME || 'tasks'` keeps the workflow working when the variable isn't set.
- **Derived value**: the e2e job appends `_e2e` to the database name.
- **`concurrency`**: two runs never write to the same Atlas databases at the same time.

------

## 🎯 Chapter 6: Exercises

1. **Missing secret**: delete the `MONGODB_URI` secret and run the workflow. Which job fails, and with which message?
2. **Variable vs default**: run once without `MONGODB_DB_NAME`, then with it set to `tasks_ci`. Compare the "Show configuration" output and the databases in Atlas.
3. **Environments**: create a `staging` environment with its own `MONGODB_URI` secret and `MONGODB_DB_NAME` variable. Add `environment: staging` to `e2e-tests`. Which value wins, the repository one or the environment one?
4. **Step-level env**: move `MONGODB_URI` from the job `env:` to the single step that needs it. Why is that safer?
5. **Matrix**: run `unit-tests` on Node `22.x`, `24.x` and `26.x` with `strategy.matrix`.
6. **Masking limits** (think, don't run it on a real secret): masking replaces the *exact* secret string in logs. What would happen with `echo "$MONGODB_URI" | base64`? What does this tell you about trusting masking?

------

## 🔧 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Missing required environment variable: MONGODB_URI` | No `.env` locally, or missing secret in CI | `cp .env.example .env` / add the repository secret |
| `MongoServerSelectionError` / timeout in CI | Atlas blocks the runner's IP | Atlas **Network Access** → add `0.0.0.0/0` (GitHub-hosted runner IPs change on every run) |
| `bad auth : authentication failed` | Wrong user/password, or special chars not URL-encoded | Encode the password (`@` → `%40`, `/` → `%2F`, …) |
| Playwright: `http://localhost:3000 is already used` | A local server is already running | Stop it, or reuse it (locally `reuseExistingServer` is `true`) |
| Playwright `webServer` timeout | Server crashed at startup (bad URI) | Run `pnpm start` alone to see the error |
| Variable change ignored in a re-run | "Re-run jobs" reuses the original run's context | Trigger a **new** run |

> ⚠️ **Warning**: `0.0.0.0/0` opens the cluster to any IP, so the password is the only protection. That's fine for a course cluster. In production, use self-hosted runners with fixed IPs, Atlas Private Endpoints, or a short-lived database user.

------

## ✅ Best Practices

- [ ] `.env` is gitignored, `.env.example` is committed with placeholders only.
- [ ] Credentials go in **secrets**. Non-sensitive config goes in **variables**.
- [ ] The app fails fast at startup when a required variable is missing.
- [ ] Secrets are scoped as narrowly as possible: step > job > workflow.
- [ ] Each test level uses its own database (`_test`, `_e2e`).
- [ ] Never rely on log masking alone: don't print or transform secrets.
- [ ] Use a dedicated Atlas user for CI, with no access to real data.

------

## 🎓 Conclusion

The same code runs on your laptop and in GitHub Actions without a single change. Only **the source of `process.env`** differs: a `.env` file locally, secrets and variables injected through `env:` in CI. Once this pattern is in place, adding a `staging` or `prod` target is a matter of configuration, not code.

------

## 📚 Resources

- [GitHub Docs — Store information in variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [GitHub Docs — Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Node.js — `process.loadEnvFile()`](https://nodejs.org/api/process.html#processloadenvfilepath)
- [Express 5 — Error handling](https://expressjs.com/en/guide/error-handling.html)
- [Playwright — API testing](https://playwright.dev/docs/api-testing)
- [Playwright — Web server](https://playwright.dev/docs/test-webserver)
- [MongoDB Atlas — IP Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/)

------

> **Document created on**: 2026-11-05
> **Author**: xgueret
> **Version**: 1.0
