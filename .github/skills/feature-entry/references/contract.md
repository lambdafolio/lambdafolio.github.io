# Contract Reference (feature entries)

> Normative for `content/features/*.md`. Schema source: `content.config.ts`
> (§features). Vocabulary source: `app/utils/taxonomy.ts` (`FEATURES`,
> `FEATURE_PROMOTION_THRESHOLD`). Enforced by:
> `scripts/lint-frontmatter.mjs` + `scripts/lint-body.mjs` +
> `markdownlint-cli2` (`.markdownlint-cli2.jsonc`).

## Why this collection is small

`features` on a language entry is a free-form tag list — the long tail that
feeds cards, facets and search. Measured over the corpus at the time of
writing: 85 distinct tags across 21 entries, **74 of them used exactly once**.
A page per tag would be 85 pages, most of them about one language.

So the collection holds only the **promoted** subset:

| tier | lives in | contract |
| --- | --- | --- |
| 1 — tags | `features:` on a language entry | free-form, uncapped, unlinted; rendered as filter chips |
| 2 — promoted | `content/features/<key>.md` | key is a `FEATURES` value, lowercase kebab, with a page |

**Promotion threshold:** ≥ `FEATURE_PROMOTION_THRESHOLD` (3) language
entries declare the feature. `node scripts/scaffold-features.mjs
--candidates` recomputes this from the corpus; promotion is a schema
decision the owner makes.

## Frontmatter field table

| field | type | rules |
| --- | --- | --- |
| `title` | string | mirrors `name` |
| `name` | string | **required**; ASCII-only; unique within the collection; display form ("Pattern matching") |
| `feature` | string | **required**; MUST equal the file name — the join key with the languages collection's `features` tags |
| `homepage` | string | the mechanism's canonical page (spec/reference section) |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory** for curated pages; primary sources only (same rule as languages) |
| `logo` | string | optional; rare for a mechanism |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` — of the mechanism |
| `year` | number | first appearance of the mechanism; unquoted; omit when sources disagree |
| `relates_to` | string[] | sibling feature keys it usually combines with |
| `note` | string | ≤ 40 words |

Serialization follows the language contract exactly (`year` unquoted,
2-space list indentation, `references` as a `- url:` line plus an indented
`title:` line).

## Prose skeleton (normative order)

Identical to the other two collections — Overview ≤ 60 words, Code (the
tour), Distinctive traits 3–6 bullets ≤ 25 words, Status ≤ 40 words,
History optional ≤ 80.

### Rules specific to features

- **Members are derived, never stored.** No `members` field, no prose table
  of languages — the page computes its list from the languages collection.
- **The tour compares.** Use two or three member languages across the four
  slots rather than one language with four tabs; the page's value is the
  same mechanism seen more than once.
- **Per-language detail belongs in the language entry.** Link there
  (`/languages/<slug>`) instead of restating it.
- **Hyperlink** the mechanism to its defining reference section, members to
  their entries, related features internally (`/features/<key>`). Aggregator
  links (Wikipedia et al.) are errors in body and in `references`.
- **No `typing` / `memory` / `execution` / `concurrency` / `kind` / `author`.**
  Those belong to languages.

## Join integrity (lint-enforced)

- A file whose key is not in `FEATURES` is an **error** (an unpromoted tag
  is not a page).
- A `FEATURES` value with no page is an **error** — run
  `scripts/scaffold-features.mjs`.
- `feature` not equal to the file name is an **error** (the join key).
- A key that is not lowercase kebab / ASCII is an **error** (it is a route
  segment).
- A language entry declaring a promoted key that has no page is a
  **warning**.
- A declared feature never witnessed in that language entry's prose is a
  **warning** (`lint-body`).

## Worked example (stub → curated)

A stub is a valid terminal state:

```md
---
title: "Closures"
name: "Closures"
feature: "closures"
---
TODO: Write the wiki article for **Closures**.
```

Curating replaces the TODO body with the four-section skeleton. The
frontmatter needs `references` added at the same time (the lint requires it
once the body is prose):

```md
---
title: "Closures"
name: "Closures"
feature: "closures"
homepage: "https://262.ecma-international.org/..."
references:
  - url: "https://262.ecma-international.org/..."
    title: "ECMA-262 — lexical environment records"
---
```

Everything else about the path (`/features/closures`), the derived member
list, and the sidebar chips follows automatically.
