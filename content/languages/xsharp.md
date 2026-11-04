---
title: "XSharp"
name: "XSharp"
homepage: "https://www.xsharp.eu/"
urls:
  - "https://github.com/X-Sharp"
references:
  - url: "https://github.com/X-Sharp"
    title: "X# — GitHub"
influences:
  - "dBase"
  - "Clipper"
note: "Open source .NET development language based on the xBase language family, with dialects such as Core, Visual Objects, Vulcan.NET, xBase++, Harbour, and FoxPro; built on top of Roslyn"
---
## Overview

X# is an open-source .NET language for the xBase family (dBase, Clipper,
FoxPro…), rebuilt on Roslyn by XSharp B.V. (Robert van der Hulst et al.).
It lets legacy xBase codebases compile to modern CLR; its "Core" dialect
serves as a modernized xBase for new development.

## Code

::code-group

```foxpro [abstractions]
FUNCTION Start() AS VOID             // Core dialect: typed xBase
  LOCAL o AS Person                  // LOCAL / PRIVATE / PUBLIC scoping
  o := Person{"Ada", 1995}           // := assignment; {…} object literal
  ? o:Name                           // ? = print statement (xBase lineage)
  FOR n := 1 TO 3                    // xBase keywords: FOR/WHILE/DO CASE
    ? n
  NEXT
CLASS Person
  PROPERTY Name AS STRING AUTO
  CONSTRUCTOR(cName AS STRING, nYear AS INT)
    SELF:Name := cName
END CLASS
```

::

::note
`FUNCTION` /`CLASS`/`PROPERTY` define units; typed declarations interleave
  with classic xBase idioms (`?`, `:=` , `SELF:` ) — the dialect keeps both
  worlds syntax-compatible.
::

## Distinctive traits

- Dialects as a product axis: Core, VO, Vulcan.NET, xBase++, Harbour, and
  FoxPro compatibility modes are a compile-time switch.
- Built on Roslyn: real CLR assemblies, .NET interop, and Visual Studio/
  VS Code integration rather than an interpreter.
- Retains xBase idioms: `?` output, `&` macro substitution, RDD database
  access, and the dBase expression culture.

## Status

Active open source (Apache-2.0) under the X# banner at xsharp.eu; regular
2.x releases into 2026; commercial backing from XSharp B.V. and an active
support forum for VO/Harbour/FoxPro migration projects.
