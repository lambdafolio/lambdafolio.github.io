<script setup lang="ts">
/**
 * Feature page (`/features/<key>`).
 *
 * Sibling of the paradigm page, one level more concrete: a feature is a
 * mechanism a language provides, so the page is mostly its members and what
 * they do with it. The fact row lives in `content/features/<key>.md`; the
 * file name IS the tag that language entries carry in `features:`.
 *
 * The member list is DERIVED, never stored — every language whose `features`
 * array contains this key. A stored list would go stale the moment a
 * language entry changed.
 */
const route = useRoute()

const { data: feature } = await useAsyncData(`feature-${route.params.slug}`, () =>
  queryCollection('features').path(`/features/${route.params.slug}`).first()
)

if (!feature.value) {
  throw createError({ statusCode: 404, statusMessage: 'Feature not found', fatal: true })
}

// Derived members: languages carrying this feature in their `features:` array.
// The array is persisted as JSON text, so containment is a LIKE match on the
// quoted value.
const { data: members } = await useAsyncData(`feature-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'note', 'paradigms', 'typing')
    .where('features', 'LIKE', `%"${route.params.slug}"%`)
    .order('year', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Other promoted features to browse (siblings in the collection). */
const { data: siblings } = await useAsyncData('features-siblings', () =>
  queryCollection('features').select('name', 'path').order('name', 'ASC').all()
)
const otherFeatures = computed(() =>
  (siblings.value ?? []).filter(f => f.path !== `/features/${route.params.slug}`)
)

/**
 * Member languages grouped by paradigm. A mechanism is usually unevenly
 * distributed across language families, so the grouping answers the obvious
 * next question ("does this show up in functional languages?") without the
 * reader filtering by hand. Derived from the same rows, never stored.
 */
const byParadigm = computed(() => {
  const groups = new Map<string, typeof memberList.value>()
  for (const m of memberList.value) {
    const tags = (m as { paradigms?: string[] | null }).paradigms ?? []
    for (const tag of tags.length ? tags : ['(none listed)']) {
      if (!groups.has(tag)) groups.set(tag, [])
      groups.get(tag)!.push(m)
    }
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
})

/** Full reference list: homepage first ("Official site"), then titled references, then untitled urls. */
const referenceList = computed(() => {
  const f = feature.value as {
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
  const body = feature.value?.body
  return Array.isArray((body as unknown as { value?: unknown[] })?.value)
    && (body as unknown as { value: unknown[] }).value.length > 0
})

/** "Languages with this feature" — deep link into the faceted index. */
const exploreLink = computed(() => ({
  path: '/',
  query: { f: `features:${route.params.slug}` }
}))

useSeoMeta({
  title: feature.value?.title,
  description: feature.value?.note ?? feature.value?.description
})
</script>

<template>
  <div v-if="feature" class="mx-4 my-2">
    <header class="mb-6">
      <UButton
        to="/features"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All features"
      />
      <div class="flex items-center gap-4 mt-3">
        <img
          v-if="feature.logo"
          :src="withBase(feature.logo)"
          :alt="`${feature.name} logo`"
          class="h-12 w-12 object-contain"
        >
        <div>
          <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
            {{ feature.name }}
            <UBadge
              v-if="feature.status && feature.status !== 'active'"
              color="neutral"
              variant="outline"
              size="sm"
              class="capitalize"
            >
              {{ feature.status }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              feature
            </UBadge>
          </h1>
          <p v-if="feature.note" class="text-sm opacity-75 max-w-3xl mt-1">
            {{ feature.note }}
          </p>
        </div>
      </div>
      <div v-if="feature.homepage" class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="feature.homepage"
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
        <ContentRenderer v-if="hasBody" :value="feature" />
        <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
          No article yet — this page is a data row.
          <NuxtLink
            :to="`https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/features/${route.params.slug}.md`"
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
            Languages with this feature ({{ memberList.length }})
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
              <span v-if="m.typing" class="opacity-50 text-xs">{{ m.typing }}</span>
            </li>
          </ul>

          <!-- Same rows, re-grouped: the mechanism's distribution across
               language families, which is the question a reader asks next. -->
          <div v-if="byParadigm.length > 1" class="mt-6">
            <h3 class="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">
              By paradigm
            </h3>
            <div class="space-y-1">
              <div v-for="[tag, list] in byParadigm" :key="tag" class="text-sm flex items-baseline gap-2">
                <NuxtLink
                  v-if="tag !== '(none listed)'"
                  :to="`/paradigms/${tag}`"
                  class="shrink-0 underline decoration-dotted underline-offset-2"
                >
                  {{ tag }}
                </NuxtLink>
                <span v-else class="shrink-0 opacity-50">{{ tag }}</span>
                <span class="opacity-50 text-xs tabular-nums">{{ list.length }}</span>
                <span class="opacity-70 text-xs truncate">
                  {{ list.map(l => l.name).join(', ') }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Stat rail -->
      <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
        <div class="rail-row">
          <div class="rail-label">Key</div>
          <div><code class="text-xs">{{ route.params.slug }}</code></div>
        </div>
        <div v-if="feature.year" class="rail-row">
          <div class="rail-label">First appeared</div>
          <div class="tabular-nums">{{ feature.year }}</div>
        </div>
        <div class="rail-row">
          <div class="rail-label">Languages</div>
          <div class="tabular-nums">{{ memberList.length }}</div>
        </div>
        <div v-if="feature.relates_to?.length" class="rail-row">
          <div class="rail-label">Often combined with</div>
          <div class="flex flex-wrap gap-1.5">
            <NuxtLink
              v-for="r in feature.relates_to"
              :key="r"
              :to="`/features/${r}`"
              class="text-xs underline decoration-dotted underline-offset-2"
            >
              {{ r }}
            </NuxtLink>
          </div>
        </div>

        <!-- Explore: derived cross-views -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Explore</div>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="exploreLink"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-list-filter size-4 opacity-60" />
              All {{ memberList.length }} in the catalog
            </NuxtLink>
            <NuxtLink
              to="/features"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <span class="i-lucide-shapes size-4 opacity-60" />
              Other features
            </NuxtLink>
          </div>
        </div>

        <div v-if="otherFeatures.length" class="rail-row">
          <div class="rail-label">Features</div>
          <div class="flex flex-wrap gap-1.5">
            <NuxtLink
              v-for="o in otherFeatures"
              :key="o.path"
              :to="o.path"
              class="text-xs underline decoration-dotted underline-offset-2"
            >
              {{ o.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Edit -->
        <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
          <div class="rail-label">Maintain</div>
          <a
            :href="`https://github.com/lambdafolio/lambdafolio.github.io/edit/master/content/features/${route.params.slug}.md`"
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
