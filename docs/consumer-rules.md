# Rules for projects that use Subfloor

Paste this section into a project's `AGENTS.md` (or `CLAUDE.md`).

---

## UI foundation: Subfloor

- Overlays and menus come from Subfloor (`@subfloor/core` with `@subfloor/react` or `@subfloor/astro`): Modal, Drawer and Sheet today; mobile nav, popover/dropdown, toast and tabs as they arrive. Never hand-roll a modal, drawer, sheet, phone menu or dropdown, and never add a scroll lock, focus trap or `inert` handling of your own.
- Customise with `--sf-*` tokens, the `sf-*__*` part classes and `data-*` attributes, in your own CSS. Subfloor's CSS is in `@layer subfloor`, so your CSS wins without `!important`. Keep global element rules (`button { … }`) scoped, or they restyle the kit's parts too.
- If Subfloor lacks something or has a bug, fix it in Subfloor (or ask for it there), not in this project. `subfloor eject` is the last resort and the copy stops getting fixes; record why in a decision.
- Keep a dialog component mounted and drive it with `open`; unmounting skips its closing transition. Set `open` in `onOpenChange`.

### Checklist for any new overlay-like UI

Before it is done, check each of these (Subfloor's own tests cover them for its components; re-check if you compose something new):

1. The page behind does not scroll: wheel, keyboard, and a finger on a real iPhone.
2. Nothing moves sideways when it opens (desktop with a classic scrollbar).
3. Focus moves in, cannot reach the page behind, and returns to what opened it, also in Safari.
4. Escape and a click on the backdrop close it; a drag that ends on the backdrop does not.
5. The page behind is inert: no focus, no clicks.
6. Long content scrolls inside it and never pushes it past the screen (`dvh`, safe areas).
7. Reduced motion: no animation. Closing waits for its transition, not a timeout.
8. With JavaScript off it opens and closes where the platform allows, and is hidden until opened.
9. It renders closed on the server (no flash of open overlays).
