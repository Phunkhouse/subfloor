# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 13:25 CET by Claude (agent)

## Goal

Phase 1 of Subfloor ([SPEC](SPEC.md#phase-1-current)): the monorepo, tokens, Modal and Drawer/Sheet with core, React and Astro adapters, a playground page each, and Playwright proof of R-01 to R-10.

## State

- Phase 1 is built and committed locally (`cbb4619`). Stopped here for the owner's review, as agreed.
- `@subfloor/core`: tokens, `components.css`, `tailwind.css`, `createDialog` / `initDialogs` / `lockScroll`, `subfloor eject`. `@subfloor/react`: `Dialog`, `Modal`, `Drawer`. `@subfloor/astro`: `Dialog.astro`, `Modal.astro`, `Drawer.astro`.
- Playground: Overview (tokens), Modal, Drawer and Sheet, React adapter.
- Not published, no remote, no hosted CI yet.

## Next step

Owner reviews Phase 1 (start with the playground: `pnpm install && pnpm dev`) and the three decision records, then does the owner actions in [runbook.md](runbook.md#owner-actions-pending).

## Blockers and open questions

- Owner: create the GitHub repository (assumed `Phunkhouse/subfloor`, public); until then there is no hosted CI and nothing can be merged under the MVP rule.
- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03).
- Manual iPhone check of the scroll lock not done yet (O-01, O-02).
- Owner review: decision 0003 keeps native focus containment (Tab may visit the browser UI, never the page) rather than a scripted wrap.

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e`; `playwright test --repeat-each=3`.
- Revision: `cbb4619` (verified on the identical working tree just before committing).
- Working tree: clean apart from this file.
- Result: verify passed (8 unit tests). E2E 134 passed, 14 skipped with reasons (R-02 on phones and on macOS WebKit: overlay scrollbars; R-05 wheel test on phones); 402 of 402 passed over three repeats. Mutation checks: removing the scroll lock fails R-01 on all four projects; removing the scrollbar track fails R-02 in Chromium.
- Not run: hosted CI (no repository), Firefox (no project yet), a real iPhone or Android phone.
