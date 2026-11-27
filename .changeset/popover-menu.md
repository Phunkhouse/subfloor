---
'@subfloor/core': minor
'@subfloor/react': minor
'@subfloor/astro': minor
---

Popover and Menu (R-16 to R-21).

- Core: `createPopover`, `initPopovers`, `destroyPopovers` (`PopoverController`, `PopoverCloseReason`, `PopoverState`) for `[popover][data-sf-popover]`; `createMenu`, `initMenus`, `destroyMenus` (`MenuController`, `MenuSelectDetail`) for `[data-sf-menu]` with the WAI-ARIA menu button keyboard and a new `sf:select` event. `OpenChangeDetail` takes an optional reason type (`OpenChangeDetail<PopoverCloseReason>`); the default is unchanged.
- CSS in `components.css`: `sf-popover` (placed with CSS anchor positioning, flipping at screen edges; a bottom sheet where anchor positioning is missing), `sf-menu`, `sf-menu__item`, `sf-menu__separator`. New tokens `--sf-popover-min-width`, `--sf-popover-max-width`, `--sf-popover-max-height`, `--sf-popover-offset`, `--sf-radius-popover`, `--sf-shadow-popover`, `--sf-color-danger`.
- React: `Popover` and `Menu` (with `renderLink` for a router's `Link`).
- Astro: `@subfloor/astro/Popover.astro` and `@subfloor/astro/Menu.astro`.
- `subfloor eject popover` and `subfloor eject menu` (alias `dropdown`).
