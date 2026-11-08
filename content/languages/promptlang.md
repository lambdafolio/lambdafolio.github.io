---
title: "PromptLang"
name: "PromptLang"
homepage: "https://github.com/ruvnet/promptlang"
urls:
  - "https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md"
references:
  - url: "https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md"
    title: "PromptLang — original language description and initialized interpreter prompt"
  - url: "https://github.com/ruvnet/promptlang/blob/main/docs/ADR-001.md"
    title: "ADR 001: Bounded local v2 contract (typed compiler scope change)"
  - url: "https://github.com/ruvnet/promptlang"
    title: "PromptLang repository (ruvnet/promptlang)"
author: "rUv (ruvnet)"
kind: "language"
status: "dormant"
year: 2023
paradigms:
  - "domain-specific"
  - "imperative"
execution:
  - "interpreted"
features:
  - "ai-assisted-code-generation"
  - "disable-explanations"
  - "zero-runtime"
note: "A JavaScript-shaped prompt language executed by the model rather than a runtime: define/let/if/for, plus instructions to suppress commentary and emit only the program's output."
---
## Overview

PromptLang is rUv's [pseudolanguage](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md)
with JavaScript's surface — `define`, `let`, `if`, `for` — whose
[interpreter is the model itself](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md):
you paste an initialization prompt, then submit code. It exists so a program's output
can be requested without explanatory chatter, and so the same text can be
[translated to JavaScript or Python](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md).

## Code

::code-group

```javascript [primitives]
let greeting = "Hello, World!";   // variables declared with let
let count = 3
count += 1                        // compound assignment
let label = "sum: " + count       // string concatenation
print(label)                      // sum: 4
```

```javascript [combinations]
let data = [12, 15, 18];          // arrays index from 0
print(data[0])                    // 12
let report = { total: 0 };        // objects hold named fields
report.total = data[0] + data[1]
print(report.total)               // 27
```

```javascript [abstractions]
define add(x, y) {                // functions use the define keyword
    return x + y;
}

define main() {
    let sum = add(5, 10);
    print("The sum is: ", sum);   // The sum is: 15
}
```

```javascript [idioms]
define factorial(n) {
    if (n <= 1) {
        return 1;
    } else {                       // recursion is the idiomatic loop
        return n * factorial(n - 1);
    }
}

define main() { print(factorial(5)); }   // 120
```

::

::note
Nothing here would look out of place in JavaScript, and that is the design: familiar
syntax means the model needs no grammar lesson. The idiom tab's recursion is the
telling one — flow control is ordinary, because the flow-control constructs are
conventional rather than inferred from English.
::

## Distinctive traits

- The surface is deliberately JavaScript-shaped, so `define`/`let`/`if`/`for` need no specification beyond the header prompt.
- Every session starts by pasting an [initialization prompt](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md) that casts the model as the `PromptLang v0.0.1` interpreter.
- It ships instructions to [suppress explanations](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md), so the model's answer is the program's output and nothing else.
- Output can be requested in a target language, which makes it a [translator to JavaScript or Python](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md) rather than an executor alone.
- Execution is [zero-runtime](https://github.com/ruvnet/promptlang/blob/main/docs/legacy-readme.md): there is nothing to install, only a model conversation.

## Status

The 2023 language was a prompt, not an implementation. The repository's 2026
direction is [explicitly a different thing](https://github.com/ruvnet/promptlang/blob/main/docs/ADR-001.md):
a bounded typed JSON compiler that "is not the speculative language in the
historical README", leaving the v0.0.1 design documented but unmaintained.

## History

Published in March 2023, a fortnight before [SudoLang](/languages/sudolang) and in
the same week as [Jargon](/languages/jargon); that README lists it among related
LLM pseudolanguages. The project later pivoted to a
[safety-bounded compiler](https://github.com/ruvnet/promptlang/blob/main/docs/ADR-001.md)
under the same name.
