/**
 * Nitro plugin: build the RSS 2.0 feed at /feed.xml.
 *
 * The corpus has no blog and no changelog, so the feed reports what the site is
 * actually about: one item per *page* whose content changed, newest first —
 * languages, paradigms, families, features, generations. That is what a reader
 * following the atlas wants to know, and it needs no per-entry upkeep because
 * the ordering comes from git (`contentCommitDates` in nuxt.config.ts).
 *
 * Descriptions come from the entry's `note` when it has one, otherwise from a
 * generated fact summary (paradigms/typing/family/year) or the page body, so a
 * sparse stub still yields a usable line instead of an empty item.
 *
 * The collection list mirrors `content.config.ts`; a new collection is a
 * one-line addition here.
 */
import type { Feed } from 'nuxt-module-feed'

interface FeedPage {
  path?: string | null
  title?: string | null
  name?: string | null
  note?: string | null
  kind?: string | null
  status?: string | null
  year?: number | null
  family?: string | null
  generation?: string | null
  typing?: string | null
  paradigms?: string[] | null
  features?: string[] | null
  body?: unknown
}

/** Collections contributing items, with the label prefixing each item title. */
const COLLECTIONS = [
  { name: 'languages', label: 'Language' },
  { name: 'paradigms', label: 'Paradigm' },
  { name: 'families', label: 'Family' },
  { name: 'features', label: 'Feature' },
  { name: 'generations', label: 'Generation' }
] as const

/** Items published per feed. The corpus gains a handful of pages per session. */
const MAX_ITEMS = 40

/**
 * Placeholder for the request event `queryCollection` declares as required.
 *
 * Content's server helper forwards the event's headers to its own SQL endpoint,
 * but explicitly supports being called without one: it then uses Nitro's global
 * `$fetch`, which Nitro binds to the app's local fetch. A build-time hook has no
 * event to forward, so this is the supported path.
 */
const NO_EVENT = undefined as unknown as Parameters<typeof queryCollection>[0]

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: { feed: Feed, options: { path: string } }) => {
    if (options.path !== '/feed.xml') return

    const config = useRuntimeConfig()
    const origin = String(config.siteUrl ?? '').replace(/\/$/, '')
    const link = `${origin}/`
    const dates = (config.contentDates ?? {}) as Record<string, string>
    const fallbackDate = String(config.contentDateFallback ?? new Date().toISOString())

    feed.options = {
      id: link,
      title: 'LambdaFolio',
      description: 'A programming-language atlas: normalized facts, influences, and paradigms.',
      copyright: 'LambdaFolio contributors',
      link,
      language: 'en-US',
      // Absolute self-link: a reader that opens the XML directly otherwise
      // cannot resolve relative links, and validators flag it as missing.
      feed: `${origin}/feed.xml`,
      // Matches `cacheTime` in nuxt.config.ts.
      ttl: 15
    }

    // The hook signature carries no request event (`{ feed, options }` only),
    // and Nuxt Content's `queryCollection` needs one to reach its SQL endpoint.
    // Reading it back out of Nitro's async context (`useEvent()`) would mean
    // enabling the experimental `nitro.experimental.asyncContext` flag, which
    // changes runtime semantics site-wide for one build-time query. Omitting the
    // event is supported instead: `fetchQuery` then falls back to Nitro's global
    // `$fetch`, which is bound to the app's own local fetch.
    const pages = (await Promise.all(
      COLLECTIONS.map(async ({ name, label }) => {
        const rows = await queryCollection(NO_EVENT, name).all() as FeedPage[]
        return rows.map(row => ({ row, label }))
      })
    )).flat()

    const items = pages
      .map(({ row, label }) => {
        // `path` is the collection route (`/languages/lox`); the git map never
        // carries a trailing slash, so normalize before the join.
        const path = String(row.path ?? '').replace(/\/$/, '')
        if (!path) return null
        const title = row.title ?? row.name ?? label
        return {
          title: `${label}: ${title}`,
          path,
          description: describe(row, label),
          date: new Date(dates[path] ?? fallbackDate)
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, MAX_ITEMS)

    for (const item of items) {
      feed.addItem({
        title: item.title,
        id: `${origin}${item.path}`,
        link: `${origin}${item.path}`,
        description: item.description,
        date: item.date
      })
    }

    // Follow the newest item rather than "now", so a rebuild that changed
    // nothing does not announce the whole site as updated.
    if (items[0]) feed.options.updated = items[0].date
  })
})

/**
 * One-line summary for an item.
 *
 * Preference order: authored `note` (what a human wrote) → derived fact summary
 * (what the schema knows) → page prose → the entry name. A stub always lands on
 * one of those, so no item ships an empty description.
 */
function describe(page: FeedPage, label: string): string {
  const note = page.note?.trim()
  if (note) return note

  const facts: string[] = []
  if (page.year) facts.push(`first appeared ${page.year}`)
  if (page.paradigms?.length) facts.push(page.paradigms.join(', '))
  if (page.typing) facts.push(`${page.typing}ly typed`)
  if (page.family) facts.push(`part of the ${page.family} family`)
  if (page.generation) facts.push(`${page.generation} tier`)
  if (page.features?.length) facts.push(page.features.slice(0, 4).join(', '))
  if (page.kind) facts.push(`a ${page.kind}`)
  if (page.status) facts.push(page.status)
  if (facts.length) return facts.join('; ')

  const prose = plainText(page.body)
  if (prose) return prose

  // Nothing authored yet (a scaffold stub): say so plainly rather than repeat
  // the title. `label` is the collection ("Language", "Paradigm", …).
  const name = page.name ?? page.title ?? 'entry'
  return `${label} entry for ${name} — facts recorded, article not yet written.`
}

/**
 * Flatten a Content page body to text for the fallback description.
 *
 * The stored body is a serialized Minimark tree: `{ type: 'minimark', value }`
 * where `value` is a list of nodes and each node is either a string or
 * `[tagName, attributes, ...children]`. Markdown's inline markers are already
 * split out as their own nodes (`["strong", {}, "Lox"]`), so collecting a node's
 * STRING children while skipping the tag name and attribute object yields clean
 * prose. The walker stays defensive about shape because that is an internal
 * Content representation, not a published format.
 */
function plainText(body: unknown, limit = 280): string {
  const root = body && typeof body === 'object' && 'value' in body
    ? (body as { value: unknown }).value
    : body

  const parts: string[] = []
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      parts.push(node)
      return
    }
    if (Array.isArray(node)) {
      // `[tag, attrs, ...children]` — skip the tag name and the attribute object
      // (position 0 and, when present, position 1). Everything else is content.
      const start = typeof node[0] === 'string' ? 2 : 0
      for (const child of node.slice(start)) walk(child)
      return
    }
    if (node && typeof node === 'object') {
      const rec = node as Record<string, unknown>
      if ('value' in rec) walk(rec.value)
      if ('children' in rec) walk(rec.children)
    }
  }
  walk(root)

  const text = parts.join('').replace(/\s+/g, ' ').trim()
  // `TODO: Write the wiki article for **X**.` is the scaffold stub, not prose.
  if (!text || text.startsWith('TODO:')) return ''
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text
}