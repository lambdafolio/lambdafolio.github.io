---
title: "Glam"
name: "Glam"
homepage: "https://github.com/dmbarbour/glam"
references:
  - url: "https://github.com/dmbarbour/glam/blob/main/docs/Design.md"
    title: "Glam Design (docs/Design.md)"
  - url: "https://github.com/dmbarbour/glam/blob/main/docs/SyntaxCheatSheet.md"
    title: "glam .g syntax cheat sheet"
  - url: "https://github.com/dmbarbour/glam/blob/main/docs/DesignPrinciples.md"
    title: "Design Principles"
  - url: "https://github.com/dmbarbour/glam/blob/main/docs/architecture/values.md"
    title: "Managed Value Architecture (glam-gc)"
author: "David Barbour"
kind: "language"
status: "experimental"
year: 2026
paradigms:
  - "effect"
  - "functional"
  - "modular"
  - "object-oriented"
typing: "untyped"
memory:
  - "gc"
execution:
  - "interpreted"
concurrency:
  - "software-transactional-memory"
  - "tasks"
features:
  - "annotations"
  - "content-addressed-imports"
  - "do-notation"
  - "exact-rationals"
  - "freer-effects"
  - "interaction-nets"
  - "lazy-evaluation"
  - "macros"
  - "objects"
  - "pattern-matching"
relations:
  - name: "Rust"
    kind: "implemented-in"
note: "A high-level language for composing assembly-level software: an untyped, lazy lambda calculus whose modules are mixins, whose assembly steps are effects, and whose builds are reproducible."
---
## Overview

Glam is a high-level language for composing assembly-level software: a lazy, untyped lambda calculus whose modules are mixins and whose instructions are written as effects. It exists so binaries and filesystem images can be described reproducibly, extensibly, and with metaprogramming over layout.

## Code

::code-group

```glam [primitives]
language g0

n = 42                  # decimal
r = 1/6                 # exact rational, never rounded
flag = 'ready           # atom
text = "Hello, World!"  # raw text, no escapes

sum = n + 1             # 43
```

```glam [combinations]
language g0
import 'std

xs = [72, 101] ++ [111]         # append, not cons
tail = list.at 1 xs             # 101, zero-based
d = {name:"glam", tags:{rev:'b1}}
who = d.name                    # path index

literal input = match input as
  42 => "number"
  'ready => "atom"
  _ => "other"
```

```glam [abstractions]
language g0

add x y = x + y         # sugar for a lambda binding

object base with
  hello = "Hello"
  target = "Base"

object greeting extends base with
  target := "World"     # override an inherited definition
```

```glam [idioms]
language g0
import "x86.g" as x86

main = do
  .global "_start"
  .movl 'rax 60
  .xor 'rdi 'rdi
  .syscall

asm.result = x86.mkelf main
```

::

::note
Three ideas meet here: values are exact and lazy, names resolve through
hierarchical dictionaries that objects override, and machine instructions are
plain effects — so `do` blocks are assembly and `asm.result` is the output.
Shapes follow the project's cheat sheet and samples.
::

## Distinctive traits

- Untyped and lazy: the assembly is a pure lambda-calculus value, so evaluation is demand-driven and unused modules are never forced.
- Modules are mixins in one namespace object; every definition is exported and can be overridden (`:=`) or updated in place (`::=`).
- Assembly instructions are effects written with `do`-notation, so procedures act as assembly macros and targets live in libraries.
- Pattern matching is a branching effect: `match` commits to the first complete success, `match*` returns every result as a lazy list.
- Interaction nets are the escape hatch: `interaction_net` builds an opaque graph behind a lambda interface, and `anno` attaches reflection without changing values.
- Reproducibility is designed in: imports are content-addressed and reflection cannot influence the pure `asm.result`.

## Status

An experimental bootstrap: the `glam` assembler is written in [Rust](/languages/rust) under GPL-3.0 and pins its toolchain. Documentation separates intended design from implemented behavior, and no tagged releases exist yet.
