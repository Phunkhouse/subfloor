# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 16:00 CET by Claude (agent)

## Goal

SUB-14: run the Playwright suite on desktop Firefox, locally and in CI, and settle O-06.

## State

- Built on branch `test/sub-14-firefox`, PR open for the owner's review: a `firefox` project (Desktop Firefox) in `apps/playground/playwright.config.ts`. CI's container image already has Firefox, so `e2e.yml` changes only in its comment.
- Firefox found no kit bug. It differs in two ways: after a modal's last control, Tab focuses the document (the body) before wrapping back, where the others pass through the browser UI; and with JavaScript off, a promise returned to the test never settles. The R-07 tests now treat the body as "nothing focused" (no page control is ever reached), and the no-JS test polls instead of awaiting a promise.
- O-06 is now C-06 in the assumptions register; SPEC, AGENTS (commands), README updated.
- On `main`: Modal, Drawer/Sheet, Mobile nav, `keepFocusClear` (SUB-6, Done). Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the SUB-14 PR. After the merge, the agent checks "Done when" (suite on Firefox in CI, O-06 settled) and moves SUB-14 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03). (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects.
- Revision: `main` at `632816c` plus this branch's changes.
- Working tree: the SUB-14 changes, before the commit.
- Result: verify passed (10 unit tests). E2E: 256 passed, 24 skipped with reasons (R-02 on phones and on macOS WebKit and Firefox, R-05 wheel and R-11 modifier click on phones). Firefox alone: 51 passed, 5 skipped (R-02).
- Not run: Firefox on Android, a real phone.
