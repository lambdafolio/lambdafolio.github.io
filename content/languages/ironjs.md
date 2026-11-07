---
title: "IronJS"
name: "IronJS"
homepage: "https://github.com/fholm/IronJS"
references:
  - url: "https://github.com/fholm/IronJS"
    title: "IronJS — ECMAScript 3.0 implementation on the DLR (GitHub README)"
  - url: "https://www.infoq.com/news/2010/02/IronJS/"
    title: "IronJS – A new JavaScript Compiler for the DLR — InfoQ (February 2010)"
author: "Fredrik Holmström"
kind: "language"
status: "historical"
year: 2010
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
family: "ecmascript"
typing: "dynamic"
execution:
  - "bytecode"
features:
  - "closures"
  - "first-class-functions"
  - "prototypes"
influences:
  - "JavaScript"
relations:
  - name: "ECMAScript"
    kind: "dialect-of"
note: "ECMAScript 3 implementation on Microsoft's Dynamic Language Runtime, embedding a JavaScript engine in .NET apps; named in the IronPython/IronRuby tradition despite being an independent project by Fredrik Holmström."
---
## Overview

IronJS embedded a JavaScript runtime in .NET applications: an [ECMAScript](/languages/ecmascript) 3 implementation on Microsoft's Dynamic Language Runtime. Named for the IronPython/IronRuby tradition, it was an independent project — Microsoft had dropped its own Managed JScript.

## Code

::code-group

```csharp [abstractions]
// Embedding IronJS in a .NET app: a hosted ES3 runtime.
var runtime = new IronJS.Hosting.CSharp.Context();
runtime.Execute("var counter = 0;");
runtime.Execute("function tick() { counter += 1; return counter; }");

object result = runtime.Execute("tick();");
Console.WriteLine(result); // 1
```

::

::note
Paraphrased from the documented hosting model — the `Context` object embeds
  the engine; ES3 code runs against CLR objects through the DLR.
::

## Distinctive traits

- DLR-based embedding: JavaScript ran as a dynamic CLR citizen inside arbitrary .NET hosts.
- Compiled ES3 to DLR expression trees — bytecode on CLR2/CLR4 and Mono, not interpreted line-by-line.
- Ran jQuery 1.4 within months of its first announcement — real-world DOM library compatibility as a goal.

## Status

Historical: no commits since ~2013; the repository went read-only (archived January 2025). Apache-2.0 licensed; the ECMA3 conformance suite and Sputnik test runner came from contributor John Gietzen.
