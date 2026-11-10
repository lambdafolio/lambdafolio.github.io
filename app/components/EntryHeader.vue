<script setup lang="ts">
/**
 * Entry page header: back link, logo, name, badges, note, homepage button.
 *
 * Shared by the five entry pages. What differs per collection is *which* badges
 * appear and what the back link says, so those arrive as props (`badges`) and a
 * slot — the layout itself is identical and was previously copied five times.
 */
import { withBase } from '~/utils/with-base'

export interface EntryBadge {
  label: string
  /** Rendered inside `<code>` — used for the taxonomy key. */
  code?: boolean
  /** Subtle filled chip (the collection kind) vs outline (lifecycle status). */
  variant?: 'subtle' | 'outline'
}

defineProps<{
  name: string
  logo?: string | null
  note?: string | null
  homepage?: string | null
  /** Badges after the title, in order. */
  badges?: EntryBadge[]
  /** Back-link target. */
  backTo: string
  backLabel: string
}>()
</script>

<template>
  <header class="mb-6">
    <UButton
      :to="backTo"
      variant="link"
      color="neutral"
      size="sm"
      icon="i-lucide-arrow-left"
      :label="backLabel"
    />
    <div class="flex items-center gap-4 mt-3">
      <img
        v-if="logo"
        :src="withBase(logo)"
        :alt="`${name} logo`"
        class="h-12 w-12 object-contain"
      >
      <div>
        <h1 class="text-3xl font-semibold flex items-center gap-3 flex-wrap">
          {{ name }}
          <template v-for="badge in badges ?? []" :key="badge.label">
            <UBadge
              :color="'neutral'"
              :variant="badge.variant ?? 'subtle'"
              size="sm"
              :class="badge.variant === 'outline' ? 'capitalize' : undefined"
            >
              <code v-if="badge.code">{{ badge.label }}</code>
              <template v-else>{{ badge.label }}</template>
            </UBadge>
          </template>
          <slot name="badges" />
        </h1>
        <p v-if="note" class="text-sm opacity-75 max-w-3xl mt-1">
          {{ note }}
        </p>
      </div>
    </div>
    <div v-if="homepage" class="flex flex-wrap gap-2 mt-4">
      <UButton
        :to="homepage"
        target="_blank"
        rel="noopener"
        color="neutral"
        variant="subtle"
        size="sm"
        icon="i-lucide-globe"
        label="Website"
      />
    </div>
    <slot name="after" />
  </header>
</template>
