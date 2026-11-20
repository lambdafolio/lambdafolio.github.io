---
title: "Mk"
name: "Mk"
homepage: "https://github.com/zerodayokay/Mk-Lang"
references:
  - url: "https://github.com/zerodayokay/Mk-Lang/blob/main/doc/overview.md"
    title: "A tour of Mk - the language one feature at a time"
  - url: "https://github.com/zerodayokay/Mk-Lang/blob/main/doc/memory.md"
    title: "The Mk memory model - ownership, loans and rules R1 to R21"
  - url: "https://github.com/zerodayokay/Mk-Lang/blob/main/doc/reference.md"
    title: "The Mk language reference - the language, rule by rule"
  - url: "https://github.com/zerodayokay/Mk-Lang/blob/main/doc/rationale.md"
    title: "Why Mk looks like this - design rationale and lineage"
  - url: "https://github.com/zerodayokay/Mk-Lang/blob/main/CHANGELOG.md"
    title: "Mk changelog - releases 0.1.0 to 0.2.1"
author: "Rezo Bolkvadze"
kind: "language"
status: "active"
year: 2026
paradigms:
  - "imperative"
  - "systems"
typing: "static"
type_system:
  - "inferred"
  - "linear"
  - "parametric-polymorphic"
memory:
  - "arena"
  - "borrow-checker"
  - "ownership"
execution:
  - "ahead-of-time"
  - "native"
concurrency:
  - "channels"
  - "fork/join"
  - "tasks"
features:
  - "arena-allocation"
  - "c-interop"
  - "compile-time-evaluation"
  - "contracts"
  - "defer"
  - "error-sets"
  - "generics"
  - "linear-types"
  - "modules"
  - "pattern-matching"
  - "structured-concurrency"
  - "unsafe-blocks"
influences:
  - "Austral"
  - "C"
  - "Go"
  - "Odin"
  - "Rust"
  - "Swift"
  - "Zig"
relations:
  - name: "Austral"
    kind: "influenced-by"
  - name: "C"
    kind: "influenced-by"
  - name: "Go"
    kind: "influenced-by"
  - name: "Odin"
    kind: "influenced-by"
  - name: "Rust"
    kind: "influenced-by"
  - name: "Swift"
    kind: "influenced-by"
  - name: "Zig"
    kind: "influenced-by"
note: "A small systems language compiled through LLVM: ownership, borrowing and linear values checked from signatures, arenas as the default allocator, and structured tasks."
---
## Overview

Mk is a small, statically typed [systems language](/paradigms/systems) for
software that has to be fast and correct: tools, servers, runtimes and kernels.
Its compiler checks [ownership, borrowing and linear
values](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/memory.md#1-the-model)
from signatures alone and reaches native code through LLVM, with no garbage
collector and no C runtime.

## Code

::code-group

```mk [primitives]
export Main(sys: &System): WriteError!void {
    n := 41                               // `int`: the type comes from the value
    try sys.Print("{m}\n", (m: n *% 2))   // `*%` wraps where `*` would panic
}
```

```mk [combinations]
enum Shape {
    Circle(r: f64)
    Rect(w: f64, h: f64)
}

Half(): f64 {
    s := Shape.Rect(w: 2.0, h: 3.0)      // every field is named
    area := match s {                   // every variant, no `_` needed
        .Circle(r) { 3.14159 * r * r }
        .Rect(w, h) { w * h }
    }
    return area / 2.0
}
```

```mk [abstractions]
Max[T: Ord + Plain](xs: []T): ?T {      // the bound says what the body may do
    if xs.Len() == 0 {
        return none
    }
    var best := xs[0]
    for x in xs {
        if best.Less(&x) { best = x }
    }
    return some(best)
}
Top(): int {
    return Max([3, 1, 4][..]).Must()    // `Must` panics on `none`
}
```

```mk [idioms]
Bump(n: mut int) {
    *n += 1
}

export Main(sys: &System): OutOfMemory|WriteError!void {
    var n := 0
    scope s := sys.io.Scope() {        // the block joins its tasks
        s.go Bump(mut n)              // a task may borrow a local
    }
    var arena := try Arena.New(sys.heap)
    defer arena.Free()                 // what was made in it goes too
    upper := try "mk".ToUpper(&arena)
    try sys.Print("{upper} {n}\n", (upper, n))
}
```

::

::note
A literal, its wrapping operator and `try`; a value taken apart by `match`; a generic under a bound. A task joined by `scope`; an arena freed whole.
::

## Distinctive traits

- Borrowing without lifetimes: values hold the loans they depend on, and [`from`/`into` clauses](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/memory.md#5-signatures-at-a-glance) replace lifetime parameters.
- [Arenas are the default](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/rationale.md#why-are-arenas-the-default): `List`, `Map` and `Text` are freed with their region, so most functions never release memory.
- [Linear values](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/memory.md#r1-value-kinds) replace destructors: a file or arena must be consumed exactly once on every path, so a forgotten close is a compile error.
- Every fallible signature names its [error set](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/reference.md#9-errors); `try` is a prefix and integer overflow traps in release builds too.
- [Structured concurrency](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/memory.md#r17-tasks): a `scope` block joins its tasks, so a task may borrow a parent's local and conflicting loans do not compile.
- Small by design: no macros, no inheritance, no implicit conversions; [generics](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/reference.md#10-generics-and-interfaces), [contracts](https://github.com/zerodayokay/Mk-Lang/blob/main/doc/reference.md#15-contracts-and-tests), compile-time evaluation, `unsafe` blocks and [C](/languages/c) interop stay.

## Status

Mk 0.2.1 shipped in November 2026 under MIT, with release bundles for Windows,
Linux on x86-64 and ARM, and Apple silicon. A module is a directory; a package
is a `pkg.mk` manifest. Pre-1.0, a minor release may change stable items.
