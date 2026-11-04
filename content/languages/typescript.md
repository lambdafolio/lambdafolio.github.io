---
title: "TypeScript"
name: "TypeScript"
homepage: "https://www.typescriptlang.org/"
urls:
  - "https://github.com/microsoft/TypeScript"
references:
  - url: "https://www.typescriptlang.org/docs/handbook/intro.html"
    title: "The TypeScript Handbook — typescriptlang.org"
  - url: "https://web.archive.org/web/20121003001910/https://blogs.msdn.com/b/somasegar/archive/2012/10/01/typescript-javascript-development-at-application-scale.aspx"
    title: "TypeScript: JavaScript Development at Application Scale — Somasegar's blog (announcement)"
  - url: "https://devblogs.microsoft.com/typescript/announcing-typescript-0-9/"
    title: "Announcing TypeScript 0.9 — Microsoft Dev Blogs (generics, enums)"
logo: "/logos/typescript.png"
author: "Anders Hejlsberg (Microsoft)"
kind: "language"
status: "active"
year: 2012
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
typing: "static"
type_system:
  - "gradual"
  - "inferred"
  - "structural"
memory:
  - "gc"
execution:
  - "transpiled"
concurrency:
  - "async/await"
  - "tasks"
features:
  - "closures"
  - "declaration-merging"
  - "enums"
  - "generics"
  - "interfaces"
  - "modules"
  - "prototypes"
influences:
  - "JavaScript"
  - "C"
relations:
  - name: "JavaScript"
    kind: "transpiles-to"
note: "Microsoft's statically typed superset of JavaScript: optional type annotations are erased in compilation, interfaces and generics scale up contracts, and every JavaScript program is already valid TypeScript."
---
## Overview

TypeScript is Microsoft's typed superset of [JavaScript](/languages/javascript), designed to make JavaScript-scale development maintainable. The compiler erases types — the emitted code is ordinary JavaScript — so adoption is gradual rather than all-or-nothing.

## Code

::code-group

```typescript [abstractions]
interface Greeter {
  greet(name: string): string;
}

const formal: Greeter = {
  greet: (name) => `Hello, ${name}.`,
};

// Generics tie input and output types together (array.map keeps T -> U):
const lengths: number[] = ["Mocha", "LiveScript"].map((s) => s.length);

// Enums give names to finite constants:
enum Color { Red, Green, Blue }
const pick: Color = Color.Green;
```

::

::note
Structural typing accepts `formal` without a class; every annotation here is
  erased — the output is idiomatic ES JavaScript.
::

## Distinctive traits

- Structural type system: shapes match by members, not declarations; annotations are optional and inferred liberally.
- Types are entirely erased: TypeScript runs wherever JavaScript runs, with no runtime of its own.
- Contracts scale via interfaces, generics, and declaration merging (growing `Array<T>`, DOM typings).
- Aligned with ES evolution: its class and module syntax preceded ES2015's, then converged with it.

## Status

Active and dominant for new web/server projects: developed openly on GitHub under the Apache-2.0 license; Microsoft ships the compiler and VS tooling. 0.9 (2013) added generics, 1.0 arrived 2014, and releases stay yearly.

## History

Announced October 1, 2012, by Somasegar's division with an early preview, a specification, and the compiler source on CodePlex; Anders Hejlsberg (C#'s lead) drove the design. TypeScript 0.9 (2013) introduced generics and a re-engineered compiler ahead of 1.0.
