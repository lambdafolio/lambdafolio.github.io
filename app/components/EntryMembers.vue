<script setup lang="ts">
/**
 * Derived member list ("languages with this paradigm/family/feature/…").
 *
 * The rows are always queried by the page (each collection joins on a different
 * field), but the presentation is identical, including the optional per-member
 * trailing fact (`kind` or `typing`) that two pages rendered differently.
 */
import { withBase } from '~/utils/with-base'

export interface MemberRow {
  name: string
  path: string
  logo?: string | null
  year?: number | null
  kind?: string | null
  typing?: string | null
}

const props = defineProps<{
  /** Heading text; the count is appended in parentheses. */
  title: string
  members: MemberRow[]
  /** Which fact to show after the year. */
  trailing?: 'kind' | 'typing' | 'none'
  /** Shown when the derived list is empty, if the page wants to say something. */
  emptyText?: string
}>()

function trailingValue(m: MemberRow): string | null {
  if (props.trailing === 'kind') return m.kind ?? null
  if (props.trailing === 'typing') return m.typing ?? null
  return null
}
</script>

<template>
  <section v-if="members.length" class="mt-10">
    <h2 class="text-sm font-semibold uppercase tracking-wide opacity-60 mb-3">
      {{ title }} ({{ members.length }})
    </h2>
    <ul class="space-y-1.5">
      <li v-for="m in members" :key="m.path" class="text-sm flex items-baseline gap-2">
        <img
          v-if="m.logo"
          :src="withBase(m.logo)"
          :alt="`${m.name} logo`"
          class="size-4 object-contain self-center"
        >
        <NuxtLink :to="m.path" class="hover:underline">
          {{ m.name }}
        </NuxtLink>
        <span v-if="m.year" class="opacity-50 text-xs tabular-nums">{{ m.year }}</span>
        <span v-if="trailingValue(m)" class="opacity-40 text-xs">{{ trailingValue(m) }}</span>
      </li>
    </ul>
    <slot />
  </section>
  <p v-else-if="emptyText" class="text-sm opacity-50 mt-10">
    {{ emptyText }}
  </p>
</template>
