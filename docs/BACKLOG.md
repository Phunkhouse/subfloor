# Backlog

The single home for work not yet started. The owner sets the order; agents propose items, they do not reorder them.

## Next

- Owner review of Phase 1, then owner action 4 (npm scope) in [runbook.md](runbook.md#owner-actions-pending).
- Manual phone check of the scroll lock ([design](design/README.md#manual-check-on-a-phone)); confirms O-01 and O-02.
- Adopt Subfloor in Systerna's kit Dialog, which has no scroll lock (the bug that started this).
- Proposed: adopt `MobileNav` in a Next.js project (Kultomat or Systerna) to confirm O-07.

## Later

- Mobile nav extras: a top sheet under the bar (Kultomat style), submenus.
- Proposed: R-15 in WebKit, which ignores `scroll-padding` when Tab scrolls. A `focusin` listener that calls `scrollIntoView({ block: 'nearest' })` when the focused control sits under the padding; page-wide, so it needs the owner's word.
- Proposed: use `MobileNav` for the playground's own header on phones.
- Popover / Dropdown / Menu: `popover` attribute and CSS anchor positioning, top layer so panels do not clip them (Systerna `clipEdges`); keyboard rules as in Systerna's `popover.ts`.
- Toast: `popover="manual"` in the top layer, above bottom bars and open dialogs (Systerna Snackbar).
- Tabs.
- Form fields.
- Drag-to-close for sheets (Kultomat `SheetGrab`).
- Firefox Playwright project (O-06).

## Not planned

- None yet.
