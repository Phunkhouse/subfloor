'use client'

// This component's styles (decision 0006); the project imports `@subfloor/core/base.css` once.
import '@subfloor/core/styles/toast.css'
import {
  createToast,
  toastElement,
  type ToastAction,
  type ToastCloseReason,
  type ToastOptions,
  type ToastTone,
} from '@subfloor/core'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ToastProps {
  /** `done` (default), `info` or `problem` (stays until closed). */
  tone?: ToastTone
  /** Milliseconds before a `done` or `info` toast closes itself. Default 6000. */
  timeout?: number
  /** One text button beside the message, such as Undo. */
  action?: ToastAction
  /**
   * Called when the toast closed by itself or by the user (`timeout`, `button`, `escape`) or was
   * replaced by a toast shown elsewhere (`replaced`); not when you unmount it or render a new
   * `key` here (that unmounts the old one first). Stop rendering it here.
   */
  onClose?: (reason: ToastCloseReason) => void
  /** Accessible name of the close button. */
  closeLabel?: string
  children: ReactNode
}

/**
 * A toast: render at most one; a new `key` replaces it. The core builds the element, places it
 * (inside an open modal dialog when there is one) and owns the timing and closing; this renders
 * the children into its message through a portal, so the core can move it without React noticing.
 * Options are read when it mounts.
 */
export function Toast({
  tone = 'done',
  timeout,
  action,
  onClose,
  closeLabel,
  children,
}: ToastProps) {
  const [message, setMessage] = useState<HTMLElement | null>(null)
  const latestOnClose = useRef(onClose)
  const latestAction = useRef(action)
  useLayoutEffect(() => {
    latestOnClose.current = onClose
    latestAction.current = action
  })

  useLayoutEffect(() => {
    const forward = action
      ? {
          label: action.label,
          onClick: () => latestAction.current?.onClick(),
        }
      : undefined
    const options: ToastOptions = { tone }
    if (forward) options.action = forward
    if (closeLabel !== undefined) options.closeLabel = closeLabel
    if (timeout !== undefined) options.timeout = timeout
    const element = toastElement(options)
    const toast = createToast(element, options)
    const onToastClose = (event: Event) => {
      const { reason } = (event as CustomEvent<{ reason: ToastCloseReason }>)
        .detail
      if (reason !== 'api') latestOnClose.current?.(reason)
    }
    element.addEventListener('sf:toast-close', onToastClose)
    // The element exists only now, created by the core outside React (it moves it into an open
    // dialog): keep its message node so the children can be portalled into it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(toast.message)
    return () => {
      element.removeEventListener('sf:toast-close', onToastClose)
      void toast.close('api')
      setMessage(null)
    }
    // Options are read once; render a new `key` to change them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return message ? createPortal(children, message) : null
}
