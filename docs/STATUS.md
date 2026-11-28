# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 18:40 CET by Claude (agent)

## Goal

SUB-10: Toast (Phase 4, R-22 to R-27), scope approved by the owner on 2026-11-28.

## State

- Built on branch `feat/sub-10-toast`, PR open for the owner's review: core `toast.ts` (`showToast`, `createToast`, `initToasts`, `toastElement`), `toast.css` and tokens, React `Toast` (portal; `react-dom` now a peer dependency), Astro `Toast.astro` (server-rendered), playground `/toast/` and `/toast/sent/`, gallery card, decision [0005](decisions/0005-toast-in-the-top-layer-inside-the-open-modal.md), eject `toast` (alias `snackbar`), changeset (minor, all three packages).
- Seen in CI's image, not part of this task: two popover menu tests ("a link item navigates", "choosing an item") sometimes fail on mobile Chromium; Playwright scrolls to the item and the panel is then hidden or moved.
- Checked before building: a toast over an open modal is inert unless it is inside that dialog (Chromium, WebKit, Firefox); the core places it there.
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the SUB-10 PR. After the merge, the agent checks "Done when" and moves SUB-10 to Done.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); full suite and a repeated `toast.spec.ts` in CI's image; mutation checks (no placement in the modal fails R-23 and R-26; no hover pause fails R-25; Escape reaching the dialog fails R-26; no announcement delay fails R-24).
- Revision: `main` at `d3c371a` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is SUB-10.
- Result: verify passed (11 unit tests). E2E on macOS: 446 passed, 24 skipped. In CI's image: `toast.spec.ts` five times, 275 of 275; full run 445 passed, 24 skipped, 1 failed in a popover menu test on mobile Chromium (not the toast; offered to the owner as a Backlog task).
- Not run: a real phone, a screen reader.
