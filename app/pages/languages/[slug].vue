<script setup lang="ts">
import type { MinimarkNode } from '@nuxt/content'

const route = useRoute()

const { data: language } = await useAsyncData(`language-${route.params.slug}`, () =>
  queryCollection('languages').path(`/languages/${route.params.slug}`).first()
)

if (!language.value) {
  throw createError({ statusCode: 404, statusMessage: 'Language not found', fatal: true })
}

// Resolved registry-based cross-links: influences/influenced -> known slugs
const { data: allLanguages } = await useAsyncData('languages-meta', () =>
  queryCollection('languages').select('name', 'path').order('name', 'ASC').all()
)
const nameToPath = computed(
  () => new Map(allLanguages.value?.map(l => [l.name, l.path]) ?? [])
)

function linkFor(name: string): { label: string, to?: string } | null {
  const to = nameToPath.value.get(name)
  return to ? { label: name, to } : null
}

/** Axis groups for the fact sheet; each renders as a chip row (hidden when empty). */
const axisGroups = computed(() => [
  { label: 'Paradigms', values: language.value?.paradigms ?? [], linked: true },
  { label: 'Type system', values: [language.value?.typing, ...(language.value?.type_system ?? [])].filter(Boolean) },
  { label: 'Memory', values: language.value?.memory ?? [] },
  { label: 'Execution', values: language.value?.execution ?? [] },
  { label: 'Concurrency', values: language.value?.concurrency ?? [] },
  { label: 'Features', values: language.value?.features ?? [] }
])

const relations = computed(() => [
  { label: 'Influences', names: language.value?.influences ?? [] },
  { label: 'Influenced', names: language.value?.influenced ?? [] }
])

/** Typed relation edges (docs/knowledgebase-plan.md §7), grouped by kind. */
const EDGE_LABELS: Record<string, string> = {
  'derived-from': 'Derived from',
  'influenced-by': 'Influenced by',
  'shares-ancestor-with': 'Shares ancestor with',
  'forked-from': 'Forked from',
  'standardized-as': 'Standardized as',
  'dialect-of': 'Dialect of',
  'supersedes': 'Supersedes',
  'implemented-in': 'Implemented in',
  'transpiles-to': 'Transpiles to',
  'interoperates-with': 'Interoperates with'
}

const typedRelations = computed(() => {
  const edges = (language.value as { relations?: { name: string, kind: string }[] } | null)?.relations ?? []
  const groups = new Map<string, { name: string, kind: string }[]>()
  for (const edge of edges) {
    if (!groups.has(edge.kind)) groups.set(edge.kind, [])
    groups.get(edge.kind)!.push(edge)
  }
  return [...groups.entries()].map(([kind, list]) => ({
    label: EDGE_LABELS[kind] ?? kind,
    names: list.map(e => e.name)
  }))
})

/** Reference button labels: domain-stripped, e.g. "GitHub"; disambiguated by index. */
function referenceLabel(url: string, index: number): string {
  return refTitle(url, index)
}

/** Human title for a reference URL: homepage → official site; others → host name. */
function refTitle(url: string, index: number): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const base = host.split('.')[0]!
    const label = base.charAt(0).toUpperCase() + base.slice(1)
    return index === 0 ? label : label
  } catch {
    return `Reference ${index + 1}`
  }
}

/** Full reference list: homepage first ("Official site"), then titled references, then untitled urls. */
const referenceList = computed(() => {
  const lang = language.value as {
    homepage?: string | null
    urls?: string[] | null
    references?: { url: string, title: string }[] | null
  } | null
  if (!lang) return []
  const out: { url: string, title: string, host: string }[] = []
  if (lang.homepage) {
    out.push({ url: lang.homepage, title: 'Official site', host: hostOf(lang.homepage) })
  }
  const seen = new Set(out.map(r => r.url))
  for (const ref of lang.references ?? []) {
    if (seen.has(ref.url)) continue
    seen.add(ref.url)
    out.push({ url: ref.url, title: ref.title, host: hostOf(ref.url) })
  }
  for (const url of lang.urls ?? []) {
    if (seen.has(url)) continue
    seen.add(url)
    out.push({ url, title: refTitle(url, out.length), host: hostOf(url) })
  }
  return out
})

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Facts that map to an index facet filter, for the Explore section. */
const linkableFacts = computed(() => {
  const lang = language.value
  if (!lang) return []
  const out: { axis: string, value: string, preposition: string }[] = []
  for (const p of lang.paradigms ?? []) out.push({ axis: 'paradigms', value: p, preposition: 'with' })
  if (lang.typing) out.push({ axis: 'typing', value: lang.typing, preposition: 'typed' })
  for (const m of lang.memory ?? []) out.push({ axis: 'memory', value: m, preposition: 'with' })
  for (const e of lang.execution ?? []) out.push({ axis: 'execution', value: e, preposition: 'running' })
  for (const c of lang.concurrency ?? []) out.push({ axis: 'concurrency', value: c, preposition: 'with' })
  return out.slice(0, 4)
})

const hasBody = computed(() => {
  const body = language.value?.body
  // Content v3 page AST: MarkdownRoot extends MinimarkTree { type, value: MinimarkNode[] }
  return Array.isArray((body as unknown as { value?: MinimarkNode[] })?.value)
    && (body as unknown as { value: MinimarkNode[] }).value.length > 0
})

const hasFacts = computed(() => axisGroups.value.some(g => g.values.length > 0)
  || language.value?.year !== null && language.value?.year !== undefined)

useSeoMeta({
  title: language.value?.title,
  description: language.value?.note ?? language.value?.description
})
</script>

<template>
  <div v-if="language" class="mx-4 my-2">
    <header class="mb-6">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <div class="flex items-center gap-4 mt-3">
        <img
          v-if="language.logo"
          :src="withBase(language.logo)"
          :alt="`${language.name} logo`"
          class="h-12 w-12 object-contain"
        >
        <div>
          <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
            {{ language.name }}
            <UBadge v-if="language.kind" color="neutral" variant="subtle" size="sm" class="capitalize">
              {{ language.kind }}
            </UBadge>
            <UBadge
              v-if="language.status && language.status !== 'active'"
              color="neutral"
              variant="outline"
              size="sm"
              class="capitalize"
            >
              {{ language.status }}
            </UBadge>
          </h1>
          <p v-if="language.note" class="text-sm opacity-75 max-w-3xl mt-1">
            {{ language.note }}
          </p>
        </div>
      </div>
      <div v-if="language.homepage" class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="language.homepage"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="subtle"
          size="sm"
          icon="i-lucide-globe"
          label="Website"
        />
      </div>
    </header>

    <div class="grid lg:grid-cols-[1fr_16rem] gap-8 items-start">
      <!-- Main column: prose (or hint) -->
      <main class="min-w-0 max-w-3xl">
        <ContentRenderer v-if="hasBody" :value="language" />
        <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
          No article yet — this page is a data row.
          <NuxtLink
            :to="`https://github.com/mlhaufe/pl-wiki/edit/master/content/languages/${route.params.slug}.md`"
            target="_blank"
            rel="noopener"
            class="underline"
          >
            Write it on GitHub
          </NuxtLink>
          or hit Compare to see it next to a documented language.
        </p>
      </main>

      <!-- Stat rail -->
      <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
        <div v-if="language.year" class="rail-row">
          <div class="rail-label">Year</div>
          <div class="tabular-nums">{{ language.year }}</div>
        </div>
        <div v-if="language.author" class="rail-row">
          <div class="rail-label">Author</div>
          <div>{{ language.author }}</div>
        </div>
        <template v-for="group in axisGroups.filter(g => g.values.length)" :key="group.label">
          <div class="rail-row">
            <div class="rail-label">{{ group.label }}</div>
            <div class="flex flex-wrap gap-1.5">
              <template v-for="v in group.values" :key="v">
                <!-- Paradigm chips link to the paradigm's page: the key is
                     the taxonomy key, which IS the paradigm page's slug. -->
                <NuxtLink
                  v-if="group.linked"
                  :to="`/paradigms/${v}`"
                  class="text-xs"
                >
                  <UBadge color="neutral" variant="subtle" size="sm" class="hover:underline">
                    {{ v }}
                  </UBadge>
                </NuxtLink>
                <UBadge v-else color="neutral" variant="subtle" size="sm">
                  {{ v }}
                </UBadge>
              </template>
            </div>
          </div>
        </template>
        <template v-for="rel in [...typedRelations, ...relations].filter(r => r.names.length)" :key="rel.label">
          <div class="rail-row">
            <div class="rail-label">{{ rel.label }}</div>
            <div class="flex flex-wrap gap-1.5">
              <template v-for="name in rel.names" :key="name">
                <NuxtLink
                  v-if="linkFor(name)?.to"
                  :to="linkFor(name)!.to"
                  class="underline decoration-dotted underline-offset-2"
                >
                  {{ name }}
                </NuxtLink>
                <span v-else class="opacity-70">{{ name }}</span>
              </template>
            </div>
          </div>
        </template>

        <!-- Explore: derived cross-views -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Explore</div>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="{ path: '/compare', query: { a: route.params.slug, b: 'python' } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
              icon="i-lucide-columns-3"
            >
              <span class="i-lucide-columns-3 size-4" /> Compare
            </NuxtLink>
            <NuxtLink
              v-for="f in linkableFacts"
              :key="`${f.axis}-${f.value}`"
              :to="{ path: '/', query: { f: `${f.axis}:${f.value}` } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-list-filter size-4 opacity-60" />
              Everything {{ f.preposition }} <span class="lowercase">{{ f.value }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Edit -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Maintain</div>
          <a
            :href="`https://github.com/mlhaufe/pl-wiki/edit/master/content/languages/${route.params.slug}.md`"
            target="_blank"
            rel="noopener"
            class="text-sm hover:underline inline-flex items-center gap-1.5"
          >
            <span class="i-lucide-pencil size-4" /> Edit this entry
          </a>
        </div>
      </aside>
    </div>

    <!-- References / sources -->
    <section v-if="referenceList.length" class="mt-10 border-t border-(--ui-border-accented) pt-4 max-w-3xl">
      <h2 class="text-sm font-semibold uppercase tracking-wide opacity-60 mb-3">
        Sources & references
      </h2>
      <ul class="space-y-1.5">
        <li v-for="ref in referenceList" :key="ref.url" class="text-sm">
          <a
            :href="ref.url"
            target="_blank"
            rel="noopener"
            class="hover:underline inline-flex items-baseline gap-2"
          >
            <span class="i-lucide-bookmark size-3.5 opacity-50 shrink-0 self-center" />
            <span class="opacity-90">{{ ref.title }}</span>
            <span class="opacity-50 text-xs truncate">{{ ref.host }}</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>