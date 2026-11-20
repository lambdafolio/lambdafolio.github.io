/**
 * Derived corpus backlog (docs/suggestion-intake-plan.md §8, mockup 04).
 *
 * The ordering here is *computed from corpus state*, never stored. There is no
 * "in progress" column to forget to update and no per-stub issue to close: the
 * table is a view over the entries that already exist, so it cannot drift.
 *
 * This module is pure — it takes entry rows and returns ranked rows. The page
 * (`app/pages/backlog.vue`) owns presentation, and a test
 * (`app/utils/backlog.test.mjs`) owns the queue and scoring contract.
 */
import { hasRenderableBody } from './entries.ts'

/**
 * The fact fields a complete language row is expected to carry.
 *
 * `name` is excluded (required by the schema, so it is never missing) and so is
 * `note` (prose is tracked separately via the body, and a stub has no note by
 * construction). Ordered by how much a reader notices the absence: a language
 * with no homepage is unfollowable, while a missing `concurrency` value is a
 * gap most readers never hit.
 */
export const FACT_FIELDS = [
  'homepage',
  'year',
  'paradigms',
  'family',
  'typing',
  'memory',
  'execution'
] as const

export type FactField = typeof FACT_FIELDS[number]

/** Human-facing label per fact field, so the table never prints a snake_case key. */
const FIELD_LABELS: Record<FactField, string> = {
  homepage: 'homepage',
  year: 'year',
  paradigms: 'paradigms',
  family: 'family',
  typing: 'typing',
  memory: 'memory',
  execution: 'execution'
}

/**
 * Queues, in the order work should happen. Queue D from an earlier draft
 * ("net-new eligible", fed by PLDB ranks) is deliberately absent: PLDB is
 * retired (§3), so a language that is not in the corpus arrives as an *issue*
 * with a submitter and a source, which is better provenance than an import —
 * it does not belong in a ranking of existing rows.
 */
export const QUEUES = [
  {
    id: 'A',
    label: 'Queue A — prose, missing facts',
    blurb: 'readable entries first',
    nextStep: 'fill the facts, keep the prose'
  },
  {
    id: 'B',
    label: 'Queue B — stub with a homepage',
    blurb: 'the URL is known, so no search is needed',
    nextStep: 'research from the homepage'
  },
  {
    id: 'C',
    label: 'Queue C — stub, no homepage',
    blurb: 'needs a source before anything else',
    nextStep: 'find a primary source first'
  }
] as const

export type QueueId = typeof QUEUES[number]['id']

/** The subset of a language row this module reads. */
export interface BacklogEntry {
  name: string
  path: string
  year?: number | null
  homepage?: string | null
  urls?: string[] | null
  references?: { url: string, title: string }[] | null
  paradigms?: string[] | null
  family?: string | null
  typing?: string | null
  memory?: string[] | null
  execution?: string[] | null
  /** The parsed body — see `hasRenderableBody`; this is what separates stub from prose. */
  body?: unknown
}

export interface BacklogRow {
  name: string
  path: string
  year: number | null
  /** Fact field labels still empty on this entry, in `FACT_FIELDS` order. */
  missing: string[]
  queue: QueueId
  /** What to do next, from the queue definition. */
  nextStep: string
  /** How many distinct sources the entry already cites. */
  sources: number
  hasProse: boolean
  hasHomepage: boolean
}

/** Whether a fact field is empty on this entry. */
function isMissing(entry: BacklogEntry, field: FactField): boolean {
  switch (field) {
    case 'homepage':
      return !entry.homepage
    case 'year':
      return entry.year === null || entry.year === undefined
    case 'family':
      return !entry.family
    case 'typing':
      return !entry.typing
    // Array-valued facts: empty and absent mean the same thing here.
    case 'paradigms':
    case 'memory':
    case 'execution':
      return !(entry[field] as string[] | null | undefined)?.length
  }
}

/** Fact labels still empty on this entry. */
export function missingFields(entry: BacklogEntry): string[] {
  return FACT_FIELDS.filter(f => isMissing(entry, f)).map(f => FIELD_LABELS[f])
}

/** Distinct sources an entry already cites (homepage, urls, references). */
export function sourceCount(entry: BacklogEntry): number {
  const urls = new Set<string>()
  if (entry.homepage) urls.add(entry.homepage)
  for (const url of entry.urls ?? []) urls.add(url)
  for (const ref of entry.references ?? []) urls.add(ref.url)
  return urls.size
}

/**
 * Which queue an entry belongs to.
 *
 * Prose first: an entry someone can already read is worth finishing before one
 * that is a bare data row. Within stubs, a known homepage removes the search
 * step entirely, so it is strictly cheaper than a stub without one.
 */
export function queueFor(entry: BacklogEntry): QueueId {
  if (hasRenderableBody(entry)) return 'A'
  return entry.homepage ? 'B' : 'C'
}

/**
 * Rank the whole corpus.
 *
 * Sorted by queue, then by how much is missing (descending), then by name.
 *
 * There is deliberately no "score" column. §8 specified one —
 * `(prose ? 3 : 1) × 1/ln(rank + 2) × missingCount` — but `rank` was PLDB's
 * salience, and PLDB is retired, so the term is always `0` and `1/ln(2)` became
 * a constant. Measured across the 729 real rows, the formula reduced to exactly
 * two ratios (`1/ln2` for stubs, `3/ln2` for prose) — i.e. `k × missingCount`,
 * where `k` encodes only the queue. It restated the queue and the MISSING
 * column in a third place while ranking no two rows that those columns did not
 * already order, so it was dropped rather than displayed as if it meant
 * something.
 *
 * What actually orders the table is the two facts that were always doing the
 * work: readable entries before data rows (the queue), and the most incomplete
 * entries first within them. The name tiebreak keeps the order stable between
 * builds, so the table does not reshuffle on every regeneration for reasons no
 * reader can see.
 *
 * If prioritisation should ever mean more than "most incomplete first", the
 * signal §8 pointed at is *demand* — how many issues reference an entry. That
 * needs the GitHub API, so it cannot be computed at build time on a static
 * site; it would arrive as a committed file written by a scheduled workflow.
 */
export function backlogRows(entries: BacklogEntry[]): BacklogRow[] {
  const queueIndex = new Map(QUEUES.map((q, i) => [q.id, i]))

  return entries
    .map((entry) => {
      const queue = queueFor(entry)
      const def = QUEUES.find(q => q.id === queue)!
      return {
        name: entry.name,
        path: entry.path,
        year: entry.year ?? null,
        missing: missingFields(entry),
        queue,
        nextStep: def.nextStep,
        sources: sourceCount(entry),
        hasProse: hasRenderableBody(entry),
        hasHomepage: Boolean(entry.homepage)
      }
    })
    .sort((a, b) => {
      const byQueue = queueIndex.get(a.queue)! - queueIndex.get(b.queue)!
      if (byQueue !== 0) return byQueue
      // Most incomplete first. This is the whole ordering rule; there is no
      // hidden third term.
      if (b.missing.length !== a.missing.length) return b.missing.length - a.missing.length
      return a.name.localeCompare(b.name)
    })
}

/** Row counts per queue, in `QUEUES` order, including queues with zero rows. */
export function queueCounts(rows: BacklogRow[]): { id: QueueId, label: string, blurb: string, count: number }[] {
  return QUEUES.map(q => ({
    id: q.id,
    label: q.label,
    blurb: q.blurb,
    count: rows.filter(r => r.queue === q.id).length
  }))
}
