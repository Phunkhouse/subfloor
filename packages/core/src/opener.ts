/**
 * Which element opened an overlay, for giving focus back to it (R-07, R-18).
 *
 * Safari does not focus a button when it is clicked, so "the focused element" at opening time is
 * the body. The last pressed button, link or focusable element stands in for it. Shared by the
 * dialog and the popover.
 */

let lastPressed: HTMLElement | null = null
let listening = false

/** Starts tracking presses (once per page). */
export function trackPresses(): void {
  if (listening || typeof document === 'undefined') return
  listening = true
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target instanceof Element ? event.target : null
      lastPressed =
        target?.closest<HTMLElement>('button, a[href], [tabindex]') ?? null
    },
    true,
  )
}

/** The focused element, or the last pressed one when the focus is on the body (Safari). */
export function currentOpener(): HTMLElement | null {
  const focused = document.activeElement
  return focused instanceof HTMLElement && focused !== document.body
    ? focused
    : lastPressed
}
