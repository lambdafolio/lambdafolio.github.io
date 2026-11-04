# Exemplars (conforming paradigm entries)

Entries whose shape to mirror when authoring a paradigm page. None is
necessarily 100% conforming to every cap — check `scripts/lint-body.mjs`
output before trusting one, and prefer the *most recently approved* entry.

## The starting state: stubs

Every `PARADIGMS` vocabulary value has a stub page, created by
`scripts/scaffold-paradigms.mjs`:

```md
---
title: "Functional"
name: "Functional"
paradigm: "functional"
---
TODO: Write the wiki article for **Functional**.
```

A stub is a **valid terminal state** — the frontmatter lint warns only, the
body lint is exempt, and the page renders as a data row with its derived
member list. Curating a paradigm replaces the TODO body with the four-section
skeleton; nothing else about the file has to change.

## What a curated paradigm page looks like

No paradigm page has been curated yet — this file records the target shape
so the first one has a reference. Mirror
[`content/languages/javascript.md`](../../../../content/languages/javascript.md)
for the mechanical shape (it is the fully conforming tour exemplar) and read
the difference in *content*:

| aspect | language entry | paradigm entry |
| --- | --- | --- |
| `features` | long tail of nice-to-haves | the **defining characteristics** — this is the definition |
| `year` | first release of the language | the paradigm's **origin** (paper/publication) |
| `author` | the language's designers | the paradigm's **originator(s)** |
| `Code` tour | the language's syntax | the paradigm's **defining mechanism** applied to a problem |
| members | n/a | **derived**, never written |

## Where the demonstration code comes from

Prefer a language whose entry is already curated and whose `paradigms:`
array lists the paradigm in question. Candidates in the current corpus:

| paradigm | canonical language in the corpus | its slug |
| --- | --- | --- |
| functional | Standard ML / OCaml / F# / Clojure / Elm | `standard-ml`, `ocaml`, `fsharp`, `clojure`, `elm` |
| object-oriented | SIMULA / Eiffel / Self / Ceylon | `simula`, `eiffel`, `self`, `ceylon` |
| logic | Cosmos | `cosmos` |
| declarative | Quint | `quint` |
| relational | Morel | `morel` |
| reactive / synchronous | Esterel / Lustre | `esterel`, `lustre` |
| dataflow | Lustre | `lustre` |
| data-parallel / array | Futhark | `futhark` |
| effect | Fai / Koru | `fai`, `koru` |
| visual | DRAKON | `drakon` |
| agent-based | AgentScript | `agentscript` |
| systems | Goose | `goose` |
| pattern-oriented | Pi | `pi` |
| query | Zed | `zed` |
| continuation | Koru | `koru` |
| specification | Quint | `quint` |

Paradigms with **no** canonical language in the corpus (concatenative,
aspect-oriented, stack-based, probabilistic, structural, imperative,
concurrent, parallel, generic, modular, domain-specific) need the
demonstration-language rule from the contract: use a language that exists
and genuinely exhibits the paradigm, and say which one in the callout — or
demonstrate the paradigm's shape in its domain notation.

## Checklist shape (the closing summary)

A conforming paradigm entry's closing summary names:

- the fields written and the fields deliberately left blank,
- the sources used (one line per source family: canonical paper, manual,
  standards document) with URLs,
- which corpus language the demonstration uses, and why that one,
- lint results for both gates,
- anything flagged for human review.

Keep the list short when a new entry lands that beats it in shape; two to
four pointers per aspect, most recent first.
