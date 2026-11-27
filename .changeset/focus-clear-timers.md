---
'@subfloor/core': patch
---

`keepFocusClear()` also checks from a timer (100 and 300 ms after focus), not only on the next animation frame. A page that is not painting, such as headless WebKit on Linux or a background tab, may get no frame, which left a Tab-focused control under a fixed bar (R-15).
