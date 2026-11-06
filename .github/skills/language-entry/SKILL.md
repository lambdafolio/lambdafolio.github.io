---
name: language-entry
description: 'Create or update a programming-language entry (pl-wiki). Use when: the user asks to research/add/update a language page, fill facts or prose for content/languages/*.md, backfill an entry, or check an entry against the site contracts. Encodes the frontmatter fact contract, the four-section prose spec, research procedure, and validation gates.'
argument-hint: '[language name or slug, e.g. "Erlang" or "update esterel"]'
---

# Language Entry Authoring (pl-wiki)

Produce or revise a single `content/languages/<slug>.md` entry that
(1) passes both lint gates, (2) follows the fixed prose skeleton, and
(3) contains only researchable, sourced facts.

Core doctrine (docs/knowledgebase-plan.md §1): **facts are schema; prose is
commentary.** Frontmatter is the data row; the body is optional curated
prose. Prefer *not* to state — never invent.

## Inputs to read first (cheap, load on demand)

- [Contract reference](./references/contract.md) — full field table, prose
  skeleton, style rules. Read before writing any entry.
- [Vocabularies](../../../app/utils/taxonomy.ts) — every allowed axis value.
  Read when you need a value not already in your context: never guess one.
- [Examples](./references/exemplars.md) — pointers to conforming entries in
  the corpus. Mirror their shape.

## Procedure

### 1. Scope the request

- **New language**: confirm it isn't already present under a different name
  (`grep -il "<name>" content/languages/`); check `influences`/`influenced`
  references — related entries may already link to this name.
- **Existing entry**: read the current file fully; identify which fields and
  prose sections are missing/against-contract. Changes layer on top; never
  delete curated facts that the user hasn't contested.

### 2. Research (facts only)

**Web search** — use `search.brave.com` directly through the available
browser tools (open/navigate/read page); no API key or MCP server is
involved:

1. `open_browser_page` → `https://search.brave.com/search?q=<query>`
   (URL-encode the query; quote multi-word names: `"language name"
   programming language`).
2. `read_page` the results snapshot; pick official/primary links
   (project site, spec/manual, GitHub repo, major-vendor docs, papers).
3. `fetch_webpage` (or navigate + `read_page`) the chosen sources; extract
   facts against the table below. **Primary sources only**: official site,
   spec/manual/reference, GitHub repo, major-vendor docs, peer-reviewed
   papers. Wikipedia is a *guide*, never a citation: use it to discover the
   primary material (release dates, designer names, links to specs), then
   fetch and cite the primary page itself.
4. Iterate queries as needed — one language usually takes 2–4 searches
   (`"<name>" language release year`, `"<name>" memory management`,
   `"<name>" typing discipline`).
5. If browser tools are unavailable in the session, fall back to
   `fetch_webpage` on known-URL patterns (e.g. `<name>.lang.tld`,
   `github.com/<org>/<name>`, Wikipedia only to *find* the primary URL) and
   say so in the closing summary.

Never cite search-result snippets themselves as fact sources — always the
underlying page.

Evidence standards for the gathered material:

| Field | Evidence standard |
| --- | --- |
| `name`, `homepage`, `urls` | official pages only |
| `author` | named designers/organization; team names verbatim |
| `year` | first public release; unquoted in frontmatter |
| `kind`, `status` | direct statement (e.g. "early-stage", "stable") |
| `paradigms`, `type_system`, `memory`, `execution`, `concurrency`, `features` | only what a source states in equivalent terms; map phrases to the closest vocabulary value — **never guess** |
| `influences`/`influenced` | names must match other entries' `name` (cross-link integrity warns otherwise) |
| `relations` | typed edges; kind from `RELATION_KINDS` |
| `note` | 1–2 sentences, ≤ 40 words, sourced |

Rules of evidence:

- One source can support many fields; record the *strongest* source you used.
- **Citations are mandatory**: every entry carries ≥ 1 `references` entry
  (url + title); homepage counts, and lint fails prose-bearing entries that
  lack them.
- **Wikipedia is excluded as a citation** (lint flags it): it may guide you
  to primary material, but the `references` entry must point at the primary
  source (spec paper, official page, project repo, standards body document).
- Negative facts are hard: do **not** infer absence (no mention of GC ≠ no GC).
- Marketing adjectives ("blazingly fast", "AI-first") → do not transcribe into
  facts; at most into prose with attribution ("described as…").
- **Unverifiable → omit the field** and say so in your summary. Holes are
  honest; wrong chips poison every downstream view.
- **Never overlook a core feature** (user rule): before writing the tour,
  scan the entry's `features`/`paradigms`/`type_system` profile and make
  sure each flagship mechanism appears in some slot of the code tour, a
  trait bullet, or the callout. JavaScript's `prototypes` feature with no
  prototype code in sight is exactly the failure to avoid. A flagship
  feature the tour cannot show must be *stated* (callout or trait), never
  silently dropped.
- **Every declared feature must be witnessed** (`lint-body` warns): the check
  above is automated. Each value in the entry's `features` array must appear
  somewhere in the prose — the code tour, a trait, or the callout — matched
  by name, kebab phrase, distinctive segment, or a known synonym. An
  unwitnessed feature gives the curator a two-way choice, and both are
  acceptable: **show it** (a slot, a trait, or a sentence naming the
  mechanism) or **drop the tag**. What is not acceptable is an entry
  advertising a mechanism it never shows. Prefer *dropping* for features the
  language merely permits and *showing* for the ones that define it.
- **Features are tiered** (docs/knowledgebase-plan.md §3a): a `features`
  value is a free tag — do not worry about vocabulary spelling, and never
  invent a `content/features/` page. Only the promoted keys in `FEATURES`
  (`app/utils/taxonomy.ts`, ≥ 3 corpus entries declaring it) have pages, and
  promotion is the owner's schema decision. When an entry declares a
  promoted key, the UI links it automatically; nothing to do in prose.
- **Hyperlink as you write** (user rule, Nov 2026): prose is the reading
  layer over the schema, so every *named mechanism* and every *attributed
  claim* must be one click from its source. Ship the entry with links, not
  as a follow-up pass:
  - **Internal, for sibling entries** — the language's relatives, and the
    paradigms it adopts: `[C++](/languages/cplusplus)`,
    `[domain-specific](/paradigms/domain-specific)`. Only when the target
    exists in the corpus; the body lint errors on a dead cross-link.
  - **External, for the evidence** — the docs page that defines each
    mechanism the tour demonstrates (`bitdata`, coercion semantics, choice
    operators), the spec/repo/release the facts come from, the standards
    body, the paper, and the article you quote. Link the *section anchor*
    that documents the mechanism, not just the site root, and verify the
    anchor exists — a guessed `#fragment` is a silent 404 in a new tab.
  - **Anchor the noun, not the sentence** — `[repetition](…#repetition)`, not
    `[here](…)`; link the phrase that carries the claim
    (`[describes the language as memory-safe](…project page)`) so the
    attribution stays legible.
  - **Do not double-link**: a term linked in Overview need not be linked
    again in traits when the same target already appears nearby, and the
    `references` block still owns the citation — prose links are for the
    reader, not a duplicate bibliography.
  - **Never link an aggregator** in the body (Wikipedia et al.) — the same
    rule as `references`, and the lint errors on it. If the only page you
    found is a wiki, keep researching until you have the primary source.
  - **Check every URL before shipping** (`curl -s -o NUL -w "%{http_code}"`
    or a browser fetch). Note that ACM DL and some standards bodies answer
    `403` to a bare HTTP client while loading fine in a browser — say so in
    the closing summary rather than dropping a good canonical link.

### 3. Write the entry

Frontmatter: canonical field order (script `lint --fix` will reorder anyway,
but write it canonically); `title` mirrors `name`; scalars quoted except
`year`; arrays 2-space-indented quoted items; typed `relations` edges use the
`- name:` / `- kind:` (indented) form.

Body: the four-section skeleton — Overview (≤ 60 words, 2 sentences),
Code (required: the language tour — 1–4 fenced blocks, 4–20 lines each,
≤ 45 tour lines total; ALWAYS rendered as a Nuxt UI `::code-group` whose
tab labels carry the PLURAL slot tags `primitives` / `combinations` /
`abstractions` / `idioms`; cover the language's core features from
`features`/`paradigms` — no headline mechanism left out by accident),
Distinctive traits (3–6 bullets, each claim + consequence), Status
(≤ 40 words).
The tour's concluding caption is a Nuxt UI callout — a `::note` block
placed **after** the `::code-group` — stating what to notice across the
slots. Never put a callout inside the group: `ProseCodeGroup` swallows it
as a tab slot and the tab strip loses its labels.
Cross-language mentions link internally, and each mechanism the tour names
links to the documentation that defines it — see "Hyperlink as you write"
above; hyperlinking is part of writing the entry, not a cleanup step. Do not
invent code from thin air
unless you are confident in the language's syntax from its docs — a *wrong*
example is worse than none, and omitting the Code section is a lint error
you cannot paper over. When the language's exact syntax is uncertain, still
include a block whose callout marks it as paraphrased/aspirational and flag
it in your summary for review.

See [contract.md](./references/contract.md) §Prose for the exact skeleton
and word caps, and §The code tour for the slot definitions.

### 4. Validate (gates — all must pass)

```sh
node scripts/lint-frontmatter.mjs          # fact contract + vocabulary
node scripts/lint-body.mjs                 # prose skeleton + caps + links
npm run lint:markdown                      # markdownlint-cli2 style rules
npx nuxi typecheck                         # only if you touched app/ code
npm run generate                           # only if serving; catches Zod violations
```

In `lint-body`'s report, fix everything categorized as an error; warnings
(word-count near-cap, missing optional History) are judgment calls — list
them in your closing summary for the user to arbitrate.

### 5. Closing summary (always)

End your response with:

- what you added/changed (fields + sections),
- sources used per group of facts,
- every field you deliberately left blank and why,
- lint results (both gates),
- the hyperlink audit: how many prose links, which targets, and any URL that
  could not be verified from the shell (403 bot-walls) or whose anchor you
  could only confirm by reading the page,
- anything flagged for human review (uncertain code examples, marketing
  language, contested facts).

## Anti-patterns

- Writing an encyclopedia essay. Caps exist; if the story doesn't fit, it
  belongs in a sourced reference, not prose.
- Treating the code tour as a checklist to satisfy with filler one-liners:
  each slot needs a real construction **and** a real consumption; omit a
  slot honestly if the language lacks it rather than padding.
- Overlooking core features: check `features`/`paradigms` frontmatter
  before writing the tour — a language's headline mechanism (classes,
  processes, macros, pattern matching…) must appear in some slot, ideally
  `idioms`. Dropping one silently is a correctness failure, not a style one.
- Inconsistent template application: every entry uses the same
  `::code-group` tour shape (singular `primitive:`/`idiom:` spellings are
  lint errors; single-block entries still get one tab).
- Shipping an entry without `references` — citations are mandatory and the
  frontmatter lint fails prose-bearing entries that lack them.
- **Shipping an entry whose prose names mechanisms and sources without
  linking them.** Every mechanism the tour demonstrates and every claim you
  attribute belongs one click from its documentation; the body lint warns
  when a prose entry has no link at all. A finished entry reads as a
  network of sources, not a wall of unlinked assertions.
- **Linking a guessed anchor or an unverified URL.** `#some-section` that
  does not exist and a URL that 404s (or silently redirects) are worse than
  plain text: they look sourced. Verify both; if a host blocks the shell,
  fetch it through the browser and report that in the summary.
- Citing Wikipedia (or any aggregator) in `references` — it is a research
  *guide*; the citation must point at the primary source it led you to.
- Inventing paradigms/typing from reputation instead of a source statement.
- Fabricating code examples — worst possible failure in this repo.
- Adding vocabulary values to `taxonomy.ts` without asking: adding a value is
  a schema decision the owner makes (one line + corpus re-lint).
- Skipping the corpus-collision check — duplicate `name` values hard-crash
  the dev-server build (UNIQUE constraint).

## Batch mode (phase 6 curation)

When asked to do several languages, pick a *contrasting* set and state the
batch's exit criterion up front: a researcher should be able to compare the
batch without unstructured prose. Do languages one at a time, gates between
each, one closing summary at the end listing per-language deltas.
