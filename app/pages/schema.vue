<script setup lang="ts">
/**
 * Schema contract page (docs/knowledgebase-plan.md §4 route `/schema`).
 *
 * Renders the field contract and vocabularies live from
 * app/utils/taxonomy.ts + a static field table — the same single source the
 * lint and Studio forms consume, so this page cannot drift from the contract.
 */
import {
  KINDS, STATUSES, TYPING, PARADIGMS, TYPE_SYSTEM, MEMORY, EXECUTION, CONCURRENCY
} from '~/utils/taxonomy'

const LINT_SCALARS = [
  { field: 'name', type: 'string', note: 'required; ASCII-only; unique across the corpus' },
  { field: 'title', type: 'string', note: 'native SEO field; mirrors name; ASCII-only' },
  { field: 'homepage', type: 'string', note: 'official site' },
  { field: 'author', type: 'string', note: 'person or team' },
  { field: 'logo', type: 'string', note: 'path under public/logos/ (media picker in Studio)' },
  { field: 'year', type: 'number', note: 'first appeared; written unquoted so it stores as integer' }
] as const

const LINT_ARRAYS = [
  { field: 'urls', type: 'string[]', note: 'external references' },
  { field: 'paradigms', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'type_system', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'memory', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'execution', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'concurrency', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'features', type: 'string[]', note: 'free-form long tail' },
  { field: 'influences', type: 'string[]', note: 'language names; cross-linked' },
  { field: 'influenced', type: 'string[]', note: 'language names; cross-linked' },
  { field: 'note', type: 'string', note: 'short summary shown on the page' }
] as const

// The paradigms collection (content/paradigms/<key>.md) is the sibling of
// the languages collection. It deliberately carries a different, smaller
// fact profile: a paradigm has no typing discipline, memory model, or
// execution model — those belong to the languages that adopt it.
const PARADIGM_FIELDS = [
  { field: 'name', type: 'string', note: 'required; ASCII-only; unique in this collection' },
  { field: 'title', type: 'string', note: 'native SEO field; mirrors name; ASCII-only' },
  { field: 'homepage', type: 'string', note: "the paradigm's canonical home (paper, manual, standard)" },
  { field: 'author', type: 'string', note: "the paradigm's originator(s), verbatim" },
  { field: 'paradigm', type: 'string', note: 'required; MUST equal the file name — the join key' },
  { field: 'status', type: 'enum', note: 'active | experimental | dormant | historical' },
  { field: 'year', type: 'number', note: "the paradigm's origin year; written unquoted" },
  { field: 'features', type: 'string[]', note: 'the defining characteristics — this IS the definition' },
  { field: 'relations', type: '{name,kind}[]', note: 'edges to other paradigms; kind from RELATION_KINDS' },
  { field: 'note', type: 'string', note: 'short summary shown on the page' }
] as const

const vocabGroups = [
  { name: 'kind', values: KINDS, scalars: true },
  { name: 'status', values: STATUSES, scalars: true },
  { name: 'typing', values: TYPING, scalars: true },
  { name: 'paradigms', values: PARADIGMS, scalars: false },
  { name: 'type_system', values: TYPE_SYSTEM, scalars: false },
  { name: 'memory', values: MEMORY, scalars: false },
  { name: 'execution', values: EXECUTION, scalars: false },
  { name: 'concurrency', values: CONCURRENCY, scalars: false }
] as const

// The code tour (contract.md §The code tour): the fixed demonstration order
// the Code section walks in every prose-bearing entry. Tags are plural.
const TOUR_SLOTS = [
  { tag: 'primitives', constructs: 'atomic values (numbers, strings, atoms, bools)', consumes: 'operators', example: 'n = 42' },
  { tag: 'combination', constructs: 'data structures', consumes: 'indexing / destructuring / iteration', example: 'xs = [2, 3]' },
  { tag: 'abstraction', constructs: 'the definable unit (function, class, process, actor…)', consumes: 'invoking / applying it', example: 'double x = x * 2' },
  { tag: 'idioms', constructs: 'a characteristic community pattern', consumes: 'its payoff', example: 'recursion, guards, trampolines…' }
] as const

useSeoMeta({
  title: 'Data contract',
  description: 'The normalized fact contract for language entries: fields, vocabularies, and lint.'
})
</script>

<template>
  <div class="mx-4 my-2">
    <header class="mb-4">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <h1 class="text-2xl font-semibold my-2">
        Data contract
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        Every language is a row: a fixed frontmatter fact profile (this page)
        plus optional curated prose. Facts are schema; prose is commentary.
        Schemas are enforced at build by the Zod collection schema; vocabularies
        by <code>npm run lint:frontmatter</code> against
        <code>app/utils/taxonomy.ts</code> — the same source rendering below.
      </p>
    </header>

    <section class="max-w-4xl">
      <h2 class="text-lg font-semibold mt-6 mb-2">
        Scalar fields
      </h2>
      <table class="lang-table min-w-0">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in LINT_SCALARS" :key="f.field">
            <td><code>{{ f.field }}</code></td>
            <td class="opacity-80">{{ f.type }}</td>
            <td class="text-sm opacity-75">{{ f.note }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-lg font-semibold mt-6 mb-2">
        Array fields
      </h2>
      <table class="lang-table min-w-0">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in LINT_ARRAYS" :key="f.field">
            <td><code>{{ f.field }}</code></td>
            <td class="opacity-80">{{ f.type }}</td>
            <td class="text-sm opacity-75">{{ f.note }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-lg font-semibold mt-6 mb-2">
        Vocabularies
      </h2>
      <p class="text-sm opacity-70 mb-3">
        Add a value once in taxonomy.ts, re-run the lint; corpus entries that
        need spelling normalization are reported (or auto-fixed with
        <code>--fix</code>). The page body is optional prose — never a data
        carrier.
      </p>
      <div v-for="g in vocabGroups" :key="g.name" class="mb-3">
        <h3 class="text-sm font-medium uppercase opacity-70 mb-1">
          {{ g.name }} <span v-if="g.scalars" class="opacity-60 normal-case">(single value)</span>
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <UBadge v-for="v in g.values" :key="v" color="neutral" variant="outline" size="sm">
            {{ v }}
          </UBadge>
        </div>
      </div>
    </section>

    <section class="max-w-4xl">
      <h2 class="text-lg font-semibold mt-6 mb-2">
        Paradigm entries
      </h2>
      <p class="text-sm opacity-70 mb-3">
        Paradigms are the sibling concept to languages: one page per paradigm
        in <code>content/paradigms/&lt;key&gt;.md</code>, where the file name
        <em>is</em> the taxonomy key and the <code>paradigm</code> field
        repeats it. That key joins the two collections — a language lists its
        paradigms by the same vocabulary value, so neither side can drift.
        A paradigm has no typing discipline, memory model, or execution
        model; those belong to the languages that adopt it.
      </p>
      <table class="lang-table min-w-0">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in PARADIGM_FIELDS" :key="f.field">
            <td><code>{{ f.field }}</code></td>
            <td class="opacity-80">{{ f.type }}</td>
            <td class="text-sm opacity-75">{{ f.note }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-sm opacity-70 mt-3 mb-2">
        Member languages are <strong>derived</strong> from the languages
        collection at build time — never stored — so the list can never go
        stale. Each paradigm value has a page (stub or curated):
      </p>
      <div class="flex flex-wrap gap-1.5">
        <NuxtLink
          v-for="v in PARADIGMS"
          :key="v"
          :to="`/paradigms/${v}`"
          class="text-xs"
        >
          <UBadge color="neutral" variant="outline" size="sm" class="hover:underline">
            {{ v }}
          </UBadge>
        </NuxtLink>
      </div>

      <h2 class="text-lg font-semibold mt-6 mb-2">
        The code tour
      </h2>
      <p class="text-sm opacity-70 mb-3">
        Optional prose follows one skeleton; when an entry shows code, every
        language is demonstrated the same way — four mechanism slots
        (SICP's means-of-* order), each pairing a construction with a
        consumption (the observational reading of introduction/elimination
        rules). Slots may merge or be omitted when the language lacks them;
        code-group tab labels name the slot.
      </p>
      <table class="lang-table min-w-0">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Constructs</th>
            <th>Consumes</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in TOUR_SLOTS" :key="s.tag">
            <td><code>{{ s.tag }}</code></td>
            <td>{{ s.constructs }}</td>
            <td>{{ s.consumes }}</td>
            <td><code>{{ s.example }}</code></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>