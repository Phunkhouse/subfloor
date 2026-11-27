# Subfloor

A native-first UI foundation for the owner's projects (Next.js and Astro today). Like a subfloor, it is the layer under the visible design: overlays that do not let the page scroll behind them, keep focus where it belongs and work before JavaScript arrives. A fix made here reaches every project.

It has **Modal**, **Drawer/Sheet** and **Mobile nav**. Popover/dropdown, toast, tabs and form fields come later (the [backlog](docs/BACKLOG.md) is in Vikunja).

## Packages

| Package           | What it is                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@subfloor/core`  | `tokens.css`, `components.css`, optional `tailwind.css`, and the behaviour (`createDialog`, `initDialogs`, `createMobileNav`, `lockScroll`). No runtime dependencies. Also the `subfloor eject` command. |
| `@subfloor/react` | `Dialog`, `Modal`, `Drawer`, `MobileNav` for React 19; works in the Next.js App Router.                                                                                                                  |
| `@subfloor/astro` | `Dialog.astro`, `Modal.astro`, `Drawer.astro`, `MobileNav.astro`, shipped as source.                                                                                                                     |
| `apps/playground` | Docs and live demos of every component, and the Playwright test target.                                                                                                                                  |

Not published yet. Usage, markup, tokens and customisation for each component are in the playground, which opens with a visual overview of the components. GitHub Pages publishes it from `main` once the repository exists (`.github/workflows/pages.yml`).

```css
@import '@subfloor/core/tokens.css';
@import '@subfloor/core/components.css';
```

```astro
---
import Modal from '@subfloor/astro/Modal.astro'
---

<button command="show-modal" commandfor="confirm">
  Delete
</button>
<Modal id="confirm" title="Delete project?">
  …
</Modal>
```

## Getting started

Prerequisites: Node 26 (`.nvmrc`), pnpm 12 (`packageManager`).

```sh
pnpm install
pnpm dev                 # playground on http://localhost:4321
pnpm verify              # format, lint, typecheck, unit tests, build
pnpm --filter playground exec playwright install chromium webkit   # once
pnpm test:e2e            # Playwright: Chromium, WebKit, Pixel 7, iPhone 15, with and without JS
```

All commands are listed in [AGENTS.md](AGENTS.md#commands).

## How it works

- **Native first.** A modal `<dialog>` gives the top layer, the inert page, Escape and focus containment. Invoker Commands (`command="show-modal"`) open it without script, `<form method="dialog">` closes it, and CSS (`:root:has(:modal)`) locks the page. About 200 lines of TypeScript add what the platform lacks: body pinning for iOS touch scrolling, a backdrop click that ignores drags, one `sf:open-change` event per change, `data-state` with a real closing transition, and focus back on the opener in Safari.
- **One core, thin adapters.** Modal, Drawer and Sheet are one dialog with `data-placement`; the mobile nav is that dialog plus `createMobileNav` (links close it, in-page links land, `closeAt`). React and Astro only render the markup and call the core.
- **Customise without forking.** Every value is a `--sf-*` token; all kit CSS is in `@layer subfloor`, so project CSS and Tailwind utilities win without `!important`. `subfloor eject dialog --adapter react` copies the source when a project truly must diverge.

The requirements (R-01 to R-15) came from pitfalls found in Kultomat, Systerna and the other projects; they and their tests are in the [specification](docs/SPEC.md).

## Decisions and trade-offs

- [0001](docs/decisions/0001-one-native-dialog.md) One native dialog for every placement.
- [0002](docs/decisions/0002-scroll-lock.md) Scroll lock: CSS first, body pinning for touch; an empty scrollbar track instead of `scrollbar-gutter` while pinned.
- [0003](docs/decisions/0003-native-focus-containment.md) Focus containment stays native: Tab may visit the browser UI, never the page.
- Behaviour is tested only in real browsers (jsdom has no `showModal`); Vitest covers the scroll lock and eject.

## Limitations

- Playwright WebKit is not iOS Safari: the real-finger check on an iPhone is manual ([design](docs/design/README.md#manual-check-on-a-phone)).
- Without JavaScript: no closing transition, no touch scroll lock in iOS Safari, and WebKit does not return focus. Opening needs Invoker Commands.
- No Firefox test project yet.

## Documentation

- [Specification](docs/SPEC.md), [status](docs/STATUS.md), [backlog](docs/BACKLOG.md), [assumptions](docs/assumptions.md), [runbook and releases](docs/runbook.md), [design](docs/design/README.md), [decision records](docs/decisions/README.md).
- [Rules to paste into consuming projects](docs/consumer-rules.md).

## Licence

MIT
