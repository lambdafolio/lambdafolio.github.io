---
title: "OBJ"
name: "OBJ"
homepage: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
references:
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family (OBJ3, BOBJ, CafeOBJ, Maude) — UCSD primary page"
  - url: "https://cseweb.ucsd.edu/~goguen/pps/iobj.ps"
    title: "Introducing OBJ — official OBJ3 manual (Goguen, Winkler, Meseguer, Futatsugi, Jouannaud)"
  - url: "https://link.springer.com/chapter/10.1007/3-540-19242-5_22"
    title: "An Introduction to OBJ 3 (Goguen, Kirchner, Kirchner, Mégrelis, Meseguer, Winkler, 1988)"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/map.html"
    title: "Proving a Property of Map in OBJ3 — parameterized module and view examples"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/eg1.html"
    title: "Algebraic semantics of a simple imperative language in OBJ3 — reduction proofs"
  - url: "https://web.archive.org/web/20070626112950/http://www.kindsoftware.com/products/opensource/OBJ3/faq.html"
    title: "OBJ3 FAQ (KindSoftware, archived 2007)"
author: "Joseph Goguen (UCSD), with José Meseguer et al."
kind: "language"
status: "dormant"
year: 1976
paradigms:
  - "declarative"
  - "functional"
  - "generic"
  - "logic"
  - "modular"
  - "specification"
family: "obj"
typing: "static"
type_system:
  - "adt"
execution:
  - "interpreted"
features:
  - "equational-rewriting"
  - "mixfix-syntax"
  - "parameterized-modules"
  - "subsorting"
  - "theorem-proving"
  - "views"
influences:
  - "Clear"
influenced:
  - "Ada"
  - "BOBJ"
  - "C++"
  - "CafeOBJ"
  - "Eqlog"
  - "FOOPS"
  - "LOTOS"
  - "Maude"
  - "Standard ML"
note: "Family of algebraic specification languages on order-sorted equational logic: programs are equational theories, computation is rewriting. OBJ pioneered parameterized programming and influenced Ada, ML and C++ modules; Maude and CafeOBJ continue the line."
---

## Overview

OBJ is a family of algebraic [specification](/paradigms/specification) languages
built on [order-sorted equational
logic](https://cseweb.ucsd.edu/~goguen/sys/obj.html), designed by Joseph Goguen
at UCSD from 1976. An OBJ program is an equational theory and every computation
is a proof, which makes the language executable and amenable to [mechanised
verification](https://cseweb.ucsd.edu/~goguen/pubs/asbk.html).

## Code

::code-group

```obj [primitives]
obj NAT is
  sort Nat .
  op 0 : -> Nat .
  op s_ : Nat -> Nat .
  op _+_ : Nat Nat -> Nat [assoc comm] .
  vars M N : Nat .
  eq M + 0 = M .
  eq M + s N = s(M + N) .
endo

red (s s 0) + (s 0) .        ***> s s s 0
```

```obj [combinations]
obj LIST[E :: TRIV] is
  sorts List NeList .
  subsort NeList < List .
  op nil : -> List .
  op cons : Elt List -> NeList .
  op car_ : NeList -> Elt .
  op cdr_ : NeList -> List .
  var E : Elt .
  var L : List .
  eq car cons(E,L) = E .
  eq cdr cons(E,L) = L .
endo
```

```obj [abstractions]
view NAT-TRIV from TRIV to NAT is
  sort Elt to Nat .
endv

obj NATLIST is pr LIST[NAT-TRIV] .
  op one : -> NeList .
  eq one = cons(s 0, nil) .
endo

red car one .        ***> s 0
red cdr one .        ***> nil
```

```obj [idioms]
openr NAT .
  ops a b c : -> Nat .
  eq a = s s 0 .
  eq b = s s s 0 .
  eq c = s s s s s 0 .
  red a + b == c .       ***> true
close
```

::

::note
`obj … endo` declares sorts, mixfix operators and equations; a `view` discharges
a parameter theory, so `LIST[NAT-TRIV]` is instantiation by proof obligation;
`red` and `openr` turn those same equations into a rewriting engine. There is no
control flow anywhere: computation is equational deduction.
::

## Distinctive traits

- Order-sorted [subsorting](https://cseweb.ucsd.edu/~goguen/sys/obj.html) is a
  partial order on sorts, so multiple inheritance, overloading and coercions
  need no special rules.
- Equations are the only control structure: a
  [reduction](https://cseweb.ucsd.edu/~goguen/sys/eg1.html) is a proof, so
  theorem proving and execution are the same act.
- Parameterized programming debuted here: modules take theories as parameters,
  [views](https://cseweb.ucsd.edu/~goguen/pps/iobj.ps) discharge them;
  [Ada](/languages/ada), [Standard ML](/languages/standard-ml) and
  [C++](/languages/cplusplus) module systems followed.
- User-definable [mixfix syntax](https://cseweb.ucsd.edu/~goguen/pps/iobj.ps)
  makes `if_then_else_fi` and `_+_` ordinary operators with declared precedence.
- Rewriting modulo associativity, commutativity and identity is built in, so
  sets and lists need no hand-written normalisation.

## Status

OBJ3 is the canonical implementation: it runs under Common Lisp and was
re-released as 2.06 (2000) under a BSD-like licence by KindSoftware, and is
[no longer under active
development](https://web.archive.org/web/20070626112950/http://www.kindsoftware.com/products/opensource/OBJ3/faq.html).
[Maude](/languages/maude) and [CafeOBJ](/languages/cafeobj) continue the design.

## History

The first implementation of initial algebra semantics by term rewriting appeared
in OBJ in the mid-1970s; the characteristic syntax appeared in Goguen's 1977
paper. OBJ2 (1985) added [Clear](/languages/clear)-style parameterized modules,
and OBJ3 (1988) rebuilt the operational semantics on order-sorted rewriting.
[BOBJ](/languages/bobj), CafeOBJ and Maude followed, enriching the logic.
