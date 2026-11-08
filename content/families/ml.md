---
title: "ML"
name: "ML"
homepage: "https://smlfamily.github.io/"
references:
  - url: "https://smlfamily.github.io/"
    title: "The Standard ML Family Project — definitions, history, implementations"
  - url: "https://smlfamily.github.io/sml97-defn.pdf"
    title: "The Definition of Standard ML, Revised (SML '97) — Milner, Tofte, Harper, MacQueen (MIT Press)"
  - url: "https://ocaml.org/"
    title: "OCaml — official site"
  - url: "https://fsharp.org/"
    title: "F# Software Foundation"
  - url: "https://www.polyml.org/"
    title: "Poly/ML — Standard ML implementation (David Matthews)"
author: "Robin Milner and the Edinburgh LCF group"
family: "ml"
status: "active"
year: 1973
features:
  - "hindley-milner-inference"
  - "parametric-polymorphism"
  - "algebraic-data-types"
  - "pattern-matching"
  - "module-system"
  - "immutable-by-default"
note: "The family defined by Hindley-Milner inference: polymorphism is inferred rather than annotated, algebraic data types are matched by pattern, and the module system (signatures, structures, functors) abstracts over implementations. Milner's ML at Edinburgh LCF began it; Standard ML, Caml, OCaml, and F# descend from it."
---

## Overview

ML is not a syntax so much as a type discipline. Robin Milner's ML grew out of
the Edinburgh LCF proof assistant, where a metalanguage was needed to write
tactics, and the constraint chosen — fully inferred polymorphic types — became
the family's identity. Member languages differ in syntax, evaluation, and
object system, but they share that checking algorithm.

## Distinctive traits

- Polymorphism is inferred, not written. Hindley-Milner generalization computes
  the most general type, so `let id x = x` is polymorphic without annotations.
- Algebraic data types with pattern matching. A constructor is the introduction
  rule and a `match`/`case` clause is the elimination rule, checked for
  completeness.
- The module system is part of the language. Signatures declare, structures
  implement, and functors are functions from structures to structures.
- Evaluation is eager by default, unlike the lazy branch of the functional
  family; recursion and higher-order functions carry the load instead.
- Immutability is the default and mutation is explicit, which is what makes
  inference and generalization sound in the presence of references.

## Members and what each one changed

Membership means descent from that model. The table covers the principal
branches — the languages that changed something structural. The rest of the
family is implementations that carried one of those branches to a new platform
or a new guarantee, and the page's derived member list is authoritative.

| Language | Lineage | What it changed |
| --- | --- | --- |
| [Standard ML](/languages/standard-ml) | ML (1983 definition, revised 1990 and 1997) | fixed the language and added the signature/structure/functor module system |
| [OCaml](/languages/ocaml) | Caml (INRIA, 1985) → Caml Light → OCaml (1996) | added objects and a full module system while keeping the core inference; Caml's bytecode lineage came from the categorical-abstract-machine work at INRIA |
| [ReasonML](/languages/reasonml) | OCaml syntax | a JavaScript-flavored surface syntax over OCaml, keeping its semantics and types |
| [ReScript](/languages/rescript) | ReasonML, renamed 2020 | dropped OCaml compatibility to compile directly to JavaScript |
| [F#](/languages/fsharp) | OCaml, ported to .NET | added .NET interop, units of measure, and computation expressions (2005) |

Below the branch level the family splits along the axis each project chose to
push: [SML#](/languages/smlsharp) extends record polymorphism toward SQL and C
interoperability, [Alice ML](/languages/alice-ml) adds futures, first-class
packages, and constraint programming, [Manticore](/languages/manticore) adds
parallel tuples and CML-style concurrency, [CakeML](/languages/cakeml) adds a
machine-checked semantics and a verified compiler, and
[HaMLet](/languages/hamlet) adds nothing at all — it is a deliberate reference
translation of the Definition. [Standard ML of New Jersey](/languages/standard-ml-of-new-jersey),
[Poly/ML](/languages/poly-ml), [MLton](/languages/mlton),
[Moscow ML](/languages/moscow-ml), [MLKit](/languages/mlkit),
[MLj](/languages/mlj), and [Yeti](/languages/yeti) are implementations of the
core language, differing in compilation strategy and target rather than in
what the language is.

The pattern is divergence by *host platform or guarantee*: OCaml and Standard ML
vary the module system, Reason and ReScript vary the surface syntax for
JavaScript, and F# varies the runtime. The type-inference core is the part that
does not change.

## Status

Active. OCaml, F# (via .NET), and Standard ML implementations are all in
production use, and the inference algorithm itself is the default expectation
for new statically typed functional languages.

## History

Milner built ML as the metalanguage of Edinburgh LCF in the early 1970s, drawing
on the typed lambda calculus work of Hindley and Milner and on Landin's ISWIM.
The 1983 Standard ML definition fixed a common language; the 1990 definition and
its 1997 revision are the canonical documents, with the module system added by
the 1990s revisions. Caml took the language in a separate direction at INRIA,
and OCaml and F# followed from there.

::note
Read [Standard ML](/languages/standard-ml) for the fixed definition and
[OCaml](/languages/ocaml) for the industrial fork; the difference between them
is mostly what the module system is allowed to do.
::
