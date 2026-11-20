---
title: "Lion"
name: "Lion"
homepage: "https://lionlang.dev/"
references:
  - url: "https://lionlang.dev/"
    title: "Lion — the JSON-based Lisp (project site)"
  - url: "https://lionlang.dev/docs.html"
    title: "Lion documentation — evaluation rules, special forms, logic, schemas, standard library"
  - url: "https://lionlang.dev/changelog.html"
    title: "How Lion got here — releases and decisions, generated from the project's own record"
  - url: "https://github.com/andrueandersoncs/lion"
    title: "andrueandersoncs/lion — source repository, README, and packages"
  - url: "https://github.com/andrueandersoncs/lion/blob/main/packages/core/README.md"
    title: "@lionlang/core — package README published to npm"
  - url: "https://effect.website/"
    title: "Effect — the TypeScript effect system Lion's evaluator runs on"
author: "Andrue Anderson"
kind: "language"
year: 2026
paradigms:
  - "effect"
  - "functional"
  - "logic"
family: "lisp"
execution:
  - "transpiled"
features:
  - "closures"
  - "code-as-data"
  - "datalog"
  - "first-class-functions"
  - "pattern-matching"
  - "schema-validation"
  - "tail-calls"
influences:
  - "JavaScript"
  - "Racket"
  - "Scheme"
relations:
  - name: "TypeScript"
    kind: "implemented-in"
  - name: "JavaScript"
    kind: "transpiles-to"
note: "A homoiconic Lisp whose every program is valid JSON, evaluated on Effect, with a Datalog-style logic database and runtime schemas in the same syntax."
---
## Overview

Lion is a homoiconic [Lisp](/languages/lisp) whose programs are plain JSON: an
array is an expression, an object a record, and a string a name, so one format
serves code and data. It evaluates on [Effect](https://effect.website/), and a
[Datalog-style logic layer](https://lionlang.dev/docs.html#logic-programming-datalog-not-prolog),
runtime schemas, and a graph editor share that same syntax.

## Code

::code-group

```json [primitives]
42
true
["number/add", 1, 2]
["number/multiply", ["number/add", 1, 2], 4]
"lion"
["quote", "lion"]
```

```json [combinations]
["array/make", 1, 2, 3]
["array/head", ["array/make", 1, 2, 3]]
["array/map", ["array/make", 1, 2, 3],
  ["lambda", ["x"], ["number/multiply", "x", 2]]]
{"sum": ["number/add", 1, 2], "ok": true}
["object/get-path", {"a": {"b": 42}}, "a.b"]
```

```json [abstractions]
["begin",
  ["define", "adder",
    ["lambda", ["n"],
      ["lambda", ["x"], ["number/add", "x", "n"]]]],
  ["define", "add10", ["adder", 10]],
  ["add10", 32]]
```

```json [idioms]
["begin",
  ["relation", "edge", ["from", "to"]],
  ["relation", "path", ["from", "to"]],
  ["fact", ["edge", "a", "b"], ["edge", "b", "c"]],
  ["rule", ["path", "?x", "?y"], ["edge", "?x", "?y"]],
  ["rule", ["path", "?x", "?z"], ["path", "?x", "?y"], ["edge", "?y", "?z"]],
  ["query", ["path", "a", "?to"]]]
```

::

::note
The literals evaluate in place and `number/add` returns `3`, while a name like
`"lion"` is a lookup first and text only when nothing is bound; `array/map`
returns `[2, 4, 6]`; `add10` returns `42` because the inner lambda is a closure
that kept `n`; and the logic layer is not a separate file format — `query`
derives paths from two rules over the same JSON a value would be written in.
::

## Distinctive traits

- Code is data: an array is a [special form](https://lionlang.dev/docs.html#rule-arrays) or a call, so [`quote`](https://lionlang.dev/docs.html#form-quote) stores a program and [`eval`](https://lionlang.dev/docs.html#form-eval) runs it later.
- [`define`](https://lionlang.dev/docs.html#form-define) binds a lambda like any value, and `array/map` takes a function as an ordinary argument.
- [Tail-position calls](https://lionlang.dev/docs.html#rule-calls) keep nothing of their caller, so a self-recursive lambda loops in constant memory.
- A Datalog-style layer — relations, recursive rules, aggregates, [`why`](https://lionlang.dev/docs.html#form-why) explanations — reuses the JSON syntax.
- [`match`](https://lionlang.dev/docs.html#form-match) dispatches on a value's shape — predicate, record, or literal — so branching needs no type tag.
- [Schemas](https://lionlang.dev/docs.html#check-data) are runtime values, and a relation can declare `{"schema": …}` to reject rows that do not fit.

## Status

MIT-licensed and pre-1.0: `@lionlang/core` 0.14.1 shipped in November 2026,
seven months after 0.1.0, and recent releases still record breaking changes.
The repository also ships the CLI, a graph editor, and the docs' browser
evaluator.
