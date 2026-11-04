---
title: "Linda"
name: "Linda"
urls:
  - "https://www.netlib.org/utk/papers/comp-phy7/node3.html"
  - "https://en.wikipedia.org/wiki/Linda_(coordination_language)"
references:
  - url: "https://www.netlib.org/utk/papers/comp-phy7/node3.html"
    title: "Linda — origins (Gelernter paper)"
author: "David Gelernter"
note: "Coordination language for parallel computing; cooperating processes communicate through associative tuple spaces"
---
## Overview

Linda is a coordination language: David Gelernter's model in which
cooperating processes share an associative *tuple space* rather than
channels or locks. It was embedded as a library layer into host languages
such as C and Fortran.

## Code

::code-group

```c [combinations]
/* C-Linda: tuples live in a shared associative space. */
out("result", i, value[i]);               /* construct: add a tuple        */
in("request", ?worker, ?task);            /* consume: block until a match  */
rd("config", "scale", ?s);                /* read without removing         */
eval("fft", n, data);                     /* construct + run as process    */
```

::

::note
`out` /`in`/`rd` are tuple-space primitives — processes combine by *adding
  tuples* and consume by *associative matching* (`?x` binds), so producers and
  consumers never name each other.
::

## Distinctive traits

- Generative communication: a tuple outlives its producer and is consumed by
  pattern match, decoupling processes in time and space.
- Associative addressing: data is found by content, not by address or
  channel name — the model predates and parallels key-value stores.
- `eval` makes processes first-class: a tuple whose fields are computed
  concurrently, joining the space as its value.

## Status

Defined by Gelernter at Yale (1985–86; the CACM paper) and embedded in
host languages through the Linda standardization efforts; commercial
runners included Scientific Computing Associates' Paradise. Its influence
echoes in JavaSpaces and later tuple-space systems.
