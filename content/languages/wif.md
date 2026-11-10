---
title: "WIF"
name: "WIF"
homepage: "http://www.tantradharma.com/maplehill/wif/wif.html"
references:
  - url: "http://www.tantradharma.com/maplehill/wif/wif1-1.txt"
    title: "Weaving Information File (WIF) Specification, Version 1.1 — Ravi Nielsen, Maple Hill Software"
  - url: "https://docs.adacad.org/docs/learn/getting-started/weave/"
    title: "Weave AdaCAD Drafts — exporting .WIF for dobby looms (AdaCAD documentation)"
author: "Ravi Nielsen (Patternland), Bob Keates (Fiberworks PCW), Rob Sinkler (Swiftweave)"
kind: "notation"
status: "active"
year: 1996
paradigms:
  - "domain-specific"
features:
  - "human-readable-text"
  - "ini-style-sections"
  - "private-sections"
  - "sparse-data-sections"
  - "tieup-matrix"
note: "Cross-program plain-text draft format: threading, tieup, treadling, and liftplan as numbered keylines, with sparse defaults and vendor-private sections; the interchange layer beneath handweaving CAD programs."
---
## Overview

The Weaving Information File (WIF) is a plain-text interchange format for weaving
drafts. A 1996 collaboration among handweaving-software authors replaced each
program's private draft file with one ASCII/INI-style [specification](http://www.tantradharma.com/maplehill/wif/wif1-1.txt)
that a weaver can also read.

## Code

::code-group

```text [primitives]
; semicolons open a comment line; [WIF] and [CONTENTS] are the only
; required sections — everything else is announced from [CONTENTS]
[WIF]
Version=1.1
Date=April 20, 1997
Source Program=Patternland
[WEAVING]
Shafts=4
Treadles=4
Rising Shed=true
```

```text [combinations]
[CONTENTS]
WEAVING=yes
WARP=yes
WEFT=yes
THREADING=yes
TIEUP=yes
TREADLING=yes
[THREADING]
1=1
2=2
3=3
4=4
5=1,3
```

```text [abstractions]
[TIEUP]            ; treadle -> the shafts it lifts
1=1,2
2=2,3
3=3,4
4=4,1
[TREADLING]       ; pick -> treadle; [LIFTPLAN] would store the product
1=1
2=2
3=3
4=4
```

```text [idioms]
[WARP]
Threads=800
Units=Inches
Spacing=0.05
; a Source ID namespaces vendor keys so other programs can skip them
[PRIVATE MHSPWSW Draft]
; a thread absent from [WARP COLORS] keeps the [WARP] defaults above
```

::

::note
A draft is factored, not drawn: `[THREADING]` sends each warp end to a shaft,
`[TIEUP]` says which shafts a treadle lifts, and `[TREADLING]` orders the
treadles — three tables that generate the interlacement, with `[LIFTPLAN]` as
the expanded alternative. Note also the sparse defaults in `[WARP]` and the
`[PRIVATE …]` namespace: the format spends bytes on readability, not density.
::

## Distinctive traits

- A draft factors into threading, tieup, and treadling tables, so one weave can be reused under many treadlings.
- `[LIFTPLAN]` stores the same fabric as one table of shafts per pick, letting a program skip tieup arithmetic.
- Sparse data: `[WARP]` and `[WEFT]` supply defaults, and a missing keyline means "unchanged", not "empty".
- Key order is explicitly ignorable, and `[PRIVATE <SourceID> <Section>]` reserves named space for vendor extensions.
- Booleans accept `true/on/yes/1`; a text keyline may not carry a comment, so parsers keep the two apart.
- It is an interchange layer: programs read and write WIF rather than agree on one internal model.

## Status

Version 1.1 (April 1997) is still the current specification, written by the authors
of Patternland, Fiberworks PCW, and Swiftweave with a dozen further programs
listed. Contemporary design tools such as [AdaCAD](https://docs.adacad.org/docs/learn/getting-started/weave/)
still export `.WIF` for dobby looms.
