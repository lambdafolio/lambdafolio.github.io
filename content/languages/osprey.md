---
title: "Osprey"
name: "Osprey"
homepage: "https://www.ospreylang.dev/"
references:
  - url: "https://github.com/Nimblesite/osprey"
    title: "Osprey repository (Nimblesite/osprey)"
  - url: "https://www.ospreylang.dev/status/"
    title: "Osprey feature status"
  - url: "https://www.ospreylang.dev/spec/0017-algebraiceffects/"
    title: "Osprey specification 0017 - Algebraic effects"
  - url: "https://www.ospreylang.dev/spec/0004-typesystem/"
    title: "Osprey specification 0004 - Type system"
  - url: "https://www.ospreylang.dev/docs/effects/"
    title: "Osprey guide - Algebraic effects"
  - url: "https://github.com/Nimblesite/osprey/releases/tag/v0.1.0"
    title: "Osprey v0.1.0 release (June 2025)"
logo: "/logos/osprey.png"
author: "Christian Findlay (Nimblesite)"
kind: "language"
status: "experimental"
year: 2025
paradigms:
  - "concurrent"
  - "effect"
  - "functional"
  - "modular"
typing: "static"
type_system:
  - "adt"
  - "effect-system"
  - "inferred"
  - "parametric-polymorphic"
  - "structural"
memory:
  - "arc"
  - "gc"
execution:
  - "ahead-of-time"
  - "native"
concurrency:
  - "channels"
  - "kernel-threads"
features:
  - "algebraic-effects"
  - "arithmetic-effects"
  - "fibers"
  - "hindley-milner-inference"
  - "modules"
  - "multiple-syntax-flavors"
  - "pattern-matching"
relations:
  - name: "Rust"
    kind: "implemented-in"
  - name: "Python"
    kind: "interoperates-with"
note: "A functional language where failure is a `Result` value and outside work is a checked algebraic effect: the program's edge installs the handlers, so production code and its test doubles are the same code. It compiles through LLVM."
---
## Overview

Osprey is a [functional](/paradigms/functional) language built on [algebraic effects](/paradigms/effect): code asks for a disk, a log line or a clock with `perform`, and the program's edge decides what answers. It compiles through LLVM to native binaries, `wasm32-wasip1` modules and C-ABI libraries for mobile hosts.

## Code

::code-group

```osprey [primitives]
let count: int = 42
let ratio = 3.5
let name = "Osprey"
let total = count * 2 + 1
let fits = total < 100
let label = fits ? "fits" : "over"
print("${name}: ${total} at ${ratio}, ${label}")
```

```osprey [combinations]
type Point = { x: int, y: int }
let values = [1, 2, 3]                    // List<int>
let ages = { "Alice": 25, "Bob": 30 }     // Map<string, int>
let origin = Point { x: 0, y: 0 }
let moved = origin { x: 15 }              // immutable update: a copy

fn firstOf(xs) = match xs {
    []              => 0
    [head, ...tail] => head
}
let alice = ages["Alice"] ?: 0            // lookup is a Result; ?: supplies the default
print("${firstOf(values)} ${alice} ${moved.x}")
```

```osprey [abstractions]
type Shape = Circle { radius: float } | Rectangle { width: float, height: float }

fn identity(x) = x                        // inferred: <T>(T) -> T
fn apply(value, transform) = transform(value)
fn makeAdder(n) = fn(x) => x + n          // closure captures n

fn area(shape) = match shape {            // exhaustive: no catch-all arm
    Circle { radius }           => 3.14159 * radius * radius
    Rectangle { width, height } => width * height
}
print("${identity(7)} ${apply(21, makeAdder(1))}")
```

```osprey [idioms]
effect Files { write: fn(string, string) -> Result<int, Error> }

fn writeLock(lock) = match perform Files.write("osprey.lock", lock) {
    Success _         => "installed"
    Error { message } => "rolled back: ${message}"
}

// The edge installs the real disk once; a test installs a full one.
let disk = handler Files { write path text => writeFile(path, text) }
let full = handler Files { write _ _ => Error { message: "disk full" } }
let work = fn() => writeLock("a = 1")
print("${disk(work)} ${full(work)}")
```

::

::note
Slots run literals, collections, [functions and unions](https://www.ospreylang.dev/spec/0004-typesystem/#function-types), then the effects idiom that defines the language. `writeLock` takes no disk, so swapping `full` for `disk` changes only the boundary; removing both is a compile error, not a runtime one.
::

## Distinctive traits

- `effect` declares a need, `perform` asks for it, a handler answers it — and an unhandled request fails compilation.
- [Hindley-Milner inference](https://www.ospreylang.dev/spec/0004-typesystem/#hindley-milner-inference) everywhere, so annotations are optional and a redundant one is reported as a warning.
- Arithmetic is total: `+`, `-`, `*` never trap, and overflow or division by zero become [`Arith` effect](https://www.ospreylang.dev/spec/0037-arithmeticeffects/) operations a region handles.
- Three [surface syntaxes](https://www.ospreylang.dev/blog/2026-06-30-osprey-flavors/) - Default, ML and Python-shaped - lower to one AST, and module signatures keep public types explicit.
- LLVM output: native executables, `wasm32-wasip1` modules and C-ABI mobile archives; memory is a per-build pick of tracing GC, ARC or unmanaged.
- Fibers with buffered channels; the current runtime backs each fiber with its own OS thread.

## Status

Pre-1.0 (v0.28.2, November 2026) and actively evolving; the project asks that workloads be validated before production use. MIT licensed, written in Rust, distributed through Homebrew and Scoop with a language server and VS Code extension.
