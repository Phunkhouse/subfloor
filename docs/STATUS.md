# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-28 10:10 CET by Claude (agent)

## Goal

Follow-up to Claude's review of #14 (popovers stay on screen): a stronger short-screen test and exact wording of R-17's limits.

## State

- On branch `test/popover-fit-review`, PR open for the owner's review. The R-17 short-screen test now also checks that the menu is beside its button, not over it, so it catches a missing fallback in Firefox too (all three engines fail without the fit fallbacks). SPEC R-17 and the playground page state the limits: the shorter panel is at least 8rem, and it tries start alignment first whatever `data-placement` asked. Tests and docs only; no package change, no changeset.
- Not done, from the same review: making the fit fallbacks follow `data-placement` (stays on screen either way; worth doing only when someone needs it).
- On `main`: Modal, Drawer/Sheet, Mobile nav, Popover and Menu (on-screen fit from #14), `keepFocusClear`, the Firefox project, the playground header menu. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); new SUB-15 (flaky R-19 Tab test in Linux WebKit). Done policy `verified`.

## Next step

Owner reviews this PR. Then the owner picks the next task from the Vikunja backlog.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03): anchor positioning needs Safari 26. (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects; mutation check (without the fit fallbacks the short-screen test fails in Chromium, WebKit and Firefox).
- Revision: `main` at `f4da2e5` plus this branch's changes.
- Working tree: clean after the commit; the branch commit is this follow-up.
- Result: verify passed (11 unit tests). E2E on macOS: 371 passed, 24 skipped.
- Not run: a real phone; Safari before 26.
