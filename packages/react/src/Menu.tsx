'use client'

import { createMenu } from '@subfloor/core'
import {
  Fragment,
  useId,
  useLayoutEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import type { PopoverPlacement } from './Popover'

export type MenuItem =
  | {
      /** The visible words; also what typeahead matches. */
      label: string
      /** An action, chosen by click, Enter or Space. */
      onSelect?: () => void
      /** A link instead of an action. */
      href?: string
      /** A decorative icon before the words. */
      icon?: ReactNode
      disabled?: boolean
      /** Destructive: drawn in the danger colour. */
      danger?: boolean
    }
  | 'separator'

export type MenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

export interface MenuProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'popover' | 'children'
> {
  /** The button's content. */
  label: ReactNode
  /** The menu's accessible name (and the button's, when `label` is an icon). */
  menuLabel: string
  items: MenuItem[]
  /** Where it opens; it flips at a screen edge. */
  placement?: PopoverPlacement
  /** Props for the button. */
  triggerProps?: ComponentPropsWithoutRef<'button'>
  /** Renders link items, e.g. `(props) => <Link {...props} />` for the Next.js router. */
  renderLink?: (props: MenuLinkProps) => ReactNode
}

/**
 * The action menu (WAI-ARIA menu button): the @subfloor/core menu markup, handed to `createMenu`,
 * which owns the keyboard, focus and closing. It renders closed on the server.
 */
export function Menu({
  label,
  menuLabel,
  items,
  placement = 'bottom-start',
  triggerProps,
  renderLink = (props) => <a {...props} />,
  className,
  id,
  style,
  ...rest
}: MenuProps) {
  const autoId = useId()
  const menuId = id ?? `sf${autoId.replaceAll(':', '')}`
  const anchor = `--sf-anchor-${menuId}`
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const menu = createMenu(element)
    return () => menu.destroy()
  }, [])

  return (
    <>
      <button
        type="button"
        {...triggerProps}
        id={triggerProps?.id ?? `${menuId}-trigger`}
        popoverTarget={menuId}
        aria-haspopup="menu"
        aria-controls={menuId}
        style={{ anchorName: anchor, ...triggerProps?.style }}
      >
        {label}
      </button>
      <div
        {...rest}
        ref={ref}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label={menuLabel}
        className={
          className ? `sf-popover sf-menu ${className}` : 'sf-popover sf-menu'
        }
        data-sf-menu=""
        data-placement={placement}
        style={{ positionAnchor: anchor, ...style }}
      >
        {items.map((item, index) => {
          if (item === 'separator')
            return (
              <hr key={index} className="sf-menu__separator" role="separator" />
            )
          const shared = {
            className: 'sf-menu__item',
            role: 'menuitem',
            tabIndex: -1,
            'aria-disabled': item.disabled ? ('true' as const) : undefined,
            'data-danger': item.danger ? '' : undefined,
          }
          const content = (
            <>
              {item.icon}
              {item.label}
            </>
          )
          if (item.href)
            return (
              <Fragment key={index}>
                {renderLink({ ...shared, href: item.href, children: content })}
              </Fragment>
            )
          return (
            <button
              key={index}
              type="button"
              {...shared}
              onClick={item.disabled ? undefined : item.onSelect}
            >
              {content}
            </button>
          )
        })}
      </div>
    </>
  )
}
