---
'@subfloor/core': minor
'@subfloor/react': minor
'@subfloor/astro': minor
---

Base CSS once, component CSS brought by each component (decision 0006).

- Core: new `@subfloor/core/base.css` (tokens and page-level rules, such as the R-15 `scroll-padding`) and `@subfloor/core/styles/<component>.css` (`dialog`, `mobile-nav`, `popover`, `menu`, `toast`). `components.css` and `tokens.css` are unchanged.
- React and Astro: each component now imports its own stylesheet, so a page gets only the styles of the components it uses.

Upgrade: import `@subfloor/core/base.css` once instead of `tokens.css` and `components.css` (keep `components.css` only if you use the plain-script API without the components; keeping it with the components loads some rules twice). Unit tests that render the React components now meet `.css` imports: most setups handle them, others need a CSS module mapping or `css: true` in Vitest.
