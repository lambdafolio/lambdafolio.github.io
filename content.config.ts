import { defineContentConfig, defineCollection, property } from '@nuxt/content'
import { z } from 'zod'

/**
 * The languages collection is the single source of truth for the wiki.
 *
 * One Markdown page per language in `content/languages/`; the frontmatter is a
 * fixed, normalized fact contract (docs/knowledgebase-plan.md §2). The Zod
 * schema is intentionally permissive on the vocab axes (string enums/arrays,
 * not `z.enum`) — membership is enforced by scripts/lint-frontmatter.mjs against
 * app/utils/taxonomy.ts so new values are a one-line addition, and Studio
 * authoring stays ergonomic. The lint also rejects unknown fields here.
 *
 * NOTE: arrays (`urls`, `paradigms`, …) are persisted as JSON text columns by
 * the Content database; containment queries use `LIKE` (client-side faceting is
 * the primary tool at this scale).
 *
 * The `paradigms` collection is the sibling concept: one Markdown page per
 * programming paradigm in `content/paradigms/`. A paradigm's file name IS its
 * taxonomy key (`paradigms/object-oriented.md`), and the `paradigm` field
 * repeats that key so the join is explicit and queryable — language entries
 * list paradigms by that exact vocabulary value, so the two collections join
 * without a mapping table. Member languages are NOT stored here: they are
 * derived at build time from the languages collection (docs/knowledgebase-plan.md
 * §3), so a member list can never go stale.
 */
export default defineContentConfig({
  collections: {
    languages: defineCollection({
      type: 'page',
      // default prefix = static part of include → path /languages/<slug>,
      // matching app/pages/languages/[slug].vue
      source: 'languages/*.md',
      schema: z.object({
        // identity
        name: z.string().min(1),
        homepage: z.string().optional(),
        urls: z.array(z.string()).optional(),
        // titled references (preferred over `urls` for curated entries);
        // `urls` stays the simple authoring path, `references` carries labels
        references: z.array(z.object({
          url: z.string().min(1),
          title: z.string().min(1)
        })).optional(),
        // editor metadata drives the dev-Studio form (media picker); no
        // runtime effect on the dump or queries
        logo: property(z.string().optional()).editor({ input: 'media' }),
        author: z.string().optional(),
        // classification
        kind: z.enum(['language', 'family', 'dialect', 'notation']).optional(),
        status: z.enum(['active', 'experimental', 'dormant', 'historical']).optional(),
        // NB: `.int()` would emit JSON Schema `type: "integer"`, which Content's
        // column map doesn't recognize (number -> INT only) -> TEXT column.
        // Integrality is enforced by lint-frontmatter.mjs instead.
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        paradigms: z.array(z.string()).optional(),
        // technical profile (vocab linted)
        typing: z.enum(['untyped', 'dynamic', 'static', 'gradual']).optional(),
        type_system: z.array(z.string()).optional(),
        memory: z.array(z.string()).optional(),
        execution: z.array(z.string()).optional(),
        concurrency: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        // relations
        influences: z.array(z.string()).optional(),
        influenced: z.array(z.string()).optional(),
        // typed directional edges (docs/knowledgebase-plan.md §7): entries
        // list OTHER languages; lint validates kind + name resolution
        relations: z.array(z.object({
          name: z.string().min(1),
          kind: z.enum([
            'derived-from', 'influenced-by', 'shares-ancestor-with', 'forked-from',
            'standardized-as', 'dialect-of', 'supersedes', 'implemented-in',
            'transpiles-to', 'interoperates-with'
          ])
        })).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // unique: DB-level duplicate-name guarantee; also serves ORDER BY name
        { columns: ['name'], unique: true },
        // scalar axes for server-side where()/order() (phase-2 index);
        // JSON-text array columns are deliberately not indexed
        { columns: ['year'] },
        { columns: ['kind'] }
      ]
    }),

    /**
     * Paradigms: one page per programming paradigm, sibling to `languages`.
     *
     * The file name IS the taxonomy key (`paradigms/object-oriented.md`) and
     * the `paradigm` field repeats it, so the join with the languages
     * collection is exact: language entries carry `paradigms: ["<key>"]` and
     * the member list is derived at build time (never hand-maintained).
     *
     * Member languages are deliberately NOT a field here — a stored list would
     * go stale the moment a language entry changes. The paradigm page
     * computes its members from the languages collection instead.
     */
    paradigms: defineCollection({
      type: 'page',
      // default prefix = static part of include → path /paradigms/<slug>,
      // matching app/pages/paradigms/[slug].vue
      source: 'paradigms/*.md',
      schema: z.object({
        // identity
        name: z.string().min(1),
        homepage: z.string().optional(),
        urls: z.array(z.string()).optional(),
        references: z.array(z.object({
          url: z.string().min(1),
          title: z.string().min(1)
        })).optional(),
        logo: property(z.string().optional()).editor({ input: 'media' }),
        author: z.string().optional(),
        // the taxonomy key — must equal the file name (the join key)
        paradigm: z.string().min(1),
        // lifecycle
        status: z.enum(['active', 'experimental', 'dormant', 'historical']).optional(),
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        // defining characteristics (free-form; e.g. "inheritance",
        // "message-passing"). A paradigm has no single typing discipline or
        // memory model — those belong to the languages that adopt it.
        features: z.array(z.string()).optional(),
        // relations to other paradigms (kind from the same vocabulary the
        // languages collection uses; names are paradigm keys)
        relations: z.array(z.object({
          name: z.string().min(1),
          kind: z.enum([
            'derived-from', 'influenced-by', 'shares-ancestor-with', 'forked-from',
            'standardized-as', 'dialect-of', 'supersedes', 'implemented-in',
            'transpiles-to', 'interoperates-with'
          ])
        })).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // unique: mirrors the languages collection — one page per paradigm,
        // and the paradigm key must be unique corpus-wide
        { columns: ['name'], unique: true },
        { columns: ['paradigm'], unique: true }
      ]
    })
  }
})