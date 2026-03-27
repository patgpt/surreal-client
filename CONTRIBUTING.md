# Contributing

Thanks for contributing to `surreal-codegen`.

## Development Setup

1. Use the Bun and Node versions already pinned in this package.
2. Install dependencies:

```bash
bun install --frozen-lockfile
```

3. Run quality checks:

```bash
bun run lint
bun run lint:fix
bun run typecheck
bun run test
bun run build
```

## Project Structure

- `src/index.ts`: CLI entry point
- `src/database/`: database connection and metadata retrieval
- `src/genSchema/`: SurrealQL to Zod schema generation
- `src/genClient/`: generated client file templates
- `src/schema/`: schema source loading utilities for file and directory modes
- `.github/docs/`: user and maintainer documentation

## Pull Request Expectations

1. Add or update tests for behavioral changes.
2. Keep README, changelog, and docs aligned with user-facing changes.
3. Ensure lint, typecheck, test, and build pass.
4. Keep commits focused and descriptive.

## Release Process

- Manual publishing steps live in [`PUBLISHING.md`](./PUBLISHING.md).
- The GitHub Actions release workflow lives in [`.github/workflows/release-manual.yml`](./.github/workflows/release-manual.yml).
- Keep `package.json` and `jsr.json` versions in sync.
- The package name is `surreal-codegen`, but the current GitHub repo is still `patgpt/surreal-client`.
