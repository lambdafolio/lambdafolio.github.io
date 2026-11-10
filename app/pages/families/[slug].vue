<script setup lang="ts">
/**
 * Family page (`/families/<key>`, docs/knowledgebase-plan.md §3b).
 *
 * Sibling of the paradigm and feature pages, on the lineage axis. The fact row
 * lives in `content/families/<key>.md`; the file name IS the join key that
 * language entries carry in their scalar `family:` field.
 *
 * The member list is DERIVED, never stored — every language whose `family`
 * equals this key. Unlike the paradigm/feature joins (a LIKE over a JSON-text
 * array) this is an exact equality on a scalar, so it uses the `family` index.
 *
 * Layout (header / grid / rail / sources) comes from the shared entry
 * components; this file owns only what is specific to a lineage.
 */
import { buildReferenceList, groupTypedRelations, hasRenderableBody } from '~/utils/entries'

const route = useRoute()

const { data: family } = await useAsyncData(`family-${route.params.slug}`, () =>
  queryCollection('families').path(`/families/${route.params.slug}`).first()
)

if (!family.value) {
  throw createError({ statusCode: 404, statusMessage: 'Family not found', fatal: true })
}

// Derived members: languages whose scalar `family` equals this key.
const { data: members } = await useAsyncData(`family-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'status', 'note', 'paradigms', 'typing')
    .where('family', '=', route.params.slug)
    .order('year', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Other families to browse (siblings in the collection). */
const { data: siblings } = await useAsyncData('family-siblings', () =>
  queryCollection('families').select('name', 'path').order('name', 'ASC').all()
)
const otherFamilies = computed(() =>
  (siblings.value ?? []).filter(f => f.path !== `/families/${route.params.slug}`)
)

/** Typed relation edges to OTHER families (kind from RELATION_KINDS). */
const typedRelations = computed(() =>
  groupTypedRelations((family.value as { relations?: { name: string, kind: string }[] } | null)?.relations)
)

const referenceList = computed(() => buildReferenceList(family.value))
const hasBody = computed(() => hasRenderableBody(family.value))

useSeoMeta({
  title: family.value?.title,
  description: family.value?.note ?? family.value?.description
})
</script>

<template>
  <div v-if="family" class="mx-4 my-2">
    <EntryHeader
      :name="family.name"
      :logo="family.logo"
      :note="family.note"
      :homepage="family.homepage"
      :badges="[
        ...(family.status && family.status !== 'active'
          ? [{ label: family.status, variant: 'outline' as const }]
          : []),
        { label: 'family' }
      ]"
      back-to="/families"
      back-label="All families"
    />

    <EntryLayout
      collection="families"
      :slug="route.params.slug"
      :has-body="hasBody"
      :entry="family"
    >
      <template #main>
        <EntryMembers
          title="Languages in this family"
          :members="memberList"
          trailing="kind"
          empty-text="No language entry declares this family yet."
        />
      </template>

      <template #rail>
        <EntryRailRow v-if="family.year" label="Origin">
          <div class="tabular-nums">{{ family.year }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="family.author" label="Originator">
          <div>{{ family.author }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="family.features?.length" label="Shared traits">
          <UBadge v-for="feat in family.features" :key="feat" color="neutral" variant="subtle" size="sm">
            {{ feat }}
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
            :to="`/families/${name}`"
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
              :to="{ path: '/', query: { f: `family:${route.params.slug}` } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-list-filter" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              All {{ memberList.length }} languages
            </NuxtLink>
            <NuxtLink
              v-for="f in otherFamilies"
              :key="f.path"
              :to="f.path"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-git-branch" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              {{ f.name }}
            </NuxtLink>
          </div>
        </EntryRailRow>
      </template>
    </EntryLayout>

    <EntryReferences :references="referenceList" />
  </div>
</template>
