<script setup lang="ts">
/**
 * Research index (docs/knowledgebase-plan.md §4 route `/`).
 *
 * Card-grid browse à la whichcoding.tools: facet sidebar (OR-within-axis,
 * AND-across-axes), search, sort, active-filter chips. Cards show only known
 * facts — no dangling placeholders for sparse entries. Results stay bounded
 * via client-side pagination; state syncs to the URL for shareable views.
 */
import { withBase } from '~/utils/with-base'

const route = useRoute()
const router = useRouter()

const { data: languages, status } = await useAsyncData('languages-index', () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'kind', 'status', 'year',
      'paradigms', 'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features', 'note')
    .order('name', 'ASC')
    .all()
)

interface LanguageRow {
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

const rows = computed(() => (languages.value ?? []) as LanguageRow[])

// ---------------------------------------------------------------------------
// Facet axes (sidebar order)

interface AxisDef {
  key: string
  label: string
  kind: 'scalar' | 'array'
}

const AXES: AxisDef[] = [
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

function rowValues(row: LanguageRow, axis: string): string[] {
  const v = (row as unknown as Record<string, unknown>)[axis]
  return Array.isArray(v) ? v as string[] : (v ? [v as string] : [])
}

function facetCounts(axis: string): { value: string, count: number }[] {
  const counts = new Map<string, number>()
  for (const row of rows.value) {
    for (const v of rowValues(row, axis)) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

// ---------------------------------------------------------------------------
// Filter state, synced to URL (?f=paradigms:functional,static&…)

const selected = reactive<Record<string, string[]>>({})
for (const a of AXES) selected[a.key] = []

// hydrate from URL once
for (const part of (route.query.f as string | undefined)?.split(';') ?? []) {
  const [axis, value] = part.split(':')
  const ax = AXES.find(a => a.key === axis)
  if (ax && value) selected[ax.key] = value.split(',').filter(Boolean)
}
const yearMin = ref<number | undefined>(
  route.query.ymin ? Number(route.query.ymin) : undefined
)
const yearMax = ref<number | undefined>(
  route.query.ymax ? Number(route.query.ymax) : undefined
)
const searchText = ref((route.query.q as string | undefined) ?? '')

// Sort + page are declared here (not further down) because the route watcher
// below writes them back into the state.
type SortKey = 'name' | 'year' | 'facts'
const sortBy = ref<SortKey>(((route.query.sort as string) ?? 'name') as SortKey)
const sortOptions: { label: string, value: SortKey }[] = [
  { label: 'Name', value: 'name' },
  { label: 'Year (newest)', value: 'year' },
  { label: 'Most documented', value: 'facts' }
]

const PAGE_SIZE = 48
const page = ref(1)
// restore page from URL (?p=)
if (route.query.p) page.value = Math.max(1, Number(route.query.p) || 1)

// ---------------------------------------------------------------------------
// URL sync: ONE writer, ONE reader.
//
// The query string is owned by a single watcher further down (`syncUrl`).
// This block only owns the in-memory state.

// Query → state, for external URL changes (shared links, back button).
// On static prerenders, setup() runs while the payload route still has no
// query — the router settles afterward, so state must follow the route here.
//
// Every assignment is equality-guarded: the URL writer writes the same values
// straight back, so an unguarded "clear then re-parse" would replace
// `selected`'s arrays with fresh identities on every round trip, re-triggering
// the writer and resetting the page.
watch(() => route.query, (q) => {
  const parts = (q.f as string | undefined)?.split(';') ?? []
  for (const a of AXES) {
    const next: string[] = []
    for (const part of parts) {
      const [axis, value] = part.split(':')
      if (axis === a.key && value) next.push(...value.split(',').filter(Boolean))
    }
    const cur = selected[a.key]!
    if (cur.length !== next.length || cur.some((v, i) => v !== next[i])) {
      selected[a.key] = next
    }
  }
  const ymin = q.ymin ? Number(q.ymin) : undefined
  if (yearMin.value !== ymin) yearMin.value = ymin
  const ymax = q.ymax ? Number(q.ymax) : undefined
  if (yearMax.value !== ymax) yearMax.value = ymax
  const qtext = (q.q as string | undefined) ?? ''
  if (searchText.value !== qtext) searchText.value = qtext
  const s = q.sort as SortKey | undefined
  const nextSort: SortKey = s && ['name', 'year', 'facts'].includes(s) ? s : 'name'
  if (sortBy.value !== nextSort) sortBy.value = nextSort
  const p = Math.max(1, Number(q.p) || 1)
  if (page.value !== p) page.value = p
})

function toggle(axis: string, value: string) {
  const list = selected[axis]!
  const i = list.indexOf(value)
  if (i >= 0) list.splice(i, 1)
  else list.push(value)
  page.value = 1
}

function isSelected(axis: string, value: string): boolean {
  return selected[axis]!.includes(value)
}

const activeFilterCount = computed(() =>
  AXES.reduce((n, a) => n + selected[a.key]!.length, 0)
  + (yearMin.value !== undefined ? 1 : 0)
  + (yearMax.value !== undefined ? 1 : 0)
)

const activeFilters = computed(() => [
  ...AXES.flatMap(a => selected[a.key]!.map(v => ({ axis: a, value: v }))),
  ...(yearMin.value !== undefined ? [{ axis: null, value: `≥ ${yearMin.value}` }] : []),
  ...(yearMax.value !== undefined ? [{ axis: null, value: `≤ ${yearMax.value}` }] : [])
])

function removeFilter(axis: AxisDef | null, value: string) {
  if (axis) toggle(axis.key, value)
  else if (value.startsWith('≥')) yearMin.value = undefined
  else yearMax.value = undefined
  page.value = 1
}

function clearAll() {
  for (const a of AXES) selected[a.key] = []
  yearMin.value = undefined
  yearMax.value = undefined
  searchText.value = ''
  page.value = 1
}

// ---------------------------------------------------------------------------
// Filtering: OR within an axis, AND across axes; years bound the set

const filtered = computed(() => {
  const needle = searchText.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    for (const axis of AXES) {
      const wanted = selected[axis.key]!
      if (!wanted.length) continue
      const values = rowValues(row, axis.key)
      if (!wanted.some(w => values.includes(w))) return false
    }
    if (yearMin.value !== undefined && (row.year === null || row.year === undefined || row.year < yearMin.value)) return false
    if (yearMax.value !== undefined && (row.year === null || row.year === undefined || row.year > yearMax.value)) return false
    if (needle) {
      const haystack = [
        row.name, row.note,
        ...rowValues(row, 'paradigms'), ...rowValues(row, 'type_system'),
        ...rowValues(row, 'memory'), ...rowValues(row, 'execution'),
        ...rowValues(row, 'concurrency'), ...rowValues(row, 'features')
      ].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
})

// ---------------------------------------------------------------------------
// Sorting + pagination

const factScore = (r: LanguageRow) =>
  [r.paradigms, r.type_system, r.memory, r.execution, r.concurrency, r.features]
    .reduce((n, arr) => n + (arr?.length ?? 0), 0) + (r.year ? 1 : 0)

const sorted = computed(() => {
  const list = [...filtered.value]
  if (sortBy.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'year') list.sort((a, b) => (b.year ?? -9999) - (a.year ?? -9999) || a.name.localeCompare(b.name))
  else list.sort((a, b) => factScore(b) - factScore(a) || a.name.localeCompare(b.name))
  return list
})

const totalItems = computed(() => sorted.value.length)
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / PAGE_SIZE)))
// Clamp: narrowing the filters can shrink the result set below the current
// page, so the effective page is always inside the available range.
const currentPage = computed({
  get: () => Math.min(Math.max(1, page.value), pageCount.value),
  set: (v: number) => { page.value = v }
})
const paged = computed(() => sorted.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))

// ---------------------------------------------------------------------------
// Single URL writer
//
// One watcher owns the query string and emits every state key, so no writer
// can drop another's key. That clobbering is what broke pagination: the
// filter writer replaced the query wholesale (dropping `p`), the route reader
// then re-fired and the page-reset watcher snapped back to page 1 — so the
// page buttons looked dead even though the grid did have more pages.

function buildQuery() {
  const f = AXES
    .filter(a => selected[a.key]!.length)
    .map(a => `${a.key}:${selected[a.key]!.join(',')}`)
    .join(';')
  return {
    ...route.query,
    q: searchText.value || undefined,
    f: f || undefined,
    ymin: yearMin.value !== undefined ? String(yearMin.value) : undefined,
    ymax: yearMax.value !== undefined ? String(yearMax.value) : undefined,
    sort: sortBy.value !== 'name' ? sortBy.value : undefined,
    p: currentPage.value > 1 ? String(currentPage.value) : undefined
  }
}

watch(
  [selected, yearMin, yearMax, searchText, sortBy, page],
  () => { router.replace({ query: buildQuery() }) },
  { deep: true }
)

// Bring the results back into view when the page changes — the grid sits
// above the control, so without this the click looks like nothing happened.
// Instant (not smooth) on purpose: an animated scroll keeps the pagination
// control moving under the pointer, so a second click can miss it.
const resultsRef = ref<HTMLElement | null>(null)
watch(page, () => {
  resultsRef.value?.scrollIntoView({ behavior: 'auto', block: 'start' })
})
const yearsWithData = computed(() =>
  [...new Set(rows.value.map(r => r.year).filter((y): y is number => y !== null && y !== undefined))].sort((a, b) => b - a)
)

const facetsOpen = ref(false)
</script>

<template>
  <div>
    <header class="site-content_header mx-4 my-2">
      <h1 class="text-2xl font-semibold my-2">
        Programming Languages
      </h1>
      <p class="text-sm opacity-70">
        {{ totalItems }} of {{ rows.length }} languages. Pick facts on the left to narrow them.
      </p>
    </header>

    <div class="flex items-stretch gap-6">
      <!-- Facet sidebar -->
      <aside class="w-64 shrink-0 hidden md:block">
        <div class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
          <UInput
            v-model="searchText"
            placeholder="Search languages…"
            icon="i-lucide-search"
            class="mb-4"
            aria-label="Search languages"
            @update:model-value="page = 1"
          />

          <div v-for="axis in AXES" :key="axis.key" class="mb-4">
            <h3 class="text-xs font-semibold uppercase opacity-60 mb-1.5">
              {{ axis.label }}
            </h3>
            <div class="flex flex-col gap-0.5">
              <button
                v-for="facet in facetCounts(axis.key)"
                :key="facet.value"
                class="flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors hover:bg-elevated"
                :class="isSelected(axis.key, facet.value) ? 'bg-primary/15 text-primary font-medium' : 'opacity-80'"
                :title="`${facet.count} languages`"
                @click="toggle(axis.key, facet.value)"
              >
                <span class="capitalize truncate">{{ facet.value }}</span>
                <span class="opacity-50 text-xs tabular-nums">{{ facet.count }}</span>
              </button>
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-xs font-semibold uppercase opacity-60 mb-1.5">
              Year
            </h3>
            <div class="flex gap-2">
              <USelect
                v-model="yearMin"
                placeholder="From"
                :items="yearsWithData.map(y => ({ label: `≥ ${y}`, value: y }))"
                class="w-full"
                aria-label="Minimum year"
                @update:model-value="page = 1"
              />
              <USelect
                v-model="yearMax"
                placeholder="To"
                :items="yearsWithData.map(y => ({ label: `≤ ${y}`, value: y }))"
                class="w-full"
                aria-label="Maximum year"
                @update:model-value="page = 1"
              />
            </div>
          </div>
        </div>
      </aside>

      <!-- Results -->
      <section ref="resultsRef" class="flex-1 min-w-0">
        <!-- Active filter chips + sort -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <UBadge
            v-for="f in activeFilters"
            :key="`${f.axis?.key ?? 'y'}-${f.value}`"
            color="primary"
            variant="subtle"
            size="sm"
            class="cursor-pointer"
            :class="{ 'capitalize': !!f.axis }"
            @click="removeFilter(f.axis, f.value)"
          >
            {{ f.axis ? `${f.axis.label}: ${f.value}` : f.value }}
            <span class="opacity-60 ml-1">✕</span>
          </UBadge>
          <UButton
            v-if="activeFilterCount"
            label="Clear"
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-x"
            @click="clearAll"
          />
          <USelect
            v-model="sortBy"
            :items="sortOptions"
            value-key="value"
            class="w-44 ml-auto"
            aria-label="Sort results"
            @update:model-value="page = 1"
          />
        </div>

        <!-- Mobile facet toggle -->
        <UButton
          label="Filters"
          color="neutral"
          variant="subtle"
          size="sm"
          class="md:hidden mb-4"
          trailing-icon="i-lucide-chevron-down"
          @click="facetsOpen = !facetsOpen"
 />
        <UCollapsible :open="facetsOpen" class="md:hidden">
          <template #content>
            <div class="my-2 space-y-3 p-3 border border-(--ui-border-accented) rounded-md">
              <div v-for="axis in AXES" :key="axis.key">
                <h3 class="text-xs font-semibold uppercase opacity-60 mb-1">
                  {{ axis.label }}
                </h3>
                <UBadge
                  v-for="facet in facetCounts(axis.key)"
                  :key="facet.value"
                  :color="isSelected(axis.key, facet.value) ? 'primary' : 'neutral'"
                  :variant="isSelected(axis.key, facet.value) ? 'solid' : 'outline'"
                  class="cursor-pointer select-none mr-1 mb-1"
                  @click="toggle(axis.key, facet.value)"
                >
                  {{ facet.value }} <span class="opacity-60">{{ facet.count }}</span>
                </UBadge>
              </div>
            </div>
          </template>
        </UCollapsible>

        <!-- Card grid -->
        <div v-if="status === 'pending'" class="text-sm opacity-60 my-8">
          Loading…
        </div>
        <div v-else-if="totalItems === 0" class="text-sm opacity-60 my-8">
          No languages match the current filters.
          <UButton label="Clear filters" variant="link" @click="clearAll" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <NuxtLink
            v-for="lang in paged"
            :key="lang.path"
            :to="lang.path"
            class="block border border-(--ui-border-accented) hover:border-(--ui-primary) rounded-lg p-3 transition-colors group"
          >
            <div class="flex items-start gap-2.5">
              <img
                v-if="lang.logo"
                :src="withBase(lang.logo)"
                :alt="`${lang.name} logo`"
                loading="lazy"
                class="h-8 w-8 object-contain shrink-0 mt-0.5"
              >
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium group-hover:text-primary transition-colors">{{ lang.name }}</span>
                  <span v-if="lang.year" class="text-xs opacity-50 tabular-nums">{{ lang.year }}</span>
                  <UBadge
                    v-if="lang.status && lang.status !== 'active'"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    class="capitalize"
                  >
                    {{ lang.status }}
                  </UBadge>
                </div>
                <p v-if="lang.note" class="text-sm opacity-75 mt-1 line-clamp-3">
                  {{ lang.note }}
                </p>
              </div>
            </div>
            <div v-if="lang.paradigms?.length || lang.typing || lang.execution?.length" class="flex flex-wrap gap-1 mt-3">
              <UBadge v-for="p in lang.paradigms" :key="p" color="neutral" variant="subtle" size="sm" class="capitalize">
                {{ p }}
              </UBadge>
              <UBadge v-if="lang.typing" color="neutral" variant="outline" size="sm">
                {{ lang.typing }} typing
              </UBadge>
              <UBadge v-for="e in lang.execution" :key="e" color="neutral" variant="outline" size="sm">
                {{ e }}
              </UBadge>
            </div>
          </NuxtLink>
        </div>

        <div v-if="pageCount > 1" class="flex justify-center mt-6">
          <UPagination
            v-model:page="currentPage"
            :total="totalItems"
            :items-per-page="PAGE_SIZE"
            :sibling-count="1"
            show-edges
          />
        </div>
      </section>
    </div>
  </div>
</template>