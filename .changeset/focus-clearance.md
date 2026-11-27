---
'@subfloor/core': minor
---

`keepFocusClear()`: keeps a keyboard-focused control clear of fixed bars in WebKit, which ignores the root's `scroll-padding` (`--sf-fixed-top` / `--sf-fixed-bottom`) when Tab scrolls (R-15). Every mobile nav turns it on; pages without one can call it. It returns the function that stops it.
