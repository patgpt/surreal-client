# Publishing

This guide covers publishing `surreal-codegen` from your npm account.

## Preflight Checklist

Confirm these files are correct before cutting a release:

- `package.json`
- `jsr.json`
- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `.github/workflows/release-manual.yml`

The `package.json` and `jsr.json` versions must match.

## Local Validation

From the repository root:

```bash
bun install --frozen-lockfile
bun run ci
bun run pack:dry-run
```

If you want to check whether the unscoped npm name is still free:

```bash
npm view surreal-codegen version
```

A `404 Not Found` means the package name is currently unclaimed.

## Publish To npm Manually

1. Log in if needed:

```bash
npm whoami
npm login
```

2. Publish from the repository root:

```bash
npm publish --access public --provenance
```

`publishConfig.provenance` is already set in `package.json`, but keeping the flag in the command makes the intent obvious.

## npm Setup Once

To enable npm Trusted Publishing for this repository, add a trusted publisher on npmjs.com with these values:

- Package name: `surreal-codegen`
- CI/CD provider: `GitHub Actions`
- Repository: `patgpt/surreal-client`
- Workflow file: `.github/workflows/release-manual.yml`

The workflow is already configured for npm Trusted Publishing:

- `.github/workflows/release-manual.yml` grants `id-token: write`
- `.github/workflows/release-manual.yml` publishes with `npm publish --access public --provenance --ignore-scripts`
- `.nvmrc` pins Node `22.16`, which satisfies npm's current GitHub Actions provenance/trusted publishing baseline

After the trusted publisher is added in npm, you can publish from GitHub Actions without an `NPM_TOKEN`.

## Publish To JSR

If you also want a matching JSR release:

```bash
npx jsr publish
```

## Trusted Publishing Setup

The manual GitHub Actions release flow expects:

- npm package: `surreal-codegen`
- GitHub repo: `patgpt/surreal-client`
- workflow: `.github/workflows/release-manual.yml`

Configure npm Trusted Publishing for that repository and workflow before relying on the automated release path.

References:

- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [JSR publishing from GitHub Actions](https://jsr.io/docs/publishing-packages#publishing-from-github-actions)

## Release Flow

1. Update `package.json`.
2. Update `jsr.json`.
3. Update `CHANGELOG.md` and any release-facing docs.
4. Run `bun run ci`.
5. Run `bun run pack:dry-run`.
6. Publish to npm.
7. Publish to JSR if needed.
8. Tag the release:

```bash
git tag v<version>
git push origin v<version>
```

## If You Rename The Repository

If `patgpt/surreal-client` is later renamed to `patgpt/surreal-codegen`, update:

1. `package.json.repository`
2. `package.json.homepage`
3. `package.json.bugs`
4. `.github/docs/maintainers/releasing.md`
5. npm Trusted Publisher repository mapping

The npm package name can stay `surreal-codegen` either way.
