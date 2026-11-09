---
title: "OBJ"
name: "OBJ"
homepage: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
references:
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family: OBJ3, BOBJ, CafeOBJ, Maude, Kumo, FOOPS, Eqlog — UCSD"
  - url: "https://cseweb.ucsd.edu/~goguen/pps/iobj.ps"
    title: "Introducing OBJ — official OBJ3 manual (Goguen, Winkler, Meseguer, Futatsugi, Jouannaud)"
  - url: "https://cseweb.ucsd.edu/~goguen/projs/cafepr.html"
    title: "CafeOBJ Project Press Release, 22 April 1997 — UCSD"
  - url: "https://maude.cs.illinois.edu/overview"
    title: "Maude Overview — Maude has been influenced in important ways by OBJ3"
  - url: "https://cseweb.ucsd.edu/~goguen/pubs/asbk.html"
    title: "Algebraic Semantics of Imperative Programs (Goguen and Malcolm, MIT Press)"
author: "Joseph Goguen, José Meseguer, and the ADJ group (UCSD and SRI)"
family: "obj"
status: "active"
year: 1976
features:
  - "equational-rewriting"
  - "mixfix-syntax"
  - "module-algebra"
  - "order-sorted-typing"
  - "parameterized-modules"
  - "theories-and-views"
note: "The lineage defined by one idea: a program is an equational theory and computation is rewriting. OBJ introduced parameterized programming — theories, views and module expressions — and that module system is the ancestor of Ada, ML and C++ generics; Maude, CafeOBJ and BOBJ extend the logic."
---

## Overview

The OBJ family is the lineage of algebraic specification languages that treat a
program as an equational theory and its execution as term rewriting. Joseph
Goguen's group at UCSD began it in 1976, and its module system — theories,
views, parameterized modules — spread into Ada, ML and C++.

## Distinctive traits

- One logical reading of every member: programs are sets of sentences, and
  computation is deduction in that logic. The semantics is not an add-on.
- **Parameterized programming** is the family's invention: a module takes a
  *theory* as a parameter and a *view* discharges it, so instantiation is a
  proof obligation rather than a type substitution.
- **User-definable mixfix syntax**. Members declare `if_then_else_fi` or `_+_`
  as ordinary operators with precedence and gathering, so a specification can
  keep the notation of the domain it models.
- **Order-sorted typing** makes subtypes, overloading and coercion one
  mechanism rather than three features layered on a core.
- **Module expressions** — summation, renaming, instantiation — make the module
  system itself an algebra, which is what later languages borrowed piecemeal.
- Members disagree about the logic, not the shape: OBJ3 stays equational,
  rewriting logic (Maude) and hidden algebra (CafeOBJ, BOBJ) extend it.

## Members and what each one changed

| Language | Relationship to OBJ | What it changed |
| --- | --- | --- |
| [OBJ](/languages/obj) | the family root — OBJ3 is its canonical implementation | order-sorted equational logic, mixfix syntax, parameterized programming |
| [Maude](/languages/maude) | OBJ3's equational sublanguage plus rewriting logic | rules as first-class statements, reflection, LTL model checking, the Maude module algebra |
| [CafeOBJ](/languages/cafeobj) | modern successor, JAIST-led | hidden sorts and behavioural specification, institution-based multi-logic semantics, proof scores |
| [BOBJ](/languages/bobj) | behavioural extension of OBJ3, written in Java | circular coinductive rewriting, automatic cobases, higher-order modules |
| [Eqlog](/languages/eqlog) | OBJ3 plus order-sorted unification and backtracking | narrowing as the default semantics, retracts for runtime typing |
| [FOOPS](/languages/foops) | declarative object-oriented layer on OBJ3 | classes, declarative method axioms, a module interconnection language |

The recurring move is *keeping the logic while replacing the engine*: Maude
re-implemented OBJ's equational core with AC-matching automata and added rules;
CafeOBJ kept OBJ3's surface and generalised the semantics to a family of
institutions; BOBJ kept the surface and changed what equality means. None
rewrote the module system — every one of them still instantiates modules with
theories and views.

## Status

The lineage is live through Maude 3.5.1 (2025) and CafeOBJ 1.6.2 (2024), both
actively released. The original OBJ3 is dormant — version 2.06 (2000) was the
last release, now BSD-licensed and Common Lisp-hosted — but remains the
reference for what the family's syntax and module system mean.

## History

The first implementation of initial algebra semantics by term rewriting
appeared in OBJ in the mid-1970s; the characteristic syntax arrived in Goguen's
1977 paper. OBJ2 (1985) added Clear-style parameterized modules, OBJ3 (1988)
rebuilt the operational semantics on order-sorted rewriting, and BOBJ followed
with behavioural specification. Maude's first public release came in 1999 and
CafeOBJ was launched as a Japanese-funded consortium project in April 1997.

For the semantic background that all members share, see Goguen and Malcolm's
[Algebraic Semantics of Imperative Programs](https://cseweb.ucsd.edu/~goguen/pubs/asbk.html),
which teaches program semantics entirely in OBJ3.
