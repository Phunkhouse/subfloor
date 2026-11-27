# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 13:35 CET by Claude (agent)

## Goal

Phase 1 of Subfloor ([SPEC](SPEC.md#phase-1-current)): the monorepo, tokens, Modal and Drawer/Sheet with core, React and Astro adapters, a playground page each, and Playwright proof of R-01 to R-10. Last step, added by the owner on 2026-11-27: a visual component overview published on GitHub Pages.

## State

- Phase 1 is built and committed locally (`cbb4619`); the visual overview and the Pages workflow followed (`ff7e341`). Stopped here for the owner's review, as agreed.
- `@subfloor/core`: tokens, `components.css`, `tailwind.css`, `createDialog` / `initDialogs` / `lockScroll`, `subfloor eject`. `@subfloor/react`: `Dialog`, `Modal`, `Drawer`. `@subfloor/astro`: `Dialog.astro`, `Modal.astro`, `Drawer.astro`.
- Playground: Overview (component gallery with live demos, tokens), Modal, Drawer and Sheet, React adapter. `pages.yml` publishes it to GitHub Pages from `main`; it builds and works under `/subfloor/` locally.
- Not published, no remote, no hosted CI or Pages yet.

## Next step

Owner reviews Phase 1 (start with the playground: `pnpm install && pnpm dev`) and the three decision records, then does the owner actions in [runbook.md](runbook.md#owner-actions-pending).

## Blockers and open questions

- Owner: create the GitHub repository (assumed `Phunkhouse/subfloor`, public); until then there is no hosted CI and nothing can be merged under the MVP rule.
- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02).
- Owner review: decision 0003 keeps native focus containment (Tab may visit the browser UI, never the page) rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e`; `playwright test --repeat-each=3` (at `cbb4619`); a build and preview under `BASE_PATH=/subfloor/`.
- Revision: `ff7e341` (verified on the identical working tree just before committing).
- Working tree: clean apart from this file.
- Result: verify passed (8 unit tests). E2E 146 passed, 14 skipped with reasons (R-02 on phones and on macOS WebKit: overlay scrollbars; R-05 wheel test on phones); 402 of 402 passed over three repeats at `cbb4619`. Mutation checks: removing the scroll lock fails R-01 on all four projects; removing the scrollbar track fails R-02 in Chromium.
- Not run: hosted CI and the Pages deploy (no repository), Firefox (no project yet), a real iPhone or Android phone.
