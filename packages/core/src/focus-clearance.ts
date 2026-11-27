/**
 * Keeps a keyboard-focused control clear of fixed bars (R-15, SUB-6).
 *
 * The bars' heights are the root's `scroll-padding` (`--sf-fixed-top` / `--sf-fixed-bottom`).
 * Chromium honours it when Tab scrolls a control into view; WebKit does not, and leaves the control
 * at the viewport edge, under a bar. `scrollIntoView` honours it in both, so after the browser has
 * done its own focus scroll, a control still inside the padding is scrolled once more. Where the
 * browser already got it right, this finds nothing to do.
 *
 * It acts only on `:focus-visible` (keyboard) focus, never inside an open modal dialog (the page
 * behind is locked and the dialog scrolls itself), and never when the root has no padding.
 *
 * Calls nest: the listener stays while any caller holds it; `createMobileNav` holds one.
 */

let holders = 0
let frame = 0

/** A `scroll-padding` side in pixels; `auto` counts as none. */
function padding(value: string): number {
  if (value.endsWith('%')) return (parseFloat(value) / 100) * window.innerHeight
  const pixels = parseFloat(value)
  return Number.isFinite(pixels) ? pixels : 0
}

function onFocusIn(event: FocusEvent) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  cancelAnimationFrame(frame)
  // The browser's own focus scroll has happened by the next frame.
  frame = requestAnimationFrame(() => {
    if (document.activeElement !== target || !target.matches(':focus-visible'))
      return
    if (target.closest('dialog:modal')) return
    const style = getComputedStyle(document.documentElement)
    const top = padding(style.scrollPaddingTop)
    const bottom = padding(style.scrollPaddingBottom)
    if (top === 0 && bottom === 0) return
    const box = target.getBoundingClientRect()
    if (box.top < top || box.bottom > window.innerHeight - bottom)
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })
}

/** Starts keeping focused controls clear of fixed bars; returns the function that stops it. */
export function keepFocusClear(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (holders++ === 0) document.addEventListener('focusin', onFocusIn)
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    if (--holders === 0) {
      document.removeEventListener('focusin', onFocusIn)
      cancelAnimationFrame(frame)
    }
  }
}
