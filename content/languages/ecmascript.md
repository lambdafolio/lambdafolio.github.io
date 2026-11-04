---
title: "ECMAScript"
name: "ECMAScript"
homepage: "https://tc39.es/"
references:
  - url: "https://tc39.es/ecma262/"
    title: "ECMA-262, ECMAScript Language Specification (latest draft) — Ecma TC39"
  - url: "https://ecma-international.org/publications-and-standards/standards/ecma-262/"
    title: "ECMA-262 standard editions — Ecma International"
  - url: "https://web.archive.org/web/20070916025300/http://wp.netscape.com/newsref/pr/newsrelease67.html"
    title: "Netscape and Sun announce JavaScript (press release, December 4, 1995)"
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/JavaScript_technologies_overview"
    title: "JavaScript technologies overview — MDN"
logo: "/logos/javascript.jpg"
author: "Ecma TC39 committee"
kind: "dialect"
status: "active"
year: 1997
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "interpreted"
  - "jit"
concurrency:
  - "async/await"
  - "tasks"
features:
  - "closures"
  - "first-class-functions"
  - "modules"
  - "prototypes"
  - "regex"
  - "strict-mode"
influences:
  - "JavaScript"
note: "The Ecma standard (ECMA-262) that browser JavaScript engines implement; TC39 develops it in the open, publishing an edition every June since the stalled fourth edition was replaced by the Harmony process in 2008."
---
## Overview

ECMAScript is the language standard that scripting engines implement: [JavaScript](/languages/javascript) is Netscape's branding, JScript Microsoft's. The specification is developed by Ecma TC39 in the open and kept current at the TC39 site.

## Code

::code-group

```javascript [idioms]
// Same core everywhere: an edition's features are what engines converge on.
const langs = ["Mocha", "LiveScript", "JScript"];
const tagged = langs.map((s) => ({ name: s, len: s.length }));
// Optional chaining + nullish coalescing (ES2020), a spec-level example:
const engine = tagged.at(-1)?.name ?? "none";
```

::

::note
The shared core — anything valid here runs on any conforming engine (V8,
  SpiderMonkey, JavaScriptCore); branding lives in hosts and engines, not in the
  spec'd language.
::

## Distinctive traits

- Defines the core: syntax, types, prototype mechanism, built-ins — hosts inject the rest (DOM, Node APIs).
- Yearly cadence via TC39's staged process (0–4); engines implement proposals at stage 3–4, before publication.
- Edition history is load-bearing: ES1 1997, ES3 1999, ES5 2009, ES2015; the 4th edition was abandoned in 2008.
- "ECMAScript" and "JavaScript" name the same core language; dialects differ in engine extensions and host objects.

## Status

Active: the 17th edition (ECMAScript 2026) was published June 2026; drafts live at tc39.es. Implemented by V8, SpiderMonkey, JavaScriptCore, QuickJS, Hermes, and other engines.

## History

Netscape submitted JavaScript for standardization in November 1996; the first edition was adopted June 1997, based on joint Microsoft/Netscape submissions. The ambitious fourth edition stalled and was dropped in 2008 in favor of the Harmony process that produced ES5 and the yearly cadence since.
