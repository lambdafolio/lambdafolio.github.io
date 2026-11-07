---
title: "ALGOL"
name: "ALGOL"
homepage: "https://www.masswerk.at/algol60/report.htm"
references:
  - url: "https://www.masswerk.at/algol60/report.htm"
    title: "Revised Report on the Algorithmic Language ALGOL 60 — Naur et al. (1963)"
  - url: "https://www.ethw.org/Milestones:ALGOL_58" 
    title: "Milestone: ALGOL 58 (IEEE Engineering and Technology History Wiki)"
  - url: "https://www.ethw.org/Milestones:Object-Oriented_Programming,_1961-1967"
    title: "Milestone: Object-Oriented Programming, 1961-1967 — SIMULA (IEEE ETHW)"
  - url: "https://www.open-std.org/jtc1/sc22/wg9/"
    title: "ISO/IEC JTC1/SC22/WG9 — Ada standard committee"
  - url: "https://www.freepascal.org/"
    title: "Free Pascal — open-source Pascal compiler"
author: "ALGOL 58/60 committees (ACM/GAMM), with Niklaus Wirth on ALGOL 60"
family: "algol"
status: "active"
year: 1958
features:
  - "block-structure"
  - "nested-scope"
  - "typed-declarations"
  - "structured-control-flow"
  - "recursive-procedures"
  - "bnf-specified-syntax"
note: "The family defined by block structure: names are declared in nested scopes, control flow is structured rather than arbitrary jumps, procedures recurse, and the syntax was specified in BNF for the first time. ALGOL 58 and ALGOL 60 began it; Pascal, ADA, and SIMULA carry the block-and-declaration model forward."
---

## Overview

ALGOL is where the shape of a modern imperative language was decided. Block
structure, nested scope, typed declarations, and recursive procedures were
formalized in ALGOL 60, and its BNF grammar made language specification a
reproducible artifact. Members keep that scaffolding while changing what lives
inside the blocks.

## Distinctive traits

- Block structure with nested scope. Declarations are local to a block, and
  scope is lexical and nestable — the feature the family inherits most directly.
- Structured control flow. Compound statements, `if`/`else`, `for`, and
  `while` replaced ad-hoc jumps as the primary form, later formalized as
  structured programming.
- Declarations precede use, with static types fixed at compile time. The
  procedural body is a block, not a file.
- Recursion is supported as a first-class technique, which was a research
  claim in 1960 and is now assumed everywhere.
- The syntax is defined by a formal grammar (BNF, introduced for ALGOL 60), so
  the specification and the parser are the same document.

## Members and what each one changed

| Language | Lineage | What it changed |
| --- | --- | --- |
| [ALGOL](/languages/algol) | ALGOL 58 (1958) and ALGOL 60 (1960) | — (the reference point) |
| [SIMULA](/languages/simula) | ALGOL 60 with simulation primitives (1962–67) | added classes, subclasses, and coroutines for discrete-event simulation — the origin of object orientation |
| [Pascal](/languages/pascal) | ALGOL-W (Wirth, 1966), then Pascal (1970) | simplified the language for teaching, added records and enumerated types |
| [Delphi](/languages/delphi) | Pascal (Borland, 1995) | components and a visual designer over an object Pascal dialect |
| [Ada](/languages/ada) | a redesigned ALGOL-family language (1980, 1983 standard) | packages, generics, exceptions, and strong typing for embedded and safety-critical systems |

The family's most consequential branch is SIMULA, where blocks grew classes:
object orientation inherits from this lineage, which is why Smalltalk and
SIMULA are both object-oriented without being in the same family.

## Status

Historical at the root, active in its descendants. ALGOL 60 is retired as a
practical language but its structure is universal; Ada is standardized and in
safety-critical use, Pascal and Delphi remain in production, and SIMULA's ideas
are embedded in every object system.

## History

ALGOL 58 was a joint ACM/GAMM design; the revised ALGOL 60 report (Naur et al.,
1963) fixed block structure and BNF and became the model for language
specification. Wirth left the committee over disagreements about complexity,
produced ALGOL-W, and then Pascal in 1970. Dahl and Nygaard's SIMULA added
classes by 1967. Ada was developed from 1977 under a Department of Defense
requirement and standardized as MIL-STD-1815 in 1980, then as ISO 8652 in 1987.

::note
Read [Pascal](/languages/pascal) for the teaching simplification and
[SIMULA](/languages/simula) for the branch that turned blocks into classes;
both are in this family, and only the second is also in the object-oriented
paradigm's ancestry.
::
