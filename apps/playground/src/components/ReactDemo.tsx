import { Drawer, Modal, type DialogCloseReason } from '@subfloor/react'
import { useState } from 'react'

/** Demo and test target: the log shows every onOpenChange call. */
export default function ReactDemo() {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const record = (next: boolean, reason?: DialogCloseReason) =>
    setLog((lines) => [...lines, reason ? `${next} ${reason}` : String(next)])

  return (
    <>
      <section className="demo" aria-label="Demo">
        <button
          id="react-open-modal"
          className="primary"
          onClick={() => setOpen(true)}
        >
          Open React modal
        </button>
        <button
          id="react-open-sheet"
          command="show-modal"
          commandfor="react-sheet"
        >
          Open React sheet
        </button>
        <button id="background-button" type="button">
          A button on the page
        </button>
      </section>
      <p>
        onOpenChange calls:{' '}
        <output id="react-log">{log.join(', ') || 'none'}</output>
      </p>

      <Modal
        title="React modal"
        open={open}
        onOpenChange={(next, reason) => {
          record(next, reason)
          setOpen(next)
        }}
        footer={
          <button id="react-close" onClick={() => setOpen(false)}>
            Close from state
          </button>
        }
      >
        <p>Controlled with useState.</p>
        <label>
          A field <input id="react-input" />
        </label>
      </Modal>

      <Drawer id="react-sheet" title="React sheet" placement="bottom">
        <p>Uncontrolled, opened by a commandfor button.</p>
      </Drawer>
    </>
  )
}
