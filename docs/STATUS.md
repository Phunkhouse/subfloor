# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 17:55 CET by Claude (agent)

## Goal

Fix the flaky R-15 test in WebKit, seen in CI on PR #11.

## State

- Fixed on branch `fix/focus-clear-without-frames`, PR open for the owner's review. Cause, reproduced in CI's own image (`mcr.microsoft.com/playwright:v1.65.1-noble`, run locally in Docker, arm64): headless Linux WebKit sometimes gives no animation frame after a Tab, so `keepFocusClear` never ran its check, and WebKit's own focus scroll did not run either. The check now also runs from timers at 100 and 300 ms; a run with nothing to do does nothing. Changeset: `@subfloor/core` patch.
- SUB-6, SUB-8 and SUB-14 are Done. On `main`: Modal, Drawer/Sheet, Mobile nav, `keepFocusClear`, the Firefox project, the React stale-effect fix, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the fix PR. Then the owner picks the next task from the Vikunja backlog.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03). (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS, five projects); in CI's image: R-15 on `webkit` and `mobile-webkit` repeated, and the full suite.
- Revision: `main` at `bcfa4dc` plus this branch's changes.
- Working tree: the fix, before the commit.
- Result: verify passed (10 unit tests). E2E on macOS: 281 passed, 24 skipped. In CI's image: R-15 on WebKit failed 18 of 60 runs before the fix and passed 400 of 400 after; the full suite passed (281 passed, 24 skipped).
- Not run: CI's x64 runner (the container ran on arm64); a real phone.
