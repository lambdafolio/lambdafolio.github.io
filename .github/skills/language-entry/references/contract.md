# Contract Reference (language entries)

> Normative for `content/languages/*.md`. Schema source: `content.config.ts`.
> Vocabulary source: `app/utils/taxonomy.ts`. Enforced by:
> `scripts/lint-frontmatter.mjs` + `scripts/lint-body.mjs` +
> `markdownlint-cli2` (`.markdownlint-cli2.jsonc`, `npm run lint:markdown`).

## Frontmatter field table

| field | type | rules |
| --- | --- | --- |
| `title` | string | mirrors `name` (native SEO field) |
| `name` | string | **required**; ASCII-only; unique corpus-wide |
| `homepage` | string | official site only |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory for curated entries** — the entry's citations; ≥ 1 per entry (homepage counts as one reference; homepage is rendered as "Official site" first). Titled, sourced, primary-preferred. Stub rows are exempt (lint warns only) — see "Stub entries" below. |
| `logo` | string | `/logos/<file>` under `public/` |
| `author` | string | designers/organization verbatim |
| `kind` | enum | `language` \| `family` \| `dialect` \| `notation` |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` |
| `generation` | enum | `1gl` \| `2gl` \| `3gl` \| `4gl` \| `5gl` — abstraction height. Closed `GENERATIONS` vocabulary with a page per tier in `content/generations/`; the page carries the definition (§3c). Record it only when a source states the tier in equivalent terms, never derive it from `year` or `paradigms`. Tagging is deferred corpus-wide. |
| `year` | number | first public release; **unquoted** in frontmatter |
| `paradigms` | vocab string[] | `PARADIGMS` |
| `typing` | enum | `untyped` \| `dynamic` \| `static` \| `gradual` |
| `type_system` | vocab string[] | `TYPE_SYSTEM` |
| `memory` | vocab string[] | `MEMORY` |
| `execution` | vocab string[] | `EXECUTION` |
| `concurrency` | vocab string[] | `CONCURRENCY` |
| `features` | string[] | free-form tags; lowercase-kebab convention. Tier 1 of the two-tier feature model — only the promoted keys in `FEATURES` have pages (plan §3a). Every value must be **witnessed** in the prose: `lint-body` warns on unwitnessed ones. |
| `influences` / `influenced` | string[] | names must match corpus `name`s |
| `relations` | `{name, kind}[]` | kind from `RELATION_KINDS`; directional (subject = this entry) |
| `note` | string | ≤ 40 words; rendered on cards + fact sheet |

Serialization rules: field order above = canonical (`lint --fix` rewrites);
scalars in double quotes except `year`, which is unquoted (Zod `z.number()`
receives a number only when YAML has an unquoted scalar); empty arrays are
omitted; 2-space list indentation. `references` follows the two-line-per-item
form (`- url:` / `- title:` indented two spaces) — the lint canonicalizes it.

**References rule (mandatory, lint-enforced):** every entry cites ≥ 1 source
via `references`. TODO stubs get a warning only (legacy corpus grandfathered
until curated); any prose-bearing entry without references FAILS the
frontmatter lint. Derive one reference per distinct source family used
(official site, spec/manual, Wikipedia corroboration, papers). The homepage
URL is auto-rendered as "Official site" — include it in `references` only
with a *different, real* title or omit it.

**Primary-sources rule (lint-enforced):** `references` must point at primary
material — official site, spec/manual/reference, project repo, vendor docs,
standards-body documents, peer-reviewed papers, archived copies of any of
those (web.archive.org). **Wikipedia and other wikis/aggregators are
excluded as citations** (lint errors on `wikipedia.org`, `wikimedia.org`,
`wikibooks.org`, `wikidata.org`): use them during research to discover the
primary material, then cite the primary page itself.

## Stub entries (the placeholder row)

A stub is a legal, terminal state: a data row with no prose
(docs/knowledgebase-plan.md §1 — "the stubs are complete rows, not empty
pages"). The `scaffold-*` scripts can only enumerate *controlled
vocabularies*; a language discovered in passing has no vocabulary listing it,
so its placeholder is written by hand — under the same rules:

````mdc
---
title: "Name"
name: "Name"
homepage: "https://…"
---
TODO: Write the wiki article for **Name**.
````

- The body is **exactly** the seed the body lint exempts
  (`^TODO: Write the wiki article for \*\*.+\*\*\.\s*$`). Any other text makes
  the file a prose entry, and the full four-section skeleton then applies.
- File name = slug (`app/utils/slugify.ts`): lowercase, accents stripped,
  `+`→`plus`, `&`→`and`, runs of any other non-alphanumerics → `-`. `#` names
  have no generic rule — they are explicit `SLUG_OVERRIDES` (`csharp`,
  `fsharp`, `qsharp`); extend that map rather than hand-picking a slug.
- `title` mirrors `name`; both ASCII-only; `name` unique corpus-wide (a
  duplicate is a hard dev-server DB failure, not merely a lint error).
- `homepage` / `urls` only when a source already in hand attests them.
- `references` may be omitted — the frontmatter lint *warns* on stubs instead
  of failing, so there is never a reason to invent a citation to clear it.
- Omit every other field. A guessed `year`/`paradigms`/`kind`/`family` turns
  an honest hole into a wrong chip that poisons every derived view.
- **Non-destructive:** existing stubs are never rewritten. Curating one is a
  full entry pass (this skill applied end to end), not a side effect of some
  other entry's research.
- Once the file exists, `/languages/<slug>` is a legal internal link target
  (the body lint resolves against the collection). A stub is still never a
  citation, and never the demonstration language of a code tour.

## Prose skeleton (normative order)

```mdc
## Overview
(≤ 60 words; exactly 2 sentences: what it is; why it exists / its niche)

## Code
(the "language tour": 1–4 fenced blocks, 4–20 lines each, ≤ 45 tour lines
 total; multi-slot tours render as a Nuxt UI `::code-group` with one tab
 per slot, tab labels carrying the PLURAL tags — see "The code tour" below;
 the concluding caption is a `::note` callout placed AFTER the group)

## Distinctive traits
(3–6 bullets, ≤ 25 words each: claim + consequence)

## Status
(≤ 40 words: maturity, implementations, standards, license, home)

<!-- optional -->
## History
(≤ 80 words; only when history is load-bearing — e.g. Buran/SCADE)
```

Rules:

- Sections appear in this order; absent sections are omitted entirely (no
  empty headers).
- The body carries **no structured data**: no tables of facts, no fact lists
  that belong in frontmatter. Rendering a fact in prose duplicates it —
  prefer linking the chip ("static typing" in traits, data in schema).
- Cross-language mentions link internally: `[Rust](/languages/rust)`. Only
  for languages that exist in the corpus (name = their exact `name`).
- **Hyperlink the terms and the evidence** (owner rule): prose is the
  reading layer, so the named mechanisms and the sourced claims carry links.  - Internal targets: sibling languages and the paradigms the entry adopts —
    `[C++](/languages/cplusplus)`, `[declarative](/paradigms/declarative)`.
  - External targets: the documentation section that *defines* each
    mechanism the code tour shows, plus the spec/repo/release/standards
    page/paper/article the facts come from — e.g.
    `[`bitdata`](https://…/user-guide/bitdata.html)`,
    `[unbiased choice](https://…/parsers.html#unbiased-choice)`.
  - Link the anchor that documents the mechanism, and verify it exists; a
    guessed fragment is a silent 404.
  - Link the noun phrase that carries the claim, not "here"/"this page".
  - Do not link an aggregator (Wikipedia et al.) in the body — same rule as
    `references`; the body lint errors on it.
  - A prose entry with **no** link at all is a warning (legacy backlog); a
    new entry should not ship in that state.
- No H1 (`#`) — the page component renders the title. First H2 starts the
  skeleton.
- Marketing adjectives only with attribution ("described as…"); superlatives
  out.
- Code examples: idiomatic, minimal, and *true to the language's documented
  syntax*. If syntax confidence < certain, caption must say "paraphrased"
  and the closing summary must flag it.

## The code tour (normative inside `## Code`)

Demonstration is consistent across languages: the tour walks the same four
mechanism slots (SICP's language-reading order), each block pairing a
*construction* with a *consumption* — the observational reading of
introduction/elimination rules (schema.vue documents this for readers).

| Slot | Constructs (…) | Consumes (…) | One line each |
| --- | --- | --- | --- |
| `primitives:` | atomic values (numbers, strings, atoms, bools) | operators | `n = 42` |
| `combinations:` | data structures | indexing / destructuring / iteration | `xs = [2, 3]` → `head` |
| `abstractions:` | the definable unit (function, class, process, actor, rule…) | invoking/applying it | `double x = x * 2` → `double 21` |
| `idioms:` | a characteristic community pattern | its payoff | recursion, guards, trampolines… |

Tags are **plural** in every caption and tab label (`primitives`,
`combinations`, `abstractions`, `idioms`): they name *a section of the
tour*, not one example. Singular forms are a batch-one oversight and are a
lint error.

Rules:

- Tags are plural — `primitives` / `combinations` / `abstractions` /
  `idioms` — matching the wiki's noun-label convention everywhere else;
  the lint errors on singular `primitive:`/`idiom:` and hybrid
  `combination:`/`abstraction:` captions or tab labels.
- **Cover core features** (user rule: never overlook key features): scan
  the entry's `features`/`paradigms` frontmatter before writing the tour —
  each headline mechanism should surface in some slot, ideally `idioms`:
  an OO language shows its class construct, Erlang its process spawn,
  a logic language its query, a dataflow language its node equation.
  A feature is deliberately left out only when the caption says why
  (or the slot count forces a merge), not by accident.
- `primitive:`/`combination:` may merge into one block when atomic values are
  only constructible inside compound literals; `abstraction:` is the one
  slot every language satisfies.
- Slots may share a block when the language's syntax ties them tightly —
  blocks are presentation, slots are the content contract.
- Idioms are *observed* in examples, not legislated as a separate prologue:
  idiomatic syntax already appears in earlier slots.
- Rendering: multi-slot tours use Nuxt UI's `::code-group` (one tab per
  slot; the tab label carries the tag, e.g. a `javascript` fence labelled
  `primitives`), which renders as tabs with copy buttons. The tour's
  concluding caption is a **Nuxt UI callout** — a `::note` block placed
  **after** the group — stating what to notice across slots. No tag is
  needed there: the tab labels carry the tags.
- **Callouts sit OUTSIDE the group.** A callout inside a `::code-group` is
  swallowed as a tab slot by `ProseCodeGroup`, and the tab strip loses its
  labels (the tabs render as `primitives, 1, 2, 3` instead of the slot
  names). Never put a callout between two blocks of a group.
- **Consistency (user rule):** the `::code-group` shape is *the* template —
  apply it to every prose-bearing entry, including single-block entries
  (one tab). The closing `::` must be present: an unclosed group leaks
  prose into the tab strip.
- A slot is "present" when a tab names its tag; a slot may span multiple
  blocks but tags stay unique per tab.
- Tour lines are annotated with slots in comments for self-demonstrating
  entries; other languages annotate pragmatically.
- **Visual languages** (`paradigms` includes `visual` — DRAKON, Prograph…):
  demonstrate with a `mermaid` fence, which Nuxt Content renders as a
  diagram (via `@barzhsieh/nuxt-content-mermaid`). Reproduce the language's
  real icon shapes with Mermaid flowchart `@{ shape: … }` nodes as
  faithfully as the tool allows, and the callout states it is an
  approximation of the original notation — the source's notation stays
  authoritative.
- Notation/DSL entries (e.g. asciidots, cooklang) may compress slots when
  the notation can't separate mechanisms.

## Word-count rationale (fixed caps, not vibes)

Caps keep prose a *reading layer* over the schema rather than a competing
encyclopedia article. They are deliberately tight because the frontmatter
already answers who/when/what; prose answers *why it is interesting* and
*what it looks like*. Entries exceeding a cap by a small amount warn; by a
large amount error.

## Worked example (conforming shape)

````mdc
---
title: "Esterel"
name: "Esterel"
homepage: "http://www-sop.inria.fr/meije/esterel/esterel-eng.html"
kind: "language"
...
---

## Overview
Esterel is a synchronous imperative language for reactive systems. It
replaces physical time with logical instants, making concurrency
deterministic and programs verifiable.

## Code

::code-group

```esterel [idioms]
signal S;
loop
  await S;
  emit O;
end loop
```

::

::note
One logical instant per tick; `await S` suspends to the next tick carrying
S — the reactive loop in three lines. Paraphrased from the language's
documented constructs.
::

## Distinctive traits

- Multiform time: instants, not seconds — deterministic by construction.
- Broadcast signals: instantaneous communication within a tick.
- Compiles to C or RTL (VHDL/Verilog) — software and hardware targets.

## Status

Industrialized in the SCADE suite for safety-critical avionics; standardized
attempt (IEEE P1778) dissolved 2011. Open-source Columbia Esterel Compiler
and a Racket implementation exist.
````
