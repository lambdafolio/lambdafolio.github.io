---
title: "SASyLF"
name: "SASyLF"
homepage: "https://www.cs.cmu.edu/~aldrich/SASyLF/"
references:
  - url: "https://www.cs.cmu.edu/~aldrich/SASyLF/fdpe08.pdf"
    title: "SASyLF: An Educational Proof Assistant for Language Theory — Aldrich, Simmons and Shin, FDPE 2008"
  - url: "https://github.com/boyland/sasylf"
    title: "SASyLF source, releases and examples (boyland/sasylf) — Eclipse Public License 1.0"
  - url: "https://github.com/boyland/sasylf/wiki/Main"
    title: "SASyLF manual: file structure, syntax, judgments and theorems"
  - url: "https://github.com/boyland/sasylf/wiki/Proofs"
    title: "Writing proofs in SASyLF — justifications, cases and induction"
  - url: "https://github.com/boyland/sasylf/blob/master/ChangeLog.txt"
    title: "SASyLF release history (ChangeLog)"
logo: "/logos/sasylf.png"
author: "Jonathan Aldrich, Robert J. Simmons and Key Shin"
kind: "language"
status: "active"
year: 2008
paradigms:
  - "logic"
  - "specification"
features:
  - "built-in-variable-binding"
  - "case-analysis"
  - "inference-rules"
  - "induction"
  - "modules"
relations:
  - name: "Twelf"
    kind: "influenced-by"
  - name: "Java"
    kind: "implemented-in"
note: "An LF-based proof assistant whose surface syntax stays close to the paper it checks; derivations are written line by line and justified explicitly, and built-in variable binding supplies substitution for free."
---

## Overview

An [LF-based](https://www.cs.cmu.edu/~aldrich/SASyLF/fdpe08.pdf) proof assistant
for programming-language theory, belonging to the [logic](/paradigms/logic) and
[specification](/paradigms/specification) traditions: syntax is written as BNF,
semantics as inference rules, and proofs as named derivations. Its design goal is
paper fidelity, so a student's lecture notes transpose nearly line for line into a
file the checker verifies.

## Code

::code-group

```text [primitives]
terminals z s
syntax
n ::= z
  | s n

judgment sum: n + n = n
--------- sum-z
z + n = n

n1 + n2 = n3
-------------------- sum-s
(s n1) + n2 = (s n3)
```

```text [combinations]
syntax
Gamma ::= *
      |   Gamma, x : tau

judgment has-type: Gamma |- e : tau
assumes Gamma

------------------------- t-var
Gamma, x:tau |- x : tau
```

```text [abstractions]
theorem n_plus_1_equals_s_n : forall n exists (s (z)) + n = (s n).

d1: (z) + n = n         by rule sum-z
d2: (s (z)) + n = (s n) by rule sum-s on d1
end theorem

theorem one_plus_1_equals_s_n : exists (s (z)) + (s (z)) = (s s z).
d1: (s (z)) + (s (z)) = (s s z) by theorem n_plus_1_equals_s_n on (s z)
end theorem
```

```text [idioms]
theorem sum-z-rh: forall n exists n + (z) = n.
d1: n + (z) = n by induction on n:
case z is
  d2: (z) + (z) = (z) by rule sum-z
end case

case s n' is
  d3: n' + (z) = n' by induction hypothesis on n'
  d4: (s n') + (z) = (s n') by rule sum-s on d3
end case
end induction
end theorem
```

::

::note
Every tab is a declaration the checker consumes: grammar gives terms, rules
generate judgments, a proof names each derivation. The last tab is the classroom
idiom — induction with case coverage checked. Transcribed from the shipped examples.
::

## Distinctive traits

- Syntax is BNF and semantics is [rules stacked over a
  bar](https://github.com/boyland/sasylf/wiki/Main#judgments), matching
  type-theory lecture notes; formalising becomes transcription, not translation.
- [Built-in variable binding](https://github.com/boyland/sasylf/wiki/Main#syntax)
  supplies substitution, weakening, exchange and contraction, so metatheory
  needs no de Bruijn encodings.
- No tactics: each step names a derivation and a
  [justification](https://github.com/boyland/sasylf/wiki/Proofs#justification),
  and errors point at the offending line, not at a proof state.
- Case analysis is coverage-checked: omit a grammar production or a judgment's
  rule and the [proof is rejected](https://github.com/boyland/sasylf/wiki/Proofs#cases).
- Rules are matched by [higher-order pattern
  unification](https://github.com/boyland/sasylf/wiki/ImplementationNotes#unification);
  it is undecidable in general, so "unification incomplete" is a real error.
- [Modules](https://github.com/boyland/sasylf/wiki/Main#modules) since 1.5.0
  import syntax, judgments and theorems by qualified name, letting a course
  layer chapters instead of one huge file.

## Status

Active. Shipped as a Java JAR for the command line, Eclipse and VS Code under the
[Eclipse Public License 1.0](https://www.eclipse.org/legal/epl-v10.html); 1.5.2
and a 1.6.0 pre-release both landed in January 2026.

## History

Aldrich, Simmons and Shin presented SASyLF at FDPE 2008 with preliminary results
from graduate type-theory courses; numbering started in 0.x, with 0.7 the first
stable public release. John Boyland made the later major updates — IDE plugins,
`where` clauses (1.4.0) and modules (1.5.0) — on top of the
[Twelf](/languages/twelf)-derived checker.
