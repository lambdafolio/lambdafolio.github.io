---
title: "CafeOBJ"
name: "CafeOBJ"
homepage: "https://cafeobj.org/"
references:
  - url: "https://cafeobj.org/"
    title: "CafeOBJ — official site (Algebraic Specification and Verification)"
  - url: "https://cafeobj.org/files/reference-manual.html"
    title: "CafeOBJ Reference Manual v1.5.7 (Sawada, Futatsugi, Preining, 2018)"
  - url: "https://cafeobj.org/files/manual.pdf"
    title: "CafeOBJ User's Manual (Nakagawa, Sawada)"
  - url: "https://cseweb.ucsd.edu/~goguen/projs/cafepr.html"
    title: "CafeOBJ Project Press Release, 22 April 1997 — UCSD"
  - url: "https://github.com/CafeOBJ/cafeobj"
    title: "CafeOBJ interpreter source (CafeOBJ/cafeobj)"
  - url: "https://cafeobj.org/2024/11/cafeobj-1-6-2-released/"
    title: "CafeOBJ 1.6.2 release announcement (November 2024)"
author: "Kokichi Futatsugi et al. (JAIST); with Răzvan Diaconescu (IMAR)"
kind: "language"
status: "active"
year: 1997
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
  - "hidden-sorts"
  - "mixfix-syntax"
  - "parameterized-modules"
  - "proof-scores"
  - "rewriting-logic"
influences:
  - "OBJ"
note: "Successor to OBJ adding hidden sorts, behavioural specification and rewriting logic under one institution-based semantics. Its distinguishing practice is the proof score: a proof is CafeOBJ source, executed by reduction, so specification and verification share one tool."
---

## Overview

CafeOBJ is an algebraic [specification](/paradigms/specification) and
verification language, a direct successor to [OBJ](/languages/obj) developed
under Kokichi Futatsugi's direction at JAIST. It keeps OBJ's mixfix syntax,
order-sorted typing and parameterized modules, and adds
[hidden sorts](https://cafeobj.org/files/reference-manual.html) and rewriting
logic for behavioural and concurrent systems.

## Code

::code-group

```cafeobj [primitives]
mod! SIMPLE-NAT {
  [Nat]
  op 0 : -> Nat {constr}
  op s_ : Nat -> Nat {constr}
  op _+_ : Nat Nat -> Nat
  vars N M : Nat
  eq 0 + N = N .
  eq s N + M = s(N + M) .
}
red s s 0 + s s s 0 .   ***> s s s s s 0
```

```cafeobj [combinations]
mod! NATPAIR {
  pr(NAT)
  [Pair]
  ops <_,_> : Nat Nat -> Pair {constr}
  ops fst snd : Pair -> Nat
  eq fst(< A:Nat , B:Nat >) = A .
  eq snd(< A:Nat , B:Nat >) = B .
}
red fst(< 3 , 4 >) .    ***> 3
```

```cafeobj [abstractions]
mod! PAIR(X :: TRIV, Y :: TRIV) {
  [Pair]
  op <_,_> : Elt.X Elt.Y -> Pair {constr}
  op fst : Pair -> Elt.X
  eq fst(< A:Elt.X , B:Elt.Y >) = A .
}
mod! NAT-STRING-PAIR {
  pr(PAIR(NAT, STRING{sort Elt -> String}))
}
```

```cafeobj [idioms]
mod! COUNTER {
  pr(SIMPLE-NAT)
  *[Counter]*
  bop init : -> Counter
  bop inc : Counter -> Counter
  bop value : Counter -> Nat
  var C : Counter
  beq value(init) = 0 .
  beq value(inc(C)) = s(value(C)) .
}
open COUNTER .
red value(inc(inc(init))) .   ***> s s 0
close
```

::

::note
Two sorts of sort declaration carry the design: `[Nat]` is a *visible* sort
whose values are decided by equations, `*[Counter]*` is a *hidden* sort whose
identity is decided by observation through its `bop` operators. `beq` states
those observations behaviourally, and `red` drives the whole thing.
::

## Distinctive traits

- [Institution-based semantics](https://cafeobj.org/files/reference-manual.html):
  each logic combination is a separate institution, giving one language several
  precisely defined paradigms at once.
- Hidden sorts and behavioural operators (`bop`, `beq`, `=*=`) specify infinite
  objects by observation rather than by term equality.
- [Proof scores](https://cafeobj.org/files/reference-manual.html): case analysis
  and induction are written as CafeOBJ source and discharged by `red`, so the
  proof is checked by the same engine that runs the specification.
- `mod!` and `mod*` choose initial vs loose semantics for a module, making the
  model-theoretic reading part of the declaration.
- Syntax is fully user-definable (`_+_`, `if_then_else_fi`), and `ops ... {constr}`
  marks which operators generate the data.

## Status

Actively maintained: version 1.6.2 shipped in November 2024 under a BSD
licence, with binaries for Windows, macOS and Linux built on SBCL and source at
[CafeOBJ/cafeobj](https://github.com/CafeOBJ/cafeobj). The interpreter is written
in Common Lisp and ships with the CITP/PTcalc proof assistant.

## History

The CafeOBJ project began in April 1997 as a Japanese government-funded
consortium to build an industrial-strength OBJ environment; Futatsugi, an OBJ2
designer, led it at JAIST. The *CafeOBJ Report* (Diaconescu and Futatsugi)
appeared in 1998, and the interpreter has been in continuous release since.
