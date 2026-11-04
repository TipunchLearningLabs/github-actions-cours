# 📇 simple-crm — Mini CRM

A small, dependency-light CRM for very small businesses (TPE): keep track of leads, prospects and clients, plan follow-ups, and export everything to CSV.

It is the **support project** for a GitHub Actions course: the app is intentionally simple, fully tested, and exposes the usual scripts (`lint`, `typecheck`, `test`, `build`) that CI workflows will run.

> **Prerequisites**: Node.js 20.19+ or 22.12+ (required by Vite 8), pnpm (`corepack enable`).

------

## 📖 Table of contents

1. [Features](#-features)
2. [Quick start](#-quick-start)
3. [Scripts](#-scripts)
4. [Project structure](#-project-structure)
5. [Data model](#-data-model)
6. [Installed modules](#-installed-modules)
7. [Configuration files](#-configuration-files)
8. [Tests](#-tests)
9. [Limitations](#-limitations)

------

## 🎯 Features

| Feature | Details |
|---|---|
| Dashboard | KPI cards: total contacts, leads, prospects, clients, follow-ups due |
| Contacts | Create, edit, delete (two-step confirmation) |
| Pipeline status | `lead` → `prospect` → `client`, plus `inactive` |
| Follow-ups | Optional next follow-up date; overdue ones are highlighted and listed first |
| Search & filter | Free-text search (name, company, email, phone) + status filter |
| Validation | Last name **or** company required, email and phone format checks |
| Persistence | Browser `localStorage` (no backend) |
| CSV export | One click, ready to open in a spreadsheet |
| Dark mode | Follows the OS preference (`prefers-color-scheme`) |

------

## 🚀 Quick start

```bash
cd simple-crm
pnpm install
pnpm dev          # http://localhost:5173
```

------

## 🛠️ Scripts

| Command | Effect |
|---|---|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Type-check (`tsc -b`) then production build into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm test` | Vitest in watch mode |
| `pnpm test:run` | Run tests once (CI-friendly) |
| `pnpm test:coverage` | Run tests + coverage report in `coverage/` |
| `pnpm lint` | Lint with oxlint |
| `pnpm lint:fix` | Apply safe automatic lint fixes |
| `pnpm typecheck` | TypeScript type-check only |
| `pnpm check` | Strict lint (0 warnings) + type-check + tests — the "is it green?" command |

> 💡 **Note**: every script exits with a non-zero code on failure, so each one can be used directly as a CI step.

------

## 🏗️ Project structure

```text
simple-crm/
├── index.html                  # Vite entry HTML
├── vite.config.ts              # Vite + Vitest configuration
├── .oxlintrc.json              # Linter rules
├── tsconfig*.json              # TypeScript project references (app / node)
└── src/
    ├── main.tsx                # React bootstrap
    ├── App.tsx                 # Page layout, filters, editor state, CSV download
    ├── App.css / index.css     # Styles (plain CSS, CSS variables, dark mode)
    ├── types.ts                # Contact types and status list
    ├── lib/
    │   ├── contacts.ts         # Pure business logic: validation, filter, sort, stats, CSV
    │   └── storage.ts          # localStorage load/save with corrupted-data guard
    ├── hooks/
    │   └── useContacts.ts      # React state + persistence
    ├── components/
    │   ├── StatsBar.tsx        # KPI cards
    │   ├── ContactForm.tsx     # Create/edit form with validation
    │   └── ContactList.tsx     # Contact table
    └── test/
        ├── setup.ts            # Vitest setup (jest-dom matchers, cleanup)
        └── factories.ts        # Test data builder
```

```text
   UI components ──► useContacts (hook) ──► lib/storage ──► localStorage
        │
        └──────────► lib/contacts (pure functions, no React, easiest to test)
```

Business rules live in `lib/` as pure functions, so most tests run without rendering anything.

------

## 📝 Data model

```ts
interface Contact {
  id: string                 // crypto.randomUUID()
  firstName: string
  lastName: string
  company: string
  email: string              // stored lowercased
  phone: string
  status: 'lead' | 'prospect' | 'client' | 'inactive'
  followUpDate: string       // 'YYYY-MM-DD' or '' when none
  notes: string
  createdAt: string          // ISO timestamp
  updatedAt: string          // ISO timestamp
}
```

Data is stored under the `localStorage` key `simple-crm.contacts`.

------

## 📦 Installed modules

### Runtime dependencies

| Package | Role |
|---|---|
| `react` | UI library |
| `react-dom` | Renders React in the browser |

No router, state manager or UI kit: the app does not need them.

### Development dependencies

| Package | Role |
|---|---|
| `vite` | Dev server and production bundler |
| `@vitejs/plugin-react` | React support (JSX, Fast Refresh) for Vite |
| `typescript` | Static typing, run via `tsc -b` |
| `@types/react`, `@types/react-dom`, `@types/node` | Type definitions |
| `oxlint` | Very fast Rust-based linter (Oxc project), replaces ESLint here |
| `vitest` | Test runner, reuses the Vite configuration |
| `@vitest/coverage-v8` | Code coverage using V8's native instrumentation |
| `jsdom` | Simulated browser DOM for tests running in Node |
| `@testing-library/react` | Render components and query them like a user would |
| `@testing-library/dom` | Core DOM queries (peer dependency of the React package) |
| `@testing-library/jest-dom` | Readable matchers (`toBeInTheDocument`, `toHaveValue`…) |
| `@testing-library/user-event` | Realistic clicks and typing |

Exact versions are pinned in `pnpm-lock.yaml`; the pnpm version is pinned by the `packageManager` field of `package.json`.

------

## ⚙️ Configuration files

| File | Purpose |
|---|---|
| `vite.config.ts` | React plugin + `test` block: `jsdom` environment, global `describe/it/expect`, setup file, coverage scope |
| `.oxlintrc.json` | Enables `react`, `typescript`, `oxc` plugins; enforces the Rules of Hooks |
| `tsconfig.app.json` | App compiler options; `types` includes `vitest/globals` and `@testing-library/jest-dom` |
| `src/test/setup.ts` | Registers jest-dom matchers, unmounts components and clears `localStorage` after each test |

------

## ✅ Tests

```bash
pnpm test:run        # 35 tests
pnpm test:coverage   # ~92% statements
```

| File | Covers |
|---|---|
| `src/lib/contacts.test.ts` | Validation, normalization, filtering, sorting, stats, CSV escaping |
| `src/lib/storage.test.ts` | Round-trip, empty storage, corrupted JSON, invalid entries |
| `src/components/ContactForm.test.tsx` | Validation errors, submit, edit prefill, cancel |
| `src/App.test.tsx` | End-to-end user flows: add, edit, delete, search/filter, overdue follow-ups |

------

## 🔧 Limitations

- Data stays in **one browser** (`localStorage`): clearing site data erases it — use the CSV export as a backup.
- No authentication, no multi-user sync, no import.
- These are deliberate: the project is a CI/CD learning support, and features will grow alongside the course.

------

## 📚 Resources

- [Vite — Getting Started](https://vite.dev/guide/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
