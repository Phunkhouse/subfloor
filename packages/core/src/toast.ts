import { transitionsDone } from './transitions'

/**
 * Toast: a short floating message (`.sf-toast[data-sf-toast]`) that takes no space in the layout.
 * The platform gives the top layer (`popover="manual"`) and live regions; this adds what it does
 * not (requirements in docs/SPEC.md, after Systerna's Snackbar):
 *
 * - its place: inside the topmost open modal dialog, because outside it the dialog makes the toast
 *   inert even though it is drawn on top (checked in Chromium, WebKit and Firefox), and back out
 *   when that dialog closes (R-22, R-23);
 * - the announcement: `role="status"` (or `alert` for a problem), with the words shown just after
 *   the toast, so screen readers that ignore a region inserted with its text still read them;
 *   focus never moves to it (R-24);
 * - time to read: `done` and `info` close after a timeout, paused while the pointer is over it or
 *   focus is in it; a `problem` stays (R-25);
 * - closing: the × button, Escape while focus is in it (not the dialog around it), focus back to
 *   where it came from, and one `sf:toast-close` with the reason (R-26);
 * - one at a time: a new toast replaces the current one (R-27).
 */

export type ToastTone = 'done' | 'info' | 'problem'
export type ToastCloseReason =
  'timeout' | 'button' | 'escape' | 'replaced' | 'api'

export interface ToastCloseDetail {
  reason: ToastCloseReason
}

declare global {
  interface HTMLElementEventMap {
    'sf:toast-close': CustomEvent<ToastCloseDetail>
  }
}

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** `done` (default), `info` or `problem`. */
  tone?: ToastTone
  /** Milliseconds before a `done` or `info` toast closes itself. Default 6000. */
  timeout?: number
  /** One text button beside the message, such as Undo. */
  action?: ToastAction
  /** Accessible name of the close button. Default "Dismiss". */
  closeLabel?: string
}

export interface ToastController {
  readonly element: HTMLElement
  /** Where the message goes (the React adapter renders into it). */
  readonly message: HTMLElement
  /** Closes it, if still open. */
  close(reason?: ToastCloseReason): Promise<void>
}

export const TOAST_TIMEOUT = 6000
/** The words arrive this long after the toast (shorter than its fade). */
const ANNOUNCE_DELAY = 100

let current: ToastController | null = null
let listening = false

/** Every toast that is shown: the place follows the open modal dialogs. */
const shown = new Set<HTMLElement>()

/** The topmost open modal dialog, or the body. A dialog already closing does not count: the
 * toast leaves it when it starts to close, not after, so it never vanishes with it. */
function host(): HTMLElement {
  const modals = [
    ...document.querySelectorAll<HTMLDialogElement>('dialog'),
  ].filter(
    (dialog) => dialog.matches(':modal') && dialog.dataset.state !== 'closing',
  )
  return modals.at(-1) ?? document.body
}

/** Puts a shown toast where it can be used, and keeps it in the top layer. */
function place(element: HTMLElement) {
  const target = host()
  if (element.parentElement !== target) target.append(element)
  if (supportsPopover() && !element.matches(':popover-open')) {
    try {
      element.showPopover()
    } catch {
      // Not connected any more: nothing to show.
    }
  }
}

function supportsPopover(): boolean {
  return (
    typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype
  )
}

/** Dialogs open and close: move the toasts after them (once their state has settled). */
function listen() {
  if (listening || typeof document === 'undefined') return
  listening = true
  const replace = () =>
    queueMicrotask(() => {
      for (const element of shown) place(element)
    })
  // `sf:open-change` and `close` do not bubble; capture sees them on the way down. `sf:open-change`
  // covers the kit's dialogs (also as they start to close), `close` and `toggle` dialogs opened
  // or closed by plain `showModal()` / `close()`. `place` is idempotent, so repeats are cheap.
  document.addEventListener('sf:open-change', replace, true)
  document.addEventListener('close', replace, true)
  document.addEventListener('toggle', replace, true)
}

const CLOSE_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2"></path></svg>'

/** The toast markup, as the adapters render it. */
export function toastElement(options: ToastOptions = {}): HTMLElement {
  const element = document.createElement('div')
  element.className = 'sf-toast'
  element.dataset.sfToast = ''
  element.dataset.tone = options.tone ?? 'done'
  const message = document.createElement('span')
  message.className = 'sf-toast__message'
  element.append(message)
  if (options.action) {
    const action = document.createElement('button')
    action.type = 'button'
    action.className = 'sf-toast__action'
    action.textContent = options.action.label
    element.append(action)
  }
  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'sf-toast__close'
  close.setAttribute('aria-label', options.closeLabel ?? 'Dismiss')
  close.innerHTML = CLOSE_ICON
  element.append(close)
  return element
}

/**
 * Shows an existing toast element (rendered by a server, an adapter or `toastElement`) and adds
 * the behaviour. The current toast, if any, is closed as `replaced`.
 */
export function createToast(
  element: HTMLElement,
  options: ToastOptions = {},
): ToastController {
  listen()
  const tone: ToastTone =
    options.tone ?? (element.dataset.tone as ToastTone | undefined) ?? 'done'
  element.dataset.tone = tone
  const timeout =
    options.timeout ?? Number(element.dataset.timeout || TOAST_TIMEOUT)
  const message =
    element.querySelector<HTMLElement>('.sf-toast__message') ?? element
  const closeButton = element.querySelector<HTMLElement>('.sf-toast__close')
  const actionButton = element.querySelector<HTMLElement>('.sf-toast__action')
  const lasts = tone === 'problem'
  const abort = new AbortController()
  const on = { signal: abort.signal }
  let timer = 0
  let announce = 0
  // Time left before it closes itself: a pause keeps it, so a hover does not start it over.
  let remaining = timeout
  let startedAt = 0
  let hovered = false
  let focused = false
  let cameFrom: HTMLElement | null = null
  let closed = false

  if (current && current.element !== element) void current.close('replaced')

  // A problem interrupts (alert); the others wait for a pause (status).
  element.setAttribute('role', lasts ? 'alert' : 'status')
  if (!lasts) {
    message.hidden = true
    announce = window.setTimeout(() => (message.hidden = false), ANNOUNCE_DELAY)
  }
  // Shown by the script: the close button (hidden without it) and the top layer.
  if (closeButton) closeButton.hidden = false
  if (supportsPopover()) element.setAttribute('popover', 'manual')
  element.dataset.state = 'open'
  shown.add(element)
  place(element)

  const restart = () => {
    if (timer) {
      // Running until now: keep what is left.
      window.clearTimeout(timer)
      timer = 0
      remaining -= Date.now() - startedAt
    }
    if (lasts || hovered || focused || closed) return
    startedAt = Date.now()
    timer = window.setTimeout(
      () => void controller.close('timeout'),
      Math.max(remaining, 0),
    )
  }

  element.addEventListener(
    'pointerenter',
    () => {
      hovered = true
      restart()
    },
    on,
  )
  element.addEventListener(
    'pointerleave',
    () => {
      hovered = false
      restart()
    },
    on,
  )
  element.addEventListener(
    'focusin',
    (event) => {
      const from = event.relatedTarget
      if (from instanceof HTMLElement && !element.contains(from))
        cameFrom = from
      focused = true
      restart()
    },
    on,
  )
  element.addEventListener(
    'focusout',
    (event) => {
      if (element.contains(event.relatedTarget as Node | null)) return
      focused = false
      restart()
    },
    on,
  )
  element.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return
      // Escape closes the toast, not the dialog it sits in.
      event.preventDefault()
      event.stopPropagation()
      void controller.close('escape')
    },
    on,
  )
  closeButton?.addEventListener(
    'click',
    () => void controller.close('button'),
    on,
  )
  if (options.action && actionButton)
    actionButton.addEventListener('click', () => options.action?.onClick(), on)

  const controller: ToastController = {
    element,
    message,
    async close(reason = 'api') {
      if (closed) return
      closed = true
      window.clearTimeout(timer)
      window.clearTimeout(announce)
      abort.abort()
      if (current === controller) current = null
      const hadFocus = element.contains(document.activeElement)
      element.dataset.state = 'closing'
      element.dispatchEvent(
        new CustomEvent('sf:toast-close', { detail: { reason } }),
      )
      if (hadFocus && cameFrom?.isConnected) cameFrom.focus()
      // A replaced toast leaves at once: two must not overlap at the same place (R-27).
      if (reason !== 'replaced') await transitionsDone(element)
      shown.delete(element)
      element.dataset.state = 'closed'
      if (supportsPopover() && element.matches(':popover-open'))
        element.hidePopover()
      element.remove()
    },
  }

  current = controller
  restart()
  return controller
}

/** Builds and shows a toast with `message` as its text. */
export function showToast(
  message: string,
  options: ToastOptions = {},
): ToastController {
  const element = toastElement(options)
  const text = element.querySelector<HTMLElement>('.sf-toast__message')!
  text.textContent = message
  return createToast(element, options)
}

/** Shows every server-rendered `[data-sf-toast]` under `root` that has no behaviour yet. */
export function initToasts(root: ParentNode = document): ToastController[] {
  return [
    ...root.querySelectorAll<HTMLElement>('[data-sf-toast]:not([data-state])'),
  ].map((element) => createToast(element))
}
