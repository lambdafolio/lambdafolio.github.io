<script setup lang="ts">
/**
 * Paradigm page (docs/knowledgebase-plan.md §3, §4).
 *
 * One page per programming paradigm — the sibling concept to a language
 * entry. The paradigm's fact row lives in `content/paradigms/<key>.md`;
 * the file name IS the taxonomy key, so this route reads it by path.
 *
 * The member list is DERIVED, never stored: it is every language whose
 * `paradigms:` array contains this paradigm's key. A stored list would go
 * stale the moment a language entry changed, so the page computes it at
 * build time from the languages collection instead (the same reason the
 * frontmatter has no `members` field).
 *
 * Layout (header / grid / rail / sources) comes from the shared entry
 * components; this file owns only what is specific to a paradigm.
 */
import { buildReferenceList, groupTypedRelations, hasRenderableBody } from '~/utils/entries'

const route = useRoute()

const { data: paradigm } = await useAsyncData(`paradigm-${route.params.slug}`, () =>
  queryCollection('paradigms').path(`/paradigms/${route.params.slug}`).first()
)

if (!paradigm.value) {
  throw createError({ statusCode: 404, statusMessage: 'Paradigm not found', fatal: true })
}

// Derived members: languages carrying this paradigm in their `paradigms:`
// array. The array is persisted as JSON text, so containment is a LIKE
// match on the quoted value.
const { data: members } = await useAsyncData(`paradigm-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'note')
    .where('paradigms', 'LIKE', `%"${route.params.slug}"%`)
    .order('name', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Typed relation edges to OTHER paradigms (kind from RELATION_KINDS). */
const typedRelations = computed(() =>
  groupTypedRelations((paradigm.value as { relations?: { name: string, kind: string }[] } | null)?.relations)
)

const referenceList = computed(() => buildReferenceList(paradigm.value))
const hasBody = computed(() => hasRenderableBody(paradigm.value))

useSeoMeta({
  title: paradigm.value?.title,
  description: paradigm.value?.note ?? paradigm.value?.description
})
</script>

<template>
  <div v-if="paradigm" class="mx-4 my-2">
    <EntryHeader
      :name="paradigm.name"
      :logo="paradigm.logo"
      :note="paradigm.note"
      :homepage="paradigm.homepage"
      :badges="[
        ...(paradigm.status && paradigm.status !== 'active'
          ? [{ label: paradigm.status, variant: 'outline' as const }]
          : []),
        { label: 'paradigm' }
      ]"
      back-to="/"
      back-label="All languages"
    />

    <EntryLayout
      collection="paradigms"
      :slug="route.params.slug"
      :has-body="hasBody"
      :entry="paradigm"
    >
      <template #main>
        <EntryMembers title="Languages using this paradigm" :members="memberList" trailing="none" />
      </template>

      <template #rail>
        <EntryRailRow v-if="paradigm.year" label="Year">
          <div class="tabular-nums">{{ paradigm.year }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="paradigm.author" label="Author">
          <div>{{ paradigm.author }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="paradigm.features?.length" label="Defining traits">
          <UBadge v-for="f in paradigm.features" :key="f" color="neutral" variant="subtle" size="sm">
            {{ f }}
          </UBadge>
        </EntryRailRow>
        <EntryRailRow
          v-for="rel in typedRelations.filter(r => r.names.length)"
          :key="rel.label"
          :label="rel.label"
        >
          <NuxtLink
            v-for="name in rel.names"
            :key="name"
            :to="`/paradigms/${name}`"
            class="underline decoration-dotted underline-offset-2"
          >
            {{ name }}
          </NuxtLink>
        </EntryRailRow>
      </template>

      <template #explore>
        <EntryRailRow label="Explore" divided>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="{ path: '/', query: { f: `paradigms:${route.params.slug}` } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-list-filter" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              All {{ memberList.length }} languages
            </NuxtLink>
          </div>
        </EntryRailRow>
      </template>
    </EntryLayout>

    <EntryReferences :references="referenceList" />
  </div>
</template>
