import { Menu, Popover, type PopoverCloseReason } from '@subfloor/react'
import { useState } from 'react'

/** Demo and test target: the logs show every onSelect and onOpenChange call. */
export default function ReactPopoverDemo() {
  const [chosen, setChosen] = useState<string[]>([])
  const [changes, setChanges] = useState<string[]>([])
  const choose = (label: string) => () =>
    setChosen((lines) => [...lines, label])

  return (
    <>
      <section className="demo" aria-label="React demo">
        <Menu
          id="react-menu"
          label="React menu"
          menuLabel="React actions"
          triggerProps={{ className: 'primary' }}
          items={[
            { label: 'Rename', onSelect: choose('Rename') },
            { label: 'Move', onSelect: choose('Move') },
            { label: 'Locked', onSelect: choose('Locked'), disabled: true },
            'separator',
            { label: 'Remove', onSelect: choose('Remove'), danger: true },
          ]}
        />
        <Popover
          id="react-popover"
          label="React popover"
          onOpenChange={(open: boolean, reason?: PopoverCloseReason) =>
            setChanges((lines) => [
              ...lines,
              reason ? `${open} ${reason}` : String(open),
            ])
          }
        >
          <p style={{ margin: '0.5rem' }}>Uncontrolled, with onOpenChange.</p>
        </Popover>
      </section>
      <p>
        Chosen:{' '}
        <output id="react-menu-log">{chosen.join(', ') || 'none'}</output>.
        onOpenChange:{' '}
        <output id="react-popover-log">{changes.join(', ') || 'none'}</output>
      </p>
    </>
  )
}
