<script setup lang="ts">
/**
 * One labelled row in an entry page's stat rail.
 *
 * The rail is a stack of these; the label/value pairing and its typography were
 * repeated ~30 times across the five entry pages before this existed.
 *
 * A row that names a fact (`suggestTo`) gets the pencil from mockup 03: it opens
 * the intake form pre-targeted at exactly this field, so a visitor who notices
 * *one wrong row* does not have to describe which row they mean. Leaving it off
 * is the default, because derived rows (Explore, relations) have no field to
 * challenge.
 */
defineProps<{
  label: string
  /** Draws a separator above the row (used for the Explore/Maintain groups). */
  divided?: boolean
  /** Intake URL for this row's field; renders the pencil when present. */
  suggestTo?: string
}>()
</script>

<template>
  <div class="rail-row" :class="divided ? 'pt-2 border-t border-(--ui-border-accented)' : undefined">
    <div class="rail-label flex items-center gap-1.5">
      {{ label }}
      <NuxtLink
        v-if="suggestTo"
        :to="suggestTo"
        class="opacity-40 hover:opacity-100 inline-flex shrink-0"
        :aria-label="`Suggest a correction to ${label}`"
        :title="`Suggest a correction to ${label}`"
      >
        <UIcon name="i-lucide-pencil" class="size-3.5" aria-hidden="true" />
      </NuxtLink>
    </div>
    <slot>
      <div class="flex flex-wrap gap-1.5">
        <slot name="values" />
      </div>
    </slot>
  </div>
</template>
