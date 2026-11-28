import { Toast, type ToastCloseReason } from '@subfloor/react'
import { useState } from 'react'

/** Demo and test target: one React toast at a time; the log shows every onClose call. */
export default function ReactToastDemo() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [log, setLog] = useState<string[]>([])
  const show = (text: string) =>
    setToast((t) => ({ id: (t?.id ?? 0) + 1, text }))

  return (
    <>
      <section className="demo" aria-label="React demo">
        <button
          id="react-toast"
          className="primary"
          onClick={() => show('Saved from React')}
        >
          React toast
        </button>
        <button id="react-toast-again" onClick={() => show('Saved again')}>
          Another React toast
        </button>
      </section>
      <p>
        onClose:{' '}
        <output id="react-toast-log">{log.join(', ') || 'none'}</output>
      </p>
      {toast && (
        <Toast
          key={toast.id}
          timeout={1500}
          onClose={(reason: ToastCloseReason) => {
            setLog((lines) => [...lines, reason])
            setToast(null)
          }}
        >
          {toast.text}
        </Toast>
      )}
    </>
  )
}
