---
'@subfloor/core': minor
'@subfloor/react': minor
'@subfloor/astro': minor
---

Toast (R-22 to R-27).

- Core: `showToast`, `createToast`, `initToasts`, `toastElement`, `TOAST_TIMEOUT` and the types `ToastController`, `ToastOptions`, `ToastAction`, `ToastTone`, `ToastCloseReason`, `ToastCloseDetail`; a new `sf:toast-close` event. The toast is placed inside the topmost open modal dialog so it stays usable.
- CSS in `components.css`: `sf-toast` with `__message`, `__action`, `__close`, tones by `data-tone`. New tokens `--sf-toast-max-width`, `--sf-toast-offset`, `--sf-toast-bg`, `--sf-toast-color`, `--sf-radius-toast`, `--sf-color-success`.
- React: `Toast` (children rendered through a portal). `react-dom` is now a peer dependency (`^19.0.0`).
- Astro: `@subfloor/astro/Toast.astro` for a server-rendered toast.
- `subfloor eject toast` (alias `snackbar`).
