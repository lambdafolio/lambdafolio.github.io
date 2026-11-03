<script setup lang="ts">
/**
 * Paradigm index (docs/knowledgebase-plan.md §3, §4 route `/paradigms`).
 *
 * The sibling browse view to the language index: one card per paradigm,
 * with the member count derived from the languages collection. The count is
 * a corpus fact, not a stored field — it moves when language entries move.
 */
const { data: paradigms } = await useAsyncData('paradigms-index', () =>
  queryCollection('paradigms')
    .select('name', 'path', 'logo', 'status', 'year', 'features', 'note')
    .order('name', 'ASC')
    .all()
)

// Member counts, derived: one LIKE query per paradigm over the languages
// collection. The corpus is small enough that N queries at build time are
// cheaper than a hand-maintained count that could go stale.
const { data: counts } = await useAsyncData('paradigm-member-counts', async () => {
  const keys = (paradigms.value ?? []).map(p => p.path.replace('/paradigms/', ''))
  const rows = await Promise.all(keys.map(async (key) => {
    const m = await queryCollection('languages')
      .select('name')
      .where('paradigms', 'LIKE', `%"${key}"%`)
      .all()
    return [key, m.length] as const
  }))
  return Object.fromEntries(rows)
})

const cards = computed(() => (paradigms.value ?? []).map(p => ({
  ...p,
  key: p.path.replace('/paradigms/', ''),
  memberCount: counts.value?.[p.path.replace('/paradigms/', '')] ?? 0
})))

useSeoMeta({
  title: 'Programming paradigms',
  description: 'The paradigms programming languages draw on: definitions, origins, and the languages that use them.'
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
        Programming paradigms
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        The paradigms a language draws on. Each page explains the paradigm and
        lists the languages that use it — the member list is derived from the
        language entries, so it is never out of date.
      </p>
    </header>

    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <NuxtLink
        v-for="p in cards"
        :key="p.path"
        :to="p.path"
        class="block rounded-md border border-(--ui-border-accented) p-4 hover:border-(--ui-primary) transition-colors"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="p.logo"
            :src="withBase(p.logo)"
            :alt="`${p.name} logo`"
            class="size-8 object-contain shrink-0"
          >
          <div class="min-w-0">
            <h2 class="font-semibold flex items-center gap-2 flex-wrap">
              {{ p.name }}
              <span class="text-xs font-normal opacity-50 tabular-nums">
                {{ p.memberCount }} {{ p.memberCount === 1 ? 'language' : 'languages' }}
              </span>
            </h2>
            <p v-if="p.note" class="text-sm opacity-70 mt-1 line-clamp-3">
              {{ p.note }}
            </p>
            <div v-if="p.features?.length" class="flex flex-wrap gap-1.5 mt-2">
              <UBadge v-for="f in p.features.slice(0, 4)" :key="f" color="neutral" variant="subtle" size="sm">
                {{ f }}
              </UBadge>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
