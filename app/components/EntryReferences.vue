<script setup lang="ts">
/**
 * Sources & references block, shared by every entry page.
 *
 * The list itself is built by `buildReferenceList` (app/utils/entries.ts), which
 * owns the ordering contract (homepage first) and deduplication. This component
 * only renders it, so the five entry pages cannot disagree about what a
 * reference row looks like.
 */
import type { ReferenceRow } from '~/utils/entries'

defineProps<{
  /** Output of `buildReferenceList`; the caller owns ordering. */
  references: ReferenceRow[]
}>()
</script>

<template>
  <section v-if="references.length" class="mt-10 border-t border-(--ui-border-accented) pt-4 max-w-3xl">
    <h2 class="text-sm font-semibold uppercase tracking-wide opacity-60 mb-3">
      Sources &amp; references
    </h2>
    <ul class="space-y-1.5">
      <li v-for="ref in references" :key="ref.url" class="text-sm">
        <a
          :href="ref.url"
          target="_blank"
          rel="noopener"
          class="hover:underline inline-flex items-baseline gap-2"
        >
          <UIcon name="i-lucide-bookmark" class="size-3.5 shrink-0 self-center opacity-50" aria-hidden="true" />
          <span class="opacity-90">{{ ref.title }}</span>
          <span class="opacity-50 text-xs truncate">{{ ref.host }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
