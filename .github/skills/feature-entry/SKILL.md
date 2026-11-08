---
name: feature-entry
description: 'Create or update a promoted-feature entry (lambdafolio). Use when: the user asks to research/add/update a feature page, fill facts or prose for content/features/*.md, promote a feature tag to its own page, or check a feature entry against the site contracts.'
argument-hint: '[feature key, e.g. "closures" or "promote pattern-matching"]'
---

# Feature Entry Authoring (lambdafolio)

Produce or revise a single `content/features/<key>.md` entry that
(1) passes both lint gates, (2) follows the fixed prose skeleton, and
(3) contains only researchable, sourced facts.

This skill is the third sibling in the concept family, after
[`language-entry`](../language-entry/SKILL.md) and
[`paradigm-entry`](../paradigm-entry/SKILL.md). It shares the prose
skeleton, evidence rules, hyperlink rules, and validation gates. What differs
is **which features exist at all** — that is a corpus decision, not an
authoring decision — and what the page is *for*.

## Read this first: the two-tier rule

`features` on a language entry is a **free-form tag list**. It is tier 1: a
long tail for cards, facet chips and search. Most of those strings never get
a page and never should — a page per tag would yield mostly pages about a
single language.

Tier 2 is the **promoted** subset in `FEATURES`
(`app/utils/taxonomy.ts`), one page each in `content/features/`. Promotion
threshold: **≥ 3 language entries declare the feature**
(`FEATURE_PROMOTION_THRESHOLD`). Recompute the tier from the corpus before
proposing a promotion:

```sh
node scripts/scaffold-features.mjs --candidates
```

If the feature does not clear the threshold, the answer is "not yet" — it
stays a tag. Do not create a page for it, and do not add it to `FEATURES`
without the owner's approval: promotion is a schema decision (one line + a
stub + a corpus re-lint), exactly like adding a `PARADIGMS` value.

## The feature contract in one paragraph

A feature page answers three questions about a *mechanism*: what it is, what
it looks like in code, and where it shows up. It is not a language entry — a
feature has no `typing`, no `memory`, no `execution`, no `kind`, no
`author`. It is not a paradigm either: a paradigm is a style of programming,
a feature is a concrete construct. **Members are never stored** — the page
derives its member list from the languages collection at build time, so it
can never go stale. Do not hand-write a member list into the frontmatter or
as a prose table; link to the derived view.

### Frontmatter field table

| field | type | rules |
| --- | --- | --- |
| `title` | string | mirrors `name` |
| `name` | string | **required**; ASCII-only; unique within the collection; the *display* form ("Regular expressions") |
| `feature` | string | **required**; MUST equal the file name (the join key, lowercase kebab) |
| `homepage` | string | the mechanism's canonical page (the spec section, the language reference that defines it) |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory** — ≥ 1 per curated entry; primary sources only |
| `logo` | string | optional; almost always absent for a mechanism |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` — of the *mechanism*, not a language |
| `year` | number | when the mechanism first appeared; unquoted; omit if sources disagree |
| `relates_to` | string[] | sibling features it is usually combined with (keys) |
| `note` | string | ≤ 40 words; rendered on cards |

The key is a route segment, so it must be lowercase kebab and ASCII —
the lint errors otherwise. `regex` is the key; "Regular expressions" is the
display name.

## Procedure

### 1. Scope the request

- **Confirm the key is promoted.** Check `FEATURES` in
  `app/utils/taxonomy.ts` and `content/features/<key>.md`. If the key is not
  promoted, this is a promotion request, not an authoring request — run
  `--candidates`, show the count, and ask before adding it.
- **Read the existing page.** Stubs are the expected state
  (`scripts/scaffold-features.mjs` creates one per promoted key and never
  overwrites). Layer your work on top.
- **Read the members.** `node scripts/scaffold-features.mjs --members <key>`
  lists the languages that declare the tag. They are leads, not citations:
  the corpus's claim about who has the feature.

### 2. Research (bounded)

A feature needs the *same* kind of source as a paradigm, but narrower: the
page defining the mechanism in its canonical home.

1. **Identify the defining source** — the language reference section that
   specifies it (the ECMA-262 clause for closures, the SML definition for
   pattern matching, the POSIX/regex spec for regular expressions), or the
   paper that introduced it.
2. **Search ≤ 3 queries**, fetch ≤ 4 pages, using the Brave Search MCP
   server (`mcp_brave_search__brave_web_search`) — same method as the other
   two skills. Use `fetch_webpage` on the URLs it returns to read the
   defining page.
3. **Cite the members too** when the page makes a claim about a specific
   language's version of the mechanism — the language entry's own source.
4. **Stop and omit** what the sources don't settle. Wikipedia guides, never
   cites.
5. **Do not fan out across members.** One page explains one mechanism; the
   per-language details belong in the language entries, which the derived
   member list already links to.

### 3. Write the entry

Frontmatter: canonical order (`title, name, homepage, urls, references,
logo, feature, status, year, relates_to, note`); `year` unquoted.

Body: the four-section skeleton (Overview ≤ 60 words → Code → Distinctive
traits 3–6 bullets → Status ≤ 40 words; History optional ≤ 80).

**The code tour for a feature** — this is where the slot meanings shift
again. A feature is portable: the interesting thing is how the *same*
mechanism appears in different languages. Use the same four slots and the
same `::code-group` shape, but pick the languages from the derived member
list:

| slot | for a feature |
| --- | --- |
| `primitives` | the mechanism's basic form — the smallest thing that is the feature |
| `combinations` | how it composes with data or other mechanisms |
| `abstractions` | the defining construct that makes it a mechanism (the closure value, the match arm, the prototype chain) |
| `idioms` | a characteristic use the member languages are known for |

Prefer **two or three member languages** in the tour over one language with
four tabs: the comparison is the content. Stay true to each language's
documented syntax — a wrong example is the worst failure in this repo — and
say "paraphrased" in the callout when you reconstructed it.

Same constraints: 1–4 blocks, 4–20 lines each, ≤ 45 tour lines, plural slot
tags in tab labels, concluding `::note` **outside** the group.

**Hyperlink** (owner rule, inherited): the mechanism to the reference
section that defines it, each language in the tour to its entry
(`/languages/<slug>`), the related features internally
(`/features/pattern-matching`), and any attributed claim to its source. No
aggregator links.

### 4. Validate (gates — all must pass)

```sh
node scripts/lint-frontmatter.mjs          # fact contract + vocabularies
node scripts/lint-body.mjs                 # prose skeleton + caps + links
npm run lint:markdown                      # markdownlint-cli2 style rules
npx nuxi typecheck                         # only if you touched app/ code
npm run generate                           # only if serving; catches Zod violations
```

Note that `lint-body` also runs the **witness rule** against language
entries: promoting a feature does not change it, but if your research shows
a member language's entry claims the tag without showing it, mention that in
the summary — it is a language-entry fix, not a feature-page one.

### 5. Closing summary (always)

- the fields written and the fields deliberately left blank, with reasons,
- the defining source(s) with URLs, and one line per member-language claim,
- which member languages the tour demonstrates and why those,
- lint results (both gates),
- the hyperlink audit (what links where, anything unverifiable),
- anything flagged for human review.

## Anti-patterns

- **Promoting on taste.** A feature earns a page at ≥ 3 corpus members.
  Check `--candidates`; ask before changing `FEATURES`.
- **Writing a member list.** It is derived. Never a `members` field, never
  a prose table of languages.
- **Writing a language entry in disguise.** No `typing`, no `memory`, no
  `platform`, no `author`, no `kind`.
- **Writing a paradigm entry in disguise.** A paradigm is a style; a feature
  is a construct you can point at in code. If the page cannot show the
  construct, it is probably a paradigm.
- **One language, four tabs.** A feature page's value is comparison across
  members — show two or three.
- **Duplicating the language entry.** Per-language detail, history and
  quirks belong in `content/languages/`; link there instead.
- **Citing Wikipedia or an aggregator.** Lint errors on it, in the body and
  in `references`.
- **Fabricating a demonstration.** A wrong example is worse than none.
