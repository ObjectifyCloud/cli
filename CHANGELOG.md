# Changelog

All notable changes to the Objectify CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `logout` no longer crashes with `require is not defined`; it clears the stored token.
- `tenants create` takes `--tenant-id` (the only field the API accepts; `--name`/`--slug` never worked) and prints the new tenant's API key.
- `keys create` prints the new key's id and one-time token instead of `undefined`.
- `objects search --filter` sends `property_id`, and values may contain `=`.
- `tenants list`, `files list`, `objects list` and `objects search` render their tables again.
- Every error now exits with code 1.
- Owner login no longer hangs when the password and newline arrive together (paste or pipe), and no longer echoes the password.
