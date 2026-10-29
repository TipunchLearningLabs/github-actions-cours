# Créer un projet Vite avec pnpm, Vitest et oxlint

![img]()29 oct. 2026 · @Xavier Gueret

Ce guide crée un projet Vite (React + TypeScript) avec pnpm, puis ajoute Vitest pour les tests et oxlint, le linter écrit en Rust du projet Oxc. Tout se fait en ligne de commande.

## 1. Prérequis

Vite demande Node.js 20.19+ ou 22.12+ ([doc Vite](https://vite.dev/guide/)). Vérifiez votre version, puis activez pnpm via corepack (livré avec Node) :

```
node -v                 # doit afficher v20.19+ ou v22.12+
corepack enable         # active pnpm sans installation globale
corepack prepare pnpm@latest --activate
pnpm -v
```

Si corepack n'est pas disponible, installez pnpm avec `npm install -g pnpm`.

## 2. Créer le projet Vite

Une seule commande génère le projet ; avec pnpm, pas besoin du `--` qu'exige npm.

```
pnpm create vite mon-projet --template react-ts
cd mon-projet
pnpm install
pnpm dev                # serveur sur http://localhost:5173
```

Sans `--template`, l'assistant interactif vous demande le framework et la variante. Templates courants :

| Framework | JavaScript | TypeScript |
| --------- | ---------- | ---------- |
| Vanilla   | vanilla    | vanilla-ts |
| React     | react      | react-ts   |
| Vue       | vue        | vue-ts     |
| Svelte    | svelte     | svelte-ts  |
| Preact    | preact     | preact-ts  |
| Lit       | lit        | lit-ts     |

Pour créer le projet dans le dossier courant, remplacez le nom par `.` : `pnpm create vite . --template react-ts`.

## 3. Ajouter les tests avec Vitest

Vitest est le lanceur de tests natif de Vite : il réutilise la même config. Pour tester des composants React, on ajoute jsdom (un DOM simulé) et Testing Library.

```
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

| Paquet                      | Rôle                                     |
| --------------------------- | ---------------------------------------- |
| vitest                      | Lance les tests                          |
| jsdom                       | Simule le navigateur dans Node           |
| @testing-library/react      | Affiche les composants dans les tests    |
| @testing-library/jest-dom   | Matchers lisibles (`toBeInTheDocument`…) |
| @testing-library/user-event | Simule clics et saisie                   |

Ajoutez un bloc `test` dans `vite.config.ts` :

```
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

Créez `src/test/setup.ts` :

```
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
```

Pour que TypeScript reconnaisse `describe`, `it` et `expect` sans import, ajoutez dans `tsconfig.app.json` :

```
"compilerOptions": {
  "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
}
```

Premier test, `src/App.test.tsx` :

```
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('affiche le titre', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
```

Optionnel : `pnpm add -D @vitest/coverage-v8 @vitest/ui` pour la couverture de code et l'interface web.

## 4. Ajouter le lint avec oxlint

C'est bien oxlint : un linter JavaScript/TypeScript écrit en Rust par le projet [Oxc](https://oxc.rs/docs/guide/usage/linter/quickstart), beaucoup plus rapide qu'ESLint et compatible avec la plupart de ses règles.

```
pnpm add -D oxlint
pnpm exec oxlint --init     # crée .oxlintrc.json avec les valeurs par défaut
```

Adaptez ensuite `.oxlintrc.json` (les commentaires y sont autorisés) :

```
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "vitest", "jsx-a11y"],
  "env": { "browser": true },
  "categories": { "correctness": "error", "suspicious": "warn" },
  "rules": {
    "no-console": "warn",
    "no-debugger": "error"
  },
  "ignorePatterns": ["dist/", "coverage/"]
}
```

Le template Vite installe ESLint par défaut. Si oxlint vous suffit, retirez-le :

```
pnpm remove eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint
rm eslint.config.js
```

Pour garder ESLint à côté, `eslint-plugin-oxlint` désactive dans ESLint les règles déjà couvertes par oxlint.

Dans VS Code, installez l'extension Oxc : `code --install-extension oxc.oxc-vscode`.

Optionnel : le même projet propose Oxfmt, un formateur compatible Prettier (`pnpm add -D oxfmt`).

## 5. Scripts package.json

Remplacez le bloc `scripts` de `package.json` :

```
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "lint": "oxlint",
  "lint:fix": "oxlint --fix",
  "check": "oxlint --max-warnings 0 && vitest run && tsc -b"
}
```

| Commande             | Effet                                                        |
| -------------------- | ------------------------------------------------------------ |
| `pnpm dev`           | Serveur de développement                                     |
| `pnpm test`          | Tests en mode watch                                          |
| `pnpm test:run`      | Tests une seule fois (CI)                                    |
| `pnpm test:coverage` | Tests + rapport de couverture                                |
| `pnpm lint`          | Analyse du code                                              |
| `pnpm lint:fix`      | Corrections automatiques sûres                               |
| `pnpm check`         | Lint strict + tests + typage, à lancer avant un commit ou en CI |
| `pnpm build`         | Build de production dans `dist/`                             |

## 6. Récapitulatif

Toutes les commandes à la suite ; il reste ensuite à éditer `vite.config.ts`, `src/test/setup.ts`, `tsconfig.app.json`, `.oxlintrc.json` et les scripts comme décrit plus haut.

```
corepack enable
pnpm create vite mon-projet --template react-ts
cd mon-projet
pnpm install

# Tests
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Lint
pnpm add -D oxlint
pnpm exec oxlint --init

# Optionnel : retirer ESLint
pnpm remove eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint
rm eslint.config.js

# Vérifier
pnpm lint
pnpm test:run
```

## Sources

- [Vite — Getting Started](https://vite.dev/guide/)
- [Oxlint — Quickstart](https://oxc.rs/docs/guide/usage/linter/quickstart)
- [Oxlint — Configuration](https://oxc.rs/docs/guide/usage/linter/config)
- [Vitest + React Testing Library (Robin Wieruch)](https://www.robinwieruch.de/vitest-react-testing-library/)
