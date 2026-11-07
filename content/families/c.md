---
title: "C"
name: "C"
homepage: "https://www.open-std.org/jtc1/sc22/wg14/"
references:
  - url: "https://web.archive.org/web/2023/https://www.bell-labs.com/usr/dmr/www/chist.html"
    title: "The Development of the C Language — Dennis M. Ritchie (1993)"
  - url: "https://www.open-std.org/jtc1/sc22/wg14/"
    title: "ISO/IEC JTC1/SC22/WG14 — C standard committee"
  - url: "https://www.stroustrup.com/hopl2.pdf"
    title: "A History of C++: 1979-1991 — Bjarne Stroustrup (HOPL-II, 1993)"
  - url: "https://dlang.org/"
    title: "D Programming Language — official site"
  - url: "http://cyclone.thelanguage.org/"
    title: "Cyclone — safe dialect of C (project site)"
author: "Dennis Ritchie (Bell Labs)"
family: "c"
status: "active"
year: 1972
features:
  - "explicit-memory-management"
  - "value-semantics"
  - "pointer-arithmetic"
  - "static-typing-with-implicit-conversions"
  - "preprocessor"
  - "minimal-runtime"
note: "The family defined by the machine model: values live in memory addressed by pointers, storage is allocated and freed explicitly, and the translation unit plus preprocessor is the compilation contract. Ritchie's C at Bell Labs began it; C++, Objective-C, D, and Cyclone keep that model while adding safety, abstraction, or metaprogramming."
---

## Overview

C's family resemblance is a memory model, not a syntax. A C-family program
thinks in terms of objects with addresses, manual lifetime, and a translation
unit compiled separately through a preprocessor. Members keep that substrate
and add layer upon layer above it — which is why they interoperate so easily
and why their safety stories differ so sharply.

## Distinctive traits

- Pointers are values and arithmetic on them is defined. Addressable memory is
  the abstraction the language is built on, not a hidden implementation detail.
- Storage duration is explicit. Automatic, static, and allocated lifetimes are
  the programmer's decision; there is no collector in the base language.
- Value semantics by default. Assignment copies, and references are opt-in via
  pointers or (in descendants) reference types.
- The translation unit is the compilation boundary, with a textual preprocessor
  in front of it. Header inclusion and conditional compilation are part of the
  programming model, not tooling.
- A minimal runtime: no required garbage collector, no reflection, no runtime
  type information — which is what makes the family usable for kernels and
  embedded targets.

## Members and what each one changed

| Language | Lineage | What it changed |
| --- | --- | --- |
| [C](/languages/c) | K&R C (1972), ANSI C89, C99, C11, C17, C23 | — (the reference point) |
| [C++](/languages/cplusplus) | C with classes (1979), standardized 1998 | classes, templates, exceptions, RAII, and references — while keeping C's memory model and value semantics |
| [D](/languages/d) | C++-influenced redesign (2001) | garbage collection as an option, slices, compile-time function evaluation, and a module system replacing headers |
| [Cyclone](/languages/cyclone) | a dialect of C (2001) | region-based memory management and type qualifiers for pointer safety, keeping C syntax |

The shared move is *retrofitting safety onto an unsafe substrate*: Cyclone adds
regions, D adds slices and optional GC, C++ adds RAII and templates. All of them
still compile to the same calling convention, which is what makes a C header a
working interface between members.

## Status

Active and foundational. C is the ABI that other languages bind to, and C++ and
D remain in wide production use; Cyclone is dormant but historically
significant as the safe-dialect experiment.

## History

Ritchie developed C at Bell Labs around 1972 to rewrite the Unix kernel, based
on Thompson's B and on the typeless-then-typed transition described in his 1993
retrospective. Kernighan and Ritchie's 1978 book defined the de facto language;
ANSI standardized it in 1989 and ISO adopted it in 1990. Stroustrup began C
with classes in 1979 and documented the path to C++ in his HOPL-II paper. D
arrived in 2001, and Cyclone was developed at AT&T and Cornell in the same
period.

::note
Read [C++](/languages/cplusplus) for the abstraction route and
[Cyclone](/languages/cyclone) for the safety route; membership means keeping the
pointer-and-lifetime model, not keeping the syntax unsafened.
::
