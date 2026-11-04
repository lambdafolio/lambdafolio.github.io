---
title: "Managed JScript"
name: "Managed JScript"
homepage: "https://web.archive.org/web/20070517211412/http://blogs.msdn.com/jscript/archive/2007/05/04/managed-jscript-announced.aspx"
references:
  - url: "https://web.archive.org/web/20070517211412/http://blogs.msdn.com/jscript/archive/2007/05/04/managed-jscript-announced.aspx"
    title: "Managed JScript announced — JScript Blog (Deepak Jain, May 4 2007)"
  - url: "https://web.archive.org/web/20070503201806/http://blogs.msdn.com/hugunin/archive/2007/04/30/a-dynamic-language-runtime-dlr.aspx"
    title: "A Dynamic Language Runtime (DLR) — Jim Hugunin (MIX07 announcement, April 30 2007)"
author: "Microsoft (JScript team / DLR team; announced by Jim Hugunin, Deepak Jain)"
kind: "language"
status: "historical"
year: 2007
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "bytecode"
  - "sandboxed"
influences:
  - "JScript"
  - "JavaScript"
relations:
  - name: "ECMAScript"
    kind: "dialect-of"
note: "Microsoft's ECMAScript 3 implementation on the Dynamic Language Runtime, shipped with Silverlight 1.1 Alpha (MIX07) and ASP.NET Futures; distinct from JScript.NET — no typed variables, classes, or assembly output."
---
## Overview

Managed JScript was Microsoft's ECMAScript 3 implementation on the Dynamic Language Runtime, announced at MIX07 and shipped in the Silverlight 1.1 Alpha. It gave JavaScript developers CLR/DLR hosting, cross-language interop, and a browser-plugin sandbox.

## Code

::code-group

```javascript [abstractions]
// Managed JScript (Silverlight DLR): dynamic code over CLR objects.
import System;
import System.Windows.Browser;

var page = HtmlPage.Document;
var outEl = page.getElementById("output");

function greet() {
    // Dynamic typing the whole way down; DLR interops with C#/Ruby/VB.
    outEl.innerHTML = "hello from Managed JScript";
}
```

::

::note
Paraphrased from the documented Silverlight QuickStart model — `HtmlPage`
  bridges to the browser; the engine runs CoreCLR inside the plugin sandbox.
::

## Distinctive traits

- DLR-native: shares the dynamic type system and hosting model with IronPython/IronRuby, not Active Scripting.
- Distinct product line from JScript .NET: no typed variables, no JScript.NET classes, no assembly generation.
- Browser-sandboxed via Silverlight's CoreCLR — managed code execution inside a web plugin.

## Status

Historical: Silverlight itself was deprecated (end of support 2021) and the DLR-JavaScript line never shipped beyond alpha-era releases; Microsoft abandoned Managed JScript plans by August 2009 per the DLR history.
