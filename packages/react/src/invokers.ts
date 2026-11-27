// Invoker Commands attributes on <button>, which @types/react does not have yet. React passes
// them to the DOM as written, so use the lowercase HTML names:
//   <button command="show-modal" commandfor="my-dialog">
import 'react'

declare module 'react' {
  // The type parameter must match React's declaration for the interfaces to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ButtonHTMLAttributes<T> {
    /** The command to run on the element named by `commandfor`. */
    command?:
      | 'show-modal'
      | 'close'
      | 'request-close'
      | 'show-popover'
      | 'hide-popover'
      | 'toggle-popover'
      | `--${string}`
      | undefined
    /** The id of the element the command runs on. */
    commandfor?: string | undefined
  }
}
