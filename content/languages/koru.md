---
title: "Koru"
name: "Koru"
homepage: "https://www.korulang.org/"
urls:
  - "https://github.com/korulang/koru"
  - "https://www.korulang.org/blog/introducing-koru"
  - "https://www.korulang.org/playground"
references:
  - url: "https://github.com/korulang/koru"
    title: "Koru — GitHub"
  - url: "https://www.korulang.org/blog/introducing-koru"
    title: "Introducing Koru (blog)"
  - url: "https://www.korulang.org/playground"
    title: "Koru playground"
author: "ungedenstad & contributors"
paradigms:
  - "continuation"
  - "effect"
  - "systems"
execution:
  - "native"
note: "Event continuation/effect language ('The Continuation Language') with phantom-obligation resource tracking, compile-time metaprogramming, no runtime, and three emitters: native via Zig, JavaScript, and C#"
---
## Overview

Koru is an event continuation/effect language for uncompromising systems
programming, billed as "The Continuation Language". Its core abstraction is
the `tor` (renamed from `event` in July 2026): a unit that declares its
named exits up front, and every caller must handle each one — no hidden
exceptions, and partial handling is a compile error.

## Code

::code-group

```koru [abstractions]
import std/io

tor greet { name: string } -> string     // tor: typed input record + result
greet
-> "Hello, " ++ name ++ "!"              // expression body

greet (name: "World"): msg |>            // invoke; |> opens outcome handling
std/io:print.ln(msg)                     // msg bound by punning
```

::

::note
The `tor` is the definable unit — declared exits force every caller into a
  handler chain; invocation *is* control flow (consuming the successful branch
  binds `msg` ).
::

## Distinctive traits

- Tor + mandatory outcome arms: callers handle every named exit; partial
  handling is a compile error — outcomes are control flow, not values.
- Phantom obligations: the `!` suffix mints a compile-time obligation
  (`string<connected!>`), a `<!state>` param discharges it — resource
  protocols, taint tracking, and units of measure at zero runtime cost.
- Impurity tracked transitively across the call graph; host code (syscalls,
  C libraries, FFI) confined to a typed `proc` escape hatch.
- No runtime, no GC: ~4.8 KB static hello-world ELF; native/JS/C# emitters,
  playground running the full pipeline client-side via WASM.
- Comptime metaprogramming through typed `ProgramAST`/`Source` parameters;
  templates rather than macros; self-hostable compiler pipeline.

## Status

Pre-release v0.1.x (npm-installable, MIT); compiler self-hosts in Zig and
emits native (Zig), JavaScript, and C# backends. Benchmarks are prominent
self-claims (sieve vs Rust, Orisha nginx) from the project itself.
