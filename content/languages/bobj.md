---
title: "BOBJ"
name: "BOBJ"
homepage: "https://cseweb.ucsd.edu/groups/tatami/bobj/"
references:
  - url: "https://cseweb.ucsd.edu/groups/tatami/bobj/"
    title: "Fun with BOBJ — official BOBJ home page (UCSD Tatami project)"
  - url: "https://cseweb.ucsd.edu/groups/tatami/bobj/vend.html"
    title: "Some Simple Vending Machines — BOBJ behavioural specification and proofs"
  - url: "https://cseweb.ucsd.edu/groups/tatami/bobj/set.html"
    title: "Sets Are Behavioral — BOBJ cobasis and circular coinductive rewriting"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family: OBJ3, BOBJ, CafeOBJ, Maude — UCSD"
  - url: "https://cseweb.ucsd.edu/users/goguen/projs/halg.html"
    title: "Hidden Algebra — Goguen's project page (the theory BOBJ implements)"
author: "Joseph Goguen and Kai Lin (UCSD Tatami project)"
kind: "language"
status: "dormant"
paradigms:
  - "concurrent"
  - "declarative"
  - "generic"
  - "logic"
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
  - "behavioral-specification"
  - "circular-coinduction"
  - "cobasis"
  - "hidden-sorts"
  - "mixfix-syntax"
  - "parameterized-modules"
influences:
  - "OBJ"
note: "Java reimplementation of OBJ3 adding hidden algebra: behavioural theories, auto-generated cobases and circular coinductive rewriting. It is the family member built specifically to prove that two specifications are observationally equal, and the only one with higher-order parameterized programming."
---

## Overview

BOBJ is UCSD's Java reimplementation of [OBJ](/languages/obj), extending it with
behavioural specification and [circular coinductive
rewriting](https://cseweb.ucsd.edu/groups/tatami/bobj/). Where OBJ3 proves
equalities by rewriting, BOBJ proves them by observation: two hidden-sorted terms
are equal when every observer agrees.

## Code

::code-group

```text [primitives]
***> behavioural set theory: the observer is _in_
bth SET is
  sort Set .
  pr NAT .
  op empty : -> Set .
  op _in_ : Nat Set -> Bool .
  var N : Nat .
  eq N in empty = false .
end
```

```text [combinations]
***> the usual operations, defined observationally
bth SETH is pr SET .
  op ins : Nat Set -> Set .
  op _U_ : Set Set -> Set .
  op _&_ : Set Set -> Set .
  vars M N : Nat .  vars S S' S'' : Set .
  eq M in ins(N, S) = eq(M,N) or M in S .
  eq M in S U S'    = M in S or M in S' .
  eq M in S & S'    = M in S and M in S' .
end
```

```text [abstractions]
***> a behavioural theory is instantiated like any OBJ module
bth INFS is pr SETH .
  ops nats evens odds : -> Set .
  var N : Nat .
  eq N in nats = true .
  eq 0 in evens = true .
  eq s 0 in evens = false .
  eq s s N in evens = N in evens .
  eq N in odds = not N in evens .
end
```

```text [idioms]
***> red is ordinary rewriting; cred adds circular coinduction
set cobasis of SET .
open .
  op S : -> Set .
  cred nats & S == S .            ***> true
  cred evens & odds == empty .    ***> true
  cred evens U odds == nats .     ***> true
close
```

::

::note
The same equation is `false` under `red` and `true` under `cred`: rewriting can
only see the terms, while coinduction sees the cobasis — here the single observer
`_in_`. That gap is exactly the difference between initial and behavioural
semantics, and proving it closed is what BOBJ exists to do.
::

## Distinctive traits

- Behavioural theories (`bth`) give hidden sorts a semantics from their
  observers, so infinite objects such as sets and streams need no axiom of
  extensionality.
- The [cobasis](https://cseweb.ucsd.edu/groups/tatami/bobj/set.html) is computed
  automatically from the theory's congruence structure; `set cobasis` selects
  one explicitly when the default is too large.
- `cred` combines behavioural rewriting with
  [circular coinduction](https://cseweb.ucsd.edu/groups/tatami/bobj/), and `cases`
  adds case analysis so proofs split on conditions such as `N = 0` or `N > 0`.
- [Higher-order parameterized programming](https://cseweb.ucsd.edu/groups/tatami/bobj/)
  allows modules parameterized by modules and instantiated with morphisms — BOBJ
  was the first language to implement it.
- Concurrent connection `M1 || M2` composes systems by tupling their principal
  sorts, with `ncong` marking the projection operators that are non-congruent.
- Written in pure Java, so it runs where OBJ3's Common Lisp does not, and it uses
  JavaCC for a more flexible term syntax than OBJ3's.

## Status

Dormant. Development centred on the UCSD Tatami project, with the last
distributed builds reporting version 0.9.x (2002); sources are available from
the [BOBJ site](https://cseweb.ucsd.edu/groups/tatami/bobj/) and its FTP archive.
[Maude](/languages/maude) and [CafeOBJ](/languages/cafeobj) are the actively
maintained descendants.

## History

BOBJ extends OBJ3 with the hidden algebra that Goguen, Rosu and Lin developed
through the late 1990s; the circular coinductive rewriting algorithm was
published at ASE 2000. The implementation is credited entirely to Kai Lin.
