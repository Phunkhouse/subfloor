---
'@subfloor/core': minor
'@subfloor/react': minor
'@subfloor/astro': minor
---

Mobile nav: the phone menu on the dialog core.

- Core: `createMobileNav`, `initMobileNavs`, `destroyMobileNavs` and `MobileNavController` for `dialog[data-sf-mobile-nav]`. A followed link closes it with the new close reason `navigate` (R-11), in-page links land on their target (R-12), and `data-sf-close-at="<media query>"` closes it when the query matches (R-13). New CSS in `components.css` (`sf-mobile-nav`, `sf-mobile-nav__nav`, `__list`, `__link`), and new tokens `--sf-mobile-nav-width`, `--sf-color-current`, `--sf-fixed-top` and `--sf-fixed-bottom`, which set the root's `scroll-padding` (R-15).
- `DialogCloseReason` gains `'navigate'`. The function `lockScroll()` returns now takes `{ restore?: boolean }` (`ReleaseOptions`).
- React: `MobileNav`, with `links`, `renderLink` for a router's `Link`, and `closeAt`.
- Astro: `@subfloor/astro/MobileNav.astro`.
- `subfloor eject mobile-nav` (alias `nav`).
