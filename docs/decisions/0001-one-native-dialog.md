# 0001. One native dialog for Modal, Drawer and Sheet

Date: 2026-11-27  
Status: accepted (agent; for the owner's review)

## Context

Modal, Drawer and Sheet behave the same: they block the page, hold focus, close on Escape and the backdrop, and lock scrolling. Systerna's kit already drew three placements from one Dialog (#235); Kultomat's search sheet and date picker are a bottom sheet on phones and a centred box on desktop. The brief asks for native-first behaviour in a framework-agnostic core.

## Decision

One behaviour, `createDialog`, on a native `<dialog>` opened with `showModal()`. Placement is a data attribute: `center` (Modal), `start` / `end` (Drawer), `bottom` (Sheet). The adapters' `Modal` and `Drawer` are presets of one `Dialog` component. The top layer gives the focus containment, the inert page and stacking without z-index.

## Alternatives considered

- A `div` with `role="dialog"`, a focus trap and `inert` set on siblings (eucal, david-krapka): more script, z-index conflicts, and the background must be found and made inert by hand.
- `popover` for drawers: no inert background and no focus containment, so not modal.

## Consequences

A fix to the dialog reaches every placement. The phone menu (later phase) can be a `start` drawer or its own placement. Revisit if a placement needs behaviour the others must not have.
