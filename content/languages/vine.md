---
title: "Vine"
name: "Vine"
homepage: "https://vine.dev/"
urls:
  - "https://github.com/VineLang/vine"
  - "https://tendrils.co/"
references:
  - url: "https://vine.dev/docs/"
    title: "The Vine Programming Language — language documentation"
  - url: "https://github.com/VineLang/vine"
    title: "Vine — compiler, IVM and examples (VineLang/vine)"
  - url: "https://lwn.net/Articles/1011803/"
    title: "Two new graph-based functional programming languages (LWN, March 2025)"
  - url: "https://t6.fyi/guides/inets"
    title: "An Illustrated Guide to Interaction Nets (T6)"
  - url: "https://tendrils.co/blog/2026-11-10/30m-raised"
    title: "$30M Raised to Redo the CPU (Tendrils, November 2026)"
logo: "/logos/vine.svg"
author: "T6 (tjjfvi) and Vine contributors"
kind: "language"
status: "experimental"
year: 2024
paradigms:
  - "functional"
  - "imperative"
  - "parallel"
typing: "static"
type_system:
  - "adt"
  - "inferred"
  - "linear"
  - "nominal"
  - "parametric-polymorphic"
execution:
  - "vm"
features:
  - "borrowed-references"
  - "expression-oriented"
  - "generics"
  - "interaction-nets"
  - "inverse-types"
  - "parallel-by-default"
  - "pattern-matching"
  - "traits"
  - "type-inference"
influences:
  - "Rust"
relations:
  - name: "Rust"
    kind: "influenced-by"
  - name: "Rust"
    kind: "implemented-in"
note: "A Rust-influenced, statically typed language that compiles to interaction nets and runs on its own graph-reduction runtime, so parallelism falls out of the evaluation model and the inverse type sends values backwards."
---
## Overview

Vine is a statically typed, [expression-oriented](https://vine.dev/docs/features/usual)
language whose programs compile to [interaction nets](https://t6.fyi/guides/inets)
and run on the IVM, an interaction-combinator runtime. It exists to make parallel
execution the default: rewriting is local, so independent work needs no threads,
locks or shared mutable memory.

## Code

::code-group

```vine [primitives]
let n = 6 * 7;                     // N32: the default width for integers
let pi = 3.14;                     // F32: floats default to 32 bits
let c = 'a';                       // a character literal: Char
let ok = n > 40 and !false;        // Bool; `and`/`or` short-circuit
let s = "{n} squared is {n * n}";   // interpolation splices expressions
(n, pi, c, ok, s)                 // a tuple holds one of each
```

```vine [combinations]
let xs = [1, 2, 3] ++ [4];      // List[N32]; `++` concatenates lists
let (a, b) = (1.0, "two");      // a tuple, taken apart by a tuple pattern
let pt = { x: 1.0, y: 2.0 };    // an object: named, heterogeneous fields
pt.x += 1.0;                    // fields are places, so they can be written
for n in xs.iter() {            // `iter()` yields each element in turn
  io.println("{n}");
}
```

```vine [abstractions]
struct* Id(N32);          // a nominal wrapper; `*` makes its values copyable
fn show(id: Id) -> String {
  let n = id!;            // `!` unwraps the struct's content
  "id = {n}"
}
fn not_equal[T; Equal[T]](a: T, b: T) -> Bool {
  !a.equal(b)             // generic over any type that implements `Equal`
}
show(Id(46))              // "id = 46": a function applies the wrapper
not_equal(true, true)     // false: one generic definition, any `Equal` type
```

```vine [idioms]
enum* Shape {
  Point(),
  Circle(F32),
  Rect({ width: F32, height: F32 }),
}
fn perimeter(shape: Shape) -> F32 {
  match shape {
    Shape::Point() { 0.0 }
    Shape::Circle(radius) { 6.28 * radius }
    Shape::Rect({ width, height }) { 2.0 * (width + height) }
  }
}
perimeter(Shape::Rect({ width: 4.0, height: 6.0 }))   // 20.0
```

::

::note
Primitives, lists, nominal structs and enum variants are ordinary; the difference
sits underneath. `match` is the working idiom — an [enum](https://vine.dev/docs/features/types/enums)
variant is only unwrapped by [pattern matching](https://vine.dev/docs/features/patterns),
so the type system and the tour share one shape. Evaluation rewrites an
[Ivy](https://vine.dev/docs/ivy-ivm/ivy) net locally, which is why nothing here
mentions a thread: independence is [parallel by default](https://tendrils.co/blog/2026-11-10/30m-raised),
and a [`~T`](https://vine.dev/docs/features/inverse) place can be written later
than it is read.
::

## Distinctive traits

- Interaction nets give [confluence](https://t6.fyi/guides/inets): redexes reduce
  locally in any order, so scheduling is the runtime's problem, not the programmer's.
- Every value is used exactly once by default; the
  [`Fork`/`Drop`](https://vine.dev/docs/features/traits/fork-drop) traits and `?`/`+`/`*`
  markers opt into copying and discarding.
- The [inverse](https://vine.dev/docs/features/inverse) `~T` is a place filled
  later: setting `~min` after a loop feeds the value back to earlier iterations.
- [Traits](https://vine.dev/docs/features/traits/intro) take implementation
  parameters (`[T; Equal[T]]`), so generic code constrains by evidence; methods
  are functions marked with a leading `.`, and
  [type inference](https://vine.dev/docs/features/types) fills the rest.
- [Borrowed references](https://vine.dev/docs/features/references) (`&T`) avoid
  copies on read-only calls; mutating methods take their receiver by reference.
- Programs compile to [Ivy](https://vine.dev/docs/ivy-ivm/ivy) nets that the
  [IVM](https://vine.dev/docs/ivy-ivm/ivm) reduces, with [IO](https://vine.dev/docs/features/io)
  threaded through one fork-proof handle so effects stay ordered.

## Status

Experimental and openly developed: Apache-2.0/MIT licensed, with a
[Rust](/languages/rust)-implemented compiler and a small contributor base.
Tendrils, the parallel-first CPU startup staffed by the core team, develops Vine
in tandem with its hardware work.

## History

T6 began Vine in June 2024, aiming — in their words to LWN — at a language that
could realize the potential of interaction nets; the project has since drawn a
small contributor group. LWN profiled it beside [Bend](/languages/bend) in March
2025, noting the absent GPU backend. In November 2026 Tendrils, staffed by the
project's core team, announced a $30M round to build a
[CPU with thousands of cores](https://tendrils.co/blog/2026-11-10/30m-raised),
naming Vine as its software half.
