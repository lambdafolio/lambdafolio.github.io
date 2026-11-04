---
title: "llm-lang"
name: "llm-lang"
homepage: "https://github.com/wilbowma/llm-lang"
references:
  - url: "https://github.com/wilbowma/llm-lang"
    title: "llm-lang — GitHub"
author: "William J. Bowman"
influences:
  - "GenAIScript"
  - "Racket"
note: "An LLM-first language for first-class prompt-engineering in Racket — all unstructured text is prompt by default"
---
## Overview

llm-lang is a Racket `#lang` by William J. Bowman in which *unstructured
text is prompt by default*: every top-level datum in a module is an LLM
prompt, with escapes to Racket for real computation. LLM replies are
strings to parse, or — via `llm/define` — Racket code compiled at build
time.

## Code

::code-group

```racket [abstractions]
#lang llm
@(require llm/ollama/phi3)          ; backend import (at-exp reader)

Write presenter notes for Section 2.  ; a bare datum IS the prompt

@(define (parse-code-prompt!)       ; @(...) escapes to Racket
   (read (open-input-string
     (extract-code (car (parse-markdown (prompt!)))))))

@(displayln (prompt!))              ; prompt! sends text, returns reply
@(unprompt 5)                       ; unprompt returns a value, not text
```

::

::note
The *unit of definition* is the prompt itself — Racket functions are reached
  only through `@(...)` escapes, so code is prompt orchestration plus ordinary
  Racket.
::

## Distinctive traits

- Inversion of embedding: Racket is embedded *in* the prompt language, not
  the other way around — text is the default, code is escaped.
- `prompt!` sends accumulated text to the model and returns the reply as a
  string; `unprompt` splices values without prompting.
- `define-by-prompt!` turns an LLM's emitted code into a real module
  binding — prompts are compile-time metaprogramming.

## Status

A 2023–2024 research artifact by William J. Bowman, hosted on GitHub with
demo code and tests; tracks per-prompt cost (power, CO₂, water). Research
tooling, not production — experimental status.
