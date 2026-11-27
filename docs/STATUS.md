# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 14:20 CET by Claude (agent)

## Goal

Phase 2, the mobile nav ([SPEC, Phase 2](SPEC.md#phase-2-mobile-nav-built-in-review); R-11 to R-15).

## State

- Built on branch `feat/mobile-nav`, PR open for the owner's review. Core `createMobileNav` / `initMobileNavs` / `destroyMobileNavs`, CSS and tokens; React `MobileNav` (`renderLink` for a router's `Link`); Astro `MobileNav.astro`; playground page `/mobile-nav/` and a gallery card; `subfloor eject mobile-nav`; changeset (minor for all three packages).
- Core changes under it: close reason `navigate`; `lockScroll()`'s release takes `{ restore }`; an internal close with options (no focus return, no scroll restore), not exported.
- Changed from the approved wording, for the owner: a link to another page returns focus to the toggle (Chromium's native close does that anyway; WebKit would leave it on the body), without scrolling to it after a router changed the page.
- Known gap: WebKit ignores `scroll-padding` when Tab scrolls, so R-15 holds in Chromium only; a script fix is SUB-6 in Vikunja.
- Phase 1 is on `main` and live at https://phunkhouse.github.io/subfloor/. Not on npm. Claude PR reviews work (`@claude review`).

## Next step

Owner reviews the mobile nav PR (and may ask `@claude review`). The backlog is now in Vikunja (project `SUB`, Backlog column, SUB-2 to SUB-14; AGENTS.md Task queue); the owner orders it and picks what comes next.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02); it now covers the mobile nav too.
- Owner review: decision 0003 keeps native focus containment rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` (all four projects); mutation checks in Chromium and WebKit, one per requirement.
- Revision: `main` at `568dcba` plus the branch's uncommitted changes (this PR's content).
- Working tree: the mobile nav changes, before the commit.
- Result: verify passed (10 unit tests). E2E: 199 passed, 21 skipped with reasons (R-02 on phones and macOS WebKit, R-05 wheel and R-11 modifier click on phones, R-15 in WebKit). Mutation checks: no URL check fails R-11, no in-page handling fails R-12, no `closeAt` listener fails R-13, no `scroll-padding` fails R-15 (Chromium).
- Not run: Firefox, a real phone, a Next.js app (O-07).
