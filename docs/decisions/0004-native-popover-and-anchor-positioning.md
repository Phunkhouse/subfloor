# 0004. Native popover and CSS anchor positioning for panels and menus

Date: 2026-11-27  
Status: accepted (scope approved by the owner, 2026-11-27)

## Context

Every project rebuilds dropdowns and menus. Systerna's kit positions them in the page, so a panel inside a side panel or a scrolling list was clipped. `clipEdges` and `useFitInside` measure ancestors and flip the panel by script (fix of 2026-11-15), and outside press and Escape are hand-rolled there and in eucal. A menu needs the WAI-ARIA menu button keyboard, which no element provides.

## Decision

- Panels are `popover="auto"` elements: the top layer (never clipped), light dismiss (outside press, Escape) and the toggle button (`popovertarget`) come from the platform and work without JavaScript.
- They are placed with CSS anchor positioning (`position-anchor`, `position-area`, `position-try-fallbacks: flip-block, flip-inline`): no script measures or moves them. The adapters name the button with `anchor-name` and point the panel at it.
- Script adds only what the platform lacks: the menu keyboard, `aria-expanded`, one `sf:open-change` per change with a reason, `data-state`, and focus back on the button after Escape or a choice in Safari.
- A browser without anchor positioning (Safari before 26) shows the panel as a sheet along the bottom edge (`@supports not (anchor-name: …)`), not placed by script.
- Popovers are not modal: no scroll lock, no inert page.

## Alternatives considered

- A modal `<dialog>` for menus, reusing the dialog core: focus containment and a scroll lock are wrong for a menu (Tab must leave it, the page may scroll) and the backdrop blocks the page.
- Script positioning (measure and place, as in Systerna or a floating library): works in older browsers, but is the code that broke in Systerna and adds a runtime dependency or several hundred lines; anchor positioning is in every engine under test.
- `popover="manual"` with own light dismiss: more script for what `auto` already does.

## Consequences

- Placement in Safari before 26 is a bottom sheet, not beside the button; revisit once the support floor (O-03) is settled.
- `sf:open-change` is shared with the dialog; the popover's reasons are typed as `PopoverCloseReason` (`OpenChangeDetail<PopoverCloseReason>`), not in the global event map, so narrowly typed dialog listeners keep compiling.
- Select, listbox and combobox need different roles and keyboard; they will build on the same popover (SUB-12).
