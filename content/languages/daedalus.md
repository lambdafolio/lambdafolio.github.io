---
title: "DaeDaLus"
name: "DaeDaLus"
homepage: "https://galoisinc.github.io/daedalus/"
references:
  - url: "https://galoisinc.github.io/daedalus/"
    title: "DaeDaLus — user guide and reference"
  - url: "https://github.com/GaloisInc/daedalus"
    title: "DaeDaLus repository (GaloisInc/daedalus)"
  - url: "https://dl.acm.org/doi/10.1145/3656410"
    title: "Daedalus: Safer Document Parsing (PLDI 2024)"
  - url: "https://www.galois.com/project/daedalus"
    title: "Galois — DaeDaLus project page"
  - url: "https://www.galois.com/articles/building-daedalus-icarus-as-we-all-try-to-stay-out-of-the-sun"
    title: "Building DaeDaLus and ICARUS (Bill Harris, August 2020)"
  - url: "https://www.galois.com/articles/specifications-dont-exist"
    title: "Specifications Don't Exist (Mike Dodds, June 2025)"
author: "Galois, Inc."
kind: "language"
status: "active"
year: 2020
paradigms:
  - "declarative"
  - "domain-specific"
typing: "static"
type_system:
  - "adt"
  - "inferred"
  - "nominal"
execution:
  - "interpreted"
  - "transpiled"
features:
  - "biased-choice"
  - "bitdata-declarations"
  - "cpp-parser-generation"
  - "data-dependent-parsing"
  - "language-server"
  - "tagged-unions"
  - "type-inference"
  - "unbiased-choice"
relations:
  - name: "Haskell"
    kind: "implemented-in"
  - name: "C++"
    kind: "transpiles-to"
note: "Galois's declarative parser specification language: a format description is a typed program whose later parses are steered by values already parsed, and it generates a C++ parser from that description."
---
## Overview

DaeDaLus is [Galois](https://www.galois.com/)'s [domain-specific](/paradigms/domain-specific)
language for writing parsers as [declarative](/paradigms/declarative) format specifications, with
[data-dependent parsing](https://galoisinc.github.io/daedalus/tutorial/getting-started.html):
values produced early in a parse steer what is parsed later. It exists because
real formats [lack consensus specifications](https://www.galois.com/articles/specifications-dont-exist),
so a precise description that generates the parser is the practical alternative.

## Code

::code-group

```daedalus [primitives]
def GetByte    = UInt8          -- one arbitrary byte: a uint 8
def TheLetterA = $[ 'A' ]       -- one byte drawn from a byte set
def Magic      = Match "HELLO"  -- a byte sequence: result is [uint 8]
def Add =
  block                         -- values flow from parser to parser
    let x = UInt8
    $[ '+' ]
    let y = UInt8
    ^ x + y                     -- operators consume semantic values
```

```daedalus [combinations]
def RGB = {
  red = UInt8; green = UInt8; blue = UInt8;  -- named results: a structure
}
def PPM = {
  Match "P";
  version = UInt8;
  version == 3 is true;                      -- a guard reads that value
  width  = UInt8;
  height = UInt8;
  pixels = Many height (Many width RGB);     -- a field drives the count
}
```

```daedalus [abstractions]
def $digit = '0' .. '9'            -- a character class
def Digit  = $[ $digit ] - '0'     -- consumed for its semantic value
def Token P =
  block                            -- a parameterized parser
    $$ = P                         -- the result comes from P
    Many (1..) $[ ' ' ]            -- then trailing whitespace
def addDigit val d = 10 * val + (d as uint 64)  -- a value-level function
```

```daedalus [idioms]
bitdata ChooseOption where          -- bits, not bytes: a tagged union
  opt1 = 0x0 : uint 4
  opt2 = 0x1
bitdata OptionData where
  OptionData = { opt : ChooseOption, val : uint 4 }
def Options = block
  let odat = UInt8 as? OptionData   -- checked coercion, may backtrack
  case odat of
    OptionData x ->
      case x.opt of
        opt1 -> ^ x.val
        _    -> Fail "Wrong option"
```

::

::note
Bytes and arithmetic; a format whose fields drive their own [repetition](https://galoisinc.github.io/daedalus/user-guide/parsers.html#repetition) count and whose version guard steers parsing;
character classes, parameterized parsers and value functions as the definable units;
then the flagship idiom — [`bitdata`](https://galoisinc.github.io/daedalus/user-guide/bitdata.html) splits a byte into a
tagged union and [`as?`](https://galoisinc.github.io/daedalus/user-guide/types.html#coercions) checks it mid-parse, backtracking
on junk. Choice ([`First`](https://galoisinc.github.io/daedalus/user-guide/parsers.html#biased-choice) / [`Choose`](https://galoisinc.github.io/daedalus/user-guide/parsers.html#unbiased-choice)) is the
mechanism no tab can show: it is what makes ambiguity explicit.
::

## Distinctive traits

- [Data-dependent parsing](https://galoisinc.github.io/daedalus/tutorial/getting-started.html):
  values parsed earlier choose what is parsed next, so a size field drives the
  loop that reads the payload.
- [Unbiased choice](https://galoisinc.github.io/daedalus/user-guide/parsers.html#unbiased-choice)
  (`P | Q`) makes ambiguity explicit: both branches may succeed, and only
  composing with later parsers resolves the reading.
- A description compiles to a [C++](/languages/cplusplus) parser that deploys
  where the format is read; Galois [describes the language and toolchain as
  memory-safe](https://www.galois.com/project/daedalus).
- Widths live in the [types](https://galoisinc.github.io/daedalus/user-guide/semantic-values.html#numeric-types):
  `uint N` and `sint N` carry their bit count; `as` is lossless and checked
  statically, `as!` may lose information,
  [`as?`](https://galoisinc.github.io/daedalus/user-guide/types.html#coercions)
  checks at run time and backtracks on failure.
- Naming conventions split three declaration species — uppercase
  [parsers](https://galoisinc.github.io/daedalus/user-guide/declarations.html),
  lowercase semantic values, `$` character classes — with
  [implicit lifting](https://galoisinc.github.io/daedalus/user-guide/lifting.html)
  between the three contexts.
- Declarations need no type annotations: the checker infers types from naming
  convention and use, and names an unknown type `?a` when it cannot infer it.

## Status

[Version 1.0](https://github.com/GaloisInc/daedalus/releases/tag/v1.0) shipped
February 2026 under [BSD-3-Clause](https://github.com/GaloisInc/daedalus/blob/master/LICENSE).
Built by Galois for DARPA's [SafeDocs](https://www.darpa.mil/research/programs/safe-documents)
program; the interpreter is [Haskell](https://www.haskell.org/), and
[`daedalus compile-c++`](https://galoisinc.github.io/daedalus/tool-docs/daedalus.html#command-compile-c)
emits parsers in [C++](/languages/cplusplus). A
[language server](https://github.com/GaloisInc/daedalus/tree/master/syntax-highlight/vscode-daedalus)
ships for [VS Code](https://code.visualstudio.com/).

## History

DaeDaLus grew out of DARPA's [SafeDocs](https://www.darpa.mil/research/programs/safe-documents)
program (contract HR0011-19-C-0073) and was
[open-sourced in August 2020](https://www.galois.com/articles/building-daedalus-icarus-as-we-all-try-to-stay-out-of-the-sun).
Its motivating case was [PDF](https://www.iso.org/standard/75839.html):
Galois transcribed PDF's object syntax into it, and the
[PLDI 2024 paper](https://dl.acm.org/doi/10.1145/3656410) reports the
resulting safer-parsing work. In 2025 [Mike Dodds wrote](https://www.galois.com/articles/specifications-dont-exist)
that the project's formal PDF specification ended up non-descriptive and
non-normative — the format itself, he argues, has no coherent specification to
match.
