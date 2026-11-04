---
title: "Hurl"
name: "Hurl"
homepage: "https://ntietz.com/blog/introducing-hurl/"
urls:
  - "https://news.ycombinator.com/item?id=36393673"
references:
  - url: "https://news.ycombinator.com/item?id=36393673"
    title: "Hacker News discussion"
author: "n. tietz"
note: "A language where the only control flow is error handling (toss/throw); unrelated to the hurl.dev request automation tool"
---
## Overview

Hurl is a dynamically typed scripting language with exactly one
control-flow mechanism: `toss`/`hurl` plus `try`/`catch`. Its creator
designed it to explore how far error handling can go when it is the only
way to branch — loops included, via resumption.

## Code

::code-group

```hurl [abstractions]
let add = func(x, y) {
  hurl x + y;                   // hurl = throwing return: no return keyword
};
try {
  hurl add(1, 2);
} catch (true) {                // catch matches by value equality
  print("(unreachable)");
} catch as v {                  // catch-all by name binds the tossed value
  print("got " + v);
}
```

```hurl [idioms]
let count = func(args) {
  let iter = args[1]; let limit = args[2];
  print("round " + iter);
  toss [iter + 1, limit];       // toss remembers the stack index...
  hurl iter < limit;
};
let loop = func(loop_, body, locals) {
  try { body(locals); } catch as new_locals {
    try { return; } catch (true) {
      loop_(loop_, body, new_locals);   // ...and resumes here on return
    } catch (false) { hurl new_locals; }
  }
};
loop(loop, count, [1, 3]);
```

::

::note
Idioms — `toss` marks a resumption point: `return` inside a matching `catch`
  jumps back to the `toss` site, which is how Hurl builds loops.
::

## Distinctive traits

- One control construct: `try`/`catch` doubles as selection, iteration, and
  every conditional — branching is value-matching.
- `toss` vs `hurl`: only `toss` remembers its stack index, enabling
  resumption after a caught throw.
- Functions are anonymous `func` values in `let` bindings; no recursion,
  since the name is not bound during definition.
- Dynamically typed with JS-like literals; semicolons required.

## Status

A personal experiment by Nicole Tietz-Sokolskaya, introduced in a 2023 blog
post with implementation and examples. Unrelated to the hurl.dev HTTP
request tool of the same name.
