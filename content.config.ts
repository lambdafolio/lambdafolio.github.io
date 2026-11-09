import { defineContentConfig, defineCollection, property } from '@nuxt/content'
import { z } from 'zod'
// The controlled vocabularies are the single source of truth for the
// enum fields. Importing them here (rather than restating the literals)
// is what makes that comment in app/utils/taxonomy.ts true: adding a
// value there now reaches the schema, the lint, and the Studio form at
// once, with no third place to forget.
import {
  KINDS, STATUSES, GENERATIONS, TYPING, RELATION_KINDS
} from './app/utils/taxonomy'

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
        kind: z.enum(KINDS).optional(),
        status: z.enum(STATUSES).optional(),
        // abstraction tier (1GL machine code … 5GL logic/AI). A CLASSIFICATION
        // enum, not a taxonomy axis: there is deliberately no
        // `content/generations/` collection, because two tiers have no members
        // in this corpus and their pages could never list one — see the
        // GENERATIONS comment in app/utils/taxonomy.ts for the promotion rule.
        generation: z.enum(GENERATIONS).optional(),
        // NB: `.int()` would emit JSON Schema `type: "integer"`, which Content's
        // column map doesn't recognize (number -> INT only) -> TEXT column.
        // Integrality is enforced by lint-frontmatter.mjs instead.
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        paradigms: z.array(z.string()).optional(),
        // lineage (docs/knowledgebase-plan.md §3b): the ONE family this
        // language descends from, as a `families` join key. Orthogonal to
        // `paradigms` (what it does) and `kind` (what sort of artifact it is).
        // Scalar on purpose — the family page derives its members by exact
        // match, while the paradigm join needs a LIKE over a JSON-text array.
        // A second family belongs on the family page as a `derived-from` edge.
        family: z.string().optional(),
        // technical profile (vocab linted)
        typing: z.enum(TYPING).optional(),
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
          kind: z.enum(RELATION_KINDS)
        })).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // unique: DB-level duplicate-name guarantee; also serves ORDER BY name
        { columns: ['name'], unique: true },
        // scalar axes for server-side where()/order() (phase-2 index);
        // JSON-text array columns are deliberately not indexed
        { columns: ['year'] },
        { columns: ['kind'] },
        // the family join is an exact equality, so it can use an index
        { columns: ['family'] },
        // reserved for the phase-2 facet/server-side where() when (and only
        // when) generation earns a filter axis
        { columns: ['generation'] }
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
        status: z.enum(STATUSES).optional(),
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        // defining characteristics (free-form; e.g. "inheritance",
        // "message-passing"). A paradigm has no single typing discipline or
        // memory model — those belong to the languages that adopt it.
        features: z.array(z.string()).optional(),
        // relations to other paradigms (kind from the same vocabulary the
        // languages collection uses; names are paradigm keys)
        relations: z.array(z.object({
          name: z.string().min(1),
          kind: z.enum(RELATION_KINDS)
        })).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // unique: mirrors the languages collection — one page per paradigm,
        // and the paradigm key must be unique corpus-wide
        { columns: ['name'], unique: true },
        { columns: ['paradigm'], unique: true }
      ]
    }),

    /**
     * Families: one page per language family (docs/knowledgebase-plan.md §3b),
     * the third concept collection alongside `paradigms` and `features`.
     *
     * A family is LINEAGE — "what does this language descend from?" — which is
     * orthogonal to `paradigms` (what it does) and to `kind` (what sort of
     * artifact a row is). It is deliberately NOT a `kind` value: a family is a
     * group of rows, so giving it `kind: family` would inject non-language
     * pseudo-rows into the index, the compare matrix, and every facet.
     *
     * As with paradigms and features, the file name IS the key
     * (`families/smalltalk.md`), the `family` field repeats it, and the member
     * languages are DERIVED at build time from the languages collection via an
     * exact `family` equality — never stored, so the list cannot go stale.
     *
     * Note the intended name collision: `smalltalk` and `ecmascript` name a
     * family page *and* a language row. That is correct — the family is the
     * group its namesake belongs to.
     */
    families: defineCollection({
      type: 'page',
      // default prefix = static part of include → path /families/<slug>,
      // matching app/pages/families/[slug].vue
      source: 'families/*.md',
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
        family: z.string().min(1),
        // lifecycle of the lineage, not of any one member
        status: z.enum(STATUSES).optional(),
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        // what the members share (free-form; e.g. "message-passing",
        // "image-based persistence"). A family has no single typing
        // discipline or memory model — those belong to its members.
        features: z.array(z.string()).optional(),
        // relations to OTHER families (kind from the same vocabulary the
        // languages collection uses; names are family keys)
        relations: z.array(z.object({
          name: z.string().min(1),
          kind: z.enum(RELATION_KINDS)
        })).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // one page per family; the key must be unique corpus-wide and is the
        // value language entries carry in their `family:` field
        { columns: ['name'], unique: true },
        { columns: ['family'], unique: true }
      ]
    }),

    /**
     * Generations: one page per programming-language generation (1GL…5GL),
     * the sibling collection to `families` on the *abstraction* axis.
     *
     * This collection exists to settle a question the `generation:` enum on a
     * language entry cannot answer: **what does each tier denote?** The enum
     * records a value; the page records the membership criterion, whether the
     * tier is a live category or a historical framing, and the primary sources
     * that define it. That is the contested part — "is SQL 4GL?", "is Prolog
     * 4GL or 5GL?" — and it gets one authoritative answer per tier here rather
     * than being re-argued in every language entry.
     *
     * Deliberately NOT the FAMILIES/FEATURES pattern in two respects:
     *
     *  - **No promotion threshold.** The ladder is a closed canonical five;
     *    the tiers are not discovered from the corpus the way families and
     *    features are. Requiring N members would forbid pages for `1gl`/`2gl`,
     *    which have no members here at all — yet those are exactly the tiers
     *    whose definitions need writing down.
     *  - **No `relations`.** Generations form a ladder, not a lineage graph;
     *    `derived-from`/`supersedes` edges between tiers would invent a
     *    genealogy the sources do not claim.
     *
     * Members are still DERIVED at build time (an exact `generation` equality
     * on the languages collection), never stored — same anti-staleness rule as
     * the other concept collections. The file name IS the key
     * (`generations/4gl.md`) and the `generation` field repeats it.
     */
    generations: defineCollection({
      type: 'page',
      // default prefix = static part of include → path /generations/<slug>,
      // matching app/pages/generations/[slug].vue
      source: 'generations/*.md',
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
        generation: z.string().min(1),
        // lifecycle OF THE TIER, not of any language: `historical` is the
        // honest value for a framing that is no longer a live category
        status: z.enum(STATUSES).optional(),
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        // the membership criterion — what qualifies a language as this tier.
        // This IS the definition, the same role `features` plays on a
        // paradigm page; a tier without them is still undefined.
        features: z.array(z.string()).optional(),
        note: z.string().optional()
      }),
      indexes: [
        // one page per tier; the key is what a language entry carries in its
        // `generation:` field, so it must be unique corpus-wide
        { columns: ['name'], unique: true },
        { columns: ['generation'], unique: true }
      ]
    }),

    /**
     * Features: one page per *promoted* language feature, sibling to
     * `paradigms` and `languages`.
     *
     * `features` on a language entry stays a free-form long tail (a tag for
     * cards, facets and search). Only the curated subset listed in FEATURES
     * (app/utils/taxonomy.ts) is promoted to a page here: a feature earns one
     * when at least FEATURE_PROMOTION_THRESHOLD corpus entries declare it, so
     * a page always has several real members to talk about.
     *
     * As with paradigms, the file name IS the key (`features/closures.md`),
     * the `feature` field repeats it, and the member languages are DERIVED at
     * build time from the languages collection — never stored.
     */
    features: defineCollection({
      type: 'page',
      source: 'features/*.md',
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
        // the taxonomy key — must equal the file name (the join key)
        feature: z.string().min(1),
        // lifecycle of the mechanism (not of a language)
        status: z.enum(STATUSES).optional(),
        year: z.number().min(1943).max(new Date().getFullYear() + 1).optional(),
        // mechanisms this feature is usually composed with (free-form tags;
        // promoted ones resolve to sibling feature pages)
        relates_to: z.array(z.string()).optional(),
        note: z.string().optional()
      }),
      indexes: [
        { columns: ['name'], unique: true },
        { columns: ['feature'], unique: true }
      ]
    })
  }
})