<script setup lang="ts">
/**
 * Family index (`/families`, docs/knowledgebase-plan.md §3b).
 *
 * The third browse view, alongside the languages and paradigms indexes: one
 * card per language family — the lineage axis. A family answers "what does
 * this language descend from?", which is orthogonal to what a language does
 * (`paradigms`) and to what sort of row it is (`kind`).
 *
 * The member count is DERIVED on every build from the languages collection via
 * an exact `family` equality — not a LIKE over a JSON-text array, because the
 * language side is a scalar. Same anti-staleness guarantee as the sibling
 * indexes, cheaper query.
 */
const { data: families } = await useAsyncData('families-index', () =>
  queryCollection('families')
    .select('name', 'path', 'logo', 'status', 'year', 'features', 'note')
    .order('name', 'ASC')
    .all()
)

// Derived member counts: one equality query per family over the languages
// collection. The corpus is small enough that N build-time queries are cheaper
// than a stored count that could drift.
const { data: counts } = await useAsyncData('family-member-counts', async () => {
  const keys = (families.value ?? []).map(f => f.path.replace('/families/', ''))
  const rows = await Promise.all(keys.map(async (key) => {
    const m = await queryCollection('languages')
      .select('name')
      .where('family', '=', key)
      .all()
    return [key, m.length] as const
  }))
  return Object.fromEntries(rows)
})

const cards = computed(() => (families.value ?? []).map(f => ({
  ...f,
  key: f.path.replace('/families/', ''),
  memberCount: counts.value?.[f.path.replace('/families/', '')] ?? 0
})))

useSeoMeta({
  title: 'Language families',
  description: 'Lineages programming languages descend from — Smalltalk, ML, ECMAScript, Lisp, C, Algol — and the languages in each.'
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
        Language families
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        A family is lineage, not classification: it answers which language a
        language descends from. Smalltalk is object-oriented <em>and</em> in the
        Smalltalk family — the two facts are independent. Each page lists its
        members, derived from the language entries, so it is never out of date.
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
            <div v-if="f.features?.length" class="flex flex-wrap gap-1.5 mt-2">
              <UBadge v-for="feat in f.features.slice(0, 4)" :key="feat" color="neutral" variant="subtle" size="sm">
                {{ feat }}
              </UBadge>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <p class="text-xs opacity-60 mt-8 max-w-3xl">
      A language declares at most one family — lineage is a tree at this
      granularity. Cross-family descent is recorded on the family page as a
      <code>derived-from</code> edge between families.
    </p>
  </div>
</template>
