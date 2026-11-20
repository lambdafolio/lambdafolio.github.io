---
title: "LemmaScript"
name: "LemmaScript"
homepage: "https://lemmascript.org/"
references:
  - url: "https://docs.lemmascript.org/spec/"
    title: "LemmaScript — Implementation Specification (annotation language, translation rules)"
  - url: "https://docs.lemmascript.org/design/"
    title: "LemmaScript — Design Rationale (a toolchain, not a new language)"
  - url: "https://github.com/midspiral/LemmaScript"
    title: "LemmaScript repository (midspiral/LemmaScript)"
author: "Midspiral"
kind: "notation"
status: "experimental"
year: 2026
paradigms:
  - "specification"
features:
  - "annotations-in-comments"
  - "contracts"
  - "formal-verification"
  - "ghost-state"
  - "loop-invariants"
  - "quantifiers"
influences:
  - "Verus"
  - "ACSL"
  - "JML"
  - "Dafny"
relations:
  - name: "TypeScript"
    kind: "implemented-in"
  - name: "Dafny"
    kind: "transpiles-to"
  - name: "Lean"
    kind: "transpiles-to"
note: "A contract notation for TypeScript: `//@` annotations state what a function must do, and the `lsc` toolchain translates the annotated code to Dafny or Lean 4 to prove it, leaving the shipped JavaScript untouched."
---
## Overview

LemmaScript is a [contract notation](https://docs.lemmascript.org/spec/#21-annotation-kinds)
for [TypeScript](/languages/typescript): `//@` annotations state what a
function must do, and the `lsc` toolchain translates the annotated code to
[Dafny](/languages/dafny) or [Lean](/languages/lean) to prove it,
[without a new language](https://docs.lemmascript.org/design/#1-what-this-is)
because the TypeScript is what ships. It exists to close the
[JavaScript verification gap](https://docs.lemmascript.org/design/#the-javascript-verification-gap):
assertions catch bugs, proofs exclude them.

## Code

::code-group

```typescript [primitives]
//@ requires lo <= hi
//@ ensures \result >= lo && \result <= hi   // \result: the returned value
export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
```

```typescript [combinations]
type Packet =                         // a string tag makes this a datatype
  | { tag: "syn"; seq: number }
  | { tag: "data"; seq: number; len: number }
  | { tag: "fin" };
//@ ensures pkt.tag === "syn" ==> \result === pkt.seq
export function nextSeq(state: number, pkt: Packet): number {
  if (pkt.tag === "syn") return pkt.seq;     // the chain on a tag narrows
  if (pkt.tag === "data") return state + pkt.len;   // → a match arm each
  return state;
}
```

```typescript [abstractions]
//@ pure                      // declared pure, so a contract may call it
function total(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
//@ ensures \result.length === xs.length               // length preserved
//@ ensures total(\result) === 2 * total(xs)  // a spec may call the pure fn
//@ ensures forall(i: nat, i < xs.length ==> \result[i] === xs[i] * 2)
export function doubled(xs: number[]): number[] {
  return xs.map((x) => x * 2);              // lambda → a prover lambda
}
```

```typescript [idioms]
export function countPositive(xs: number[]): number {
  //@ type i nat                // an index, so no .toNat in the output
  let i = 0;
  let n = 0;
  while (i < xs.length) {
    //@ invariant 0 <= i && i <= xs.length
    //@ invariant 0 <= n && n <= i
    //@ decreases xs.length - i // the metric termination is checked on
    n = xs[i] > 0 ? n + 1 : n;
    i = i + 1;
  }
  return n;
}
```

::

::note
Contracts are [spec expressions](https://docs.lemmascript.org/spec/#22-spec-expression-grammar)
over the code's own values — comparisons, `==>`, the `forall` quantifier,
`\result` — and a `//@ pure` callee may be invoked inside one; the union's
`tag` test
[lowers to a `match`](https://docs.lemmascript.org/spec/#44-discriminant-dispatch--match)
arm; `invariant`/`decreases` are what make the loop checkable. None of it
reaches the shipped JavaScript.
::

## Distinctive traits

- Contracts are comments, as in [ACSL](https://frama-c.com/acsl.html):
  invisible to `tsc`, bundlers and the runtime, so adoption is per-function
  and free.
- [Shallow embedding](https://lemmascript.org/blog/shallow-embedding/), not
  deep: each TypeScript construct becomes the prover's own, so the generated
  Dafny reads like code a person could have written.
- One source, two backends: Dafny is primary; [Lean](/languages/lean) 4 via
  [Velvet 2](https://docs.lemmascript.org/spec-lean/) adds inductive proofs but
  needs a proof file written separately.
- Ghost state, `//@ assert`, and
  [`//@ havoc`](https://docs.lemmascript.org/spec/#210-havoc--havoc) keep
  out-of-model code (regex, I/O, `JSON.parse`) in the model as arbitrary typed
  values the prover assumes nothing about.
- The arithmetic is idealized: `number` becomes a mathematical integer, so a
  proof says nothing about
  [doubles, `NaN`, or 2⁵³](https://docs.lemmascript.org/design/#6-the-number-problem).
- A [runtime guard](https://docs.lemmascript.org/design/#7-the-boundary-the-runtime-guard)
  re-checks preconditions where verified and unverified code meet, so an
  annotated core ships inside an ordinary TypeScript app.

## Status

Tech Preview: MIT-licensed, published on npm as `lemmascript` with the `lsc`
CLI, and documented at [docs.lemmascript.org](https://docs.lemmascript.org/).
Dafny is the primary backend; support, semantics and ergonomics are still
evolving.
