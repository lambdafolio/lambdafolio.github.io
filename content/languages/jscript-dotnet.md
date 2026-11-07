---
title: "JScript.NET"
name: "JScript.NET"
homepage: "https://web.archive.org/web/20160407002207/https://msdn.microsoft.com/en-us/library/xkx7dfw1(v=vs.71).aspx"
references:
  - url: "https://web.archive.org/web/20160407002207/https://msdn.microsoft.com/en-us/library/xkx7dfw1(v=vs.71).aspx"
    title: "What Is JScript .NET? — MSDN (developed in conjunction with ECMAScript Edition 4)"
author: "Microsoft"
kind: "language"
status: "historical"
year: 2002
paradigms:
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
  - "bytecode"
features:
  - "classes"
  - "early-binding"
  - "eval"
  - "function-overloading"
  - "packages"
  - "typeless-variables"
influences:
  - "JScript"
  - "JavaScript"
relations:
  - name: "JScript"
    kind: "derived-from"
  - name: "ECMAScript"
    kind: "dialect-of"
note: "Microsoft's 2002 CLI language for Visual Studio .NET: JScript's dynamics plus ES4-draft classes and optional strong typing, compiled to .NET bytecode. Never supported in Visual Studio's designers; died with that generation."
---
## Overview

JScript .NET was Microsoft's 2002 CLI reworking of [JScript](/languages/jscript), developed in conjunction with the (later abandoned) ECMAScript Edition 4. It kept classic dynamics — typeless variables, `eval`, expando classes — while adding ES4-style classes and optional strong types.

## Code

::code-group

```javascript [abstractions]
// JScript .NET: typeless script style and optional strong typing coexist.
import System;

var untyped = 1;                 // typeless, like classic JScript
var typed: int = 2;              // strong type, compile-time checked
typed = 3;                       // fine
// typed = "abc";                // compile error

// ES4-flavored classes with inheritance:
class Greeter {
  var name: String;
  function Greeter(name: String) { this.name = name; }
  function greet(): String { return "Hello, " + this.name; }
}

Console.WriteLine(new Greeter("world").greet());
```

::

::note
Annotations check at compile time but the runtime stays dynamic — an early,
  CLR-bound take on the same gradualness [TypeScript](/languages/typescript)
  later made portable.
::

## Distinctive traits

- True compiled .NET language: sources compiled to Common Intermediate Language, not engine-interpreted script.
- Dual-mode typing: typeless `var` scripting or strongly typed declarations, mixing freely in one file.
- ES4-era features reached production here first: classes with inheritance, overloading, packages.
- Excluded from the Visual Studio IDE's first-class designer support; positioned as a classic-ASP upgrade path.

## Status

Historical: shipped with .NET/Visual Studio 2002, effectively dead after that generation. Unlike Managed JScript (DLR), it targeted the CLI proper — but neither line outlived the 2000s.
