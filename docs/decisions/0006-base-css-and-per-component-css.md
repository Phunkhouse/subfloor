# 0006. Base CSS once, component CSS brought by each component

Date: 2026-11-28  
Status: accepted (agreed with the owner, 2026-11-28; SUB-18)

## Context

Projects imported `tokens.css` and `components.css` by hand. `components.css` holds every component, so a page that uses one toast loaded the dialog, popover and menu styles too, and a project had to remember the import at all. The owner asked for styles that come with the component, only the ones in use, with a small base imported once.

## Decision

- `@subfloor/core/base.css` is imported once by the project: the tokens (projects use them in their own CSS too) and page-level rules that belong to no single component (R-15 `scroll-padding`, in `page.css`). It does not declare the layer order: with Tailwind, `tailwind.css` declares it first; without, the first `@layer subfloor` block does.
- Each component's stylesheet is exported as `@subfloor/core/styles/<component>.css`. The React and Astro components import their own (and the one they build on: Menu brings the popover's, the mobile nav the dialog's), so the project's bundler puts exactly those styles in the page's CSS.
- `components.css` (page-level rules and every component) and `tokens.css` stay, unchanged, for plain-script use (`showToast`, `createDialog`) and for projects that prefer one file.
- Plain CSS files imported from the component modules: no CSS-in-JS, no styles injected by script, no Shadow DOM, so styles are in the server-rendered page (no flash) and stay in `@layer subfloor` (project CSS still wins).

## Alternatives considered

- Every component importing the tokens as well, no base: a project's own CSS that uses `var(--sf-…)` would depend on some component being on the page; the tokens are the project's theme entry point and belong in one stylesheet it owns.
- CSS-in-JS or Shadow DOM: break the `@layer` customisation the kit is built on, and inject styles by script.
- Keeping one manual `components.css`: simplest, but loads every component and is easy to forget.

## Consequences

- Verified in the Next.js App Router with a fixture in this repository (`apps/next-fixture`, `pnpm test:next`, run in CI): a page importing only `base.css` gets the styles of the components it renders, and a page without them gets none. Astro bundles per page the same way (the playground imports only `base.css`).
- A project's unit tests that render the React components meet `.css` imports; most setups handle them, some need one line of config (upgrade note).
- A project that keeps importing `components.css` and uses the adapters loads some rules twice: harmless, but should drop the global import (upgrade note).
- `@subfloor/react` declares `@subfloor/core/styles/*.css` for TypeScript (side-effect imports are checked).
