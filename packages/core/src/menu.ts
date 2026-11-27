import { createPopover, type PopoverController } from './popover'

/**
 * The action menu: a popover (`[popover][data-sf-menu]`, `role="menu"`) of `role="menuitem"`
 * buttons or links, opened by its `popovertarget` button. The popover gives the top layer,
 * placement and light dismiss; this adds the WAI-ARIA menu button keyboard, which the platform
 * has no element for (R-19, docs/SPEC.md):
 *
 * - on the button: Enter, Space or a click opens with focus on the first item, ↓ too, ↑ on the
 *   last;
 * - in the menu: ↓ ↑ move and wrap, Home End jump, typed letters move to the next item that starts
 *   with them, Enter or Space chooses, Escape closes and returns to the button, Tab closes and
 *   moves on; disabled items (`aria-disabled="true"`) are skipped and cannot be chosen;
 * - a choice closes the menu (reason `select`), gives focus back to the button and dispatches
 *   `sf:select` on the menu, with the item and its `data-value`.
 *
 * Items carry `tabindex="-1"`: Tab leaves the menu instead of walking through it.
 */

export interface MenuSelectDetail {
  item: HTMLElement
  /** The item's `data-value`, or its text. */
  value: string
}

declare global {
  interface HTMLElementEventMap {
    'sf:select': CustomEvent<MenuSelectDetail>
  }
}

export interface MenuController {
  /** The popover under it: show, hide and state. */
  readonly popover: PopoverController
  /** Removes the menu behaviour and the popover behaviour. */
  destroy(): void
}

const menus = new WeakMap<HTMLElement, MenuController>()
const live = new Set<MenuController>()

const TYPEAHEAD_RESET = 500

/** Adds the menu behaviour (and the popover behaviour) to an element, or returns its controller. */
export function createMenu(element: HTMLElement): MenuController {
  const existing = menus.get(element)
  if (existing) return existing

  const popover = createPopover(element)
  const abort = new AbortController()
  const on = { signal: abort.signal }
  let focusOnOpen: 'first' | 'last' = 'first'
  let typed = ''
  let typedTimer = 0

  const items = () =>
    [...element.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
      (item) => item.getAttribute('aria-disabled') !== 'true',
    )
  const focusAt = (index: number) => {
    const list = items()
    if (list.length === 0) return
    list[(index + list.length) % list.length]?.focus()
  }
  const currentIndex = () =>
    items().findIndex((item) => item === document.activeElement)

  // The button: ↓ and ↑ open it too, on the first or the last item.
  document.addEventListener(
    'keydown',
    (event) => {
      const button = event.target instanceof HTMLElement ? event.target : null
      if (!button || !popover.invokers().includes(button)) return
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      focusOnOpen = event.key === 'ArrowUp' ? 'last' : 'first'
      if (popover.state === 'open') focusAt(focusOnOpen === 'last' ? -1 : 0)
      else popover.show(button)
    },
    on,
  )

  element.addEventListener(
    'toggle',
    (event) => {
      if ((event as Event & { newState: string }).newState !== 'open') return
      focusAt(focusOnOpen === 'last' ? -1 : 0)
      focusOnOpen = 'first'
    },
    on,
  )

  element.addEventListener(
    'keydown',
    (event) => {
      const at = currentIndex()
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          focusAt(at + 1)
          return
        case 'ArrowUp':
          event.preventDefault()
          focusAt(at < 0 ? -1 : at - 1)
          return
        case 'Home':
          event.preventDefault()
          focusAt(0)
          return
        case 'End':
          event.preventDefault()
          focusAt(-1)
          return
        case ' ': {
          // Buttons choose on Space by themselves; links only follow Enter.
          const item = document.activeElement
          if (item instanceof HTMLAnchorElement && element.contains(item)) {
            event.preventDefault()
            item.click()
          }
          return
        }
      }
      if (
        event.key.length !== 1 ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return
      window.clearTimeout(typedTimer)
      typedTimer = window.setTimeout(() => (typed = ''), TYPEAHEAD_RESET)
      typed += event.key.toLowerCase()
      const list = items()
      const labels = list.map((item) =>
        (item.textContent ?? '').trim().toLowerCase(),
      )
      // A repeated letter cycles through the items that start with it.
      const repeat = [...typed].every((c) => c === typed[0])
      const needle = repeat ? typed[0]! : typed
      const start = repeat ? at + 1 : Math.max(at, 0)
      for (let i = 0; i < list.length; i++) {
        const index = (start + i) % list.length
        if (labels[index]?.startsWith(needle)) {
          focusAt(index)
          return
        }
      }
    },
    on,
  )

  element.addEventListener(
    'click',
    (event) => {
      const item =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[role="menuitem"]')
          : null
      if (!item || !element.contains(item)) return
      if (item.getAttribute('aria-disabled') === 'true') {
        event.preventDefault()
        return
      }
      element.dispatchEvent(
        new CustomEvent('sf:select', {
          detail: {
            item,
            value: item.dataset.value ?? (item.textContent ?? '').trim(),
          },
        }),
      )
      popover.hide('select')
    },
    on,
  )

  // Tab (or any focus move) out of the open menu closes it, and the focus stays where it went.
  // Not a move to the menu's own button: Chromium and Firefox focus it on mousedown, and the click
  // that follows toggles the menu itself (closing it here first made the click reopen it).
  element.addEventListener(
    'focusout',
    (event) => {
      const next = event.relatedTarget
      if (!(next instanceof Node) || element.contains(next)) return
      if (popover.invokers().some((button) => button.contains(next))) return
      popover.hide('tab')
    },
    on,
  )

  const menu: MenuController = {
    popover,
    destroy() {
      abort.abort()
      window.clearTimeout(typedTimer)
      popover.destroy()
      menus.delete(element)
      live.delete(menu)
    },
  }
  menus.set(element, menu)
  live.add(menu)
  return menu
}

/** Adds the behaviour to every `[data-sf-menu]` under `root`. Safe to call again. */
export function initMenus(root: ParentNode = document): MenuController[] {
  return [...root.querySelectorAll<HTMLElement>('[data-sf-menu]')].map(
    createMenu,
  )
}

/** Removes the behaviour from every menu (before a client-side page swap, for example). */
export function destroyMenus(): void {
  for (const menu of [...live]) menu.destroy()
}
