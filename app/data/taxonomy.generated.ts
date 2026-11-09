// GENERATED FILE — do not edit. Run `npm run generate:taxonomy`.
//
// These four vocabularies are DERIVED from the content collections: a key is
// the file name of its page, so the directory is the source of truth and this
// list can never drift from what actually has a page.
//
// The fact axes (KINDS, STATUSES, TYPING, TYPE_SYSTEM, MEMORY, EXECUTION,
// CONCURRENCY) stay hand-authored in taxonomy.ts — they encode intent,
// including values the curated corpus does not yet witness.

/** content/paradigms/*.md — 29 pages */
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
  'structured',
  'synchronous',
  'systems',
  'visual',
] as const

/** content/families/*.md — 7 pages */
export const FAMILIES = [
  'algol',
  'c',
  'ecmascript',
  'lisp',
  'ml',
  'obj',
  'smalltalk',
] as const

/** content/generations/*.md — 5 pages */
export const GENERATIONS = [
  '1gl',
  '2gl',
  '3gl',
  '4gl',
  '5gl',
] as const

/** content/features/*.md — 7 pages */
export const FEATURES = [
  'closures',
  'first-class-functions',
  'modules',
  'music-oriented',
  'pattern-matching',
  'prototypes',
  'regex',
] as const
