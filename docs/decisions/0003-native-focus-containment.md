# 0003. Keep the native modal focus containment

Date: 2026-11-27  
Status: accepted (agent; for the owner's review)

## Context

The brief asks that focus is trapped inside an open overlay. In a native modal `<dialog>`, Tab after the last control moves focus to the browser's own UI (address bar, tabs) and then back to the first control; it never reaches the page, which is inert. eucal's hand-written trap instead wraps from the last control to the first.

## Decision

Keep the native behaviour. The tests (R-07) assert that focus never lands on the page behind the dialog and always comes back into it, allowing the browser UI step in between. Focus returns to the opener on close; the core remembers the opener itself because Safari does not focus a clicked button.

## Alternatives considered

- A script trap that wraps Tab at the ends: keyboard users could not reach the browser UI without closing the dialog, and it is code the platform already replaces.

## Consequences

Matches the platform and the HTML specification's intent. If the owner wants the strict wrap anyway, it is a small keydown handler in `dialog.ts` and a change to the R-07 test.
