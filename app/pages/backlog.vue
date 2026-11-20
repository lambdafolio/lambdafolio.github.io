<script setup lang="ts">
/**
 * Corpus backlog (`/backlog`) — docs/suggestion-intake-plan.md §8, mockup 04.
 *
 * Answers "what should be worked on next?" from the corpus itself, so there is
 * no issue per stub and no status field for anyone to maintain. The table is
 * read-only: the ordering is a function of what each entry already contains.
 *
 * The scoring and queue rules live in `app/utils/backlog.ts` (pure, tested);
 * this file owns only the view.
 */
import {
  backlogRows, queueCounts, type BacklogRow, type QueueId
} from '~/utils/backlog'

const { data: entries } = await useAsyncData('backlog-entries', () =>
  queryCollection('languages')
    .select('name', 'path', 'year', 'homepage', 'urls', 'references',
      'paradigms', 'family', 'typing', 'memory', 'execution', 'body')
    .order('name', 'ASC')
    .all()
)

const rows = computed(() => backlogRows((entries.value ?? []) as Parameters<typeof backlogRows>[0]))

const counts = computed(() => queueCounts(rows.value))

/** Queue filter. `all` shows everything; the three queue ids mirror QUEUES. */
const queueFilter = ref<QueueId | 'all'>('all')

/** Free text over the entry name and its missing fields. */
const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (queueFilter.value !== 'all' && row.queue !== queueFilter.value) return false
    if (!q) return true
    return row.name.toLowerCase().includes(q)
      || row.path.toLowerCase().includes(q)
      || row.missing.some(m => m.includes(q))
  })
})

/**
 * Pagination, not virtualization.
 *
 * 729 rows is enough that one long page is unusable and few enough that a
 * simple slice is fast; the same reasoning as the index's PAGE_SIZE.
 */
const PAGE_SIZE = 100
const page = ref(1)

const pageCount = computed(() => Math.max(1, Math.ceil(visible.value.length / PAGE_SIZE)))
const paged = computed(() => visible.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Reset paging whenever the filter set changes, or the visitor lands on an
// empty page after narrowing the list.
watch([queueFilter, search], () => {
  page.value = 1
})

/** Route that opens the correction form pre-targeted at one entry. */
function fixUrl(row: BacklogRow): string {
  const slug = row.path.replace(/^\//, '')
  return `/suggest?${new URLSearchParams({ entry: slug }).toString()}`
}

useSeoMeta({
  title: 'Corpus backlog — lambdafolio',
  description:
    'What the LambdaFolio pipeline will work on next, ranked from corpus state: ' +
    'prose entries missing facts first, then stubs by how much is known about them.'
})

definePageMeta({
  // Derived view over the corpus; it competes with the entry pages for crawl
  // budget and duplicates their content in a different order.
  robots: 'noindex, follow'
})
</script>

<template>
  <div class="mx-4 my-2 max-w-6xl">
    <NuxtLink to="/" class="text-xs text-(--link-color)">← Languages</NuxtLink>

    <h1 class="text-2xl font-semibold mt-3">
      Backlog
    </h1>
    <p class="text-sm opacity-70 mt-2 max-w-2xl leading-relaxed">
      What the pipeline will work on next, highest value first. Generated from the corpus,
      not hand-written — so nothing here is a claim about work in progress, only about
      what the entries themselves are still missing.
      <NuxtLink to="/suggest" class="underline">
        Request something instead
      </NuxtLink>
      if the row you want is not listed.
    </p>

    <!-- Queue summary: counts, and the filter itself -->
    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-5">
      <button
        type="button"
        class="text-left border rounded-lg p-3 transition-colors"
        :class="queueFilter === 'all'
          ? 'border-(--ui-primary) bg-(--ui-bg-elevated)'
          : 'border-(--ui-border-accented) hover:border-(--ui-primary)'"
        @click="queueFilter = 'all'"
      >
        <div class="text-xs tracking-widest opacity-60">
          ALL QUEUES
        </div>
        <div class="text-2xl font-semibold tabular-nums mt-1">
          {{ rows.length }}
        </div>
        <div class="text-xs opacity-60 mt-0.5">
          rows
        </div>
        <div class="text-xs opacity-70 mt-1">
          every entry, ranked
        </div>
      </button>

      <button
        v-for="q in counts"
        :key="q.id"
        type="button"
        class="text-left border rounded-lg p-3 transition-colors"
        :class="queueFilter === q.id
          ? 'border-(--ui-primary) bg-(--ui-bg-elevated)'
          : 'border-(--ui-border-accented) hover:border-(--ui-primary)'"
        @click="queueFilter = q.id"
      >
        <div class="text-xs tracking-widest opacity-60">
          {{ q.label.toUpperCase() }}
        </div>
        <div class="text-2xl font-semibold tabular-nums mt-1">
          {{ q.count }}
        </div>
        <div class="text-xs opacity-60 mt-0.5">
          rows
        </div>
        <div class="text-xs opacity-70 mt-1">
          {{ q.blurb }}
        </div>
      </button>
    </div>

    <!-- Search -->
    <div class="flex flex-wrap items-center gap-2 mt-5 mb-3">
      <UInput
        v-model="search"
        placeholder="Search entry or field…"
        icon="i-lucide-search"
        size="sm"
        class="w-64"
        aria-label="Search the backlog"
      />
      <span class="text-xs opacity-60 tabular-nums">
        {{ visible.length }} row{{ visible.length === 1 ? '' : 's' }}
      </span>
    </div>

    <div v-if="!visible.length" class="text-sm opacity-70 my-8">
      Nothing matches. Row counts here come from corpus state, so a row disappears
      as soon as its facts are filled.
    </div>

    <!-- The table -->
    <div v-else class="overflow-x-auto border border-(--ui-border-accented) rounded-lg">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="text-xs tracking-widest opacity-60 text-left">
            <th class="font-normal px-3 py-2">ENTRY</th>
            <th class="font-normal px-3 py-2">MISSING</th>
            <th class="font-normal px-3 py-2">SOURCES</th>
            <th class="font-normal px-3 py-2">NEXT STEP</th>
            <th class="font-normal px-3 py-2"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in paged"
            :key="row.path"
            class="border-t border-(--ui-border-accented) align-top"
          >
            <td class="px-3 py-2">
              <NuxtLink :to="row.path" class="underline decoration-dotted underline-offset-2">
                {{ row.name }}
              </NuxtLink>
              <div class="text-xs opacity-50">
                {{ row.path.replace(/^\//, '') }}<template v-if="row.year"> · {{ row.year }}</template>
              </div>
            </td>
            <td class="px-3 py-2 text-xs opacity-80">
              <template v-if="row.missing.length">
                {{ row.missing.join(', ') }}
              </template>
              <span v-else class="opacity-50">nothing — complete</span>
            </td>
            <td class="px-3 py-2 text-xs opacity-70 tabular-nums">
              {{ row.sources }}<template v-if="row.sources === 0"> <span class="opacity-60">(none)</span></template>
            </td>
            <td class="px-3 py-2 text-xs opacity-70">
              {{ row.nextStep }}
            </td>
            <td class="px-3 py-2 text-right whitespace-nowrap">
              <NuxtLink
                :to="fixUrl(row)"
                class="text-xs text-(--link-color) underline"
                :aria-label="`Suggest a correction to ${row.name}`"
              >
                fix
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pageCount > 1" class="flex justify-center mt-6">
      <UPagination
        v-model:page="page"
        :total="visible.length"
        :items-per-page="PAGE_SIZE"
        :sibling-count="1"
        show-edges
      />
    </div>

    <p class="text-xs opacity-60 mt-6 max-w-2xl leading-relaxed">
      Ranked by queue first — readable entries before data rows — then by how much each
      entry is still missing, then by name. Nothing here is a stored status: a row drops
      to the bottom of its queue as its facts get filled, and a row with nothing missing
      reads as done.
    </p>
  </div>
</template>
