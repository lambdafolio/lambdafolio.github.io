# Design-quality axis: plan and backlog

> Status: **proposed** (2026-11-08), not implemented. No schema change has
> landed; this document is the backlog entry for the work, ordered so each
> item is independently shippable.
>
> The question that produced it: *"befunge, intercal — no one would use
> seriously, yet Haskell and Smalltalk are considered two of the best
> languages ever created. What is the measure of quality?"*

## 1. Problem

The corpus can state what a language *is* (axes, paradigms, lineage) but
cannot state what it is *worth*. Two consequences:

- The index cannot separate **popularity** from **design merit**. A
  mainstream language and a language with a documented broken grammar are
  indistinguishable rows.
- The most interesting category on the site — **well-designed and
  under-adopted** (Smalltalk, Scheme, APL, Forth, Self, Newspeak) — is
  invisible, because neither of its two conditions is recorded.

The tempting fix (one `quality` number) is wrong for reasons in §3.

## 2. Three claims, not one measurement

Recorded criticisms are of different kinds, and a single scalar averages
away the distinction:

| Example | The claim actually made | Aspect |
| --- | --- | --- |
| CoffeeScript | the grammar admits ambiguous parses | `grammar` |
| Perl | programs are statistically indistinguishable from line noise | `consistency` |
| PHP ≤ 5 | stdlib names/argument orders are irregular | `consistency` |
| PHP ≤ 5 | behaviour defined by the interpreter, no normative spec | `specification` |

Note also that **two of the three are era-scoped claims** ("PHP *before
version 7*"). A quality fact without a validity window becomes permanently
wrong the moment the language fixes the defect.

## 3. Decisions

### D1 — No composite score

A 0–100 score is unsourceable, unrankable, an edit-war magnet, and
contradicts "facts are schema" (a score is an opinion wearing a number's
clothes). **Design merit is a profile, not a number.**

### D2 — Assessments are sourced claims, not verdicts from the site

Each record asserts *"this assessment is on record, at this URL"* — not
"this is true". This is what makes it lintable and what keeps it from
rotting. **A verdict without a `url` is a build error**, including for
canon languages.

### D3 — All quality views are derived

Same doctrine as paradigm/family member lists: nothing that can be computed
from facts is stored. There is no `quality` column; "diamond in the rough"
and "entrenched despite flaws" are queries over `assessments` +
`adoption`.

### D4 — Holes are honest

A language with no `assessments` renders as **"not assessed"**, never as
"fine". Every derived view prints its denominator (*"12 of 420 languages
assessed"*).

## 4. Verified baseline

Measured on `master` (`1de9801`) at 2026-11-08:

| Fact | Count |
| --- | --- |
| `content/languages/*.md` entries | 420 |
| Entries with prose (non-stub) | 46 |
| Entries with `references` | 62 |
| Entries with `year` | 38 |
| Entries with `kind` | 36 |
| Entries with `status` | 42 |
| Entries with `typing` | 31 |
| Entries with `family` | 47 |
| Entries with `paradigms` | 55 |
| Entries with `note` | 60 |
| Entries with `influences` | 42 |
| Entries with `influenced` | 8 |
| Entries with `relations` | 28 |
| Entries with any design/quality axis | **0** |

Implication: **the axis is not the bottleneck, the corpus is.** Shipping
the schema first would create an empty column with a contract. The order
below reflects that.

Also note that several languages this plan depends on are missing or are
bare stubs: `haskell.md` and `scheme.md` do not exist; `coffeescript.md`,
`perl.md`, `php.md` do not exist; `c.md` and `smalltalk.md` are
`TODO: Write the wiki article` stubs.

## 5. Schema deltas

### 5.1 `app/utils/taxonomy.ts`

Three new closed vocabularies, following the existing `KINDS` /
`FAMILIES` pattern:

```ts
/** Why the language exists — separates esoteric/teaching designs from tools. */
export const PURPOSES = [
  'general-purpose', 'domain-specific', 'research', 'educational', 'esoteric'
] as const

/** How many people actually use it. Coarse on purpose; see D4. */
export const ADOPTIONS = ['mainstream', 'established', 'niche', 'marginal'] as const

/** What an assessment is about. Closed: adding one must be a schema decision. */
export const ASSESSMENT_ASPECTS = [
  'grammar', 'specification', 'semantics', 'consistency', 'safety',
  'error-handling', 'tooling', 'documentation', 'evolution',
  'performance', 'portability', 'learnability'
] as const

export const ASSESSMENT_VERDICTS = ['strong', 'contested', 'weak'] as const
```

`purpose` collides textually with `paradigms: domain-specific`; that is the
same deliberate collision the schema already documents for `smalltalk`
naming both a language and a family. `purpose` answers *design intent*,
`paradigms` answers *technique*.

`adoption` is deliberately **not** folded into `status`: `status` stays
lifecycle. COBOL is `active` + `established`; ALGOL 60 is `historical` +
`marginal`; Haskell is `active` + `niche`.

### 5.2 `content.config.ts` — `languages` collection

Two scalars plus one structured array, mirroring `relations`:

```ts
purpose: z.enum(['general-purpose', 'domain-specific', 'research',
                 'educational', 'esoteric']).optional(),
adoption: z.enum(['mainstream', 'established', 'niche', 'marginal']).optional(),
assessments: z.array(z.object({
  aspect: z.string().min(1),          // ASSESSMENT_ASPECTS, lint-enforced
  verdict: z.enum(['strong', 'contested', 'weak']),
  from: z.number().optional(),        // era start (year)
  until: z.number().optional(),       // era end; absent = still current
  note: z.string().min(1),
  url: z.string().min(1)              // REQUIRED — see D2
})).optional()
```

Indexes: add `{ columns: ['purpose'] }` and `{ columns: ['adoption'] }`
alongside the existing `kind`/`family` index entries. `assessments` is a
JSON-text array column and stays unindexed, exactly like `paradigms`.

### 5.3 Derived util (no schema)

New `app/utils/standing.ts`:

- `ancestorsOf(name, corpus)` / `descendantsOf(name, corpus)` over both
  `influences` and `influenced` (an edge may be written from either side).
- `influenceOf(name, corpus)` → descendant count **plus its coverage**
  (`n` of `total` entries contributing edges).
- `designProfile(row)` → `{ strong, contested, weak, assessed }` for the
  currently-valid era only (a record with `until` in the past is not
  counted; it is shown as history).
- `quadrant(row)` → one of `canon | workhorse | rough-diamond |
  curiosity | domain-tool | unassessed`.

## 6. Lint rules

`scripts/lint-frontmatter.mjs` already enforces vocabulary membership by
import, so `purpose`/`adoption`/`aspect`/`verdict` cost one line each in its
`vocabAxes` map. Three new checks:

| Rule | Severity | Rationale |
| --- | --- | --- |
| `assessments[].url` missing or non-absolute | **error** | D2 — an unsourced verdict is not a fact |
| assessment `url` points at a Wikipedia/aggregator host | **error** | existing primary-source rule in `references` and `lint:body` |
| `verdict: weak` with `until` in the past | **warning** | "era closed — re-verify", so fixed defects do not linger |
| `until` < `from` | **error** | obvious malformed era |
| `Y.influences ∋ X` while `X.influenced ∌ Y` | **warning** | keeps the influence graph usable for §5.3 without demanding symmetry on every stub |

## 7. Derived views

Four surfaces, all read-only over the facts:

1. **Design profile** on `/languages/<slug>` — a row of aspect chips
   (`grammar weak`, `tooling strong`), each linking to its source.
2. **`/standings`** (or a filter preset on `/`) — the adoption × influence
   quadrants:

   | | low adoption | high adoption |
   | --- | --- | --- |
   | **high influence** | the canon (ALGOL 60, Smalltalk, Lisp, ML) | the workhorses (C, Java, Python) |
   | **low influence** | esoteric and curiosities | domain tools (SQL, R, Verilog) |

3. **Diamond in the rough** — no stored field: design profile mostly
   `strong` **and** `adoption ∈ {niche, marginal}` **and** `assessed ≥ 2`.
4. **Entrenched despite flaws** — `weak` count ≥ 2 **and** `adoption ∈
   {established, mainstream}`. This list is published nowhere else and is
   the strongest argument for the whole feature.

All four render the denominator from §4/§5.3.

## 8. Backlog

Sized S (≤ half day), M (a day), L (multi-day). Each item is independently
shippable and leaves the site building.

### B1 — `purpose` + `adoption` vocabulary and schema (S)

- `app/utils/taxonomy.ts`: `PURPOSES`, `ADOPTIONS`.
- `content.config.ts`: two optional scalars + two index entries.
- `scripts/lint-frontmatter.mjs`: add to the languages `scalars` and
  `vocabAxes` maps; add both to the schema-parity allowlist.
- `app/utils/filters.ts`: add `purpose` and `adoption` to `AXES` and to
  `LanguageRow`.
- `app/pages/index.vue`: extend the `select()` and the `searchDocs` fact
  list.
- `app/pages/schema.vue`: `LINT_SCALARS` rows + two `vocabGroups` entries.
- **Accept:** `npm run lint:frontmatter`, `npm run lint:body`,
  `npm run check:filters`, `npm run generate` all pass with zero new
  warnings; both facets appear and filter correctly; a URL using both
  round-trips through the query string.

### B2 — Backfill `purpose: "esoteric"` (S)

Five entries already exist and are unambiguous: `befunge`, `brainfuck`,
`false`, `lolcode`, `piet`. Add `intercal`, `whitespace`, `malbolge`,
`unlambda`, `shakespeare`, `chef` only where a primary source states the
design intent; otherwise log stubs and stop.
**Accept:** every `purpose: esoteric` row cites a source in `references`
that supports the classification; no row infers intent from the name.

### B3 — Backfill `adoption` for the ~60 entries with a `note` (M)

Coarse buckets only, from a stated basis (job-market presence, ongoing
releases, community size). Do not transcribe TIOBE/SO ranks as facts.
**Accept:** ≤ 60 rows; every value defensible from the entry's own
`references`; `historical` + `mainstream` and `active` + `marginal` both
appear (proof the axes are independent).

### B4 — Influence coverage pass (M)

Write lineage edges **downward** from the ~15 canon ancestors (Fortran,
ALGOL 60, COBOL, Lisp, Simula, Smalltalk, ML, Prolog, Pascal, C, APL, Self,
Beta, C++, Scheme) rather than asking 400 leaves to declare ancestors.
**Accept:** ≥ 150 entries carry an edge in one direction; `standing.ts`
coverage ≥ 35% of the corpus; a reciprocal-edge warning count of 0 (B5).

### B5 — `influences`/`influenced` reciprocity warning (S)

Depends on B4 for a clean baseline.
**Accept:** rule fires on a synthetic fixture in the lint's own test run;
real corpus reports 0 after cleanup.

### B6 — `assessments` schema + lint gates (M)

Schema per §5.2, rules per §6 (except era-reverify, in B8).
**Accept:** a fixture missing `url` fails; a fixture citing a Wikipedia host
fails; `until < from` fails; an entry with no assessments is silent.

### B7 — Seed assessments for ~20 well-documented languages (L)

Only where criticism literature exists in primary/attributed form: PHP
(era-scoped to ≤ 5), Perl, JavaScript, CoffeeScript, C++, C, Fortran,
MUMPS, ALGOL 68, REXX. Missing entries (`php`, `perl`, `coffeescript`)
need a real entry first — a stub cannot carry an assessment honestly.
**Accept:** ~20 rows, each with a falsifiable source; zero records whose
only citation is satire or folklore — notably the SigBovik paint-splatter
paper, whose technique is real but whose conclusion is the joke. Cite a
grammar spec, RFC, bug tracker, or a named author's written critique.

### B8 — Era-reverify warning (S)

**Accept:** a `weak` record whose `until` is in the past produces exactly
one warning naming the field, and no error.

### B9 — `/standings` derived view (L)

Quadrants per §7 plus the design profile chip row on the language page.
**Accept:** no new stored field; view hides unassessed languages behind a
count rather than a zero; a language can move quadrant only by editing
facts.

## 9. Explicitly not doing

- **A composite 0–100 score.** See D1.
- **Star ratings or reader votes.** Unfalsifiable and unrankable.
- **External ranking numbers as stored facts.** TIOBE/SO ranks are
  time-varying externals; they rot in static frontmatter. Bucket the
  adoption, cite the basis.
- **`purpose` values beyond the five above**, until a real authoring need
  appears.

## 10. Open questions

1. Does `adoption` need `from`/`until` eras, or is a single current bucket
   enough? (Current plan: single bucket, justified by coarse granularity.)
2. Should `assessments` live only on languages, or also on paradigms
   (`object-oriented` has its own criticism literature)? (Current plan:
   languages only; revisit when a paradigm page needs it.)
3. Does the era model need versions rather than years (`until: "5.6"` for
   PHP) to express "before version 7" precisely? Years are the current
   plan; versions are more accurate and harder to lint.
4. `/standings` as its own route, or a sort/filter preset on `/`? The plan
   assumes a route because the quadrant framing is the point, not a list.
