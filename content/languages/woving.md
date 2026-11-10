---
title: "woving"
name: "woving"
homepage: "https://github.com/pcsteppan/woving"
references:
  - url: "https://github.com/pcsteppan/woving"
    title: "woving — domain specific pattern language for loom drafts (pcsteppan/woving, MIT)"
  - url: "https://github.com/pcsteppan/woving/blob/main/woving.ne"
    title: "woving.ne — the Nearley grammar for the language"
  - url: "https://www.npmjs.com/package/woving"
    title: "woving on npm — parser and evaluator for woving patterns"
author: "Patrick Steppan"
kind: "language"
status: "experimental"
year: 2023
paradigms:
  - "domain-specific"
features:
  - "hexadecimal-digits"
  - "repeat-operator"
  - "step-array"
  - "symmetry-operator"
  - "point-symmetry"
  - "random-drop"
note: "A pattern language over loom drafts: a draft's threading and treadling are long numeric sequences, and woving's operators expand repetition, step arrays, symmetry, and random variation into them."
---
## Overview

woving is a [domain-specific](/paradigms/domain-specific) pattern language for
loom drafts, describing itself as a notation system for "concise loom draft
instructions". A draft's threading and treadling are sequences of shaft numbers;
woving adds operators for the regularities weavers apply by hand.

## Code

The grammar accepts one expression and no comment or newline, so each tab below
is annotated pseudocode: the comment lines explain, and only the plain expression
lines are fed to the parser, one per run. Annotations are outside the language.

::code-group

```woving [primitives]
; shafts are the digits 1-9 plus a-f — no 0 — so fifteen indices fit
2341
; hex letters stand for shafts 10 to 15, keeping one character apiece
8caf
; two runs written side by side concatenate
2341 2341
```

```woving [combinations]
; a bracketed group is a subexpression; a single space joins
2341 2233
; a plus joins too, but it consumes exactly one character — no spaces
2341+2233
; groups nest, so a prefix can be shared across two runs
[2341 2:3] 3:4
```

```woving [abstractions]
; the group plus its postfix operators is the only abstraction —
; there are no bindings, so a shared run is written inline
[2341 2:3 3:3 4:3 1:4 2341]
; : repeats (1:4 -> 1111), /.../ walks a step array
1:4
/141/
; | mirrors a run and ! drops the pivot (123| -> 123321, 123! -> 12321)
123|
123!
```

```woving [idioms]
; the README's threading: a long run of digits written as one expression
[2341 2:3 3:3 4:3 1:4 2341]|
; and the treadling of the same draft
[/14/12/1324/3414/14/1]!
; a probabilistic operator drops the step at random, for variation
1?
```

::

::note
Read the operators as moves a weaver already makes: `1:4` is four picks of shaft
1, `/141/` walks up and back down, `|` and `!` mirror a run even or odd, `1?`
keeps or drops it. The grammar is a [Nearley](https://nearley.js.org/) file, so
the language is exactly its postfix and `:` forms — no bindings, no flow control,
and no comments or newlines, which is why each expression above must be parsed on
its own.
::

## Distinctive traits

- A draft's long numeric sequences collapse into one expression, which the evaluator expands back to indices.
- Postfix operators carry weaving's own regularities — repeat `:`, step `/,/`, mirror `|`, and `!`, which mirrors without repeating the pivot (point symmetry).
- Hexadecimal letters index shafts 10 to 15, so a 15-shaft draft keeps one character per position (the grammar has no `0`).
- Groups nest and concatenate, so one shared prefix can open a block of related runs.
- The grammar is eight nonterminals in `woving.ne`, so the whole language is auditable in a screenful.

## Status

Published to [npm](https://www.npmjs.com/package/woving) as `woving` (MIT) starting
July 2023, currently at 1.3.0. The README calls it "a work in progress", with one
author. Unlike [Knitout](/languages/knitout), which drives knitting needles, woving
writes the shaft and treadling sequences of a loom draft.
