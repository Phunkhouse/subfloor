# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 13:50 CET by Claude (agent)

## Goal

Phase 2, the mobile nav, whose scope the owner approved on 2026-11-27 ([SPEC, Phase 2](SPEC.md#phase-2-mobile-nav-approved-not-started)).

## State

- Phase 1 (Modal, Drawer/Sheet, tokens, React and Astro adapters, playground) is on `main` and live at https://phunkhouse.github.io/subfloor/. Not on npm.
- Claude PR reviews work: the app is installed, the secret set, and `@claude review` posted a review on #5 (run 46000580652). This PR pins `claude-code-action` to the v1.0.290 commit `4411a9e` (checked against the upstream tag). The pin is used from the first review after the merge.
- Dependabot skips TypeScript 7 (#3); `@types/node` 26.6.6 merged (#4).
- Mobile nav: scope and R-11 to R-15 in SPEC, refined after Claude's review (where focus goes on each close, R-13 edge cases, R-15 and a project's own `scroll-padding`). No code yet.

## Next step

Owner merges #5. Then build the mobile nav in one PR: core, adapters, playground page, tests for R-11 to R-15 on all four projects.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02).
- Owner review: decision 0003 keeps native focus containment rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`.
- Revision: `main` at `a728c7d` plus this PR's commits, which change only `claude.yml` and `docs/`.
- Working tree: clean apart from this PR's last docs commit.
- Result: verify passed (format, lint, typecheck, 8 unit tests, build). E2E: passed in CI on this PR before the rebase; no product code changed.
- Not run: the pinned action, which runs only after the merge; Firefox; a real phone.
