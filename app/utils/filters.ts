/**
 * Filter algebra for the research index (`/`).
 *
 * A researcher's question comes in two shapes — "which languages have ALL of
 * these facts?" and "which languages have ANY of these facts?" — and often
 * both at once. The sidebar therefore carries two independent combinators:
 *
 *   within a category  — does a language need ALL or ANY of the values picked
 *                       inside one category (e.g. "functional" + "object-oriented")?
 *   across categories — must a language satisfy every category that has a
 *                       selection, or is one enough?
 *
 * The four combinations answer the three research questions:
 *
 *   within=any, across=all → a language matches a category if it carries any of
 *                            its values, and every selected category must match
 *                            (the classic faceted-search default)
 *   within=all, across=all → the intersection of every selected fact
 *   within=any, across=any → the union of every selected fact
 *   mixed                → "functional OR imperative, AND statically typed, AND
 *                          garbage collected" — reached by overriding a single
 *                          category
 *
 * The defaults (within=any, across=all) reproduce the original sidebar
 * exactly, so `?f=` URLs that already exist keep their meaning.
 */

export type MatchMode = 'all' | 'any'

export interface AxisDef {
  key: string
  label: string
  kind: 'scalar' | 'array'
}

/** Sidebar order: the categories a researcher scans top to bottom. */
export const AXES: AxisDef[] = [
  { key: 'paradigms', label: 'Paradigms', kind: 'array' },
  { key: 'typing', label: 'Typing', kind: 'scalar' },
  { key: 'type_system', label: 'Type system', kind: 'array' },
  { key: 'memory', label: 'Memory', kind: 'array' },
  { key: 'execution', label: 'Execution', kind: 'array' },
  { key: 'concurrency', label: 'Concurrency', kind: 'array' },
  { key: 'features', label: 'Features', kind: 'array' },
  { key: 'kind', label: 'Kind', kind: 'scalar' },
  { key: 'status', label: 'Status', kind: 'scalar' }
]

/** One row of the languages collection, as the index needs it. */
export interface LanguageRow {
  name: string
  path: string
  logo?: string | null
  kind?: string | null
  status?: string | null
  year?: number | null
  paradigms?: string[] | null
  typing?: string | null
  type_system?: string[] | null
  memory?: string[] | null
  execution?: string[] | null
  concurrency?: string[] | null
  features?: string[] | null
  note?: string | null
}

export interface FilterState {
  /** Selected values per category. */
  selected: Record<string, string[]>
  /** How categories combine: every category must match, or one is enough. */
  across: MatchMode
  /** How values inside a category combine. */
  within: MatchMode
  /** Per-category overrides of `within`; an absent entry follows the global rule. */
  overrides: Record<string, MatchMode>
  yearMin?: number
  yearMax?: number
}

export function createState(): FilterState {
  const selected: Record<string, string[]> = {}
  for (const a of AXES) selected[a.key] = []
  return { selected, across: 'all', within: 'any', overrides: {}, yearMin: undefined, yearMax: undefined }
}

/** The rule in force for one category: its override, else the global default. */
export function axisMode(state: FilterState, axisKey: string): MatchMode {
  return state.overrides[axisKey] ?? state.within
}

/** Set a category's rule; an override equal to the global default is dropped. */
export function setAxisMode(state: FilterState, axisKey: string, mode: MatchMode) {
  if (mode === state.within) delete state.overrides[axisKey]
  else state.overrides[axisKey] = mode
}

export function toggleValue(state: FilterState, axisKey: string, value: string) {
  const list = state.selected[axisKey] ?? (state.selected[axisKey] = [])
  const i = list.indexOf(value)
  if (i >= 0) list.splice(i, 1)
  else list.push(value)
}

export function rowValues(row: LanguageRow, axis: string): string[] {
  const v = (row as unknown as Record<string, unknown>)[axis]
  return Array.isArray(v) ? v as string[] : (v ? [v as string] : [])
}

function matchesAxis(row: LanguageRow, axisKey: string, values: string[], mode: MatchMode): boolean {
  if (!values.length) return true
  const rowVals = rowValues(row, axisKey)
  return mode === 'all'
    ? values.every(v => rowVals.includes(v))
    : values.some(v => rowVals.includes(v))
}

export function passesYear(row: LanguageRow, state: FilterState): boolean {
  if (state.yearMin !== undefined && (row.year === null || row.year === undefined || row.year < state.yearMin)) return false
  if (state.yearMax !== undefined && (row.year === null || row.year === undefined || row.year > state.yearMax)) return false
  return true
}

/**
 * Does a row satisfy the whole filter state?
 *
 * Written as a flat loop (no per-row array allocation) because the facet
 * counter calls it tens of thousands of times per filter change.
 */
export function matchesRow(row: LanguageRow, state: FilterState): boolean {
  let anyMatched = false
  let anyCategory = false
  for (const axis of AXES) {
    const values = state.selected[axis.key]
    if (!values || !values.length) continue
    anyCategory = true
    const hit = matchesAxis(row, axis.key, values, axisMode(state, axis.key))
    if (state.across === 'all') {
      if (!hit) return false
    } else if (hit) {
      anyMatched = true
    }
  }
  // `across: 'any'` means "one matching category is enough" — but only once
  // something is actually selected. With nothing selected the union is empty
  // and every row must pass.
  if (state.across === 'any' && anyCategory && !anyMatched) return false
  return passesYear(row, state)
}

export interface FacetInfo {
  value: string
  /** Languages in the corpus carrying this value — a stable corpus fact. */
  total: number
  /**
   * The number to show next to the value:
   *
   *   selected   — how many of the current results carry this fact
   *   unselected — how many results you would get by adding it
   *
   * Both are actionable: the first says what the fact contributes to the
   * result set, the second says what picking it does. Neither can be a
   * misleading zero — an unselected value that would widen the result set
   * always reports the widened count, not the (possibly empty) overlap with
   * the current results.
   */
  count: number
  /** Results after adding this value to the current selection. */
  reachable: number
  selected: boolean
  /** True when adding this value would yield no results. */
  unreachable: boolean
}

/**
 * Facet values for one category, with the counts a researcher needs.
 *
 * The counts are contextual, not just corpus totals: the sidebar tells the
 * researcher both how common a fact is and what picking it would do to the
 * result set. A value that cannot coexist with the current filters is dimmed
 * rather than silently offered.
 */
export function facetInfo(rows: LanguageRow[], state: FilterState, axisKey: string): FacetInfo[] {
  const selected = state.selected[axisKey] ?? []
  const mode = axisMode(state, axisKey)

  // value -> indices of the rows carrying it
  const valueRows = new Map<string, number[]>()
  rows.forEach((row, i) => {
    for (const v of rowValues(row, axisKey)) {
      const list = valueRows.get(v)
      if (list) list.push(i)
      else valueRows.set(v, [i])
    }
  })

  // Rows that already satisfy the *other* categories (and the year bounds).
  //
  //   across='all' — every other selected category must match
  //   across='any' — at least one other selected category must match; with no
  //                  other category selected this is empty, because a union
  //                  over "nothing" contributes nothing
  const base = new Set<number>()
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    if (!passesYear(row, state)) continue
    if (state.across === 'all') {
      let ok = true
      for (const axis of AXES) {
        if (axis.key === axisKey) continue
        const values = state.selected[axis.key]
        if (!values?.length) continue
        if (!matchesAxis(row, axis.key, values, axisMode(state, axis.key))) { ok = false; break }
      }
      if (ok) base.add(i)
    } else {
      for (const axis of AXES) {
        if (axis.key === axisKey) continue
        const values = state.selected[axis.key]
        if (!values?.length) continue
        if (matchesAxis(row, axis.key, values, axisMode(state, axis.key))) { base.add(i); break }
      }
    }
  }

  /** Rows in this category matching a given value selection. */
  const own = (values: string[]): Set<number> => {
    const out = new Set<number>()
    if (!values.length) return out
    if (mode === 'all') {
      const lists = values.map(v => valueRows.get(v) ?? [])
      if (lists.some(l => !l.length)) return out
      // Intersect from the smallest list upward.
      const smallest = lists.reduce((a, b) => (a.length <= b.length ? a : b))
      for (const i of smallest) {
        if (lists.every(l => l.includes(i))) out.add(i)
      }
    } else {
      for (const v of values) {
        for (const i of valueRows.get(v) ?? []) out.add(i)
      }
    }
    return out
  }

  /**
   * The full result set for a given selection in this category.
   *
   * An empty selection means this category does not filter at all — which is
   * why the empty case is handled explicitly rather than falling through the
   * intersection below.
   */
  const resultSet = (values: string[]): Set<number> => {
    const out = new Set<number>()
    if (!values.length) {
      // No selection here: the result is whatever the other categories give.
      for (const i of base) out.add(i)
      return out
    }
    const o = own(values)
    if (state.across === 'all') {
      for (const i of base) if (o.has(i)) out.add(i)
    } else {
      for (const i of base) out.add(i)
      for (const i of o) out.add(i)
    }
    // The year bound applies to the whole result set, so a row that matches
    // this category but falls outside the year range is not a result.
    if (state.yearMin !== undefined || state.yearMax !== undefined) {
      for (const i of [...out]) {
        if (!passesYear(rows[i]!, state)) out.delete(i)
      }
    }
    return out
  }

  // The current result set, and how many of those rows carry each value.
  const current = resultSet(selected)
  const currentCount = new Map<string, number>()
  for (const i of current) {
    for (const v of rowValues(rows[i]!, axisKey)) currentCount.set(v, (currentCount.get(v) ?? 0) + 1)
  }

  const ordered = [...valueRows.entries()]
    .map(([value, indices]) => ({ value, total: indices.length }))
    .sort((a, b) => b.total - a.total || a.value.localeCompare(b.value))

  return ordered.map(({ value, total }) => {
    const isSelected = selected.includes(value)
    const reachable = isSelected ? current.size : resultSet([...selected, value]).size
    return {
      value,
      total,
      count: isSelected ? (currentCount.get(value) ?? 0) : reachable,
      reachable,
      selected: isSelected,
      unreachable: !isSelected && reachable === 0
    }
  })
}

/** The rule in force, in plain words. */
export function rulePhrase(within: MatchMode, across: MatchMode): string {
  if (within === 'all' && across === 'all') return 'must have every selected fact'
  if (within === 'any' && across === 'all') return 'must match every category, with any value within it'
  if (within === 'all' && across === 'any') return 'must have every fact of at least one category'
  return 'must match at least one selected fact'
}

/**
 * A full sentence describing the combinators, including overrides.
 *
 * The overrides are spelled out rather than folded into the base rule: "a
 * language must have every selected fact, except Paradigms, where any one
 * value is enough" says more than a bare rule plus a parenthetical, and the
 * researcher is reading this to decide whether the result set is the one they
 * asked for.
 */
export function describeState(state: FilterState): string {
  let text = `A language ${rulePhrase(state.within, state.across)}.`
  const overrideKeys = AXES.filter(a => state.overrides[a.key]).map(a => a.key)
  if (overrideKeys.length) {
    const parts = overrideKeys.map((key) => {
      const label = AXES.find(a => a.key === key)!.label
      const mode = state.overrides[key]!
      return mode === 'any'
        ? `${label}, where any one value is enough`
        : `${label}, where every value is required`
    })
    text += ` Except ${parts.join('; and ')}.`
  }
  return text
}

export interface Relaxation {
  label: string
  count: number
  apply: (state: FilterState) => void
}

/**
 * Escape hatches for an empty result set.
 *
 * An intersection of two facts that no language carries is a legitimate
 * answer, not a dead end. The UI therefore offers the same selection under a
 * looser combinator, each labelled with how many results it would yield.
 *
 * The options form a ladder from the smallest loosening that works to the
 * broadest, and are offered in that order — "match any value" is a smaller
 * change than "match any category", which is a smaller change than dropping
 * the selection entirely. Options that recover the same number of results are
 * collapsed, and options that recover nothing are dropped.
 */
export function suggestRelaxations(rows: LanguageRow[], state: FilterState): Relaxation[] {
  const probe = (mutate: (s: FilterState) => void): FilterState => {
    const s: FilterState = {
      selected: Object.fromEntries(AXES.map(a => [a.key, [...(state.selected[a.key] ?? [])]])),
      across: state.across,
      within: state.within,
      overrides: { ...state.overrides },
      yearMin: state.yearMin,
      yearMax: state.yearMax
    }
    mutate(s)
    return s
  }
  const countWith = (mutate: (s: FilterState) => void) =>
    rows.reduce((n, row) => n + (matchesRow(row, probe(mutate)) ? 1 : 0), 0)

  // The ladder, in order of how much each step loosens the selection.
  const ladder: Relaxation[] = []

  if (state.within === 'all') {
    ladder.push({
      label: 'Match any value within each category',
      count: countWith(s => { s.within = 'any'; s.overrides = {} }),
      apply: (s) => { s.within = 'any'; s.overrides = {} }
    })
  }
  if (state.across === 'all') {
    ladder.push({
      label: 'Match any category',
      count: countWith(s => { s.across = 'any' }),
      apply: (s) => { s.across = 'any' }
    })
  }
  if (Object.keys(state.overrides).length) {
    ladder.push({
      label: 'Drop the per-category overrides',
      count: countWith(s => { s.overrides = {} }),
      apply: (s) => { s.overrides = {} }
    })
  }
  if (state.within !== 'any' || state.across !== 'any') {
    ladder.push({
      label: 'Match any value in any category',
      count: countWith(s => { s.within = 'any'; s.across = 'any'; s.overrides = {} }),
      apply: (s) => { s.within = 'any'; s.across = 'any'; s.overrides = {} }
    })
  }
  ladder.push({
    label: 'Clear all filters',
    count: rows.length,
    apply: (s) => {
      for (const a of AXES) s.selected[a.key] = []
      s.yearMin = undefined
      s.yearMax = undefined
      s.across = 'all'
      s.within = 'any'
      s.overrides = {}
    }
  })

  // Keep the options that recover something, collapsing duplicates that
  // recover the same number of results (the loosest of the two is dropped).
  const seen = new Set<number>()
  const useful: Relaxation[] = []
  for (const c of ladder) {
    if (c.count <= 0) continue
    if (seen.has(c.count)) continue
    seen.add(c.count)
    useful.push(c)
  }
  return useful
}

/** Parse the per-category override list (`?ov=paradigms:all;typing:any`). */
export function decodeOverrides(raw: string | undefined): Record<string, MatchMode> {
  const out: Record<string, MatchMode> = {}
  for (const part of (raw ?? '').split(';')) {
    const [axis, mode] = part.split(':')
    if (!axis || !AXES.some(a => a.key === axis)) continue
    if (mode === 'all' || mode === 'any') out[axis] = mode
  }
  return out
}

/**
 * Read the filter part of a query string into a state object, in place.
 *
 * Every assignment is equality-guarded: the URL writer writes the same values
 * straight back, so an unguarded "clear then re-parse" would replace the
 * selection arrays with fresh identities on every round trip, re-triggering
 * the writer and resetting the page.
 */
export function applyQueryToState(state: FilterState, query: Record<string, unknown>): void {
  const parts = (query.f as string | undefined)?.split(';') ?? []
  for (const a of AXES) {
    const next: string[] = []
    for (const part of parts) {
      const [axis, value] = part.split(':')
      if (axis === a.key && value) next.push(...value.split(',').filter(Boolean))
    }
    const cur = state.selected[a.key] ?? []
    if (cur.length !== next.length || cur.some((v, i) => v !== next[i])) {
      state.selected[a.key] = next
    }
  }

  const across: MatchMode = query.m === 'any' ? 'any' : 'all'
  if (state.across !== across) state.across = across

  const within: MatchMode = query.w === 'all' ? 'all' : 'any'
  if (state.within !== within) state.within = within

  const overrides = decodeOverrides(query.ov as string | undefined)
  for (const key of Object.keys(state.overrides)) {
    if (!(key in overrides)) delete state.overrides[key]
  }
  for (const [key, mode] of Object.entries(overrides)) {
    if (state.overrides[key] !== mode) state.overrides[key] = mode
  }

  const ymin = query.ymin ? Number(query.ymin) : undefined
  if (state.yearMin !== ymin) state.yearMin = ymin
  const ymax = query.ymax ? Number(query.ymax) : undefined
  if (state.yearMax !== ymax) state.yearMax = ymax
}
