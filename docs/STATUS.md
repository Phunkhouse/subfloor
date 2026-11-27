# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 19:00 CET by Claude (agent)

## Goal

SUB-9: Popover and Menu (Phase 3, R-16 to R-21), scope approved by the owner on 2026-11-27.

## State

- Built on branch `feat/sub-9-popover-menu`, PR open for the owner's review: core `createPopover` / `createMenu` (plus a shared `opener.ts` taken out of `dialog.ts`), CSS with anchor positioning and a bottom-sheet fallback, React `Popover` / `Menu`, Astro `Popover.astro` / `Menu.astro`, playground page `/popover/` and gallery card, decision [0004](decisions/0004-native-popover-and-anchor-positioning.md), eject entries, changeset (minor, all three packages).
- Claude's review: a mouse click on the menu button reopened a just-closed menu in Chromium and Firefox (focus moved to the button closed it first); fixed with a test. Also `destroy()` resets `aria-expanded`, `hide()` keeps a cause already noted, and React's controlled mode is documented.
- `sf:open-change` keeps its global type (dialog reasons); popovers use `OpenChangeDetail<PopoverCloseReason>`, so existing typed listeners keep compiling.
- On `main`: Modal, Drawer/Sheet, Mobile nav, `keepFocusClear`, the Firefox project, the React stale-effect fix, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the SUB-9 PR. After the merge, the agent checks "Done when" and moves SUB-9 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26; older Safari gets the bottom-sheet fallback. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects; the new tests repeated twice; mutation checks (no flip fallbacks fails R-17, no focus return fails R-18 in WebKit, no disabled skip fails R-19); full suite in CI's image (Docker).
- Revision: `main` at `634496c` plus this branch's changes.
- Working tree: clean; the branch's commits are the SUB-9 changes, including Claude's review follow-up.
- Result: verify passed (11 unit tests). E2E on macOS and in CI's image: 361 passed, 24 skipped each (after the review follow-up). Before it, `popover.spec.ts` five times in CI's image: 325 of 325.
- Not run: the bottom-sheet fallback (every engine under test has anchor positioning); a real phone.
