---
title: "ALGOL"
name: "ALGOL"
homepage: "https://www.masswerk.at/algol60/report.htm"
references:
  - url: "https://www.masswerk.at/algol60/report.htm"
    title: "Revised Report on the Algorithmic Language ALGOL 60 — Naur et al. (1963), full text"
  - url: "https://www.masswerk.at/algol60/modified_report.htm"
    title: "Modified Report on the Algorithmic Language ALGOL 60 (1976)"
  - url: "https://www.masswerk.at/algol60/algol60-sample.htm"
    title: "ALGOL 60 — sample implementation and examples"
  - url: "https://www.iso.org/standard/6126.html"
    title: "ISO 1538:1984 — Programming languages: ALGOL 60 (revision of ISO/R 1538)"
author: "ALGOL 58/60 committees (ACM/GAMM), edited by Peter Naur"
kind: "language"
status: "historical"
year: 1958
paradigms:
  - "imperative"
  - "modular"
  - "structured"
family: "algol"
typing: "static"
type_system:
  - "nominal"
memory:
  - "manual"
execution:
  - "ahead-of-time"
features:
  - "block-structure"
  - "nested-scope"
  - "bnf-specified-syntax"
  - "call-by-name"
  - "recursive-procedures"
influenced:
  - "Pascal"
  - "SIMULA"
  - "Ada"
note: "The language that fixed the shape of the imperative language: block structure, nested lexical scope, typed declarations, recursive procedures, and the first syntax specified in BNF. Call-by-name and `own` variables were its distinctive risks; every later block-structured language descends from it."
---

## Overview

ALGOL is the algorithmic language defined by an international committee in 1958
and revised through 1960, reported by Peter Naur. It established
[structured](/paradigms/structured), block-based imperative programming and was
the first language whose syntax was specified in
[BNF](https://www.masswerk.at/algol60/report.htm), making a language definition a
reproducible artifact.

## Code

::code-group

```text [primitives]
begin
  integer p, q;
  real s;
  p := 7; q := 3;
  s := p / q;    comment real division, 2.333;
  p := p ÷ q;    comment integer division, 2;
  s := 2 ↑ 8;    comment exponentiation, 256;
  if p > q then s := 1 else s := 0
end
```

```text [combinations]
begin
  integer i;
  array A [1:10];
  for i := 1 step 1 until 10 do
    A[i] := i × i;
  comment a for list may mix bare values and step/until elements;
  for i := 1, 100 step 10 until 490 do
    A[1] := A[1] + 1
end
```

```text [abstractions]
procedure Absmax (a) Size: (n, m) Result: (y) Subscripts: (i, k);
  comment absolute greatest element of matrix a, n by m;
  array a; integer n, m, i, k; real y;
begin
  integer p, q;
  y := 0;
  for p := 1 step 1 until n do
    for q := 1 step 1 until m do
      if abs(a[p, q]) > y then
        begin y := abs(a[p, q]); i := p; k := q end
end Absmax
```

```text [idioms]
begin
  comment blocks nest and introduce a new scope;
  integer i, k; real w;
  for i := 1 step 1 until m do
    for k := i + 1 step 1 until m do
      begin w := A[i, k];
            A[i, k] := A[k, i];
            A[k, i] := w
      end
end
```

::

::note
`begin … end` brackets a compound statement; with declarations it becomes a
**block**, and its identifiers are local. Note `÷` for integer division and `↑`
for exponentiation — and that a `comment` runs to the next semicolon, not the line.
::

## Distinctive traits

- [Block structure with nested lexical scope](https://www.masswerk.at/algol60/report.htm):
  a block automatically introduces a new level of nomenclature, and a name
  undeclared inside refers to the enclosing level.
- The grammar itself was defined in **BNF**, introduced for ALGOL 60 — the first
  language whose specification and parser were the same document.
- **Call by name** replaces the formal parameter with the actual parameter text
  throughout the body, which is expressive but makes evaluation order observable.
- `own` variables keep their value across block re-entry, while ordinary locals are
  undefined on entry.
- Types are `integer`, `real` and `Boolean`, with `array` bounds as runtime
  expressions and automatic `entier` transfer from real to integer.
- Control flow includes `goto` alongside `if`/`else` and the `for` statement — the
  structured forms are present, but jumps are not yet excluded.

## Status

Historical. ALGOL 60 had no single dominant implementation, but ISO standardized
it: ISO/R 1538 (1972, withdrawn 1977) and the revised
[ISO 1538:1984](https://www.iso.org/standard/6126.html). It survives through its
descendants and as a specification artifact, with the Revised Report still the
readable definition.

## History

Two reports preceded the 1960 language: the 1958 Zürich *preliminary report* on the
International Algebraic Language, and the 1959 report edited by Perlis and
Samuelson. Thirteen delegates met in Paris in January 1960 and adopted Naur's
draft as the basis; the *Revised Report* followed in 1963 and a *Modified Report*
in 1976. ALGOL 60 was never commercially dominant, but its ideas reached
[Pascal](/languages/pascal), [SIMULA](/languages/simula) and
[Ada](/languages/ada) directly.
