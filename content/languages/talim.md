---
title: "Talim"
name: "Talim"
references:
  - url: "https://archive.org/details/sectionilinguis00leitgoog"
    title: "Linguistic Fragments … followed by an Account of Shawl-Weaving — G. W. Leitner, 1882 (Lahore: Punjab Govt. Civil Secretariat Press)"
  - url: "https://tapadesi.com/wp-content/uploads/2011/10/decoding-the-talim-marg.doc"
    title: "Decoding the Talim — Peter Harris, Marg 62(1), September 2010 (author's copy)"
  - url: "https://tapadesi.com/wp-content/uploads/2011/10/talim-and-twill-tapestry.doc"
    title: "Talim and Twill Tapestry — Peter Harris, in The Kashmir Shawl (Frank Ames, 3rd ed.)"
  - url: "https://link.springer.com/article/10.1007/s10339-016-0788-z"
    title: "Cognitive dimensions of talim: evaluating weaving notation through cognitive dimensions framework — Gagan Deep Kaur, Cognitive Processing 18(2), 2017"
  - url: "https://journals.sagepub.com/doi/10.1177/1359183519862585"
    title: "Linguistic mediation and code-to-weave transformation in Kashmiri carpet weaving — Gagan Deep Kaur, Journal of Material Culture 25(2), 2020"
author: "Kashmiri shawl-weaving workshops"
kind: "notation"
status: "active"
paradigms:
  - "domain-specific"
features:
  - "brick-grid-reading"
  - "columnar-row-total"
  - "half-nal-offset"
  - "knot-count-and-colour-sign"
  - "recited-code"
  - "repeat-unit-compression"
note: "Handwritten shawl- and carpet-weaving notation from Kashmir: each code unit is a knot count with a colour sign, rows close on a fixed nals total, and alternate lines offset by half a unit."
---
## Overview

Talim is the paper notation Kashmiri shawl weavers read to tie a design knot by
knot, written in a shawl alphabet of numerals and conventional colour signs.
[Leitner's 1882 account](https://archive.org/details/sectionilinguis00leitgoog)
reproduces four raftars — weaving stages — beside the drawings they encode.

## Code

Talim has no machine-readable syntax, so the tour shows it in its own terms: the
numeral table, one raftar as Leitner transliterated it, and a manuscript page.
There is no *abstractions* tab because there is no call or name to abstract with —
a repeating design is written once and re-read, which is compression, not
abstraction. Plates are cropped from the 1882 volume; the originals stay
authoritative.

::code-group

::div{label="primitives"}
![The complete shawl numeral table, 40 to 100, each with its Urdu and shawl names](/images/talim/talim-numerals.png){width="470"}

Leitner: "The tens are denoted by the dots in the circle and units by the numeral
affixed" — `40` is a circle of four dots, `44` four dots plus a `4`. Colour signs
are separate marks placed beside the numeral and are "purely conventional, the
same sign being sometimes used in different places for different colors".
::

::div{label="combinations"}
A raftar is one line of the code: a knot count, then the name of its colour,
repeated across the width until the row is complete.

```text [combinations]
; Leitner's transliteration of the 3rd raftar, "consisting of 81 nals" —
; a knot count, then its colour name, continuing across the width
1 chisi   2 zengri  3 zardi   2 zengri  3 zardi   2 zengri
3 zardi   2 zengri  2 abbasi  2 zengri  3 zardi   2 zengri
3 zardi   4 zengari 1 fili    4 zengri  3 zardi   2 zengari
3 zardi   2 zengri  3 zardi   2 zengari 4 zardi   5 zengri
6 chisi   3 zengri  3 zardi   2 zengari 3 zardi   1 zengri
; the counts total 81 — every raftar of this design closes on 81 nals
```

![The woven margin the talim describes](/images/talim/talim-zanjiri.png){width="250"}

The drawing on the same plate: one raftar of counts encodes one pass of this
margin. Leitner writes that a mistake "is corrected by a comparison of the parts
woven with this paper" — the drawing is what the weaver checks the arithmetic
against.
::

::div{label="idioms"}
![A talim manuscript page, the upper Tausama, in the shawl hand](/images/talim/talim-manuscript.png){width="470"}

A page of the manuscript itself — ruled lines, one raftar per line, the nals
total noted at the top of the sheet, and the same lines read out to the weavers.
::

::

::note
The **table** is the alphabet: tens by dots, units by a numeral, colour by a
conventional mark — so `2 zengri` reads "two rusty". The **raftar** is one line of
that stream, and the invariant is arithmetic rather than decorative: every line
must total the warp's nals, which Kaur records as the check that catches a
[miscopy at the row's end](https://link.springer.com/article/10.1007/s10339-016-0788-z).
The **page** shows why the notation has no abstraction — a repeating motif is
written once and the same lines re-read — while
[Harris's reading](https://tapadesi.com/wp-content/uploads/2011/10/decoding-the-talim-marg.doc)
of the half-nal marks at every second line's end makes the working grid brickwise.
::

## Distinctive traits

- Each code unit is a knot count, with its colour sign written beside the numeral and known by convention or colour card.
- Every columnar row must total the same width, which turns a miscount into a detectable error at the row's end.
- Alternate lines are offset half a nal, matching the diagonal of the twill structure the design sits on.
- In repeating designs only one unit of the motif is written, then re-read for each repeat — the notation's only compression.
- The code is not self-describing: decoding conventions stay off the page and are taught, and rows are recited aloud among teams of weavers.
- Reading order is inverted: the code runs top-to-bottom while the loom is worked bottom-to-top.

## Status

Still in use in Kashmiri carpet weaving, where Kaur's fieldwork records a
[ta'lim navis](https://journals.sagepub.com/doi/10.1177/1359183519862585) writing
the lines and weavers decoding them aloud. No formal grammar exists; the
conventions are transmitted through apprenticeship and are not written down.

## History

Leitner's 1882 volume — the source of these plates — names the writer (ta'lim
navis) and the designer (tarah saz), records the workshop recitation, and prints
the first table of the signs. Harris dates the alphabet to the 18th century on a
weaver's account recorded in 1933, and carpet weaving later adopted the notation
from shawl making.
