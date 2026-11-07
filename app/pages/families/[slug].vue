<script setup lang="ts">
/**
 * Family page (`/families/<key>`, docs/knowledgebase-plan.md §3b).
 *
 * Sibling of the paradigm and feature pages, on the lineage axis. The fact row
 * lives in `content/families/<key>.md`; the file name IS the join key that
 * language entries carry in their scalar `family:` field.
 *
 * The member list is DERIVED, never stored — every language whose `family`
 * equals this key. Unlike the paradigm/feature joins (a LIKE over a JSON-text
 * array) this is an exact equality on a scalar, so it uses the `family` index.
 */
const route = useRoute()

const { data: family } = await useAsyncData(`family-${route.params.slug}`, () =>
  queryCollection('families').path(`/families/${route.params.slug}`).first()
)

if (!family.value) {
  throw createError({ statusCode: 404, statusMessage: 'Family not found', fatal: true })
}

// Derived members: languages whose scalar `family` equals this key.
const { data: members } = await useAsyncData(`family-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'status', 'note', 'paradigms', 'typing')
    .where('family', '=', route.params.slug)
    .order('year', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Other families to browse (siblings in the collection). */
const { data: siblings } = await useAsyncData('family-siblings', () =>
  queryCollection('families').select('name', 'path').order('name', 'ASC').all()
)
const otherFamilies = computed(() =>
  (siblings.value ?? []).filter(f => f.path !== `/families/${route.params.slug}`)
)

/** Typed relation edges to OTHER families (kind from RELATION_KINDS). */
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
  const edges = (family.value as { relations?: { name: string, kind: string }[] } | null)?.relations ?? []
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
  const f = family.value as {
    homepage?: string | null
    urls?: string[] | null
    references?: { url: string, title: string }[] | null
  } | null
  if (!f) return []
  const out: { url: string, title: string, host: string }[] = []
  if (f.homepage) {
    out.push({ url: f.homepage, title: 'Official site', host: hostOf(f.homepage) })
  }
  const seen = new Set(out.map(r => r.url))
  for (const ref of f.references ?? []) {
    if (seen.has(ref.url)) continue
    seen.add(ref.url)
    out.push({ url: ref.url, title: ref.title, host: hostOf(ref.url) })
  }
  for (const url of f.urls ?? []) {
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
  const body = family.value?.body
  return Array.isArray((body as unknown as { value?: unknown[] })?.value)
    && (body as unknown as { value: unknown[] }).value.length > 0
})

/** "Languages in this family" — deep link into the faceted index. */
const exploreLink = computed(() => ({
  path: '/',
  query: { f: `family:${route.params.slug}` }
}))

useSeoMeta({
  title: family.value?.title,
  description: family.value?.note ?? family.value?.description
})
</script>

<template>
  <div v-if="family" class="mx-4 my-2">
    <header class="mb-6">
      <UButton
        to="/families"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All families"
      />
      <div class="flex items-center gap-4 mt-3">
        <img
          v-if="family.logo"
          :src="withBase(family.logo)"
          :alt="`${family.name} logo`"
          class="h-12 w-12 object-contain"
        >
        <div>
          <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
            {{ family.name }}
            <UBadge
              v-if="family.status && family.status !== 'active'"
              color="neutral"
              variant="outline"
              size="sm"
              class="capitalize"
            >
              {{ family.status }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              family
            </UBadge>
          </h1>
          <p v-if="family.note" class="text-sm opacity-75 max-w-3xl mt-1">
            {{ family.note }}
          </p>
        </div>
      </div>
      <div v-if="family.homepage" class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="family.homepage"
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
        <ContentRenderer v-if="hasBody" :value="family" />
        <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
          No article yet — this page is a data row.
          <NuxtLink
            :to="`https://github.com/mlhaufe/pl-wiki/edit/master/content/families/${route.params.slug}.md`"
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
            Languages in this family ({{ memberList.length }})
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
              <span v-if="(m as { kind?: string | null }).kind" class="opacity-40 text-xs">
                {{ (m as { kind?: string | null }).kind }}
              </span>
            </li>
          </ul>
        </section>
        <p v-else class="text-sm opacity-50 mt-10">
          No language entry declares this family yet.
        </p>
      </main>

      <!-- Stat rail -->
      <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
        <div v-if="family.year" class="rail-row">
          <div class="rail-label">Origin</div>
          <div class="tabular-nums">{{ family.year }}</div>
        </div>
        <div v-if="family.author" class="rail-row">
          <div class="rail-label">Originator</div>
          <div>{{ family.author }}</div>
        </div>
        <div v-if="family.features?.length" class="rail-row">
          <div class="rail-label">Shared traits</div>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="feat in family.features" :key="feat" color="neutral" variant="subtle" size="sm">
              {{ feat }}
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
                :to="`/families/${name}`"
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
            <NuxtLink
              v-for="f in otherFamilies"
              :key="f.path"
              :to="f.path"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-git-branch size-4 opacity-60" />
              {{ f.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Edit -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Maintain</div>
          <a
            :href="`https://github.com/mlhaufe/pl-wiki/edit/master/content/families/${route.params.slug}.md`"
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
        Sources &amp; references
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
