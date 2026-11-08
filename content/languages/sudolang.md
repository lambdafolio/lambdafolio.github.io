---
title: "SudoLang"
name: "SudoLang"
homepage: "https://github.com/paralleldrive/sudolang"
references:
  - url: "https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md"
    title: "SudoLang v2.0 — language specification"
  - url: "https://www.oreilly.com/radar/unlocking-the-power-of-ai-driven-development-with-sudolang/"
    title: "Unlocking the Power of AI Driven Development with SudoLang (Eric Elliott, O'Reilly Radar, 2024)"
  - url: "https://arxiv.org/abs/2305.11790"
    title: "Prompting with Pseudo-Code Instructions (Mishra et al., EMNLP 2023)"
  - url: "https://medium.com/javascript-scene/sudolang-a-powerful-pseudocode-programming-language-for-llms-d64d42aa719b"
    title: "SudoLang: A Powerful Pseudocode Programming Language for LLMs (April 2023 announcement)"
author: "Eric Elliott (Parallel Drive)"
kind: "language"
status: "active"
year: 2023
paradigms:
  - "declarative"
type_system:
  - "inferred"
execution:
  - "interpreted"
features:
  - "constraints"
  - "interfaces"
  - "markdown-literate"
  - "pattern-matching"
  - "pipe-operator"
  - "referential-omnipotence"
  - "transpilation"
influences:
  - "F#"
  - "Jargon"
  - "Rust"
  - "Scala"
  - "Sketchpad"
relations:
  - name: "F#"
    kind: "influenced-by"
  - name: "Jargon"
    kind: "influenced-by"
  - name: "Rust"
    kind: "influenced-by"
  - name: "Scala"
    kind: "influenced-by"
  - name: "Sketchpad"
    kind: "influenced-by"
note: "Pseudolanguage whose runtime is the model: typed interfaces, English constraints, and a pipe operator make a prompt read as a program, while most functions are inferred rather than written."
---
## Overview

SudoLang is a [pseudolanguage](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#introduction)
for programs a language model runs itself: a [declarative](/paradigms/declarative) mix of
English, [interfaces](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#interfaces),
functions, and [constraints](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#constraints).
It exists because [pseudocode prompts outperform prose
ones](https://arxiv.org/abs/2305.11790); an AI model interprets it unaided, so the
specification is optional.

## Code

::code-group

```sudo [primitives]
count = 0                          // assignment
count += 1                         // compound operators exist
price = 42.5 * 2                   // math operators consume numbers
name = "Echo"
"Hello, $name"                     // template-string interpolation
1..3                               // inclusive range: 1, 2, 3
```

```sudo [combinations]
[foo, bar] = [1, 2]                // array destructuring
{ foo, bar } = { foo: 1, bar: 2 }  // object destructuring
label = match (shape) {
  case { type: "circle", radius } => "radius is $radius";
  case { type: "rectangle", width, height } => "${width}x${height}";
  default => "Unknown shape",
};
```

```sudo [abstractions]
function greet(name);              // body inferred by the model
greet("Echo")                      // "Hello, Echo"
f = x => x + 1                     // a function value
g = x => x * 2
h = f |> g                         // composition: f's output feeds g
h(20)                              // 42
```

```sudo [idioms]
interface Employee {
  minimumSalary = $100,000
  salary
  constraint SalaryFloor {
    every employee's salary is at least $minimumSalary
  }
}
joe = employee({ name: "Joe", salary: 110,000 })
minimumSalary = $120,000           // solver: joe.salary becomes 120,000
```

::

::note
The tabs read as one program: values and template strings, then destructuring and
semantic pattern matching on shape, then functions whose bodies nobody wrote and
`|>` to compose them, then the signature feature — an interface whose *English*
constraint makes the model repair state when a floor moves.
::

## Distinctive traits

- Constraints are English declarations the model keeps true, so an inferred solver repairs dependent values instead of requiring update code.
- Referential omnipotence: unnamed functions are inferred on demand, so `sort` or `log` exist with no declaration and no body.
- Constraints follow [Sketchpad](/languages/sketchpad)'s propagate-on-edit model, which [Elliott cites as the inspiration](https://www.oreilly.com/radar/unlocking-the-power-of-ai-driven-development-with-sudolang/).
- The [pipe operator](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#pipe-operator-) composes left to right, and [Markdown preambles](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#markdown) are executed as context.
- The spec ships its [linter](https://github.com/paralleldrive/sudolang/blob/main/sudolang.sudo.md#sudolang-linting) as a SudoLang program, so style conformance is model behaviour, not a compiler check.

## Status

Specification v2.0 and an MIT-licensed VS Code extension live in the
[project repository](https://github.com/paralleldrive/sudolang); no separate compiler
or runtime exists. Documentation is articles, examples, and an O'Reilly overview,
and `transpile` handles transpilation to conventional languages.

## History

Created in 2023 by prompting GPT-4 to write the specification itself, after
[Jake Brukhman's Jargon](/languages/jargon) suggested formalising a pseudolanguage
syntax; Elliott then asked for a rename to SudoLang and added the pipe operator. The
published specification now stands at version 2.0.
