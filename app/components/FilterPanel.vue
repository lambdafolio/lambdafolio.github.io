<script setup lang="ts">
/**
 * The filter sidebar (desktop) / slideover (mobile) body.
 *
 * The panel is built around two orthogonal combinators, because a researcher's
 * question has two independent parts:
 *
 *   across categories — "must a language satisfy every category I picked, or
 *                       is one enough?"  (intersection vs. union of filters)
 *   within a category — "must it have every value I picked here, or any one?"
 *
 * The plain-language summary under the controls is what makes the semantics
 * discoverable: a researcher should never have to guess whether the result
 * set is an AND or an OR.
 *
 * Each category can override the "within" rule independently, which is how the
 * mixed case is expressed: "functional OR imperative, AND statically typed".
 */
import { computed } from 'vue'
import {
  AXES, type FilterState, type LanguageRow,
  describeState
} from '~/utils/filters'
import FilterCategory from '~/components/FilterCategory.vue'

const props = defineProps<{
  state: FilterState
  rows: LanguageRow[]
  /** Rows in the current search scope; facet counts are computed over these. */
  scopeRows: LanguageRow[]
  searchText: string
  yearsWithData: number[]
}>()

const emit = defineEmits<{
  'update:searchText': [value: string]
  change: []
}>()

const categories = computed(() => AXES)

const summary = computed(() => describeState(props.state))

const yearOptions = computed(() => props.yearsWithData.map(y => ({ label: `${y}`, value: y })))

const acrossOptions = computed(() => [
  { label: 'All categories', value: 'all', description: 'Every category I picked must match' },
  { label: 'Any category', value: 'any', description: 'One matching category is enough' }
])

const withinOptions = computed(() => [
  { label: 'Any value', value: 'any', description: 'A language needs one of the values I picked' },
  { label: 'All values', value: 'all', description: 'A language needs every value I picked' }
])

function onAcrossChange(next: string) {
  if (next !== 'all' && next !== 'any') return
  props.state.across = next
  emit('change')
}

function onWithinChange(next: string) {
  if (next !== 'all' && next !== 'any') return
  props.state.within = next
  // Changing the global rule invalidates any per-category override that
  // duplicated it; drop the now-redundant ones so the sidebar stays truthful.
  for (const key of Object.keys(props.state.overrides)) {
    if (props.state.overrides[key] === next) delete props.state.overrides[key]
  }
  emit('change')
}

function onSearch(value: string) {
  emit('update:searchText', value)
}
</script>

<template>
  <div>
    <!-- Fuzzy search -->
    <UInput
      :model-value="searchText"
      placeholder="Search languages…"
      icon="i-lucide-search"
      class="mb-4"
      aria-label="Search languages by name, note, or fact"
      @update:model-value="onSearch(String($event))"
    />

    <!-- The combinators -->
    <div class="mb-4 p-3 rounded-md border border-(--ui-border-accented) space-y-3">
      <div>
        <p class="text-xs font-semibold uppercase opacity-60 mb-1.5">
          Combine categories
        </p>
        <URadioGroup
          :model-value="state.across"
          :items="acrossOptions"
          variant="card"
          size="sm"
          :ui="{ base: 'cursor-pointer', label: 'text-xs', description: 'text-[0.65rem] opacity-60' }"
          @update:model-value="onAcrossChange"
        />
      </div>

      <div>
        <p class="text-xs font-semibold uppercase opacity-60 mb-1.5">
          Combine values within a category
        </p>
        <URadioGroup
          :model-value="state.within"
          :items="withinOptions"
          variant="card"
          size="sm"
          :ui="{ base: 'cursor-pointer', label: 'text-xs', description: 'text-[0.65rem] opacity-60' }"
          @update:model-value="onWithinChange"
        />
      </div>

      <p class="text-[0.7rem] opacity-70 leading-snug border-t border-(--ui-border-accented) pt-2">
        {{ summary }}
      </p>
    </div>

    <!-- Categories -->
    <FilterCategory
      v-for="axis in categories"
      :key="axis.key"
      :axis-key="axis.key"
      :state="state"
      :rows="scopeRows"
      @change="emit('change')"
    />

    <!-- Year bounds -->
    <div class="mb-4">
      <h3 class="text-xs font-semibold uppercase opacity-60 mb-1.5">
        Year
      </h3>
      <div class="flex gap-2">
        <USelect
          :model-value="state.yearMin"
          placeholder="From"
          :items="yearOptions"
          class="w-full"
          aria-label="Minimum year"
          @update:model-value="(v: number | undefined) => { state.yearMin = v; emit('change') }"
        />
        <USelect
          :model-value="state.yearMax"
          placeholder="To"
          :items="yearOptions"
          class="w-full"
          aria-label="Maximum year"
          @update:model-value="(v: number | undefined) => { state.yearMax = v; emit('change') }"
        />
      </div>
    </div>
  </div>
</template>
