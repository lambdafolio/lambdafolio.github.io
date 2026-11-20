/**
 * Vocabulary and schema loading, shared by the lint and the intake parser.
 *
 * Both need the same three things — the fact axes, the derived page-backed
 * vocabularies, and the set of legal field names per collection — and both must
 * agree exactly, or a value the lint accepts could be rejected by triage (or
 * worse, the reverse). One loader, two callers.
 *
 * Deliberately regex-based rather than a TypeScript import: these scripts run
 * under plain `node` with no TS toolchain, and the sources have a fixed shape
 * that the lint already depends on.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '..')
export const TAXONOMY_TS = resolve(ROOT, 'app/utils/taxonomy.ts')
export const TAXONOMY_GENERATED_TS = resolve(ROOT, 'app/data/taxonomy.generated.ts')
export const SCHEMA_TS = resolve(ROOT, 'content.config.ts')

/**
 * Read `export const NAME = [...] as const` arrays from a TS source.
 *
 * Line comments are stripped first: an apostrophe inside one (e.g. "language's")
 * otherwise corrupts the single-quote extraction. Vocabulary values never
 * contain `//`, so line-comment stripping is safe here.
 */
export function loadVocabFromTs(tsPath) {
  const src = readFileSync(tsPath, 'utf8').replace(/\/\/[^\n]*/g, '')
  const vocab = {}
  for (const m of src.matchAll(/export const ([A-Z_]+) = \[([^\]]*)\] as const/gs)) {
    vocab[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1])
  }
  return vocab
}

/**
 * Field names of every collection's Zod object, keyed by collection name.
 *
 * The schema body sits at 8-space indentation inside `defineCollection({`, so
 * nested object members (e.g. `url:`/`title:` inside `references`) do not match
 * — only top-level fields do. That is what we want: "does this collection have a
 * field called `memory`" must not be answered yes by a nested key.
 */
export function loadSchemaFields(tsPath = SCHEMA_TS) {
  const src = readFileSync(tsPath, 'utf8')
  const out = new Map()
  for (const m of src.matchAll(/(\w+): defineCollection\(\{/g)) {
    const rest = src.slice(m.index + m[0].length)
    const body = rest.match(/schema: z\.object\(\{([\s\S]*?)\n      \}\)/)?.[1] ?? ''
    out.set(m[1], new Set([...body.matchAll(/^\s{8}(\w+):/gm)].map(x => x[1])))
  }
  return out
}

/**
 * The merged vocabulary. Two sources, deliberately: hand-authored fact axes in
 * `taxonomy.ts`, and the four page-backed vocabularies derived into
 * `taxonomy.generated.ts` from the content directories (a key *is* the file name
 * of its page). Merging here means every consumer validates against the same
 * lists — there is no third copy to drift.
 */
export function loadVocab() {
  const vocab = {
    ...loadVocabFromTs(TAXONOMY_TS),
    ...loadVocabFromTs(TAXONOMY_GENERATED_TS)
  }
  const required = ['PARADIGMS', 'FAMILIES', 'GENERATIONS', 'FEATURES']
  const missing = required.filter(k => !vocab[k])
  if (missing.length) {
    throw new Error(
      `failed to parse the vocabularies — missing ${missing.join(', ')}.\n` +
      'Expected the fact axes in app/utils/taxonomy.ts and the derived lists in\n' +
      'app/data/taxonomy.generated.ts (run `npm run generate:taxonomy`).'
    )
  }
  return vocab
}

/** Which vocabulary governs which frontmatter field, where one does. */
export const AXIS_VOCAB = {
  paradigms: 'PARADIGMS',
  family: 'FAMILIES',
  type_system: 'TYPE_SYSTEM',
  memory: 'MEMORY',
  execution: 'EXECUTION',
  concurrency: 'CONCURRENCY',
  kind: 'KINDS',
  status: 'STATUSES',
  typing: 'TYPING',
  generation: 'GENERATIONS'
}

/** Fields whose value is a single scalar rather than a list. */
export const SCALAR_FIELDS = new Set(['name', 'title', 'homepage', 'author', 'note', 'family', 'kind', 'status', 'typing', 'generation'])

/** Fields that are free-form (no vocabulary, no structure worth validating). */
export const FREE_FIELDS = new Set(['features', 'urls', 'influences', 'influenced', 'references', 'logo', 'note'])
