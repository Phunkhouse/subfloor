# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 17:00 CET by Claude (agent)

## Goal

SUB-8: use `MobileNav` for the playground's own header on phones.

## State

- Built on branch `feat/sub-8-playground-header`, PR open for the owner's review. `Docs.astro`: below 768 px the inline links hide and a Menu button opens `MobileNav.astro` (`site-menu`) with the same links, the current page marked and `closeAt="(min-width: 768px)"`. The button uses the playground's button style. Playground only; no package change, so no changeset.
- New `e2e/site.spec.ts`: on a phone the menu lists the pages with the current one marked and its links navigate; growing past 768 px closes it; wide screens show the inline links.
- On `main`: Modal, Drawer/Sheet, Mobile nav, `keepFocusClear`, the Firefox project, the React stale-effect fix. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); SUB-6 and SUB-14 Done; Done policy `verified`.

## Next step

Owner reviews the SUB-8 PR. After the merge, the agent checks "Done when" and moves SUB-8 to Done; then the owner picks the next task.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03). (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects; screenshots of the header and the open menu at 390 px (Chromium).
- Revision: `main` at `320e171` plus this branch's changes.
- Working tree: the SUB-8 changes, before the commit.
- Result: verify passed (10 unit tests). E2E: 276 passed, 24 skipped with the existing reasons (15 new header tests).
- Not run: a real phone. Without JavaScript, the Menu button needs Invoker Commands (Chromium, Firefox, recent Safari); an older Safari without them and without JavaScript has no page links on a phone.
