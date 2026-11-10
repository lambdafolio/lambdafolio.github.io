<script setup lang="ts">
/**
 * One labelled row in an entry page's stat rail.
 *
 * The rail is a stack of these; the label/value pairing and its typography were
 * repeated ~30 times across the five entry pages before this existed.
 */
defineProps<{
  label: string
  /** Draws a separator above the row (used for the Explore/Maintain groups). */
  divided?: boolean
}>()
</script>

<template>
  <div class="rail-row" :class="divided ? 'pt-2 border-t border-(--ui-border-accented)' : undefined">
    <div class="rail-label">{{ label }}</div>
    <slot>
      <div class="flex flex-wrap gap-1.5">
        <slot name="values" />
      </div>
    </slot>
  </div>
</template>
