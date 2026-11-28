# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 17:00 CET by Claude (agent)

## Goal

SUB-16: the flaky dialog R-03 test in Linux WebKit.

## State

- Fixed on branch `fix/sub-16-dialog-close-stall`, PR open for the owner's review. Reproduced in CI's image with `dialog.spec.ts` on webkit and mobile-webkit, 25 repeats with 8 workers: 15 failures in 1,675 runs, two causes.
  - Core: a page that draws no frames never finished the closing transition, so the overlay stayed `closing`. The shared `transitions.ts` (dialog and popover) now also ends the wait at the transitions' computed end time plus 50 ms.
  - Test: `backdropPoint` measured the drawer while it slid in and could press inside it once it settled (9 px of backdrop on a phone); it now waits for the dialog to settle and presses the middle of the widest backdrop strip.
  - New deterministic test (frozen closing animations) fails on all five projects with the old core. Changeset: `@subfloor/core` patch.
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); SUB-15 Done; Done policy `verified`.

## Next step

Owner reviews the SUB-16 PR. After the merge, the agent checks "Done when" and moves SUB-16 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); in CI's image the same dialog stress run before (15 of 1,675 failed) and after the fix (1,725 of 1,725 passed), and a full run; the frozen-animation test with and without the fix.
- Revision: `main` at `5294df0` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is the SUB-16 fix.
- Result: verify passed (11 unit tests). E2E: 381 passed, 24 skipped, on macOS and in CI's image.
- Not run: a real phone.
