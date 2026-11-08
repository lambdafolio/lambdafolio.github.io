/**
 * Deterministic slug rule shared by the conversion script, routes, and
 * cross-links (docs/migration-nuxt-plan.md §4 drift controls).
 *
 * Must stay in sync with `slugify` in scripts/convert-languages.mjs:
 * `+`->plus, `&`->and, transliterate symbols without Latin decomposition
 * (Greek letters, e.g. `π`->`pi`), NFKD-normalize accented Latin letters,
 * remaining non-alphanumerics -> `-`.
 *
 * `!` maps to `-bang` (separator included) rather than `bang`, so a trailing
 * bang stays legible in the URL: `Go!` -> `go-bang`, not `gobang` (itself an
 * English word — the board game). Without this mapping the bang was stripped
 * as a non-alphanumeric, collapsing `Go!` onto `go` — a real collision.
 */
const CHAR_MAP: Record<string, string> = {
  '+': 'plus',
  '&': 'and',
  'π': 'pi',
  '!': '-bang'
}

/**
 * Names whose conventional slug differs from the raw rule — either because
 * it collides with another language (`C#` -> `c`, which is C) or because the
 * conventional spelling differs (`F#` -> `fsharp`). Keys match `name`
 * exactly. Mirrors SLUG_OVERRIDES in scripts/convert-languages.mjs.
 *
 * `SML#` is the only override driven by the raw rule's blind spot: `#` has no
 * character-map entry, so the symbol is stripped and `SML#` reduces to `sml`
 * — a collision with plain SML the moment that entry is spelled `SML`. The
 * `smlsharp` spelling matches `csharp`/`fsharp`/`qsharp`. (`JS++` and
 * `JScript.NET` need no override: `+`->`plus` already yields `jsplusplus`,
 * and the generic non-alphanumeric rule yields `jscript-net`.)
 */
const SLUG_OVERRIDES: Record<string, string> = {
  'F#': 'fsharp',
  'Q#': 'qsharp',
  'C#': 'csharp',
  'SML#': 'smlsharp'
}

export function slugify(name: string): string {
  const override = SLUG_OVERRIDES[name]
  if (override) return override
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[+&π!]/g, ch => CHAR_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}