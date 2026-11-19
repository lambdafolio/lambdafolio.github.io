---
title: "MicroHs"
name: "MicroHs"
homepage: "https://github.com/augustss/MicroHs"
references:
  - url: "https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md"
    title: "MicroHs — manual: language, compiler, combinator encoding, runtime"
  - url: "https://github.com/augustss/MicroHs/wiki/Language"
    title: "MicroHs — supported extensions and standard-library coverage (wiki)"
  - url: "https://github.com/augustss/MicroHs/blob/master/doc/COMB.md"
    title: "The combinator file format — MicroHs runtime object code"
  - url: "https://dl.acm.org/doi/10.1145/3677999.3678280"
    title: "MicroHs: A Small Compiler for Haskell — Augustsson, Haskell Symposium 2024"
  - url: "https://arxiv.org/abs/2607.10443"
    title: "CloudMicroHaskell: Direct-Style Distributed Haskell via Runtime Graph Serialisation — uses the MicroHaskell spelling"
  - url: "https://hackage.haskell.org/package/MicroHs"
    title: "MicroHs on Hackage — release history (first upload 0.8, November 2023)"
  - url: "https://www.haskell.org/onlinereport/haskell2010/"
    title: "The Haskell 2010 Language Report"
author: "Lennart Augustsson"
kind: "dialect"
status: "experimental"
year: 2023
paradigms:
  - "functional"
typing: "static"
type_system:
  - "adt"
  - "inferred"
  - "parametric-polymorphic"
memory:
  - "gc"
execution:
  - "ahead-of-time"
  - "native"
concurrency:
  - "green-threads"
  - "software-transactional-memory"
features:
  - "bootstrapping"
  - "combinator-graph-reduction"
  - "first-class-functions"
  - "lazy-evaluation"
  - "modules"
  - "overloaded-records"
  - "pattern-matching"
  - "string-interpolation"
relations:
  - name: "Haskell"
    kind: "dialect-of"
  - name: "C"
    kind: "implemented-in"
note: "Lennart Augustsson's Haskell compiler: an extended subset of Haskell 2010 translated to SKI combinators and reduced by a small C runtime, so a C compiler is the only build requirement and the whole system fits on a micro-controller."
---

## Overview

MicroHs (also written
[*MicroHaskell*](https://arxiv.org/abs/2607.10443)) is [Lennart Augustsson](https://github.com/augustss)'s
compiler for an extended subset of [Haskell 2010](https://www.haskell.org/onlinereport/haskell2010/),
translated to combinator graphs rather than native code. It exists so that a
[functional](/paradigms/functional) [Haskell](/languages/haskell) toolchain
needs only a C compiler to build, and fits on a micro-controller.

## Code

::code-group

```haskell [primitives]
-- literals construct; operators consume.
name  = "MicroHs"
year  = 2023 :: Int
greet = s"Hello ${name}, since ${year + 1}"   -- MicroHs string interpolation
half  = 3 / 4 :: Double
```

```haskell [combinations]
-- algebraic data types compose; record fields and patterns consume.
data Color = Red | Green | Blue
  deriving (Eq, Show)

data Point = Point { px :: Double, py :: Double }
  deriving (Show)

shift :: Point -> Point
shift p = p { px = p.px + 1 }   -- overloaded record dot and update
```

```haskell [abstractions]
-- a type class is the definable unit; an instance supplies its dictionary.
class Describe a where
  describe :: a -> String

instance Describe Color where
  describe Red   = "red"
  describe Green = "green"
  describe Blue  = "blue"

-- dictionary selection consumes the abstraction:
-- the method is an ordinary value, so the higher-order `map` takes it.
allColors :: String
allColors = unwords (map describe [Red, Green, Blue])
```

```haskell [idioms]
-- recursion over patterns is the idiom; the graph reduces on demand.
fac :: Integer -> Integer
fac 0 = 1
fac n = n * fac (n - 1)

evens :: [Int] -> [Int]
evens xs = [x | x <- xs, even x]        -- list comprehension, produced lazily

main :: IO ()
main = print (map fac [1 .. 10], evens [1 .. 20])
```

::

::note
One tab per tour slot: literals with operators, algebraic data types with
records, a class becoming a dictionary, and lazy recursion as the community
idiom. All of it is [bracket-abstracted](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#combinators)
to `S`, `K`, and `I`, so `fac` reaches the runtime as a graph that the C
evaluator reduces — no lambda survives into the object code.
::

## Distinctive traits

- Combinators are the object code: lambdas become `S`/`K`/`I`, so the runtime
  is a [graph-reduction machine](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#the-evaluator)
  written in [C](/languages/c).
- Bootstrapping without GHC: the compiler is written in MicroHs itself, and
  [`generated/mhs.c`](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#bootstrapping)
  lets a C compiler rebuild it from scratch.
- The dialect diverges from GHC: [string interpolation](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#string-interpolation)
  and overloaded [record](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#records)
  access and update are MicroHs syntax, not extensions you opt into.
- Heap and stack are fixed sizes chosen by
  [runtime flags](https://github.com/augustss/MicroHs/blob/master/doc/MicroHs.md#runtime-flags),
  which is what makes the micro-controller targets possible.
- Every supported extension is always on and `LANGUAGE` pragmas are ignored, so
  one fixed dialect compiles every module.

## Status

Released and maintained, though the package metadata still declares its
stability experimental. [Hackage](https://hackage.haskell.org/package/MicroHs)
carries 0.8 (November 2023) through 0.16 under Apache-2.0, shipping `mhs`,
`cpphs`, and `mcabal`; the repository is already at 0.17, with targets spanning
Unix, Windows, WebAssembly, and micro-controllers.
