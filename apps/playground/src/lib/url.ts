/** A path inside the site, under the base path (`/subfloor/` on GitHub Pages, `/` locally). */
export function url(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path
}
