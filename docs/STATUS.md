# Status

Rewritten, not appended, at every handoff and whenever the state changes materially. Under one page; history lives in Git.

Updated: 2026-11-27 16:30 CET by Claude (agent)

## Goal

Fix a React adapter bug found by a flaky CI run on PR #9: a dialog opened and closed before React ran its effects reopened itself (R-04).

## State

- Fixed on branch `fix/react-stale-open-effect`, PR open for the owner's review. `packages/react/src/Dialog.tsx` keeps React state and the core in step with `useLayoutEffect` instead of `useEffect`, so no effect for an old state is left waiting. New test: R-04, open and close at once, 15 rounds. Changeset: `@subfloor/react` patch.
- It also caused the flaky R-11 keyboard test (the reopened menu closed again as `api` and restored the old offset).
- SUB-6 and SUB-14 are Done. On `main`: Modal, Drawer/Sheet, Mobile nav, `keepFocusClear`, a Firefox project. Live at https://phunkhouse.github.io/subfloor/. Not on npm. Backlog in Vikunja (`SUB`); Done policy `verified`.

## Next step

Owner reviews the fix PR. Then the owner picks the next task from the Vikunja backlog.

## Blockers and open questions

- Owner: is the `@subfloor` npm scope free (O-04)? Confirm the browser support floor (O-03). (SUB-2)
- Manual iPhone check of the scroll lock not done yet (O-01, O-02; SUB-3).
- O-07: `MobileNav` with `next/link` not yet tried in a Next.js app (SUB-5).

## Last verified

- Commands: `pnpm verify`; `pnpm test:e2e` on all five projects; the new R-04 test and the R-11 keyboard test repeated ten times each on every project.
- Revision: `main` at `9a5503f` plus this branch's changes.
- Working tree: the fix, before the commit.
- Result: verify passed (10 unit tests). E2E: 261 passed, 24 skipped with reasons. Repeated: the new R-04 test and the R-11 keyboard test, 100 of 100 runs passed with the fix; without it the R-04 test failed 6 of 25.
- Not run: a real phone; a Next.js app (O-07).
