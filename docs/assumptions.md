# Assumptions register

Approving a plan does not confirm an assumption: it stays open until the owner confirms the fact or a reliable source verifies it. When an entry changes, update the rules and tests that depend on it in the same change.

## Confirmed

| Id | Fact or decision | Source and date | Depends on it |
| --- | --- | --- | --- |
| C-01 | Overlays in the owner's projects let the page scroll behind them; Kultomat fixed it, Systerna has it. | Owner's brief; code read 2026-11-27 (Kultomat #163, Systerna #235) | R-01 |
| C-02 | `showModal()` does not lock page scrolling. | Kultomat `use-scroll-lock.ts` and its comment; the HTML dialog spec has no scroll lock (read 2026-11-27) | R-01 |
| C-03 | Chromium and WebKit (Playwright 1.65) support Invoker Commands and `closedby`. | `no-js.spec.ts` ran unskipped on all four projects, 2026-11-27 | R-10 |
| C-04 | WebKit on macOS keeps overlay scrollbars even when `::-webkit-scrollbar` is styled. | R-02 test, 2026-11-27 | R-02 test skip |

## Open

| Id | Working assumption | Depends on it | How it gets confirmed |
| --- | --- | --- | --- |
| O-01 | iOS Safari ignores `overflow: hidden` on the root for touch scrolling, so body pinning is still needed. | R-01, decision 0002 | Manual phone check ([design](design/README.md#manual-check-on-a-phone)) with and without the script |
| O-02 | Body pinning stops touch scrolling in iOS Safari as it did in Kultomat. | R-01 | Same manual check on an iPhone |
| O-03 | Browser support floor Safari/iOS 17.4+, last two Chromium and Firefox. | `@starting-style`, `:has()`, `dvh`, `:modal` usage | Owner, against the consuming projects' audiences |
| O-04 | The `@subfloor` npm scope is free. | Package names | Owner, on npmjs.com before the first publish |
| O-05 | The repository will be `Phunkhouse/subfloor`, public, over the `github-personal` SSH alias. | `AGENTS.md` Git remote, CI | Owner, when creating it |
| O-06 | Firefox behaves like Chromium for everything tested. | R-01 to R-10 | Add a Firefox Playwright project, or a manual check |

## Disproved

| Id | Assumption | What showed it wrong, and when | What changed |
| --- | --- | --- | --- |
| X-01 | `scrollbar-gutter: stable` on the root prevents the shift while the body is pinned. | Fixed-position elements ignore the root's gutter (design of 0002, 2026-11-27) | Empty `overflow-y: scroll` track with the script |
