# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 20:30 CET by Claude (agent)

## Goal

The toast grew once it appeared (owner, 2026-11-28): its words arrived 100 ms after the box.

## State

- Fixed on branch `fix/toast-no-growth`, PR open for the owner's review. The visible message is there from the first frame, hidden from screen readers (`aria-hidden`); a visually hidden copy `.sf-toast__announce` in the live region gets the text after 100 ms. New test: the toast's size in its first frame equals its size after the announcement (failed on all five projects before). Changeset: `@subfloor/core` patch.
- Select plan agreed with the owner and recorded on SUB-12: a styled native `<select>` first (closed box in every browser, open list where `appearance: base-select` exists), a shared `.sf-caret` for Select and Popover/Menu buttons; a custom listbox later, only if needed.
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, Toast (with the review follow-up, #19), `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); SUB-17 open; Done policy `verified`.

## Next step

Owner reviews this PR; then SUB-12 (form fields, Select first) on the owner's word.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); `toast.spec.ts` repeated in CI's image; the new size test on the old code.
- Revision: `main` at `404cda0` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is the fix.
- Result: verify passed (11 unit tests). E2E on macOS: 461 passed, 24 skipped. In CI's image: `toast.spec.ts` five times, 350 of 350. The size test failed on all five projects before the fix.
- Not run: a real screen reader (the announcement copy is the standard live-region text insertion).
