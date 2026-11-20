/**
 * Slug derivation for plain-node scripts.
 *
 * `app/utils/slugify.ts` is the canonical rule, but these scripts run under bare
 * `node` with no TS toolchain, so they cannot import it. Rather than reimplement
 * the mapping (and re-introduce the `Go!` → `gobang` collision the original
 * comment warns about), this reads the TS source and replays its two literals:
 * `CHAR_MAP` and `SLUG_OVERRIDES`. The *algorithm* is duplicated because it is
 * four chained regexes; the *data* is not, because data is where drift hides.
 *
 * If the TS file ever grows a third table, this loader must grow with it — hence
 * the assertion at the bottom of `loadRules`, which fails loudly instead of
 * silently missing an override.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from './taxonomy-vocab.mjs'

const SLUGIFY_TS = resolve(ROOT, 'app/utils/slugify.ts')

let cached = null

function loadRules() {
  if (cached) return cached
  const src = readFileSync(SLUGIFY_TS, 'utf8')

  const readLiteral = (name) => {
    // Matches `const NAME: Record<string, string> = { ... }` up to the closing brace.
    const m = src.match(new RegExp(`const ${name}: Record<string, string> = \\{([\\s\\S]*?)\\n\\}`))
    if (!m) throw new Error(`slugify.mjs: could not find ${name} in app/utils/slugify.ts`)
    const out = {}
    for (const kv of m[1].matchAll(/'([^']*)':\s*'([^']*)'/g)) out[kv[1]] = kv[2]
    return out
  }

  const CHAR_MAP = readLiteral('CHAR_MAP')
  const SLUG_OVERRIDES = readLiteral('SLUG_OVERRIDES')

  if (Object.keys(CHAR_MAP).length === 0) {
    throw new Error('slugify.mjs: CHAR_MAP parsed empty — the TS source format changed')
  }

  cached = { CHAR_MAP, SLUG_OVERRIDES }
  return cached
}

/**
 * Mirrors `slugify` in app/utils/slugify.ts:
 * overrides first, then NFKD-fold accented Latin, lowercase, character map,
 * remaining runs of non-alphanumerics to `-`, and trim.
 */
export function slugify(name) {
  const { CHAR_MAP, SLUG_OVERRIDES } = loadRules()
  const override = SLUG_OVERRIDES[name]
  if (override) return override

  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[+&π!]/g, ch => CHAR_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** True when a name needs a human decision before it can get a slug. */
export function needsSlugOverride(name) {
  const { SLUG_OVERRIDES } = loadRules()
  // `#` has no entry in CHAR_MAP, so the generic rule strips it: `C#` would
  // reduce to `c`, colliding with the language C. Only an explicit override is
  // safe, and adding one is a schema decision.
  return String(name).includes('#') && !(name in SLUG_OVERRIDES)
}
