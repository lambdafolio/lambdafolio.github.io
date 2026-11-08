/**
 * Frontmatter lint for content/languages/*.md AND content/paradigms/*.md —
 * the build-time drift control for the fact contract
 * (docs/knowledgebase-plan.md §5, control 7).
 *
 * Checks per file:
 *  - required fields present (name; paradigm entries also need `paradigm`)
 *  - field set matches the collection's schema in content.config.ts
 *    (new keys can't sneak in)
 *  - enum fields (kind/status/typing) and vocab axes (paradigms, type_system,
 *    memory, execution, concurrency) hold recognized values
 *  - structural shape: array fields are lists, enum/string fields are scalars,
 *    year is a 4-digit integer
 *  - influences/influenced resolve against the corpus names (warning only:
 *    relations may reference an entry that doesn't exist yet)
 *  - paradigm entries: `paradigm` equals the file name (the join key) and is
 *    a known PARADIGMS vocabulary value
 *  - language entries: every paradigm value has a matching paradigm page
 *
 * `--fix` normalizes only what can be safely derived: case/hyphen variants
 * that match a known vocabulary value ("Declarative" -> "declarative",
 * near-misses within edit distance 2), sorts vocab axis arrays
 * deterministically, and rewrites frontmatter in canonical field order.
 * Unrecognized values remain errors — add the value to app/utils/taxonomy.ts
 * if intentional, then re-run.
 *
 * Vocabularies and the schema field lists are parsed from the TS sources at
 * runtime (no TS runtime needed) so taxonomy.ts stays the single source.
 *
 * Usage: node scripts/lint-frontmatter.mjs [--fix]
 * Exit: 0 when no errors remain, 1 otherwise (either mode).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const TAXONOMY_TS = join(ROOT, 'app', 'utils', 'taxonomy.ts')
const CONTENT_TS = join(ROOT, 'content.config.ts')

// ---------------------------------------------------------------------------
// Collection registry: one entry per content collection, with the field
// contract each follows. Adding a collection is a data change here, not a
// code change elsewhere.

const COLLECTIONS = [
  {
    key: 'languages',
    dir: join(ROOT, 'content', 'languages'),
    label: 'content/languages',
    // canonical frontmatter field order (schema order; stable diffs)
    fieldOrder: [
      'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
      'kind', 'status', 'generation', 'year', 'paradigms', 'family',
      'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features',
      'influences', 'influenced', 'relations', 'note'
    ],
    arrayFields: new Set([
      'urls', 'paradigms', 'type_system', 'memory', 'execution',
      'concurrency', 'features', 'influences', 'influenced'
    ]),
    enumFields: new Set(['kind', 'status', 'generation', 'typing']),
    stringFields: new Set(['name', 'homepage', 'logo', 'author', 'note', 'family']),
    // lint field -> vocabulary constant
    vocabAxes: {
      kind: 'KINDS',
      status: 'STATUSES',
      generation: 'GENERATIONS',
      typing: 'TYPING',
      paradigms: 'PARADIGMS',
      family: 'FAMILIES',
      type_system: 'TYPE_SYSTEM',
      memory: 'MEMORY',
      execution: 'EXECUTION',
      concurrency: 'CONCURRENCY'
    },
    // fields whose values are names of entries in THIS collection
    nameFields: ['influences', 'influenced'],
    required: ['name']
  },
  {
    key: 'paradigms',
    dir: join(ROOT, 'content', 'paradigms'),
    label: 'content/paradigms',
    fieldOrder: [
      'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
      'paradigm', 'status', 'year', 'features', 'relations', 'note'
    ],
    arrayFields: new Set(['urls', 'features']),
    enumFields: new Set(['status']),
    stringFields: new Set(['name', 'homepage', 'logo', 'author', 'note', 'paradigm']),
    vocabAxes: { status: 'STATUSES' },
    // relation edges point at OTHER paradigms; resolved by key or display name
    nameFields: [],
    required: ['name', 'paradigm']
  },
  {
    key: 'families',
    dir: join(ROOT, 'content', 'families'),
    label: 'content/families',
    fieldOrder: [
      'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
      'family', 'status', 'year', 'features', 'relations', 'note'
    ],
    arrayFields: new Set(['urls', 'features']),
    enumFields: new Set(['status']),
    stringFields: new Set(['name', 'homepage', 'logo', 'author', 'note', 'family']),
    vocabAxes: { status: 'STATUSES' },
    // relation edges point at OTHER families; resolved by key or display name
    nameFields: [],
    required: ['name', 'family']
  },
  {
    key: 'features',
    dir: join(ROOT, 'content', 'features'),
    label: 'content/features',
    fieldOrder: [
      'title', 'name', 'homepage', 'urls', 'references', 'logo',
      'feature', 'status', 'year', 'relates_to', 'note'
    ],
    arrayFields: new Set(['urls', 'relates_to']),
    enumFields: new Set(['status']),
    stringFields: new Set(['name', 'homepage', 'logo', 'feature', 'note']),
    vocabAxes: { status: 'STATUSES' },
    nameFields: [],
    required: ['name', 'feature']
  },
  {
    key: 'generations',
    dir: join(ROOT, 'content', 'generations'),
    label: 'content/generations',
    fieldOrder: [
      'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
      'generation', 'status', 'year', 'features', 'note'
    ],
    arrayFields: new Set(['urls', 'features']),
    enumFields: new Set(['status']),
    stringFields: new Set(['name', 'homepage', 'logo', 'author', 'note', 'generation']),
    // the tier's own `status` is the lifecycle of the FRAMING, not a language
    vocabAxes: { status: 'STATUSES' },
    nameFields: [],
    required: ['name', 'generation']
  }
]

// ---------------------------------------------------------------------------
// Load vocabularies + schema field list from the TS sources (no TS runtime).

function loadVocabFromTs(tsPath) {
  const src = readFileSync(tsPath, 'utf8')
  // strip // comments first: an apostrophe inside one (e.g. "language's")
  // otherwise corrupts the single-quote value extraction below. Vocab values
  // in this file never contain "//", so line-comment stripping is safe.
  const stripped = src.replace(/\/\/[^\n]*/g, '')
  const vocab = {}
  for (const m of stripped.matchAll(/export const ([A-Z_]+) = \[([^\]]*)\] as const/gs)) {
    vocab[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1])
  }
  return vocab
}

/**
 * Field names of every collection's Zod object, keyed by collection name.
 * The schema body sits at 8-space indentation inside `defineCollection({`,
 * so nested object members (e.g. `url:`/`title:` inside `references`) do not
 * match — only top-level fields do.
 */
function loadSchemaFields(tsPath) {
  const src = readFileSync(tsPath, 'utf8')
  const out = new Map()
  for (const m of src.matchAll(/(\w+): defineCollection\(\{/g)) {
    const rest = src.slice(m.index + m[0].length)
    const body = rest.match(/schema: z\.object\(\{([\s\S]*?)\n      \}\)/)?.[1] ?? ''
    out.set(m[1], new Set([...body.matchAll(/^\s{8}(\w+):/gm)].map(x => x[1])))
  }
  return out
}

const VOCAB = loadVocabFromTs(TAXONOMY_TS)
if (!VOCAB.PARADIGMS) {
  console.error('lint-frontmatter: failed to parse app/utils/taxonomy.ts')
  process.exit(1)
}

// scalar constant (not a `as const` array, so loadVocabFromTs skips it)
const FEATURE_PROMOTION_THRESHOLD = Number(
  (readFileSync(TAXONOMY_TS, 'utf8').match(/export const FEATURE_PROMOTION_THRESHOLD = (\d+)/) || [])[1] ?? 3
)

// lint field -> vocabulary constant
const AXIS_VOCAB = {
  kind: 'KINDS',
  status: 'STATUSES',
  typing: 'TYPING',
  paradigms: 'PARADIGMS',
  type_system: 'TYPE_SYSTEM',
  memory: 'MEMORY',
  execution: 'EXECUTION',
  concurrency: 'CONCURRENCY'
}

const ARRAY_FIELDS = new Set([
  'urls', 'paradigms', 'type_system', 'memory', 'execution',
  'concurrency', 'features', 'influences', 'influenced'
])
const ENUM_FIELDS = new Set(['kind', 'status', 'typing'])
const STRING_FIELDS = new Set(['name', 'homepage', 'logo', 'author', 'note'])

// canonical frontmatter field order (schema order; stable diffs)
const FIELD_ORDER = [
  'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
  'kind', 'status', 'year', 'paradigms', 'family',
  'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features',
  'influences', 'influenced', 'relations', 'note'
]

// Per-collection known fields, resolved from content.config.ts.
const SCHEMA_FIELDS = loadSchemaFields(CONTENT_TS)
for (const c of COLLECTIONS) {
  const fields = SCHEMA_FIELDS.get(c.key)
  if (!fields || !fields.has('name')) {
    console.error(`lint-frontmatter: failed to parse schema fields for collection "${c.key}" from content.config.ts`)
    process.exit(1)
  }
  c.knownFields = fields
}

// ---------------------------------------------------------------------------
// Minimal frontmatter parser. Files use simple YAML: quoted scalars and
// 2-space-indented quoted string lists. Deliberately not a YAML impl —
// malformed shapes surface as lint errors instead of parse magic.

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: null, body: text }
  const data = {}
  let currentKey = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const listItem = line.match(/^ {2}- "?([^"]*)"?$/)
    const kv = line.match(/^(\w+):(?: "?([^"[]*)"?|\s*\[\s*\])?$/)
    if (listItem && listItem[1] === '' && line.match(/^ {4}-(\s|$)/) === null) {
      // fallthrough guard: nested object list items handled below
    }
    if (currentKey === 'relations' && line.match(/^ {2}- /)) {
      // start of a { name, kind } edge: `- name: "X"`
      const start = line.match(/^ {2}- name: "?([^"]*)"?$/)
      if (start) {
        data.relations ??= []
        data.relations.push({ name: start[1] })
      }
      continue
    }
    if (currentKey === 'references' && line.match(/^ {2}- url: "?([^"]*)"?$/)) {
      // start of a { url, title } reference
      data.references ??= []
      data.references.push({ url: line.match(/^ {2}- url: "?([^"]*)"?$/)[1] })
      continue
    }
    const refTitleLine = line.match(/^ {4}title: "?([^"]*)"?$/)
    if (refTitleLine && Array.isArray(data.references) && data.references.length) {
      const last = data.references[data.references.length - 1]
      if (last && last.title === undefined) last.title = refTitleLine[1]
      continue
    }
    if (listItem && currentKey && Array.isArray(data[currentKey])) {
      data[currentKey].push(listItem[1])
      continue
    }
    const kindLine = line.match(/^ {4}kind: "?([^"]*)"?$/)
    if (kindLine && Array.isArray(data.relations) && data.relations.length) {
      const last = data.relations[data.relations.length - 1]
      if (last && last.kind === undefined) last.kind = kindLine[1]
      continue
    }
    if (kv) {
      currentKey = kv[1]
      // `key:` -> []; `key: "v"` / `key: v` / `key: []` -> scalar string
      data[kv[1]] = kv[2] !== undefined ? kv[2] : []
    }
  }
  return { data, body: text.slice(m[0].length) }
}

function serializeFrontmatter(data, body, fieldOrder = FIELD_ORDER) {
  const lines = ['---']
  for (const key of fieldOrder) {
    const value = data[key]
    if (value === undefined) continue
    if (key === 'relations') {
      if (!Array.isArray(value) || value.length === 0) continue
      lines.push(`${key}:`)
      for (const edge of value) {
        lines.push(`  - name: "${edge.name}"`, `    kind: "${edge.kind}"`)
      }
    } else if (key === 'references') {
      if (!Array.isArray(value) || value.length === 0) continue
      lines.push(`${key}:`)
      for (const ref of value) {
        lines.push(`  - url: "${ref.url}"`, `    title: "${ref.title}"`)
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`, ...value.map(v => `  - "${v}"`))
    } else if (key === 'year') {
      // unquoted so the Zod schema receives a number (z.number()), not text
      lines.push(`${key}: ${value}`)
    } else if (value !== '') {
      lines.push(`${key}: "${value}"`)
    }
  }
  lines.push('---', '')
  return `${lines.join('\n')}${body.replace(/^\r?\n/, '')}`
}

// ---------------------------------------------------------------------------
// Canonicalization suggestions

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

function canonicalize(value, candidates) {
  if (candidates.includes(value)) return value
  const fold = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const norm = fold(value)
  const byFold = candidates.find(c => fold(c) === norm)
  if (byFold) return byFold
  const lower = value.toLowerCase()
  let best = null
  let bestD = Infinity
  for (const c of candidates) {
    const d = levenshtein(lower, c)
    if (d < bestD) { bestD = d; best = c }
  }
  return bestD <= 2 ? best : null
}

// ---------------------------------------------------------------------------
// Collect corpus names for cross-link integrity (per collection)

const parsedByCollection = new Map() // collection -> file -> { data, body }
const nameToFilesByCollection = new Map() // collection -> name -> [files]

for (const c of COLLECTIONS) {
  const files = readdirSync(c.dir).filter(f => f.endsWith('.md')).sort()
  const parsed = new Map()
  const names = new Set()
  // corpus-level duplicate detection: mirrors the unique DB index on `name`
  // (a duplicate name fails the dev-server DB build with a raw SQLite error)
  const nameToFiles = new Map()

  for (const f of files) {
    const { data, body } = parseFrontmatter(readFileSync(join(c.dir, f), 'utf8'))
    if (data?.name) {
      names.add(data.name)
      if (!nameToFiles.has(data.name)) nameToFiles.set(data.name, [])
      nameToFiles.get(data.name).push(f)
    }
    parsed.set(f, { data, body })
  }

  c.files = files
  c.names = names
  parsedByCollection.set(c, parsed)
  nameToFilesByCollection.set(c, nameToFiles)
}

// The paradigm key IS the file name (`paradigms/object-oriented.md`), and it
// is the join key between the two collections: a language's `paradigms`
// value must have a paradigm page. Both the key and the display name resolve
// a paradigm relation edge.
const paradigmCollection = COLLECTIONS.find(c => c.key === 'paradigms')
const paradigmKeys = new Set(paradigmCollection.files.map(f => f.replace(/\.md$/, '')))
const paradigmEntryNames = new Set(paradigmCollection.names)

// Same join for the promoted-feature collection: `features/closures.md` is
// the page for the `closures` tag, so a language entry declaring that tag
// gets an internal link. Unpromoted tags stay plain text (tier 1) — they are
// NOT a vocabulary, so they are never errors.
const featureCollection = COLLECTIONS.find(c => c.key === 'features')
const featureKeys = new Set(featureCollection.files.map(f => f.replace(/\.md$/, '')))
const promotedFeatures = VOCAB.FEATURES ?? []

// Same join again for families (docs/knowledgebase-plan.md §3b):
// `families/smalltalk.md` is the page for the `smalltalk` lineage key, and it
// is what a language entry's scalar `family:` value must resolve to.
const familyCollection = COLLECTIONS.find(c => c.key === 'families')
const familyKeys = new Set(familyCollection.files.map(f => f.replace(/\.md$/, '')))
const familyEntryNames = new Set(familyCollection.names)
const familyVocab = VOCAB.FAMILIES ?? []

// And for generations: `generations/4gl.md` is the page that DEFINES the
// `4gl` tier, which is what a language entry's `generation:` value refers to.
const generationCollection = COLLECTIONS.find(c => c.key === 'generations')
const generationKeys = new Set(generationCollection.files.map(f => f.replace(/\.md$/, '')))
const generationVocab = VOCAB.GENERATIONS ?? []

// ---------------------------------------------------------------------------

const fix = process.argv.includes('--fix')
let errors = 0
let warnings = 0
const rewritten = []

// A promoted key with no page is a broken join: FEATURES is the tier-2
// vocabulary, and the page is what makes the tag clickable.
for (const key of promotedFeatures) {
  if (!featureKeys.has(key)) {
    console.error(
      `content/features: promoted feature "${key}" (FEATURES in app/utils/taxonomy.ts) ` +
      'has no page — run `node scripts/scaffold-features.mjs`'
    )
    errors++
  }
}

// Same for families: the vocabulary value IS the join key, so a value with no
// page would leave every language carrying it pointing at nothing.
for (const key of familyVocab) {
  if (!familyKeys.has(key)) {
    console.error(
      `content/families: family "${key}" (FAMILIES in app/utils/taxonomy.ts) ` +
      'has no page — run `node scripts/scaffold-families.mjs`'
    )
    errors++
  }
}

// Generations invert the usual rule: the ladder is a closed canonical five, so
// EVERY tier must have a page even though some have no members in this corpus.
// The page is where the tier's definition lives — a missing one means the
// vocabulary advertises a term nobody has defined.
for (const key of generationVocab) {
  if (!generationKeys.has(key)) {
    console.error(
      `content/generations: generation "${key}" (GENERATIONS in app/utils/taxonomy.ts) ` +
      'has no page — the tier is undefined; add content/generations/<key>.md'
    )
    errors++
  }
}

for (const c of COLLECTIONS) {
  const parsed = parsedByCollection.get(c)
  const isParadigmCollection = c.key === 'paradigms'
  const isFeatureCollection = c.key === 'features'
  const isFamilyCollection = c.key === 'families'
  const isGenerationCollection = c.key === 'generations'

  for (const f of c.files) {
    const { data, body } = parsed.get(f)
    const rel = `${c.label}/${f}`
    if (!data) { console.error(`${rel}: missing frontmatter block`); errors++; continue }

    for (const key of Object.keys(data)) {
      if (!c.knownFields.has(key) && key !== 'title') {
        console.error(`${rel}: unknown field "${key}"`)
        errors++
      }
    }
    for (const req of c.required) {
      if (!data[req]) { console.error(`${rel}: missing required field "${req}"`); errors++ }
    }

    // display names are ASCII-only (docs/knowledgebase-plan.md contract):
    // non-ASCII names break slug derivation and URL/SEO portability
    for (const key of ['name', 'title']) {
      const value = data[key]
      if (typeof value === 'string' && /[^\x00-\x7F]/.test(value)) {
        console.error(`${rel}: "${key}" must be ASCII-only (found non-ASCII in "${value}")`)
        errors++
      }
    }

    for (const [key, value] of Object.entries(data)) {
      if (key === 'title') continue
      if (c.arrayFields.has(key) && !Array.isArray(value) && value !== '') {
        console.error(`${rel}: "${key}" must be a list`)
        errors++
      } else if ((c.enumFields.has(key) || c.stringFields.has(key)) && Array.isArray(value)) {
        console.error(`${rel}: "${key}" must be a scalar`)
        errors++
      } else if (key === 'year' && value !== '' && value !== undefined && !/^\d{4}$/.test(String(value))) {
        console.error(`${rel}: "year" must be a 4-digit integer`)
        errors++
      }
    }

    // the paradigm key IS the join key between the two collections: it must
    // equal the file name and be a known PARADIGMS vocabulary value
    if (isParadigmCollection) {
      const key = f.replace(/\.md$/, '')
      if (data.paradigm && data.paradigm !== key) {
        console.error(`${rel}: "paradigm" must equal the file name ("${key}") — it is the join key with the languages collection`)
        errors++
      }
      if (!VOCAB.PARADIGMS.includes(key)) {
        console.error(`${rel}: "${key}" is not a PARADIGMS vocabulary value — add it to PARADIGMS in app/utils/taxonomy.ts if intentional`)
        errors++
      }
    }

    // the feature key is the same kind of join key against the languages
    // collection's free-form `features` tags — but only a *promoted* key has
    // a page, so membership in FEATURES is required
    if (isFeatureCollection) {
      const key = f.replace(/\.md$/, '')
      if (data.feature && data.feature !== key) {
        console.error(`${rel}: "feature" must equal the file name ("${key}") — it is the join key with the languages collection`)
        errors++
      }
      if (!promotedFeatures.includes(key)) {
        console.error(`${rel}: "${key}" is not a FEATURES vocabulary value — promote it in app/utils/taxonomy.ts (threshold: >= ${FEATURE_PROMOTION_THRESHOLD})`)
        errors++
      }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
        console.error(`${rel}: promoted feature keys must be lowercase kebab (they become route segments): "${key}"`)
        errors++
      }
    }

    // the family key is the third join key: it must equal the file name and be
    // a FAMILIES vocabulary value, because language entries point at it
    if (isFamilyCollection) {
      const key = f.replace(/\.md$/, '')
      if (data.family && data.family !== key) {
        console.error(`${rel}: "family" must equal the file name ("${key}") — it is the join key with the languages collection`)
        errors++
      }
      if (!familyVocab.includes(key)) {
        console.error(`${rel}: "${key}" is not a FAMILIES vocabulary value — add it to FAMILIES in app/utils/taxonomy.ts if intentional`)
        errors++
      }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
        console.error(`${rel}: family keys must be lowercase kebab (they become route segments): "${key}"`)
        errors++
      }
    }

    // the generation key is the fourth join key, with the same contract: the
    // file name IS the tier, and the `generation` field repeats it
    if (isGenerationCollection) {
      const key = f.replace(/\.md$/, '')
      if (data.generation && data.generation !== key) {
        console.error(`${rel}: "generation" must equal the file name ("${key}") — it is the join key with the languages collection`)
        errors++
      }
      if (!generationVocab.includes(key)) {
        console.error(`${rel}: "${key}" is not a GENERATIONS vocabulary value — add it to GENERATIONS in app/utils/taxonomy.ts if intentional`)
        errors++
      }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
        console.error(`${rel}: generation keys must be lowercase kebab (they become route segments): "${key}"`)
        errors++
      }
    }

    // references are MANDATORY (docs/knowledgebase-plan.md: sourced facts):
    // curated (prose-bearing) entries must carry titled references; TODO stubs
    // warn only, so legacy stubs don't hard-fail until curated
    const proseBody = body.trim() && !/^TODO: Write the wiki article for \*\*.+\*\*\./.test(body.trim())
    if (!Array.isArray(data.references) || data.references.length === 0) {
      if (proseBody) {
        console.error(`${rel}: missing required "references" (curated entries must cite sources)`)
        errors++
      } else {
        console.warn(`${rel}: no "references" yet (required once curated)`)
        warnings++
      }
    } else {
      for (const ref of data.references) {
        if (!ref || typeof ref !== 'object' || !ref.url || !ref.title) {
          console.error(`${rel}: references entries must be { url, title } objects`)
          errors++
          continue
        }
        // primary-sources rule: Wikipedia (and other aggregators) may guide
        // research but never serve as a citation; lint flags these hosts.
        // web.archive.org IS allowed (it serves a copy of the primary page).
        try {
          const host = new URL(ref.url).hostname.replace(/^www\./, '')
          if (/(^|\.)wikipedia\.org$|(^|\.)wikimedia\.org$|(^|\.)wikibooks\.org$|(^|\.)wikidata\.org$/.test(host)) {
            console.error(`${rel}: references must cite primary sources — "${host}" is an aggregator; cite the page it led you to instead`)
            errors++
          }
        } catch { /* malformed URL: not our check */ }
      }
    }

    for (const [field, vocabName] of Object.entries(c.vocabAxes)) {
      const value = data[field]
      if (value === undefined || value === '') continue
      const candidates = VOCAB[vocabName]
      const items = Array.isArray(value) ? value : [value]
      const next = []
      let changed = false
      for (const item of items) {
        const canon = canonicalize(item, candidates)
        if (canon === item) { next.push(item); continue }
        if (canon) {
          console.warn(`${rel}: "${field}: ${item}" -> "${canon}"${fix ? ' (fixed)' : ''}`)
          warnings++
          changed = true
          next.push(canon)
        } else {
          console.error(
            `${rel}: unknown ${field} value "${item}" ` +
            `— add it to ${vocabName} in app/utils/taxonomy.ts if intentional`
          )
          errors++
          next.push(item)
        }
      }
      if (changed) data[field] = next
      if (fix && Array.isArray(data[field])) data[field].sort()
    }

    // typed relation edges: { name, kind } pairs
    if (Array.isArray(data.relations)) {
      const relKinds = VOCAB.RELATION_KINDS ?? []
      for (const edge of data.relations) {
        if (!edge || typeof edge !== 'object' || !edge.name) {
          console.error(`${rel}: relations entries must be { name, kind } objects`); errors++
          continue
        }
        if (!relKinds.includes(edge.kind)) {
          console.error(`${rel}: unknown relation kind "${edge.kind}" for "${edge.name}" — add it to RELATION_KINDS in app/utils/taxonomy.ts if intentional`)
          errors++
        }
        if (isParadigmCollection) {
          // paradigm edges point at other paradigms (resolved by key or name)
          if (!paradigmKeys.has(edge.name) && !paradigmEntryNames.has(edge.name)) {
            console.warn(`${rel}: "relations: ${edge.name}" does not match any paradigm entry`)
            warnings++
          }
        } else if (isFamilyCollection) {
          // family edges point at other FAMILIES, not at languages
          if (!familyKeys.has(edge.name) && !familyEntryNames.has(edge.name)) {
            console.warn(`${rel}: "relations: ${edge.name}" does not match any family entry`)
            warnings++
          }
        } else if (!c.names.has(edge.name)) {
          console.warn(`${rel}: "relations: ${edge.name}" does not match any language name`)
          warnings++
        }
      }
    }

    for (const field of c.nameFields) {
      if (!Array.isArray(data[field])) continue
      for (const name of data[field]) {
        if (!c.names.has(name)) {
          console.warn(`${rel}: "${field}: ${name}" does not match any language name`)
          warnings++
        }
      }
    }

    // cross-collection integrity: a language's paradigm value must have a
    // paradigm page (the join key is the vocabulary value = file name)
    if (!isParadigmCollection && Array.isArray(data.paradigms)) {
      for (const value of data.paradigms) {
        if (!paradigmKeys.has(value)) {
          console.warn(`${rel}: "paradigms: ${value}" has no entry in content/paradigms/`)
          warnings++
        }
      }
    }

    // a language's *promoted* feature tags resolve to feature pages; the
    // unpromoted tail is free-form and stays unlinted on purpose
    if (!isFeatureCollection && !isParadigmCollection && Array.isArray(data.features)) {
      for (const value of data.features) {
        if (promotedFeatures.includes(value) && !featureKeys.has(value)) {
          console.warn(`${rel}: "features: ${value}" is promoted but has no entry in content/features/`)
          warnings++
        }
      }
    }

    // cross-collection integrity for lineage: a language's `family` value must
    // have a family page. The vocabulary lint already rejects unknown values;
    // this catches a value that is in FAMILIES but whose page is missing.
    // Generations are the same kind of join, over a closed five-tier ladder.
    if (!isParadigmCollection && !isFeatureCollection && !isFamilyCollection && !isGenerationCollection && data.family) {
      if (!familyKeys.has(data.family)) {
        console.warn(`${rel}: "family: ${data.family}" has no entry in content/families/`)
        warnings++
      }
    }
    if (!isParadigmCollection && !isFeatureCollection && !isFamilyCollection && !isGenerationCollection && data.generation) {
      if (!generationKeys.has(data.generation)) {
        console.warn(`${rel}: "generation: ${data.generation}" has no entry in content/generations/`)
        warnings++
      }
    }

    if (fix) {
      const rebuilt = serializeFrontmatter(data, body, c.fieldOrder)
      const original = readFileSync(join(c.dir, f), 'utf8')
      if (rebuilt !== original) {
        writeFileSync(join(c.dir, f), rebuilt)
        rewritten.push(`${c.label}/${f}`)
      }
    }
  }
}

if (fix) console.log(`\nrewrote ${rewritten.length} file(s)${rewritten.length ? `: ${rewritten.join(', ')}` : ''}`)

// corpus-level duplicate names (mirrors the unique DB index; raw SQLite
// UNIQUE failures in the dev server are worse than a lint error)
for (const c of COLLECTIONS) {
  for (const [name, dupFiles] of [...nameToFilesByCollection.get(c)].sort()) {
    if (dupFiles.length > 1) {
      console.error(`duplicate name "${name}" in ${c.label}: ${dupFiles.join(', ')} — disambiguate (e.g. author-qualify)`)
      errors++
    }
  }
}

// corpus-level SLUG collisions. Name uniqueness is not enough: two distinct
// names can reduce to the same slug, which is exactly how `Go` and `Go!` both
// slugged to `go` and the import wrote the opaque stem `go-2.md` (a meaningless,
// permanently published URL). The rule below mirrors CHAR_MAP/SLUG_OVERRIDES in
// scripts/convert-languages.mjs and app/utils/slugify.ts — duplicated here
// because this is the only gate that can catch the two drifting apart.
const SLUG_CHAR_MAP = { '+': 'plus', '&': 'and', 'π': 'pi', '!': '-bang' }
const SLUG_OVERRIDES = {
  'F#': 'fsharp', 'Q#': 'qsharp', 'C#': 'csharp', 'SML#': 'smlsharp'
}

function corpusSlug(name) {
  const override = SLUG_OVERRIDES[name]
  if (override) return override
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[+&π!]/g, ch => SLUG_CHAR_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

for (const c of COLLECTIONS) {
  const bySlug = new Map()
  for (const f of c.files) {
    const { data } = parsedByCollection.get(c).get(f)
    if (!data?.name) continue
    const slug = corpusSlug(data.name)
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(`"${data.name}" (${f})`)

    // filename/slug drift (LANGUAGES ONLY): the file stem IS the route, and
    // for languages it is DERIVED from `name` via the shared slug rule. A stem
    // that disagrees with slugify(name) is how `go-2.md`, `jspp.md`, and
    // `sml-sharp.md` accumulated — opaque URLs encoding import order or an
    // ad-hoc suffix. The rule is now enforced, so a new entry can only land at
    // its canonical slug (or an explicit SLUG_OVERRIDES / CHAR_MAP entry,
    // which is reviewed in one place).
    //
    // The other collections are KEY-addressed, not name-addressed: for them the
    // file stem is the taxonomy key (`features/regex.md` defines the `regex`
    // value) and `name` is only a display label ("Regular expressions"). Their
    // key↔field equality is checked separately, so applying this rule to them
    // would flag every correct entry.
    if (c.key !== 'languages') continue
    const stem = f.replace(/\.md$/, '')
    if (stem !== slug) {
      console.error(
        `${c.label}/${f}: filename "${stem}" ≠ slug "${slug}" derived from name ` +
        `"${data.name}" — rename the file, or add an explicit SLUG_OVERRIDES/CHAR_MAP ` +
        'entry in scripts/convert-languages.mjs + app/utils/slugify.ts'
      )
      errors++
    }
  }
  for (const [slug, entries] of [...bySlug].sort()) {
    if (entries.length > 1) {
      console.error(
        `${c.label}: slug "${slug}" is shared by ${entries.join(', ')} — ` +
        'give the names a distinguishing suffix (e.g. "Name (author)" or a symbol mapping in CHAR_MAP)'
      )
      errors++
    }
  }
}

const totalFiles = COLLECTIONS.reduce((n, c) => n + c.files.length, 0)
console.log(`\n${totalFiles} files, ${errors} error(s), ${warnings} warning(s)${fix ? ' (fix mode)' : ''}`)
if (errors > 0) {
  console.error('frontmatter lint FAILED')
  process.exit(1)
}
console.log('frontmatter lint OK')