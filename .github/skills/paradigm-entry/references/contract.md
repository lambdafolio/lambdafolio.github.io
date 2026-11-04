# Contract Reference (paradigm entries)

> Normative for `content/paradigms/*.md`. Schema source: `content.config.ts`
> (§paradigms). Vocabulary source: `app/utils/taxonomy.ts`. Enforced by:
> `scripts/lint-frontmatter.mjs` + `scripts/lint-body.mjs` + `markdownlint-cli2`
> (`.markdownlint-cli2.jsonc`, `npm run lint:markdown`).

This contract is the sibling of
[`language-entry/references/contract.md`](../../language-entry/references/contract.md).
Where they agree (prose skeleton, code-tour mechanics, evidence rules,
serialization), the language contract governs verbatim. This file states the
**differences**, which are what actually trip up an author who assumes the
language workflow applies.

## Field table — what a paradigm has, and what it deliberately lacks

| field | type | rules |
| --- | --- | --- |
| `title` | string | mirrors `name` (native SEO field) |
| `name` | string | **required**; ASCII-only; unique within this collection |
| `homepage` | string | canonical home for the *paradigm* (paper, manual, standards page) |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory** — ≥ 1 per curated entry; primary sources only |
| `logo` | string | optional; `/images/paradigms/<file>` under `public/` |
| `author` | string | the paradigm's originator(s), verbatim |
| `paradigm` | string | **required**; MUST equal the file name |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | the paradigm's origin year; **unquoted** in frontmatter |
| `features` | string[] | the **defining characteristics** — the paradigm's definition |
| `relations` | `{name, kind}[]` | edges to other paradigms; `name` = paradigm key or display name |
| `note` | string | ≤ 40 words; rendered on cards + fact sheet |

### Fields that exist for languages but NOT for paradigms

`typing`, `type_system`, `memory`, `execution`, `concurrency`, `kind`,
`influences`, `influenced`. The lint errors on any unknown field, so these
cannot be added.

Why: a paradigm has no typing discipline, no memory model, no execution
strategy, no concurrency model. Those are properties of the *languages* that
adopt a paradigm. A paradigm that carried them would be a language entry
under a different name.

`influences` / `influenced` are language-to-language edges (they resolve
against language names). Paradigm-to-paradigm edges live in `relations`,
which resolves against paradigm keys.

### Fields that exist for paradigms but NOT for languages

`paradigm` — the join key. It repeats the file name so the join between the
two collections is explicit and queryable rather than positional.

## The join, in one diagram

```text
app/utils/taxonomy.ts
  PARADIGMS = ['functional', 'object-oriented', ...]      <- controlled vocabulary
        |                                    |
        |  (language side)                   |  (paradigm side)
        v                                    v
content/languages/javascript.md       content/paradigms/functional.md
  paradigms:                              paradigm: "functional"
    - "functional"                       file name: functional.md
    - "imperative"                       -> paradigm === file name (lint-enforced)
        |                                    |
        |  join key == vocabulary value     |
        +------------> PARADIGMS <-----------+
                         ^
                         |
        content/paradigms/<key>.md  (one page per vocabulary value)
```

Consequences to respect while authoring:

- Renaming a paradigm means changing the vocabulary value, every language
  entry that lists it, and the file name — in that order. The lint reports
  a language whose `paradigms:` value has no page.
- A paradigm page exists for **every** `PARADIGMS` value, even if it is
  still a stub. `scripts/scaffold-paradigms.mjs` creates the missing ones.
- Member languages are **derived**, never stored. See below.

## Member languages are derived, not authored

The member list of a paradigm is computed at build time from the languages
collection: every language whose `paradigms:` array contains this
paradigm's key.

Why this matters for authoring:

- There is no `members` field. The schema rejects it.
- The prose must not enumerate members as a list or table — that is a
  hand-maintained copy of a derived fact, and it goes stale silently. Link
  to the derived view instead (the paradigm page renders the member list).
- The languages collection is the corpus's *claim* about which languages use
  the paradigm. It is a lead for research, not a citation.

## Prose skeleton (normative order)

```mdc
## Overview
(≤ 60 words; exactly 2 sentences: what the paradigm is; where it came from
 or what problem it answers)

## Code
(the "paradigm tour": 1–4 fenced blocks, 4–20 lines each, ≤ 45 tour lines
 total, rendered as a Nuxt UI `::code-group` whose tab labels carry the
 PLURAL slot tags — see "The paradigm tour" below)

## Distinctive traits
(3–6 bullets, ≤ 25 words each: claim + consequence)

## Status
(≤ 40 words: whether the paradigm is still in use, what replaced it, where
 it lives now)
```

`## History` is optional (≤ 80 words) — for paradigms it is often
load-bearing (the origin year and the paper), so prefer it over putting
history in the Overview.

Rules inherited from the language contract:

- Sections appear in this order; absent sections are omitted entirely.
- The body carries **no structured data**: no tables of facts, no fact lists
  that belong in frontmatter.
- Cross-references link internally: `[Functional](/paradigms/functional)`,
  `[Smalltalk](/languages/smalltalk)`. Only for entries that exist.
- No H1 (`#`) — the page component renders the title.
- Marketing adjectives only with attribution.
- The demonstration must be **true to a real language or notation**; if
  syntax confidence is low, the callout must say "paraphrased" and the
  closing summary must flag it.

## The paradigm tour (normative inside `## Code`)

A paradigm has no syntax of its own, so the tour demonstrates **the
paradigm's defining mechanism applied to a concrete problem**. The slot tags
are the wiki-wide convention; their content shifts meaning:

| Slot | Constructs | Consumes | Paradigm reading |
| --- | --- | --- | --- |
| `primitives:` | the paradigm's basic unit of composition | operators / the basic unit | a closure, a message, a clause, a node, a relation |
| `combinations:` | how the unit composes | combination / sequencing | a call chain, a clause set, a process network, a join |
| `abstractions:` | the paradigm's central abstraction | applying it | a lambda, an object, a process, a fact, a transition |
| `idioms:` | the paradigm's characteristic style | its payoff | recursion, dispatch, backtracking, piping, staging |

Same mechanical contract as languages: 1–4 blocks, 4–20 lines each, ≤ 45
tour lines total, PLURAL tags, `::code-group` tabs preferred, one concluding
caption stating what to notice across slots — a Nuxt UI `::note` callout
placed **after** the group (inside, it is swallowed as a tab slot and the
tab strip loses its labels).

### Choosing the demonstration language

1. Prefer a **canonical** language for the paradigm (Smalltalk for
   object-oriented, Lisp for functional, Prolog for logic, Erlang for
   message-passing, SQL for relational, ML for the functional core).
2. Prefer one **already curated** in the corpus — its prose and code are
   vetted and its `paradigms:` field already lists this paradigm.
3. If the corpus has no canonical language, use a language that *does* exist
   in the corpus and genuinely exhibits the paradigm, and **say in the
   callout** which language the demonstration uses and why.
4. If no language in the corpus exhibits the paradigm well enough, demonstrate
   the paradigm's **shape** in its domain notation (a specification, a
   transition table, a query plan, a circuit) — and say so.

Never: invent a language entry to host the example; write an example in a
language the corpus does not contain (it cannot be linked or cited); present
a pseudo-language without labelling it as such.

## Evidence rules

Inherited from the language contract, with one paradigm-specific emphasis:

- **Primary sources only.** Wikipedia and other wikis guide research; the
  citation points at the paper, manual, or standards document.
- **The canonical source is the paradigm's origin.** For a paradigm this is
  nearly always one document: the paper that introduced the term, the
  language manual that defined it, the standard that formalized it.
  Cite that one. Supplement with the manual of the canonical language.
- **Never cite a language entry** as the definition of a paradigm.
- **Negative facts are hard**: do not infer that a paradigm is unused
  because no source discusses it.
- **Unverifiable → omit the field** and say so in the summary.

## `features` — the definition

`features` for a paradigm is the set of mechanisms that make the paradigm
*distinctive*. Write each as a short noun phrase using the field's
literature, in lowercase-kebab:

| paradigm | features that earn their place |
| --- | --- |
| functional | `first-class-functions`, `immutable-data`, `expression-oriented`, `recursion` |
| object-oriented | `encapsulation`, `inheritance`, `polymorphism`, `message-passing` |
| logic | `unification`, `backtracking`, `horn-clauses`, `declarative-facts` |
| relational | `tables`, `relations`, `set-semantics`, `declarative-queries` |
| dataflow | `nodes`, `edges`, `synchronous-rates`, `data-dependencies` |
| effect | `effect-handlers`, `first-class-effects`, `algebraic-effects` |

Do not include the paradigm's own name. Do not include properties it merely
permits. Keep the count small — 3 to 6.

## `relations` — paradigm-to-paradigm edges

Use `RELATION_KINDS` from `app/utils/taxonomy.ts`. The kinds that carry
meaning between paradigms:

| kind | meaning | example |
| --- | --- | --- |
| `derived-from` | developed out of another paradigm | `effect` → `functional` |
| `influenced-by` | an idea adopted without lineage | `imperative` → `functional` |
| `shares-ancestor-with` | siblings from a common root | `object-oriented` ↔ `imperative` |
| `interoperates-with` | paradigms that combine in practice | `functional` ↔ `imperative` |

Names resolve against paradigm **keys** or **display names**; prefer the key.
The lint warns (not errors) when an edge points at a paradigm with no page.

## Serialization

Identical to the language contract: canonical field order (schema order;
`lint --fix` rewrites), scalars in double quotes except `year` (unquoted),
empty arrays omitted, 2-space list indentation, `references` as
`- url:` / `- title:` pairs, `relations` as `- name:` / `- kind:` pairs.

**Line endings: LF.** The body lint matches headings with `^## (.+)$`; a
CR before the newline breaks the match and produces false "missing required
section" errors on every curated file. If a tool writes CRLF, normalize the
file before linting.
