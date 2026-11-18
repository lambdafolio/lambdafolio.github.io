---
title: "PL/I"
name: "PL/I"
homepage: "https://www.ibm.com/products/pli-compiler-zos"
references:
  - url: "https://web.archive.org/web/2020/http://www.bitsavers.org/pdf/ibm/npl/320-0908_NPL_Technical_Report_Dec64.pdf"
    title: "NPL Technical Report (IBM, December 1964) — the lineage's first definition, archived"
  - url: "https://multicians.org/pl1.html"
    title: "The Choice of PL/I — Multics history (EPL and Version 1/2 PL/I), by McIlroy, Van Vleck, Mills, Freiburghouse et al."
  - url: "https://ecommons.cornell.edu/entities/publication/f394ae58-480a-4814-8ff3-53ebac29a17a"
    title: "Design and Implementation of a Diagnostic Compiler for PL/I — Conway and Wilcox, Cornell (PL/C)"
  - url: "https://www.cs.toronto.edu/XPL/"
    title: "The XPL Programming Language — David Wortman's XPL resource site (a derivative of PL/I)"
  - url: "https://bitsavers.trailing-edge.com/pdf/ibm/360/pls/GC28-6794-0_PLSIIguideMay74.pdf"
    title: "Systems Guide to PL/S II (IBM, May 1974) — GC28-6794-0"
  - url: "https://rsim.cs.uiuc.edu/arch/qual_papers/compilers/auslander82.pdf"
    title: "An Overview of the PL.8 Compiler — Auslander and Hopkins, SIGPLAN '82"
author: "IBM and the SHARE Advanced Language Development Committee (PL/I)"
family: "pl-i"
status: "active"
year: 1964
features:
  - "block-structure"
  - "storage-classes"
  - "subset-dialects"
note: "The family defined by PL/I's declaration model: block structure, explicit storage classes, and a syntax without reserved words, reused as a systems-programming and teaching kernel. EPL, XPL, PL/S, PL/C and PL.8 are all cut down from it rather than designed afresh."
---

## Overview

PL/I is a lineage rather than a single language: one large 1964 design whose
declaration model — block structure, programmer-chosen **storage classes**, and
**subset dialects** carved out for a host constraint — was reused by operating
systems, compiler courses and microcomputer toolchains. Members differ by what
they removed, not by what they added.

## Distinctive traits

- Block structure with nested lexical scope, inherited from
  [ALGOL](/languages/algol), plus `begin` blocks that may carry their own
  declarations and procedures.
- Storage classes state lifetime in the declaration (`static`, `automatic`,
  `controlled`, `based`), so the same syntax serves stack, heap and
  pointer-addressed data.
- No reserved words: keywords are recognised from context, which let the
  language grow without invalidating existing source.
- Declarations describe records and arrays with level numbers and `refer`
  extents, which is what made the dialect route attractive — a subset is a
  restricted declaration vocabulary, not a new grammar.
- Members are overwhelmingly *subsets*: each was cut down to fit a compiler
  budget, a teaching load, or a machine, which is why the family reads as one
  design with several silhouettes.

## Members and what each one changed

| Language | Lineage | What it changed |
| --- | --- | --- |
| [PL/I](/languages/pl-i) | IBM and SHARE, 1964 | — (the reference point) |
| [EPL](/languages/epl) | Multics subset, 1964–66 | a system-programming subset written so the operating system could be built before the full compiler existed |
| [XPL](/languages/xpl) | Stanford derivative, 1967–68 | cut PL/I to a compiler-writing language and shipped a compiler generator with it |
| [PL/S](/languages/pl-s) | IBM internal, late 1960s (as BSL) | a machine-oriented systems dialect that admits assembler statements, used by IBM to build its own program products |
| [PL/C](/languages/pl-c) | Cornell, early 1970s | a teaching dialect whose compiler never failed to translate a program |
| [PL.8](/languages/pl-8) | IBM Research, 1970s | a systems variant, one of the two source languages of IBM Research's optimizing compiler |

The family's centre of gravity is the *declaration*, not the runtime: every
member keeps PL/I's block-and-storage-class vocabulary and drops the parts its
host could not afford.

::note
Membership here is *lineage*, not similarity. [PL/M](/languages/pl-m) and
[REXX](/languages/rexx) are PL/I-influenced but are not cut from it: the Intel
manual calls PL/M "structurally similar to PL/I" without claiming descent, and
Cowlishaw describes REXX control structures as *similar to* PL/I's.
[HAL/S](/languages/hal-s) descends from the original HAL. Read the table as
"what each dialect removed", and [PL/I](/languages/pl-i) itself for the full
language.
::

## Status

Active at the root: PL/I is still compiled for z/OS, and ISO 6160:1979 remains
current, having been reviewed and confirmed in 2024. Of the dialects, PL/S and
PL.8 continued in IBM's internal use long after their 1970s documentation was
written, while EPL, XPL and PL/C are historical.

## History

A SHARE committee and IBM began PL/I in 1963 as an attempted FORTRAN extension;
the NPL Technical Report (December 1964) was its first definition and the first
compiler shipped in 1966. Multics cut EPL from the unfinished language to get an
operating system written, and Stanford cut XPL to teach compiler construction;
IBM's own PL/S, Cornell's PL/C and IBM Research's PL.8 followed the same pattern
of narrowing the language to a purpose.
