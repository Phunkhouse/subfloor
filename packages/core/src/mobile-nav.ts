import { closeDialog, createDialog, type DialogController } from './dialog'
import { keepFocusClear } from './focus-clearance'

/**
 * The phone menu: a `dialog[data-sf-mobile-nav]` that is the core dialog (focus containment, the
 * inert page, the scroll lock, Escape and the backdrop all come from there, R-01 to R-08, R-14)
 * plus what the platform does not do for a menu of links (requirements in docs/SPEC.md):
 *
 * - a followed link closes it, with reason `navigate`, also when a client-side router keeps the
 *   page; the page is then not scrolled back to where it was, unless the URL is unchanged (R-11);
 * - a link to a place on this page closes it first and then goes there, so the scroll lock's
 *   restore does not undo the jump (R-12);
 * - `data-sf-close-at="<media query>"` closes it once the query matches, for example when the
 *   desktop layout applies (R-13);
 * - focused controls stay clear of fixed bars in WebKit too, which ignores `scroll-padding` when
 *   Tab scrolls (R-15, `keepFocusClear`).
 *
 * Without JavaScript the dialog still opens and closes; links to other pages work, a link to this
 * page leaves the menu open, and it does not close when the window grows (R-10).
 */

export interface MobileNavController {
  /** The dialog under it: open, close and state. */
  readonly dialog: DialogController
  /** Removes the menu behaviour and the dialog behaviour. */
  destroy(): void
}

const navs = new WeakMap<HTMLDialogElement, MobileNavController>()
const live = new Set<MobileNavController>()

/** The link a plain click follows in this tab, or null (new tab, download, modified click). */
function followedLink(
  event: MouseEvent,
  dialog: HTMLDialogElement,
): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null
  const link =
    event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('a[href]')
      : null
  if (!link || !dialog.contains(link) || link.hasAttribute('download'))
    return null
  const target = link.target.toLowerCase()
  if (target && target !== '_self') return null
  return link
}

/** Whether the link only moves to a fragment of the current page. */
function isInPage(link: HTMLAnchorElement): boolean {
  return (
    link.hash !== '' &&
    link.origin === location.origin &&
    link.pathname === location.pathname &&
    link.search === location.search
  )
}

/** Adds the menu behaviour (and the dialog behaviour) to a `<dialog>`, or returns its controller. */
export function createMobileNav(
  dialog: HTMLDialogElement,
): MobileNavController {
  const existing = navs.get(dialog)
  if (existing) return existing

  const controller = createDialog(dialog)
  const abort = new AbortController()

  dialog.addEventListener(
    'click',
    (event) => {
      if (controller.state !== 'open') return
      const link = followedLink(event, dialog)
      if (!link) return
      if (isInPage(link)) {
        // R-12: close, let the page come back to where it was, then follow the link, so the
        // browser scrolls to the target (with `scroll-padding`, R-15) and Tab starts there.
        event.preventDefault()
        const href = link.href
        void closeDialog(controller, 'navigate', {
          returnFocus: false,
          restoreScroll: () => true,
        }).then(() => location.assign(href))
        return
      }
      // R-11: the browser (or a router) follows it. A router that changed the URL while the body
      // was pinned shows a new page: leave it at the top rather than at the old offset. Focus goes
      // back to the toggle (R-14), as Chromium's native close would do anyway.
      const before = location.href
      void closeDialog(controller, 'navigate', {
        returnFocus: true,
        restoreScroll: () => location.href === before,
      })
    },
    { signal: abort.signal },
  )

  // R-13. An invalid query never matches, so it never closes the menu.
  const query = dialog.dataset.sfCloseAt
  if (query && typeof matchMedia === 'function') {
    const media = matchMedia(query)
    media.addEventListener(
      'change',
      () => {
        if (media.matches) void controller.close('api')
      },
      { signal: abort.signal },
    )
  }

  const stopFocusClear = keepFocusClear()

  const nav: MobileNavController = {
    dialog: controller,
    destroy() {
      abort.abort()
      stopFocusClear()
      controller.destroy()
      navs.delete(dialog)
      live.delete(nav)
    },
  }
  navs.set(dialog, nav)
  live.add(nav)
  return nav
}

/** Adds the behaviour to every `dialog[data-sf-mobile-nav]` under `root`. Safe to call again. */
export function initMobileNavs(
  root: ParentNode = document,
): MobileNavController[] {
  return [
    ...root.querySelectorAll<HTMLDialogElement>('dialog[data-sf-mobile-nav]'),
  ].map(createMobileNav)
}

/** Removes the behaviour from every mobile nav (before a client-side page swap, for example). */
export function destroyMobileNavs(): void {
  for (const nav of [...live]) nav.destroy()
}
