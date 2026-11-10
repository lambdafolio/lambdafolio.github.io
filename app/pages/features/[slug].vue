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
 *
 * Layout (header / grid / rail / sources) comes from the shared entry
 * components; this file owns only what is specific to a feature.
 */
import { buildReferenceList, hasRenderableBody } from '~/utils/entries'

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
  const groups = new Map<string, (typeof memberList.value)>()
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

const referenceList = computed(() => buildReferenceList(feature.value))
const hasBody = computed(() => hasRenderableBody(feature.value))

useSeoMeta({
  title: feature.value?.title,
  description: feature.value?.note ?? feature.value?.description
})
</script>

<template>
  <div v-if="feature" class="mx-4 my-2">
    <EntryHeader
      :name="feature.name"
      :logo="feature.logo"
      :note="feature.note"
      :homepage="feature.homepage"
      :badges="[
        ...(feature.status && feature.status !== 'active'
          ? [{ label: feature.status, variant: 'outline' as const }]
          : []),
        { label: 'feature' }
      ]"
      back-to="/features"
      back-label="All features"
    />

    <EntryLayout
      collection="features"
      :slug="route.params.slug"
      :has-body="hasBody"
      :entry="feature"
    >
      <template #main>
        <EntryMembers title="Languages with this feature" :members="memberList" trailing="typing">
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
        </EntryMembers>
      </template>

      <template #rail>
        <EntryRailRow label="Key">
          <div><code class="text-xs">{{ route.params.slug }}</code></div>
        </EntryRailRow>
        <EntryRailRow v-if="feature.year" label="First appeared">
          <div class="tabular-nums">{{ feature.year }}</div>
        </EntryRailRow>
        <EntryRailRow label="Languages">
          <div class="tabular-nums">{{ memberList.length }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="feature.relates_to?.length" label="Often combined with">
          <NuxtLink
            v-for="r in feature.relates_to"
            :key="r"
            :to="`/features/${r}`"
            class="text-xs underline decoration-dotted underline-offset-2"
          >
            {{ r }}
          </NuxtLink>
        </EntryRailRow>
      </template>

      <template #explore>
        <EntryRailRow label="Explore" divided>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="{ path: '/', query: { f: `features:${route.params.slug}` } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-list-filter" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              All {{ memberList.length }} in the catalog
            </NuxtLink>
            <NuxtLink
              to="/features"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-shapes" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              Other features
            </NuxtLink>
          </div>
        </EntryRailRow>
        <EntryRailRow v-if="otherFeatures.length" label="Features">
          <NuxtLink
            v-for="o in otherFeatures"
            :key="o.path"
            :to="o.path"
            class="text-xs underline decoration-dotted underline-offset-2"
          >
            {{ o.name }}
          </NuxtLink>
        </EntryRailRow>
      </template>
    </EntryLayout>

    <EntryReferences :references="referenceList" />
  </div>
</template>
