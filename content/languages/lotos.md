---
title: "LOTOS"
name: "LOTOS"
homepage: "https://www.iso.org/standard/16258.html"
references:
  - url: "https://cdn.standards.iteh.ai/samples/16258/e6f64eb2af9d4b34b9f888eb04bc9f09/ISO-8807-1989.pdf"
    title: "ISO 8807:1989 — LOTOS: A formal description technique based on the temporal ordering of observational behaviour"
  - url: "https://www.cs.stir.ac.uk/~kjt/research/pdf/lotos-users.pdf"
    title: "The Formal Specification Language LOTOS: A Course — Kenneth J. Turner, University of Stirling"
  - url: "https://cseweb.ucsd.edu/~goguen/sys/obj.html"
    title: "The OBJ Family — records LOTOS's debt to the OBJ module system and initial algebra semantics"
  - url: "https://inria.hal.science/hal-01621670v1/document"
    title: "From LOTOS to LNT — evolution of the language and its tools"
author: "ISO/IEC JTC1 (ISO 8807); based on CCS, CSP and ACT ONE"
kind: "standard"
status: "historical"
year: 1989
paradigms:
  - "concurrent"
  - "dataflow"
  - "declarative"
  - "modular"
  - "specification"
typing: "static"
type_system:
  - "adt"
execution:
  - "interpreted"
features:
  - "abstract-data-types"
  - "process-algebra"
  - "parameterized-modules"
  - "synchronous-rendezvous"
  - "value-passing"
influences:
  - "ACT ONE"
  - "CCS"
  - "CSP"
influenced:
  - "LNT"
note: "ISO-standard formal description technique combining an ACT ONE data-typing sublanguage with a CCS/CSP-derived process algebra. Its defining move is that gates, not whole events, synchronise, which permits multi-way rendezvous and value negotiation between processes."
---

## Overview

LOTOS is an ISO formal description technique for concurrent and distributed
systems, [standardized as ISO
8807](https://cdn.standards.iteh.ai/samples/16258/e6f64eb2af9d4b34b9f888eb04bc9f09/ISO-8807-1989.pdf)
in 1989. It couples a process algebra derived from CCS and CSP with ACT ONE for
data types, so behaviour and data are specified in one notation.

## Code

::code-group

```text [primitives]
(* an ACT ONE type: sorts, operations, equations *)
type Bit is Bool
sorts  Bit_Sort
opns   0, 1    : -> Bit_Sort
       flip    : Bit_Sort -> Bit_Sort
       _ == _  : Bit_Sort, Bit_Sort -> Bool_Sort
eqns
  ofsort Bit_Sort
    flip(0) = 1;
    flip(1) = 0
  ofsort Bool_Sort
    0 == 0 = true;
    0 == 1 = false
endtype
```

```text [combinations]
(* types enrich each other; processes are defined separately *)
type Arithmetic is Natural_Number, Boolean
  opns  _ + _ : Nat_Sort, Nat_Sort -> Nat_Sort
endtype

process PRESS_UP [up, down] : noexit :=
  up; down; PRESS_UP [up, down]
endproc
```

```text [abstractions]
(* processes take value parameters and may return results *)
process ADDER [input, output] (Base : Nat0_Sort) : noexit :=
  input ? X : Nat0_Sort;
  output ! (Base + X);
  ADDER [input, output] (Base)
endproc
```

```text [idioms]
(* gates, not events, synchronise: three-way rendezvous on 'sync' *)
process CLOCK [sync, tick] : noexit :=
  tick; sync; CLOCK [sync, tick]
endproc

(* parallel composition forces synchronisation on the named gate only *)
process SYSTEM [sync, tick, tock] : noexit :=
  CLOCK [sync, tick] |[sync]| CLOCK [sync, tock]
endproc
```

::

::note
`?` receives a value and `!` sends one, so `sync` between two processes can
negotiate a value rather than merely agree on an event — the capability the
[course notes](https://www.cs.stir.ac.uk/~kjt/research/pdf/lotos-users.pdf) single
out as beyond CCS and CSP. Gates are named and restricted, so `|[sync]|`
synchronises on one gate while leaving others independent.
::

## Distinctive traits

- Two sublanguages in one standard: an [ACT
  ONE](https://cdn.standards.iteh.ai/samples/16258/e6f64eb2af9d4b34b9f888eb04bc9f09/ISO-8807-1989.pdf)
  data part (`type … endtype`, with `sorts`/`opns`/`eqns`) and a behaviour part
  built from processes.
- **Gates, not events, are what synchronise**, which permits multi-way
  rendezvous and value negotiation that CCS and CSP cannot express directly.
- Behaviour operators are a full algebra: sequence `;`, choice `[]`, parallel
  `|||` / `||` / `|[gates]|`, enabling `>>`, disabling `[>`, hiding and `stop`.
- Data types are parameterized (`type Set_with_Incr`), with formal sorts, formal
  operations and formal equations discharged by an `actualizedby … using`
  clause.
- Observation equivalence is the semantic identity criterion, so refinements are
  stated as implementation relations rather than term equalities.
- The [module system and initial algebra
  semantics](https://cseweb.ucsd.edu/~goguen/sys/obj.html) came from OBJ, which
  makes LOTOS the one place OBJ's ideas reached an ISO standard.

## Status

Historical, though long-lived: ISO 8807 was published in 1989 and LOTOS tooling
(Lite, CADP, Topo) ran for decades, especially in OSI protocol specification.
Work on the language itself has moved to
[LNT](https://inria.hal.science/hal-01621670v1/document), a modern successor within
the CADP toolset.

## History

ISO began seeking a Formal Description Technique in the late 1970s for OSI
protocols. The name LOTOS was coined in 1983 for a language combining early CCS
and CSP; ACT ONE was added for data typing, and the result became ISO 8807 in
February 1989 — the first such language to be internationally standardized.
