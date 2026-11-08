---
title: "Odin"
name: "Odin"
homepage: "https://odin-lang.org/"
references:
  - url: "https://odin-lang.org/docs/overview/"
    title: "Overview of Odin — language documentation (Ginger Bill)"
  - url: "https://odin-lang.org/docs/faq/"
    title: "Frequently Asked Questions — Odin documentation"
  - url: "https://github.com/odin-lang/Odin"
    title: "odin-lang/Odin — compiler, core library and vendor bindings"
  - url: "https://github.com/odin-lang/Odin/releases"
    title: "Odin releases — earliest tag v0.0.3c (23 November 2016)"
  - url: "https://github.com/odin-lang/Odin/blob/master/LICENSE"
    title: "Odin licence (zlib)"
  - url: "https://www.gingerbill.org/article/2018/09/05/exceptions---and-why-odin-will-never-have-them/"
    title: "Exceptions — And Why Odin Will Never Have Them (Ginger Bill, 2018)"
author: "Ginger Bill"
kind: "language"
status: "active"
year: 2016
paradigms:
  - "generic"
  - "imperative"
  - "systems"
typing: "static"
type_system:
  - "inferred"
  - "nominal"
  - "parametric-polymorphic"
memory:
  - "manual"
execution:
  - "ahead-of-time"
  - "native"
concurrency:
  - "kernel-threads"
  - "tasks"
features:
  - "array-programming"
  - "bit-sets"
  - "distinct-types"
  - "explicit-allocators"
  - "foreign-system"
  - "implicit-context"
  - "multiple-return-values"
  - "parametric-polymorphism"
  - "simd"
  - "soa-layout"
  - "tagged-unions"
  - "zero-initialization"
influences:
  - "C"
  - "Go"
  - "Pascal"
relations:
  - name: "C"
    kind: "influenced-by"
  - name: "Go"
    kind: "influenced-by"
  - name: "Pascal"
    kind: "influenced-by"
note: "A data-oriented systems language with distinct typing: manual memory through explicit allocators, no classes or inheritance, built-in SOA and SIMD types, and a foreign system that binds C libraries directly."
---
## Overview

Odin is an [imperative](/paradigms/imperative), [systems](/paradigms/systems) language positioned as an alternative to [C](/languages/c): explicit [allocators](https://odin-lang.org/docs/overview/#allocators) instead of a garbage collector, and deliberately no classes, methods, or [exceptions](https://odin-lang.org/docs/faq/#why-does-odin-not-have-exceptions). It exists so that high-performance code reads as the data it transforms, while the whole [specification](https://odin-lang.org/docs/faq/#what-are-the-guiding-principles-behind-the-design-of-odin) stays small enough for one person to memorize.

## Code

::code-group

```odin [primitives]
import "core:fmt"
main :: proc() {
    year := 2016                      // untyped literal; defaults to int
    mass: u32                         // declared and unset: zero value is 0
    fmt.println(year + 10, mass + 70) // operators consume: 2026 70
}
```

```odin [combinations]
Vector3 :: struct { x, y, z: f32 }
Direction :: enum { North, East, South, West }
Flags :: bit_set[Direction]                 // one bit per enum member
main :: proc() {
    xs := [?]int{2, 3, 5}                   // fixed array: length is in the type
    sl := xs[1:]                            // slice: a view, not a copy
    v := Vector3{1, 4, 9}
    on := Flags{.North, .West}
    assert(len(sl) == 2 && v.x + v.z == 10 && Direction.South not_in on)
}
```

```odin [abstractions]
import "base:intrinsics"
import "core:fmt"
sum :: proc(xs: $T/[]$E) -> E
    where intrinsics.type_is_numeric(E) {   // T and E bound from the argument
    total: E
    for x in xs { total += x }
    return total
}
divide :: proc(a, b: int) -> (q, r: int) { return a/b, a%b }
main :: proc() {
    q, r := divide(17, 5)
    fmt.println(sum([]int{q, r}), q, r)     // 5 3 2: calls consume the units
}
```

```odin [idioms]
import "core:mem"
Particle :: struct { pos, vel: [3]f32 }
main :: proc() {
    buf: [1 << 16]byte                               // the arena's backing store
    arena: mem.Arena
    mem.arena_init(&arena, buf[:])
    context.allocator = mem.arena_allocator(&arena)  // via the implicit context
    defer mem.arena_free_all(&arena)                 // the whole region, one call
    ps: #soa[dynamic]Particle                        // one array per field
    append_soa(&ps, Particle{{0, 0, 0}, {1, 0, 0}})
    for i in 0..<len(ps) { ps[i].pos += ps[i].vel }  // array programming
}
```

::

::note
Four fragments, one per slot. Literals then operators; composites whose length,
fields and membership are all checked; procedures as the unit, specialized by
[parametric polymorphism](https://odin-lang.org/docs/overview/#specialization) and distinguished by
[multiple results](https://odin-lang.org/docs/overview/#multiple-results); then the data-oriented idiom — an [arena](https://pkg.odin-lang.org/core/mem/#Arena) behind the [implicit context](https://odin-lang.org/docs/overview/#implicit-context-system), with [`#soa`](https://odin-lang.org/docs/overview/#soa-data-types) layout.
::

## Distinctive traits

- Memory is manual: [`new`](https://odin-lang.org/docs/overview/#allocators), `make` and `delete` take an [allocator](https://odin-lang.org/docs/overview/#allocators), and an arena frees a whole subsystem in one call.
- [Implicit context](https://odin-lang.org/docs/overview/#implicit-context-system): allocator, logger and assert handler travel with every call, so third-party code can be redirected without editing it.
- [Distinct typing](https://odin-lang.org/docs/overview/#distinct-types): `distinct int` is a new type and every width change is explicit, so no value widens silently.
- Layout is a language feature: [`#soa`](https://odin-lang.org/docs/overview/#soa-data-types) transposes a struct array into per-field arrays, and [`#simd[N]T`](https://odin-lang.org/docs/overview/#simd-vector-types) vectors map onto hardware registers.
- Data and code stay separate — no classes, methods or exceptions; errors are ordinary return values forwarded with [`or_return`](https://odin-lang.org/docs/overview/#or_return-operator).
- Also built in: [tagged unions](https://odin-lang.org/docs/overview/#unions) with exhaustive type switches, [bit sets](https://odin-lang.org/docs/overview/#bit-sets) for flag sets, and a [`foreign`](https://odin-lang.org/docs/overview/#foreign-system) block binding C libraries.

## Status

Active but pre-1.0: the compiler is written in [C++](/languages/cplusplus) and emits native code through LLVM ([per the FAQ](https://odin-lang.org/docs/faq/#what-does-the-compiler-use)), shipping dated `dev-` builds with [no 1.0 release](https://github.com/odin-lang/Odin/releases). Compiler and libraries use the [zlib licence](https://github.com/odin-lang/Odin/blob/master/LICENSE).

## History

In late July 2016 [Ginger Bill](https://www.gingerbill.org/) began Odin out of frustration with C++, first as a Pascal clone before moving to C-like syntax; the repository went public on 23 November 2016. The [documented influences](https://odin-lang.org/docs/faq/#what-have-been-the-major-influences-in-the-languages-design) are [Pascal](/languages/pascal), [C](/languages/c), [Go](/languages/go), Oberon-2, Newsqueak and GLSL.
