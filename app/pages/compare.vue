<script setup lang="ts">
/**
 * Comparison matrix (docs/knowledgebase-plan.md §4 route `/compare`).
 *
 * Language selection lives in the URL (?a=&b=&c=…) so a comparison is
 * linkable/back-button friendly. Cells highlight when languages disagree on
 * an axis so diffs pop out.
 */
const route = useRoute()
const router = useRouter()

const { data: languages } = await useAsyncData('languages-compare', () =>
  queryCollection('languages')
    .select('name', 'path', 'homepage', 'kind', 'status', 'year', 'family', 'paradigms',
      'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features', 'author', 'note')
    .order('name', 'ASC')
    .all()
)

const byPath = computed(() => new Map((languages.value ?? []).map(l => [l.path, l])))

const selectedPaths = computed(() =>
  (['a', 'b', 'c', 'd'] as const)
    .map(k => {
      const raw = route.query[k]
      const p = Array.isArray(raw) ? raw[0] : raw
      return typeof p === 'string' ? `/languages/${p}` : null
    })
    .filter((p): p is string => !!p && byPath.value.has(p))
)

function setQuery(paths: string[]) {
  const query: Record<string, string> = {}
  paths.slice(0, 4).forEach((p, i) => {
    query[['a', 'b', 'c', 'd'][i]!] = p.replace('/languages/', '')
  })
  router.replace({ query })
}

const MAX_COMPARE = 4

const picker = ref<string | undefined>(undefined)
function addFromPicker() {
  if (!picker.value || selectedPaths.value.includes(picker.value)) return
  if (selectedPaths.value.length >= MAX_COMPARE) return
  setQuery([...selectedPaths.value, picker.value])
  picker.value = undefined
}

function removeAt(i: number) {
  setQuery(selectedPaths.value.filter((_, idx) => idx !== i))
}

const compared = computed(() =>
  selectedPaths.value.map(p => ({
    path: p,
    slug: p.replace('/languages/', ''),
    lang: byPath.value.get(p)!
  }))
)

interface AxisRow {
  label: string
  /** per-language value list; `null` = no data */
  cells: (string[] | null)[]
}

const rows = computed<AxisRow[]>(() => {
  const langs = compared.value.map(c => c.lang)
  if (!langs.length) return []
  const arrayAxis = (label: string, pick: (l: any) => string[] | null | undefined): AxisRow => ({
    label,
    cells: langs.map(l => {
      const v = pick(l)
      return v && v.length ? [...v].sort() : null
    })
  })
  return [
    {
      label: 'Year',
      cells: langs.map(l => (l.year !== null && l.year !== undefined ? [String(l.year)] : null))
    },
    arrayAxis('Kind', l => (l.kind ? [l.kind] : null)),
    arrayAxis('Family', l => (l.family ? [l.family] : null)),
    arrayAxis('Status', l => (l.status ? [l.status] : null)),
    arrayAxis('Author', l => (l.author ? [l.author] : null)),
    arrayAxis('Paradigms', l => l.paradigms),
    {
      label: 'Typing',
      cells: langs.map(l => (l.typing || l.type_system?.length
        ? [...(l.type_system ?? [])].sort().concat(l.typing ? [l.typing] : [])
        : null))
    },
    arrayAxis('Memory', l => l.memory),
    arrayAxis('Execution', l => l.execution),
    arrayAxis('Concurrency', l => l.concurrency),
    arrayAxis('Features', l => l.features)
  ]
})

/** value present in some (not all) languages with data on this axis */
function isDiff(cells: (string[] | null)[]): boolean {
  const withData = cells.filter((c): c is string[] => !!c)
  if (withData.length < 2) return false
  if (withData.length !== cells.length) return true // some languages lack the fact
  const first = JSON.stringify(withData[0])
  return withData.some(c => JSON.stringify(c) !== first)
}

useSeoMeta({ title: 'Compare languages' })
</script>

<template>
  <div class="mx-4 my-2">
    <header class="mb-4">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <h1 class="text-2xl font-semibold my-2">
        Compare languages
      </h1>
      <p class="text-sm opacity-70">
        Pick up to {{ MAX_COMPARE }} languages — differences in a row are highlighted.
      </p>
    </header>

    <!-- Picker -->
    <section class="flex flex-wrap items-center gap-2 mb-4 max-w-3xl">
      <USelect
        v-model="picker"
        placeholder="Add a language…"
        :items="(languages ?? []).filter(l => !selectedPaths.includes(l.path)).map(l => ({ label: l.name, value: l.path }))"
        class="w-64"
        :disabled="selectedPaths.length >= MAX_COMPARE"
        aria-label="Add language to comparison"
      />
      <UButton
        label="Add"
        icon="i-lucide-plus"
        :disabled="!picker || selectedPaths.length >= MAX_COMPARE"
        @click="addFromPicker"
      />
      <UButton
        v-if="compared.length"
        label="Clear"
        variant="ghost"
        color="neutral"
        icon="i-lucide-x"
        @click="setQuery([]); picker = undefined"
      />
    </section>

    <!-- Selected chips -->
    <section v-if="compared.length" class="flex flex-wrap gap-2 mb-4">
      <UBadge
        v-for="(c, i) in compared"
        :key="c.path"
        color="primary"
        variant="subtle"
        size="lg"
      >
        <NuxtLink :to="c.path">{{ c.lang.name }}</NuxtLink>
        <button
          class="ml-2 opacity-60 hover:opacity-100"
          :aria-label="`Remove ${c.lang.name}`"
          @click="removeAt(i)"
        >
          ✕
        </button>
      </UBadge>
    </section>

    <!-- Matrix -->
    <table v-if="compared.length >= 2" class="lang-table">
      <thead>
        <tr>
          <th class="w-36">
            Axis
          </th>
          <th v-for="c in compared" :key="c.path">
            {{ c.lang.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label">
          <td class="font-medium opacity-80">
            {{ row.label }}
          </td>
          <td
            v-for="(cell, i) in row.cells"
            :key="compared[i]!.path"
            :class="isDiff(row.cells) ? 'bg-primary/10' : ''"
          >
            <template v-if="cell">
              <span
                v-for="v in cell"
                :key="v"
                class="inline-block mr-1 opacity-90"
              >{{ v }}</span>
            </template>
            <span v-else class="opacity-40">—</span>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="compared.length === 1" class="opacity-60 text-sm">
      Add at least one more language to compare.
    </p>
    <p v-else class="opacity-60 text-sm">
      Nothing selected — add languages above, or jump to one from
      <NuxtLink to="/" class="underline">the index</NuxtLink> and use
      <NuxtLink :to="`/compare?a=${'python'}`" class="underline">a direct link</NuxtLink>
      style <code>/compare?a=python&amp;b=rust</code>.
    </p>
  </div>
</template>