<script setup lang="ts">
/**
 * Suggest an entry or a correction (docs/suggestion-intake-plan.md §5.1).
 *
 * One textarea, nothing required. Everything structured — which entry, which
 * field, what kind of artifact, which URL is primary — is derived downstream by
 * the parser and echoed back for confirmation (triage step 0/1). Asking for
 * those here would ask the visitor to know things only the parser can work out,
 * which is where the earlier structured form lost people.
 *
 * No backend. On submit the text is handed to a *legacy Markdown* issue
 * template via `?body=`, which is the only template kind GitHub lets us
 * prefill. See .github/ISSUE_TEMPLATE/suggest.md — the pairing is deliberate and
 * breaking it silently discards the visitor's text.
 *
 * The issue needs a GitHub account; reading never does. That is a deliberate
 * trade: the issue thread is both the queue and the audit trail, and a
 * submissions database would be a second thing to run.
 */
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const REPO = 'lambdafolio/lambdafolio.github.io'
const MAX_CHARS = 2000

const route = useRoute()

/**
 * Context handed over from an entry page (`entrySuggestUrl`), e.g.
 * `/suggest?entry=languages/cplusplus&field=memory`.
 *
 * Rendered as a *visible* prefix the visitor can delete, never as hidden state:
 * the parser reads the issue body, so anything not in the box does not exist to
 * it.
 *
 * Seeded in `onMounted` rather than during setup: this page is prerendered, so at
 * build time the query is empty and on the client it is not. Reading it during
 * setup would make the server HTML ("") disagree with the hydrated DOM (the
 * prefix), which is a hydration mismatch. After mount there is only one truth.
 */
const text = ref('')
const touched = ref(false)

onMounted(() => {
  if (touched.value) return
  const entry = typeof route.query.entry === 'string' ? route.query.entry : ''
  const field = typeof route.query.field === 'string' ? route.query.field : ''
  if (!entry) return
  text.value = field ? `re: ${entry} — ${field}\n` : `re: ${entry}\n`
  touched.value = false
})

const trimmed = computed(() => text.value.trim())
const tooLong = computed(() => text.value.length > MAX_CHARS)
const empty = computed(() => trimmed.value.length === 0)
const canSubmit = computed(() => !empty.value && !tooLong.value)

/**
 * The prefilled body. Only the visitor's own text is included — no template
 * scaffolding — because the bot's echo quotes this back verbatim, and anything
 * extra would be read as the submitter's words.
 */
const issueBody = computed(() => trimmed.value)

/**
 * Legacy `.md` template + `body`. `suggest.md` must stay a `.md` file for this to
 * work; renaming it to `.yml` would make GitHub ignore `body` and open an empty
 * form (issue forms accept only template/title/labels/assignees).
 */
const issueUrl = computed(() => {
  const title = trimmed.value.split('\n')[0]?.slice(0, 72) ?? ''
  const params = new URLSearchParams({
    template: 'suggest.md',
    title: title ? `suggestion: ${title}` : 'suggestion:',
    labels: 'suggestion',
    body: issueBody.value
  })
  return `https://github.com/${REPO}/issues/new?${params.toString()}`
})

function onInput(event: Event) {
  text.value = (event.target as HTMLTextAreaElement).value
  touched.value = true
}

/**
 * Copy fallback. GitHub has changed template query-parameter support before, and
 * a clipboard plus a plain link degrades safely if `?body=` ever stops working.
 */
const copied = ref(false)
async function copyAndGo() {
  try {
    await navigator.clipboard.writeText(issueBody.value)
    copied.value = true
  } catch {
    // Clipboard permission denied — the link still carries the body via ?body=,
    // and the textarea keeps the text selectable by hand.
    copied.value = false
  }
  navigateTo(issueUrl.value, { external: true, open: { target: '_blank' } })
}

definePageMeta({
  // A form page has nothing to index and would compete with the corpus pages
  // for crawl budget; the canonical entry points are the languages themselves.
  robots: 'noindex, follow'
})
</script>

<template>
  <div class="max-w-3xl">
    <NuxtLink to="/" class="text-xs text-(--link-color)">← Languages</NuxtLink>

    <h1 class="text-2xl font-semibold mt-3">
      Suggest an entry or a correction
    </h1>
    <p class="text-sm opacity-75 mt-2 leading-relaxed">
      Say it however you like. A name, a link, or one sentence is enough — we will work out
      the rest, and show you what we understood before anything is queued.
    </p>

    <form class="mt-6" @submit.prevent="copyAndGo">
      <label for="suggestion" class="sr-only">Your suggestion</label>
      <textarea
        id="suggestion"
        :value="text"
        rows="5"
        :maxlength="MAX_CHARS"
        placeholder="Kitten&#10;https://kittenlang.org&#10;c++ has no gc"
        class="w-full rounded-lg bg-[#0c0c0c] border border-(--ui-border-accented) focus:border-(--link-color) outline-none px-4 py-3 text-sm resize-y"
        @input="onInput"
      />

      <div class="flex items-center gap-4 mt-3">
        <UButton
          type="submit"
          color="neutral"
          variant="solid"
          :disabled="!canSubmit"
          label="Send"
        />
        <span
          class="text-xs tabular-nums"
          :class="tooLong ? 'text-red-400' : 'opacity-50'"
        >{{ text.length }} / {{ MAX_CHARS }}</span>
        <span v-if="copied" class="text-xs opacity-60">Copied — paste if the form is blank.</span>
      </div>

      <p v-if="touched && empty" class="text-xs opacity-60 mt-2">
        Write anything at all — a single word is a valid request.
      </p>
      <p v-if="tooLong" class="text-xs text-red-400 mt-2">
        That is longer than {{ MAX_CHARS }} characters. Two sentences is plenty.
      </p>
    </form>

    <p class="text-xs opacity-60 mt-6 leading-relaxed">
      We reply on the issue with what we understood. Reply “yes” and it is queued; reply with a
      correction and we re-read you. Nothing is published from this box, and a misreading costs
      you one word. Posting needs a GitHub account, because the issue thread is the queue.
    </p>

    <h2 class="text-xs tracking-widest opacity-60 mt-8">ALL OF THESE WORK</h2>
    <dl class="mt-3 grid gap-2 text-sm border border-(--ui-border-accented) rounded-lg p-4">
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        <dt class="font-mono opacity-90">Kitten</dt>
        <dd class="opacity-60 text-xs">a name — we look it up</dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        <dt class="font-mono opacity-90">https://kittenlang.org</dt>
        <dd class="opacity-60 text-xs">a link — we read the page</dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        <dt class="font-mono opacity-90">c++ has no gc</dt>
        <dd class="opacity-60 text-xs">a correction — we find the field</dd>
      </div>
    </dl>

    <h2 class="text-xs tracking-widest opacity-60 mt-8">THE RULES WE APPLY</h2>
    <ul class="mt-3 text-xs opacity-70 space-y-1.5 leading-relaxed">
      <li>Sources must be primary — the project site, spec, manual, or repository.</li>
      <li>Facts need a quotable source; a forum thread is a lead, not a citation.</li>
      <li>Tools, libraries, and data formats are declined; notations are in scope.</li>
      <li>Prose is drafted separately, from the verified facts.</li>
    </ul>
  </div>
</template>
