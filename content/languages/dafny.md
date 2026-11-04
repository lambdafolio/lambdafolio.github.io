---
title: "Dafny"
name: "Dafny"
homepage: "https://dafny.org/"
references:
  - url: "https://dafny.org/"
    title: "Dafny official site (reference manual + tutorials)"
  - url: "https://dafny.org/latest/DafnyRef/DafnyRef"
    title: "Dafny Reference Manual — official"
author: "K. Rustan M. Leino"
paradigms:
  - "functional"
  - "imperative"
execution:
  - "transpiled"
note: "Verification-aware programming language with a static program verifier; compiles to C#, Java, JavaScript, Go, and Python"
---
## Overview

Dafny is a verification-aware language by K. Rustan M. Leino: imperative
and functional constructs in one surface, with machine-checked
pre/postconditions (`requires`/`ensures`) proved by a static verifier
before codegen to C#, Java, JavaScript, Go, or Python.

## Code

::code-group

```dafny [abstractions]
method Abs(x: int) returns (y: int)
  ensures 0 <= y && (x < 0 ==> y == -x)  // proof obligations, not comments
{
  y := if x < 0 then -x else x;
}

function Max(a: int, b: int): int       // ghost/spec function by default
{
  if a < b then b else a
}

ghost var threshold := Max(10, 20);     // spec-only state, erased at run

predicate Sorted(s: seq<int>) {         // contracts compose over seqs
  forall i :: 0 <= i < |s| - 1 ==> s[i] <= s[i + 1]
}
```

::

::note
Methods + specs are the definable units — `requires` /`ensures`/`predicate`
  describe behavior the SMT verifier consumes; `ghost` values participate in
  proofs but not execution.
::

## Distinctive traits

- Specifications are first-class: `requires`, `ensures`, `invariant`, and
  `decreases` clauses are typed, checked, and reusable.
- Ghost layer: `ghost var`, `lemma`, and spec `function`s build proof
  surfaces that compile away — verified code stays performant.
- The Boogie/Z3 stack discharges obligations automatically; `assume`,
  `assert`, and `calc` shape the proof interactively.
- Seqs/sets/arrays (immutable vs mutable) are the combination layer, with
  `forall`/`exists` quantifiers over them.

## Status

Actively developed at dafny.org (open, Microsoft Research lineage) with
the Boogie/Z3 stack; the reference manual and standard libraries are
official; used in teaching and industry verification projects.
