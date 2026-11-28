// The only Subfloor stylesheet a project imports: tokens and page-level rules. Each component
// brings its own styles (decision 0006).
import '@subfloor/core/base.css'
import type { ReactNode } from 'react'

export const metadata = { title: 'Subfloor in Next.js' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
