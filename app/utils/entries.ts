/**
 * Shared entry-page logic for the five content collections (languages,
 * paradigms, families, features, generations).
 *
 * Every one of those pages renders the same shape — header, prose, derived
 * member list, stat rail, sources — over rows that carry the same reference
 * fields. The pieces that were byte-identical in all five live here so a fix
 * (a broken reference label, a new edit URL) is one edit, not five.
 *
 * Deliberately pure: no `useRoute`, no `queryCollection`. The pages own their
 * queries and pass rows in, which keeps these functions unit-testable and lets
 * the pages stay readable about what they actually fetch.
 */

export interface ContentReference {
  url: string
  title: string
}

/** The reference-bearing subset of frontmatter every collection shares. */
export interface ReferenceBearing {
  homepage?: string | null
  urls?: string[] | null
  references?: ContentReference[] | null
}

export interface ReferenceRow {
  url: string
  title: string
  host: string
}

/** Host without the `www.` prefix; the URL itself when it does not parse. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * A readable title for a reference that has no authored one.
 *
 * Uses the first label of the host (`craftinginterpreters.com` ->
 * `Craftinginterpreters`). Previously each page re-derived this and two
 * variants disagreed — one printed the bare host as both title and subtitle.
 */
export function referenceTitle(url: string): string {
  const host = hostOf(url)
  const label = host.split('.')[0]
  if (!label) return host
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * The full reference list, deduplicated and ordered: homepage first (labelled
 * "Official site"), then authored `references`, then bare `urls`.
 *
 * The ordering is the contract, not incidental: the homepage is the entry's
 * canonical link and every page shows it the same way.
 */
export function buildReferenceList(entry: ReferenceBearing | null | undefined): ReferenceRow[] {
  if (!entry) return []
  const out: ReferenceRow[] = []
  const seen = new Set<string>()

  if (entry.homepage) {
    out.push({ url: entry.homepage, title: 'Official site', host: hostOf(entry.homepage) })
    seen.add(entry.homepage)
  }
  for (const ref of entry.references ?? []) {
    if (seen.has(ref.url)) continue
    seen.add(ref.url)
    out.push({ url: ref.url, title: ref.title, host: hostOf(ref.url) })
  }
  for (const url of entry.urls ?? []) {
    if (seen.has(url)) continue
    seen.add(url)
    out.push({ url, title: referenceTitle(url), host: hostOf(url) })
  }
  return out
}

/**
 * Bodies that are *exactly* the scaffold seed, and nothing else.
 *
 * Kept in step with `TODO_RE` in `scripts/lint-body.mjs`, which exempts these
 * from the "body too thin" rule for the same reason: they are placeholders, not
 * prose. Anchored on both ends so a stub that has since grown real content no
 * longer matches — that page renders normally, seed paragraph included, which
 * is the signal to a writer that the seed is still there to delete.
 */
const SEED_RE = /^TODO: Write the wiki article for .+\.$/

/**
 * Flatten a single minimark node into the text a reader would actually see.
 *
 * A node is `[tag, props, ...children]`, where children are either further
 * elements or bare strings. Emphasis is an element node, so the seed's
 * `**Haskell**` never appears literally in the tree — comparing against the raw
 * source text cannot work, and the text has to be reassembled first.
 *
 * This takes ONE node. The body's `value` is a *list* of nodes, so it must go
 * through `bodyTextOfList` — calling this on the list itself would read node
 * `[0]` as a tag and node `[1]` as its props, silently dropping the first two
 * paragraphs of every multi-block entry.
 */
function bodyText(node: unknown): string {
  if (typeof node === 'string') return node
  if (!Array.isArray(node)) return ''
  return node
    .slice(2)
    .map(bodyText)
    .join('')
}

/** Flatten a body's `value` — a list of top-level nodes — into one string. */
function bodyTextOfList(nodes: unknown[]): string {
  return nodes.map(bodyText).join('')
}

/**
 * Whether a page body has content worth rendering.
 *
 * Nuxt Content gives every `page` entry a body object, so presence proves
 * nothing. A scaffold stub's body is one paragraph of seed text; that is what
 * the "no article yet" callout replaces. Everything else is real content.
 */
export function hasRenderableBody(entry: { body?: unknown } | null | undefined): boolean {
  const value = (entry?.body as { value?: unknown[] } | undefined)?.value
  if (!Array.isArray(value) || value.length === 0) return false

  const text = bodyTextOfList(value).trim()
  if (text.length === 0) return false
  return !SEED_RE.test(text)
}

/**
 * SEO description for an entry, with the scaffold seed treated as absent.
 *
 * Nuxt Content derives `description` from the first body paragraph when the
 * frontmatter omits one, so a stub's seed text would otherwise become the page's
 * `<meta name="description">` — visible in search results and link previews,
 * where an editorial placeholder reads as a broken page. `note` is authored and
 * wins; the caller supplies a factual fallback for pages that have neither.
 */
export function entryDescription(
  entry: { note?: unknown; description?: unknown } | null | undefined,
  fallback: string
): string {
  for (const candidate of [entry?.note, entry?.description]) {
    if (typeof candidate !== 'string') continue
    const text = candidate.trim()
    // `description` is derived, so it can be the seed; `note` is authored, but
    // checking both keeps the predicate in one place if that ever changes.
    if (text.length > 0 && !SEED_RE.test(text)) return text
  }
  return fallback
}

/** GitHub edit URL for a content entry — the "Maintain" rail link. */
export function entryEditUrl(collection: string, slug: string | string[] | undefined): string {
  return `https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/${collection}/${slug}.md`
}

/**
 * Site route that opens the correction form with a target pre-encoded.
 *
 * Why route through the site rather than link GitHub directly: the form derives
 * the entry/field/value, echoes back what it understood, and only then queues.
 * A direct "edit on GitHub" link skips the parse and the confirmation, so it is
 * a *different* affordance, not a replacement — both stay on the rail.
 *
 * `field` is a hint for the parser, not an instruction to it: the parser re-reads
 * the visitor's text and may disagree (e.g. they typed about a different field).
 */
export function entrySuggestUrl(
  collection: string,
  slug: string | string[] | undefined,
  field?: string | null
): string {
  const params = new URLSearchParams({ entry: `${collection}/${slug}` })
  if (field) params.set('field', field)
  return `/suggest?${params.toString()}`
}

/**
 * Human labels for the typed relation vocabulary (app/utils/taxonomy.ts
 * RELATION_KINDS). Unknown kinds fall back to the raw key so adding a kind
 * without a label degrades to the identifier instead of throwing.
 */
export const EDGE_LABELS: Record<string, string> = {
  'derived-from': 'Derived from',
  'influenced-by': 'Influenced by',
  'shares-ancestor-with': 'Shares ancestor with',
  'forked-from': 'Forked from',
  'standardized-as': 'Standardized as',
  'dialect-of': 'Dialect of',
  supersedes: 'Supersedes',
  'implemented-in': 'Implemented in',
  'transpiles-to': 'Transpiles to',
  'interoperates-with': 'Interoperates with'
}

export interface TypedRelation {
  name: string
  kind: string
}

/**
 * Group typed relation edges by kind, preserving vocabulary order within a
 * kind and dropping empty groups. The rail renders one row per group.
 */
export function groupTypedRelations(
  edges: TypedRelation[] | null | undefined
): { label: string, names: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const edge of edges ?? []) {
    if (!groups.has(edge.kind)) groups.set(edge.kind, [])
    groups.get(edge.kind)!.push(edge.name)
  }
  return [...groups.entries()].map(([kind, names]) => ({
    label: EDGE_LABELS[kind] ?? kind,
    names
  }))
}
