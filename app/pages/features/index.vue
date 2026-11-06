<script setup lang="ts">
/**
 * Feature index (`/features`).
 *
 * The third browse view, alongside the languages and paradigms indexes: one
 * card per *promoted* feature (the curated subset of the free-form `features`
 * tags that earned a page — see app/utils/taxonomy.ts §FEATURES). The member
 * count is derived from the languages collection on every build, so it can
 * never go stale.
 */
const { data: features } = await useAsyncData('features-index', () =>
  queryCollection('features')
    .select('name', 'path', 'logo', 'status', 'year', 'note')
    .order('name', 'ASC')
    .all()
)

// Derived member counts: one LIKE query per feature over the languages
// collection. Same trade-off as the paradigm index — N build-time queries are
// cheaper than a stored count that could drift.
const { data: counts } = await useAsyncData('feature-member-counts', async () => {
  const keys = (features.value ?? []).map(f => f.path.replace('/features/', ''))
  const rows = await Promise.all(keys.map(async (key) => {
    const m = await queryCollection('languages')
      .select('name')
      .where('features', 'LIKE', `%"${key}"%`)
      .all()
    return [key, m.length] as const
  }))
  return Object.fromEntries(rows)
})

const cards = computed(() => (features.value ?? []).map(f => ({
  ...f,
  key: f.path.replace('/features/', ''),
  memberCount: counts.value?.[f.path.replace('/features/', '')] ?? 0
})))

useSeoMeta({
  title: 'Language features',
  description: 'Mechanisms programming languages provide — closures, pattern matching, prototypes, regular expressions — and the languages that have them.'
})
</script>

<template>
  <div class="mx-4 my-2">
    <header class="mb-6">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <h1 class="text-3xl font-semibold my-2">
        Language features
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        The mechanisms a language provides, one page each. These are the
        features the catalog has promoted to their own entry — those several
        languages declare, so the page has something to compare. The member
        list is derived from the language entries, so it is never out of date.
      </p>
    </header>

    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <NuxtLink
        v-for="f in cards"
        :key="f.path"
        :to="f.path"
        class="block rounded-md border border-(--ui-border-accented) p-4 hover:border-(--ui-primary) transition-colors"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="f.logo"
            :src="withBase(f.logo)"
            :alt="`${f.name} logo`"
            class="size-8 object-contain shrink-0"
          >
          <div class="min-w-0">
            <h2 class="font-semibold flex items-center gap-2 flex-wrap">
              {{ f.name }}
              <span class="text-xs font-normal opacity-50 tabular-nums">
                {{ f.memberCount }} {{ f.memberCount === 1 ? 'language' : 'languages' }}
              </span>
            </h2>
            <p v-if="f.note" class="text-sm opacity-70 mt-1 line-clamp-3">
              {{ f.note }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <p class="text-xs opacity-60 mt-8 max-w-3xl">
      Everything else in a language entry's <code>features</code> list is a tag
      for the filter sidebar — a feature earns a page here once at least three
      language entries declare it.
    </p>
  </div>
</template>
