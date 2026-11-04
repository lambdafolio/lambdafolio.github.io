---
title: "Cosmos"
name: "Cosmos"
homepage: "https://cosmos-lang.github.io/"
references:
  - url: "https://cosmos-lang.github.io/"
    title: "Cosmos official site"
kind: "language"
paradigms:
  - "functional"
  - "logic"
  - "object-oriented"
note: "A modern logic scripting language; relations may yield multiple results, unlike functions"
---
## Overview

Cosmos is a logic-oriented scripting language from cosmos-lang.github.io
where relations may yield multiple results — unlike functions, which return
exactly one. Its site describes a pragmatic blend of logic, functional, and
object-oriented styles.

## Code

::code-group

```cosmos [abstractions]
parent(tom, luke)
parent(luke, peter)
?parent(tom, X)                   // query: X = luke
grandparent(A, C) :- parent(A, B), parent(B, C)
?grandparent(tom, X)              // X = peter
```

::

::note
A *relation* is the definable unit — `parent/2` facts and rule bodies define
  multi-result mappings via unification; consumption is the `?goal` query.
::

## Distinctive traits

- Relations are not functions: a query can bind multiple satisfying
  solutions, streamed rather than returned once.
- Logic + scripting hybrid (per its homepage's own description): rule
  bodies mix conjunction, built-ins, and scripting-style control.
- Object-oriented and functional constructs sit beside the logic core for
  structuring larger scripts.

## Status

Early personal project by the cosmos-lang maintainers, hosted at
cosmos-lang.github.io with documentation and examples on the site.
Experimental; no industrial adoption described.
