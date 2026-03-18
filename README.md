# @objectify/cli

CLI for the [Objectify](https://objectify.cloud) Objects Platform API.

## Installation

```bash
npm install -g @objectify/cli
```

## Quick Start

```bash
# Login with owner credentials
objectify login --email you@example.com --password secret

# Or use an API key
objectify login --api-key obj_abc123

# Check connection
objectify health

# List schemas
objectify schema list

# Create an object
objectify objects create type-123 --data '{"name": "Hello"}'

# Search
objectify objects search type-123 --filter "status=active"
```

## Commands

| Command | Description |
|---------|-------------|
| `objectify login` | Authenticate (--email/--password, --api-key, --admin-key) |
| `objectify logout` | Clear credentials |
| `objectify whoami` | Show auth info |
| `objectify health` | Check API health |
| `objectify config set base-url <url>` | Set API base URL |
| `objectify schema list\|get\|create\|export` | Schema management |
| `objectify objects list\|get\|create\|search\|delete` | Object CRUD |
| `objectify tenants list\|create\|get\|switch` | Tenant management |
| `objectify files list\|get\|download\|delete` | File operations |
| `objectify keys list\|create\|revoke` | API key management |

All commands support `--json` for machine-readable output.

## License

MIT
