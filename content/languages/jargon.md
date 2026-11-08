---
title: "Jargon"
name: "Jargon"
homepage: "https://github.com/jbrukh/gpt-jargon"
references:
  - url: "https://github.com/jbrukh/gpt-jargon/blob/main/jargon_cli/jargon.md"
    title: "Jargon v0.2.1 — interpreter specification"
  - url: "https://web.archive.org/web/20250427055125/https://jake.mirror.xyz/sPZECVTkrbVq4DerB13Thvqq_XqsDGwTBDD3SSzdI44"
    title: "Jargon: an LLM-based pseudolanguage for prompt engineering (Jake Brukhman, March 2023)"
  - url: "https://github.com/jbrukh/gpt-jargon"
    title: "gpt-jargon repository and procedure gallery"
author: "Jake Brukhman"
kind: "language"
status: "experimental"
year: 2023
paradigms:
  - "domain-specific"
  - "imperative"
execution:
  - "interpreted"
features:
  - "axioms"
  - "divination"
  - "fuzzy-comparisons"
  - "labels-and-goto"
  - "lexical-scope"
  - "natural-language-instructions"
  - "procedures"
  - "referential-omnipotence"
influenced:
  - "SudoLang"
note: "Pseudolanguage whose procedures are lists of natural-language instructions interpreted by an LLM, kept on script by sequential execution and pinned by axioms the interpreter must hold true."
---
## Overview

Jargon is Jake Brukhman's [pseudolanguage](https://github.com/jbrukh/gpt-jargon/blob/main/jargon_cli/jargon.md#procedures):
`+++`-bounded procedures of natural-language instructions that an LLM
interprets, with braces for scope and `*` axioms that [stay true while their scope
lives](https://github.com/jbrukh/gpt-jargon/blob/main/jargon_cli/jargon.md#axioms).
It exists because a Spanish-tutor prompt that kept growing [lost its flow
control](https://web.archive.org/web/20250427055125/https://jake.mirror.xyz/sPZECVTkrbVq4DerB13Thvqq_XqsDGwTBDD3SSzdI44),
so structure was needed between prose and a formal language.

## Code

::code-group

```jargon [primitives]
+++ atoms
-- Return 69                          # an ATOM: text the interpreter executes
-- $n = [the number of countries in Latin America]   # a TYPE EXPRESSION
/output $n
2 == [an even number]                 # fuzzy comparison: TRUE
+++
```

```jargon [combinations]
+++ scope-example
-- $x = 10                            # top-level scope
-- {                                  # braces open a child scope
  -- $y = 11                          # visible only inside the braces
}
/output $y                            # %scope-error: no $y out here
+++
```

```jargon [abstractions]
+++ square($x)
-- Return $x multiplied by itself
+++

+++ squares
-- For $x values from 1 to 3, print square($x)
+++

/execute squares
```

```jargon [idioms]
+++ grumpy-teacher
* You are a grumpy math teacher       # AXIOM: held true for this scope
@repeat:
-- Ask me a math question
/wait
-- Evaluate my answer
/goto @repeat
+++
```

::

::note
Each tab is one construction plus its consumption: an atom is returned, a child
scope provably hides `$y` from the parent, a parameterized procedure is invoked with
`/execute`, and the loop is a label with `/goto` — with the axiom silently shaping
every answer the procedure emits.
::

## Distinctive traits

- Axioms pin persistent behaviour: declare once and the interpreter keeps the condition true until the scope ends.
- Referential omnipotence means instructions may reference the session, the specification, and world knowledge, which makes quines [trivial](https://github.com/jbrukh/gpt-jargon#quines-are-trivial-in-jargon).
- Specification is deliberately informal: [divination](https://github.com/jbrukh/gpt-jargon/blob/main/jargon_cli/jargon.md#divination) supplies variables and closures nobody defined, so runs are nondeterministic.
- Fuzzy comparisons test a value against a natural-language type expression, so `2 == [an even number]` evaluates to true.
- Lexical scope is enforced as an error: reading a child-scope variable raises `%scope-error` rather than returning nothing.

## Status

Specification v0.2.1 ships as a prompt plus a `jargon_cli` shell; there is no
compiler or runtime beyond the model. The author states it [should not be used in
production](https://web.archive.org/web/20250427055125/https://jake.mirror.xyz/sPZECVTkrbVq4DerB13Thvqq_XqsDGwTBDD3SSzdI44)
yet.

## History

Written in March 2023 after a Spanish-teaching prompt grew into unstructured text
that lost track of its own flow. The `+++` bounds nod to [Urbit's
Hoon](https://developers.urbit.org/guides/core/hoon-school/F-cores) and instruction
lists borrow from [YAML](https://yaml.org/); [Elliott credits the
idea](https://medium.com/javascript-scene/sudolang-a-powerful-pseudocode-programming-language-for-llms-d64d42aa719b)
with prompting [SudoLang](/languages/sudolang). The README's
[related-projects list](https://github.com/jbrukh/gpt-jargon#related-projects) also
names [PromptLang](/languages/promptlang) and [PML](/languages/pml).
