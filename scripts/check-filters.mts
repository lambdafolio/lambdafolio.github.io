/**
 * Standalone check of the filter algebra (app/utils/filters.ts).
 *
 * Run with: node --experimental-strip-types scripts/check-filters.mts
 *
 * The filter model is pure logic with no Vue/Nuxt dependency, so it can be
 * exercised directly — the combinators are the part of the index most likely
 * to break silently, since a wrong AND/OR still renders a plausible list.
 */
import assert from 'node:assert/strict'
import {
  AXES, createState, matchesRow, facetInfo, suggestRelaxations, applyQueryToState,
  type FilterState, type LanguageRow
} from '../app/utils/filters.ts'

const rows: LanguageRow[] = [
  { name: 'Alpha', path: '/languages/alpha', paradigms: ['functional', 'imperative'], typing: 'static', memory: ['gc'], execution: ['bytecode'] },
  { name: 'Beta', path: '/languages/beta', paradigms: ['functional'], typing: 'dynamic', memory: ['gc'], execution: ['jit'] },
  { name: 'Gamma', path: '/languages/gamma', paradigms: ['imperative'], typing: 'static', memory: ['arc'], execution: ['native'] },
  { name: 'Delta', path: '/languages/delta', paradigms: ['object-oriented'], typing: 'static', execution: ['bytecode'] },
  { name: 'Epsilon', path: '/languages/epsilon', note: 'A note mentioning garbage collection' }
]

function state(partial: Partial<FilterState>): FilterState {
  const s = createState()
  for (const a of AXES) s.selected[a.key] = []
  Object.assign(s, partial)
  return s
}

function names(list: LanguageRow[]): string[] {
  return list.map(r => r.name).sort()
}

function match(list: LanguageRow[], s: FilterState): string[] {
  return names(list.filter(r => matchesRow(r, s)))
}

// --- Use case 1: intersection of ALL selected features ---------------------
{
  const s = state({ within: 'all', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  assert.deepEqual(match(rows, s), ['Alpha'], 'ALL within a category = intersection')

  const s2 = state({ within: 'all', across: 'all' })
  s2.selected.paradigms = ['functional']
  s2.selected.typing = ['static']
  assert.deepEqual(match(rows, s2), ['Alpha'], 'ALL across categories = intersection')
}

// --- Use case 2: ANY of the selected filters ------------------------------
{
  const s = state({ within: 'any', across: 'any' })
  s.selected.paradigms = ['functional']
  s.selected.typing = ['dynamic']
  assert.deepEqual(match(rows, s), ['Alpha', 'Beta'], 'ANY across categories = union')
}

// --- Use case 3: combination ----------------------------------------------
{
  // "functional OR imperative, AND statically typed"
  const s = state({ within: 'any', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  s.selected.typing = ['static']
  assert.deepEqual(match(rows, s), ['Alpha', 'Gamma'], 'ANY within, ALL across')

  // The same question with the global rule set to "all" and the paradigms
  // category relaxed on its own.
  const s2 = state({ within: 'all', across: 'all' })
  s2.selected.paradigms = ['functional', 'imperative']
  s2.selected.typing = ['static']
  s2.overrides.paradigms = 'any'
  assert.deepEqual(match(rows, s2), ['Alpha', 'Gamma'], 'per-category override relaxes one category only')

  // Without the override the intersection is strict: only Alpha carries both
  // paradigms *and* is statically typed.
  const s3 = state({ within: 'all', across: 'all' })
  s3.selected.paradigms = ['functional', 'imperative']
  s3.selected.typing = ['static']
  assert.deepEqual(match(rows, s3), ['Alpha'], 'ALL within, ALL across = strict intersection')

  const s4 = state({ within: 'all', across: 'all' })
  s4.selected.paradigms = ['functional', 'imperative']
  s4.overrides.paradigms = 'any'
  assert.deepEqual(match(rows, s4), ['Alpha', 'Beta', 'Gamma'], 'override with one category = union of that category')
}

// --- The default must reproduce the original sidebar behaviour -------------
{
  const s = state({ within: 'any', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  s.selected.execution = ['bytecode']
  assert.deepEqual(match(rows, s), ['Alpha'], 'default (any within, all across) matches legacy behaviour')
}

// --- `across: any` with nothing selected ----------------------------------
{
  const s = state({ within: 'any', across: 'any' })
  assert.deepEqual(match(rows, s).length, 5, 'an empty union still shows every row')
}

// --- Year bounds ----------------------------------------------------------
{
  const s = state({ within: 'any', across: 'all' })
  s.yearMin = 1990
  assert.deepEqual(match(rows, s).length, 0, 'yearMin excludes rows without a year')
}

// --- Facet counts ---------------------------------------------------------
{
  const s = state({ within: 'any', across: 'all' })
  s.selected.typing = ['static']
  const info = facetInfo(rows, s, 'paradigms')
  const functional = info.find(i => i.value === 'functional')!
  assert.equal(functional.total, 2, 'total is a corpus fact')
  assert.equal(functional.reachable, 1, 'reachable accounts for the other categories (Alpha)')
  assert.equal(functional.count, 1, 'an unselected value shows what picking it would yield')
  const oo = info.find(i => i.value === 'object-oriented')!
  assert.equal(oo.reachable, 1, 'object-oriented coexists with static typing (Delta)')
  const imper = info.find(i => i.value === 'imperative')!
  assert.equal(imper.reachable, 2, 'imperative coexists with static typing (Alpha, Gamma)')

  // A selected value shows how many of the current results carry it.
  const s2 = state({ within: 'any', across: 'all' })
  s2.selected.paradigms = ['functional']
  const info2 = facetInfo(rows, s2, 'paradigms')
  const functional2 = info2.find(i => i.value === 'functional')!
  assert.equal(functional2.selected, true)
  assert.equal(functional2.count, 2, 'a selected value shows its share of the results')
  assert.equal(functional2.reachable, 2, 'reachable for a selected value = the current result count')
}

// --- Unreachable values are flagged, not hidden ----------------------------
{
  const s = state({ within: 'all', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  s.selected.typing = ['dynamic']
  const info = facetInfo(rows, s, 'paradigms')
  const functional = info.find(i => i.value === 'functional')!
  assert.equal(functional.reachable, 0, 'no row has functional+imperative and dynamic typing')
  assert.equal(functional.unreachable, false, 'an already-selected value is never "unreachable"')
}

// --- Unreachable values are flagged, not hidden ----------------------------
{
  const s = state({ within: 'all', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  s.selected.typing = ['dynamic']
  const info = facetInfo(rows, s, 'paradigms')
  const functional = info.find(i => i.value === 'functional')!
  assert.equal(functional.reachable, 0, 'no row has functional+imperative and dynamic typing')
  assert.equal(functional.unreachable, false, 'an already-selected value is never "unreachable"')
}

// --- Relaxation suggestions ------------------------------------------------
{
  const s = state({ within: 'all', across: 'all' })
  s.selected.paradigms = ['functional', 'imperative']
  const relax = suggestRelaxations(rows, s)
  const anyValue = relax.find(r => r.label.includes('any value'))!
  assert.ok(anyValue, 'a relaxation to "any value" is offered')
  assert.equal(anyValue.count, 3, 'relaxing to "any value" yields Alpha, Beta, Gamma')
}

// --- URL round-trip --------------------------------------------------------
{
  const s = createState()
  applyQueryToState(s, { f: 'paradigms:functional,imperative;typing:static', w: 'all', m: 'any', ov: 'paradigms:any' })
  assert.deepEqual(s.selected.paradigms, ['functional', 'imperative'])
  assert.deepEqual(s.selected.typing, ['static'])
  assert.equal(s.within, 'all')
  assert.equal(s.across, 'any')
  assert.equal(s.overrides.paradigms, 'any')
}

console.log('filter algebra: all assertions passed')
