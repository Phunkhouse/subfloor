---
'@subfloor/core': patch
---

Toast, after review: a pause (hover or focus) keeps the time left instead of starting the timeout over; a toast leaves a modal dialog as the dialog starts to close, so it never vanishes with it for a moment; a replaced toast leaves at once instead of fading out over the new one.
