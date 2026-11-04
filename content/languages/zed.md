---
title: "Zed"
name: "Zed"
homepage: "https://github.com/zedlanguage/zed"
urls:
  - "https://x.com/ZedLang"
  - "https://github.com/zedlanguage"
references:
  - url: "https://github.com/zedlanguage/zed/blob/main/README.md"
    title: "Zed — project README (design overview and current status)"
  - url: "https://github.com/zedlanguage/zed/blob/main/zed/fences/design.md"
    title: "Zed design notes (DESIGN.md, copied into the compiler repository)"
  - url: "https://github.com/zedlanguage/zed/blob/main/zed/fences/examples.md"
    title: "Zed language examples (EXAMPLES.md, copied into the compiler repository)"
  - url: "https://github.com/zedlanguage/zed/blob/main/STATUS.md"
    title: "Zed implementation status (STATUS.md)"
  - url: "https://x.com/LH/status/2117484142753648831"
    title: "Luke Hutchison: announcing Zed (X, 2 November 2026)"
author: "Luke Hutchison (zedlanguage)"
kind: "language"
status: "experimental"
year: 2026
paradigms:
  - "data-parallel"
  - "dataflow"
  - "functional"
  - "query"
typing: "static"
type_system:
  - "adt"
  - "inferred"
  - "refinement"
  - "structural"
memory:
  - "compile-time"
  - "ownership"
execution:
  - "ahead-of-time"
  - "interpreted"
  - "jit"
concurrency:
  - "data-parallel"
features:
  - "automatic-parallelization"
  - "grammar-declarations"
  - "incremental-recomputation"
  - "morphism-values"
  - "no-garbage-collector"
  - "partial-evaluation"
  - "proof-laws"
  - "refinement-types"
  - "taint-tracking"
  - "units-in-types"
relations:
  - name: "Rust"
    kind: "implemented-in"
note: "Category-theory language where a program is a graph of values: the compiler derives parallel scheduling, last-use memory freeing, and safety from that graph, with units, refinements, and machine-checked laws in the type system."
---
## Overview

Zed is an experimental programming language in which a program is a graph of
values and the dependencies between them, so the compiler derives parallel
scheduling, memory management, and safety from that graph. Its design is rooted
in category theory: morphisms are ordinary values, and units, refinements, and
machine-checked laws live in the type system.

## Code

::code-group

```zed [primitives]
x = 42;                        // int, inferred domain int[42..=42]
port: int[1..=65535] = 8080;   // a refinement: the domain carries intent
name = "Zed";
color = #green;                // an atom: a value that is its own type
pair = (1, "one");             // a tuple
a, b = pair;                   // destructuring; arity must match
first = pair[0];               // a tuple is indexed like any morphism
```

```zed [combinations]
ages  = { "ann" -> 31, "bob" -> 27 };  // a map: keys -> values
names = ages::domain;                   // the key set
older = ages.map(n -> n + 1);           // the same keys, new values
adult = ages.where(n -> n >= 18);       // a subdomain
v = 3.0 with units("m/s");              // units ride on the value
t = 2.0 with units("s");
d = v * t;                              // f64 with units("m")
```

```zed [abstractions]
struct Point { x: f64, y: f64 }
p  = Point(x: 1.0, y: 2.0);
p2 = p with { x = 3.0 };        // an update is a new value
dist(positional a: Point, positional b: Point) =
  ((a.x - b.x) ** 2 + (a.y - b.y) ** 2).sqrt;
howFar = dist(p, p2);           // apply the definable unit
```

```zed [idioms]
paid = orders.join(payments, on: #orderId, kind: #left);  // a join
hist: int ->? int with reducer((+));   // the reducer names the merge
for s in words { hist[s.len] <- 1; };  // so many sites may push
law addComm(a: int, b: int) = a + b == b + a;   // a checked law
rev = xs as (i -> x) into (xs::len - 1 - i -> x); // a bijective rekey
```

::

::note
One tab per slot. Values carry refinements and units; collections are
  morphisms the compiler can remap, join, or fold; a struct and a function are
  the definable unit. The last tab is the flagship: a join plans like a loop, a
  fold with a named reducer runs in parallel and gives bit-identical results, a
  law is discharged by the checker, and a key remapping is a category-theoretic
  rekey. Not shown, but in the design: partial evaluation specializes a generic
  decoder at build time, a `grammar` clause gives a type its parser and printer,
  taint tracking makes an unsanitised query a compile error, and an edit
  recomputes only the values that depend on it.
::

## Distinctive traits

- A program is a graph of values and their dependencies, so the compiler
  schedules, frees, and proves safety by reading that graph.
- Collections are morphisms: `xs as (i -> x) into (k -> x)` remaps keys; a
  loop, a join, and a query share one form.
- Parallel by default, bit-identical on any core count; an edit recomputes
  only the values that depend on it.
- No garbage collector: memory is freed at each value's last use, computed
  statically, so there are no collection pauses.
- Units live in the type system: metres per second times seconds is metres,
  and adding seconds is a compile error.
- A failure is an ordinary value: `#notFound` rides in the type, and the
  checker makes every caller handle it.

## Status

Under construction: the README says "coming soon" and no releases are
published. The [Rust](/languages/rust)-hosted compiler `zedc` implements the
lower layers (lexer, parser, checker, native code generation via Cranelift);
the higher ones are still to come. MIT licensed.

## History

Luke Hutchison announced Zed on 2 November 2026, describing twenty years of
design notes compiled with several AI models into one plan, then built by
coding agents against a dependency graph of tasks. The repository was created
on 25 October 2026; the language has no public release yet.
