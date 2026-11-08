# Knowledgebase Plan: LambdaFolio as a normalized language database

> Status: **plan of record** (supersedes `docs/migration-nuxt-plan.md`, kept
> for the completed Jekyll→Nuxt migration record). Decisions below were
> accepted by the owner on 2026-10-25.
>
> Positioning: unlike a traditional wiki (ad-hoc articles, geneology-first)
> and unlike RosettaCode (task-based comparison of idiomatic solutions), this
> project is a **research database**: each language is a row with a normalized,
> queryable fact profile, and the UI is built around filtering, comparison,
> and derived views — not article navigation.

## 1. Architecture principle

**Facts are schema; prose is commentary.**

- One Markdown file per language (`content/languages/<slug>.md`) remains the
  single source of truth — now as a **row**: frontmatter carries the full fact
  profile, the body carries optional curated prose only.
- Nuxt Content v3 turns frontmatter into typed SQLite columns (existing
  `content.config.ts`); new axes become new columns. The corpus is small
  (~380 rows), so faceting is computed client-side over one typed `select()`.
- Vocabulary drift — the thing that made free-string arrays un-normalizable —
  is controlled by **lint-checked vocabularies** (chosen over hard `z.enum()`:
  keeps authoring and the Studio form ergonomic) plus a `--fix` script.
- Prose carries no data: pages may be frontmatter-only stubs. The ~380 stubs
  are complete rows, not empty pages.

## 2. Schema v2 (content.config.ts)

Identity (existing) and classification fields stay per-language free-text.
Axes marked **vocab** are linted against the vocabulary in
`app/utils/taxonomy.ts`; unlinted string arrays remain free-form.

| field | type | vocab | notes |
| --- | --- | --- | --- |
| `name` | string | — | required |
| `title` | string | — | native SEO field, mirrors `name` |
| `homepage` | string | — | optional |
| `urls` | string[] | — | optional; external references |
| `logo` | string | — | optional; `public/logos/*` |
| `author` | string | — | optional |
| `influences` / `influenced` | string[] | — | names cross-linked against the collection |
| `note` | string | — | short renderable summary |
| `kind` | enum | — | `language` \| `standard` \| `dialect` \| `notation` |
| `status` | enum | — | `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | — | first appeared (≈1943–present) |
| `family` | string | ✓ | lineage key; one per language — see §3b |
| `paradigms` | string[] | ✓ | existing field, now linted |
| `typing` | enum | — | `untyped` \| `dynamic` \| `static` \| `gradual` |
| `type_system` | string[] | ✓ | e.g. `inferred`, `structural`, `dependent`, `linear` |
| `memory` | string[] | ✓ | e.g. `gc`, `arc`, `ownership`, `regions`, `arena` |
| `execution` | string[] | ✓ | e.g. `native`, `bytecode`, `vm`, `jit`, `transpiled` |
| `concurrency` | string[] | ✓ | e.g. `actors`, `channels`, `async/await`, `coroutines` |
| `features` | string[] | free | long tail: `macros`, `reflection`, `ffi`, … |

Backfill strategy: **scripted, conservative** — derive where the source supports
it; leave blank otherwise for curation. No guessed values.

## 3. Taxonomy layer (`content/paradigms/`)

`paradigms/*.md` — one page per **programming paradigm**, the sibling concept
to a language entry: definition, rationale, and a list of member languages.
Members are *derived at build time* from language frontmatter (a member-list
page never goes stale), not hand-maintained.

The file name **is** the taxonomy key (`paradigms/object-oriented.md`) and the
`paradigm` frontmatter field repeats it, so the join with the languages
collection is exact: a language lists its paradigms by the same vocabulary
value from `PARADIGMS` (`app/utils/taxonomy.ts`). No mapping table, and
neither side can drift — the lint errors when a language names a paradigm
with no page, or when a page's key is not a vocabulary value.

A paradigm page deliberately has **no** `typing` / `memory` / `execution` /
`concurrency` / `kind` fields: those are properties of the *languages* that
adopt a paradigm. What a paradigm records is its defining characteristics
(`features`), its origin (`year`, `author`), and its edges to other paradigms
(`relations`).

- Phase 4a (DONE): derive member lists at build; pages are optional prose +
  definition. `scripts/scaffold-paradigms.mjs` creates one stub per
  vocabulary value; `node scripts/scaffold-paradigms.mjs --members <key>`
  prints the derived member list.
- Phase 4b (DONE): queryable `paradigms` collection with the join key
  enforced by `scripts/lint-frontmatter.mjs`; `/paradigms` and
  `/paradigms/<slug>` routes render the member list derived from the
  languages collection.
- Phase 4c (optional): a `links` map from concept → schema field(s) powering
  cross-navigation for the remaining vocab axes (`type_system`, `memory`,
  `execution`, `concurrency`), which have no pages of their own yet.

## 3a. Features (`content/features/`) — two tiers

A language's `features` array is **free-form and stays free-form**. It is a
long tail (85 distinct values across 21 entries today, 74 of them used
exactly once) whose job is cards, facet chips, and search — not a route.
Promoting every string to a page would create 85 pages where 74 describe a
single language, freeze the vocabulary's inconsistencies into URLs, and
compete with the language entries themselves.

So features have two tiers:

| tier | where | contract |
| --- | --- | --- |
| 1 — tags | `features:` on a language entry | free-form, uncapped, unlinted; rendered as filter chips |
| 2 — promoted | `content/features/<key>.md` + `/features/<key>` | the key is a `FEATURES` vocabulary value, slug-safe, with a page |

**Promotion threshold:** a feature is promoted when **≥ 3 language entries**
declare it (`FEATURE_PROMOTION_THRESHOLD` in `app/utils/taxonomy.ts`). The
threshold is the difference between "a page about a mechanism several
languages provide" and "a stub about one language's private trick".
`node scripts/scaffold-features.mjs --candidates` recomputes the tier from
the corpus, so promotion is decided from data rather than taste.

A promoted feature is the *same* join as a paradigm: the file name is the
key, the `feature` field repeats it, and the member languages are derived at
build time (never stored). The lint errors when a `FEATURES` value has no
page, when a page's key is not in `FEATURES`, or when the key is not
lowercase kebab (it becomes a route segment). Unpromoted tags are never
linted — that is the point of tier 1.

## 3b. Families (`content/families/`) — lineage, not classification

A language row can answer three independent questions, and until now only two
had a home:

| question | axis | cardinality | where |
| --- | --- | --- | --- |
| What does it *do*? | `paradigms` | many, orthogonal | vocab + `/paradigms` |
| What sort of artifact is the row? | `kind` | one | enum |
| Where does it *descend from*? | `family` | **one** | **vocab + `/families`** |

**`family` is not a `kind` value.** `KINDS` used to advertise
`language | family | dialect | notation`, but no entry ever used `family` —
because a family is a *group of rows*, not a row kind. Modelling it as a kind
would have injected non-language pseudo-rows into the 400-row index, the
compare matrix, and every facet. `family` was therefore removed from `KINDS`
and `standard` added in its place: ECMAScript had been forced into
`kind: dialect` although it is the root specification of its lineage.

`family` is also not a paradigm. The object-oriented paradigm contains
Smalltalk, SIMULA, C++, and Java, which are not one lineage; conversely Self is
not class-based yet is squarely in the Smalltalk family. Descent and feature
list are independent, and the schema keeps them independent.

**Contract.** One page per family in `content/families/<key>.md`; the file name
IS the key and the `family` field repeats it. A language entry carries at most
one `family` value, drawn from the closed `FAMILIES` vocabulary. The member
list is **derived** at build time by an exact `family` equality — a scalar
join, cheaper than the `LIKE` containment the paradigm and feature pages need
for their JSON-text arrays. `relations` on a family page point at *other
families* (`derived-from`, `shares-ancestor-with`, …), which is how genuine
cross-family descent is expressed without a second value on the language.

**Name collision is intended.** `smalltalk` and `ecmascript` name a family page
*and* a language row. The family is the group its namesake belongs to;
`relations` resolve within their own collection, and `name` uniqueness is
per-collection.

**Prose.** Family pages are prose pages *without* the code tour — a family is
lineage, not a language, so there is no idiomatic program to walk.
`lint:body` registers the collection with `skeleton: false`, which keeps the
H1 rule, cross-link integrity, and feature witnesses while skipping the
Overview/Code/Distinctive-traits/Status skeleton and its caps.

**Promotion threshold.** `FAMILY_PROMOTION_THRESHOLD = 3` entries, mirroring the
feature rule: below that, a page would describe one language's private
ancestry. `node scripts/scaffold-families.mjs --candidates` recomputes the tier
from the corpus. The initial six families and their member counts:

| family | members | what the members vary |
| --- | --- | --- |
| `smalltalk` | 3 | classes → prototypes (Self), classes → nested modules (Newspeak) |
| `ml` | 6 | modules (SML/OCaml), host platform (.NET, JavaScript) |
| `ecmascript` | 12 | implementations, supersets, embedded hosts |
| `lisp` | 6 | namespace policy, immutability, host VM |
| `c` | 4 | safety (Cyclone), abstraction (C++), tooling (D) |
| `algol` | 5 | block content: classes (SIMULA), simplification (Pascal), safety (Ada) |

Routes: `/families` (index with derived member counts) and `/families/<key>`.

**Witness rule (the coverage guarantee):** every declared feature must
appear somewhere in the entry's prose — the code tour, a trait bullet, or
the callout. `lint-body` warns when a claimed feature is never witnessed,
which is what makes "never overlook a core feature" checkable rather than
aspirational. The finding points at either prose to add or a tag to drop:
an entry should not advertise a mechanism it never shows.

Authoring is encoded in [`.github/skills/feature-entry/`](../../.github/skills/feature-entry/)
(promotion check → bounded research → comparison tour → gates), so a batch
of feature pages follows the same procedure as a batch of language pages.

## 4. Information architecture (routes)

| route | purpose | build |
| --- | --- | --- |
| `/` | **Research index**: faceted filter with two combinators (any/all within a category, any/all across categories) + Fuse.js fuzzy search over name/note/facts + results grid | phase 2 |
| `/languages/<slug>` | Fact sheet: infobox grouped by axis (chips cross-link to paradigm pages) + optional `<ContentRenderer>` prose | phase 3 |
| `/compare?a=…&b=…` | N-way comparison matrix over every axis, cell-highlighted diffs | phase 3 |
| `/paradigms` | Paradigm index: one card per paradigm with its derived member count | phase 4 |
| `/paradigms/<slug>` | Paradigm definition + prose + **derived** member list | phase 4 |
| `/features` | Feature index: one card per *promoted* feature with its derived member count | phase 6 |
| `/features/<key>` | Feature definition + prose + **derived** member list | phase 6 |
| `/graph` | Influence graph — one lens among many, not the organizing metaphor | phase 4 |
| `/schema` | The contract itself, documented (repurpose legacy entry) | phase 3 |

Derived views are **computed** from the collection — no hand-authored pages.

## 5. Drift controls

All six migration-plan controls stay in force (Zod schema, `meta` lint, one
template component, slug rule, cross-link integrity, orphan check) plus:

1. **Vocabulary lint** — `scripts/lint-frontmatter.mjs` parses every page's
   frontmatter directly (no Nuxt boot): required-field presence, schema-shape
   parity with `content.config.ts` (new keys can't sneak in), enum/vocab
   membership, year plausibility, unknown-field rejection. `--fix` normalizes
   casing/order and reports (never silently changes) unrecognized vocab values
   with suggestions. Wired as `npm run lint:frontmatter`; run it before
   generate.
2. **Vocabularies are data** — the single source lives in
   `app/utils/taxonomy.ts` (importable at build time and in components);
   `content.config.ts` and the lint script import from it. Adding a vocabulary
   value is a one-line change + corpus re-lint, never a manual sweep.
3. **Prose skeleton lint** — `scripts/lint-body.mjs` (`npm run lint:body`)
   enforces the four-section prose contract (Overview ≤ 60 words → Code —
   the "language tour" — 1–4 blocks, 4–20 lines, ≤ 45 tour lines total,
   fenced + slot-tagged tabs (primitives / combinations / abstractions /
   idioms, pairing each construction with a consumption) + a concluding
   `::note` callout → Distinctive
   traits 3–6 bullets → Status ≤ 40 words; History optional ≤ 80) plus
   cross-link integrity in bodies and no structured-data duplication in
   prose. Frontmatter-only stubs are exempt (a data row is a valid terminal
   state). It also enforces two coverage rules: a prose entry with no
   hyperlink warns (prose links mechanisms to their source docs), and a
   declared-but-unwitnessed `features` value warns (§3a). The normative
   spec and authoring workflow live in `.github/skills/language-entry/`
   (see §8).

## 6. Phases

1. **Schema v2 + vocab lint** *(this PR)* — `app/utils/taxonomy.ts`,
   `content.config.ts` v2 fields, `scripts/lint-frontmatter.mjs` (+`--fix`),
   normalize the two prose-heavy entries to frontmatter-only stubs, README
   contract update, backfill script (`scripts/backfill-facts.mjs`) for
   `kind`/`status`/`year` from note/homepage evidence.
2. **Research index** — facet sidebar + card grid + sort + URL-synced filter
   state (whichcoding.tools-style; shipped Oct 25 2026). The filter model
   (`app/utils/filters.ts`) carries two orthogonal combinators — *any/all
   values within a category* and *any/all categories* — so a researcher can
   ask for the intersection of every selected fact, the union of them, or a
   mix (per-category overrides). Search is Fuse.js over the name, note, and
   facet values.
3. **Fact sheet + compare** — hero + stat rail + Explore/Maintain sections;
   `/compare` matrix; `/schema` contract page (shipped Oct 25 2026).
4. **Taxonomy + graph** — concept pages with derived members; `/graph` lens.
   Typed relationship edges (§7) land here — the graph needs them.
   (Paradigm collection shipped Nov 3 2026; **promoted features** and the
   witness rule shipped Nov 5 2026 — see §3a; the **families** collection and
   the `family` axis shipped Nov 7 2026 — see §3b.)
5. **Post-v1** — carried over: feed items when a feedable collection exists;
   optional Studio production editing if an SSR deploy target is ever added.
6. **Curation batches** — researched entries for the 363 note-less stubs.
   Batch exit criterion (adapted from ChatGPT design review): a researcher
   can compare the batch's 8–12 *contrasting* languages (at minimum: one
   imperative, one functional, one logic, one systems language) without
   relying on unstructured prose. Phase 6 runs continuously; batch one
   should target landmark languages that existing relations already
   reference (Erlang, Ada, Prolog, …).

## 7. Prior art / roadmap inputs

Adapted from the owner's earlier design conversation (ChatGPT, 2025) plus
independent convergence during the 2026-10-25 UI work.

**Converged before reading it** (validation of the core model): structured
queryable knowledge base over conventional wiki; prose supplementary to
schema; curated vocabularies; "unrecorded ≠ negative" (hide unknown facts);
flat files + Nuxt Content first, dedicated storage later; LLM proposes →
deterministic validation + human review decides.

**Lifted:**

- **Typed relationship edges** (phase 4) — `influences`/`influenced` is one
  edge type; real lineage needs `derived_from`, `influenced_by`,
  `shares_ancestor_with`, `forked_from`, `standardized_as`, `dialect_of`,
  `supersedes`, `implemented_in`, `transpiles_to`, `interoperates_with`.
  "Compiles to JavaScript" is *not* descent from JavaScript; a schema-v3
  `relations:` structured field carries `{name, kind}` pairs.
- **Contrasting-language curation batches** (phase 6) — the 8–12 contrasting
  languages exit criterion above.
- **The code tour** (2026-10-25) — `## Code` walks four mechanism slots
  (SICP's Primitives / Means of Combination / Means of Abstraction plus
  Idioms), each tab labelled `primitives:` / `combinations:` /
  `abstractions:` / `idioms:` and pairing a construction with a consumption
  (the observational reading of introduction/elimination rules — runtime-
  demonstrable, never formal inference notation, to respect "never invent").
  Unfillable slots are stated honestly in the concluding callout (a Nuxt UI
  `::note` placed after the `::code-group`). Documented for readers
  on `/schema`; enforced by `lint:body` (batch mode: retrofit 8–12
  contrasting entries at a time).
- **Evidence states** (deferred, v3) — `specified` / `implementation-defined`
  / `unspecified` / `undefined` / `observed` / `unknown` / `n/a` are the
  vocabulary that turns a listing into a database. Frontmatter ergonomics
  cap how much of this belongs per-field today; adopt when the fact model
  strains (likely with the claim-record threshold below).

**Known limitation (accepted at current granularity):** the `execution` and
`memory` axes conflate *language-level* facts with
*reference-implementation* facts (e.g. "Dafny transpiles to C#" is about its
main implementation, not the abstract language). Acceptable now — most
entries have one dominant implementation — but a future `implementations`
entity (name, version, targets, conformance) is the clean separation if
claims ever need per-implementation precision.

**Deliberately not adopted yet:** claim-level provenance records (stable
claim IDs, version scopes, confidence, citation records) and the
ingestion-pipeline/monetization architecture. Revisit the provenance model
when per-fact evidence is needed for a shipped comparison; the monetization
notes remain recorded in the source conversation.

## 8. LLM-driven authoring (phase 6 operationalization)

The Grokipedia-inspired direction, made concrete: modifications to entry
content flow through the agent, but *validation stays deterministic*.

- **Skill**: `.github/skills/language-entry/` — encodes the field contract,
  prose skeleton, code tour, research procedure, evidence standards, and
  validation gates. Prompt pattern: "research and create an entry for X" /
  "update X to conform". Any capable LLM/agent follows it; consistency is in
  the skill + lints, not the model.
- **Deterministic gates** (the "boxes ticked"): `lint:frontmatter` (facts),
  `lint:body` (prose), Zod at build, plus `nuxi typecheck`/`generate` when
  code changes. An agent cannot skip the gates; the owner reviews the git
  diff, not the agent's prose claims.
- **Division of labor**: the LLM proposes claims + prose + code examples;
  lints verify *shape and vocabulary*; the human approves *truth*. Evidence
  standards in the skill require sourced facts and forbid invented examples;
  unresolvable fields stay blank and are listed in the agent's closing
  summary.
- **Escape hatch**: direct hand-edits remain possible for the owner; the
  gates apply equally to hand edits (same lints run pre-generate), so the
  LLM-first flow is a *process preference*, not a lock.
