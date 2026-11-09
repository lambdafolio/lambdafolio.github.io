---
title: "Eqlog"
name: "Eqlog"
homepage: "https://cseweb.ucsd.edu/~goguen/sys/eqlog.html"
references:
  - url: "https://cseweb.ucsd.edu/~goguen/sys/eqlog.html"
    title: "Eqlog: An Equational Logic Programming Language — UCSD primary page"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/eqlog/channel.html"
    title: "Specification of a Communication Channel in Eqlog — worked example"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/eqlog/syncom.html"
    title: "Specification of Synchronous Communication in Eqlog — worked example"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family: OBJ3, BOBJ, CafeOBJ, Maude — UCSD"
  - url: "https://link.springer.com/content/pdf/10.1007/BFb0014969"
    title: "Models and Equality for Logical Programming (Goguen and Meseguer) — Eqlog semantics"
author: "Joseph Goguen and José Meseguer"
kind: "language"
status: "historical"
paradigms:
  - "declarative"
  - "generic"
  - "logic"
  - "modular"
  - "query"
  - "specification"
family: "obj"
typing: "static"
type_system:
  - "adt"
execution:
  - "interpreted"
features:
  - "constraint-logic-programming"
  - "narrowing"
  - "order-sorted-unification"
  - "parameterized-modules"
  - "retracts"
  - "theories-and-views"
influences:
  - "OBJ"
note: "OBJ3 enriched with order-sorted unification and backtracking, so an equality becomes a constraint to solve rather than a rewrite rule. Default execution is order-sorted narrowing; retracts give it the flexibility of an untyped language without giving up strong typing."
---

## Overview

Eqlog is an equational logic programming language: it combines constraint logic
programming with [equational programming](/paradigms/logic) by enriching
[OBJ](/languages/obj) with order-sorted unification and backtracking. Its default
operational semantics is [order-sorted
narrowing](https://cseweb.ucsd.edu/~goguen/sys/eqlog.html), so a query is answered
by finding substitutions rather than by reducing to a normal form.

## Code

::code-group

```text [primitives]
***> a theory of labelled transition systems with an idle transition
th OBJECT is
  sort Action .
  op skip : -> Action .
  sort State .
  op _--[_]->_ : State Action State -> Bool .
  var S : State .
  eq S --[skip]-> S = true .
endth
```

```text [combinations]
obj NATLIST is pr PNAT .
  sort NatList .
  op [ _ ] : Nat -> NatList .
  op _++_ : NatList NatList -> NatList [assoc] .
  op empty : -> NatList .
  var L : NatList .
  eq L ++ empty = L .
endo
```

```text [abstractions]
***> an object whose states are pairs of registers
obj AOBJ is
  pr PNAT .
  sort Action .
  op askip : -> Action .
  op inc   : -> Action .
  op write : -> Action .
  sort State .
  op A[_,_] : Nat Nat -> State .
  op _--A[_]->_ : State Action State -> Bool .
  vars M N : Nat .
  eq A[M,N] --A[askip]-> A[M,N]   = true .
  eq A[M,N] --A[ inc ]-> A[s(M),N] = true .
  eq A[M,N] --A[write]-> A[M,M]   = true .
endo
```

```text [idioms]
***> the payoff: a query with logical variables, answered by narrowing
find S1, S2 : State such that S1 --[skip]-> S2 = true .

view AP from AOBJ to PORT-OBJ is
  op askip to pskip .
  op inc   to pskip .
  op write to port .
endv
```

::

::note
`find … such that` is the idiom that separates Eqlog from [OBJ](/languages/obj):
searching for a substitution replaces reduction as the execution model.
`view … endv` is inherited unchanged from the family's module system, which is
why Eqlog can compose objects as ordinary parameterized modules.
::

## Distinctive traits

- [Order-sorted narrowing](https://cseweb.ucsd.edu/~goguen/sys/eqlog.html) is
  the default strategy, combining rewriting with unification so that partially
  instantiated terms can still be evaluated.
- Built-in solvers for equality, disequality and numeric orderings run instead of
  narrowing wherever a closed form applies, keeping the general mechanism
  efficient on its common cases.
- **Retracts** give a rigorous form of runtime type checking, which buys the
  syntactic flexibility of an untyped language while keeping strong typing.
- Theories and views are inherited from [OBJ](/languages/obj), so modules are
  parameterized by specification rather than by type.
- Evaluating a module expression builds a system, so composition is part of the
  language rather than a linking step.
- The semantics is initiality in Horn-clause logic with equality, which unifies
  functional and logic programming under one model.

## Status

Historical. Eqlog was developed in Oxford by Răzvan Diaconescu during the
mid-1980s and is documented through the UCSD pages and worked examples; no
current distribution is maintained. Its ideas survive in the narrowing and
unification machinery of [Maude](/languages/maude).

## History

Goguen and Meseguer proposed Eqlog around 1985 as OBJ3 plus order-sorted
unification, and presented it through 1986. Diaconescu implemented it at Oxford
and completed its categorical semantics as a doctoral thesis; the language
remained a research vehicle for constraint equational programming rather than a
released product.
