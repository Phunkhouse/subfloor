'use client'

import { createMobileNav } from '@subfloor/core'
import {
  useEffect,
  useId,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'
import { Dialog, type DialogProps } from './Dialog'

export interface MobileNavLink {
  href: string
  label: ReactNode
  /** Marks the current page (`aria-current="page"`). */
  current?: boolean
}

export type MobileNavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

export interface MobileNavProps extends Omit<
  DialogProps,
  'placement' | 'title'
> {
  /** The heading; it also names the dialog and the `<nav>`. Default "Menu". */
  title?: ReactNode
  /** `end` (default) or `start`. */
  placement?: 'start' | 'end'
  links?: MobileNavLink[]
  /** Renders each link, e.g. `(props) => <Link {...props} />` for the Next.js router. */
  renderLink?: (props: MobileNavLinkProps) => ReactNode
  /** A media query; the menu closes once it matches, e.g. `(min-width: 768px)`. */
  closeAt?: string
}

/**
 * The phone menu: the @subfloor/core dialog with a list of links, handed to `createMobileNav`. A
 * followed link closes it (`onOpenChange(false, 'navigate')`). The behaviour lives in the core.
 */
export function MobileNav({
  id,
  title = 'Menu',
  placement = 'end',
  links = [],
  renderLink = (props) => <a {...props} />,
  closeAt,
  closeLabel = 'Close menu',
  className,
  children,
  ...rest
}: MobileNavProps) {
  const autoId = useId()
  const dialogId = id ?? `sf${autoId.replaceAll(':', '')}`

  // Runs after the Dialog's own effect has created the dialog behaviour.
  useEffect(() => {
    const element = document.getElementById(dialogId)
    if (!(element instanceof HTMLDialogElement)) return
    const nav = createMobileNav(element)
    return () => nav.destroy()
  }, [dialogId])

  return (
    <Dialog
      {...rest}
      id={dialogId}
      title={title}
      placement={placement}
      closeLabel={closeLabel}
      className={className ? `sf-mobile-nav ${className}` : 'sf-mobile-nav'}
      data-sf-mobile-nav=""
      data-sf-close-at={closeAt}
    >
      <nav className="sf-mobile-nav__nav" aria-labelledby={`${dialogId}-title`}>
        {links.length > 0 ? (
          <ul className="sf-mobile-nav__list">
            {links.map((link) => (
              <li key={link.href}>
                {renderLink({
                  href: link.href,
                  className: 'sf-mobile-nav__link',
                  'aria-current': link.current ? 'page' : undefined,
                  children: link.label,
                })}
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </nav>
    </Dialog>
  )
}
