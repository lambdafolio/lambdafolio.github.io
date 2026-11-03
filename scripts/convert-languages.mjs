/**
 * One-time migration script: `_data/languages.yml` -> `content/llanguages/<slug>.md`
 *
 * Produces one Markdown page per language entry with a fixed frontmatter
 * contract (see content.config.ts). Normalization starts uniform, not converged.
 *
 * Usage: node scripts/convert-languages.mjs [--check]
 *  --check  dry run: report slug collisions & skipped entries, write nothing
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, '_data', 'languages.yml')
const outDir = join(root, 'content', 'languages')

/**
 * Deterministic slug rule (see docs/migration-nuxt-plan.md §4):
 * `+`->plus, `&`->and, transliterate symbols without Latin decomposition
 * (Greek letters, e.g. `π`->`pi`), NFKD-normalize accented Latin letters
 * (`Melrōse`->`melrose`), lowercase, remaining non-alphanumerics -> `-`.
 */
const CHAR_MAP = Object.freeze({
  '+': 'plus',
  '&': 'and',
  'π': 'pi'
})

function slugify(name) {
  return name
    .normalize('NFKD') // ō -> o + U+0304 combining macron
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .toLowerCase()
    .replace(/[+&π]/g, ch => CHAR_MAP[ch])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Entries in _data/languages.yml that describe the expected shape, not a real
 * language. The first entry is authored as `- name: {name}` — unquoted YAML flow
 * mapping syntax — which parses to objects/nulls, not scalars. Any entry whose
 * `name` is not a string (or is a shape-descriptor like "{name}") is skipped.
 */
function isTemplateEntry(entry) {
  const name = entry?.name
  if (typeof name !== 'string') return true // includes null/undefined/flow-mapping artifacts
  return name.startsWith('{') && name.endsWith('}')
}

/**
 * Some source entries use scalar values where the schema expects arrays
 * (e.g. `urls: https://...`). Normalize to arrays so frontmatter matches the
 * fixed contract for every entry.
 */
function normalizeArrays(lang) {
  for (const key of ['urls', 'paradigms', 'influences', 'influenced']) {
    if (lang[key] != null && !Array.isArray(lang[key])) lang[key] = [lang[key]]
  }
  return lang
}

/** YAML minimal dump for our fixed field set (strings, string arrays). */
function yamlString(value) {
  return JSON.stringify(value) // double-quoted scalar, escapes handled
}

/**
 * Manual slug overrides for entries whose name slugifies identically to a
 * different language, or whose conventional spelling differs from raw lowercase
 * (e.g. F# -> fsharp, Q# -> qsharp, C# -> csharp). Keys must match `name` exactly.
 *
 * `C#` needs an override because the raw rule drops the `#` and yields `c`,
 * which collides with the C entry.
 */
const SLUG_OVERRIDES = Object.freeze({
  'F#': 'fsharp',
  'Q#': 'qsharp',
  'C#': 'csharp'
})

/**
 * For remaining true collisions (same name in different case, e.g.
 * LiveScript/Livescript, duplicate Omega, Go/Go!), disambiguate deterministically
 * by appending `-2` to every entry with that slug after the first, in source order.
 */
function resolveSlug(lang, seen) {
  const base = SLUG_OVERRIDES[lang.name] ?? slugify(lang.name)
  if (!seen.has(base)) {
    seen.set(base, 1)
    return base
  }
  let n = seen.get(base) + 1
  seen.set(base, n)
  return `${base}-${n}`
}

function dumpFrontmatter(lang) {
  const lines = [
    `title: ${yamlString(lang.name)}`, // native field, mirrors name (SEO/meta)
    `name: ${yamlString(lang.name)}`
  ]
  if (lang.homepage) lines.push(`homepage: ${yamlString(lang.homepage)}`)
  if (lang.urls?.length) {
    lines.push('urls:')
    for (const url of lang.urls) lines.push(`  - ${yamlString(url)}`)
  }
  if (lang.logo) lines.push(`logo: ${yamlString(normalizeLogo(lang.logo))}`)
  if (lang.author) lines.push(`author: ${yamlString(lang.author)}`)
  for (const key of ['paradigms', 'influences', 'influenced']) {
    if (lang[key]?.length) {
      lines.push(`${key}:`)
      for (const value of lang[key]) lines.push(`  - ${yamlString(value)}`)
    }
  }
  if (lang.note) lines.push(`note: ${yamlString(lang.note)}`)
  return lines.join('\n')
}

/**
 * Logo values are authored relative (./images/logos/x.png / images/logos/x.png).
 * They are NOT rewritten in the source YAML; the loader maps them to /logos/x.png.
 */
function normalizeLogo(logo) {
  return '/' + logo.replace(/^\.\//, '').replace(/^images\//, '').replace(/^logos\//, 'logos/')
}

function proseStub(lang) {
  // Body prose seeded from `note`; a minimal wiki stub otherwise.
  return lang.note
    ? `${lang.note}\n`
    : `TODO: Write the wiki article for **${lang.name}**.\n`
}

async function loadEntries() {
  // `yaml` is available in node_modules (hoisted dependency of the Nuxt toolchain)
  const { parse } = await import('yaml')
  return parse(readFileSync(sourcePath, 'utf8'))
}

async function main() {
  const checkOnly = process.argv.includes('--check')
  const entries = await loadEntries()

  if (!Array.isArray(entries)) {
    throw new Error('Expected a top-level YAML array in _data/languages.yml')
  }

  const templateEntries = entries.filter(isTemplateEntry)
  const languages = entries
    .filter(e => !isTemplateEntry(e))
    .map(normalizeArrays)

  // slug assignment + collision detection
  const seen = new Map()
  const bySlug = new Map()
  const collisions = []
  for (const lang of languages) {
    const base = SLUG_OVERRIDES[lang.name] ?? slugify(lang.name)
    const slug = resolveSlug(lang, seen)
    if (seen.get(base) > 1) collisions.push({ slug, name: lang.name })
    bySlug.set(slug, lang)
  }

  console.log(`entries: ${entries.length}`)
  console.log(`template (doc) entries skipped: ${templateEntries.length}`)
  console.log(`languages: ${languages.length}`)
  console.log(`unique slugs: ${bySlug.size}`)
  if (collisions.length) {
    console.log('\nAUTO-DISAMBIGUATED COLLISIONS (review these URLs):')
    for (const c of collisions) console.log(`  ${c.slug}: ${c.name}`)
  }

  if (checkOnly) {
    console.log('\n[dry run] no files written')
    return
  }

  mkdirSync(outDir, { recursive: true })
  for (const [slug, lang] of bySlug) {
    const content = `---\n${dumpFrontmatter(lang)}\n---\n\n${proseStub(lang)}`
    writeFileSync(join(outDir, `${slug}.md`), content, 'utf8')
  }
  console.log(`\nwrote ${bySlug.size} files to ${outDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})