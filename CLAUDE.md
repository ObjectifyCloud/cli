# Objectify CLI

> Command-line interface for the Objectify Objects Platform API. Lets users authenticate, manage object types/objects, tenants, files, and API keys from the terminal.

**Package:** `@objectify/cli`
**Type:** Node.js CLI (ESM)
**Stack:** Commander.js, Chalk, Ora, Conf, @objectify/sdk

---

## Project Structure

```
src/
  index.ts          # Entry point — registers all commands via Commander
  api.ts            # API client wrapper (uses @objectify/sdk)
  config.ts         # Conf-based credential/config storage
  utils/output.ts   # Table/JSON formatting helpers
  commands/
    login.ts        # Auth — email/password, API key, admin key
    config.ts       # Set base URL and other settings
    health.ts       # API health check
    schema.ts       # Object type CRUD (list, get, create, export)
    objects.ts      # Object CRUD + search
    tenants.ts      # Tenant management (list, create, get, switch)
    files.ts        # File operations (list, get, download, delete)
    keys.ts         # API key management (list, create, revoke)
```

---

## Development

```bash
npm install
npm run dev -- health              # Run locally via tsx
npm run build                      # Compile to dist/
npm test                           # Run tests
npm run lint                       # ESLint
```

---

## Key Patterns

- All commands support `--json` for machine-readable output
- Credentials stored locally via `conf` (XDG-compliant config dir)
- Three auth modes: owner email/password, API key, admin key
- Uses `@objectify/sdk` from `file:../api/sdk` (monorepo link)

---

## Testing

```bash
npm test                           # All tests
npm run test:watch                 # Watch mode
```

Tests use vitest. Test files live in `test/`.

---

## Coding Standards

- TypeScript strict mode
- ESLint with `@typescript-eslint`
- Prettier — single quotes, trailing commas, 120 print width, 2-space indent
- Commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
