<script setup lang="ts">
/**
 * One filter category in the sidebar.
 *
 * The header carries the category name plus a per-category rule switch. The
 * switch only appears once the category has a selection — the rule is only
 * meaningful when there is more than one value to combine, and nine always-
 * visible radio groups would bury the facet list. That is how the mixed case
 * ("functional OR imperative, AND statically typed") is expressed without
 * changing the global rule.
 *
 * Each value shows one number: how many results the value would give if it
 * were added (or, when selected, how many of the current results carry it).
 * A value that cannot coexist with the current filters is dimmed rather than
 * hidden, so the researcher can see that the combination exists but is empty.
 */
import { computed } from 'vue'
import {
  AXES, type FilterState, type FacetInfo, type LanguageRow, type MatchMode,
  axisMode, facetInfo, setAxisMode, toggleValue
} from '~/utils/filters'

const props = defineProps<{
  axisKey: string
  state: FilterState
  rows: LanguageRow[]
}>()

const emit = defineEmits<{
  change: []
}>()

const axis = computed(() => AXES.find(a => a.key === props.axisKey)!)

const facets = computed<FacetInfo[]>(() => facetInfo(props.rows, props.state, props.axisKey))

/** The effective rule for this category: its override, else the global one. */
const mode = computed<MatchMode>(() => axisMode(props.state, props.axisKey))

/** True when this category overrides the global rule. */
const overridden = computed(() => props.state.overrides[props.axisKey] !== undefined)

const selectedCount = computed(() => props.state.selected[props.axisKey]?.length ?? 0)

function onToggle(value: string) {
  toggleValue(props.state, props.axisKey, value)
  emit('change')
}

function onModeChange(next: MatchMode) {
  setAxisMode(props.state, props.axisKey, next)
  emit('change')
}
</script>

<template>
  <section class="mb-4">
    <header class="flex items-center justify-between gap-2 mb-1.5">
      <h3 class="text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
        {{ axis.label }}
        <span
          v-if="selectedCount"
          class="opacity-70 normal-case text-[0.65rem] tabular-nums"
        >({{ selectedCount }})</span>
      </h3>

      <!-- Per-category rule switch. Shown as soon as the category has any
           selection: the rule decides how that selection combines, and a
           researcher may want to tighten a single-value category to "all"
           before adding a second value. -->
      <URadioGroup
        v-if="selectedCount > 0"
        :model-value="mode"
        :items="[
          { label: 'Any', value: 'any' },
          { label: 'All', value: 'all' }
        ]"
        size="xs"
        :ui="{
          indicator: 'size-1.5',
          label: 'text-[0.65rem] leading-none'
        }"
        class="shrink-0"
        :aria-label="`Match rule for ${axis.label}`"
        @update:model-value="(v: MatchMode) => onModeChange(v)"
      />
    </header>

    <p v-if="overridden" class="text-[0.65rem] opacity-60 mb-1">
      This category overrides the global rule
    </p>

    <div class="flex flex-col gap-0.5">
      <button
        v-for="facet in facets"
        :key="facet.value"
        type="button"
        class="flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors hover:bg-elevated"
        :class="[
          facet.selected ? 'bg-primary/15 text-primary font-medium' : '',
          !facet.selected && facet.unreachable ? 'opacity-40' : '',
          !facet.selected && !facet.unreachable ? 'opacity-80' : ''
        ]"
        :aria-pressed="facet.selected"
        :title="facet.selected
          ? `${facet.count} of the current results carry this fact`
          : facet.unreachable
            ? `No language has this fact together with the current filters`
            : `${facet.count} result${facet.count === 1 ? '' : 's'} if you add this`"
        @click="onToggle(facet.value)"
      >
        <span class="capitalize truncate">{{ facet.value }}</span>
        <span class="text-xs tabular-nums opacity-50 shrink-0">{{ facet.count }}</span>
      </button>
    </div>
  </section>
</template>
