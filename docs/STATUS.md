# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 15:20 CET by Claude (agent)

## Goal

SUB-6: R-15 in WebKit. Keep a keyboard-focused control clear of fixed bars where WebKit ignores `scroll-padding`.

## State

- Built on branch `fix/sub-6-webkit-focus-clearance`, PR open for the owner's review: core `keepFocusClear()` (`src/focus-clearance.ts`), a reference-counted `focusin` listener that re-scrolls with `scrollIntoView({ block: 'nearest' })` when a `:focus-visible` control still sits in the padding. `createMobileNav` turns it on. It is exported, with a changeset (core minor), and ejected with the mobile nav.
- The R-15 test now runs in WebKit too. CI's first run on the PR failed R-11 in WebKit: the listener scrolled to the toggle that a `navigate` close focuses without scrolling. Fixed: the listener leaves off-screen controls alone, and a close with options waits one task before deciding about the scroll, so a close without a transition still sees a router's new URL. New test: R-11 closed by keyboard while still opening. The playground's fixed bar was 1px taller than its token (border outside its height); fixed with `box-sizing: border-box`.
- Phases 1 and 2 (Modal, Drawer/Sheet, Mobile nav) are on `main` and live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the SUB-6 PR. After the merge, the agent checks "Done when" (R-15 unskipped in WebKit) and moves SUB-6 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03). (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (all four projects); mutation checks (without the listener, R-15 fails in WebKit; without the off-screen check or the one-task wait, the new R-11 test fails); `mobile-nav.spec.ts` repeated five times, 150 passed.
- Revision: `main` at `e290188` plus this branch's changes.
- Working tree: the SUB-6 changes, before the commit.
- Result: verify passed (10 unit tests). E2E: 205 passed, 19 skipped with reasons (R-02 on phones and macOS WebKit, R-05 wheel and R-11 modifier click on phones); R-15 now runs in WebKit.
- Not run: Firefox, a real phone, Safari with full keyboard access on a real Mac.
