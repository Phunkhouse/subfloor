'use client'

import { Menu, Modal, Toast } from '@subfloor/react'
import { useState } from 'react'

/** Modal, Menu and Toast from @subfloor/react, with no CSS imported here. */
export function Demo() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(0)

  return (
    <>
      <button id="open-modal" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Menu
        id="menu"
        label="Actions"
        menuLabel="Actions"
        items={[{ label: 'Edit' }, { label: 'Delete', danger: true }]}
      />
      <button id="show-toast" onClick={() => setToast((n) => n + 1)}>
        Show toast
      </button>
      <Modal
        id="modal"
        title="A modal"
        open={open}
        onOpenChange={(next) => setOpen(next)}
      >
        <p>Styled by the component's own CSS.</p>
      </Modal>
      {toast > 0 && (
        <Toast key={toast} onClose={() => setToast(0)}>
          Saved
        </Toast>
      )}
    </>
  )
}
