# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 19:50 CET by Claude (agent)

## Goal

Popovers never run off the screen (owner's question, 2026-11-27): R-17 made exact.

## State

- Fixed on branch `fix/popover-fit-screen`, PR open for the owner's review. Measured on `main` first: a menu too tall for either side ran about 90px past the bottom in Chromium and WebKit, and a popover at the side edge squeezed into the room left (text wrapping) instead of lining up with the button's end. Now, CSS only: `width: max-content` (capped by `--sf-popover-max-width`), and fallbacks natural size below, above, either alignment, then a shorter panel that scrolls inside (`@position-try --sf-popover-fit-below / -above`). Changeset: `@subfloor/core` patch.
- SUB-6, SUB-8, SUB-9 and SUB-14 are Done. On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the fix PR. Then the owner picks the next task from the Vikunja backlog.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects; full suite in CI's image; mutation checks (main's CSS fails both new R-17 tests; without the natural width the edge test fails; without the fit fallbacks the short-screen test fails in Chromium and WebKit).
- Revision: `main` at `703f012` plus this branch's changes.
- Working tree: clean; the branch commit is the fix.
- Result: verify passed (11 unit tests). E2E on macOS: 371 passed, 24 skipped. In CI's image, three full runs: two with 371 passed, one with a single failure in R-19 "Tab closes the menu" on mobile-webkit (80 of 80 when repeated alone; this change touches neither the test nor the menu code).
- Not run: a real phone; Safari before 26 (bottom-sheet fallback).
