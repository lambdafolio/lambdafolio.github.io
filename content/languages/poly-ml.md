---
title: "Poly/ML"
name: "Poly/ML"
homepage: "https://www.polyml.org/"
urls:
  - "https://www.polyml.org/FAQ.html"
references:
  - url: "https://www.polyml.org/FAQ.html"
    title: "Poly/ML FAQ"
author: "David Matthews"
family: "ml"
note: "An implementation of Standard ML"
---
## Overview

Poly/ML is David Matthews' implementation of Standard ML, begun at
Cambridge's Computer Laboratory and continuously maintained since the
1980s. It is best known as the environment where Isabelle/HOL, the proof
assistant, is developed and run.

## Code

::code-group

```sml [abstractions]
fun double 0 = 0                    (* pattern-matching fun clauses   *)
  | double n = n + double (n - 1);

val langs = [("Lustre", 1985), ("SML", 1983)];
val names = map #1 langs;           (* selector on tuples             *)

structure Stats =                   (* structures compose namespaces  *)
struct
  fun mean xs = real (foldl (op +) 0 xs) / real (length xs)
end;

Stats.mean [1, 2, 3];               (* invocation: 2.0                *)
```

::

::note
`fun` /`val`/`structure` are the definable units — recursive functions,
  first-class values, and module namespaces, invoked plainly by name.
::

## Distinctive traits

- Full Standard ML: Hindley–Milner type inference, pattern matching, strict
  evaluation, and the Standard ML Basis library.
- Persistent (fixed-limit) store: a run-time database survives crashes, letting Isabelle maintain large proof states reliably.
- Foreign-function interface to C and an interactive top level with
  incremental compilation.

## Status

Actively maintained open source (LGPL); the polyml.org site distributes
5.x releases. First-class citizen of the proof community as Isabelle/HOL's
Standard ML runtime; also usable as a general-purpose SML implementation.
