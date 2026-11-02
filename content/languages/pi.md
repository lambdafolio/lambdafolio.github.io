---
title: "Pi"
name: "Pi"
homepage: "http://www.pi-programming.org/What.html"
urls:
  - "http://www.pi-programming.org/Demo%21.html"
  - "http://www.pi-programming.org/Get%21.html"
  - "https://web.archive.org/web/20160401190500/http://www.pi-programming.org/Who.html"
references:
  - url: "http://www.pi-programming.org/What.html"
    title: "What is pi? — official project page (primary)"
  - url: "https://doi.org/10.1145/1640089.1640128"
    title: "pi — a Pattern Language (OOPSLA/Onward! '09, pp. 503-522, ACM Digital Library)"
  - url: "http://www.pi-programming.org/Demo%21.html"
    title: "Code examples — official demo page (primary)"
  - url: "http://www.pi-programming.org/Get%21.html"
    title: "Download pi — release notes and license (primary)"
  - url: "https://web.archive.org/web/20160401190500/http://www.pi-programming.org/Who.html"
    title: "Who are we? — pi-project team page (archived)"
author: "Roman Knöll, Mira Mezini, Felix Wolff (TUD Darmstadt)"
kind: "language"
status: "dormant"
year: 2009
paradigms:
  - "domain-specific"
  - "functional"
  - "imperative"
  - "pattern-oriented"
typing: "dynamic"
type_system:
  - "nominal"
execution:
  - "interpreted"
features:
  - "dynamic-typing"
  - "higher-order-patterns"
  - "lazy-evaluation"
  - "macro-facility"
  - "pattern-based-syntax"
  - "pattern-matching"
  - "reflection"
  - "runtime-syntax-rewrite"
  - "semantic-extensibility"
  - "syntactic-extensibility"
influences:
  - "BETA"
relations:
  - name: "BETA"
    kind: "influenced-by"
note: "Pattern language from TUD Darmstadt whose only construct is the pattern: an EBNF production with an associated meaning, so syntax and semantics extend together from inside the language. Presented at OOPSLA/Onward! '09; never released beyond an alpha-stage Java interpreter."
---
## Overview

Pi is a pattern-oriented programming language whose only construct is the pattern — an EBNF production paired with an associated meaning. Roman Knöll and Mira Mezini built it at TUD Darmstadt to show that a language can extend its own syntax and semantics without a meta-language, making it a testbed for domain-specific languages.

## Code

::code-group

```pi [primitives]
// a pattern declares syntax (≔), type (⇒) and meaning (➞).
declare_pattern integer_potentiation ≔
  integer:i %W- "^" %W- integer:j ⇒ integer ➞
  { int result = i;
    for (int k = 1; k <= j-1; k++) result *= i;
    return result; };

// the new symbol is usable immediately.
print (174^3);
```

```pi [combinations]
// slots take non-terminals; { … }:name collects a repetition.
declare_pattern sql_insert_statement ≔
  "INSERT" "INTO" sql_table_name
  "(" sql_column_name {"," sql_column_name}:column_names ")"
  "VALUES" "(" sql_value {"," sql_value}:values ")" ";"
  ⇒ sql_instruction ➞
  { check (size_of(column_names) = size_of(values),
      "Wrong number of values!");
    send_sql_command (current_database(), this); };

INSERT INTO people VALUES ("Alfred", "Wissel");
```

```pi [abstractions]
// meanings are written either functionally or imperatively.
declare_pattern twice ≔ "(" integer ")" ⇒ integer ➞ 2 * integer;
declare_pattern count_up_to ≔
  "count_up_to" "(" integer:i ")" ⇒ instruction ➞
  { int j = 1;
    while (j <= i) { print (j); j++; } }
```

```pi [idioms]
// rewrite mutates an existing pattern's syntax at runtime.
rewrite (print.syntax, "write" "(" symbol ")");

// reflection: patterns and parse trees are ordinary values.
declare_pattern interpret ≔ "interpret" "(" symbol ")" ⇒ symbol ➞
  evaluate ( parse ( symbol ) );
```

::

Caption: one tab per tour slot — a pattern declares syntax, type and meaning in
one line, so the declared symbol is usable immediately; slots compose EBNF
productions into a DSL; meanings may be functional or imperative; and
reflection lets a program evaluate its own patterns at runtime.

## Distinctive traits

- One construct: a pattern is an EBNF production plus a meaning — syntax and semantics are inseparable.
- Self-extending: new syntax is declared in the language itself, so no separate macro layer is needed.
- Explicit types on patterns: a pattern's type states where its symbols may appear, checked dynamically.
- Reflection completeness: instructions, parse trees and the interpreter itself are reachable as patterns.
- Libraries are languages: every pattern carries syntax, so extending pi equals designing a DSL.
- Post-paradigmatic: the core pattern set is a proposal, not fixed syntax — even predefined patterns can be redeclared.

## Status

Never left alpha. Version 0.8 shipped as a Java 6 interpreter (`pi.jar`, class `de.tu_darmstadt.informatik.st.pegasus.pi.PiConsole`) under CC BY-NC-SA 3.0, with the extended Earley parser disabled and reflection-completeness incomplete; the site shows no activity after 2011.

## History

Born from the Pegasus Project at TU Darmstadt, where pegasus_f needed patterns for naturalistic programming. Knöll and Mezini presented pi at OOPSLA/Onward! '09 in Orlando; version 0.8 followed in January 2010.
