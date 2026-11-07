---
title: "ActionScript"
name: "ActionScript"
homepage: "https://web.archive.org/web/20080906174753/https://www.adobe.com/devnet/actionscript/articles/actionscript3_overview.html"
references:
  - url: "https://web.archive.org/web/20080906174753/https://www.adobe.com/devnet/actionscript/articles/actionscript3_overview.html"
    title: "ActionScript 3.0 overview — Adobe (Grossman & Huang)"
  - url: "https://web.archive.org/web/20171202123704/https://theblog.adobe.com/adobe-flash-update/"
    title: "Flash & The Future of Interactive Content — Adobe (EOL announcement)"
  - url: "https://royale.apache.org/"
    title: "Apache Royale — AS3 to JavaScript"
  - url: "https://haxe.org/"
    title: "Haxe — multi-target language (AS3 successor)"
logo: "/logos/actionscript.png"
author: "Gary Grossman (Macromedia / Adobe)"
kind: "language"
status: "historical"
year: 1998
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
family: "ecmascript"
typing: "gradual"
type_system:
  - "structural"
execution:
  - "bytecode"
  - "jit"
concurrency:
  - "kernel-threads"
features:
  - "e4x"
  - "regex"
  - "namespaces"
  - "method-closures"
influences:
  - "ECMAScript"
  - "hypercard"
influenced:
  - "haxe"
relations:
  - name: "ECMAScript"
    kind: "dialect-of"
note: "ECMAScript-dialect scripting language of the Adobe Flash platform; grew from a Flash-4 'actions' toy into ActionScript 3.0 — a class-based, runtime-typed language running on the JIT-compiled AVM2 virtual machine"
---
## Overview

ActionScript is the ECMAScript-dialect language of the Adobe Flash platform, designed by Gary Grossman for interactivity in Flash Player. Version 3.0 was a full reworking: classes, runtime type checking, and a new JIT virtual machine.

## Code

::code-group

```actionscript [abstractions]
package org.wikipedia.example {
  import flash.display.Sprite;
  import flash.text.TextField;

  public class Greeter extends Sprite {
    public function Greeter() {
      var txtHello:TextField = new TextField();
      txtHello.text = "Hello World";
      this.addChild(txtHello);
    }
  }
}
```

::

::note
Abstraction in AS3 is Java-style: package/class/method units, with `addChild`
  placing the text field on the display list.
::

## Distinctive traits

- ECMAScript dialect with a Java-style classical class model, unlike JavaScript's prototype object model.
- Types survive to runtime (AVM2 checks and exploits them for native representation), rather than erasing like ECMAScript.
- E4X (ECMA-357) made XML a native data type with fluent navigation.
- Sealed vs `dynamic` classes: fixed shapes compile tighter; dynamic shells accept ad-hoc properties.

## Status

Historical: Flash Player was deprecated in 2017 and discontinued at end of 2020. The spec stayed freely offered; Apache Flex is the open-source AS3 compiler, Tamarin/AVM2 sources are Mozilla-hosted, and Apache Royale cross-compiles AS3 to JavaScript.
