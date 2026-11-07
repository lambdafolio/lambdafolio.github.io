---
title: "WMLScript"
name: "WMLScript"
homepage: "https://web.archive.org/web/20250725134250/https://www.openmobilealliance.org/tech/affiliates/wap/wap-193-wmlscript-20001025-a.pdf"
references:
  - url: "https://web.archive.org/web/20250725134250/https://www.openmobilealliance.org/tech/affiliates/wap/wap-193-wmlscript-20001025-a.pdf"
    title: "WMLScript Specification (WAP-193) — WAP Forum / Open Mobile Alliance"
  - url: "https://www.developershome.com/wap/wmlscript/"
    title: "WMLScript Tutorial — developershome.com (language rules, byte-code compilation, six standard libraries)"
author: "WAP Forum (later Open Mobile Alliance)"
kind: "dialect"
status: "historical"
year: 1998
paradigms:
  - "imperative"
family: "ecmascript"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "bytecode"
  - "interpreted"
features:
  - "closures"
  - "external-functions"
  - "first-class-functions"
  - "standard-libraries"
influences:
  - "ECMAScript"
influenced:
relations:
  - name: "ECMAScript"
    kind: "dialect-of"
note: "WAP's JavaScript analogue for Wireless Markup Language pages (April 1998): ECMAScript-derived syntax with a bytecode-compiled low-bandwidth execution model, function-only (no objects or arrays), and six device standard libraries."
---
## Overview

WMLScript is the scripting companion to Wireless Markup Language in the Wireless Application Protocol — browser scripting for early mobile phones. Its ECMAScript-derived syntax was compiled to compact [bytecode](https://developer.mozilla.org/en-US/docs/Glossary/Bytecode) for low-bandwidth links.

## Code

::code-group

```javascript [abstractions]
// WMLScript (.wmls): functions only — no objects, no arrays.
extern function validateForm(zip) {
  if (String.length(zip) != 5) {
    Dialogs.alert("ZIP must be 5 digits");
    return false;
  }
  WMLBrowser.setVar("z", zip);
  WMLBrowser.refresh();        // push the card to the display
  return true;
}
```

::

::note
`extern` exports the function for WML `<a>` invocation; `WMLBrowser`
  /`Dialogs` are standard libraries, replacing the DOM-style host objects of web
  JavaScript.
::

## Distinctive traits

- Function-only core: no objects, no arrays — ECMAScript syntax pruned to procedures and primitives.
- Built-in standard libraries (Lang, Float, String, URL, WMLBrowser, Dialogs) supply every host capability.
- Compiled to bytecode ahead of transfer on tight wireless links, then interpreted on the handset VM.
- Split with JavaScript: source files (.wmls) are separate from WML decks; cards call functions by URL anchor.

## Status

Historical: launched with WAP 1.x (April 1998), consolidated spec WAP-193 in 2001. The WAP stack itself lost to XHTML/basic browser stacks in the mid-2000s; WMLScript had no successor lineage.
