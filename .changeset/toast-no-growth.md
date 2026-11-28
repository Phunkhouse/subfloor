---
'@subfloor/core': patch
---

A toast appears at its final size: its words are visible from the first frame instead of arriving 100 ms later and widening the box. Screen readers hear them from a visually hidden copy (`.sf-toast__announce`) filled in after 100 ms, so the announcement still works where a live region inserted with its text is ignored (R-24).
