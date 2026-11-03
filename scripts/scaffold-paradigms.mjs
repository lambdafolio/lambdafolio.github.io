/**
 * Scaffold stub pages for the `paradigms` collection, and report the member
 * languages of a paradigm.
 *
 * One stub per PARADIGMS vocabulary value in app/utils/taxonomy.ts. The
 * file name IS the taxonomy key (`paradigms/object-oriented.md`) and the
 * `paradigm` field repeats it, so the join with the languages collection is
 * exact — see content.config.ts §paradigms.
 *
 * IDEMPOTENT AND NON-DESTRUCTIVE: an existing page is never rewritten.
 * Curated entries (prose, references, relations) are the expensive part of
 * this collection; re-running this script must not touch them. New
 * vocabulary values are the only thing it adds.
 *
 * Usage:
 *   node scripts/scaffold-paradigms.mjs                 # create missing stubs
 *   node scripts/scaffold-paradigms.mjs --members functional
 *   node scripts/scaffold-paradigms.mjs --members       # all paradigms
 *
 * `--members` prints the languages whose `paradigms:` array carries the key.
 * Member lists are DERIVED from the languages collection — the paradigm
 * frontmatter has no `members` field, because a stored list would go stale
 * the moment a language entry changed.
 *
 * Exit: 0 normally, 1 if a vocabulary value has no display name (the map
 * below is then the place to fix it) or if `--members` names an unknown key.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const PARADIGM_DIR = join(ROOT, 'content', 'paradigms')
const TAXONOMY_TS = join(ROOT, 'app', 'utils', 'taxonomy.ts')

/**
 * Display name per paradigm key. These are the values that appear as the
 * entry `name` (and the `title`). Hyphenated adjectives keep their hyphen
 * and take Title Case: `object-oriented` -> "Object-oriented".
 *
 * Adding a vocabulary value to PARADIGMS means adding it here too — the
 * script fails loudly rather than inventing a name.
 */
const DISPLAY_NAMES = {
  'agent-based': 'Agent-based',
  'array': 'Array',
  'aspect-oriented': 'Aspect-oriented',
  'concatenative': 'Concatenative',
  'concurrent': 'Concurrent',
  'continuation': 'Continuation',
  'data-parallel': 'Data-parallel',
  'dataflow': 'Dataflow',
  'declarative': 'Declarative',
  'domain-specific': 'Domain-specific',
  'effect': 'Effect',
  'functional': 'Functional',
  'generic': 'Generic',
  'imperative': 'Imperative',
  'logic': 'Logic',
  'modular': 'Modular',
  'object-oriented': 'Object-oriented',
  'parallel': 'Parallel',
  'pattern-oriented': 'Pattern-oriented',
  'probabilistic': 'Probabilistic',
  'query': 'Query',
  'reactive': 'Reactive',
  'relational': 'Relational',
  'specification': 'Specification',
  'stack-based': 'Stack-based',
  'structural': 'Structural',
  'synchronous': 'Synchronous',
  'systems': 'Systems',
  'visual': 'Visual'
}

/** Parse the controlled vocabularies out of taxonomy.ts (no TS runtime). */
function loadVocab(tsPath) {
  const src = readFileSync(tsPath, 'utf8').replace(/\/\/[^\n]*/g, '')
  const vocab = {}
  for (const m of src.matchAll(/export const ([A-Z_]+) = \[([^\]]*)\] as const/gs)) {
    vocab[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1])
  }
  return vocab
}

const PARADIGMS = loadVocab(TAXONOMY_TS).PARADIGMS
if (!PARADIGMS?.length) {
  console.error('scaffold-paradigms: failed to parse PARADIGMS from app/utils/taxonomy.ts')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// --members: report the derived member languages of a paradigm.
//
// The member list is derived from the languages collection (every entry
// whose `paradigms:` array contains the key). It is the corpus's claim
// about which languages use the paradigm — a lead for research, not a
// citation.

const membersFlag = process.argv.indexOf('--members')
if (membersFlag !== -1) {
  const arg = process.argv[membersFlag + 1]
  const keys = arg && !arg.startsWith('--') ? [arg] : PARADIGMS
  const unknown = keys.filter(k => !PARADIGMS.includes(k))
  if (unknown.length) {
    console.error(`scaffold-paradigms: unknown paradigm key(s): ${unknown.join(', ')}`)
    console.error(`Known keys: ${PARADIGMS.join(', ')}`)
    process.exit(1)
  }

  const langDir = join(ROOT, 'content', 'languages')
  const langs = readdirSync(langDir).filter(f => f.endsWith('.md')).sort()
  const members = new Map(keys.map(k => [k, []]))

  for (const f of langs) {
    const raw = readFileSync(join(langDir, f), 'utf8').replace(/\r\n/g, '\n')
    const fm = (raw.match(/^---\n([\s\S]*?)\n---\n/) || [])[1]
    if (!fm) continue
    const name = (fm.match(/^name: "([^"]*)"/m) || [])[1] || f.replace(/\.md$/, '')
    const block = fm.match(/^paradigms:\n((?:  - "[^"]*"\n?)+)/m)
    if (!block) continue
    for (const m of block[1].matchAll(/"([^"]*)"/g)) {
      members.get(m[1])?.push(name)
    }
  }

  for (const key of keys) {
    const list = members.get(key) || []
    console.log(`\n${key} (${list.length})${list.length ? ':' : ''}`)
    for (const n of list) console.log(`  ${n}`)
  }
  console.log('')
  process.exit(0)
}

mkdirSync(PARADIGM_DIR, { recursive: true })

let created = 0
let skipped = 0
const missingNames = []

for (const key of PARADIGMS) {
  const file = join(PARADIGM_DIR, `${key}.md`)
  if (existsSync(file)) {
    skipped++
    continue
  }
  const display = DISPLAY_NAMES[key]
  if (!display) {
    missingNames.push(key)
    continue
  }
  // The stub body is the exact TODO seed the body lint exempts.
  const body = [
    '---',
    `title: "${display}"`,
    `name: "${display}"`,
    `paradigm: "${key}"`,
    '---',
    `TODO: Write the wiki article for **${display}**.`,
    ''
  ].join('\n')
  writeFileSync(file, body, 'utf8')
  created++
  console.log(`created  content/paradigms/${key}.md`)
}

console.log(`\n${created} created, ${skipped} skipped (existing pages are never overwritten)`)

if (missingNames.length) {
  console.error(
    `\nno display name for: ${missingNames.join(', ')}\n` +
    'Add each to DISPLAY_NAMES in scripts/scaffold-paradigms.mjs, then re-run.'
  )
  process.exit(1)
}
