# API Endpoints

> Endpoint map for **Objectify CLI**. Lists every API call this app makes.
> **Total: 20 endpoints**

## Summary

| Category | Count |
|----------|:-----:|
| Root | 1 |
| `/owner/*` | 1 |
| `/v1/object-types/*` | 3 |
| `/v1/objects/*` | 5 |
| `/v1/files/*` | 4 |
| `/admin/tenants/*` | 5 |
| `/admin/tenants/:tid/keys/*` | 3 |

## Root

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| GET | `/health` | commands/health.ts | `get()` |

## `/owner/*` -- Owner Auth

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| POST | `/owner/login` | commands/login.ts | `post()` |

## `/v1/object-types/*` -- Schema

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| GET | `/v1/object-types` | commands/schema.ts | `get()` |
| GET | `/v1/object-types/:typeId` | commands/schema.ts | `get()` |
| POST | `/v1/object-types` | commands/schema.ts | `post()` |

## `/v1/objects/*` -- Objects

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| GET | `/v1/objects/:typeId/list` | commands/objects.ts | `get()` |
| GET | `/v1/objects/:typeId/:objectId` | commands/objects.ts | `get()` |
| POST | `/v1/objects/:typeId` | commands/objects.ts | `post()` |
| POST | `/v1/objects/:typeId/search` | commands/objects.ts | `post()` |
| DELETE | `/v1/objects/:typeId/:objectId` | commands/objects.ts | `del()` |

## `/v1/files/*` -- Files

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| POST | `/v1/files/search` | commands/files.ts | `post()` |
| GET | `/v1/files/:fileId` | commands/files.ts | `get()` |
| POST | `/v1/files/:fileId/signed-url` | commands/files.ts | `post()` |
| DELETE | `/v1/files/:fileId` | commands/files.ts | `del()` |

## `/admin/tenants/*` -- Tenants

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| GET | `/admin/tenants` | commands/tenants.ts | `get()` |
| POST | `/admin/tenants` | commands/tenants.ts | `post()` |
| GET | `/admin/tenants/:id` | commands/tenants.ts | `get()` |

## `/admin/tenants/:tid/keys/*` -- API Keys

| Method | Path | Source | Transport |
|--------|------|--------|-----------|
| GET | `/admin/tenants/:tid/keys` | commands/keys.ts | `get()` |
| POST | `/admin/tenants/:tid/keys` | commands/keys.ts | `post()` |
| DELETE | `/admin/tenants/:tid/keys/:keyId` | commands/keys.ts | `del()` |
