/**
 * @subfloor/core behaviours. No runtime dependencies.
 *
 * CSS: `@subfloor/core/tokens.css` (custom properties), `@subfloor/core/components.css`
 * (everything in `@layer subfloor`) and, for Tailwind v4, `@subfloor/core/tailwind.css`.
 */
export { lockScroll, isScrollLocked, type ReleaseOptions } from './scroll-lock'
export {
  createDialog,
  getDialog,
  initDialogs,
  destroyDialogs,
  type DialogController,
  type DialogCloseReason,
  type DialogState,
  type OpenChangeDetail,
} from './dialog'
export {
  createMobileNav,
  initMobileNavs,
  destroyMobileNavs,
  type MobileNavController,
} from './mobile-nav'
export { keepFocusClear } from './focus-clearance'
