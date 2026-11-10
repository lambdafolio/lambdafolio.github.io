---
title: "Pascal"
name: "Pascal"
homepage: "https://www.freepascal.org/"
references:
  - url: "http://pascal.hansotten.com/uploads/books/Pascal_User_Manual_and_Report_Fourth_Edition.pdf"
    title: "Pascal User Manual and Report, 4th edition — Jensen, Wirth, and the ISO 7185 revision (Mickel)"
  - url: "https://dl.acm.org/doi/10.1145/234286.1057812"
    title: "Recollections about the development of Pascal — Niklaus Wirth (HOPL-II, 1993)"
  - url: "https://standardpascal.org/iso7185.pdf"
    title: "ISO 7185:1990 — Programming languages: Pascal (full standard text)"
  - url: "https://standardpascal.org/standards.html"
    title: "ANSI-ISO Pascal standards documents — Wirth's revised 1973 report and ISO 7185"
  - url: "https://web.archive.org/web/20190702192022/http://web.eah-jena.de/~kleine/history/"
    title: "Historic documents in computer science — the 1970 ETH report defining Pascal"
author: "Niklaus Wirth (ETH Zurich)"
kind: "language"
status: "active"
year: 1970
paradigms:
  - "imperative"
  - "modular"
  - "structured"
  - "systems"
family: "algol"
typing: "static"
type_system:
  - "inferred"
  - "nominal"
memory:
  - "manual"
execution:
  - "ahead-of-time"
  - "bytecode"
features:
  - "block-structure"
  - "nested-scope"
  - "records"
  - "sets"
  - "strong-typing"
influences:
  - "ALGOL"
influenced:
  - "Ada"
note: "Wirth's teaching language for structured programming: `if`/`while`/`for`/`repeat` and single-entry control flow, with records, sets and enumerations over ALGOL's block structure. It made disciplined control flow the default and became the standard introductory language of the 1970s and 80s."
---

## Overview

Pascal is an imperative language designed by Niklaus Wirth at ETH Zurich and
published in 1970, intended to teach [structured
programming](/paradigms/structured) — control flow built from `if`, `while`,
`for`, and `repeat` rather than arbitrary jumps. It keeps
[ALGOL](/languages/algol)'s block structure and adds records, sets and
enumerated types.

## Code

::code-group

```pascal [primitives]
program Demo(Output);
{ declarations, then actions; `;` SEPARATES statements }
var
  Sum: Integer;
begin
  Sum := 3 + 5;
  Writeln(Output, Sum, -Sum)   { 8, then -8 }
end.
```

```pascal [combinations]
program ForExample(Input, Output);
{ a for statement over an ordinal range }
var
  I, N: Integer;
  H: Real;
begin
  Read(Input, N);
  H := 0;
  for I := N downto 1 do
    H := H + 1 / I;
  Writeln(Output, H)
end.
```

```pascal [abstractions]
{ records group fields; sets and enumerations are ordinary types }
type
  Colour = (Red, Green, Blue);
  Shape  = record
             Kind: Colour;
             Size: Integer
           end;
var
  S: Shape;
  Set1: set of Colour;
begin
  Set1 := [Red, Blue];
  S.Kind := Green;
  S.Size := 2
end.
```

```pascal [idioms]
{ structured selection: case dispatches on an ordinal value }
case S.Kind of
  Red:   S.Size := 1;
  Green: S.Size := 2;
  Blue:  S.Size := 3
end
```

::

::note
Every block is `begin … end` and the loops and selections used here are
`if`/`while`/`for`/`repeat`/`case`; a `goto` exists in standard Pascal but is the
rare escape hatch, and `;` separates statements rather than terminating them.
::

## Distinctive traits

- Structured control flow is enforced by the grammar: `if`/`while`/`for`/`repeat`
  and `case` cover iteration and selection, so `goto` is a rarely used escape
  hatch rather than the default.
- `begin … end` delimits every compound statement, and declarations must precede
  statements, so a block reads top to bottom — and `var` declarations give each
  block its own nested scope, as in [ALGOL](/languages/algol).
- The type system is nominal, static and strongly typed: `type` declarations
  introduce fresh types, and `record`, `set of`, enumerated and subrange types
  are first-class declarations rather than library constructs.
- The semicolon is a **separator**, not a terminator — the single most common
  beginner error, and a deliberate simplification of ALGOL's grammar.
- Standardized as [ISO 7185](https://standardpascal.org/iso7185.pdf) in 1983,
  with Extended Pascal (ISO 10206) following; the ISO standard added conformant
  array parameters at C. A. R. Hoare's request.
- Programs are compiled, classically to a machine-independent P-code, which is
  what made the language portable across the machines of its era.

## Status

Active in two senses: the specification is fixed by ISO 7185:1990, and the
language continues through [Free Pascal](https://www.freepascal.org/) and
Delphi/Object Pascal, both actively released. Modula-2, also by Wirth, is its
direct successor.

## History

Wirth designed Pascal in 1968–69 and published the defining report at ETH Zurich
in 1970; the first compiler, a recursive-descent parser for the CDC 6000, was
operational in early 1970. The revised report of 1973 by Jensen and Wirth served
as the de facto standard until ISO 7185 in 1983, with a corrected edition in
1990.
