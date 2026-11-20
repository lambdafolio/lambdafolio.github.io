<script setup lang="ts">
/**
 * Two-column entry page shell: prose column + stat rail.
 *
 * Every entry page (languages, paradigms, families, features, generations) is
 * this same grid with different contents in three slots, so the grid, the
 * "no article yet" callout and the edit link are defined once here.
 */
import { entryEditUrl, entrySuggestUrl } from '~/utils/entries'

const props = defineProps<{
  /** Collection directory under `content/` — used for the edit URL. */
  collection: string
  slug: string | string[] | undefined
  /** Whether the page body has renderable nodes. */
  hasBody: boolean
  /**
   * The page row, passed to `ContentRenderer`.
   *
   * Typed as the collection-agnostic shape Nuxt Content's generated item types
   * actually satisfy. `Record<string, unknown>` would require an index
   * signature that `LanguagesCollectionItem` and friends do not declare, which
   * made every entry page fail `nuxi typecheck` (TS2322 in five files).
   */
  entry: { body?: unknown; [key: string]: unknown } | object
  /** Extra sentence in the "no article yet" callout. */
  emptyHint?: string
}>()
</script>

<template>
  <div class="grid lg:grid-cols-[1fr_16rem] gap-8 items-start">
    <main class="min-w-0 max-w-3xl">
      <ContentRenderer v-if="hasBody" :value="entry" />
      <p v-else class="text-sm opacity-50 border border-dashed border-(--ui-border-accented) rounded-md p-4">
        No article yet — this page is a data row.
        <a :href="entryEditUrl(props.collection, props.slug)" target="_blank" rel="noopener" class="underline">
          Write it on GitHub
        </a>
        or {{ emptyHint ?? 'pick a member to read a worked example' }}.
      </p>

      <!-- Derived member list, extra sections, grouped views -->
      <slot name="main" />
    </main>

    <aside class="lg:border-l lg:border-(--ui-border-accented) lg:pl-6 space-y-4">
      <!-- Fact rows + derived relations -->
      <slot name="rail" />

      <!-- Explore: derived cross-views -->
      <slot name="explore" />

      <!-- Maintain -->
      <div class="rail-row pt-2 border-t border-(--ui-border-accented)">
        <div class="rail-label">Maintain</div>

        <!-- The site form: no GitHub account needed to *read*, and the parser
             echoes back what the request means before anything is queued. -->
        <NuxtLink
          :to="entrySuggestUrl(props.collection, props.slug)"
          class="text-sm hover:underline inline-flex items-center gap-1.5"
        >
          <UIcon name="i-lucide-pencil" class="size-4 shrink-0" aria-hidden="true" /> Suggest a correction
        </NuxtLink>

        <!-- Direct editing stays: the repository is public, and a PR is still
             the fastest path for someone who already knows what to change. -->
        <a
          :href="entryEditUrl(props.collection, props.slug)"
          target="_blank"
          rel="noopener"
          class="text-sm opacity-70 hover:opacity-100 hover:underline inline-flex items-center gap-1.5 mt-1.5"
        >
          <UIcon name="i-lucide-code" class="size-4 shrink-0" aria-hidden="true" /> Edit on GitHub
        </a>
      </div>
    </aside>
  </div>
</template>
