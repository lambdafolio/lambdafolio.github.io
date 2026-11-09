---
title: "FOOPS"
name: "FOOPS"
homepage: "https://cseweb.ucsd.edu/~goguen/sys/foops.html"
references:
  - url: "https://cseweb.ucsd.edu/~goguen/sys/foops.html"
    title: "FOOPS: A Functional Object Oriented Programming System — UCSD primary page"
  - url: "https://cseweb.ucsd.edu/~goguen/ps/foopsman.ps.gz"
    title: "Introducing FOOPS — manual (Rapanotti and Socorro)"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/foops/PRG-113.html"
    title: "Design, implementation and evaluation of a declarative object-oriented programming language (Socorro, PRG-113, Oxford 1993)"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family: OBJ3, BOBJ, CafeOBJ, Maude — UCSD"
author: "Joseph Goguen, with Adolfo Socorro and Paulo Borba (Oxford PRG)"
kind: "language"
status: "historical"
paradigms:
  - "concurrent"
  - "declarative"
  - "generic"
  - "modular"
  - "object-oriented"
  - "specification"
family: "obj"
typing: "static"
type_system:
  - "adt"
execution:
  - "interpreted"
features:
  - "classes"
  - "inheritance"
  - "mixfix-syntax"
  - "parameterized-modules"
  - "refinement"
influences:
  - "OBJ"
note: "Declarative object-oriented language built on OBJ3, giving classes, inheritance with overriding and a module interconnection language one equational semantics. It carried the OBJ module system into the object paradigm and was used to develop the refinement methods that OOZE later reused."
---

## Overview

FOOPS is a declarative object-oriented specification language built on top of
[OBJ](/languages/obj), with an executable subset. It adds classes, attributes,
methods and inheritance with overriding to OBJ's equational core, so that an
object-oriented system still carries a single algebraic semantics.

## Code

::code-group

```text [primitives]
***> an object module declares classes and attributes
omod NAT-LINKABLE is
  class Linkable .
  protecting NAT .
  at value_ : Linkable -> Nat .
  at next_  : Linkable -> Linkable .
endo

eval new.Linkable(SomeLinkable, value_ = 10, next_ = AnotherLinkable) .
```

```text [combinations]
***> attributes are ordinary operators; subclasses order the classes
omod PEOPLE is
  protecting NAT .
  classes Person Teacher Student .
  subclass TeachingAssistant < Teacher Student < Person .
  at age_ : Person -> Nat .
  ats (no-of-children_) (no-of-pets_) : Person -> Nat .
endo
```

```text [abstractions]
***> a method plus its declarative method axioms (DMAs)
omod PAIRS is
  protecting NAT .
  class Pair .
  at fst_ : Pair -> Nat .
  at snd_ : Pair -> Nat .
  me incr-fst : Pair Nat -> Pair .
  vars P : Pair .  var N : Nat .
  ax fst(incr-fst(P, N)) = fst(P) + N .
endo
```

```text [idioms]
***> method expressions compose left to right; eval shows state change
omod SWAP is pr PAIRS .
  me swap : Pair -> Pair .
  var P : Pair .
  ax fst(swap(P)) = snd(P) .
  ax snd(swap(P)) = fst(P) .
endo

eval new.Pair(p2, fst = 0, snd = 1) .
eval swap(p2) .                 ---> should be p2
eval fst(p2) .                 ---> should be 1
```

::

::note
Each `ax` about an attribute is a *declarative method axiom*, not a rewrite rule:
`fst(incr-fst(P,N)) = fst(P) + N` says what an observer sees, and the interpreter
turns the set into one rewrite step. Object creation is itself a method, `new.C`,
which is why `eval` drives everything.
::

## Distinctive traits

- **Classes are declarations, not types**: `class Pair .` and `at fst_ : Pair ->
  Nat .` sit beside OBJ's `sort` and `op`, so functions and attributes parse the
  same way.
- States are updated by *methods*, and a method's effect on each attribute is
  given by a [declarative method
  axiom](https://cseweb.ucsd.edu/~goguen/ps/foopsman.ps.gz) — attributes not
  mentioned are left alone.
- Method expressions compose with `;` and evaluate bottom-up, so
  `incr-fst(P,N1) ; incr-snd(P,N2)` changes two attributes in one expression.
- Inheritance is class ordering (`subclass A < B`) with overriding: a subclass may
  redefine a method it inherits, and stored attributes become *derived* when an
  axiom is given for their value.
- A separate [module interconnection
  language](https://cseweb.ucsd.edu/~goguen/sys/foops.html) composes objects and
  classes, which the primary page calls out as beyond contemporary OO languages.
- [Mixfix syntax](https://cseweb.ucsd.edu/~goguen/ps/foopsman.ps.gz) reaches
  attributes and methods as well as functions, so a method reads `add _ to _`
  rather than `addTo`.

## Status

Historical. FOOPS was implemented at the Oxford University Computing Laboratory
Programming Research Group, documented by *Introducing FOOPS* and Socorro's
PRG-113 monograph (1993). It needs [OBJ](/languages/obj) 2.02 or later and is no
longer maintained; [CafeOBJ](/languages/cafeobj) and [Maude](/languages/maude)
carry the idea forward.

## History

FOOPS grew out of Goguen's move to Oxford in the late 1980s, where Socorro and
Borba built the implementation and its semantics; the manual notes it was the
first object-oriented language to be formally specified. OOZE, an object-oriented
Z environment, was built on top of FOOPS, and Borba's refinement work on the
language fed the refinement literature that followed.
