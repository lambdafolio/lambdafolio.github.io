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
 * Whether a page body has renderable content.
 *
 * A `page` collection always ships a body object; a scaffold stub renders one
 * paragraph (`TODO: Write the wiki article for …`). Only the latter should be
 * replaced by the "no article yet" callout, so this checks for actual nodes
 * rather than the body object's presence.
 */
export function hasRenderableBody(entry: { body?: unknown } | null | undefined): boolean {
  const value = (entry?.body as { value?: unknown[] } | undefined)?.value
  return Array.isArray(value) && value.length > 0
}

/** GitHub edit URL for a content entry — the "Maintain" rail link. */
export function entryEditUrl(collection: string, slug: string | string[] | undefined): string {
  return `https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/${collection}/${slug}.md`
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
