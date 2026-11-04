---
title: "Universalis"
name: "Universalis"
urls:
  - "https://queue.acm.org/doi/10.1145/3746223"
references:
  - url: "https://queue.acm.org/doi/10.1145/3746223"
    title: "ACM Queue: Universalis"
author: "Erik Meijer"
note: "AI-first program-synthesis language designed for knowledge workers to read, optimized to be executed by a neural computer"
---
## Overview

Universalis is Erik Meijer's language for end-user programmable AI:
natural-language clauses whose bracketed *hedges* execute as logic
programs on a neural computer, readable by knowledge workers. Program
synthesis bridges their intent to computation.

## Code

::code-group

```text [abstractions]
The apples cost $[@B], and the selling price was $[@S],
so Alice made a profit of $[@D is (@S-@B)].
The profit percentage is therefore %[@P is (@D/@B)*100]%.
Consider each sale [@Sale = {...}] from [@Sales] ...
```

::

::note
*there is no function keyword* — the composable unit is the clause;
  `@D is (@S-@B)` hedges are executable constraints (Prolog IR), and the
  surrounding prose is the human-readable program.
::

## Distinctive traits

- Two notations in one text: natural language for people; `[…]`/`%[…]%
  hedges compile to a JSON list of logic expressions.
- `@Var` cells behave like spreadsheet variables — the article shows
  `@B=10, @S=17 → @P=70` flowing through the clauses.
- JSON pattern matching binds cells into compound shapes
  (`{ "volume": @V, "currency": @X }`), keeping data unification declarative.
- No function/class/method syntax in the article — the executable IR is a
  list of `{ expression }` JSON entries, composable as clauses.

## Status

Published by Erik Meijer (ACM Queue, July 2025, "Unleashing the Power of
End-User Programmable AI") as a synthesis target for a neural computer;
early and research-stage, per the article.
