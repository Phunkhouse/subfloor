# Subfloor specification

Facts are marked **confirmed** (by whom, date), **assumption**, **proposal** or **decided** (with a link). The starter pack revision, profile and recipes are recorded in the Governance section of `AGENTS.md`.

## Purpose and users

The owner's projects (Next.js and Astro today, maybe other frameworks later) keep rebuilding the same UI and keep hitting the same bugs, above all overlays whose page still scrolls behind them. Subfloor is one public package set with those defaults built in, so a fix made once reaches every project. It is the layer under the visible design: it makes the floor solid, not pretty. **Confirmed** (owner, 2026-11-27).

Users: the owner and the agents working in the owner's projects. Public on npm under `@subfloor`, with no promises to outside users yet. **Assumption** (the brief says public; support for outside users was not discussed).

## Scope

### Phase 1 (current)

- Monorepo: `@subfloor/core` (tokens, CSS, behaviour), `@subfloor/react`, `@subfloor/astro`, the playground (docs, demos, test target), Changesets, an `eject` command.
- Tokens; **Modal** and **Drawer/Sheet** with core, React and Astro adapters and a playground page each.
- Playwright on Chromium and WebKit, desktop and phone, proving R-01 to R-10 (R-11 to R-15 in Phase 2).
- `AGENTS.md` / `CLAUDE.md`, and a rules snippet for consuming projects ([consumer-rules.md](consumer-rules.md)).

**Confirmed** (owner, 2026-11-27; plan approved the same day).

### Phase 2: mobile nav (built, in review)

Scope approved by the owner on 2026-11-27. **Decided** (owner, 2026-11-27). A modal phone menu that is the Phase 1 dialog plus a thin core layer: `createMobileNav` / `initMobileNavs` / `destroyMobileNavs` on `dialog[data-sf-mobile-nav]`, `data-placement="start|end"` (default `end`), links in `ul.sf-mobile-nav__list` inside `nav.sf-mobile-nav__nav`, a new close reason `navigate`, tokens `--sf-mobile-nav-width`, `--sf-color-current`, `--sf-fixed-top` / `--sf-fixed-bottom`, React `MobileNav` (with `renderLink` for a router's `Link`) and Astro `MobileNav.astro`, a playground page, and Playwright tests on all four projects. Requirements R-11 to R-15 below.

Not included: a top sheet under the bar, submenus, drag-to-close ([BACKLOG.md](BACKLOG.md)).

### Out of scope now

Popover/Dropdown, Toast, Tabs and form fields are later phases ([BACKLOG.md](BACKLOG.md)); the API must leave room for them. Publishing to npm, creating the npm organisation and pushing to a remote happen only on the owner's word. **Confirmed** (owner, 2026-11-27).

## Research: pitfalls found in the owner's projects

Read on 2026-11-27, read-only: Kultomat, Systerna, eucal, david-krapka, job-assistant, santana. Each pitfall became a requirement below.

| Pitfall | Where it was seen | Requirement |
| --- | --- | --- |
| `showModal()` makes the page inert but lets it scroll. `overflow: hidden` on the root is ignored by touch scrolling in iOS Safari. | Kultomat fixed it by pinning the body (#163, `lib/use-scroll-lock.ts`); Systerna's kit Dialog (#235) has no lock; david-krapka uses `html.menu-open { overflow: hidden }`. | R-01 |
| The content jumps sideways when the scrollbar goes; `100vw` includes the scrollbar. | Kultomat keeps the track with `overflow-y: scroll`; Systerna sizes dialogs with `100vw`. | R-02 |
| A drag that starts inside the dialog and ends on the backdrop closed it. | Systerna review of #235. | R-03 |
| `onClose` ran twice (the native `close` event after a close the caller asked for); a dialog the browser closed while state said open could not be reopened. | Systerna review of #235. | R-04 |
| A long sheet ran off the top of the screen; scrolling inside a sheet scrolled the page. | Systerna (#235, `max-height: 90dvh` added); Kultomat uses `overscroll-behavior: contain`. | R-05 |
| Exit animations kept the element with a timeout (`CLOSE_MS`). | Kultomat `header-menu.tsx`. | R-06 |
| Focus return and containment hand-rolled differently in every menu; Safari does not focus a clicked button, so "the previously focused element" is the body. | eucal `useFocusTrap`; david-krapka sets `inert` on `main` and `footer` by hand (and broke the skip link, WEB-002); Kultomat's phone menu closes on focus loss (WEB-001). | R-07, R-08 |
| A fixed bottom bar hides the focused control. | Systerna WEB-001. | R-15 |
| Dropdowns inside a panel are clipped by its `overflow`; a snackbar must sit above the bottom bar. | Systerna `clipEdges`, `Snackbar` with `popover="manual"`. | Later (top layer for Popover and Toast) |
| jsdom has no `showModal`, so unit tests of dialogs test a fallback, not the browser. | Systerna `Dialog.tsx`. | D-03 |

Components rebuilt in almost every project: dialog or sheet, phone menu, dropdown or menu, select, toast or snackbar, theme menu. They match the later phases.

## Requirements

Each is tested in `apps/playground/e2e/` (test names start with the id) on Chromium, WebKit, Pixel 7 and iPhone 15 unless the test says why it is skipped.

- **R-01 No background scroll.** While an overlay is open the page does not move: not by wheel, script or touch gesture. The scroll position after closing is the one before opening. Locks nest. Approach: CSS `:root:has(dialog[data-sf-dialog]:modal) { overflow: hidden }` (works without JS) plus pinning the body with `position: fixed` and restoring the offset with `scroll-behavior: auto`. **Decided** ([0002](decisions/0002-scroll-lock.md)).
- **R-02 No layout shift.** The content does not move sideways when the page's scrollbar goes. With the script, the root keeps an empty scrollbar track only if the page had a classic scrollbar; without it, `scrollbar-gutter: stable`. No `100vw` in kit CSS.
- **R-03 Closing.** Escape, the close button and a click on the backdrop close it. A press that starts inside and is released on the backdrop does not.
- **R-04 One change, one event.** The core emits `sf:open-change` once per change with a reason (`escape`, `backdrop`, `button`, `api`). The React adapter calls `onOpenChange` once for each change the user makes and never for a change made through `open`; it reopens after the browser closed it.
- **R-05 Long content.** A dialog or sheet never exceeds the viewport (`dvh`); its body scrolls and does not chain to the page. A sheet keeps clear of `env(safe-area-inset-bottom)`.
- **R-06 Motion.** `data-state` is `open`, `closing` or `closed`. Opening animates from `@starting-style`; closing waits for the transition (not a timeout) before the dialog leaves the top layer. Under `prefers-reduced-motion: reduce` there is no transition.
- **R-07 Focus.** Focus moves into the dialog on open, never reaches the page behind it, and returns to the opener on close, also in Safari. After the last control, Tab may pass through the browser's own UI, as native modal dialogs do. **Decided** ([0003](decisions/0003-native-focus-containment.md)).
- **R-08 Inert background.** Nothing behind an open overlay can be focused or hit.
- **R-09 Customisation without forking.** Every visual value is a `--sf-*` token; all kit CSS is in `@layer subfloor`, so unlayered project CSS and Tailwind utilities override it without `!important`. Variants and state are data attributes.
- **R-10 Without JavaScript.** In browsers with Invoker Commands, the same markup opens (`command="show-modal"`), closes with Escape and the close button (`<form method="dialog">`), closes on the backdrop where `closedby` is supported, is placed and styled as with the script, and the page does not scroll (except by touch in iOS Safari, which needs the script). Known gaps without the script: no closing transition; WebKit returns focus to nothing, because a clicked button never took focus. The mobile nav without the script: links to other pages work; a link to this page leaves the menu open, and it does not close when the window grows.
- **R-11 Links close it (mobile nav).** Following a link in the menu closes it with reason `navigate`, also when a client-side router (Next.js, Astro view transitions) keeps the page. If the URL changed while the menu was open, the page is left at the top rather than scrolled back to the old offset. A link opened elsewhere (modifier keys, `target="_blank"`, `download`) leaves it open. Tested with a `history.pushState` stand-in for a router, not yet in a Next.js app (O-07).
- **R-12 In-page links land.** A link to a fragment of the current page closes the menu, lets the page come back to where it was, then follows the link, so the browser scrolls to the target and Tab starts there.
- **R-13 Closes when the window grows.** `data-sf-close-at="<media query>"` closes it (reason `api`) when the query starts to match, for example once the desktop layout applies. Already closed: nothing happens. An invalid query never matches, so it never closes the menu.
- **R-14 Focus and inertness.** No hand-set `inert`. While the menu is open nothing behind it can get focus, including the skip link (david-krapka WEB-002, Kultomat WEB-001). On close, Escape, the close button, the backdrop, R-13 and a link to another page return focus to the toggle (R-07; after a router changed the page, without scrolling to it). An in-page link moves it to the link's target (R-12). If the browser loads a new page, that page decides. Once closed, the skip link works as usual.
- **R-15 Fixed bars do not cover focus.** `--sf-fixed-top` and `--sf-fixed-bottom` set `scroll-padding` on the root, so Tab and in-page links keep focused controls and targets clear of fixed bars (Systerna WEB-001). It is in `@layer subfloor`, so a project's own `scroll-padding` wins; the playground page says to set the tokens instead. Proven in Chromium; WebKit ignores `scroll-padding` when Tab scrolls (see Known limitations).

## Data and trust boundaries

No data is stored and nothing runs on a server. The packages run in the consuming project's pages; `@subfloor/core` has no runtime dependencies. Supply chain: Dependabot, pinned dev dependencies, pnpm's `allowBuilds` list, and publishing only by the owner ([runbook](runbook.md)).

## Technical approach

- pnpm workspaces; TypeScript 6.0.x; tsup builds `@subfloor/core` and `@subfloor/react` to ESM with types; `@subfloor/astro` ships `.astro` source. Changesets with the three packages versioned together (`fixed`). **Decided** (owner's brief, 2026-11-27).
- One behaviour for Modal, Drawer and Sheet: a native modal `<dialog>` with `data-placement` = `center`, `start`, `end` or `bottom`. **Decided** ([0001](decisions/0001-one-native-dialog.md)).
- The React package is one client module (`'use client'` banner) so it works in the Next.js App Router; the dialog renders closed on the server. Invoker Commands attributes are typed for React by `src/invokers.ts`.
- CSS: `tokens.css`, `components.css`, optional `tailwind.css` (`@theme inline` mapping and the layer order `theme, base, subfloor, components, utilities`).
- Browser support: Safari/iOS 17.4+, last two versions of Chromium and Firefox. **Assumption** (owner accepted it as a default, 2026-11-27; not checked against the consuming projects' audiences).
- Tests: Vitest for the scroll lock and `eject`; Playwright for everything a browser decides (D-03).

### Decision log

- D-01 Profile MVP, Standard CI, recipes `ci-strategy`, `playwright-e2e`, `claude-pr-review`; legal and scalability planning declined. Owner, 2026-11-27.
- D-02 Plan and research summary approved; prefix `sf`, MIT, Node 26 for the repo, drag-to-close for sheets deferred. Owner, 2026-11-27 (defaults stated in the plan, not objected to).
- D-03 Dialog behaviour is tested in real browsers only; jsdom lacks `showModal`. Agent, 2026-11-27.
- D-04 Records [0001](decisions/0001-one-native-dialog.md), [0002](decisions/0002-scroll-lock.md), [0003](decisions/0003-native-focus-containment.md). Agent, 2026-11-27; for the owner's review.

## Known limitations and risks

- WebKit (Safari) ignores `scroll-padding` when Tab moves focus to a control: it scrolls the control only to the viewport edge, under a fixed bar, while `scrollIntoView` honours the padding. R-15 holds in Chromium and is skipped in WebKit with this reason. A script fix (scroll the focused control into view on `focusin`) would be a page-wide listener; it is proposed in the backlog, not built. Safari's Tab reaches only form fields unless the user turns on full keyboard access.
- The `navigate` close cannot tell a full page load from a client-side route before the URL changes. A router that changes the URL after the closing transition (slow data loading) gets the old offset back and then has to scroll to the top itself; Next.js is expected to (O-07).
- Playwright WebKit is not iOS Safari. The phone tests prove the body is pinned (the page cannot move even by script) and the offset is restored, which is what stops iOS touch scrolling, but no test drives a real finger in iOS Safari. Mobile Chromium runs a real touch scroll gesture. The manual phone check is in [design/README.md](design/README.md#manual-check-on-a-phone).
- On macOS, WebKit keeps overlay scrollbars even when styled, so R-02 is skipped there and proven in Chromium (and in WebKit on Linux CI if it shows classic scrollbars).
- Global element styles in a project (`button { … }`) override the kit's parts, because unlayered CSS beats `@layer subfloor`. That is intended (R-09) but surprising; [consumer-rules.md](consumer-rules.md) says to scope them.
- The playground imports the packages' `dist/`, so `pnpm typecheck` and `pnpm test:e2e` build first.

## Planning and open questions

- Is the `@subfloor` npm scope free? `@subfloor/core` does not exist on npm (checked 2026-11-27); the organisation itself was not checked. Owner.
- Declined at setup (2026-11-27): legal planning, scalability and cost planning.

## Design

Approved interaction rules and the manual phone check are in [design/README.md](design/README.md).
