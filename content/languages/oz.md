---
title: "Oz"
name: "Oz"
homepage: "http://mozart2.org/"
references:
  - url: "http://mozart2.org/"
    title: "The Mozart Programming System — official site (Mozart implements Oz 3)"
  - url: "http://mozart2.org/mozart-v1/doc-1.4.0/tutorial/node1.html"
    title: "Tutorial of Oz, §1 Introduction — Oz 1/2/3 lineage and the concurrent constraint model (Haridi & Franzén)"
  - url: "http://mozart2.org/mozart-v1/doc-1.4.0/tutorial/node3.html"
    title: "Tutorial of Oz, §3 Basics — logic variables, the type hierarchy, records and lists"
  - url: "http://mozart2.org/mozart-v1/doc-1.4.0/tutorial/node5.html"
    title: "Tutorial of Oz, §5 Basic Control Structures — procedures and pattern matching"
  - url: "http://mozart2.org/mozart-v1/doc-1.4.0/tutorial/node8.html"
    title: "Tutorial of Oz, §8 Concurrency — dataflow threads and stream communication"
  - url: "http://mozart2.org/mozart-v1/doc-1.4.0/tutorial/node12.html"
    title: "Tutorial of Oz, §12 Logic Programming — constraint stores, computation spaces, search"
  - url: "https://dl.acm.org/doi/10.1145/3386333"
    title: "A History of the Oz Multiparadigm Language — Van Roy, Haridi, Schulte, Smolka (HOPL IV, 2020)"
author: "Gert Smolka (DFKI), Seif Haridi (SICS), Peter Van Roy (UCL), and the Mozart Consortium"
kind: "language"
status: "active"
year: 1995
paradigms:
  - "concurrent"
  - "declarative"
  - "functional"
  - "imperative"
  - "logic"
  - "object-oriented"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "bytecode"
  - "vm"
concurrency:
  - "green-threads"
  - "isolation"
features:
  - "logic-variables"
  - "dataflow-synchronisation"
  - "constraint-programming"
  - "computation-spaces"
  - "higher-order-procedures"
  - "multiple-inheritance"
  - "first-class-procedures-and-threads"
note: "A multiparadigm language built on the concurrent constraint model: variables are single-assignment logic variables, threads are dataflow threads that suspend until their inputs are bound, and one kernel supports functional, object-oriented, constraint, and search programming. Implemented by the Mozart system."
---
## Overview

Oz is a multiparadigm language built on the concurrent constraint model, where
every variable is a single-assignment logic variable and every thread is a
[dataflow](/paradigms/dataflow) thread that suspends until the values it needs
exist. It exists to unify paradigms that are usually kept separate rather than
to invent a new one.

## Code

::code-group

```oz [primitives]
% numbers, atoms, and the binding that gives a logic variable its value
local X Y Z in
   X = 5
   Y = 10
   if X >= Y then Z = X else Z = Y end
   {Browse Z}                          % 10
end

{Show 'Hello World'}                   % atoms are primitives too
```

```oz [combinations]
% records are labelled tuples; lists are records with the | cons constructor
local T L in
   T = tree(alex 17 nil nil)           % label `tree`, four fields
   L = 1|2|3|nil                       % a list, built by consing
   case T of tree(K V Left Right) then
      {Browse K}                       % destructuring binds K = alex
   end
   {Browse L.1}                        % feature selection by position
end
```

```oz [abstractions]
% the definable unit is a procedure: a lexically scoped, first-class closure
local Max AndThen in
   proc {Max X Y Z}
      if X >= Y then Z = X else Z = Y end
   end
   {Max 5 10 Z} {Browse Z}              % Z is an output argument; shows 10
   proc {AndThen BP1 BP2 ?B}            % ?B documents an output argument
      if {BP1} then B = {BP2} else B = false end
   end
end
```

```oz [idioms]
% the dataflow idiom: a producer extends a stream, a consumer suspends on it
fun {Generator N}
   if N > 0 then N|{Generator N - 1} else nil end
end

proc {Sum Ls ?S}
   case Ls of X|Lr then Sr in S = X + Sr  {Sum Lr Sr}
   else S = 0 end
end

{Show thread {Sum thread {Generator 3} end} end}   % 6
```

::

::note
`Z = X` is not an assignment but a *binding*: an unbound variable becomes equal
to a value, and a conflicting value raises a failure exception rather than
overwriting. Every other slot reuses that primitive — pattern matching
destructures with it, a procedure reports through an output argument still
unbound on entry, and the dataflow idiom is a consumer suspending on a variable
the producer will bind.
::

## Distinctive traits

- Dataflow threads, not scheduler threads. A thread blocks automatically until
  its statement's inputs are bound, so stream producer and consumer need no
  explicit synchronisation primitive.
- One kernel, many paradigms. The full language desugars to a kernel of
  bindings, cells, procedures, and threads, so classes, constraints, and search
  are libraries over shared semantics.
- Constraint stores and computation spaces make search first-class. A space
  encapsulates a speculative computation, so a solver is an ordinary Oz program
  rather than a separate subsystem.
- Classes are stateless descriptions with multiple inheritance. A class is a
  chunk holding a method table, so conflicts between parents resolve when the
  table is built, not at call time.
- State is explicit and opt-in. Cells are mutable pointers created deliberately,
  so the declarative fragment defaults to single-assignment and stays
  concurrency-safe.
- Dynamically typed, with structural equality. A binding determines a variable's
  type, and records compare by structure rather than by identity.

## Status

Active as a language, but with a split implementation story: Mozart 1.x (through
1.4.0) implements Oz 3 including constraints and distribution, while Mozart 2 is
a redesigned 64-bit VM whose first release omitted both, planning them for later
releases.

## History

Oz 1 developed a fine-grained concurrency model that proved hard to control and
debug; Oz 2 replaced it with explicit thread creation, a new object system, and
much stronger constraint and search support; Oz 3 added functors and futures
while staying almost wholly upward compatible with Oz 2. The first public release
of the Oz 1 implementation was in 1995. Mozart was developed by Smolka's group at
DFKI, Haridi's at SICS, and Van Roy's at UCL.
