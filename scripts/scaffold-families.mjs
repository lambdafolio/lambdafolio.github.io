/**
 * Scaffold stub pages for the `families` collection, and report the derived
 * member languages of a family (docs/knowledgebase-plan.md §3b).
 *
 * One stub per FAMILIES vocabulary value in app/utils/taxonomy.ts. The file
 * name IS the join key (`families/smalltalk.md`), the `family` field repeats
 * it, and the member languages are DERIVED from the languages collection —
 * never stored.
 *
 * IDEMPOTENT AND NON-DESTRUCTIVE: an existing page is never rewritten.
 * Curated entries (prose, references, relations) are the expensive part of
 * this collection; re-running must not touch them.
 *
 * Usage:
 *   node scripts/scaffold-families.mjs                 # create missing stubs
 *   node scripts/scaffold-families.mjs --members ml
 *   node scripts/scaffold-families.mjs --members       # all families
 *   node scripts/scaffold-families.mjs --candidates    # promotion candidates
 *
 * `--candidates` recomputes the tier from the corpus: it counts how many
 * language entries declare each `family:` value and lists those at or above
 * FAMILY_PROMOTION_THRESHOLD, so promotion is a data decision.
 *
 * Exit: 0 normally, 1 on a missing display name or an unknown key.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const FAMILY_DIR = join(ROOT, 'content', 'families')
const LANG_DIR = join(ROOT, 'content', 'languages')
const TAXONOMY_TS = join(ROOT, 'app', 'utils', 'taxonomy.ts')
// The four page-backed vocabularies are generated from content/ (see
// scripts/generate-taxonomy.mjs); the fact axes and the thresholds stay in
// taxonomy.ts, so both files are parsed.
const TAXONOMY_GENERATED_TS = join(ROOT, 'app', 'data', 'taxonomy.generated.ts')

/** Parse the controlled vocabularies out of taxonomy.ts (no TS runtime). */
function loadVocab(tsPath) {
  const src = readFileSync(tsPath, 'utf8').replace(/\/\/[^\n]*/g, '')
  const vocab = {}
  for (const m of src.matchAll(/export const ([A-Z_]+) = \[([^\]]*)\] as const/gs)) {
    vocab[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1])
  }
  const threshold = src.match(/export const FAMILY_PROMOTION_THRESHOLD = (\d+)/)
  vocab.FAMILY_PROMOTION_THRESHOLD = threshold ? Number(threshold[1]) : 3
  return vocab
}

const VOCAB = { ...loadVocab(TAXONOMY_TS), ...loadVocab(TAXONOMY_GENERATED_TS) }
const FAMILIES = VOCAB.FAMILIES
if (!FAMILIES?.length) {
  console.error('scaffold-families: failed to parse FAMILIES from app/utils/taxonomy.ts')
  process.exit(1)
}
const THRESHOLD = VOCAB.FAMILY_PROMOTION_THRESHOLD

/**
 * Display name per family key. Keys are lowercase kebab (they are route
 * segments); the display name is the lineage's conventional name.
 *
 * Adding a value to FAMILIES means adding it here too — the script fails
 * loudly rather than inventing a name.
 */
const DISPLAY_NAMES = {
  'algol': 'ALGOL',
  'c': 'C',
  'ecmascript': 'ECMAScript',
  'lisp': 'Lisp',
  'ml': 'ML',
  'obj': 'OBJ',
  'smalltalk': 'Smalltalk'
}

/** Read `family:` out of one language entry's frontmatter. */
function readFamily(file) {
  const raw = readFileSync(join(LANG_DIR, file), 'utf8').replace(/\r\n/g, '\n')
  const fm = (raw.match(/^---\n([\s\S]*?)\n---\n/) || [])[1]
  if (!fm) return { name: '', family: null }
  const name = (fm.match(/^name: "([^"]*)"/m) || [])[1] || file.replace(/\.md$/, '')
  const family = (fm.match(/^family: "([^"]*)"/m) || [])[1] || null
  return { name, family }
}

/** corpus map: family key -> [{ name, file }] */
function corpusMembers() {
  const map = new Map()
  for (const f of readdirSync(LANG_DIR).filter(x => x.endsWith('.md')).sort()) {
    const { name, family } = readFamily(f)
    if (!family) continue
    if (!map.has(family)) map.set(family, [])
    map.get(family).push({ name, file: f })
  }
  return map
}

const members = corpusMembers()

// ---------------------------------------------------------------------------
// --members: report the derived member languages.

const membersFlag = process.argv.indexOf('--members')
if (membersFlag !== -1) {
  const arg = process.argv[membersFlag + 1]
  const keys = arg && !arg.startsWith('--') ? [arg] : FAMILIES
  const unknown = keys.filter(k => !FAMILIES.includes(k))
  if (unknown.length) {
    console.error(`scaffold-families: unknown family key(s): ${unknown.join(', ')}`)
    console.error(`Known keys: ${FAMILIES.join(', ')}`)
    process.exit(1)
  }
  for (const key of keys) {
    const list = members.get(key) ?? []
    console.log(`\n${key} (${list.length})${list.length ? ':' : ''}`)
    for (const m of list) console.log(`  ${m.name}`)
  }
  console.log('')
  process.exit(0)
}

// ---------------------------------------------------------------------------
// --candidates: recompute the promotion tier from the corpus.

if (process.argv.includes('--candidates')) {
  const ranked = [...members.entries()]
    .map(([fam, list]) => ({ fam, count: list.length }))
    .sort((a, b) => b.count - a.count || a.fam.localeCompare(b.fam))
  const qualifying = ranked.filter(r => r.count >= THRESHOLD)
  const promoted = new Set(FAMILIES)

  console.log(`\nThreshold: >= ${THRESHOLD} language entries declare the family.\n`)
  console.log('PROMOTED (has a page):')
  for (const key of FAMILIES) {
    console.log(`  ${key} (${members.get(key)?.length ?? 0})`)
  }
  const missing = qualifying.filter(r => !promoted.has(r.fam))
  console.log(`\nQUALIFYING BUT NOT PROMOTED (${missing.length}):`)
  for (const r of missing) console.log(`  ${r.fam} (${r.count})`)
  const stale = FAMILIES.filter(k => (members.get(k)?.length ?? 0) < THRESHOLD)
  console.log(`\nPROMOTED BELOW THRESHOLD (${stale.length}):`)
  for (const k of stale) console.log(`  ${k} (${members.get(k)?.length ?? 0})`)
  console.log('\nTo promote: add the key to FAMILIES + DISPLAY_NAMES, re-run this script.')
  console.log('')
  process.exit(0)
}

// ---------------------------------------------------------------------------

mkdirSync(FAMILY_DIR, { recursive: true })

let created = 0
let skipped = 0
const missingNames = []

for (const key of FAMILIES) {
  const file = join(FAMILY_DIR, `${key}.md`)
  if (existsSync(file)) {
    skipped++
    continue
  }
  const display = DISPLAY_NAMES[key]
  if (!display) {
    missingNames.push(key)
    continue
  }
  const count = members.get(key)?.length ?? 0
  // The stub body is the exact TODO seed the body lint exempts.
  const body = [
    '---',
    `title: "${display}"`,
    `name: "${display}"`,
    `family: "${key}"`,
    '---',
    `TODO: Write the wiki article for **${display}**.`,
    ''
  ].join('\n')
  writeFileSync(file, body, 'utf8')
  created++
  console.log(`created  content/families/${key}.md (${count} member language${count === 1 ? '' : 's'})`)
}

console.log(`\n${created} created, ${skipped} skipped (existing pages are never overwritten)`)

if (missingNames.length) {
  console.error(
    `\nno display name for: ${missingNames.join(', ')}\n` +
    'Add each to DISPLAY_NAMES in scripts/scaffold-families.mjs, then re-run.'
  )
  process.exit(1)
}
