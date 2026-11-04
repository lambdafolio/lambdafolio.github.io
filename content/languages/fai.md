---
title: "Fai"
name: "Fai"
homepage: "https://github.com/Krzysztof-Cieslak/fai"
urls:
  - "https://github.com/Krzysztof-Cieslak/fai"
  - "https://github.com/Krzysztof-Cieslak/fai/blob/main/llms.txt"
references:
  - url: "https://github.com/Krzysztof-Cieslak/fai/blob/main/llms.txt"
    title: "llms.txt agent guide"
author: "Krzysztof Cieślak"
paradigms:
  - "effect"
  - "functional"
typing: "static"
execution:
  - "native"
features:
  - "contracts"
influences:
  - "ML"
  - "F#"
  - "Elm"
  - "Koka"
note: "Small, strict, pure, statically typed functional language in the ML/F#/Elm family with row-based effects and capabilities (Koka-inspired), executable contracts (example/forall), Perceus-style ref-counting, and an incremental Rust compiler emitting native code via Cranelift; designed for fast edit→check→test loops by humans and AI agents"
---
## Overview

Fai is a small, strict, pure, statically typed functional language in the
ML / F# / Elm family, described as a "programming language for AI age". Its
type system centers on visible capabilities and effects (row-based, Koka
inspired): capabilities like the console are values passed from `main`, and
a function's effect row appears after `/` in its type — unannotated means
pure.

## Code

::code-group

```fai [abstractions]
module Collections
/// Apply f to every element.
public map : ('a -> 'b / 'e) -> List 'a -> List 'b / 'e   // effect row
let map f xs =
  match xs with
  | [] -> []
  | x :: rest -> f x :: map f rest

example: map (fun x -> x + 1) [1, 2, 3] = [2, 3, 4]
forall xs: map (fun x -> x) xs = xs       // executable contracts
```

```fai [idioms]
public greet : Console -> String -> Unit / { Console }   // capability-typed
let greet console name = console.writeLine ("Hello, " ++ name)

public main : Runtime -> Unit / { Console }
let main runtime = runtime.console.writeLine "Hello, Fai!"
```

::

::note

- Top-level `let` + a signature line is the definable unit — the effect row
    `/ 'e` is the function's exact interface.
- Capabilities are ordinary values — `main` receives the `Runtime` row and hands
    `console` down; the row after `/` is the whole permission footprint.

::

## Distinctive traits

- ML-tradition surface: significant indentation, exhaustive `match`,
  discriminated unions, structural records, F#-style `'a` type variables.
- Visible effects: a function type is self-describing — the row after `/`
  is sorted, exact, and inferred; no row annotation means pure.
- Executable contracts: `example:`/`forall:` declarations are type-checked
  code next to functions (`fai check`, property tests with shrinking).
- Incremental Rust compiler on Salsa; native code via Cranelift (AOT/JIT);
  Perceus-style ref-counting with reuse — pragmatic edit→check→test loops.

## Status

Early release (v0.1.0, MIT) by Krzysztof Cieślak with an open Rust
compiler; tooling (CLI, LSP, formatter, `llms.txt`, JSON diagnostics) is
the project's focus. Early-stage.
