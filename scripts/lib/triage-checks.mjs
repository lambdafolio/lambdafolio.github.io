/**
 * Deterministic triage checks (docs/suggestion-intake-plan.md §5.2 step 1).
 *
 * The parser (§5.2 step 0) turns prose into a *proposal*. This file decides
 * whether the proposal is true, using only the corpus and the rulebook. A model
 * never appears here.
 *
 * Every function returns a list of findings rather than throwing, so triage can
 * report *all* the reasons a request is not ready instead of only the first.
 * That matters for the submitter: "the field does not exist, and the source is
 * an aggregator, and the name is a duplicate" is one round-trip; three separate
 * rejections is three.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ROOT, loadVocab, loadSchemaFields, AXIS_VOCAB, SCALAR_FIELDS } from './taxonomy-vocab.mjs'
import { slugify } from './slugify.mjs'

const CONTENT = resolve(ROOT, 'content')

/**
 * Hosts that are leads, not citations.
 *
 * Mirrors the aggregator rule in scripts/lint-body.mjs and
 * scripts/lint-frontmatter.mjs. Kept as an explicit list rather than a regex
 * because "is this primary" is a judgement encoded once, and three copies of a
 * regex is three chances to drift.
 */
const LEAD_HOSTS = [
  'wikipedia.org', 'wikimedia.org', 'wikibooks.org', 'wikidata.org',
  'news.ycombinator.com', 'reddit.com', 'twitter.com', 'x.com',
  'lambda-the-ultimate.org', 'lobste.rs', 'stackoverflow.com'
]

/** True when the URL's host is (a subdomain of) a known lead host. */
export function isLeadHost(url) {
  let host
  try {
    host = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return false
  }
  return LEAD_HOSTS.some(h => host === h || host.endsWith(`.${h}`))
}

/** Every language file, indexed by its frontmatter `name`, lowercased for matching. */
export function loadCorpus() {
  const dir = join(CONTENT, 'languages')
  const byName = new Map()
  const bySlug = new Map()
  const slugs = new Set()

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    const slug = file.slice(0, -'.md'.length)
    slugs.add(slug)
    const raw = readFileSync(join(dir, file), 'utf8')
    const name = raw.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim()
    if (!name) continue
    byName.set(name.toLowerCase(), { slug, name, raw })
    bySlug.set(slug, { slug, name, raw })
  }
  return { byName, bySlug, slugs }
}

/**
 * Read one field's current value out of an entry's raw markdown.
 *
 * Used for the two things a correction cannot be checked without:
 *   - detecting a no-op (the proposal already matches what is on disk)
 *   - snapshotting the baseline, so the apply step can refuse when the value
 *     moved between triage and write (SKILL.md's write guard)
 *
 * Returns `undefined` when the field is absent, so "absent" and "empty" stay
 * distinguishable — a proposal of `[]` against an absent field is a change, not
 * a no-op.
 *
 * Deliberately minimal YAML reading: the corpus serialisation is fixed and the
 * values we compare are single-line (scalars or `- "item"` lists). It mirrors
 * `fmArray` in scripts/lint-body.mjs rather than importing it, because a checker
 * that shares a parser with the thing it checks shares its blind spots.
 */
export function readFieldValue(raw, field) {
  // The field name is interpolated, so these two must be dynamic; everything else
  // uses literals to avoid double-escaping inside a template string, which is
  // exactly the mistake that made the first version of this function return `[]`
  // for every list — `\\n` in a `new RegExp` template becomes a literal backslash
  // followed by `n`, so the item matcher never fired.
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const scalarRe = new RegExp(`^${escaped}:\\s*"?([^"\\n]*)"?\\s*$`, 'm')
  const listRe = new RegExp(`^${escaped}:[ \\t]*\\r?\\n((?:[ \\t]+-[^\\n]*\\r?\\n?)+)`, 'm')

  const list = raw.match(listRe)
  if (list) {
    // Items are `  - "value"` or `  - value`. Strip the dash and the quotes; do
    // not try to be a YAML parser.
    return list[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.slice(1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'))
      .filter(v => v.length > 0)
  }

  const scalar = raw.match(scalarRe)
  if (scalar) {
    const v = scalar[1].trim()
    return v === '' ? undefined : v
  }
  return undefined
}

/** Normalise a value for comparison: lists compared as sets, scalars as strings. */
function sameValue(a, b) {
  const norm = v => {
    if (v == null) return null
    if (Array.isArray(v)) return [...new Set(v.map(String))].sort().join('|')
    return String(v)
  }
  return norm(a) === norm(b)
}

/**
 * Resolve a free-text target ("c++", "languages/cplusplus", "C Plus Plus") to a
 * corpus entry.
 *
 * Order matters: an explicit `collection/slug` wins, then an exact name, then a
 * slug, then a slug derived from the text. The last fallback is what makes a
 * bare "Kitten" resolve to `kitten` if that file exists — and *not* resolve if
 * the file is absent, which is the new-entry case.
 */
export function resolveEntry(corpus, target) {
  const t = String(target ?? '').trim()
  if (!t) return null

  const explicit = t.match(/^(languages|paradigms|features|families|generations)\/([a-z0-9-]+)$/i)
  if (explicit) {
    const [, collection, slug] = explicit
    if (collection.toLowerCase() !== 'languages') return null
    return corpus.bySlug.get(slug) ?? null
  }

  const byName = corpus.byName.get(t.toLowerCase())
  if (byName) return byName

  const bySlug = corpus.bySlug.get(t.toLowerCase())
  if (bySlug) return bySlug

  const derived = slugify(t)
  return derived ? (corpus.bySlug.get(derived) ?? null) : null
}

/**
 * Check a proposed correction: the entry exists, the field exists on this
 * collection, the value is legal for that field, and the source is primary.
 */
export function checkCorrection({ entry, field, proposed, sources }) {
  const findings = []
  const vocab = loadVocab()
  const schema = loadSchemaFields().get('languages') ?? new Set()

  const corpus = loadCorpus()
  const target = resolveEntry(corpus, entry)
  if (!target) {
    findings.push({
      code: 'unknown-entry',
      severity: 'error',
      message: `No entry matches "${entry}". A correction needs an existing row; use the new-entry path for a language that is not here yet.`
    })
    return { findings, target: null }
  }

  if (!field) {
    findings.push({
      code: 'missing-field',
      severity: 'error',
      message: 'I could not tell which field this corrects. Name the field, e.g. "memory is wrong".'
    })
    return { findings, target }
  }

  if (!schema.has(field)) {
    findings.push({
      code: 'unknown-field',
      severity: 'error',
      message: `"${field}" is not a field on this collection. Known fields: ${[...schema].join(', ')}.`
    })
  }

  // Vocabulary membership, per axis. Out-of-vocabulary is reported, never
  // coerced: adding a term is a schema decision (taxonomy.ts), not a form entry.
  const axis = AXIS_VOCAB[field]
  if (axis && vocab[axis]) {
    const allowed = new Set(vocab[axis])
    const values = Array.isArray(proposed) ? proposed : [proposed]
    for (const v of values) {
      if (v == null || v === '') continue
      if (!allowed.has(String(v))) {
        findings.push({
          code: 'unknown-value',
          severity: 'error',
          message: `"${v}" is not a ${axis} value. Allowed: ${[...allowed].sort().join(', ')}. A new term is a schema change, so this needs a curator.`
        })
      }
    }
  }

  // Scalar fields must not arrive as lists, and vice versa.
  if (SCALAR_FIELDS.has(field) && Array.isArray(proposed)) {
    findings.push({
      code: 'shape-mismatch',
      severity: 'error',
      message: `"${field}" takes a single value, not a list.`
    })
  }
  if (axis && !SCALAR_FIELDS.has(field) && proposed != null && !Array.isArray(proposed)) {
    findings.push({
      code: 'shape-mismatch',
      severity: 'error',
      message: `"${field}" takes a list of values.`
    })
  }

  if (field === 'year') {
    const n = Number(proposed)
    if (!Number.isInteger(n) || n < 1943 || n > new Date().getFullYear() + 1) {
      findings.push({
        code: 'bad-year',
        severity: 'error',
        message: `"${proposed}" is not a plausible first-release year (1943 or later).`
      })
    }
  }

  // What the entry says right now. Two uses:
  //   - a no-op is reported rather than queued, because `queued` means "there is
  //     work here" and re-applying a value that is already present is not work
  //   - the baseline travels with the verdict, so the apply step can refuse when
  //     someone else changed the field between triage and write (see
  //     .github/skills/suggestion-intake/SKILL.md, write guards)
  const currentValue = readFieldValue(target.raw, field)
  if (proposed != null && sameValue(currentValue, proposed)) {
    findings.push({
      code: 'no-op',
      severity: 'info',
      message: `The entry already reads ${JSON.stringify(proposed)} for \`${field}\`, so there is nothing to change.`
    })
  }

  findings.push(...checkSources(sources))
  return { findings, target, currentValue, field }
}

/**
 * Check a proposed new entry: the name is free, the slug is derivable, and at
 * least one primary source resolves.
 */
export function checkNewEntry({ name, sources, kind }) {
  const findings = []
  const vocab = loadVocab()
  const corpus = loadCorpus()

  if (!name || !String(name).trim()) {
    findings.push({
      code: 'missing-name',
      severity: 'error',
      message: 'I could not find a language name. Send a name or a link and I will take it from there.'
    })
    return { findings, slug: null }
  }

  const clean = String(name).trim()

  // Duplicate check, by name *and* by derived slug. A duplicate `name` crashes
  // the dev build via the UNIQUE index, so this must fail at triage.
  const existing = corpus.byName.get(clean.toLowerCase()) ?? corpus.bySlug.get(slugify(clean))
  if (existing) {
    findings.push({
      code: 'duplicate',
      severity: 'error',
      message: `"${clean}" is already here as /languages/${existing.slug}. Use the correction form if something on that row is wrong.`
    })
  }

  // ASCII guard: `name` is lint-checked ASCII-only, and a name we cannot spell
  // in ASCII needs a curator decision about the conventional transliteration.
  if (!/^[\x20-\x7e]+$/.test(clean)) {
    findings.push({
      code: 'non-ascii-name',
      severity: 'error',
      message: `"${clean}" contains non-ASCII characters. The row's name field is ASCII-only, so this needs a curator to choose the spelling.`
    })
  }

  const slug = slugify(clean)
  if (!slug) {
    findings.push({
      code: 'empty-slug',
      severity: 'error',
      message: `"${clean}" produces an empty URL slug — it is punctuation only. This needs a curator.`
    })
  }

  if (kind && !vocab.KINDS.includes(kind)) {
    findings.push({
      code: 'unknown-kind',
      severity: 'error',
      message: `"${kind}" is not a kind. Allowed: ${vocab.KINDS.join(', ')}.`
    })
  }

  findings.push(...checkSources(sources))
  return { findings, slug }
}

/**
 * Source checks shared by both paths.
 *
 * A lead is not a rejection — the backlog is made of leads. It is a *label*, so
 * the curator knows whether the entry costs one fetch or five.
 */
export function checkSources(sources) {
  const findings = []
  const urls = (sources ?? []).filter(Boolean)

  if (urls.length === 0) {
    findings.push({
      code: 'no-source',
      severity: 'warning',
      message: 'No source yet. The request is still recorded; a curator or the backfill pipeline will need a primary source before facts can be written.'
    })
    return findings
  }

  const primary = urls.filter(u => !isLeadHost(u))
  const leads = urls.filter(u => isLeadHost(u))

  if (primary.length === 0) {
    findings.push({
      code: 'leads-only',
      severity: 'warning',
      message: `Every link is a lead (${leads.map(u => new URL(u).hostname).join(', ')}). That is enough to queue the request, but the entry will need a primary source — project site, spec, or repo.`
    })
  } else {
    findings.push({
      code: 'has-primary-source',
      severity: 'info',
      message: `${primary.length} primary source${primary.length === 1 ? '' : 's'}.`
    })
  }

  for (const url of urls) {
    try {
      const u = new URL(url)
      if (!/^https?:$/.test(u.protocol)) {
        findings.push({ code: 'bad-url', severity: 'error', message: `"${url}" is not an http(s) URL.` })
      }
    } catch {
      findings.push({ code: 'bad-url', severity: 'error', message: `"${url}" is not a valid URL.` })
    }
  }

  return findings
}

/**
 * Classify a proposal into the verdict label §5.2 defines.
 *
 * Ordering is deliberate, and it encodes *who can fix the problem*:
 *
 *   1. a curator-only fix wins (needs-curator) — a non-ASCII name or an
 *      out-of-vocabulary term is a schema/editorial decision, and telling the
 *      submitter to "rephrase" would be asking them to do the owner's job
 *   2. then a duplicate — a real row exists, so the request is answered by
 *      pointing at it
 *   3. then anything else the submitter can resolve (needs-info)
 *   4. otherwise it queues
 *
 * `unknown-field` is deliberately *needs-info*, not needs-curator: the parser
 * failing to name a field is a parse problem, and the submitter can fix it by
 * saying which field they meant. `unknown-value` is the opposite — the field is
 * clear and the term is not in the vocabulary, which is a schema decision.
 */
export function verdictFor(findings, { needsCurator = false } = {}) {
  if (needsCurator) return 'needs-curator'

  const errors = findings.filter(f => f.severity === 'error')
  if (errors.length === 0) return 'queued'

  const codes = new Set(errors.map(f => f.code))
  if (codes.has('non-ascii-name') || codes.has('empty-slug') || codes.has('unknown-value')) {
    return 'needs-curator'
  }
  if (codes.has('duplicate')) return 'duplicate'
  return 'needs-info'
}

/** Render findings as the markdown body of a triage comment. */
export function renderFindings(findings) {
  const icon = { error: '✗', warning: '!', info: '✓' }
  return findings
    .map(f => `${icon[f.severity] ?? '·'} ${f.message}`)
    .join('\n')
}

export { existsSync }
