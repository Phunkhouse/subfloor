# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 19:40 CET by Claude (agent)

## Goal

Follow-up to Claude's review of #18 (Toast, SUB-10), which was merged before the follow-up was committed.

## State

- On branch `fix/toast-review`, PR open for the owner's review: a pause keeps the time left (R-25); a toast leaves a closing modal at once, not on its `close` event (R-23, no flicker); a replaced toast is removed at once (R-27, no overlapping fade); the announcement timer is cleared on close; comments and the React `onClose` doc. New tests for the three behaviour changes fail on the old `toast.ts` in Chromium, WebKit and Firefox. Changeset: `@subfloor/core` patch.
- Not done from the review: a toast left in a dialog that is removed from the page waits for its own timer or the next toggle (rare; noted in the PR).
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, Toast, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); SUB-17 (flaky menu clicks on mobile Chromium) open; Done policy `verified`.

## Next step

Owner reviews this PR.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); three full Chromium runs; `toast.spec.ts` repeated in CI's image; the new tests against the old `toast.ts`.
- Revision: `main` at `d37efbf` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is the follow-up.
- Result: verify passed (11 unit tests). E2E on macOS: 456 passed, 24 skipped. Three full Chromium runs: 185 of 185 each. In CI's image: `toast.spec.ts` five times, 325 of 325. The three new tests fail on the old `toast.ts` in Chromium, WebKit and Firefox.
- Not run: a real phone, a screen reader.
