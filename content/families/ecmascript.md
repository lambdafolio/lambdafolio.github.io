---
title: "ECMAScript"
name: "ECMAScript"
homepage: "https://tc39.es/"
references:
  - url: "https://tc39.es/ecma262/"
    title: "ECMA-262, ECMAScript Language Specification (latest draft) — Ecma TC39"
  - url: "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/"
    title: "ECMA-262 standard editions — Ecma International"
  - url: "https://web.archive.org/web/20070916025300/http://wp.netscape.com/newsref/pr/newsrelease67.html"
    title: "Netscape and Sun announce JavaScript (press release, December 4, 1995)"
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/JavaScript_technologies_overview"
    title: "JavaScript technologies overview — MDN"
  - url: "https://brendaneich.github.io/Strange-Loop-2012/"
    title: "The State of JavaScript — Brendan Eich, Strange Loop 2012 (Mocha/LiveScript/JavaScript timeline)"
author: "Ecma TC39 committee"
family: "ecmascript"
status: "active"
year: 1997
features:
  - "dynamic-typing"
  - "prototype-based-objects"
  - "first-class-functions"
  - "closure-scoped-modules"
  - "single-threaded-event-loop"
  - "spec-defined-runtime-semantics"
note: "The family defined by one executable specification: ECMA-262. Every member implements or extends the same dynamic, prototype-based object model and the same specified abstract operations (including the event loop), so conformance means passing the same test suite. JavaScript, TypeScript, ActionScript, and the embedded .NET and WAP dialects all descend from it."
---

## Overview

ECMAScript is a family whose unifying artifact is a document. ECMA-262 does
not just describe syntax — it specifies abstract operations, coercion rules,
and the job/event-loop model, in enough detail that independent implementations
converge. Members are defined by their relationship to that specification:
implementing it, extending it, or transpiling to it.

## Distinctive traits

- Dynamic typing with coercive operations. `==` and `+` are specified
  algorithms, not implementation accidents, which is why behaviour is portable
  and why the rules are worth reading.
- Objects are prototype chains, not classes. A class in a modern member is a
  specified desugaring to constructor functions and prototype links.
- Functions are first-class and close over their environment, so the dominant
  module pattern before `import` was a closure returning an object literal.
- One event loop, no shared-memory threads in the language. Concurrency is
  tasks and microtasks over a specified job queue, which is why `async`/`await`
  spreads uniformly across members.
- The specification is normative and versioned, with editions published on a
  yearly cadence since ES2015 moved to a rolling process.

## Members and what each one changed

| Language | Relationship to the standard | What it changed |
| --- | --- | --- |
| [ECMAScript](/languages/ecmascript) | *is* the standard (ECMA-262) | — (the specification itself) |
| [JavaScript](/languages/javascript) | the original implementation, standardized as ECMAScript | — (Netscape's Mocha/LiveScript, renamed December 1995) |
| [LiveScript (1995)](/languages/livescript-1995) | interim name of JavaScript | nothing: the same language under its September 1995 name |
| [JScript](/languages/jscript) | Microsoft's dialect, IE3 onward | host objects and conditional compilation |
| [JScript.NET](/languages/jscript-net) | ES4 draft plus CLI classes | optional strong typing, compiled to .NET bytecode |
| [Managed JScript](/languages/managed-jscript) | ES3 on the Dynamic Language Runtime | a DLR-hosted engine for Silverlight and ASP.NET Futures |
| [IronJS](/languages/ironjs) | ES3 on the DLR, independent project | an embeddable engine in the IronPython/IronRuby tradition |
| [JavaScript OSA](/languages/javascript-osa) | SpiderMonkey embedded in Apple's OSA | AppleScript-style host scripting with Apple events |
| [WMLScript](/languages/wmlscript) | ES-derived dialect for WAP | functions only — no objects or arrays — with device standard libraries |
| [ActionScript](/languages/actionscript) | ES dialect for Flash | classes, E4X XML literals, and the AVM2 virtual machine |
| [TypeScript](/languages/typescript) | typed superset | optional static types, erased at compile time |
| [JS++](/languages/jsplusplus) | typed superset with sound gradual typing | integer types, existent types, and a walled-off dynamics boundary |

The recurring move is *hosting*: JScript.NET, Managed JScript, IronJS, and
JavaScript OSA each embed the same core in a different runtime, and the family
grows through that embedding rather than through language design.

## Status

Active and the widest of the lineages here. ECMA-262 is on an annual edition
cadence, and the family now includes transpiled supersets and embedded engines
as well as browser implementations.

## History

Brendan Eich wrote Mocha at Netscape in May 1995; it shipped in a Navigator 2.0
beta as LiveScript in September 1995 and was renamed JavaScript on
December 4, 1995. Netscape submitted it to Ecma in 1996, and the first edition
of ECMA-262 appeared in June 1997. Microsoft shipped JScript from Internet
Explorer 3 in 1996. The fourth edition was abandoned in 2008 and replaced by the
Harmony process, which produced ES2015 and the yearly editions that followed.

::note
Read [TypeScript](/languages/typescript) for the superset direction and
[JScript.NET](/languages/jscript-net) for the embedding direction; both
count as members because membership here is defined by relation to the
standard, not by shared syntax.
::
