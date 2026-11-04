# Exemplars (conforming entries)

Entries whose shape to mirror when authoring. Listed per aspect; none is
100% conforming to every cap yet — check `scripts/lint-body.mjs` output
before trusting one as fully conforming, and prefer the *most recently
approved* entry.

## Code-tour prose (the slot-tagged tour)

- `content/languages/javascript.md` — full four-slot tour as a
  `::code-group` (tabs: primitives → combination → abstraction → idioms),
  all blocks 4–20 lines, with a concluding `::note` callout after the
  group. The shape to mirror for every new prose entry.
- `content/languages/typescript.md` — single-block tour (compressed slots)
  with an `abstraction:` caption; valid when syntax ties slots tightly.

## Fact-rich frontmatter (typed relations)

- `content/languages/zap.md` — typed `relations` edges (`influenced-by`,
  `implemented-in`), full v2 fact coverage, frontmatter-only (valid
  terminal state: a data row, no prose required).

## Titled references

- `content/languages/esterel.md` — `references` with authored titles
  ("Columbia Esterel Compiler", INRIA primary); retrofitted to the
  four-section skeleton with an `idioms`-tabbed code group and a
  concluding callout.

## Note quality (card-ready summaries)

- `content/languages/quint.md` — ≤ 40 words, states essence + tooling hook.
- `content/languages/koru.md` — denser but sourced; slightly over cap
  (historical).

## Research pattern (LLM-assisted → verified)

The entries created Oct 25 2026 (quint, zap, esterel, koru, fai, goose,
lustre, drakon, omega-2, cosmos, linda...) were researched by the assistant
from the project's own primary materials (README, docs, sites) and reviewed
by the owner before commit — the workflow this skill encodes.

When a new entry lands that beats these in shape, update this list to point
at it (keep the list short — 2–4 pointers per aspect, most recent first).
