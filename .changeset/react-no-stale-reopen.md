---
'@subfloor/react': patch
---

A dialog the user opened and closed before React ran its effects (a `commandfor` button, then Escape at once) no longer reopens itself and closes again as `api`. The adapter now keeps React state and the core in step in layout effects (R-04).
