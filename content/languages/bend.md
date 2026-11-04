---
title: "Bend"
name: "Bend"
homepage: "https://bend-lang.com"
urls:
  - "https://hub.bend-lang.com/packages"
references:
  - url: "https://github.com/bendlang/bend/blob/main/paper/BendTT.pdf"
    title: "BendTT: An Affine Dependent Type Theory (Higher Order Company)"
  - url: "https://github.com/bendlang/bend/blob/main/paper/BendRT.pdf"
    title: "BendRT: A Parallel Runtime for CPUs and GPUs (Higher Order Company)"
  - url: "https://github.com/bendlang/bend/blob/main/guide/GUIDE.md"
    title: "Bend Guide - the language reference, also printed by `bend guide`"
  - url: "https://github.com/bendlang/bend"
    title: "Bend 2 - repository README, demos and releases"
  - url: "https://github.com/bendlang/bend/blob/main/bend2/bendtt.lean"
    title: "BendTT kernel - its Lean 4 formalization, used by `bend --verdict`"
  - url: "https://github.com/HigherOrderCO/Bend1"
    title: "Bend 1 - the original massively parallel language, now superseded"
  - url: "https://news.ycombinator.com/item?id=40390287"
    title: "Bend: a high-level language that runs on GPUs (via HVM2) - announcement, 17 May 2024"
author: "Victor Taelin et al. (Higher Order Company)"
kind: "language"
status: "experimental"
year: 2024
paradigms:
  - "concurrent"
  - "effect"
  - "functional"
  - "parallel"
typing: "static"
type_system:
  - "adt"
  - "dependent"
  - "linear"
memory:
  - "arc"
  - "ownership"
execution:
  - "ahead-of-time"
  - "native"
  - "transpiled"
concurrency:
  - "data-parallel"
  - "fork/join"
  - "tasks"
features:
  - "affine-types"
  - "closures"
  - "compile-time-templates"
  - "dependent-types"
  - "gpu-compilation"
  - "laws-and-proofs"
  - "monadic-effects"
  - "parallel-calls"
  - "pattern-matching"
  - "termination-checking"
influences:
  - "Lean"
  - "Python"
  - "Rust"
relations:
  - name: "Lean"
    kind: "influenced-by"
  - name: "Coq"
    kind: "shares-ancestor-with"
  - name: "Agda"
    kind: "shares-ancestor-with"
  - name: "Python"
    kind: "influenced-by"
  - name: "Rust"
    kind: "influenced-by"
note: "Pure, affine, dependency-typed: Bend compiles to native CPU and GPU code, and its checker proves the laws stated beside the code, so a program and its correctness proof live in one file."
---
## Overview

Bend is a pure, statically typed language whose checker is also a proof
assistant, in the tradition of [Lean](/languages/lean). Programs and their
proofs live together: a law states a fact, a definition discharges it, and the
compiler emits native CPU and GPU code that spreads independent calls across
every core.

## Code

::code-group

```python [primitives]
import Base
def main() -> String:
  +a = (6 * 7 : U32)   # `+` may be copied; operators are Base names
  b  = U32.to_nat(a)   # conversions are T.to_x and T.from_x
  U32.show(a) ++ " = " ++ Nat.show(b)
```

```python [combinations]
import Base
def sum(xs: List<U32>, acc: U32) -> U32:
  match xs:
    case Nil{}:
      acc
    case Con{h, t}:
      sum(t, (acc + h : U32))   # a smaller input: termination
```

```python [abstractions]
import Base
def adder(k: U32) -> U32 -> U32:
  x => (x + k : U32)            # a closure captures k
def twice(~f: U32 -> U32, x: U32) -> U32:
  f(f(x))                      # `~` substitutes at compile time
def pow2(+n: Nat) -> U32:
  match n:
    case 0n:
      1
    case 1n+p:
      a b = pow2(p) pow2(p)     # parallel call
      (a + b : U32)
def main() -> IO(Unit):
  add2 = adder(2)              # a closure, applied below
  do IO<Unit>:                  # effects live in an IO monad
    IO.print(U32.show(add2(40)))
    IO.print(U32.show(twice(~(x => (x + 1 : U32)), 40)))
    IO.print(U32.show(pow2!(20n)))  # `!` runs on the GPU
```

```python [idioms]
import Base
law add_zero:
  for x: Nat
  {Nat.add(x, 0n) == x : Nat}
def add_zero(x):
  match x:
    case 0n:
      {==}
    case 1n+p:
      %add_zero(p) : {1n+Nat.add(p, 0n) == 1n+_ : Nat}
      {==}
```

::

Caption: literals with operators; a list matched, then effects in an IO
monad; closures, templates, parallel calls and a GPU call; a law proven by a def.

## Distinctive traits

- Affine by default, resource-aware like [Rust](/languages/rust): a value has one owner, so a match frees the node it opens and no garbage collector runs.
- Laws and proofs share one file: a `law` states a fact, a `def` of the same name proves it.
- Parallel calls are the idiom: an independent pair forks, and `!` sends the whole subtree to the GPU.
- Dependent types without universes: `Type : Type` holds, because running code may not copy a function - what [Coq](/languages/coq) forbids for consistency.
- Termination is checked, not assumed: recursive calls must consume a smaller part of their input.
- One C file per program is both the CPU binary and the GPU kernel, so one source runs on either chip.

## Status

Young but fast-moving: Bend 2.0.39 (October 2026) ships under Apache-2.0 with Python-shaped syntax and C, Metal, CUDA and JavaScript targets. The type theory is mechanized in [Lean](/languages/lean), but the checker itself is unproven, and Windows is unsupported.

## History

Started in 2023 as HVM-Lang, an intermediate representation for the HVM runtime; it took the name Bend in May 2024 and shipped to crates.io as `bend-lang`. Bend 2 is a ground-up rewrite that carries no Bend 1 programs over: the interaction-net runtime was dropped for a flat, stackless evaluator, and the type system became an affine dependent type theory.
