# Backlog

The single home for work not yet started. The owner sets the order; agents propose items, they do not reorder them.

## Next

- Owner review of Phase 1, then the owner actions in [runbook.md](runbook.md#owner-actions-pending).
- Manual phone check of the scroll lock ([design](design/README.md#manual-check-on-a-phone)); confirms O-01 and O-02.
- Adopt Subfloor in Systerna's kit Dialog, which has no scroll lock (the bug that started this).

## Later

- Mobile nav: modal phone menu built on the dialog core (`start` drawer or its own placement); skip link stays usable; focused controls clear any fixed bar (Systerna WEB-001, david-krapka WEB-002, Kultomat WEB-001).
- Popover / Dropdown / Menu: `popover` attribute and CSS anchor positioning, top layer so panels do not clip them (Systerna `clipEdges`); keyboard rules as in Systerna's `popover.ts`.
- Toast: `popover="manual"` in the top layer, above bottom bars and open dialogs (Systerna Snackbar).
- Tabs.
- Form fields.
- Drag-to-close for sheets (Kultomat `SheetGrab`).
- Firefox Playwright project (O-06).

## Not planned

- None yet.
