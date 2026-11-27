/**
 * Page scroll lock for overlays.
 *
 * A modal `<dialog>` makes the page inert but does not stop it scrolling, and `overflow: hidden`
 * on the root is not honoured by touch scrolling in every browser (iOS Safari). So the body is
 * pinned in place at the current offset and the offset is restored on release (the approach
 * Kultomat proved, see docs/SPEC.md R-01).
 *
 * If the page had a classic scrollbar, the root keeps an empty scrollbar track while locked, so the
 * content does not move sideways (R-02). `scrollbar-gutter` is not enough here: fixed-position
 * elements, including the pinned body, ignore the root's gutter.
 *
 * Locks nest: the page is released when the last one goes, and releasing twice does nothing.
 *
 * `release({ restore: false })` leaves the page at the top instead of the old offset: a client-side
 * router has moved to another page while the body was pinned (mobile nav, R-11).
 */

let locks = 0
let saved: {
  x: number
  y: number
  html: Partial<Record<HtmlProp, string>>
  body: Partial<Record<BodyProp, string>>
} | null = null

type HtmlProp = 'overflowY' | 'scrollBehavior'
type BodyProp = 'position' | 'top' | 'left' | 'right'

const HTML_PROPS: HtmlProp[] = ['overflowY', 'scrollBehavior']
const BODY_PROPS: BodyProp[] = ['position', 'top', 'left', 'right']

/** Whether the page currently shows a scrollbar that takes up layout space. */
function hasClassicScrollbar(): boolean {
  return window.innerWidth - document.documentElement.clientWidth > 0
}

export interface ReleaseOptions {
  /** Scroll back to where the page was when it was locked. Default `true`. */
  restore?: boolean
}

/** Locks page scrolling and returns the function that releases this lock. */
export function lockScroll(): (options?: ReleaseOptions) => void {
  if (locks++ === 0) {
    const html = document.documentElement
    const body = document.body
    saved = {
      x: window.scrollX,
      y: window.scrollY,
      html: Object.fromEntries(HTML_PROPS.map((p) => [p, html.style[p]])),
      body: Object.fromEntries(BODY_PROPS.map((p) => [p, body.style[p]])),
    }
    if (hasClassicScrollbar()) html.style.overflowY = 'scroll'
    html.dataset.sfScrollLock = ''
    body.style.position = 'fixed'
    body.style.top = `${-saved.y}px`
    body.style.left = `${-saved.x}px`
    // Left and right (not a width) keep the body's own margins as they were.
    body.style.right = `${saved.x}px`
  }

  let released = false
  return ({ restore = true } = {}) => {
    if (released) return
    released = true
    if (--locks > 0 || !saved) return
    const html = document.documentElement
    const body = document.body
    for (const p of BODY_PROPS) body.style[p] = saved.body[p] ?? ''
    // Restore the offset at once, even when the page asks for smooth scrolling.
    html.style.scrollBehavior = 'auto'
    if (restore) window.scrollTo(saved.x, saved.y)
    for (const p of HTML_PROPS) html.style[p] = saved.html[p] ?? ''
    delete html.dataset.sfScrollLock
    saved = null
  }
}

/** Whether any lock is held. */
export function isScrollLocked(): boolean {
  return locks > 0
}
