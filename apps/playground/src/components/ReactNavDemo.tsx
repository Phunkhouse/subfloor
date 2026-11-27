import { MobileNav, type DialogCloseReason } from '@subfloor/react'
import { useState } from 'react'

/**
 * Demo and test target for R-11 with a client-side router: the links change the URL with
 * `history.pushState`, as Next.js does, and the page stays. The log shows every onOpenChange call.
 */
export default function ReactNavDemo() {
  const [view, setView] = useState('home')
  const [log, setLog] = useState<string[]>([])
  const record = (next: boolean, reason?: DialogCloseReason) =>
    setLog((lines) => [...lines, reason ? `${next} ${reason}` : String(next)])

  const views = [
    { href: '?view=home', label: 'Home', view: 'home' },
    { href: '?view=settings', label: 'Settings', view: 'settings' },
  ]

  return (
    <>
      <section className="demo" aria-label="React demo">
        <button
          id="react-open-nav"
          className="primary"
          command="show-modal"
          commandfor="react-nav"
          aria-haspopup="dialog"
        >
          Open React menu
        </button>
      </section>
      <p>
        View: <output id="react-view">{view}</output>. onOpenChange calls:{' '}
        <output id="react-nav-log">{log.join(', ') || 'none'}</output>
      </p>

      <MobileNav
        id="react-nav"
        title="React menu"
        placement="start"
        links={views.map((v) => ({
          href: v.href,
          label: v.label,
          current: v.view === view,
        }))}
        renderLink={(props) => (
          <a
            {...props}
            onClick={(event) => {
              // A stand-in for a router's <Link>.
              event.preventDefault()
              history.pushState(null, '', props.href)
              setView(new URLSearchParams(props.href).get('view') ?? 'home')
            }}
          />
        )}
        onOpenChange={record}
      />
    </>
  )
}
