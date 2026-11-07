---
title: "JScript"
name: "JScript"
homepage: "https://web.archive.org/web/20090112221530/http://www.microsoft.com/presspass/press/1997/Jun97/jecmapr.mspx"
urls:
  - "https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/scripting-articles/hbxc2t98(v=vs.85)"
references:
  - url: "https://web.archive.org/web/20090112221530/http://www.microsoft.com/presspass/press/1997/Jun97/jecmapr.mspx"
    title: "Microsoft Embraces ECMA Internet Scripting Standard (JScript 3.0 press release, June 30, 1997)"
  - url: "https://web.archive.org/web/20070916025300/http://wp.netscape.com/newsref/pr/newsrelease67.html"
    title: "Netscape and Sun announce JavaScript (press release, December 4, 1995)"
  - url: "https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/scripting-articles/hbxc2t98(v=vs.85)"
    title: "JScript (ECMAScript3) — Microsoft Learn (MSDN scripting reference)"
logo: "/logos/javascript.jpg"
author: "Microsoft"
kind: "dialect"
status: "historical"
year: 1996
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
family: "ecmascript"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "interpreted"
concurrency:
  - "tasks"
features:
  - "closures"
  - "conditional-compilation"
  - "first-class-functions"
  - "prototypes"
  - "regex"
influences:
  - "JavaScript"
influenced:
  - "JScript.NET"
  - "Managed JScript"
relations:
  - name: "ECMAScript"
    kind: "dialect-of"
note: "Microsoft's ECMAScript dialect, shipped with Internet Explorer 3 (1996); JScript 3.0 (1997) was Microsoft's 'first scripting language to fully conform to ECMA-262', and the name avoided Sun's JavaScript trademark."
---
## Overview

JScript is Microsoft's ECMAScript dialect, first shipped in Internet Explorer 3.0 (August 1996) as an Active Scripting engine. The name dodged the Sun JavaScript trademark; per Crockford, the languages were then the same core.

## Code

::code-group

```javascript [idioms]
// JScript's signature extension: conditional compilation in block comments.
/*@cc_on
  @if (@_jscript_version >= 5)
    WScript.Echo("JScript 5+ on Windows Script Host");
  @else
    WScript.Echo("older engine");
  @end
@*/

// Otherwise textbook ES3: prototype-linked objects, first-class functions.
function Counter() { this.count = 0; }
Counter.prototype.tick = function () { return ++this.count; };
```

::

::note
The `@cc_on` block is JScript-only (unsupported by other engines); everything
  after is the shared ECMAScript core.
::

## Distinctive traits

- Active Scripting engine: same core plugs into IE, classic ASP, Windows Script Host, and COM hosts.
- Conditional compilation (`@cc_on`, `@if`) extended ECMA-262 — a dialect marker other engines never adopted.
- JScript 3.0 (June 1997) was, per Microsoft, the first scripting language fully conforming to ECMA-262.
- Later splits never went mainstream: JScript .NET (ES4-flavored, CLI) and Managed JScript (DLR) both died.

## Status

Historical: last classic version is 5.8 (IE8); IE9+ used the separate "Chakra" engine (JScript 9.0, 2011). Microsoft deprecated and offered disabling JScript in IE; Windows hosts still carry the 5.x engine.
