# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 11:40 CET by Claude (agent)

## Goal

SUB-15: the flaky popover and menu tests under load.

## State

- Fixed on branch `fix/sub-15-popover-state-lag`, PR open for the owner's review. Reproduced in CI's image under load (4 full runs × 2 repeats: 5 failures). Cause: the core recorded closing on the browser's `toggle` event, which is queued and can come late; meanwhile `data-state`, `aria-expanded` and `sf:open-change` still said open, and ↑ right after Escape focused an item of the hidden menu. Now closing is recorded on `beforetoggle` and the real state is read from `:popover-open`. Tests wait for logged events and for the menu to be open before clicking items. New deterministic test (fails on all five projects with the old core). Changeset: `@subfloor/core` patch.
- Seen once in the same load runs, not touched here: Astro drawer R-03 on mobile-webkit stayed `open` (dialog code); offered to the owner as a Backlog task.
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the SUB-15 PR. After the merge, the agent checks "Done when" and moves SUB-15 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); in CI's image, 4 full runs × 2 repeats before the fix (5 failures) and 8 after (first 4: one click timeout, fixed in the test; last 4: no popover or menu failure in 3,008 runs, one unrelated drawer R-03 failure); the new state test with and without the fix.
- Revision: `main` at `def8741` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is the SUB-15 fix.
- Result: verify passed (11 unit tests). E2E on macOS: 376 passed, 24 skipped.
- Not run: a real phone.
