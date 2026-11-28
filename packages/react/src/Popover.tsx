'use client'

// This component's styles (decision 0006); the project imports `@subfloor/core/base.css` once.
import '@subfloor/core/styles/popover.css'
import {
  createPopover,
  type OpenChangeDetail,
  type PopoverCloseReason,
  type PopoverController,
} from '@subfloor/core'
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

export type PopoverPlacement =
  'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface PopoverProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'popover'
> {
  /** The button's content. */
  label: ReactNode
  /** Open state when controlled. */
  open?: boolean
  /** Open state on first render when uncontrolled. */
  defaultOpen?: boolean
  /**
   * Called once when the user opens or closes it (the button, an outside press, Escape), never
   * for a change made through `open`. Set `open` here: a parent that keeps `open` unchanged after
   * the user closed it leaves it closed until `open` changes, as with `Dialog`.
   */
  onOpenChange?: (open: boolean, reason?: PopoverCloseReason) => void
  /** Where it opens; it flips at a screen edge. */
  placement?: PopoverPlacement
  /** Props for the button. */
  triggerProps?: ComponentPropsWithoutRef<'button'>
}

/**
 * A button and the non-modal panel it opens: the @subfloor/core popover markup, handed to
 * `createPopover`. All behaviour and styling live in the core. It renders closed on the server.
 */
export function Popover({
  label,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  triggerProps,
  className,
  id,
  style,
  children,
  ...rest
}: PopoverProps) {
  const autoId = useId()
  const popoverId = id ?? `sf${autoId.replaceAll(':', '')}`
  const anchor = `--sf-anchor-${popoverId}`
  const ref = useRef<HTMLDivElement>(null)
  const controller = useRef<PopoverController | null>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  // The state this component last asked the core for: its echo is not the user's change.
  const wanted = useRef(false)
  const latestOnOpenChange = useRef(onOpenChange)
  // Layout effects, as in Dialog: a passive effect for an old state could reopen it (R-04, R-20).
  useLayoutEffect(() => {
    latestOnOpenChange.current = onOpenChange
  })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const created = createPopover(element)
    controller.current = created
    const onChange = (event: Event) => {
      const detail = (
        event as CustomEvent<OpenChangeDetail<PopoverCloseReason>>
      ).detail
      if (detail.open === wanted.current) return
      wanted.current = detail.open
      setUncontrolled(detail.open)
      latestOnOpenChange.current?.(detail.open, detail.reason)
    }
    element.addEventListener('sf:open-change', onChange)
    return () => {
      element.removeEventListener('sf:open-change', onChange)
      created.destroy()
      controller.current = null
      wanted.current = false
    }
  }, [])

  useLayoutEffect(() => {
    const current = controller.current
    if (!current || wanted.current === isOpen) return
    wanted.current = isOpen
    if (isOpen) current.show()
    else current.hide('api')
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        {...triggerProps}
        id={triggerProps?.id ?? `${popoverId}-trigger`}
        popoverTarget={popoverId}
        aria-controls={popoverId}
        style={{ anchorName: anchor, ...triggerProps?.style }}
      >
        {label}
      </button>
      <div
        {...rest}
        ref={ref}
        id={popoverId}
        popover="auto"
        className={className ? `sf-popover ${className}` : 'sf-popover'}
        data-sf-popover=""
        data-placement={placement}
        style={{ positionAnchor: anchor, ...style }}
      >
        {children}
      </div>
    </>
  )
}
