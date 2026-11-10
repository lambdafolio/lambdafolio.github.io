<script setup lang="ts">
/**
 * Research index (docs/knowledgebase-plan.md §4 route `/`).
 *
 * Card-grid browse à la whichcoding.tools: facet sidebar, search, sort,
 * active-filter chips. Cards show only known facts — no dangling placeholders
 * for sparse entries. Results stay bounded via client-side pagination; state
 * syncs to the URL for shareable views.
 *
 * The filter model (app/utils/filters.ts) carries two combinators — "all or
 * any values within a category" and "all or any categories" — because a
 * researcher may want the intersection of every selected fact, the union of
 * them, or a mix. Search is Fuse.js fuzzy matching over the name and the
 * fact profile, which is what makes a free-text query like "gc functional"
 * useful against ~390 sparse rows.
 */
import { useFuse } from '@vueuse/integrations/useFuse'
import { withBase } from '~/utils/with-base'
import {
  AXES, type FilterState, type LanguageRow, type MatchMode,
  applyQueryToState, createState, describeState, matchesRow, suggestRelaxations
} from '~/utils/filters'
import FilterPanel from '~/components/FilterPanel.vue'

const route = useRoute()
const router = useRouter()

const { data: languages, status } = await useAsyncData('languages-index', () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'kind', 'status', 'year', 'family',
      'paradigms', 'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features', 'note')
    .order('name', 'ASC')
    .all()
)

const rows = computed(() => (languages.value ?? []) as LanguageRow[])

// ---------------------------------------------------------------------------
// Filter state, synced to URL
//
//   ?f=paradigms:functional,static   selected values (one group per category)
//   ?w=all|any                       values within a category
//   ?m=all|any                       categories
//   ?ov=paradigms:all                per-category override of ?w
//   ?q=…  ?ymin=…  ?ymax=…  ?sort=…  ?p=…
//
// `?f=` keeps its original meaning, so links that already exist still resolve.

const state = reactive<FilterState>(createState())

// hydrate from URL once
applyQueryToState(state, route.query)

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
// The query string is owned by a single watcher further down (`buildQuery`).
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
  applyQueryToState(state, q)
  const qtext = (q.q as string | undefined) ?? ''
  if (searchText.value !== qtext) searchText.value = qtext
  const s = q.sort as SortKey | undefined
  const nextSort: SortKey = s && ['name', 'year', 'facts'].includes(s) ? s : 'name'
  if (sortBy.value !== nextSort) sortBy.value = nextSort
  const p = Math.max(1, Number(q.p) || 1)
  if (page.value !== p) page.value = p
})

// ---------------------------------------------------------------------------
// Search: Fuse.js over the name and the searchable fact profile.
//
// A substring match on the note alone would miss "functional gc" style
// queries against rows whose note is empty — which is most of them. The
// indexed fields are the ones a researcher would type: the name, the note,
// and the facet values themselves.

interface SearchDoc {
  name: string
  note: string
  facts: string[]
}

const searchDocs = computed<SearchDoc[]>(() =>
  rows.value.map(row => ({
    name: row.name,
    note: row.note ?? '',
    facts: [
      ...(row.family ? [row.family] : []),
      ...(row.paradigms ?? []),
      ...(row.type_system ?? []),
      ...(row.memory ?? []),
      ...(row.execution ?? []),
      ...(row.concurrency ?? []),
      ...(row.features ?? []),
      ...(row.kind ? [row.kind] : []),
      ...(row.status ? [row.status] : []),
      ...(row.typing ? [row.typing] : [])
    ]
  }))
)

const fuse = useFuse(searchText, searchDocs, {
  resultLimit: 1000,
  fuseOptions: {
    // Weighted so a name hit outranks a fact hit. `facts` is a list of facet
    // tokens rather than one long string, so "gc" hits the `gc` memory value
    // instead of a substring somewhere in a paragraph.
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'note', weight: 0.2 },
      { name: 'facts', weight: 0.3 }
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2
  }
})

/** Rows matching the text query (all rows when the query is empty). */
const searchScope = computed<LanguageRow[]>(() => {
  const needle = searchText.value.trim()
  if (!needle) return rows.value
  const hits = new Set(fuse.results.value.map(r => r.item.name))
  return rows.value.filter(r => hits.has(r.name))
})

// ---------------------------------------------------------------------------
// Filtering: the combinators live in app/utils/filters.ts

const filtered = computed(() => searchScope.value.filter(row => matchesRow(row, state)))

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
// Active-filter chips

const activeFilters = computed(() => [
  ...AXES.flatMap(a => (state.selected[a.key] ?? []).map(v => ({
    axis: a,
    value: v,
    mode: state.overrides[a.key] ?? state.within
  }))),
  ...(state.yearMin !== undefined ? [{ axis: null, value: `≥ ${state.yearMin}`, mode: 'all' as MatchMode }] : []),
  ...(state.yearMax !== undefined ? [{ axis: null, value: `≤ ${state.yearMax}`, mode: 'all' as MatchMode }] : [])
])

const activeFilterCount = computed(() => activeFilters.value.length)

function removeFilter(axis: (typeof AXES)[number] | null, value: string) {
  if (axis) {
    const list = state.selected[axis.key]!
    const i = list.indexOf(value)
    if (i >= 0) list.splice(i, 1)
  } else if (value.startsWith('≥')) state.yearMin = undefined
  else state.yearMax = undefined
  page.value = 1
}

function clearAll() {
  for (const a of AXES) state.selected[a.key] = []
  state.yearMin = undefined
  state.yearMax = undefined
  state.across = 'all'
  state.within = 'any'
  state.overrides = {}
  searchText.value = ''
  page.value = 1
}

// ---------------------------------------------------------------------------
// Empty-result escape hatches
//
// An intersection of two facts that no language carries is a legitimate
// answer, not a dead end. Rather than a bare "no results", the UI offers the
// same selection under a looser combinator, each labelled with how many
// results it would yield.

const relaxations = computed(() => {
  if (totalItems.value > 0) return []
  return suggestRelaxations(searchScope.value, state)
})

function applyRelaxation(apply: (s: FilterState) => void) {
  apply(state)
  page.value = 1
}

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
    .filter(a => (state.selected[a.key] ?? []).length)
    .map(a => `${a.key}:${state.selected[a.key]!.join(',')}`)
    .join(';')
  const ov = AXES
    .filter(a => state.overrides[a.key])
    .map(a => `${a.key}:${state.overrides[a.key]}`)
    .join(';')
  return {
    ...route.query,
    q: searchText.value || undefined,
    f: f || undefined,
    w: state.within !== 'any' ? state.within : undefined,
    m: state.across !== 'all' ? state.across : undefined,
    ov: ov || undefined,
    ymin: state.yearMin !== undefined ? String(state.yearMin) : undefined,
    ymax: state.yearMax !== undefined ? String(state.yearMax) : undefined,
    sort: sortBy.value !== 'name' ? sortBy.value : undefined,
    p: currentPage.value > 1 ? String(currentPage.value) : undefined
  }
}

watch(
  [() => state.selected, () => state.across, () => state.within, () => state.overrides,
    () => state.yearMin, () => state.yearMax, searchText, sortBy, page],
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

const ruleSummary = computed(() => describeState(state))
</script>

<template>
  <div>
    <header class="site-content_header mx-4 my-2">
      <div class="flex items-start gap-3 my-2">
        <h1 class="text-2xl font-semibold">
          Programming Languages
        </h1>
        <!--
          Feed entry point. A raw <a> rather than a nuxt-link: /feed.xml is a
          static file, not an app route, so the router must not intercept it.
          `withBase` keeps the path correct under a project-site base URL.
          The glyph is a UIcon, not a hand-written `i-lucide-rss` span:
          @nuxt/icon only emits a glyph's CSS for icons it renders during SSR,
          so a bare class span ships no styles and draws nothing.

          The icon keeps the conventional RSS orange at full strength; only the
          label dims, so the colour does not fade with the muted text.
        -->
        <a
          :href="withBase('/feed.xml')"
          type="application/rss+xml"
          title="LambdaFolio RSS feed"
          aria-label="Subscribe to the LambdaFolio RSS feed"
          class="mt-0.5 inline-flex items-center gap-1.5 text-xs hover:underline"
        >
          <UIcon name="i-lucide-rss" class="size-4 shrink-0 text-(--rss-orange)" aria-hidden="true" />
          <span class="opacity-60 hover:opacity-100 transition-opacity">RSS</span>
        </a>
      </div>
      <p class="text-sm opacity-70">
        {{ totalItems }} of {{ rows.length }} languages. Pick facts on the left to narrow them.
        <NuxtLink to="/families" class="underline ml-1">
          Browse the families
        </NuxtLink>
        for lineage, the
        <NuxtLink to="/paradigms" class="underline ml-1">
          paradigms
        </NuxtLink>
        for shared style, or the
        <NuxtLink to="/features" class="underline ml-1">
          promoted features
        </NuxtLink>
        for where a mechanism shows up.
      </p>
    </header>

    <div class="flex items-stretch gap-6">
      <!-- Facet sidebar -->
      <aside class="w-72 shrink-0 hidden md:block">
        <div class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
          <FilterPanel
            :state="state"
            :rows="rows"
            :scope-rows="searchScope"
            :search-text="searchText"
            :years-with-data="yearsWithData"
            @update:search-text="(v: string) => { searchText = v; page = 1 }"
            @change="page = 1"
          />
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
            :title="f.axis && f.mode === 'all' ? 'Every selected value in this category must match' : undefined"
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

        <!-- The rule in force, restated next to the results -->
        <p v-if="activeFilterCount" class="text-xs opacity-60 mb-4 flex items-center gap-1.5">
          <UIcon name="i-lucide-info" class="size-3.5 shrink-0" />
          {{ ruleSummary }}
        </p>

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
            <div class="my-2 p-3 border border-(--ui-border-accented) rounded-md">
              <FilterPanel
                :state="state"
                :rows="rows"
                :scope-rows="searchScope"
                :search-text="searchText"
                :years-with-data="yearsWithData"
                @update:search-text="(v: string) => { searchText = v; page = 1 }"
                @change="page = 1"
              />
            </div>
          </template>
        </UCollapsible>

        <!-- Card grid -->
        <div v-if="status === 'pending'" class="text-sm opacity-60 my-8">
          Loading…
        </div>
        <div v-else-if="totalItems === 0" class="text-sm opacity-70 my-8 space-y-3">
          <p>
            No languages match the current filters.
          </p>
          <div v-if="relaxations.length" class="space-y-1.5">
            <p class="text-xs opacity-60">
              Try loosening the rule:
            </p>
            <UButton
              v-for="r in relaxations"
              :key="r.label"
              :label="`${r.label} — ${r.count} result${r.count === 1 ? '' : 's'}`"
              variant="outline"
              color="neutral"
              size="xs"
              icon="i-lucide-shuffle"
              class="block"
              @click="applyRelaxation(r.apply)"
            />
          </div>
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
