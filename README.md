# @objectify/cli

CLI for the [Objectify](https://objectify.cloud) Objects Platform API.

## Installation

```bash
npm install -g github:ObjectifyCloud/cli
```

## Quick Start

```bash
# Login with owner credentials (password prompted securely)
objectify login --email you@example.com

# Or use an API key
objectify login --api-key obj_abc123

# Check connection
objectify health

# List object types
objectify schema list

# Create an object
objectify objects create type-123 --data '{"name": "Hello"}'

# Search
objectify objects search type-123 --filter "status=active"
```

## Commands

| Command | Description |
|---------|-------------|
| `objectify login` | Authenticate (--email, --api-key, --admin-key) |
| `objectify logout` | Clear credentials |
| `objectify whoami` | Show auth info |
| `objectify health` | Check API health |
| `objectify config set base-url <url>` | Set API base URL |
| `objectify schema list\|get\|create\|export` | Object type management |
| `objectify objects list\|get\|create\|search\|delete` | Object CRUD |
| `objectify tenants list\|create\|get\|switch` | Tenant management |
| `objectify files list\|get\|download\|delete` | File operations |
| `objectify keys list\|create\|revoke` | API key management |

All commands support `--json` for machine-readable output.

## Authentication

The `login` command supports three modes:

1. **Owner login** — `objectify login --email you@example.com` (password prompted interactively, never visible in shell history or process list)
2. **API key** — `objectify login --api-key obj_abc123`
3. **Admin key** — `objectify login --admin-key <key>`

Credentials are stored locally via [conf](https://github.com/sindresorhus/conf).

## License

MIT
