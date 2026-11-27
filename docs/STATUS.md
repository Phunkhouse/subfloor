# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 13:20 CET by Claude (agent)

## Goal

Phase 1 of Subfloor ([SPEC](SPEC.md#phase-1-current)): the monorepo, tokens, Modal and Drawer/Sheet with core, React and Astro adapters, a playground page each, and Playwright proof of R-01 to R-10. Last step, added by the owner on 2026-11-27: a visual component overview published on GitHub Pages.

## State

- Phase 1 is built and on `main` of `Phunkhouse/subfloor` (public, pushed 2026-11-27 on the owner's word): Phase 1 `c9e5fdb`, the visual overview and Pages workflow `593441d`. Stopped here for the owner's review, as agreed.
- `@subfloor/core`: tokens, `components.css`, `tailwind.css`, `createDialog` / `initDialogs` / `lockScroll`, `subfloor eject`. `@subfloor/react`: `Dialog`, `Modal`, `Drawer`. `@subfloor/astro`: `Dialog.astro`, `Modal.astro`, `Drawer.astro`.
- Playground: Overview (component gallery with live demos, tokens), Modal, Drawer and Sheet, React adapter. `pages.yml` publishes it to GitHub Pages from `main`; it builds and works under `/subfloor/` locally.
- Playground live at https://phunkhouse.github.io/subfloor/ (Pages run 45996538433 passed; smoke-tested in WebKit: dialogs open and lock the page). Not on npm.

## Next step

Owner reviews Phase 1 (start with https://phunkhouse.github.io/subfloor/) and the three decision records, then the remaining owner actions in [runbook.md](runbook.md#owner-actions-pending).

## Blockers and open questions

- Hosted CI (`ci.yml`, `e2e.yml`) runs on pull requests only; its first run is on this status PR.
- Owner: install the Claude GitHub App and add `CLAUDE_CODE_OAUTH_TOKEN` for `@claude review`.
- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02).
- Owner review: decision 0003 keeps native focus containment (Tab may visit the browser UI, never the page) rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e`; `playwright test --repeat-each=3` (at `cbb4619`); a build and preview under `BASE_PATH=/subfloor/`.
- Revision: `198307e` (same trees as the verified `ff7e341`; the commits were re-authored with the GitHub noreply address before the first push, contents unchanged; `pnpm verify` re-run on the final docs commit).
- Working tree: clean apart from this file.
- Result: verify passed (8 unit tests). E2E 146 passed, 14 skipped with reasons (R-02 on phones and on macOS WebKit: overlay scrollbars; R-05 wheel test on phones); 402 of 402 passed over three repeats at `cbb4619`. Mutation checks: removing the scroll lock fails R-01 on all four projects; removing the scrollbar track fails R-02 in Chromium.
- Hosted: Pages build and deploy passed on `198307e`. CI and E2E: first run on this PR.
- Not run: Firefox (no project yet), a real iPhone or Android phone.
