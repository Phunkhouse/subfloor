# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 by Claude (agent)

## Goal

Set up Claude PR reviews (recipe `claude-pr-review`), then build Phase 2, the mobile nav, whose scope the owner approved on 2026-11-27 ([SPEC, Phase 2](SPEC.md#phase-2-mobile-nav-approved-not-started)).

## State

- Phase 1 (Modal, Drawer/Sheet, tokens, React and Astro adapters, playground) is on `main` and live at https://phunkhouse.github.io/subfloor/. Not on npm.
- Dependabot no longer offers TypeScript 7 (`dependabot.yml` ignore rule, #3): TS 7 ships no compiler API, which typescript-eslint, tsup's dts build and `@astrojs/check` need. The `@types/node` 26.6.6 bump (#4) passed CI and waits for the owner's merge.
- `claude.yml` is pinned to `claude-code-action` v1.0.290 by commit (this PR). The Claude GitHub App and the `CLAUDE_CODE_OAUTH_TOKEN` secret are not set up yet (no repository secrets, checked 2026-11-27).
- Mobile nav: scope and R-11 to R-15 recorded in SPEC; no code yet.

## Next step

Owner: action 3 in [runbook.md](runbook.md#owner-actions-pending) (install the app, add the token), then comment `@claude review` on an open PR to prove it. After that, the mobile nav.

## Blockers and open questions

- Owner: Claude GitHub App and `CLAUDE_CODE_OAUTH_TOKEN` (blocks Claude reviews).
- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02).
- Owner review: decision 0003 keeps native focus containment rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`.
- Revision: `e16100b` plus this branch's changes (`claude.yml` pin and docs only).
- Working tree: this branch's changes, uncommitted at the time of the run.
- Result: verify passed (format, lint, typecheck, 8 unit tests, build). E2E not re-run locally: no product code changed since it last passed in CI (on #3); it runs again in CI on this PR.
- Not run: the Claude review workflow itself (needs the app and the secret), Firefox, a real phone.
