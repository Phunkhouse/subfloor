# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 21:40 CET by Claude (agent)

## Goal

SUB-18: base CSS once, component CSS brought by each component (decision 0006), agreed with the owner on 2026-11-28; before SUB-12 (form fields, Select first).

## State

- Built on branch `feat/sub-18-component-css`, PR open for the owner's review.
  - Core: `base.css` (tokens + `page.css`, the R-15 `scroll-padding` moved out of `mobile-nav.css`) and `styles/<component>.css`, exported as `./base.css` and `./styles/*`. `components.css` and `tokens.css` unchanged.
  - React and Astro components import their own stylesheets; `@subfloor/react` declares the `.css` modules for TypeScript.
  - The playground imports only `base.css` (pages that use `showToast` directly import `toast.css`).
  - New `apps/next-fixture` (Next.js 16.4.6, App Router) and `pnpm test:next`, run in CI (`e2e.yml`).
  - Decision 0006, SPEC, README, AGENTS commands, consumer rules with upgrade notes, changeset (minor, all three packages).
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu, Toast, `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); SUB-17 open; SUB-12 plan recorded; Done policy `verified`.

## Next step

Owner reviews the SUB-18 PR. Then SUB-12 (Select first) on the owner's word.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (macOS); `pnpm test:next`; both in CI's image; mutation checks (without its CSS import the Astro dialog fails the dialog tests, the React dialog fails the Next fixture).
- Revision: `main` at `290a5f9` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is SUB-18.
- Result: verify passed (11 unit tests). E2E on macOS and in CI's image: 461 passed, 24 skipped. `pnpm test:next`: 2 passed, on macOS and in CI's image.
- Not run: a project's own unit tests with the new CSS imports (Jest/Vitest config varies; upgrade note in the changeset).
