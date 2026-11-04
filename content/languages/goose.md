---
title: "Goose"
name: "Goose"
homepage: "https://github.com/aardappel/goose"
urls:
  - "https://github.com/aardappel/goose"
  - "https://github.com/aardappel/goose/blob/master/docs/tutorial.md"
  - "https://github.com/aardappel/goose/blob/master/docs/reference.md"
references:
  - url: "https://github.com/aardappel/goose/blob/master/docs/tutorial.md"
    title: "Goose tutorial"
  - url: "https://github.com/aardappel/goose/blob/master/docs/reference.md"
    title: "Goose reference"
author: "Wouter van Oortmerssen"
paradigms:
  - "imperative"
  - "systems"
influences:
  - "C"
  - "Rust"
  - "Lobster"
note: "Memory-safe systems language with no heap, GC, or lifetime annotations — every dynamic value lives inline on compiler-assigned data stacks; compiles to a single C file, with claims of out-running C++ and safe Rust in its own benchmark suite"
---
## Overview

Goose is a memory-safe systems language with no heap allocator, garbage
collector, reference counting, or lifetime annotations, by Wouter van
Oortmerssen (creator of Lobster), implemented almost entirely with AI from
his human language design. Its headline idea: scope exit is the free —
every dynamic value lives inline on compiler-assigned data stacks.

## Code

::code-group

```goose [primitives]
let greet = fn(name: u8[]) {
  print("hello, ", name);
};
let shapes: Shape[>..] = [];           // grow-only data-stack array
```

```goose [combinations]
shapes.push(Shape.Circle { r: 1.0 });  // nothing moves on growth
shapes.push(Shape.Dot);
for x in shapes {                      // shape-typed iteration
  match x {                            // consume: tag dispatch
    Circle c => print("circle r=", c.r),
    Dot     => print("dot"),
    _       => print("other"),
  }
}
```

```goose [abstractions]
enum Shape { Circle { r: f64 }, Rect { w: f64, h: f64 }, Dot }

fn area(s: Shape.Circle) -> f64 {      // case function: typed per variant
  s.r * 3.14159265358979 * s.r
}

let u = Unit { kind: 2, x: 1.5, .. };  // struct literal; .. = type default
divide(7, 2): q, ok;                   // multi-result consume by punning
```

::

::note

- `fn` values and ADTs define the units; `match` consumes an enum by tag — all
    inline on data stacks, freed at scope exit.
- Case functions overload per ADT variant; `..` fills struct defaults;
    multi-`return` values are consumed positionally.

::

## Distinctive traits

- Single memory model: native call stack + static data + N compiler-assigned
  data stacks; scope exit is the free — no heap, no GC, no lifetimes.
- Safety by construction: inferred static roots reject outliving references;
  no aliasing rules, no `unsafe`; redundant bounds checks are removed.
- ML-flavored core under C-style syntax: monomorphized generics, ADTs,
  position-independent `T&<u32>` references ("your data is already a file
  format" via `from_bytes`), compile-time function values.
- Compiles to one plain C file — `extern fn` for C interop; bundled TinyCC
  backend runs programs in-process with no build step.
- Author's benchmarks claim ~3.3× idiomatic C++ and ~1.1–1.3× optimized
  C++/safe Rust at 25–50% less memory (own suite; losses documented).
- Trade-offs: no escaping closures, whole-program compilation only, and
  share-nothing threads crossing flat values through typed queues.

## Status

Apache-2.0; prebuilt releases for Windows/Linux/macOS (v2026.3) with a VS
Code extension and LSP. Benchmark claims are from the author's own suite —
not independently verified.
