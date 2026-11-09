---
title: "Clear"
name: "Clear"
homepage: "https://link.springer.com/chapter/10.1007/3-540-10007-5_41"
references:
  - url: "https://ijcai.org/proceedings/1977/0234.pdf"
    title: "Putting Theories Together to Make Specifications — Burstall and Goguen, IJCAI 1977"
  - url: "https://link.springer.com/chapter/10.1007/3-540-10007-5_41"
    title: "The Semantics of Clear, a Specification Language — Burstall and Goguen, LNCS 86 (1980)"
  - url: "https://link.springer.com/article/10.1007/BF00271641"
    title: "A Set-Theoretic Semantics for Clear (Sannella and Wirsing)"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family — Clear described as the origin of OBJ's module system"
  - url: "https://www.cs.cmu.edu/~rwh/papers/history/main.pdf"
    title: "The History of Standard ML — Clear as an inspiration for the SML module system"
author: "Rod Burstall and Joseph Goguen (Edinburgh and UCLA)"
kind: "language"
status: "historical"
paradigms:
  - "declarative"
  - "generic"
  - "modular"
  - "specification"
typing: "static"
type_system:
  - "adt"
execution:
  - "interpreted"
features:
  - "module-algebra"
  - "parameterized-modules"
  - "theories-and-views"
influences:
  - "ALPHARD"
influenced:
  - "OBJ"
  - "Standard ML"
note: "Specification language for combining theories: a theory is a signature plus equations, and combine, enrich, derive, induce and theory procedures build larger ones. Its colimit semantics for shared subtheories is the direct source of OBJ's parameterized modules and, through that, of the ML module system."
---

## Overview

Clear is a specification language for building large theories out of small ones:
a theory is a signature plus equations, and theory expressions combine them. Rod
Burstall and Joseph Goguen introduced it in 1977 so that a [modular
specification](/paradigms/modular) could be structured rather than written as one
monolithic axiom list.

## Code

::code-group

```text [primitives]
theory sorts bool
opns  true : -> bool
      false : -> bool
      not_ : bool -> bool
      _and_ : bool, bool -> bool
eqns  not true = false
      not false = true
      false and p = false
      true and p = p
endth
```

```text [combinations]
theory sorts nat
opns  0 : -> nat
      succ_ : nat -> nat
endth
enrich Bool + Nat by
opns  _<_ : nat, nat -> bool
      eq : nat, nat -> bool
eqns  0 < n = true
      succ(m) < 0 = false
      succ(m) < succ(n) = m < n
      eq(m,n) = m < n and n < m
endth
```

```text [abstractions]
proc Strings (X : Triv) =
  induce enrich X by
  sorts string
  opns  unit : element -> string
        empty : -> string
        _._ : string, string -> string
  eqns  empty . s = s
        s . empty = s
        (s . t) . u = s . (t . u)
  enden
```

```text [idioms]
proc OrderedStrings (X : Poset) =
  induce enrich Strings(X) by
  opns  ordered : string -> bool
  eqns  ordered empty = true
        ordered(unit(x) . unit(y)) = x <= y
  enden

Strings(Nat [element is nat]) .
```

::

::note
The tour follows the paper's own progression: an explicit theory; `combine` and
`enrich`; a procedure whose parameter is *itself a theory*; and application of
that procedure, where `[element is nat]` discharges the parameter. The last step
is a proof obligation, not a type check, and the paper notes it is undecidable in
general.
::

## Distinctive traits

- Theory-building is *expression-based*: `combine` (`+`), `enrich`, `derive` and
  `induce` compose theories, so a specification is an expression rather than a
  file.
- `enrich` adds sorts, operators and equations to an existing theory while
  inheriting everything it had, so no axiom is restated.
- Sharing is semantic, not textual: two theories that both contain `Bool` combine
  to a theory with **one** `Bool`, which is where the
  [colimit](https://ijcai.org/proceedings/1977/0234.pdf) semantics enters.
- Theory procedures make theories first-class inputs, and a "meta-sort" is just a
  theory naming the requirements, so parameterization is by specification.
- `derive` renames a theory's signature, expressing that one operator corresponds
  to another without repeating the axioms.
- `induce` adds the equations holding for all variable-free instances, turning
  case analysis into a rule of inference.

## Status

Historical, and never implemented as described: Burstall and Goguen published a
design with a semantics, not a released system. Its influence outweighs its
tooling — [OBJ](/languages/obj) took theories and views from Clear, and
[Standard ML](/languages/standard-ml)'s modules cite it.

## History

Burstall and Goguen presented Clear at IJCAI 1977; its semantics appeared as *The
Semantics of Clear* in LNCS 86 (1980), with set-theoretic and categorical
treatments following. Goguen later called OBJ's module system "a further
development of ideas pioneered in the Clear language, which was joint work of
Joseph Goguen and Rod Burstall in the 1970s".
