import type { OpenChangeDetail } from './dialog'
import { currentOpener, trackPresses } from './opener'

// Re-exported so an ejected popover adapter finds it next to the behaviour.
export type { OpenChangeDetail } from './dialog'

/**
 * Behaviour for a non-modal panel: an element with `popover="auto"` and `data-sf-popover`, opened
 * by a `popovertarget` button. The platform already gives the top layer (never clipped, R-16),
 * light dismiss on an outside press and Escape, and the toggle without JavaScript (R-18, R-21);
 * CSS anchor positioning places it (R-17). This adds what it does not (docs/SPEC.md):
 *
 * - one `sf:open-change` per change, with the reason (`escape`, `outside`, `toggle`, `select`,
 *   `tab`, `api`), and `aria-expanded` on the buttons that control it (R-20);
 * - `data-state="open|closing|closed"`, `closing` until the exit transition ends (R-20);
 * - focus back on the button after Escape or a choice, also in Safari, where a clicked button
 *   never took focus (R-18).
 */

export type PopoverCloseReason =
  'escape' | 'outside' | 'toggle' | 'select' | 'tab' | 'api'
export type PopoverState = 'open' | 'closing' | 'closed'

export interface PopoverController {
  readonly element: HTMLElement
  readonly state: PopoverState
  /** Shows it. `opener` gets focus back after Escape; by default the button that opened it. */
  show(opener?: HTMLElement | null): void
  /** Hides it, if open. */
  hide(reason?: PopoverCloseReason): void
  /** The buttons that control it (`popovertarget` or `commandfor` its id). */
  invokers(): HTMLElement[]
  /** Removes the behaviour; the popover is hidden if open. */
  destroy(): void
}

/** Toggle events in the parts the code uses (`ToggleEvent` is missing from older DOM libs). */
interface ToggleLikeEvent extends Event {
  newState: 'open' | 'closed'
}

const controllers = new WeakMap<HTMLElement, PopoverController>()
const live = new Set<PopoverController>()

function transitionsDone(element: HTMLElement): Promise<void> {
  void getComputedStyle(element).opacity
  const running = (element.getAnimations?.() ?? []).filter(
    (animation) => animation.effect?.getTiming().iterations !== Infinity,
  )
  return Promise.allSettled(running.map((a) => a.finished)).then(
    () => undefined,
  )
}

/** Adds the behaviour to a `[popover]` element, or returns the controller it already has. */
export function createPopover(element: HTMLElement): PopoverController {
  const existing = controllers.get(element)
  if (existing) return existing
  trackPresses()

  const abort = new AbortController()
  const on = { signal: abort.signal }
  let state: PopoverState = element.matches(':popover-open') ? 'open' : 'closed'
  let reason: PopoverCloseReason | null = null
  let opener: HTMLElement | null = null
  let explicitOpener: HTMLElement | null = null
  let run = 0

  const setState = (next: PopoverState) => {
    state = next
    element.dataset.state = next
  }
  const emit = (detail: OpenChangeDetail<PopoverCloseReason>) =>
    element.dispatchEvent(new CustomEvent('sf:open-change', { detail }))
  const invokers = () => {
    if (!element.id) return []
    const id = CSS.escape(element.id)
    return [
      ...document.querySelectorAll<HTMLElement>(
        `[popovertarget="${id}"], [commandfor="${id}"]`,
      ),
    ]
  }
  const setExpanded = (open: boolean) => {
    for (const button of invokers())
      button.setAttribute('aria-expanded', String(open))
  }

  // Why it is about to close, noted where the cause is visible (before the browser acts).
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && state === 'open') reason ??= 'escape'
    },
    { capture: true, signal: abort.signal },
  )
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (state !== 'open') return
      const target = event.target instanceof Node ? event.target : null
      if (!target || element.contains(target)) return
      const onInvoker = invokers().some((button) => button.contains(target))
      reason ??= onInvoker ? 'toggle' : 'outside'
    },
    { capture: true, signal: abort.signal },
  )

  element.addEventListener(
    'beforetoggle',
    (event) => {
      if ((event as ToggleLikeEvent).newState !== 'open') return
      opener = explicitOpener ?? currentOpener()
      explicitOpener = null
      reason = null
    },
    on,
  )
  element.addEventListener(
    'toggle',
    (event) => {
      const open = (event as ToggleLikeEvent).newState === 'open'
      const current = ++run
      if (open) {
        setState('open')
        setExpanded(true)
        emit({ open: true })
        return
      }
      const why = reason ?? 'api'
      reason = null
      setState('closing')
      setExpanded(false)
      emit({ open: false, reason: why })
      // Escape and a choice give focus back to the button; an outside press or Tab leaves it where
      // the user put it. The browser does this too, except in Safari (nothing was focused).
      const focused = document.activeElement
      if (
        (why === 'escape' || why === 'select') &&
        opener?.isConnected &&
        (focused === document.body || element.contains(focused))
      )
        opener.focus()
      void transitionsDone(element).then(() => {
        if (current === run && state === 'closing') setState('closed')
      })
    },
    on,
  )

  const controller: PopoverController = {
    element,
    get state() {
      return state
    },
    show(from) {
      if (element.matches(':popover-open')) return
      explicitOpener = from ?? null
      element.showPopover()
    },
    hide(why = 'api') {
      if (!element.matches(':popover-open')) return
      reason = why
      element.hidePopover()
    },
    invokers,
    destroy() {
      abort.abort()
      if (element.matches(':popover-open')) element.hidePopover()
      delete element.dataset.state
      controllers.delete(element)
      live.delete(controller)
    },
  }

  setState(state)
  setExpanded(state === 'open')
  controllers.set(element, controller)
  live.add(controller)
  return controller
}

/** Adds the behaviour to every `[data-sf-popover]` under `root`. Safe to call again. */
export function initPopovers(root: ParentNode = document): PopoverController[] {
  return [...root.querySelectorAll<HTMLElement>('[data-sf-popover]')].map(
    createPopover,
  )
}

/** Removes the behaviour from every popover (before a client-side page swap, for example). */
export function destroyPopovers(): void {
  for (const controller of [...live]) controller.destroy()
}
