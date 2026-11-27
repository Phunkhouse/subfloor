# Design source of truth

Subfloor is the layer under each project's design: it fixes behaviour and gives neutral defaults, and every visual value is a token the project overrides. The live reference is the playground (`pnpm dev`).

## Interaction principles

- Overlays: the page behind does not scroll, does not move sideways and cannot be focused or clicked. Escape, the close button and the backdrop close them. Focus returns to the opener. See R-01 to R-08 in [SPEC.md](../SPEC.md).
- Motion: open from `@starting-style`, close with a shorter, accelerating transition; none under reduced motion.
- Touch targets: at least `--sf-touch-target` (44 px).
- Phone heights use `dvh`; edges respect `env(safe-area-inset-*)`.

## Visual system

Tokens and their defaults: `packages/core/src/styles/tokens.css`, shown on the playground's Overview page. Neutral greys with a blue focus colour, light and dark by `prefers-color-scheme`. Proposal: projects set their own colours, radius and fonts; the defaults only need to look acceptable.

## Manual check on a phone

Playwright WebKit is not iOS Safari. Before a release that changes the scroll lock, on a real iPhone (and an Android phone):

1. Open the playground (`pnpm --filter playground exec astro dev --host`), scroll the Modal page half way.
2. Open the modal, the drawer and the sheet in turn. Drag the backdrop up and down with a finger: the page must not move.
3. In the sheet, scroll the list to its end and keep dragging: the page must not move.
4. Close each one: the page is where it was, and nothing jumped.
5. Rotate the phone with the sheet open: it stays within the screen.

Last done: not yet.

## Open design questions

- Drag-to-close for sheets (Kultomat `SheetGrab`): deferred (D-02).
