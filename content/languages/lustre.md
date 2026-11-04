---
title: "Lustre"
name: "Lustre"
homepage: "https://www-verimag.imag.fr/SYNCHRONE/"
urls:
  - "https://en.wikipedia.org/wiki/Lustre_(programming_language)"
  - "https://www-verimag.imag.fr/~halbwach/newbook.pdf"
references:
  - url: "https://www-verimag.imag.fr/SYNCHRONE/"
    title: "Verimag Synchronous languages group (Lustre home)"
  - url: "https://www-verimag.imag.fr/~halbwach/newbook.pdf"
    title: "Synchronous Programming of Reactive Systems (PDF)"
author: "Nicolas Halbwachs et al. (Verimag)"
paradigms:
  - "dataflow"
  - "declarative"
  - "reactive"
  - "synchronous"
influenced:
  - "SCADE"
  - "Lucid Synchrone"
note: "Formally defined synchronous dataflow language for reactive systems developed at Verimag since the early 1980s; core of the SCADE industrial suite used in safety-critical aircraft, helicopter, and nuclear plant control software"
---
## Overview

Lustre is a formally defined, declarative, synchronous dataflow language
for reactive systems, developed at Verimag (Caspi, Halbwachs et al.) since
the early 1980s; a formal presentation appeared in the 1991 Proceedings of
the IEEE. A program is a set of `node` definitions over infinite flows.

## Code

::code-group

```lustre [abstractions]
node counter(clock: bool) returns (t: int);
var n: int;
let
  t = 0 -> pre n;        -- initial 0, thereafter previous output
  n = pre t + 1;         -- pre = previous-cycle value (delay)
tel

node edge(x: bool) returns (e: bool);
let
  e = x -> (x and not pre x);   -- rising-edge detector
tel
```

::

::note
A `node` is the definable unit — pure equations over flows, no assignments;
  `pre` /`->` are the temporal primitives, and synchronous clocking makes every
  node deterministic by construction. Paraphrased from the language's documented
  constructs.
::

## Distinctive traits

- Equations, not statements: a node declares what is true each instant;
  order of equations is semantically irrelevant.
- `pre` and `->` are the only temporal mechanisms — delay and
  initialization — from which counters, registers, and samplers compose.
- Synchronous semantics: all flows advance at logical instants, so
  behavior is deterministic and amenable to formal verification.
- Clock calculus: sub-sampling via `when`/`current` keeps multi-rate
  safe and statically checkable.

## Status

Core language of SCADE (Esterel Technologies, since 1993) used in
safety-critical aircraft, helicopter, and nuclear-plant control software;
academic lineage at Verimag (Grenoble); Lucid Synchrone is a follow-on
research language.
