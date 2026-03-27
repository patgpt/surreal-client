# surreal-codegen

<p align="center">
  <strong>Generate Zod schemas and a typed TypeScript client from SurrealDB schemas or live databases.</strong>
</p>

<p align="center">
  <a href="https://surrealdb.com/docs/surrealdb"><img src="https://img.shields.io/badge/SurrealDB-Docs-FF00A0?logo=surrealdb&logoColor=white" alt="SurrealDB Docs" /></a>
  <a href="https://bun.sh/docs"><img src="https://img.shields.io/badge/Bun-1.3.5-F9F1E1?logo=bun&logoColor=000000" alt="Bun" /></a>
  <a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-4-3068B7?logo=zod&logoColor=white" alt="Zod" /></a>
  <a href="https://www.typescriptlang.org/docs/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

`surreal-codegen` is the maintained generator fork used by Hey Murph. It started from `@sebastianwessel/surql-gen`, then was adapted for SurrealDB v3 and a schemaful, generated-client-first workflow.

The package publishes as `surreal-codegen`. Inside this workspace the folder is still named `surreal-client/` until the repo rename lands.

## Docs

- [Changelog](./CHANGELOG.md)
- [Publishing Guide](./PUBLISHING.md)
- [Contributing](./CONTRIBUTING.md)
- [User Docs](./.github/docs/README.md)

## What It Does

- reads a single SurrealQL schema file or a schema directory
- spins up a temporary SurrealDB instance for schema-file introspection
- connects to a running SurrealDB instance for live introspection
- generates Zod schemas
- generates a typed TypeScript client and repository helpers

## Install

Run directly:

```bash
bunx surreal-codegen
```

Install as a dev dependency:

```bash
bun add -D surreal-codegen
```

The package also keeps the upstream-compatible `surql-gen` bin alias:

```bash
bunx surql-gen
```

## Usage

Generate from a running database:

```bash
bunx surreal-codegen \
  --surreal http://localhost:8000 \
  --username root \
  --password root \
  --ns test \
  --db test
```

Generate from a schema file:

```bash
bunx surreal-codegen -f ./schema.surql
```

Generate from a schema directory:

```bash
bunx surreal-codegen -f ./db/schema
```

Generate without the TypeScript client:

```bash
bunx surreal-codegen -f ./schema.surql --no-client
```

## Configuration

You can configure the generator with CLI flags, a config file, or both. CLI values win.

The default JSON config filename is `surreal-codegen.config.json` for compatibility with the upstream tool.

Example:

```json
{
  "schemaFile": "./schema",
  "surreal": "http://localhost:8000",
  "username": "root",
  "password": "root",
  "ns": "test",
  "db": "test",
  "outputFolder": "./client_generated",
  "generateClient": true,
  "surrealImage": "surrealdb/surrealdb:latest"
}
```

## How It Works

### Schema-file mode

When you pass `-f` with a file or directory, the generator:

1. starts a temporary SurrealDB container with Testcontainers
2. loads your schema into that database
3. introspects the resulting definitions
4. writes generated Zod schemas and optional client files

Docker is required for this path.

### Live-database mode

When you omit `-f`, the generator connects to the database specified by `--surreal`, `--ns`, `--db`, and auth flags, then introspects that database directly.

## Output Structure

- `_generated/`: regenerated output and record helpers
- `schema/`: schema wrappers and customization points
- `client/`: CRUD and repository helpers for generated tables

## Development

Install dependencies:

```bash
bun install
```

Run the full validation pass:

```bash
bun run ci
```

Useful individual commands:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bun run pack:dry-run
```

## Release Notes

- npm and JSR publishing steps live in [`PUBLISHING.md`](./PUBLISHING.md)
- the manual GitHub Actions release flow lives in [`.github/workflows/release-manual.yml`](./.github/workflows/release-manual.yml)
- `package.json` and `jsr.json` versions must stay in sync
- the current GitHub repository is `patgpt/surreal-client` even though the package name is `surreal-codegen`
