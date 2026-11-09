/**
 * Controlled vocabularies for the language fact axes (docs/knowledgebase-plan.md
 * §2). Single source of truth: consumed by `content.config.ts` (docs for
 * Studio forms), `scripts/lint-frontmatter.mjs` (build lint), and the UI
 * (facet chips / comparison matrix). The Zod schema keeps array fields
 * permissive; the lint enforces membership so a misspelled value has a
 * one-line fix — its own canonical spelling here.
 *
 * Adding a value: append it here, then `npm run lint:frontmatter` to find
 * entries needing normalization. Values are lowercase kebab/snake as written.
 *
 * Note the tier difference for the two "concept" vocabularies: PARADIGMS is
 * closed (every value has a page in content/paradigms/), while FEATURES is
 * only the *promoted* subset of the free-form `features` tags — see §3a of
 * the plan and the FEATURES block below.
 */

// `standard` exists because a spec is a real row (ECMA-262 is not a dialect
// of anything): ECMAScript was previously forced into `dialect`.
// `family` was removed when languages got a first-class `family:` axis +
// content/families/ collection — a family is a GROUP of rows, not a row kind.
export const KINDS = ['language', 'standard', 'dialect', 'notation'] as const

export const STATUSES = ['active', 'experimental', 'dormant', 'historical'] as const

/**
 * Programming-language generations — a closed five-tier ladder with a page
 * per tier.
 *
 * The 1GL–5GL framing describes *abstraction height*: machine code, assembly,
 * high-level, declarative/4GL, logic/AI. Unlike FAMILIES and FEATURES the
 * vocabulary is not discovered from the corpus — the ladder is the canonical
 * five — so every value has a page in `content/generations/` (file name = key,
 * `generation` repeats it) regardless of how many language entries carry it.
 * There is deliberately NO promotion threshold: `1gl` and `2gl` have no
 * members in this corpus at all, and those are exactly the tiers whose
 * definitions still need writing down.
 *
 * The page, not the enum, is where a tier is DEFINED — its `features` carry
 * the membership criterion, its `status` says whether the tier is a live
 * category or a historical framing, and its `references` cite the primary
 * sources. That is what settles the contested cases ("is SQL 4GL?", "is
 * Prolog 4GL or 5GL?") once, in one place, instead of re-arguing them in every
 * language entry.
 *
 * Members are derived from the languages collection by an exact `generation`
 * equality — never stored, same rule as the other concept collections.
 *
 * Note the overlap with `year`: `3gl` is largely "post-1954 high-level", so a
 * generation filter is close to redundant with the year range. The tiers only
 * carry independent information at the 4gl/5gl end — which is also the end
 * that is contested. Hence the page exists to make that boundary citable.
 *
 * Tagging language entries with a generation is deferred: the value is a
 * sourced claim, never derived from `year` or `paradigms`.
 */

/**
 * GENERATIONS — DERIVED from `content/generations/*.md`. Unlike the other three,
 * the ladder is canonical rather than observed: `1gl` and `2gl` have no members
 * in any corpus of written languages, and the page is where the tier is DEFINED.
 */
export { GENERATIONS } from '../data/taxonomy.generated'

export const TYPING = ['untyped', 'dynamic', 'static', 'gradual'] as const

/**
 * PARADIGMS — DERIVED from `content/paradigms/*.md` (see the note above the
 * re-export block at the top of this file). Every value has a page, so the
 * directory is the authority and the member list is the corpus.
 */
export { PARADIGMS } from '../data/taxonomy.generated'


export const TYPE_SYSTEM = [
  'adt', // algebraic data types
  // NB: `structural` here means STRUCTURAL TYPING (shape compatibility), which is
  // a different concept from the `structured` PARADIGM (structured programming,
  // Wirth's discipline replacing arbitrary jumps). The two were one name until
  // 2026-11; the paradigm was renamed to keep them apart.
  'dependent',
  'effect-system',
  'gradual', // static+dynamic mix within the type checker
  'inferred',
  'linear', // includes affine / uniqueness
  'liquid', // refinement types
  'nominal',
  'refinement',
  'row-polymorphic',
  'structural',
  'substructural',
  'parametric-polymorphic'
] as const

export const MEMORY = [
  'arc', // automatic reference counting
  'arena', // region/arena bulk-free
  'borrow-checker',
  'conservative-gc',
  'generational-gc',
  'gc',
  'manual',
  'moving-gc',
  'ownership',
  'compile-time' // full compile-time deallocation analysis (e.g. Perceus)
] as const

export const EXECUTION = [
  'ahead-of-time', // AOT native compilation
  'bytecode',
  'jit',
  'interpreted',
  'native',
  'sandboxed', // capability/sealed-world execution (JS, WASM, Sum)
  'transpiled',
  'vm'
] as const

export const CONCURRENCY = [
  'actors', // Erlang/Akka-style message passing
  'async/await',
  'channels', // CSP, e.g. Go
  'coroutines',
  'data-parallel',
  'fork/join',
  'green-threads',
  'isolation', // share-nothing process isolation
  'kernel-threads',
  'par', // occam/kilim-style synchronous channel alt
  'software-transactional-memory',
  'tasks'
] as const

/**
 * Promoted features (docs/knowledgebase-plan.md §2, tier 2).
 *
 * `features` on a language entry is a free-form long tail — a tag, not a
 * vocabulary value. This list is the small *curated* subset that earns its
 * own page in `content/features/`, one per key (file name = key), the
 * sibling collection to `paradigms`. Member languages are derived at build
 * time from the languages collection, never stored.
 *
 * Promotion threshold: a feature is promoted when at least three language
 * entries declare it (scripts/scaffold-features.mjs --candidates recomputes
 * this from the corpus). Unpromoted feature strings stay free-form and are
 * NOT linted — only the promoted keys are, and they must be slug-safe
 * (lowercase kebab, ASCII) because the key becomes a route.
 */

/** FEATURES — DERIVED from `content/features/*.md`; see the generated module. */
export { FEATURES } from '../data/taxonomy.generated'

/** Promotion threshold: corpus entries declaring a feature before it earns a page. */
export const FEATURE_PROMOTION_THRESHOLD = 3

/**
 * Language families (docs/knowledgebase-plan.md §3b).
 *
 * A family is LINEAGE, not classification: it answers "what does this descend
 * from?" — orthogonal to `paradigms` (what it does) and to `kind` (what sort
 * of artifact the row is). Smalltalk is object-oriented *and* in the Smalltalk
 * family; C# is object-oriented, imperative *and* in the C family.
 *
 * A language entry carries at most ONE `family` — lineage is a tree at this
 * granularity, and a scalar keeps the join an exact one-column match (the
 * paradigm join needs a LIKE against a JSON-text array; this one does not).
 * Genuine cross-family descent is expressed as a family->family
 * `relations: derived-from` edge on the family page, never as a second value
 * on the language. `shares-ancestor-with` remains the escape hatch for a
 * contested membership.
 *
 * Like PARADIGMS this is a closed vocabulary: every value has a page in
 * content/families/ (file name = key, `family` repeats it) and the member
 * languages are DERIVED from the languages collection — never stored.
 *
 * NOTE the deliberate name collision: `smalltalk` and `ecmascript` name both a
 * language row and a family page. That is correct — the family is the group
 * the namesake belongs to. `relations` on each side resolve within their own
 * collection.
 */

/** FAMILIES — DERIVED from `content/families/*.md`; see the generated module. */
export { FAMILIES } from '../data/taxonomy.generated'

/** Promotion threshold: corpus entries in a family before it earns a page. */
export const FAMILY_PROMOTION_THRESHOLD = 3

/**
 * Typed relationship edges (docs/knowledgebase-plan.md §7, phase 4).
 * `influences`/`influenced` remain the loose legacy arrays; `relations`
 * carries precise, directional { name, kind } pairs. Direction is implicit:
 * an entry's relations point at the *other* language.
 */
export const RELATION_KINDS = [
  'derived-from', // direct lineage/descent
  'influenced-by', // idea adopted without lineage
  'shares-ancestor-with', // sibling languages
  'forked-from',
  'standardized-as', // e.g. Pascal -> ISO 7185 Pascal
  'dialect-of',
  'supersedes',
  'implemented-in', // implementation language (of the implementing language)
  'transpiles-to', // main/reference implementation target
  'interoperates-with'
] as const

export type RelationKind = (typeof RELATION_KINDS)[number]

/** one directional edge to another language (or standard where kind allows) */
export interface Relation {
  name: string
  kind: RelationKind
}