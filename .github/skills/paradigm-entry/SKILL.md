---
name: paradigm-entry
description: 'Create or update a programming-paradigm entry (pl-wiki). Use when: the user asks to research/add/update a paradigm page, fill facts or prose for content/paradigms/*.md, or check a paradigm entry against the site contracts. Encodes the paradigm fact contract, the four-section prose spec, a bounded primary-source research procedure, and validation gates.'
argument-hint: '[paradigm key or name, e.g. "object-oriented" or "update functional"]'
---

# Paradigm Entry Authoring (pl-wiki)

Produce or revise a single `content/paradigms/<key>.md` entry that
(1) passes both lint gates, (2) follows the fixed prose skeleton, and
(3) contains only researchable, sourced facts.

This skill is the sibling of [`language-entry`](../language-entry/SKILL.md).
It shares the prose skeleton, the evidence rules, and the validation gates —
but the *fact contract* differs, and so does the research method. Read the
differences below; do not assume the language workflow applies unchanged.

## The paradigm contract in one paragraph

A paradigm entry is **not** a language entry. A paradigm has no typing
discipline, no memory model, no compiler — those belong to the languages
that adopt it. What a paradigm entry records is: what the paradigm *is*,
which defining characteristics it has, where it came from, and how it
relates to other paradigms. **Member languages are never stored** — they are
derived at build time from the languages collection, so a member list can
never go stale. Do not hand-write a member list into the frontmatter or the
prose as a table; link to the derived view instead.

### Frontmatter field table

| field | type | rules |
| --- | --- | --- |
| `title` | string | mirrors `name` (native SEO field) |
| `name` | string | **required**; ASCII-only; unique within the paradigms collection |
| `homepage` | string | the paradigm's canonical home (a canonical paper, a standards-body page, or a language's official page that *defines* it) |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory** — ≥ 1 per curated entry; primary sources only |
| `logo` | string | optional; `/images/paradigms/<file>` under `public/` |
| `author` | string | the originator(s) of the paradigm, verbatim (e.g. "Yoshinori Ito (i. e.)") |
| `paradigm` | string | **required**; MUST equal the file name (the join key) |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | the paradigm's origin year (first publication/appearance); unquoted |
| `features` | string[] | the **defining characteristics** of the paradigm — free-form, lowercase-kebab |
| `relations` | `{name, kind}[]` | edges to OTHER paradigms; `name` = paradigm key or display name |
| `note` | string | ≤ 40 words; rendered on cards + fact sheet |

**The `paradigm` field is the join key.** The file name IS the taxonomy key:
`content/paradigms/object-oriented.md` has `paradigm: "object-oriented"`, and
language entries carry `paradigms: ["object-oriented"]`. Both sides use the
same vocabulary value from `PARADIGMS` in `app/utils/taxonomy.ts`. Changing
one side without the other breaks the join — the lint catches it.

### `features` is where a paradigm earns its keep

For a language, `features` is a long tail of nice-to-haves. For a paradigm,
`features` IS the definition: the mechanisms that make this paradigm *this*
paradigm rather than a neighbouring one. Write them as the named
characteristics the field's literature uses, each a short noun phrase:

- functional → `first-class-functions`, `immutable-data`, `expression-oriented`,
  `recursion`
- object-oriented → `encapsulation`, `inheritance`, `polymorphism`, `message-passing`
- logic → `unification`, `backtracking`, `horn-clauses`, `non-backtracking-search`

Do not restate the paradigm's own name as a feature (`functional` is not a
feature of the functional paradigm). Do not list properties the paradigm
merely permits — a paradigm *defines* its mechanisms.

### `relations` between paradigms

Use the same `RELATION_KINDS` vocabulary as languages. For paradigms the
useful kinds are:

| kind | between paradigms | example |
| --- | --- | --- |
| `derived-from` | a paradigm developed from another | `effect` → `functional` |
| `influenced-by` | an idea adopted without lineage | `imperative` → `functional` |
| `shares-ancestor-with` | siblings from a common root | `object-oriented` ↔ `imperative` |
| `supersedes` | a paradigm that replaced another | `structured` → `goto` (not in vocabulary — omit) |
| `interoperates-with` | paradigms that combine | `functional` ↔ `imperative` |

Relation names resolve against paradigm keys OR display names. Prefer the
**key** (`object-oriented`) — it is stable.

## Inputs to read first (cheap, load on demand)

- [Contract reference](./references/contract.md) — the paradigm-specific field
  table, prose skeleton, and what differs from language entries.
- [Vocabularies](../../../app/utils/taxonomy.ts) — `PARADIGMS`, `RELATION_KINDS`,
  `STATUSES`. Read when you need a value not already in your context: never
  guess one.
- [Examples](./references/exemplars.md) — pointers to conforming entries.
- The **language entry** for a paradigm's canonical example
  (`content/languages/<slug>.md`) — its prose often already states the
  paradigm's defining traits, and it is a primary source you may cite.

## Procedure

### 1. Scope the request

- **Confirm the key.** The key is a `PARADIGMS` vocabulary value in
  `app/utils/taxonomy.ts`; the file name must equal it. If the user names a
  paradigm that is *not* in the vocabulary, that is a schema decision, not a
  content one: propose the vocabulary addition and let the owner decide
  (see Anti-patterns).
- **Read the existing page** if there is one. Stubs are the expected starting
  state — `scripts/scaffold-paradigms.mjs` creates one per vocabulary value
  and never overwrites a curated page. Layer your work on top.
- **Check the member languages.** Run the scan below to see which languages
  already claim this paradigm. That tells you what the corpus believes, and
  where the *derived* member list will point.

  ```sh
  node scripts/scaffold-paradigms.mjs --members functional
  ```

  Member languages are derived from `content/languages/*.md` `paradigms:`
  values — they are the corpus's claim, not an independently verified fact.
  Use them as **leads for research**, not as citations.

### 2. Research (bounded — one paradigm at a time)

A paradigm is a *concept*, and concepts have canonical primary sources: the
paper that introduced it, the language manual or design document that
defined it, the standards-body document that standardized it. Unlike a
language, a paradigm usually has **one** canonical source, not a scatter of
vendor docs.

**The bounded procedure (this is the part that matters):**

1. **One concept, one source cluster.** Identify the paradigm's origin
   before searching: the paper that coined it, the language that
   popularized it, the author who defined it.
2. **Search ≤ 3 queries.** Use `search.brave.com` through the browser tools
   (no API key, no MCP server):
   `open_browser_page` → `https://search.brave.com/search?q=<query>` →
   `read_page` the results snapshot.
   Query shape: `"<paradigm>" <origin term>` (e.g. `"object-oriented"
   programming "Simula 67"`, `"functional programming" "Lisp"`).
3. **Fetch ≤ 4 pages.** Prefer, in order:
   - the canonical paper (ACM DL, the author's own page, an archive copy) —
     `web.archive.org` is allowed and often is the only accessible copy;
   - the official language manual / design document that defines it
     (the SICP chapter for object-oriented and functional; the original
     Smalltalk-80 book; the Eiffel thesis; the ML "Function Description";
     the SQL standard for relational);
   - a standards-body or vendor page that states the paradigm's definition.
4. **Stop.** If the sources do not settle a field, **omit that field**.
   A hole is honest; a wrong chip poisons every downstream view.
5. **Wikipedia is a guide, never a citation.** Use it to *find* the
   canonical paper or manual, then cite that. The lint errors on
   `wikipedia.org`, `wikimedia.org`, `wikibooks.org`, `wikidata.org`.

**Do not fan out.** If you need many sources for one paradigm, you are
looking at the wrong granularity: split the work into separate
paradigm-entry tasks rather than researching one paradigm as a research
project. One paradigm per invocation, one closing summary per invocation.

**Never cite a language entry as the source for a paradigm's definition.**
The language entry is a *peer* statement about the paradigm; cite the
primary paper or manual the paradigm is defined in. A language entry may be
cited for a claim *about that language's* use of the paradigm (e.g. "Pi is
described as post-paradigmatic except for pattern-oriented programming" →
cite `content/languages/pi.md`'s own cited source, not the language entry).

### 3. Write the entry

Frontmatter: canonical field order (the lint `--fix` reorders anyway, but
write it canonically); `title` mirrors `name`; scalars quoted except `year`;
arrays 2-space-indented quoted items; `relations` edges use the
`- name:` / `- kind:` (indented) form.

Body: the four-section skeleton — Overview (≤ 60 words, 2 sentences), Code
(required: the paradigm's *worked demonstration* — see below), Distinctive
traits (3–6 bullets, each claim + consequence), Status (≤ 40 words).
Cross-paradigm mentions link internally: `[Object-oriented](/paradigms/object-oriented)`.
Cross-language mentions link internally: `[Smalltalk](/languages/smalltalk)`
— but only for languages that exist in the corpus.

#### The paradigm "code tour"

A paradigm is not a language, so the tour shows **the paradigm's defining
mechanism applied to a concrete problem** — not a syntax demo of some
language. The slot tags stay the same (they are a wiki-wide convention),
but their content shifts:

| slot | for a language | for a paradigm |
| --- | --- | --- |
| `primitives` | atomic values | the paradigm's basic unit of composition (a closure, a message, a clause, a node) |
| `combinations` | data structures | how the unit composes (a call chain, a clause set, a network) |
| `abstractions` | the definable unit (function/class) | the paradigm's central abstraction (a lambda, an object, a process, a relation) |
| `idioms` | a community pattern | the paradigm's characteristic style (recursion, message dispatch, backtracking, piping) |

The same code contracts apply: 1–4 fenced blocks, 4–20 lines each, ≤ 45 tour
lines total, PLURAL slot tags in `::code-group` tab labels (or a
`Caption: <tag>:` line for a lone block), and a concluding caption stating
what to notice.

**Choose the language for the demonstration from the corpus.** Prefer a
language whose own entry is already curated and whose paradigms field
includes this one — its prose and code are already vetted. Use the
paradigm's *canonical* language where the corpus has it (Smalltalk for
object-oriented, Lisp for functional, Prolog for logic, Erlang for
actors/message-passing, SQL for relational). If the corpus lacks a language
you believe is essential, **say so in your summary** — do not fabricate a
language entry to host the example, and do not write an example in a
language the corpus does not contain (an uncitable, unlinked sample).

If the paradigm has no code at all (e.g. a purely conceptual paradigm such as
`declarative` or `specification`), demonstrate it in the **language of the
domain**: a specification, a transition table, a query, a circuit, a
diagram. The tour shows the paradigm's *shape*, not a program's text.

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
- the sources used, one line per source family (canonical paper, manual,
  standards document) with the URL,
- every field you deliberately left blank and why,
- lint results (both gates),
- anything flagged for human review (uncertain demonstration language,
  contested origin year, marketing language).

## Anti-patterns

- **Writing a member list.** The paradigm's member languages are derived at
  build time. Never hand-write "Languages: A, B, C" into the frontmatter or
  the prose. The derived view on the page is the member list.
- **Writing a language entry in disguise.** A paradigm has no `typing`, no
  `memory`, no `execution`, no `concurrency`, no `kind`, no `author` beyond
  the originator, no `logo` unless one exists. If you find yourself wanting
  `typing: static`, you are writing a language entry.
- **Citing Wikipedia.** It is a research *guide*; the citation must point at
  the primary source it led you to. The lint errors on aggregator hosts.
- **Citing a language entry as the paradigm's definition.** Cite the paper
  or manual that defines the paradigm.
- **Restating the paradigm name as a feature.** `functional` is not a
  feature of the functional paradigm.
- **Researching one paradigm as a project.** Bounded procedure: ≤ 3 queries,
  ≤ 4 fetches, then write or omit. Split large paradigms into separate
  tasks rather than fanning out.
- **Fabricating a demonstration.** A wrong example is worse than none. If
  the corpus has no suitable language, demonstrate the paradigm's shape in
  its domain language and say so in the caption.
- **Inventing an origin year.** `year` is the paradigm's origin — the
  publication or appearance that defined it. If sources disagree or are
  absent, omit the field.
- **Adding vocabulary values to `taxonomy.ts` without asking.** Adding a
  paradigm to `PARADIGMS` is a schema decision the owner makes (one line +
  corpus re-lint + a stub page).
- **Overwriting a curated paradigm page.** `scripts/scaffold-paradigms.mjs`
  never overwrites; neither should you, without reading the file first.

## Batch mode

When asked to do several paradigms, do them **one at a time** — one
research pass, one lint gate run, one closing summary each — rather than
fanning out into parallel research. The per-paradigm cost is small and the
quality is materially better because the source cluster stays bounded and
the closing summaries are actionable. If the user explicitly wants them in
one response, still research them sequentially and report per-paradigm
deltas in a single closing table.
