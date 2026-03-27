# Contributing to Objectify CLI

## Prerequisites

- **Node.js** 18 or newer
- **npm**

## Local Setup

```bash
npm install
npm run dev -- health
```

The CLI runs via **tsx** during development (example above runs the `health` command).

**Stack:** Commander.js, Chalk, Ora, TypeScript (ESM).

**Build:** `npm run build` — entry at `dist/index.js`.

**Tests:** Vitest. Run `npm test`.

## Branching Strategy

Use prefixed branches:

- `feat/` — new features
- `fix/` — bug fixes
- `chore/` — tooling, deps, maintenance
- `docs/` — documentation only
- `test/` — tests only
- `refactor/` — behavior-preserving changes
- `perf/` — performance improvements
- `security/` — security fixes

## Commit Conventions

Write commits in **imperative mood** with a type prefix:

`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `perf:`, `security:`

Example: `feat: add config file override flag`

## Pull Request Standards

- Describe **what** changed and **why** in the PR body.
- Keep the change set focused; split large work when possible.
- Link related issues or tickets when applicable.
- Respond to review feedback or mark threads resolved when addressed.

## Pre-PR Checklist

Run these before opening a PR:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
```

## Code Style

- **TypeScript** — strict mode; avoid `any` unless justified.
- **Prettier** — project config; run `format:check` / format before commit.
- **ESLint** — follow project rules; fix new violations in touched files.
