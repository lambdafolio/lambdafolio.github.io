---
title: "Mascara"
name: "Mascara"
homepage: "https://web.archive.org/web/20080606023346/http://ecmascript4.com/"
references:
  - url: "https://web.archive.org/web/20080606023346/http://ecmascript4.com/"
    title: "Mascara: ECMAScript 4 → Classic JavaScript translator (official site, June 6 2008 capture: v0.1 available)"
  - url: "https://web.archive.org/web/20090401141153/http://ecmascript4.com/about"
    title: "About Mascara — ecmascript4.com (archived)"
  - url: "https://web.archive.org/web/20140605044849/https://mail.mozilla.org/pipermail/es-discuss/2008-June/006434.html"
    title: "Announcement: Mascara 0.1 released — es-discuss list (Olav Kjær, June 9 2008)"
author: "Olav Junker Kjær"
kind: "language"
status: "historical"
year: 2008
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
typing: "gradual"
type_system:
  - "inferred"
  - "structural"
memory:
  - "gc"
execution:
  - "transpiled"
influences:
  - "ECMAScript"
relations:
  - name: "ECMAScript"
    kind: "derived-from"
  - name: "JavaScript"
    kind: "transpiles-to"
note: "Translator that extended JavaScript with abandoned-ES4 features — classes, namespaces, and optional type-checking — compiling to lowest-common-denominator JavaScript runnable in any browser."
---
## Overview

Mascara was a translator that extended JavaScript with the abandoned ECMAScript 4 draft's features — classes, namespaces, and optional type checking — while compiling to plain browser JavaScript. It anticipated what [TypeScript](/languages/typescript) later shipped at scale.

## Code

::code-group

```typescript [abstractions]
// ES4-flavored Mascara syntax: type annotations compile away entirely.
class Greeter {
  var name: string;
  function Greeter(name: string) {
    this.name = name;
  }
  function greet(): string {
    return "Hello, " + this.name;
  }
}

var g: Greeter = new Greeter("world");
alert(g.greet());
```

::

::note
Paraphrased from the site's ES4 sample structure — classes and annotations are
  Mascara syntax; below the translator this is prototype-based ES3 JavaScript.
::

## Distinctive traits

- Optional type-checking: static checks "with erasure", per the author — annotations erase in translation, so plain JavaScript stays valid input.
- ES4 feature carrier: classes and namespaces reached working JS years before ES2015 standardized them.
- The translator was a Python program running server-side; the demo hosted on Google App Engine.

## Status

Historical and dormant: Mascara 1.0 shipped in 2009 as a commercial product; the site stopped updating soon after. Ecma abandoned ES4 in 2008 — weeks after Mascara's first release — removing its founding premise.

## History

Version 0.1 was downloadable by June 6, 2008 (first successful homepage capture), announced by Kjær on the es-discuss list three days later — itself years after the project began against the obsolete Netscape ES4 draft. Ecma abandoned ES4 weeks after; Mascara 1.0 still shipped commercially in 2009.
