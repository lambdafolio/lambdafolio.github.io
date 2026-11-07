---
title: "JavaScript OSA"
name: "JavaScript OSA"
homepage: "https://www.latenightsw.com/"
references:
  - url: "https://www.oreilly.com/pub/a/javascript/2001/05/11/js_for_mac.html"
    title: "JavaScript and Mac OS — Richard Hough, O'Reilly (May 11, 2001)"
  - url: "https://web.archive.org/web/20160106202442/http://www.latenightsw.com/sd5/whats-new-in-script-debugger-5/"
    title: "What's New in Script Debugger 5.0 — Late Night Software (JavaScript OSA dropped, 2012)"
author: "Late Night Software (Richard Hough)"
kind: "language"
status: "historical"
year: 2001
paradigms:
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
concurrency:
  - "tasks"
features:
  - "closures"
  - "first-class-functions"
influences:
  - "JavaScript"
influenced:
relations:
  - name: "JavaScript"
    kind: "dialect-of"
note: "Freeware Macintosh scripting language embedding Mozilla's SpiderMonkey engine into Apple's Open Scripting Architecture (2001) — JavaScript as an AppleScript alternative, with Core/MacOS host objects and Apple-event bindings."
---
## Overview

JavaScript OSA plugged [JavaScript](/languages/javascript) — Mozilla's SpiderMonkey core — into the Mac's Open Scripting Architecture as a freeware AppleScript alternative by Late Night Software. Scripts spoke to applications through Apple events instead of a browser DOM.

## Code

::code-group

```javascript [combinations]
// JavaScript OSA: host objects bind to Mac applications via Apple events.
const Finder = MacOS.app("Finder");

const disk = Finder.disks.byName("Macintosh HD");
disk.desktopPosition = { x: 100, y: 40 };

// AppleScript-style targets, JavaScript syntax:
const name = Finder.name;

console.log("Frontmost app: " + MacOS.frontmost.name);
```

::

::note
Paraphrased from the documented Core/MacOS object model — application objects
  arrive as Apple-event bindings; the core language is stock SpiderMonkey
  JavaScript.
::

## Distinctive traits

- Host objects, not a browser: `Core` and `MacOS` objects wrap Apple events; no DOM anywhere.
- Same core language as Netscape's engine — JS semantics with none of the web platform.
- Script Debugger integration: bundled with the flagship editor; scriptable like any OSA component.

## Status

Historical: released 2001, an alpha second version (2005) bundled with Script Debugger 4, then dropped from Script Debugger 5 in 2012 for lack of interest. Apple's JavaScript for Automation (JXA, 2014) later took the JavaScript-scripting niche system-wide.
