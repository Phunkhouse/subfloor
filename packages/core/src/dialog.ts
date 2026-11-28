import { currentOpener, trackPresses } from './opener'
import { lockScroll } from './scroll-lock'
import { transitionsDone } from './transitions'

/**
 * Behaviour for a native modal `<dialog>`: Modal, Drawer and Sheet are this one dialog in
 * different placements (`data-placement`).
 *
 * The platform already gives the focus trap, the inert background, Escape and the top layer. This
 * adds what it does not (requirements in docs/SPEC.md):
 *
 * - the page scroll lock (R-01, R-02);
 * - a backdrop click that closes only when the press also started on the backdrop (R-03);
 * - one `sf:open-change` event per change, with the reason, and state that stays in step when the
 *   browser closes the dialog itself (R-04);
 * - `data-state="open|closing|closed"`, waiting for the closing transition before the dialog
 *   leaves the top layer (R-06);
 * - focus back on the opener, also in Safari, where a clicked button does not take focus (R-07).
 *
 * Without JavaScript the same markup still works where the platform allows (R-10): `command` /
 * `commandfor` buttons open it, `<form method="dialog">` closes it, and CSS locks the page.
 */

/** `navigate`: a link in a mobile nav was followed (R-11). */
export type DialogCloseReason =
  'escape' | 'backdrop' | 'button' | 'api' | 'navigate'
export type DialogState = 'open' | 'closing' | 'closed'

/** The detail of `sf:open-change`. `R` is the close reason of the component (dialog by default). */
export interface OpenChangeDetail<R extends string = DialogCloseReason> {
  open: boolean
  /** Why it closed; only when `open` is false. */
  reason?: R
}

declare global {
  interface HTMLElementEventMap {
    // Typed with the dialog's reasons; a popover's carry `PopoverCloseReason`
    // (`OpenChangeDetail<PopoverCloseReason>`). Widening this would break narrowly typed listeners.
    'sf:open-change': CustomEvent<OpenChangeDetail>
  }
}

export interface DialogController {
  readonly element: HTMLDialogElement
  readonly state: DialogState
  /** Opens the dialog. `opener` gets focus back on close; by default the focused or last pressed element. */
  open(opener?: HTMLElement | null): void
  /** Starts closing; resolves once the dialog has left the page. Does nothing unless open. */
  close(reason?: DialogCloseReason): Promise<void>
  /** Removes the behaviour, closing the dialog at once and releasing the page if needed. */
  destroy(): void
}

/** The parts of the Invoker Commands API this file uses (not in every TypeScript DOM lib yet). */
interface CommandLikeEvent extends Event {
  command: string
  source: Element | null
}

/** How a close ends; only other core modules (the mobile nav) ask for anything but the default. */
export interface CloseOptions {
  /** Give focus back to the opener. */
  returnFocus: boolean
  /** Asked when the dialog leaves the page: scroll the page back to where it was? */
  restoreScroll: () => boolean
}

const DEFAULT_CLOSE: CloseOptions = {
  returnFocus: true,
  restoreScroll: () => true,
}

const controllers = new WeakMap<HTMLDialogElement, DialogController>()
const closers = new WeakMap<
  DialogController,
  (reason: DialogCloseReason, options: CloseOptions) => Promise<void>
>()
const live = new Set<DialogController>()

let documentListeners = false

function listenOnDocument() {
  if (documentListeners || typeof document === 'undefined') return
  documentListeners = true
  trackPresses()
  // Browsers without Invoker Commands: the same `command` / `commandfor` buttons, run by script.
  if (!('command' in HTMLButtonElement.prototype)) {
    document.addEventListener('click', (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('button[commandfor]')
          : null
      const id = button?.getAttribute('commandfor')
      const target = id ? document.getElementById(id) : null
      if (!button || !(target instanceof HTMLDialogElement)) return
      const controller = controllers.get(target)
      if (!controller) return
      const command = button.getAttribute('command')
      if (command === 'show-modal') controller.open(button)
      else if (command === 'close' || command === 'request-close')
        void controller.close('button')
    })
  }
}

/** Whether a pointer event on the dialog landed on its backdrop rather than its box. */
function onBackdrop(dialog: HTMLDialogElement, event: MouseEvent): boolean {
  if (event.target !== dialog) return false
  const box = dialog.getBoundingClientRect()
  return (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
}

/** Adds the behaviour to a `<dialog>`, or returns the controller it already has. */
export function createDialog(dialog: HTMLDialogElement): DialogController {
  const existing = controllers.get(dialog)
  if (existing) return existing
  listenOnDocument()

  const abort = new AbortController()
  const on = { signal: abort.signal }
  let state: DialogState = dialog.open ? 'open' : 'closed'
  let release: ReturnType<typeof lockScroll> | null = null
  let closing: CloseOptions = DEFAULT_CLOSE
  let returnFocus: HTMLElement | null = null
  let pressedOnBackdrop = false
  let closeRun = 0

  const setState = (next: DialogState) => {
    state = next
    dialog.dataset.state = next
  }
  const emit = (detail: OpenChangeDetail) =>
    dialog.dispatchEvent(new CustomEvent('sf:open-change', { detail }))

  /** The dialog leaves the page: release the page, then give focus back. */
  const finish = () => {
    const { returnFocus: focusBack, restoreScroll } = closing
    closing = DEFAULT_CLOSE
    setState('closed')
    const restore = restoreScroll()
    release?.({ restore })
    release = null
    if (dialog.open) dialog.close()
    const target = returnFocus
    returnFocus = null
    // A page left at the top (a router moved on) must not scroll back to the opener.
    if (focusBack && target?.isConnected && document.activeElement !== target)
      target.focus({ preventScroll: !restore })
  }

  const closeWith = async (
    reason: DialogCloseReason,
    options: CloseOptions,
  ) => {
    if (state !== 'open') return
    const run = ++closeRun
    closing = options
    setState('closing')
    emit({ open: false, reason })
    await transitionsDone(dialog)
    // A close with options (a followed link) decides about the scroll at `finish`. Without a
    // transition (reduced motion, closed while opening) that would come before the rest of the
    // click's handlers, a router's among them: wait one task so the URL is current (R-11).
    if (options !== DEFAULT_CLOSE)
      await new Promise((resolve) => setTimeout(resolve, 0))
    // Read through the getter: the state may have changed while waiting.
    if (run === closeRun && controller.state === 'closing') finish()
  }

  const controller: DialogController = {
    element: dialog,
    get state() {
      return state
    },
    open(opener) {
      if (state === 'open') return
      if (state === 'closing') {
        // Opened again while closing: it never left the page.
        closeRun++
        closing = DEFAULT_CLOSE
        setState('open')
        emit({ open: true })
        return
      }
      returnFocus = opener ?? currentOpener()
      release = lockScroll()
      dialog.showModal()
      setState('open')
      emit({ open: true })
    },
    close(reason = 'api') {
      return closeWith(reason, DEFAULT_CLOSE)
    },
    destroy() {
      abort.abort()
      if (state !== 'closed') finish()
      delete dialog.dataset.state
      controllers.delete(dialog)
      live.delete(controller)
    },
  }

  // The script handles the backdrop itself, so a drag that ends on it is not a click (R-03).
  dialog.removeAttribute('closedby')

  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault()
      void controller.close('escape')
    },
    on,
  )
  // The browser closed it without asking (a second Escape in Chromium, `dialog.close()` elsewhere).
  dialog.addEventListener(
    'close',
    () => {
      if (state === 'closed') return
      if (state === 'open') emit({ open: false, reason: 'api' })
      closeRun++
      finish()
    },
    on,
  )
  dialog.addEventListener(
    'pointerdown',
    (event) => {
      pressedOnBackdrop = onBackdrop(dialog, event)
    },
    on,
  )
  dialog.addEventListener(
    'click',
    (event) => {
      if (pressedOnBackdrop && onBackdrop(dialog, event))
        void controller.close('backdrop')
      pressedOnBackdrop = false
    },
    on,
  )
  // `<form method="dialog">` closes natively; the script runs the closing transition first.
  dialog.addEventListener(
    'submit',
    (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement) || form.method !== 'dialog') return
      if (form.closest('dialog') !== dialog) return
      event.preventDefault()
      const submitter = (event as SubmitEvent).submitter
      if (submitter instanceof HTMLButtonElement)
        dialog.returnValue = submitter.value
      void controller.close('button')
    },
    on,
  )
  // Invoker Commands, where the browser has them.
  dialog.addEventListener(
    'command',
    (event) => {
      const { command, source } = event as CommandLikeEvent
      if (command === 'show-modal') {
        event.preventDefault()
        controller.open(source instanceof HTMLElement ? source : null)
      } else if (command === 'close' || command === 'request-close') {
        event.preventDefault()
        void controller.close('button')
      }
    },
    on,
  )

  setState(state)
  // Opened natively before the script ran (a `commandfor` button pressed early).
  if (state === 'open' && dialog.matches(':modal')) release = lockScroll()

  controllers.set(dialog, controller)
  closers.set(controller, closeWith)
  live.add(controller)
  return controller
}

/** Closes with options the public `close` does not offer. Not exported from the package. */
export function closeDialog(
  controller: DialogController,
  reason: DialogCloseReason,
  options: CloseOptions,
): Promise<void> {
  return closers.get(controller)?.(reason, options) ?? Promise.resolve()
}

/** The controller of a dialog, if it has one. */
export function getDialog(
  dialog: HTMLDialogElement,
): DialogController | undefined {
  return controllers.get(dialog)
}

/** Adds the behaviour to every `dialog[data-sf-dialog]` under `root`. Safe to call again. */
export function initDialogs(root: ParentNode = document): DialogController[] {
  return [
    ...root.querySelectorAll<HTMLDialogElement>('dialog[data-sf-dialog]'),
  ].map(createDialog)
}

/** Removes the behaviour from every dialog (before a client-side page swap, for example). */
export function destroyDialogs(): void {
  for (const controller of [...live]) controller.destroy()
}
