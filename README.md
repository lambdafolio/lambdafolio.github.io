# LambdaFolio

A programming-language atlas: normalized facts, influences, and paradigms.

Built with [Nuxt 4](https://nuxt.com), [Nuxt UI](https://ui.nuxt.com) and
[Nuxt Content](https://content.nuxt.com). Deployed as a static site on GitHub
Pages: <https://lambdafolio.github.io/> (repository
[`lambdafolio/lambdafolio.github.io`](https://github.com/lambdafolio/lambdafolio.github.io)).

## Development

Requires **Node.js 26+** (enforced via `"engines"` in `package.json`).

> `vue-tsc` is pinned to exactly `3.3.13`. Version `3.3.14` changed how template
> code is generated ("isolate template virtual code from setup control flow")
> and lost `v-if` narrowing in templates, which makes `nuxi typecheck` report
> ~20 spurious `TS18049: … is possibly 'null' or 'undefined'` errors across the
> four `[slug].vue` pages. See vuejs/language-tools#6321 (the change that
> introduced it) and #6332. Unpin when a release fixes it.

### Dev container (recommended)

The repository ships a [dev container](https://containers.dev) configuration
(`.devcontainer/`, modeled on the one in [final-hill/cathedral](https://github.com/final-hill/cathedral/tree/master/.devcontainer)):
Node 26 + dependencies preinstalled, non-root `node` user, `gh` CLI feature,
and the recommended VS Code extensions. Docker initializes the container from
the image's `node_modules` (kept in a named volume, isolated from the host
bind mount).

1. Start Docker Desktop.
2. Open the project in VS Code and **Reopen in Container** when prompted.
3. `npm run dev` inside the container, then open
   <http://127.0.0.1:3000/>.

### Local (no container)

```sh
npm install
npm run dev
```

Then open <http://127.0.0.1:3000/> (on Windows, prefer `127.0.0.1`
over `localhost` for dev-server performance).

While the dev server is running, the [Nuxt Studio](https://nuxt.studio)
floating button (bottom left) offers a visual editor for `content/languages/*`
pages — frontmatter forms are generated from the collection schema in
`content.config.ts`.

## Editing language pages

One page per language lives in `content/languages/<slug>.md`. The frontmatter
is a fixed, normalized fact contract validated at build time by the Zod schema
in `content.config.ts` (facts are schema; prose is commentary — the page body
is optional curated prose and never a data carrier):

| field | type | |
| --- | --- | --- |
| `name` | string | required |
| `title` | string | native SEO field; mirrors `name` |
| `homepage` | string | optional |
| `urls` | string[] | optional; external articles/references |
| `logo` | string | optional; path under `public/logos/` |
| `author` | string | optional |
| `kind` | enum | optional; `language` \| `family` \| `dialect` \| `notation` |
| `status` | enum | optional; `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | optional; first appeared |
| `paradigms` | vocabulary string[] | optional; see `app/utils/taxonomy.ts` |
| `typing` | enum | optional; `untyped` \| `dynamic` \| `static` \| `gradual` |
| `type_system` | vocabulary string[] | e.g. `inferred`, `effect-system`, `dependent` |
| `memory` | vocabulary string[] | e.g. `gc`, `arc`, `ownership`, `arena` |
| `execution` | vocabulary string[] | e.g. `native`, `bytecode`, `jit`, `transpiled` |
| `concurrency` | vocabulary string[] | e.g. `actors`, `channels`, `async/await` |
| `features` | string[] | optional; free-form long tail |
| `influences` / `influenced` | string[] | optional; render as internal wiki links |
| `note` | string | optional; short summary shown on the page |

Vocabulary axes are linted (and `--fix` normalized) against the controlled
vocabularies in `app/utils/taxonomy.ts` — the single source of truth shared by
the schema docs, the lint, and the future faceted UI:

```sh
npm run lint:frontmatter           # check
npm run lint:frontmatter -- --fix  # normalize case/synonym variants + field order
```

Below the frontmatter is optional curated prose. When present, it follows a
fixed four-section skeleton — `Overview` (≤ 60 words) → `Code` (1–4 fenced,
idiomatic examples, 4–20 lines each, ≤ 45 tour lines, shown as a Nuxt UI
`::code-group` with one tab per mechanism slot after SICP's means-of-* order;
the concluding caption is a `::note` callout placed after the group) →
`Distinctive traits` (3–6
bullets) → `Status` (≤ 40 words), with `History` optional (≤ 80 words).
A frontmatter-only page is a valid terminal state (a data row).
`content/languages/esterel.md` is the conforming exemplar.

Both layers are enforced by lint gates:

```sh
npm run lint:frontmatter           # fact contract + vocabularies
npm run lint:body                  # prose skeleton + caps + link integrity
npm run lint:markdown              # markdownlint-cli2 (Markdown style)
npm run lint:frontmatter -- --fix  # normalize frontmatter (canonical order)
npm run check:filters              # filter algebra assertions
npm run scaffold:paradigms         # create missing paradigm stubs
npm run scaffold:features          # create missing feature stubs
npm run scaffold:features -- --candidates   # recompute the promotion tier
```

Prose is the *reading layer* over the schema, so it links rather than
asserts: every mechanism the code tour demonstrates links to the
documentation section that defines it, and every attributed claim links to
its source (`content/languages/daedalus.md` is the exemplar). Sibling
languages and adopted paradigms link internally (`/languages/<slug>`,
`/paradigms/<key>`). `lint:body` errors on a dead internal cross-link and on
a body link to an aggregator (Wikipedia et al. — same primary-source rule as
`references`), and warns when a curated entry's prose has no link at all
(the pre-2026 backlog is grandfathered).

Declared features are also checked against the prose: an entry that claims a
`feature` its article never shows gets a warning (the "never overlook a core
feature" rule, made checkable). Features have two tiers — free-form tags on
the entry, plus a small **promoted** subset with its own page in
`content/features/` (≥ 3 languages must declare it) whose member list is
derived, never stored. `content/features/` and `content/paradigms/` follow
the same join-key contract.

Authoring new or updated entries is encoded as an agent skill:
[`.github/skills/language-entry/`](.github/skills/language-entry/) — prompt
the agent with a language name to research, create, or update an entry and
it follows the same contract, evidence rules, and validation gates. The same
skill also tells the agent what to do when research *surfaces* an unrelated
language: log a placeholder row (`title` + `name` + the exact `TODO:` seed
body, homepage only if already in hand) and move on — the stub is a lead for
a later curation batch, never a second research thread.

The full data architecture (schema v2, taxonomy layer, target routes) lives in
[docs/knowledgebase-plan.md](docs/knowledgebase-plan.md).

Slugs are derived deterministically from `name` (lowercase, `+`→`plus`,
`&`→`and`, Greek letters transliterated, remaining punctuation → `-`;
e.g. `C++` → `cplusplus`, `F#` → `fsharp`, `π` → `pi`).

## Editing paradigm pages

Paradigms are the **sibling concept** to languages: one page per paradigm in
`content/paradigms/<key>.md`, where the file name *is* the taxonomy key and
the `paradigm` frontmatter field repeats it. That key is the join with the
languages collection — a language lists its paradigms by the same vocabulary
value from `app/utils/taxonomy.ts`, so the two collections join exactly
without a mapping table.

```sh
node scripts/scaffold-paradigms.mjs                 # create missing stub pages
node scripts/scaffold-paradigms.mjs --members functional   # derived member list
```

The scaffold is idempotent and never overwrites an existing page. A stub is a
valid terminal state (like a language stub): it carries the identity fields
and renders as a data row with its derived member list.

A paradigm entry is **not** a language entry — it has no `typing`, no
`memory`, no `execution`, no `kind`. What it records is the paradigm's
definition (`features`), its origin (`year`, `author`), and its edges to
other paradigms (`relations`).

**Member languages are derived, never stored.** The list is computed at
build time from the languages collection, so it can never go stale; there is
deliberately no `members` field in the schema.

Authoring paradigm pages is encoded as its own agent skill:
[`.github/skills/paradigm-entry/`](.github/skills/paradigm-entry/) — prompt
it with a paradigm key (`object-oriented`) to research and curate one entry.
It encodes a **bounded** research procedure (≤ 3 searches, ≤ 4 fetches, one
paradigm per invocation) so each entry's source cluster stays small and
citable.

## Editing feature pages

Features are the third collection, one level more concrete than paradigms: a
feature is a *mechanism* a language provides (closures, pattern matching,
prototypes, regular expressions). They follow the same join-key contract as
paradigms — `content/features/<key>.md`, the `feature` field repeats the file
name, and member languages are derived from the languages collection.

The important difference is that **not every feature gets a page**. A
language's `features` array is a free-form tag list for the filter sidebar;
the collection only holds the *promoted* subset from `FEATURES`
(`app/utils/taxonomy.ts`). Promotion threshold: **≥ 3 language entries**
declare the feature, so a page always has several members to compare.

```sh
node scripts/scaffold-features.mjs --candidates   # recompute the tier from the corpus
node scripts/scaffold-features.mjs                # create missing stub pages
node scripts/scaffold-features.mjs --members regex  # derived member list
```

Promotion is a two-step data change: add the key to `FEATURES` and its display
name to `DISPLAY_NAMES` in the scaffold script, then re-run. Keys are
lowercase kebab because the key becomes a route segment; the lint enforces
that, and errors when a `FEATURES` value has no page.

**The witness rule.** A declared feature should be *shown*, not just
claimed: every value in an entry's `features` array must appear somewhere in
its prose (the code tour, a trait, or the callout). `lint:body` warns on the
ones that don't, which turns "never overlook a core feature" from a policy
into a check — and gives the curator a choice: show the mechanism, or drop
the tag.

Authoring feature pages has its own agent skill:
[`.github/skills/feature-entry/`](.github/skills/feature-entry/) — prompt it
with a promoted key (`closures`) to research and curate one page. It encodes
the promotion threshold, the ">= 3 members" rule, and the comparison-shaped
code tour (two or three member languages, not one language with four tabs).

## Research index (`/`)

The index filters the corpus by its fact profile. Two combinators decide what
"a match" means, and they are independent:

| control | URL | meaning |
| --- | --- | --- |
| Combine categories | `?m=all` \| `?m=any` | every category I picked must match, or one is enough |
| Combine values within a category | `?w=all` \| `?w=any` | a language needs every value I picked there, or any one |
| Per-category override | `?ov=paradigms:any` | one category follows a different rule than the rest |

Together they answer the research questions: `w=all&m=all` is the intersection
of every selected fact, `w=any&m=any` is their union, and an override expresses
the mixed case ("functional **or** imperative, **and** statically typed").

Selection state lives in the URL, so any result set is shareable:

```text
/?f=paradigms:functional,imperative;typing:static&w=all&m=all
```

`?f=` keeps its original meaning, so links that predate the combinators still
resolve. Search is Fuse.js over the name, the note, and the facet values, so
"gc functional" matches rows whose note is empty. The filter algebra lives in
`app/utils/filters.ts` and is covered by `npm run check:filters`.

## Data conversions

The initial corpus was generated from the legacy `_data/languages.yml` by:

```sh
node scripts/convert-languages.mjs --check   # dry run (reports slug collisions)
node scripts/convert-languages.mjs           # writes content/languages/*.md
```

## Production build

```sh
npm run generate     # static output in .output/public
```

Deployment: the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy.yml`)
builds and deploys on pushes to `master`. The repository's Pages source must be
set to **GitHub Actions**.

`master` is protected: changes must land through a pull request. The ruleset
requires no approving review (an organization with a single member cannot
self-approve) and has no bypass actors, so `git push` to `master` is rejected
even for the owner:

```sh
git checkout -b my-change
git commit -am "…"
git push -u origin my-change
gh pr create --fill && gh pr merge --squash --delete-branch
```

## Project structure

```text
app/                  Nuxt app (pages, layouts, components, css)
content/languages/    one Markdown page per language (source of truth)
content/paradigms/    one Markdown page per paradigm (source of truth)
content.config.ts     languages + paradigms collections: schema-locked contracts
nuxt.config.ts        modules, site URL, feed config
public/               static assets (logos, icons, web manifest)
server/plugins/       feed generation hook
scripts/              migration + maintenance scripts
docs/                 migration plan and notes
.devcontainer/        dev container (Node 26, VS Code extensions, gh CLI)
.github/              Pages deploy workflow, agent skills
```
