<script setup lang="ts">
/**
 * Paradigm page (docs/knowledgebase-plan.md §3, §4).
 *
 * One page per programming paradigm — the sibling concept to a language
 * entry. The paradigm's fact row lives in `content/paradigms/<key>.md`;
 * the file name IS the taxonomy key, so this route reads it by path.
 *
 * The member list is DERIVED, never stored: it is every language whose
 * `paradigms:` array contains this paradigm's key. A stored list would go
 * stale the moment a language entry changed, so the page computes it at
 * build time from the languages collection instead (the same reason the
 * frontmatter has no `members` field).
 */
const route = useRoute()

const { data: paradigm } = await useAsyncData(`paradigm-${route.params.slug}`, () =>
  queryCollection('paradigms').path(`/paradigms/${route.params.slug}`).first()
)

if (!paradigm.value) {
  throw createError({ statusCode: 404, statusMessage: 'Paradigm not found', fatal: true })
}

// Derived members: languages carrying this paradigm in their `paradigms:`
// array. The array is persisted as JSON text, so containment is a LIKE
// match on the quoted value.
const { data: members } = await useAsyncData(`paradigm-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'note')
    .where('paradigms', 'LIKE', `%"${route.params.slug}"%`)
    .order('name', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Typed relation edges to OTHER paradigms (kind from RELATION_KINDS). */
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
  const edges = (paradigm.value as { relations?: { name: string, kind: string }[] } | null)?.relations ?? []
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

/** Full reference list: homepage first ("Official site"), then titled references, then untitled urls. */
const referenceList = computed(() => {
  const p = paradigm.value as {
    homepage?: string | null
    urls?: string[] | null
    references?: { url: string, title: string }[] | null
  } | null
  if (!p) return []
  const out: { url: string, title: string, host: string }[] = []
  if (p.homepage) {
    out.push({ url: p.homepage, title: 'Official site', host: hostOf(p.homepage) })
  }
  const seen = new Set(out.map(r => r.url))
  for (const ref of p.references ?? []) {
    if (seen.has(ref.url)) continue
    seen.add(ref.url)
    out.push({ url: ref.url, title: ref.title, host: hostOf(ref.url) })
  }
  for (const url of p.urls ?? []) {
    if (seen.has(url)) continue
    seen.add(url)
    out.push({ url, title: hostOf(url), host: hostOf(url) })
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

const hasBody = computed(() => {
  const body = paradigm.value?.body
  return Array.isArray((body as unknown as { value?: unknown[] })?.value)
    && (body as unknown as { value: unknown[] }).value.length > 0
})

/** "Languages using this paradigm" — deep link into the faceted index. */
const exploreLink = computed(() => ({
  path: '/',
  query: { f: `paradigms:${route.params.slug}` }
}))

useSeoMeta({
  title: paradigm.value?.title,
  description: paradigm.value?.note ?? paradigm.value?.description
})
</script>

<template>
  <div v-if="paradigm" class="mx-4 my-2">
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
          v-if="paradigm.logo"
          :src="withBase(paradigm.logo)"
          :alt="`${paradigm.name} logo`"
          class="h-12 w-12 object-contain"
        >
        <div>
          <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
            {{ paradigm.name }}
            <UBadge
              v-if="paradigm.status && paradigm.status !== 'active'"
              color="neutral"
              variant="outline"
              size="sm"
              class="capitalize"
            >
              {{ paradigm.status }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              paradigm
            </UBadge>
          </h1>
          <p v-if="paradigm.note" class="text-sm opacity-75 max-w-3xl mt-1">
            {{ paradigm.note }}
          </p>
        </div>
      </div>
      <div v-if="paradigm.homepage" class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="paradigm.homepage"
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
        <ContentRenderer v-if="hasBody" :value="paradigm" />
        <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
          No article yet — this page is a data row.
          <NuxtLink
            :to="`https://github.com/mlhaufe/pl-wiki/edit/master/content/paradigms/${route.params.slug}.md`"
            target="_blank"
            rel="noopener"
            class="underline"
          >
            Write it on GitHub
          </NuxtLink>
          or pick a member language to read a worked example.
        </p>

        <!-- Derived member list: computed from the languages collection,
             so it can never disagree with it. -->
        <section v-if="memberList.length" class="mt-10">
          <h2 class="text-sm font-semibold uppercase tracking-wide opacity-60 mb-3">
            Languages using this paradigm ({{ memberList.length }})
          </h2>
          <ul class="space-y-1.5">
            <li v-for="m in memberList" :key="m.path" class="text-sm flex items-baseline gap-2">
              <img
                v-if="m.logo"
                :src="withBase(m.logo)"
                :alt="`${m.name} logo`"
                class="size-4 object-contain self-center"
              >
              <NuxtLink :to="m.path" class="hover:underline">
                {{ m.name }}
              </NuxtLink>
              <span v-if="m.year" class="opacity-50 text-xs tabular-nums">{{ m.year }}</span>
            </li>
          </ul>
        </section>
      </main>

      <!-- Stat rail -->
      <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
        <div v-if="paradigm.year" class="rail-row">
          <div class="rail-label">Year</div>
          <div class="tabular-nums">{{ paradigm.year }}</div>
        </div>
        <div v-if="paradigm.author" class="rail-row">
          <div class="rail-label">Author</div>
          <div>{{ paradigm.author }}</div>
        </div>
        <div v-if="paradigm.features?.length" class="rail-row">
          <div class="rail-label">Defining traits</div>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="f in paradigm.features" :key="f" color="neutral" variant="subtle" size="sm">
              {{ f }}
            </UBadge>
          </div>
        </div>
        <template v-for="rel in typedRelations.filter(r => r.names.length)" :key="rel.label">
          <div class="rail-row">
            <div class="rail-label">{{ rel.label }}</div>
            <div class="flex flex-wrap gap-1.5">
              <NuxtLink
                v-for="name in rel.names"
                :key="name"
                :to="`/paradigms/${name}`"
                class="underline decoration-dotted underline-offset-2"
              >
                {{ name }}
              </NuxtLink>
            </div>
          </div>
        </template>

        <!-- Explore: derived cross-views -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Explore</div>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="exploreLink"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-list-filter size-4 opacity-60" />
              All {{ memberList.length }} languages
            </NuxtLink>
          </div>
        </div>

        <!-- Edit -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Maintain</div>
          <a
            :href="`https://github.com/mlhaufe/pl-wiki/edit/master/content/paradigms/${route.params.slug}.md`"
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
