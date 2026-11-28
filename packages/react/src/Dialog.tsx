'use client'

// This component's styles (decision 0006); the project imports `@subfloor/core/base.css` once.
import '@subfloor/core/styles/dialog.css'
import {
  createDialog,
  type DialogCloseReason,
  type DialogController,
} from '@subfloor/core'
import {
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

export type DialogPlacement = 'center' | 'start' | 'end' | 'bottom'

export interface DialogProps extends Omit<
  ComponentPropsWithoutRef<'dialog'>,
  'open' | 'title'
> {
  /** The heading; it also names the dialog for assistive technology. */
  title: ReactNode
  /** Open state when controlled. Keep the component mounted so it can play its closing transition. */
  open?: boolean
  /** Open state on first render when uncontrolled. */
  defaultOpen?: boolean
  /**
   * Called once when the user opens or closes the dialog (Escape, the backdrop, the close button or
   * a `commandfor` button), never for a change you made through `open`. Set `open` here.
   */
  onOpenChange?: (open: boolean, reason?: DialogCloseReason) => void
  /** `center` is a modal; `start` and `end` are drawers; `bottom` is a sheet. */
  placement?: DialogPlacement
  footer?: ReactNode
  /** Accessible name of the close button. */
  closeLabel?: string
}

/**
 * Renders the @subfloor/core dialog markup and hands it to `createDialog`; all behaviour and
 * styling live in the core. The dialog renders closed on the server.
 */
export function Dialog({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'center',
  footer,
  closeLabel = 'Close',
  className,
  id,
  children,
  ...rest
}: DialogProps) {
  const autoId = useId()
  const dialogId = id ?? `sf${autoId.replaceAll(':', '')}`
  const titleId = `${dialogId}-title`
  const ref = useRef<HTMLDialogElement>(null)
  const controller = useRef<DialogController | null>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  // The state this component last asked the core for: its echo is not the user's change.
  const wanted = useRef(false)
  const latestOnOpenChange = useRef(onOpenChange)
  // Layout effects, not effects: they run in the same commit as the render. A passive effect runs
  // later, so a dialog the user opened and closed in between got an effect for the old state,
  // which reopened it (R-04). React 19 runs them on the client only, without a server warning.
  useLayoutEffect(() => {
    latestOnOpenChange.current = onOpenChange
  })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const created = createDialog(element)
    controller.current = created
    const onChange = (
      event: CustomEvent<{ open: boolean; reason?: DialogCloseReason }>,
    ) => {
      if (event.detail.open === wanted.current) return
      wanted.current = event.detail.open
      setUncontrolled(event.detail.open)
      latestOnOpenChange.current?.(event.detail.open, event.detail.reason)
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
    if (isOpen) current.open()
    else void current.close('api')
  }, [isOpen])

  return (
    <dialog
      {...rest}
      ref={ref}
      id={dialogId}
      className={className ? `sf-dialog ${className}` : 'sf-dialog'}
      data-sf-dialog=""
      data-placement={placement}
      aria-labelledby={titleId}
    >
      <header className="sf-dialog__header">
        <h2 id={titleId} className="sf-dialog__title">
          {title}
        </h2>
        <form method="dialog" className="sf-dialog__close-form">
          <button
            className="sf-dialog__close"
            value="close"
            aria-label={closeLabel}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </form>
      </header>
      <div className="sf-dialog__body">{children}</div>
      {footer ? <footer className="sf-dialog__footer">{footer}</footer> : null}
    </dialog>
  )
}

/** A centred modal dialog. */
export function Modal(props: Omit<DialogProps, 'placement'>) {
  return <Dialog {...props} placement="center" />
}

/** A drawer along an edge (`end` by default), or a bottom sheet with `placement="bottom"`. */
export function Drawer({
  placement = 'end',
  ...props
}: Omit<DialogProps, 'placement'> & {
  placement?: 'start' | 'end' | 'bottom'
}) {
  return <Dialog {...props} placement={placement} />
}
