# 0002. Scroll lock: CSS first, body pinning for touch

Date: 2026-11-27  
Status: accepted (agent; for the owner's review)

## Context

A modal `<dialog>` does not stop the page scrolling. `overflow: hidden` on the root stops wheel and keyboard scrolling but is not honoured by touch scrolling in iOS Safari (Kultomat #163). Kultomat's fix pins the body with `position: fixed; top: -scrollY` and restores the offset; it has worked in production.

## Decision

- CSS in the kit: `:root:has(dialog[data-sf-dialog]:modal) { overflow: hidden }`, so the page is locked without JavaScript on desktop.
- Script (`lockScroll`): pin the body with `position: fixed` and `top`/`left`/`right` offsets (not a width, so the body's margins are kept), restore the offset with `scroll-behavior: auto`, and give back any inline styles the page had. Locks nest; a second release does nothing.
- Layout shift: when the page had a classic scrollbar, the root gets `overflow-y: scroll`, so an empty track keeps the content in place. `scrollbar-gutter: stable` is used only without the script, because fixed-position elements (including the pinned body) ignore the root's gutter.

## Alternatives considered

- `overflow: hidden` only: fails on iOS touch scrolling.
- `touch-action: none` / `preventDefault` on `touchmove`: also blocks scrolling inside the dialog unless every scroll container is special-cased.
- `scrollbar-gutter: stable` with the script: the pinned body ignores it, so content still moved.

## Consequences

`position: sticky` elements in the page are frozen while locked, which is fine behind a modal. A page that changes the body's `position` itself must not do it while a dialog is open. Revisit if iOS Safari honours `overflow: hidden` for touch on the root, then the pinning can go.
