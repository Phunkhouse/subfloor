// The components import their own stylesheets from @subfloor/core (decision 0006). TypeScript checks
// side-effect imports, so it needs to know these modules exist; they have no exports.
declare module '@subfloor/core/styles/*.css'
