/**
 * Scaffold stub pages for the `features` collection, and report the derived
 * member languages of a feature.
 *
 * Tier 2 of the feature model (docs/knowledgebase-plan.md §2): a language
 * entry's `features` array is a free-form tag list. Only the promoted subset
 * in FEATURES (app/utils/taxonomy.ts) gets a page here — file name IS the
 * key (`features/closures.md`), `feature` repeats it, and the member
 * languages are derived from the languages collection, never stored.
 *
 * IDEMPOTENT AND NON-DESTRUCTIVE: an existing page is never rewritten.
 *
 * Usage:
 *   node scripts/scaffold-features.mjs                  # create missing stubs
 *   node scripts/scaffold-features.mjs --members regex
 *   node scripts/scaffold-features.mjs --members        # all promoted features
 *   node scripts/scaffold-features.mjs --candidates     # promotion candidates
 *
 * `--candidates` recomputes the tier from the corpus: it counts how many
 * language entries declare each feature string and lists those at or above
 * FEATURE_PROMOTION_THRESHOLD. Promotion is a data decision made from this
 * output — add the key to FEATURES in app/utils/taxonomy.ts, then re-run
 * this script to create its stub.
 *
 * Exit: 0 normally, 1 on a missing display name or an unknown key.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const FEATURE_DIR = join(ROOT, 'content', 'features')
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
  const threshold = src.match(/export const FEATURE_PROMOTION_THRESHOLD = (\d+)/)
  vocab.FEATURE_PROMOTION_THRESHOLD = threshold ? Number(threshold[1]) : 3
  return vocab
}

const VOCAB = { ...loadVocab(TAXONOMY_TS), ...loadVocab(TAXONOMY_GENERATED_TS) }
const FEATURES = VOCAB.FEATURES
if (!FEATURES?.length) {
  console.error('scaffold-features: failed to parse FEATURES from app/utils/taxonomy.ts')
  process.exit(1)
}
const THRESHOLD = VOCAB.FEATURE_PROMOTION_THRESHOLD

/**
 * Display name per feature key. Keys are lowercase kebab (they are route
 * segments); the display name is Title Case with the hyphen kept only where
 * the phrase needs it: `first-class-functions` -> "First-class functions".
 *
 * Adding a value to FEATURES means adding it here too — the script fails
 * loudly rather than inventing a name.
 */
const DISPLAY_NAMES = {
  'closures': 'Closures',
  'first-class-functions': 'First-class functions',
  'modules': 'Modules',
  'music-oriented': 'Music-oriented',
  'pattern-matching': 'Pattern matching',
  'prototypes': 'Prototypes',
  'regex': 'Regular expressions'
}

/** Read `features:` out of one language entry's frontmatter. */
function readFeatures(file) {
  const raw = readFileSync(join(LANG_DIR, file), 'utf8').replace(/\r\n/g, '\n')
  const fm = (raw.match(/^---\n([\s\S]*?)\n---\n/) || [])[1]
  if (!fm) return { name: '', features: [] }
  const name = (fm.match(/^name: "([^"]*)"/m) || [])[1] || file.replace(/\.md$/, '')
  const block = fm.match(/^features:\n((?:  - "[^"]*"\n?)+)/m)
  const features = block ? [...block[1].matchAll(/"([^"]*)"/g)].map(x => x[1]) : []
  return { name, features }
}

/** corpus map: feature string -> [{ name, file }] */
function corpusMembers() {
  const map = new Map()
  for (const f of readdirSync(LANG_DIR).filter(x => x.endsWith('.md')).sort()) {
    const { name, features } = readFeatures(f)
    for (const feat of features) {
      if (!map.has(feat)) map.set(feat, [])
      map.get(feat).push({ name, file: f })
    }
  }
  return map
}

const members = corpusMembers()

// ---------------------------------------------------------------------------
// --members: report the derived member languages.

const membersFlag = process.argv.indexOf('--members')
if (membersFlag !== -1) {
  const arg = process.argv[membersFlag + 1]
  const keys = arg && !arg.startsWith('--') ? [arg] : FEATURES
  const unknown = keys.filter(k => !FEATURES.includes(k))
  if (unknown.length) {
    console.error(`scaffold-features: unknown feature key(s): ${unknown.join(', ')}`)
    console.error(`Known keys: ${FEATURES.join(', ')}`)
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
    .map(([feat, list]) => ({ feat, count: list.length }))
    .sort((a, b) => b.count - a.count || a.feat.localeCompare(b.feat))
  const qualifying = ranked.filter(r => r.count >= THRESHOLD)
  const promoted = new Set(FEATURES)

  console.log(`\nThreshold: >= ${THRESHOLD} language entries declare the feature.\n`)
  console.log('PROMOTED (has a page):')
  for (const key of FEATURES) {
    console.log(`  ${key} (${members.get(key)?.length ?? 0})`)
  }
  const missing = qualifying.filter(r => !promoted.has(r.feat))
  console.log(`\nQUALIFYING BUT NOT PROMOTED (${missing.length}):`)
  for (const r of missing) console.log(`  ${r.feat} (${r.count})`)
  const stale = FEATURES.filter(k => (members.get(k)?.length ?? 0) < THRESHOLD)
  console.log(`\nPROMOTED BELOW THRESHOLD (${stale.length}):`)
  for (const k of stale) console.log(`  ${k} (${members.get(k)?.length ?? 0})`)
  console.log('\nTo promote: add the key to FEATURES + DISPLAY_NAMES, re-run this script.')
  console.log('')
  process.exit(0)
}

// ---------------------------------------------------------------------------

mkdirSync(FEATURE_DIR, { recursive: true })

let created = 0
let skipped = 0
const missingNames = []

for (const key of FEATURES) {
  const file = join(FEATURE_DIR, `${key}.md`)
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
    `feature: "${key}"`,
    '---',
    `TODO: Write the wiki article for **${display}**.`,
    ''
  ].join('\n')
  writeFileSync(file, body, 'utf8')
  created++
  console.log(`created  content/features/${key}.md (${count} member language${count === 1 ? '' : 's'})`)
}

console.log(`\n${created} created, ${skipped} skipped (existing pages are never overwritten)`)

if (missingNames.length) {
  console.error(
    `\nno display name for: ${missingNames.join(', ')}\n` +
    'Add each to DISPLAY_NAMES in scripts/scaffold-features.mjs, then re-run.'
  )
  process.exit(1)
}
