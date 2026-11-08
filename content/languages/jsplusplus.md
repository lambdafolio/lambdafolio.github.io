---
title: "JS++"
name: "JS++"
homepage: "https://www.onux.com/jspp/"
urls:
  - "https://www.onux.com/jspp/tutorials/type-system"
references:
  - url: "https://www.onux.com/jspp/tutorials/type-system"
    title: "The JS++ Type System — Onux (sound gradual typing, Unified External Type)"
  - url: "https://www.onux.com/jspp/blog/jspp-goes-into-public-beta/"
    title: "JS++ Goes Into Public Beta — Roger Poon (May 31, 2016)"
author: "Roger Poon, Anton Rapetov (Onux)"
kind: "language"
status: "dormant"
year: 2011
paradigms:
  - "functional"
  - "generic"
  - "imperative"
  - "object-oriented"
family: "ecmascript"
typing: "gradual"
type_system:
  - "nominal"
  - "inferred"
memory:
  - "gc"
execution:
  - "transpiled"
features:
  - "block-scoping"
  - "callback-types"
  - "dead-code-elimination"
  - "existent-types"
  - "function-overloading"
  - "integer-types"
influences:
  - "JavaScript"
  - "C"
  - "C++"
relations:
  - name: "JavaScript"
    kind: "transpiles-to"
note: "Typed JavaScript superset by Onux with an optional sound gradual type system: the Unified External Type walls off JS dynamics, C-style annotations hold at runtime, and integer types guarantee no NaN surprises."
---
## Overview

JS++ extends [JavaScript](/languages/javascript) with an optional type system whose declared types are guaranteed to hold at runtime — sound gradual typing for untyped-library interop. Compilation erases types and emits JavaScript, keeping deployment identical.

## Code

::code-group

```javascript [combinations]
import System;

external jQuery, $;               // one-line JS-library import

var offset = 0;                   // untyped: stays plain JavaScript

unsigned int pageHeight = $(document).height(); // guaranteed unsigned int

int[] rgb = [ 0xFF, 0xFA, 0xFF ]; // 32-bit ints, not doubles

int plus(int a, int b) {          // overloading needs types
    return a + b;
}
```

::

::note
`external` imports stay JavaScript-dynamic; annotated variables keep their
  types at runtime — annotations erase, guarantees compile in.
::

## Distinctive traits

- Unified External Type walls JavaScript's dynamics out of the checked region — no `any` contaminating soundness.
- Guaranteed types: annotated values hold at runtime (patented approach), unlike erasure-only gradual systems.
- Real integer types (8–64-bit, signed/unsigned) over JavaScript's single double, with `int+` existent types preventing out-of-bounds accesses at compile time.
- Nominal classes compile statically; no ASI — semicolons are required, so brace style is free.

## Status

Dormant: first release October 2011, modern implementation beta May 31 2016, stable reached 0.10.0 (December 2021) under a BSD license; compiler in C/C++ for Windows/macOS/Linux with no new release since.
