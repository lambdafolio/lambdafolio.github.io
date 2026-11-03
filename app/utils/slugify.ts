/**
 * Deterministic slug rule shared by the conversion script, routes, and
 * cross-links (docs/migration-nuxt-plan.md §4 drift controls).
 *
 * Must stay in sync with `slugify` in scripts/convert-languages.mjs:
 * `+`->plus, `&`->and, transliterate symbols without Latin decomposition
 * (Greek letters, e.g. `π`->`pi`), NFKD-normalize accented Latin letters,
 * remaining non-alphanumerics -> `-`.
 */
const CHAR_MAP: Record<string, string> = {
  '+': 'plus',
  '&': 'and',
  'π': 'pi'
}

/**
 * Names whose conventional slug differs from the raw rule — either because
 * it collides with another language (`C#` -> `c`, which is C) or because the
 * conventional spelling differs (`F#` -> `fsharp`). Keys match `name` exactly.
 * Mirrors SLUG_OVERRIDES in scripts/convert-languages.mjs.
 */
const SLUG_OVERRIDES: Record<string, string> = {
  'F#': 'fsharp',
  'Q#': 'qsharp',
  'C#': 'csharp'
}

export function slugify(name: string): string {
  const override = SLUG_OVERRIDES[name]
  if (override) return override
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[+&π]/g, ch => CHAR_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}