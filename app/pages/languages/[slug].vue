<script setup lang="ts">
/**
 * Language entry page (`/languages/<slug>`).
 *
 * The richest of the five entry pages: a language carries a fact sheet (family,
 * paradigms, type system, memory, execution, concurrency, features) that the
 * other collections do not, plus both the legacy `influences`/`influenced` name
 * lists and the typed `relations` edges.
 *
 * Layout (header / grid / rail / sources) comes from the shared entry
 * components (app/components/Entry*.vue); this file owns only what is specific
 * to a language.
 */
import { FEATURES } from '~/utils/taxonomy'
import { buildReferenceList, groupTypedRelations, hasRenderableBody } from '~/utils/entries'

const route = useRoute()

const { data: language } = await useAsyncData(`language-${route.params.slug}`, () =>
  queryCollection('languages').path(`/languages/${route.params.slug}`).first()
)

if (!language.value) {
  throw createError({ statusCode: 404, statusMessage: 'Language not found', fatal: true })
}

// Resolved registry-based cross-links: influences/influenced -> known slugs
const { data: allLanguages } = await useAsyncData('languages-meta', () =>
  queryCollection('languages').select('name', 'path').order('name', 'ASC').all()
)
const nameToPath = computed(
  () => new Map(allLanguages.value?.map(l => [l.name, l.path]) ?? [])
)

function linkFor(name: string): { label: string, to?: string } | null {
  const to = nameToPath.value.get(name)
  return to ? { label: name, to } : null
}

/** Axis groups for the fact sheet; each renders as a chip row (hidden when empty). */
const axisGroups = computed(() => [
  { label: 'Family', values: language.value?.family ? [language.value.family] : [], family: true },
  { label: 'Paradigms', values: language.value?.paradigms ?? [], linked: true },
  { label: 'Type system', values: [language.value?.typing, ...(language.value?.type_system ?? [])].filter(Boolean) },
  { label: 'Memory', values: language.value?.memory ?? [] },
  { label: 'Execution', values: language.value?.execution ?? [] },
  { label: 'Concurrency', values: language.value?.concurrency ?? [] },
  { label: 'Features', values: language.value?.features ?? [], feature: true }
])

/**
 * Where a chip links to, when it links at all.
 *
 * Paradigm keys are taxonomy values with a page each, so every chip links.
 * Feature strings are a free-form long tail: only the promoted subset
 * (FEATURES in app/utils/taxonomy.ts) has a page, so the rest stay plain
 * chips rather than dead links. A family value is a closed vocabulary whose
 * key IS the page slug, so it always links.
 */
function chipTarget(
  value: string | null | undefined,
  group: { linked?: boolean, feature?: boolean, family?: boolean }
): string | undefined {
  if (!value) return undefined
  if (group.family) return `/families/${value}`
  if (group.linked) return `/paradigms/${value}`
  if (group.feature && (FEATURES as readonly string[]).includes(value)) return `/features/${value}`
  return undefined
}

/** Legacy name-based influence lists (superseded by `relations`, still shown). */
const relations = computed(() => [
  { label: 'Influences', names: language.value?.influences ?? [] },
  { label: 'Influenced', names: language.value?.influenced ?? [] }
])

/** Typed relation edges (docs/knowledgebase-plan.md §7), grouped by kind. */
const typedRelations = computed(() =>
  groupTypedRelations((language.value as { relations?: { name: string, kind: string }[] } | null)?.relations)
)

/** Facts that map to an index facet filter, for the Explore section. */
const linkableFacts = computed(() => {
  const lang = language.value
  if (!lang) return []
  const out: { axis: string, value: string, preposition: string, suffix?: string }[] = []
  if (lang.family) out.push({ axis: 'family', value: lang.family, preposition: 'in the', suffix: ' family' })
  for (const p of lang.paradigms ?? []) out.push({ axis: 'paradigms', value: p, preposition: 'with' })
  if (lang.typing) out.push({ axis: 'typing', value: lang.typing, preposition: 'typed' })
  for (const m of lang.memory ?? []) out.push({ axis: 'memory', value: m, preposition: 'with' })
  for (const e of lang.execution ?? []) out.push({ axis: 'execution', value: e, preposition: 'running' })
  for (const c of lang.concurrency ?? []) out.push({ axis: 'concurrency', value: c, preposition: 'with' })
  return out.slice(0, 4)
})

const referenceList = computed(() => buildReferenceList(language.value))
const hasBody = computed(() => hasRenderableBody(language.value))

useSeoMeta({
  title: language.value?.title,
  description: language.value?.note ?? language.value?.description
})
</script>

<template>
  <div v-if="language" class="mx-4 my-2">
    <EntryHeader
      :name="language.name"
      :logo="language.logo"
      :note="language.note"
      :homepage="language.homepage"
      :badges="[
        ...(language.kind ? [{ label: language.kind }] : []),
        ...(language.status && language.status !== 'active'
          ? [{ label: language.status, variant: 'outline' as const }]
          : [])
      ]"
      back-to="/"
      back-label="All languages"
    />

    <EntryLayout
      collection="languages"
      :slug="route.params.slug"
      :has-body="hasBody"
      :entry="language"
      empty-hint="hit Compare to see it next to a documented language"
    >
      <template #rail>
        <EntryRailRow v-if="language.year" label="Year">
          <div class="tabular-nums">{{ language.year }}</div>
        </EntryRailRow>
        <EntryRailRow v-if="language.author" label="Author">
          <div>{{ language.author }}</div>
        </EntryRailRow>

        <EntryRailRow
          v-for="group in axisGroups.filter(g => g.values.length)"
          :key="group.label"
          :label="group.label"
        >
          <template v-for="v in group.values" :key="v">
            <!-- Paradigm chips link to the paradigm's page (the key IS the page
                 slug); feature chips link only when the feature is promoted and
                 therefore has a page. -->
            <NuxtLink
              v-if="chipTarget(v, group)"
              :to="chipTarget(v, group)!"
              class="text-xs"
            >
              <UBadge color="neutral" variant="subtle" size="sm" class="hover:underline">
                {{ v }}
              </UBadge>
            </NuxtLink>
            <UBadge v-else color="neutral" variant="subtle" size="sm">
              {{ v }}
            </UBadge>
          </template>
        </EntryRailRow>

        <EntryRailRow
          v-for="rel in [...typedRelations, ...relations].filter(r => r.names.length)"
          :key="rel.label"
          :label="rel.label"
        >
          <template v-for="name in rel.names" :key="name">
            <NuxtLink
              v-if="linkFor(name)?.to"
              :to="linkFor(name)!.to"
              class="underline decoration-dotted underline-offset-2"
            >
              {{ name }}
            </NuxtLink>
            <span v-else class="opacity-70">{{ name }}</span>
          </template>
        </EntryRailRow>
      </template>

      <template #explore>
        <EntryRailRow label="Explore" divided>
          <div class="flex flex-col gap-1.5">
            <NuxtLink
              :to="{ path: '/compare', query: { a: route.params.slug, b: 'python' } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-columns-3" class="size-4 shrink-0" aria-hidden="true" /> Compare
            </NuxtLink>
            <NuxtLink
              v-for="f in linkableFacts"
              :key="`${f.axis}-${f.value}`"
              :to="{ path: '/', query: { f: `${f.axis}:${f.value}` } }"
              class="text-sm hover:underline inline-flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-list-filter" class="size-4 shrink-0 opacity-60" aria-hidden="true" />
              Everything {{ f.preposition }} <span class="lowercase">{{ f.value }}</span>{{ f.suffix ?? '' }}
            </NuxtLink>
          </div>
        </EntryRailRow>
      </template>
    </EntryLayout>

    <EntryReferences :references="referenceList" />
  </div>
</template>
