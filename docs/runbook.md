# Runbook

Subfloor has no servers. Releasing means publishing the packages to npm; the playground is local only. Only verified commands; anything not yet tried is marked unverified.

## Environments

- Local: `pnpm dev` (playground on http://localhost:4321).
- CI: GitHub Actions `ci.yml` and `e2e.yml` on pull requests.
- GitHub Pages: the playground at https://phunkhouse.github.io/subfloor/, deployed by `pages.yml` on every push to `main` (enabled 2026-11-27).
- npm: `@subfloor/core`, `@subfloor/react`, `@subfloor/astro`. **Not published.**

## Release (unverified: never run)

Only the owner releases, and only with an explicit go-ahead for that release.

1. Every PR that changes a package carries a changeset (`pnpm changeset`).
2. On `main`, with CI green: `pnpm changeset version`, review the version bumps and changelogs, commit `chore: release vX.Y.Z`.
3. `pnpm verify && pnpm test:e2e` on that commit.
4. `pnpm changeset publish` (needs npm login with 2FA and the `@subfloor` organisation), then push the tags.
5. In one consuming project, upgrade and run its checks.

## Roll back

`npm deprecate @subfloor/<pkg>@<version> "<reason>"` and publish a fixed patch. Unpublishing is limited by npm and breaks consumers; avoid it. (unverified)

## Secrets

- `CLAUDE_CODE_OAUTH_TOKEN`: GitHub Actions secret for `claude.yml`, set by the owner after creating the repository.
- npm token: none in CI; the owner publishes from their machine.

## Backup and restore

Not applicable: the repository and npm hold everything.

## Incidents

A broken release: deprecate it (above), tell the consuming projects' threads, fix forward.

## Owner actions pending

1. ~~Create the GitHub repository and push `main`~~ done 2026-11-27 (`Phunkhouse/subfloor`, public).
2. ~~Secret scanning and Dependabot alerts~~ on (public repository; alerts enabled 2026-11-27).
3. Install the Claude GitHub App and add `CLAUDE_CODE_OAUTH_TOKEN` (recipe `claude-pr-review`).
4. Check that the `@subfloor` npm scope is free and create the organisation.
5. ~~Pages source: GitHub Actions~~ done 2026-11-27.
