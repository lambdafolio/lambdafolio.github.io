---
title: "Maude"
name: "Maude"
homepage: "https://maude.cs.illinois.edu/"
references:
  - url: "https://maude.cs.illinois.edu/"
    title: "Maude — official site (Maude team, SRI International / University of Illinois)"
  - url: "https://maude.cs.illinois.edu/overview"
    title: "Maude Overview — reflective language for equational and rewriting logic"
  - url: "https://maude.cs.illinois.edu/manual/maude-manualch1.html"
    title: "Maude Manual 3.5.1, Chapter 1: Introduction (Clavel, Durán, Eker, Escobar, Lincoln, Martí-Oliet, Meseguer, Rubio, Talcott)"
  - url: "https://maude.cs.illinois.edu/manual/maude-manualch5.html"
    title: "Maude Manual, Chapter 5: System Modules, Rewriting and Search"
  - url: "https://maude.cs.illinois.edu/manual/maude-manualch7.html"
    title: "Maude Manual, Chapter 7: Module Operations — theories, views, parameterized modules"
  - url: "https://github.com/maude-lang/Maude"
    title: "Maude interpreter source and releases (maude-lang/Maude), GPL-2.0"
  - url: "https://riuma.uma.es/rest/api/core/bitstreams/4decb55c-d2bf-4e3a-81b0-4385b432153f/content"
    title: "Two Decades of Maude (Martí-Oliet, Palomino, Verdejo) — release history"
author: "José Meseguer et al. (SRI International); maintained by the Maude team"
kind: "language"
status: "active"
year: 1999
paradigms:
  - "concurrent"
  - "declarative"
  - "functional"
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
  - "equational-rewriting"
  - "membership-equations"
  - "mixfix-syntax"
  - "model-checking"
  - "object-oriented-modules"
  - "parameterized-modules"
  - "reflection"
  - "search"
  - "strategies"
influences:
  - "OBJ"
  - "CafeOBJ"
note: "Reflective language and interpreter for rewriting logic, extending OBJ's equational core to concurrent and nondeterministic systems. Programs are rewrite theories; computation, search and LTL model checking are all deduction, which is why it doubles as a language framework."
---

## Overview

Maude is a [declarative](/paradigms/declarative) language and interpreter for
[rewriting logic](https://maude.cs.illinois.edu/rewriting-logic): a program is a
rewrite theory, and computation is deduction in it. It extends the equational
core of [OBJ](/languages/obj) to concurrent and nondeterministic systems while
keeping specification, programming and verification in one notation.

## Code

::code-group

```maude [primitives]
fmod SIMPLE-NAT is
  sort Nat .
  op zero : -> Nat .
  op s_ : Nat -> Nat .
  op _+_ : Nat Nat -> Nat .
  vars N M : Nat .
  eq zero + N = N .
  eq s N + M = s (N + M) .
endfm
red s s zero + s s s zero .    ***> s s s s s zero
```

```maude [combinations]
fmod LIST-CONS{X :: TRIV} is
  sorts NeList{X} List{X} .
  subsort NeList{X} < List{X} .
  op [] : -> List{X} [ctor] .
  op _:_ : X$Elt List{X} -> NeList{X} [ctor] .
  op head : NeList{X} -> X$Elt .
  var E : X$Elt .  var L : List{X} .
  eq head(E : L) = E .
endfm
fmod STRING-LIST is
  protecting LIST-CONS{String} .
endfm
red head("a" : "b" : []) .      ***> "a"
```

```maude [abstractions]
fmod SORTED-LIST-TEST is
  protecting SORTABLE-LIST{Nat<} .
endfm
red sort(4 3 2 1) .    ***> 1 2 3 4
```

```maude [idioms]
mod SIMPLE-VENDING-MACHINE is
  sorts Coin Item Marking .
  subsorts Coin Item < Marking .
  op __ : Marking Marking -> Marking [assoc comm id: null] .
  op null : -> Marking .
  ops $ q : -> Coin .
  ops a c : -> Item .
  rl [buy-c] : $ => c .
  rl [buy-a] : $ => a q .
  rl [change] : q q q q => $ .
endm
search $ q q q =>! a c M:Marking .
```

::

::note
`fmod` is an equational theory; `mod` adds `rl` rules, which are *not* equations
— they rewrite the multiset `Marking` modulo `assoc comm`, so coins and items
match in any order and `search` explores a state space rather than one value.
::

## Distinctive traits

- Two logics in one language: [membership equational
  logic](https://maude.cs.illinois.edu/manual/maude-manualch4.html) types the
  data, rewriting logic on top describes state change.
- Rewriting [modulo axioms](https://maude.cs.illinois.edu/manual/maude-manualch4.html)
  (`assoc`, `comm`, `id:`) gives sets, multisets and lists native matching, with
  no hand-written normalisation.
- `omod` adds classes, inheritance and message syntax, but
  [desugars to system modules](https://maude.cs.illinois.edu/manual/maude-manualch6.html)
  — there is one execution engine underneath.
- [Parameterized programming](https://maude.cs.illinois.edu/manual/maude-manualch7.html)
  by theories and views, inherited from OBJ, with `List{Nat}` sorts checked at
  parse time.
- [Reflection](https://maude.cs.illinois.edu/manual/maude-manualch17.html) is
  built in: modules are terms of `META-LEVEL`, so strategies and tools are
  ordinary Maude code.
- Verification is language-level: `search`, an
  [LTL model checker](https://maude.cs.illinois.edu/manual/maude-manualch12.html),
  and unification with narrowing for symbolic reachability.

## Status

Actively maintained: Maude 3.5.1 shipped in July 2025 under GPL-2.0, with
binaries for Linux and macOS and source at
[maude-lang/Maude](https://github.com/maude-lang/Maude). The
[Maude Formal Environment](https://maude.cs.illinois.edu/tools) adds an
inductive theorem prover plus termination and Church-Rosser checkers.

## History

Maude grew out of rewriting logic, which Meseguer introduced in 1990 by
extending OBJ's order-sorted equational logic with rewrite rules. Development
began at SRI International's Computer Science Laboratory in the early 1990s;
the first public release came at the end of 1999, followed by Maude 2 in 2003
and the Maude 3 line from 2019.
