# Getting Started

## Install

Run directly:

```bash
bunx surreal-codegen
```

Or install as a dev dependency:

```bash
bun add -D surreal-codegen
```

## Basic usage

Generate from a running SurrealDB instance:

```bash
bunx surreal-codegen --surreal http://localhost:8000 --username root --password root --ns test --db test
```

Generate from schema definitions:

```bash
bunx surreal-codegen -f ./schema.surql
```

Generate from a schema directory:

```bash
bunx surreal-codegen -f ./db/schema
```

## Output

By default, output is written to `client_generated`:

- `_generated/`: regenerated each run
- `schema/`: extension points for custom application code
