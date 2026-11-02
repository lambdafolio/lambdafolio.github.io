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
 */

export const KINDS = ['language', 'family', 'dialect', 'notation'] as const

export const STATUSES = ['active', 'experimental', 'dormant', 'historical'] as const

export const TYPING = ['untyped', 'dynamic', 'static', 'gradual'] as const

export const PARADIGMS = [
  'agent-based',
  'array',
  'aspect-oriented',
  'concatenative',
  'concurrent',
  'continuation',
  'data-parallel',
  'dataflow',
  'declarative',
  'domain-specific',
  'effect',
  'functional',
  'generic',
  'imperative',
  'logic',
  'modular',
  'object-oriented',
  'parallel',
  'pattern-oriented',
  'probabilistic',
  'query',
  'reactive',
  'relational',
  'specification',
  'stack-based',
  'structural',
  'synchronous',
  'systems',
  'visual'
] as const

export const TYPE_SYSTEM = [
  'adt', // algebraic data types
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