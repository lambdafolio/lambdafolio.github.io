<script setup lang="ts">
/**
 * Generation page (`/generations/<key>`, docs/knowledgebase-plan.md §3c).
 *
 * Sibling of the family page, on the abstraction axis. The fact row lives in
 * `content/generations/<key>.md`; the file name IS the join key that language
 * entries carry in their scalar `generation:` field.
 *
 * This page is where a tier is DEFINED. The enum on a language entry records a
 * value; only the page can say what the value means, whether the tier is a live
 * category, and which sources establish it. The `features` array is the
 * membership criterion — the same role it plays on a paradigm page.
 *
 * Members are DERIVED, never stored: every language whose scalar `generation`
 * equals this key. An empty list is a legitimate, documented result.
 *
 * Layout (header / grid / rail / sources) comes from the shared entry
 * components; this file owns only what is specific to a tier.
 */
import { buildReferenceList, hasRenderableBody } from '~/utils/entries'

const route = useRoute()

const { data: generation } = await useAsyncData(`generation-${route.params.slug}`, () =>
  queryCollection('generations').path(`/generations/${route.params.slug}`).first()
)

if (!generation.value) {
  throw createError({ statusCode: 404, statusMessage: 'Generation not found', fatal: true })
}

// Derived members: languages whose scalar `generation` equals this key.
const { data: members } = await useAsyncData(`generation-members-${route.params.slug}`, () =>
  queryCollection('languages')
    .select('name', 'path', 'logo', 'year', 'kind', 'status', 'note', 'paradigms', 'typing')
    .where('generation', '=', route.params.slug)
    .order('year', 'ASC')
    .all()
)

const memberList = computed(() => members.value ?? [])

/** Other tiers to browse (siblings in the collection, ladder order). */
const { data: siblings } = await useAsyncData('generation-siblings', () =>
  queryCollection('generations').select('name', 'path').order('path', 'ASC').all()
)
const otherGenerations = computed(() =>
  (siblings.value ?? []).filter(g => g.path !== `/generations/${route.params.slug}`)
)

const referenceList = computed(() => buildReferenceList(generation.value))
const hasBody = computed(() => hasRenderableBody(generation.value))

useSeoMeta({
  title: generation.value?.title,
  description: generation.value?.note ?? generation.value?.description
})
</script>

<template>
  <div v-if="generation" class="mx-4 my-2">
    <EntryHeader
      :name="generation.name"
      :logo="generation.logo"
      :note="generation.note"
      :homepage="generation.homepage"
      :badges="[
        ...(generation.status && generation.status !== 'active'
          ? [{ label: generation.status, variant: 'outline' as const }]
          : []),
        { label: String(route.params.slug), code: true }
      ]"
      back-to="/generations"
      back-label="All generations"
    />

    <EntryLayout
      collection="generations"
      :slug="route.params.slug"
      :has-body="hasBody"
      :entry="generation"
      empty-hint="compare it against a neighbouring tier"
    >
      <template #main>
        <EntryMembers
          title="Languages at this tier"
          :members="memberList"
          trailing="kind"
          empty-text="No language entry is tagged as this generation yet. That may be the honest answer — the corpus has no machine-code or assembly rows — or it may mean the tag has not been curated yet."
        />
      </template>

      <template #rail>
        <EntryRailRow v-if="generation.year" label="Era begins">
          <div class="tabular-nums">{{ generation.year }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="generation.author" label="Originator">
          <div>{{ generation.author }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="generation.features?.length" label="Membership criterion">
          <UBadge v-for="feat in generation.features" :key="feat" color="neutral" variant="subtle" size="sm">
            {{ feat }}
          </UBadge>
        </EntryRailRow>
      </template>

      <template #explore>
        <EntryRailRow label="Other tiers" divided>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              v-for="g in otherGenerations"
              :key="g.path"
              :to="g.path"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-layers" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              {{ g.name }}
            </NuxtLink>
          </div>
        </EntryRailRow>
      </template>
    </EntryLayout>

    <EntryReferences :references="referenceList" />
  </div>
</template>
