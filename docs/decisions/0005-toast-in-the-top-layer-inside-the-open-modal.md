# 0005. Toast in the top layer, inside the open modal dialog

Date: 2026-11-28  
Status: accepted (scope approved by the owner, 2026-11-28)

## Context

A toast must float above everything (fixed bars, open dialogs) without taking layout space, and its action (Undo) and close button must stay usable. Systerna's Snackbar uses `popover="manual"` and is rendered inside an open dialog by the caller. Checked on 2026-11-28 in Chromium, WebKit and Firefox: a `popover="manual"` toast shown on top of an open modal dialog is drawn above it but is inert (cannot be focused or clicked) unless it is a descendant of that dialog.

## Decision

- A toast is `popover="manual"`: the top layer, no light dismiss, closed only by its timer, its button, Escape or the caller.
- The core places it inside the topmost open modal dialog and moves it back to the body when that dialog closes, also when a dialog opens or closes while the toast is shown. Callers do not place it.
- One toast at a time: a new one replaces the current one (`replaced`).
- The React adapter renders its children into the core's element through a portal, so the core can move the element without React owning it.

## Alternatives considered

- A fixed element with a high `z-index`, no popover: below a modal dialog (the top layer wins) and inert behind it.
- Leaving the placement to callers (Systerna today): every project would have to know about the inertness rule and get it right in every dialog.
- A stack of toasts: more API and timing rules than the projects use; one at a time matches Systerna and keeps announcements clear.

## Consequences

- Moving the element hides and re-shows the popover; focus inside the toast at that moment is lost (rare: a dialog opening while the user is in the toast).
- `@subfloor/react` gains `react-dom` as a peer dependency (`createPortal`).
- Revisit if a project needs stacked or positioned toasts.
