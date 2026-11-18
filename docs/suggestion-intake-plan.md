# Suggestion Intake & Automated Backfill Plan

> Status: **proposal**, awaiting owner sign-off on the open decisions in §16.
> Companion to `docs/knowledgebase-plan.md` (data architecture) and
> `.github/skills/language-entry/SKILL.md` (per-entry authoring contract).
>
> Decisions taken before this draft (2026-11-11):
>
> - Repository stays **public** — labels are not the trust boundary; bot-authored
>   snapshot comments are.
> - **No Azure.** No Function, no resource group, no anonymous submission endpoint.
> - Research model: **`deepseek-v4.1-flash:cloud`** via Ollama Cloud, same as the
>   interactive sessions.
> - Secrets: **dotenvx encrypted `.env.<env>`** files, following
>   `final-hill/cathedral`.
> - Two tracks: crowd-sourced automation (track 1) and local exceptional
>   curation (track 2).

## 1. The problem, stated precisely

The corpus is 455 rows. At 30 minutes per entry that is ~5,000 hours for even
the 4,600 known languages, and the 30 minutes are mostly **verification and
review**, not latency. Parallelism does not shrink that; only removing the
human from the loop per entry would, and that is exactly what this plan refuses
to do.

What it does instead is remove the human from everything the human is not
needed for. The work splits along **what a review can actually catch**:

| unit | size (measured) | review burden |
| --- | --- | --- |
| identity row (`name`, `homepage`) | 4,154 net-new candidates | none — HTTP 200 decides |
| frontmatter fact fields | ~4,105 missing slots across 387 stubs | skim — quote-in-source + vocabulary decides |
| code tour + prose | 455 rows today, + drafts | **real** — a human must read it |

Prose and tours *are* drafted by a model today; that is the existing workflow.
The change is that the draft arrives as a PR against a batch rather than in a
session against one entry — more entries reviewed per sitting, same gate.

Automation owns the first two rows. Track 2 owns the third.

## 2. What the corpus is today (measured 2026-11-11)

```text
content/languages/*.md          455
  of which TODO stubs           387
  of which prose-bearing         68
kind declared                    68   (language 59, notation 5, standard 2, dialect 2)
```

Field coverage across all 455 rows:

| field | declared | | field | declared |
| --- | --- | --- | --- | --- |
| `homepage` | 232 | | `family` | 61 |
| `features` | 218 | | `execution` | 59 |
| `author` | 91 | | `influences` | 58 |
| `note` | 92 | | `typing` | 53 |
| `paradigms` | 86 | | `relations` | 39 |
| `references` | 84 | | `type_system` | 33 |
| `status` | 74 | | `memory` | 32 |
| `kind` | 68 | | `concurrency` | 17 |
| `year` | 65 | | `influenced` | 19 |

Missing-field slots in the 387 stubs: **4,105** (avg 10.6 per stub).

Notable corpus gaps, verified by slug (not by name grep): `haskell`, `perl`,
`php`, `swift`, `prolog`, `elixir`, `r`, `sql`, `html`, `css`, `bash`, `dart`,
`groovy`, `hy`, `reason`, `fennel`, `sml` are all **absent**. `java`,
`javascript`, `python`, `rust`, `go`, `kotlin`, `scala`, `clojure`, `erlang`,
`fsharp`, `ocaml`, `smalltalk`, `forth`, `lisp`, `scheme`, `ada`, `cobol`,
`fortran`, `pascal`, `lua`, `zig`, `nim`, `crystal`, `julia`, `typescript`,
`racket`, `idris`, `agda`, `coq`, `lean`, `elm`, `janet` are present.

The `homepage`/`references` ratio is the important one: 232 homepages but only
84 sourced reference lists means ~150 rows have a link and no citation.

## 3. PLDB as the enumeration source (measured)

[PLDB](https://pldb.info) exports its dataset as public domain JSON
(`https://pldb.io/pldb.json`, ~11 MB, `last-modified` changes on rebuild).

```text
all concepts                              5,169
isLanguage === true                       4,623
  in scope for lambdafolio's `kind`       4,427
  out of scope                              196   ← compiler, protocol, library, os, …
matched to our 455 rows (name or aka)       273
net-new candidates                        4,154
```

"In scope" = `primaryTag` maps to a `kind` value we support (`language`,
`notation`, `standard`, `dialect`). Out of scope: `compiler` (31), `protocol`
(70), `library` (58), `staticSiteGenerator`, `dataVis`, `unixApplication`,
`characterEncoding`, `interpreter`, `textEncodingFormat`, `barCodeFormat`,
`timeFormat`, `diffFormat`. This is the skill's "do not stub a library,
framework, tool, or data format" rule, applied as data.

Applying the import rule — ASCII name ∧ non-empty slug ∧ **has a website** ∧
no slug collision:

```text
ELIGIBLE net-new rows                     1,369
rejected: no website                      2,757
rejected: non-ASCII name                     15   文言文編程語言, Ć, Caché ObjectScript, λProlog, Đ
rejected: slugifies to empty                 2   ><>, $
rejected: slug collision                    11   Pyret→pyret, P*→p, Z→z, Lemon→lemon, TAO→tao
```

Eligible by PLDB `rank` (their salience ordering):

| rank ≤ | rows | net-new eligible |
| --- | --- | --- |
| 100 | 95 | 40 |
| 250 | 213 | 109 |
| 500 | 413 | 244 |
| 1,000 | 818 | 502 |
| 1,500 | 1,226 | 702 |
| all | 4,427 | 1,369 |

The top of that list is telling: `css` (7), `perl` (8), `php` (10), `json`
(13), `r` (17), `powershell` (18), `bash` (19), `swift` (21), `matlab` (22),
`haskell` (26), `coffeescript` (28), `elixir` (29).

**PLDB is a candidate generator, never a citation.** It is a secondary
compilation and the skill forbids aggregators. Its `website`, `appeared`,
`creators`, and `rank` are priors that tell tier 1 *where to fetch* and *what
to verify*; they do not enter frontmatter unverified. The one exception
permitted, because it is machine-checkable, is `homepage` written only after a
`200` from the URL itself (§6).

## 4. The two tracks

| | track 1 — automated | track 2 — exceptional |
| --- | --- | --- |
| trigger | issue queue, cron, derived backlog | owner's judgment |
| executor | scripted pipeline (Actions) | local agent session |
| drafting model | `deepseek-v4.1-flash:cloud` | same |
| frontmatter contract | identical | identical |
| prose skeleton | four sections, `::code-group` of code | may be images / mermaid / verbatim quotation |
| evidence bar | primary source per fact | **+ asset provenance and licence** |
| verifiable from a fetched page? | yes | **no** — plate, glyph table, engraving |
| throughput | unattended, 3 concurrent | one language per session |
| failure mode | a wrong fact from a weak source | **a fabricated snippet with no source to check** |
| merge | bot PR, owner reviews | owner authors and merges |

The asymmetry is documented, not hypothetical. Two incidents are recorded in
repo notes and in the entries themselves: an invented `card 0011…` syntax in
`jacquard-card-chain.md`, and invented `2o 3x` glyphs in `talim.md`. Both were
plausible, both were wrong, and both passed every mechanical check.

Note what those two have in common, because it is the actual routing criterion:
the failure was not "a model drafted prose" — that happens in every session and
is fine. It was **a model drafting syntax with no primary source to check it
against.** Track 2 exists for entries where the evidence is a plate, a glyph
table, or a nineteenth-century engraving, so the only verification available is
a curator who has opened the source. Ordinary languages, whose syntax is
documented on a fetched page, belong to track 1 even when a model writes their
prose.

### 4a. Routing (triage classifies, it does not authorize)

A submission is labelled `needs-curator` (track 2) — never `ready` — when any
of these hold:

- proposed `kind` is `notation`, or `paradigms` includes `visual`
- the only resolvable source is a PDF, an image host, or a repo with no
  textual spec
- the description implies cards, glyphs, diagrams, tape, glyph grids, or pixels
- fewer than two primary sources resolve

## 5. Intake: issue forms, not an endpoint

Public repo, so GitHub Issues is the queue. No Azure Function: the only thing
it would add is anonymous submission, and the correction flow benefits from
being visible on a public tracker.

### 5.1 Templates

`.github/ISSUE_TEMPLATE/new-entry.yml` and `correction.yml`. Issue *forms*
support `?template=`, `title=`, `labels=` in the query string but **do not
prefill textareas**, so the target is encoded in the `title`:

- new entry → `new-language: <Name>`
- correction → `correct: <collection>/<slug>/<field>`

`new-entry.yml` fields, each chosen because the skill needs it:

| field | why |
| --- | --- |
| `name` (required) | the row key; triage runs the collision check |
| `also known as` | step 1's "confirm it isn't present under a different name" — `TODO.md` already contains `Oak → AKA Java`, `Mocha → Early name for JavaScript` |
| `homepage or spec URL` (required) | existence proof; saves 1–2 of the skill's 2–4 searches |
| `documentation URL` | separate from "where I heard about it" so the skill knows what is citable |
| `what makes it interesting` (1–2 sentences) | a lead for prose, never a fact |
| `artifact type` (select: language / notation / standard / dialect / not-a-language) | routes libraries and tools out before research |
| `request type` | `new` → `language-entry`; `correction` → update path |

`correction.yml` fields:

| field | triage rule |
| --- | --- |
| `entry` (slug) | must resolve to an existing file |
| `field` | must exist in the `content.config.ts` schema — reject unknown |
| `proposed` | vocab axis → must be in `taxonomy.ts`; `paradigms` → page must exist; `family` → must be in `families/`; `year` → 4-digit integer in range; `name` → collision check |
| `source` (required) | must be primary; aggregator-only ⇒ label `leads-only` |
| — | prose rewrites are **not** a correction: label `rewrite-request`, treat as research |

The last row matters. Free-text "this section is wrong" reintroduces exactly
the unverifiable input the fact contract exists to exclude. The form has no
file upload and no image field — track-2 assets come only from a curator who
opened the PDF.

### 5.2 Triage (`.github/workflows/triage.yml`)

Deterministic only. The reviewer is the rulebook in the repo, not a model.

On `issues.opened` **and** `issues.edited`:

1. **Parse** the title into `(kind, target)`.
2. **Snapshot.** Post a workflow-owned comment containing the validated
   fields, then mark the issue as "snapshotted". The submitter cannot edit a
   bot comment, so downstream consumption reads the snapshot, not the live
   body. This defeats the scrub-then-rewrite attack; labels are hints only.
3. **Dedupe.** `grep -rli '^name: *"<name>"' content/languages/` plus open-issue
   search plus alias near-miss. A duplicate `name` hard-crashes the dev build
   via the UNIQUE index, so this must fail at triage.
4. **Slug preview.** Import `slugify` from `app/utils/slugify.ts`; if the name
   is in `SLUG_OVERRIDES` or contains `#`, label `slug-override-needed` and
   require a manual decision (there is no generic `#` rule).
5. **Source classification.** Host allowlist mirroring `lint-body`:
   `wikipedia|wikimedia|wikibooks|wikidata`, `news.ycombinator.com`,
   `reddit.com`, `twitter.com|x.com`, `lambda-the-ultimate.org` ⇒ `lead`;
   otherwise `primary`. Label `has-primary-source` / `leads-only`. Leads are
   still accepted — that is what `TODO.md` is made of — the label only tells
   the curator whether the entry costs one fetch or five.
6. **Liveness.** `HEAD` with a short timeout; record status. Note the
   documented 403-bot-wall caveat (ACM DL, Springer, npm) so a good canonical
   link is not dropped.
7. **Verdict label** — `ready` | `needs-info` | `needs-curator` | `duplicate: <slug>`
   | `declined: not-a-language` — and a comment explaining the rule that fired.

Hardening, all of it cheap:

```yaml
permissions: {}          # job-level opt-in only
```

- never interpolate `${{ github.event.* }}` into `run:` — pass via `env:` and quote
- no `pull_request_target`
- third-party actions pinned to SHAs
- triage ignores any label not applied by its own bot identity
  (`author_association` / `sender.login` check)

## 6. Backfill pipeline

### 6.1 Tier 0 — identity rows (no model, no search)

`scripts/import-pldb.mjs`:

1. Fetch `https://pldb.io/pldb.json`; record `etag` + `last-modified` in the
   generated file header for reproducibility (do not commit the 11 MB).
2. Filter `isLanguage === true` and `primaryTag ∈ IN_SCOPE`.
3. Apply the import rule: ASCII ∧ non-empty slug ∧ has `website` ∧ no
   collision with an existing file or a slug already claimed in this run.
4. Emit one stub per row — **`title`, `name`, and nothing else** — with the
   exact exempt body:

   ```md
   ---
   title: "Name"
   name: "Name"
   ---
   TODO: Write the wiki article for **Name**.
   ```

   `homepage` is written only by step 5, after a live check.

5. `scripts/check-homepages.mjs` — `HEAD` each candidate; on `200`, add
   `homepage`. Writes a report of dead links rather than guessing replacements.

Output: **1,369 eligible rows**, or a rank-bounded subset (244 at `rank ≤ 500`).

### 6.2 Tier 1 — fact fields (Ollama Cloud, 3 concurrent)

Ollama Cloud allows **3 concurrent requests** on pay-as-you-go and Pro (10 on
Max); requests beyond the limit queue. Design for three workers.

```text
for each language with missing fields, ordered by priority:
  fetch homepage + any spec/doc URL from frontmatter   (script, no model)
  strip to text, cap ~8k tokens
  for each unfilled field:
      one call, JSON schema, must return {value, quote, url} or null
  validate:
      value ∈ vocabulary                     (taxonomy.ts / collections)
      quote ⊂ fetched text for that url      ← the anti-fabrication gate
      url was fetched in this run
  accept / drop
```

Four properties that make this safe to run unattended:

- **One field per call.** No long-context drift; a bad call costs one field.
  Nothing needs the whole corpus in context, so it scales to thousands of rows.
- **Quote verification.** The returned quote must be a substring of the text
  the script fetched. A model that invents "has a garbage collector" produces
  a quote that fails the check. This is the mechanical form of "negative facts
  are hard", and it is what makes a thousand unattended rows reviewable — not
  what makes automation permitted.
- **Vocabulary membership.** `paradigms`, `family`, `features` resolve against
  `taxonomy.ts` and the collections. Out of vocabulary ⇒ dropped, never added
  (`adding a value is a schema decision`).
- **PR, not push.** The job opens one PR with a per-field diff plus the quotes
  used. The default branch is never written by a bot.

Budget: ~8k input + ~300 output per language across ~12 fields, at
`deepseek-v4.1-flash` rates, puts the whole 4,600-language corpus in the tens
of dollars **one time**, not per month. A 30-minute nightly run at 3
concurrency processes ~100–200 languages; the full run is a few weeks of
unattended cron.

### 6.3 Tier 2 — prose, by the same rules as today

Prose drafting is **not new**. The current session workflow already is: a model
drafts `Overview`, traits, the code tour, and the closing callout; the owner
reviews and edits; the lint gates run between drafts. Moving that to a pipeline
changes the **executor**, not the authoring model or the review gate.

| | current session | automated |
| --- | --- | --- |
| who drafts | model (deepseek-v4.1-flash:cloud) | same model |
| who reviews | owner, in the loop | owner, on a PR |
| gates | `lint-frontmatter`, `lint-body`, `markdownlint`, `cspell` | identical, in CI |
| failure caught by | review | review |
| failure missed by | lint (structure ≠ correctness) | identical |

The two documented fabrication incidents — invented `card 0011…` syntax in
`jacquard-card-chain.md`, invented `2o 3x` glyphs in `talim.md` — happened in
**sessions**, not in a pipeline. They were caught by the owner reading the
draft, which is exactly what happens on a PR. So the risk argument for
excluding prose from automation does not hold; the review gate is the control
in both cases.

What genuinely changes at scale:

- **One pass per entry, not two.** Facts and prose share the same fetched
  sources and the same model context, so they are produced together (§6.4).
  Splitting them would re-fetch and re-read every page for the second stage and
  roughly double both token spend and wall time.
- **Review must stay real.** 1,369 drafts arriving at once cannot be reviewed;
the pipeline therefore drafts in priority order (§8) and opens **one PR per
band**, the facts and prose for an entry landing as two commits in it.
- **The lint gets stricter, not looser.** `lint-body` cannot check that a code
snippet is *correct*, so the pipeline adds what the session has implicitly:
  - every fenced block labelled with its slot tag and a source URL
  - a `drafted-by-pipeline` label and a `needs-review` label on the PR
  - the draft halts and labels `needs-curator` rather than guessing when
    syntax confidence is low (the skill's existing rule, now mechanical)
- **Exceptional languages never take this path** (§7). Image tours, glyph
notations, and pre-1900 sources stay in a session, because the failure mode
there is fabrication rather than weakness, and it is the one failure mode that
reads as authoritative.

Prose drafting is therefore **in scope**, folded into step 6 of §13 — batched by
priority band so each PR is reviewable in a sitting, and produced in the same
pass as the facts (§6.4).

### 6.4 One pass per entry (the efficiency constraint)

The naive shape is two stages per band: extract facts, open a PR, then draft
prose from the now-complete frontmatter. That is wasteful in the two resources
that actually bind:

| stage | fetches | model calls | wall time |
| --- | --- | --- | --- |
| facts alone | 1–3 pages | ~12 short calls | ~1 min |
| prose alone | **the same pages again** | 1 long call, bigger context | ~2 min |
| facts + prose in one pass | 1–3 pages, once | 12 short + 1 long, shared context | ~2.5 min |

The shared work is the expensive part: fetching, HTML→text, and tokenising a
document. Doing it twice doubles Brave-adjacent fetches, doubles input tokens,
and — worse — lets the prose contradict the facts because they were derived in
separate contexts. A single pass keeps them consistent by construction.

Concrete shape, per entry:

```text
fetch sources once            → text cache, keyed by url (reused by every call)
extract 12 fields             → verify quote ⊂ text, vocab ∈ taxonomy
if any core field is empty    → still draft prose; note the gap in the callout
draft body                    → given the verified facts as INPUT, not as priors
verify body                   → lint-body in-process; fail ⇒ one repair attempt, then halt
write both files              → facts commit + prose commit, one PR per band
```

The two commits are what preserves reviewability without paying twice: the
reviewer can skim the frontmatter commit and read the prose commit separately,
while the pipeline fetched and reasoned once. Splitting at the *commit* level
is free; splitting at the *run* level is not.

Two failure rules for this stage:

- **Facts gate the prose.** The body is drafted from the verified facts, so a
  dropped fact is a missing claim, not an invented one. If `typing` failed
  verification, the traits section does not get to mention static typing.
- **Low confidence halts.** If fewer than N core facts verify, or the language
is routed to track 2, the entry stops before prose and is labelled
`needs-curator`. A prose draft built on two verified fields is worse than no
page, because it reads complete.

## 7. Exceptional track

### 7.1 Declarative exceptions (schema change — owner decision)

Add to the `languages` collection in `content.config.ts`:

```ts
// how the code tour demonstrates the language. Defaults to 'text'.
// 'image' | 'diagram' | 'quotation' relax lint-body's fenced-block rule;
// in exchange, any non-text tour must carry per-asset provenance.
tour: z.enum(['text', 'image', 'diagram', 'quotation']).optional(),
assets: z.array(z.object({
  url: z.string().min(1),      // where the plate/figure came from
  license: z.string().min(1),  // 'public-domain' | 'CC0' | 'CC-BY-SA-4.0' | …
  note: z.string().optional()
})).optional()
```

`scripts/lint-body.mjs` then:

- errors when `tour` is `image|diagram` and `assets` is missing or empty
- errors when an `assets` entry has no `license`
- warns when a `tour: image` entry also carries a fenced code block it cannot
  demonstrate

Why: the three existing exceptions (`piet.md`, `talim.md`,
`jacquard-card-chain.md`) are currently invisible — they satisfy the
"≥ 1 fenced block" rule with a verbatim quotation in a `text` fence tagged
`[combinations]`. That workaround is legitimate but undocumented, so triage
cannot tell an intentional image tour from a missing code block, and a future
curator cannot tell either. Making the exception declarative lets the lint
enforce the thing that actually failed twice: **provenance**.

### 7.2 Track 2 executor

Local session, the existing `language-entry` skill, plus a reference file
`.github/skills/language-entry/references/exception-tours.md` covering image
tabs, mermaid for visual languages, the `::div{label="…"}` tab wrapper, the
MD031 blank line before a fenced block inside a tab, and the asset pipeline
(`pdftoppm` → crop → LANCZOS → greyscale → 64-colour PNG). One skill, one
longer reference — not a second skill, since the frontmatter contract is
identical.

Track 2 usually starts with **no issue at all**; the commit is the record. The
ceremony is only required in reverse: the skill's closing summary lists newly
discovered languages, and those file themselves as track-1 `queued` issues.

## 8. Queueing the existing 387 stubs

**Do not create 387 issues.** The stubs are already rows; duplicating them
into an issue tracker produces noise with no signal. The backlog is *derived*,
the same way paradigm member lists are derived.

`scripts/backlog.mjs` computes, per entry, the missing fields and a priority
score, and emits a ranked table. Four distinct queues fall out:

| queue | count | cost per row | why it is first |
| --- | --- | --- | --- |
| A — prose entries missing facts | 68 rows, ~36 PLDB-matched | tier 1 | these are the entries people actually read |
| B — stubs with a live homepage | 118 (of 213 PLDB-matched stubs) | tier 1, no Brave | free: no search needed |
| C — stubs with no homepage | 269 | tier 0 liveness, then tier 1 | needs a URL before anything else |
| D — net-new eligible | 1,369 | tier 0 + tier 1 | breadth, last |

Priority score suggestion:
`score = prose? ×3 : 1` × `1/ln(rank+2)` × `missingFieldCount`, so a heavily
promoted but sparsely filled entry outranks a well-filled obscurity.

Two output modes:

- `npm run backlog` — prints the table (no file written; nothing to drift)
- `npm run backlog -- --md` — renders the table for a single pinned
  "Corpus backlog" tracking issue that a weekly workflow updates in place.
  One issue, not 387.

The generated table is also the input to tier 1, so the pipeline and the human
look at the same ordering.

## 9. Secrets (dotenvx, following cathedral)

Current `.gitignore` (`:21-24`) is `.env` / `.env.*` / `!.env.example` — that
must change, because the encrypted files are meant to be committed.

Adopt cathedral's layout exactly:

| file | committed | contents |
| --- | --- | --- |
| `.env` | yes, plaintext | `HELLO=env` only, to stop dotenvx complaining about a missing default file ([dotenvx#484](https://github.com/dotenvx/dotenvx/issues/484)) |
| `.env.local` | yes, **encrypted** | `DOTENV_PUBLIC_KEY_LOCAL` + dev values |
| `.env.production` | yes, **encrypted** | `DOTENV_PUBLIC_KEY_PRODUCTION` + CI values |
| `.env.keys` | **never** | `DOTENV_PRIVATE_KEY_LOCAL` / `_PRODUCTION` |

`.gitignore` delta:

```gitignore
# dotenvx private keys (NEVER commit these)
.env.keys
# Allow encrypted env files (safe to commit when encrypted with dotenvx)
!.env
!.env.local
!.env.production
!.env.example
```

`package.json` scripts:

```json
"dotenvx:encrypt:local": "dotenvx encrypt -f .env.local",
"dotenvx:decrypt:local": "dotenvx decrypt -f .env.local",
"dotenvx:encrypt:production": "dotenvx encrypt -f .env.production",
"dotenvx:decrypt:production": "dotenvx decrypt -f .env.production",
"backfill": "dotenvx run -f .env.local -- node scripts/extract-facts.mjs",
"import:pldb": "dotenvx run -f .env.local -- node scripts/import-pldb.mjs"
```

Secrets held: `BRAVE_API_KEY`, `OLLAMA_API_KEY`. Both live encrypted in
`.env.production`; the corresponding `DOTENV_PRIVATE_KEY_PRODUCTION` is a
repository secret.

`.github/actions/decrypt-env/action.yml` — copy cathedral's composite action
verbatim (install `dotenvx` from `dotenvx.sh`, `dotenvx decrypt -f`, strip
surrounding quotes, `::add-mask::` any key matching
`PASSWORD|SECRET|KEY|TOKEN|PRIVATE|THUMBPRINT|CERT|CREDENTIAL|AUTH`, append to
`$GITHUB_ENV`). It is already correct, including the quote-stripping fix that
cathedral needed for a quoted URL reaching a header.

Workflows then do:

```yaml
- uses: ./.github/actions/decrypt-env
  with:
    dotenv-private-key: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
    environment: production
```

Caveat: the repository is public, so the ciphertext is public. That is safe
(X25519 public-key encryption) but it means the **encrypted files must never
contain a value you would not want published in encrypted form** — treat
rotating any leaked key as normal hygiene.

## 10. Brave usage and its ceiling

Search is what the $5/month credit meters. Current Brave pricing: **$5 in
monthly credits ≈ 1,000 searches**, card required, ~1 req/s on free credit;
their LLM Context endpoint is the useful one for broad questions.

The design keeps search optional:

- 1,369 eligible rows arrive **with** a website ⇒ tier 1 fetches, no search
- 2,757 no-website rows need search *or* are genuinely unreachable ⇒ deferred
- `scripts/research.mjs` (`--search` / `--fetch`) caps queries per invocation
  (default 6) and is the single entry point, usable both from CI and from a
  local session, which removes the MCP-as-a-protocol dependency without
  removing the capability

That keeps steady-state usage far under the credit. Only a deliberate
exhaustive sweep of the no-website tail would exceed it, and that is a
separate, budgeted decision.

## 11. File-level deltas

New:

```text
.github/ISSUE_TEMPLATE/new-entry.yml
.github/ISSUE_TEMPLATE/correction.yml
.github/actions/decrypt-env/action.yml        ← from cathedral
.github/workflows/triage.yml
.github/workflows/backfill.yml                ← schedule, concurrency 1, budget cap
.github/skills/language-entry/references/exception-tours.md
scripts/import-pldb.mjs
scripts/check-homepages.mjs
scripts/research.mjs
scripts/extract-facts.mjs
scripts/backlog.mjs
docs/suggestion-intake-plan.md                ← this file
.env, .env.local, .env.production             ← dotenvx
```

Modified:

```text
content.config.ts        add `tour`, `assets` to languages (+ paradigm/feature?)
scripts/lint-body.mjs    relax fenced-block rule by `tour`; require assets+licence
scripts/lint-frontmatter.mjs   validate `tour`, `assets`, licence vocabulary
app/components/EntryLayout.vue  add "Suggest a correction" beside the edit link
app/utils/entries.ts     add suggestIssueUrl(collection, slug, field?)
.gitignore               dotenvx negations
package.json             dotenvx + backfill scripts, @dotenvx/dotenvx dep
README.md                document the two tracks and the queue
```

Note on `entryEditUrl` in `app/utils/entries.ts`: since the repo stays public
this link still works. The correction form is additive, not a replacement.

## 12. Payload ceiling (decide before importing)

`app/pages/index.vue` selects 15 fields for **every** language row and
paginates client-side (`resultLimit: 1000`, `PAGE_SIZE` slicing). Measured
payload: **64 KB for 455 rows** (143 B/row on the selected fields).

| after | rows | payload |
| --- | --- | --- |
| today | 455 | 64 KB |
| + eligible import | 1,824 | ~255 KB |
| + full tail import | 4,609 | ~644 KB |

644 KB is survivable but it is no longer a "small corpus". Three options:

1. **Staged import** (recommended): `rank ≤ 500` now (244 rows, ~99 KB), extend
   as curation catches up.
2. Keep client-side faceting and accept ~644 KB on first paint.
3. Move faceting server-side — that contradicts the static-host decision and
   is out of scope here.

## 13. Migration steps

1. **Schema first.** Add `tour` + `assets`, extend `lint-body`, re-lint the
   corpus. Backfill `tour: image` on the three existing exceptions so they stop
   relying on the quotation workaround. (Blocks nothing, but doing it first
   avoids re-linting the whole import twice.)
2. **Secrets.** Adopt dotenvx, add `BRAVE_API_KEY` / `OLLAMA_API_KEY`, add the
   `decrypt-env` action.
3. **Intake.** Issue forms + `triage.yml` + the `EntryLayout.vue` link. This is
   the only user-visible change and it is independent of the corpus work.
4. **Tier 0 import.** `import-pldb.mjs` at `rank ≤ 500`, `check-homepages.mjs`.
   Opens a PR. Review the diff — it should be ~244 stubs plus homepage writes.
5. **Backlog.** `backlog.mjs`, pin the tracking issue.
6. **Backfill per priority band.** One pass per band, facts *then* prose for the
   same entry, in the same run — the page is already fetched and the context
   already held, so splitting the two would double both. The artifacts stay
   separable at review time by being separate commits in one PR:

   | commit | contents | review mode |
   | --- | --- | --- |
   | `facts: <band>` | frontmatter only, every value carrying its quote | skim |
   | `prose: <band>` | body only, `::code-group` tour + callout | read |

   All gates green before the PR opens; `needs-review` +
   `drafted-by-pipeline` labels on it. Same review gate as a session — the owner
   reads the draft — but one fetch and one model context per entry instead of
   two. Queue A then B first (readable entries, free-enrichment stubs), then
   widen.
7. **`TODO.md`** → issues once, then reduce to a pointer.

## 14. Operational triggers (when to revisit)

- **Queue depth > 30 open `queued` issues** or a month you cannot drain ⇒
  consider raising tier-1 automation scope, not adding a human.
- **Index payload > 300 KB** ⇒ stop importing and revisit §12 option 2 vs 3.
- **Brave credit exhausted mid-month** ⇒ the search path is being used where a
  homepage fetch should have been; fix the pipeline, not the budget.
- **Ollama 429s / queue rejections** ⇒ concurrency is set above the plan's
  limit; cap the worker pool at 3.
- **A fabricated code snippet reaches a PR** ⇒ tighten the source-URL
  requirement and the `needs-curator` halt; do not suspend prose drafting,
  since the same failure is reachable in a session.

## 15. Explicitly not building

- **Azure** — no Function, resource group, CORS, or second deploy target. The
  only thing that would justify it is anonymous submission; GitHub accounts are
  a reasonable requirement for this audience and the public tracker is a
  feature, not a cost.
- **A submissions database** — issues are the store.
- **A custom moderation UI** — labels + comments are the UI.
- **An MCP-in-CI agent harness** — `scripts/research.mjs` calls the Brave REST
  API directly, which is what the MCP does under the hood.
- **A queue collection in `content/`** — `collectionRoutes()` in
  `nuxt.config.ts` seeds a prerendered route per `source: '<dir>/*.md'`, so a
  `content/suggestions/` directory would publish pending suggestions, put them
  in the sitemap, and list them in the entry UI.
- **Auto-merged drafting** — merge stays manual; that is the entire quality
  guarantee, not the absence of a drafting model.

## 16. Open decisions for the owner

1. **Import scope for the first batch** — `rank ≤ 500` (244 rows, ~99 KB) as
   recommended, or the full 1,369 eligible now?
2. **PLDB data handling** — candidate generator only (recommended), or should
   `appeared` seed `year` directly on stubs, as a documented exception to the
   primary-source rule?
3. **`tour`/`assets` schema change (Option A)** — approve, or keep the verbatim-
   quotation workaround (Option B) and leave exceptions undocumented?
4. **Does `tour`/`assets` also apply to `paradigms` and `features`?** They share
   the `lint-body` skeleton, so the marker is equally meaningful there.
5. **Batch size for the first prose-drafting PR** — one entry, a small batch
   (5–10), or a whole priority band? Smaller is easier to review honestly;
   larger amortises the pipeline work.
