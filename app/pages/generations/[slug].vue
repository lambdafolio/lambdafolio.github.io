<script setup lang="ts">
/**
 * Generation page (`/generations/<key>`, docs/knowledgebase-plan.md §3c).
 *
 * Sibling of the family page, on the abstraction axis. The fact row lives in
 * `content/generations/<key>.md`; the file name IS the join key that language
 * entries carry in their scalar `generation:` field.
 *
 * This page is where a tier is DEFINED. The enum on a language entry records
 * a value; only the page can say what the value means, whether the tier is a
 * live category, and which sources establish it. The `features` array is the
 * membership criterion — the same role it plays on a paradigm page.
 *
 * Members are DERIVED, never stored: every language whose scalar `generation`
 * equals this key. An empty list is a legitimate, documented result.
 */
const route = useRoute()

const { data: generation } = await useAsyncData(`generation-${route.params.slug}`, () =>
  queryCollection('generations').path(`/generations/${route.params.slug}`).first()
)

if (!generation.value) {
  throw createError({ statusCode: 404, statusMessage: 'Generation not found', fatal: true })
}

// Derived members: languages whose scalar `generation` equals this key.
const { data: members } = await useAsyncData(`generation-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'status', 'note', 'paradigms', 'typing')
    .where('generation', '=', route.params.slug)
    .order('year', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Other tiers to browse (siblings in the collection, ladder order). */
const { data: siblings } = await useAsyncData('generation-siblings', () =>
  queryCollection('generations').select('name', 'path').order('path', 'ASC').all()
)
const otherGenerations = computed(() =>
  (siblings.value ?? []).filter(g => g.path !== `/generations/${route.params.slug}`)
)

/** Full reference list: homepage first ("Official site"), then titled references, then untitled urls. */
const referenceList = computed(() => {
  const g = generation.value as {
    homepage?: string | null
    urls?: string[] | null
    references?: { url: string, title: string }[] | null
  } | null
  if (!g) return []
  const out: { url: string, title: string, host: string }[] = []
  if (g.homepage) {
    out.push({ url: g.homepage, title: 'Official site', host: hostOf(g.homepage) })
  }
  const seen = new Set(out.map(r => r.url))
  for (const ref of g.references ?? []) {
    if (seen.has(ref.url)) continue
    seen.add(ref.url)
    out.push({ url: ref.url, title: ref.title, host: hostOf(ref.url) })
  }
  for (const url of g.urls ?? []) {
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
  const body = generation.value?.body
  return Array.isArray((body as unknown as { value?: unknown[] })?.value)
    && (body as unknown as { value: unknown[] }).value.length > 0
})

/** "Languages at this tier" — deep link into the faceted index. */
const exploreLink = computed(() => ({
  path: '/',
  query: { f: `generation:${route.params.slug}` }
}))

useSeoMeta({
  title: generation.value?.title,
  description: generation.value?.note ?? generation.value?.description
})
</script>

<template>
  <div v-if="generation" class="mx-4 my-2">
    <header class="mb-6">
      <UButton
        to="/generations"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All generations"
      />
      <div class="flex items-center gap-4 mt-3">
        <img
          v-if="generation.logo"
          :src="withBase(generation.logo)"
          :alt="`${generation.name} logo`"
          class="h-12 w-12 object-contain"
        >
        <div>
          <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
            {{ generation.name }}
            <UBadge
              v-if="generation.status && generation.status !== 'active'"
              color="neutral"
              variant="outline"
              size="sm"
              class="capitalize"
            >
              {{ generation.status }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              <code>{{ route.params.slug }}</code>
            </UBadge>
          </h1>
          <p v-if="generation.note" class="text-sm opacity-75 max-w-3xl mt-1">
            {{ generation.note }}
          </p>
        </div>
      </div>
      <div v-if="generation.homepage" class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="generation.homepage"
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
        <ContentRenderer v-if="hasBody" :value="generation" />
        <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
          No definition written yet — this page is a data row.
          <NuxtLink
            :to="`https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/generations/${route.params.slug}.md`"
            target="_blank"
            rel="noopener"
            class="underline"
          >
            Write it on GitHub
          </NuxtLink>
          or compare it against a neighbouring tier.
        </p>

        <!-- Derived member list: computed from the languages collection,
             so it can never disagree with it. An empty list is a documented
             fact about this corpus, not a missing page. -->
        <section v-if="memberList.length" class="mt-10">
          <h2 class="text-sm font-semibold uppercase tracking-wide opacity-60 mb-3">
            Languages at this tier ({{ memberList.length }})
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
          No language entry is tagged as this generation yet. That may be the
          honest answer — the corpus has no machine-code or assembly rows — or
          it may mean the tag has not been curated yet.
        </p>
      </main>

      <!-- Stat rail -->
      <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
        <div v-if="generation.year" class="rail-row">
          <div class="rail-label">Era begins</div>
          <div class="tabular-nums">{{ generation.year }}</div>
        </div>
        <div v-if="generation.author" class="rail-row">
          <div class="rail-label">Originator</div>
          <div>{{ generation.author }}</div>
        </div>
        <div v-if="generation.features?.length" class="rail-row">
          <div class="rail-label">Membership criterion</div>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="feat in generation.features" :key="feat" color="neutral" variant="subtle" size="sm">
              {{ feat }}
            </UBadge>
          </div>
        </div>

        <!-- Explore: derived cross-views -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Other tiers</div>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              v-for="g in otherGenerations"
              :key="g.path"
              :to="g.path"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-layers size-4 opacity-60" />
              {{ g.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Edit -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Maintain</div>
          <a
            :href="`https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/generations/${route.params.slug}.md`"
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
