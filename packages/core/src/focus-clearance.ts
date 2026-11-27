/**
 * Keeps a keyboard-focused control clear of fixed bars (R-15, SUB-6).
 *
 * The bars' heights are the root's `scroll-padding` (`--sf-fixed-top` / `--sf-fixed-bottom`).
 * Chromium honours it when Tab scrolls a control into view; WebKit does not, and leaves the control
 * at the viewport edge, under a bar. `scrollIntoView` honours it in both, so after the browser has
 * done its own focus scroll, a control still inside the padding is scrolled once more. Where the
 * browser already got it right, this finds nothing to do.
 *
 * It acts only on `:focus-visible` (keyboard) focus on a control that is at least partly on screen
 * (one focused with `preventScroll` stays where it is), never inside an open modal dialog (the page
 * behind is locked and the dialog scrolls itself), and never when the root has no padding.
 *
 * Calls nest: the listener stays while any caller holds it; `createMobileNav` holds one.
 */

let holders = 0
let frame = 0
let timers: number[] = []

/** When to check again if no frame comes, or the browser's own focus scroll comes late (ms). */
const FALLBACK_DELAYS = [100, 300]

/** A `scroll-padding` side in pixels; `auto` counts as none. */
function padding(value: string): number {
  if (value.endsWith('%')) return (parseFloat(value) / 100) * window.innerHeight
  const pixels = parseFloat(value)
  return Number.isFinite(pixels) ? pixels : 0
}

/** Scrolls the focused control clear of the padding if it still sits in it; safe to repeat. */
function clear(target: HTMLElement) {
  if (document.activeElement !== target || !target.matches(':focus-visible'))
    return
  if (target.closest('dialog:modal')) return
  const style = getComputedStyle(document.documentElement)
  const top = padding(style.scrollPaddingTop)
  const bottom = padding(style.scrollPaddingBottom)
  if (top === 0 && bottom === 0) return
  const box = target.getBoundingClientRect()
  // Off screen: focused without scrolling on purpose (`preventScroll`), so leave it there.
  if (box.bottom <= 0 || box.top >= window.innerHeight) return
  if (box.top < top || box.bottom > window.innerHeight - bottom)
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function cancel() {
  cancelAnimationFrame(frame)
  for (const id of timers) clearTimeout(id)
  timers = []
}

function onFocusIn(event: FocusEvent) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  cancel()
  // The browser's own focus scroll has usually happened by the next frame. A page that is not
  // painting (headless WebKit on Linux, a background tab) may not get one, and WebKit's own scroll
  // can come late, so timers run the same check again; a run with nothing to do does nothing.
  frame = requestAnimationFrame(() => clear(target))
  timers = FALLBACK_DELAYS.map((ms) =>
    window.setTimeout(() => clear(target), ms),
  )
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
      cancel()
    }
  }
}
