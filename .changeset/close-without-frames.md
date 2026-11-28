---
'@subfloor/core': patch
---

A dialog, drawer, sheet, mobile nav or popover now finishes closing even on a page that draws no frames (headless WebKit under load, a background tab). Its closing transition never finished there, so it stayed `data-state="closing"` on the page. The wait now also ends at the transition's own computed end time plus 50 ms (R-06).
