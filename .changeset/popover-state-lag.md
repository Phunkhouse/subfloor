---
'@subfloor/core': patch
---

A popover or menu records closing at the moment it closes: `data-state`, the button's `aria-expanded` and `sf:open-change` no longer wait for the browser's queued `toggle` event, which can come late under load. Before, a quick ↑ on the menu button right after Escape focused an item of the hidden menu instead of opening it (R-19, R-20).
