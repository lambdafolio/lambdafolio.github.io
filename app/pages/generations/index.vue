<script setup lang="ts">
/**
 * Generation index (`/generations`, docs/knowledgebase-plan.md §3c).
 *
 * One card per programming-language generation — the ladder from machine code
 * to logic/AI. Unlike the family and paradigm indexes this is a FIXED list of
 * five: the tiers are canonical, not discovered from the corpus, so all five
 * always render even when a tier has no members.
 *
 * A generation page exists to answer "what does this tier denote?", so the
 * card carries the tier's definition (its `features`) and its lifecycle
 * `status` rather than a member count as the headline.
 *
 * Member counts are DERIVED on every build via an exact `generation` equality
 * on the languages collection — never stored.
 */
const { data: generations } = await useAsyncData('generations-index', () =>
  queryCollection('generations')
    .select('name', 'path', 'logo', 'status', 'year', 'features', 'note')
    .order('path', 'ASC')
    .all()
)

// Derived member counts: one equality query per tier over the languages
// collection. Five build-time queries against a small corpus.
const { data: counts } = await useAsyncData('generation-member-counts', async () => {
  const keys = (generations.value ?? []).map(g => g.path.replace('/generations/', ''))
  const rows = await Promise.all(keys.map(async (key) => {
    const m = await queryCollection('languages')
      .select('name')
      .where('generation', '=', key)
      .all()
    return [key, m.length] as const
  }))
  return Object.fromEntries(rows)
})

const cards = computed(() => (generations.value ?? []).map(g => ({
  ...g,
  key: g.path.replace('/generations/', ''),
  memberCount: counts.value?.[g.path.replace('/generations/', '')] ?? 0
})))

useSeoMeta({
  title: 'Language generations',
  description: 'The 1GL–5GL ladder: machine code, assembly, high-level, declarative, and logic languages — what each tier denotes and which languages belong to it.'
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
        Language generations
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        The generation ladder describes <em>abstraction height</em> — how far a
        notation sits above the machine. It is a different question from
        paradigm (what a language does) and from family (what it descends
        from). Each tier's page records what qualifies a language as that
        generation, and which languages in this corpus carry the label.
      </p>
      <blockquote class="text-sm opacity-70 max-w-3xl mt-4 border-l-2 border-(--ui-border-accented) pl-3">
        “A programming language is low level when its programs require
        attention to the irrelevant.”
        <footer class="text-xs opacity-80 mt-1 not-italic">
          — Alan J. Perlis,
          <a
            href="https://www.cs.yale.edu/homes/perlis-alan/quotes.html"
            target="_blank"
            rel="noopener"
            class="underline decoration-dotted underline-offset-2"
          >Epigrams in Programming</a>, epigram 8 (1982)
        </footer>
      </blockquote>
      <p class="text-sm opacity-70 max-w-3xl mt-3">
        That sentence is the working definition behind these pages. A tier earns
        its number by deleting one specific kind of <em>irrelevant</em> work from
        the programmer's attention — encoding, then instruction selection, then
        procedure — which is also why the ladder stalls: once nothing irrelevant
        is left to delete, a new number adds a word rather than a capability.
      </p>
    </header>

    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <NuxtLink
        v-for="g in cards"
        :key="g.path"
        :to="g.path"
        class="block rounded-md border border-(--ui-border-accented) p-4 hover:border-(--ui-primary) transition-colors"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="g.logo"
            :src="withBase(g.logo)"
            :alt="`${g.name} logo`"
            class="size-8 object-contain shrink-0"
          >
          <div class="min-w-0">
            <h2 class="font-semibold flex items-center gap-2 flex-wrap">
              <code class="text-xs uppercase opacity-60">{{ g.key }}</code>
              {{ g.name }}
              <UBadge
                v-if="g.status && g.status !== 'active'"
                color="neutral"
                variant="outline"
                size="sm"
                class="capitalize"
              >
                {{ g.status }}
              </UBadge>
            </h2>
            <p v-if="g.note" class="text-sm opacity-70 mt-1 line-clamp-3">
              {{ g.note }}
            </p>
            <div v-if="g.features?.length" class="flex flex-wrap gap-1.5 mt-2">
              <UBadge v-for="feat in g.features.slice(0, 4)" :key="feat" color="neutral" variant="subtle" size="sm">
                {{ feat }}
              </UBadge>
            </div>
            <p class="text-xs opacity-50 mt-2 tabular-nums">
              {{ g.memberCount }} {{ g.memberCount === 1 ? 'language' : 'languages' }} in this corpus
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <p class="text-xs opacity-60 mt-8 max-w-3xl">
      The ladder is a canonical five, not a corpus-derived vocabulary — every
      tier has a page whether or not a language carries it. A tier with no
      members is a documented fact about this corpus, not a gap. Language
      entries are not tagged with a generation unless a source states the tier
      directly; the value is never derived from a language's year or paradigm.
    </p>
  </div>
</template>
