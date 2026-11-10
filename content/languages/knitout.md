---
title: "Knitout"
name: "Knitout"
homepage: "https://textiles-lab.github.io/knitout/knitout.html"
references:
  - url: "https://github.com/textiles-lab/knitout"
    title: "Knitout specification repository (textiles-lab/knitout)"
  - url: "https://publications.ri.cmu.edu/the-knitout-k-file-format"
    title: "The Knitout (.k) File Format — CMU Robotics Institute record, May 2017"
  - url: "https://textiles.cs.cmu.edu/posts/2017/11/27/kout1/"
    title: "Knitting with Knitout Part One: Hello World (Jenny Lin, CMU Textiles Lab)"
  - url: "https://github.com/textiles-lab/knitout-frontend-js"
    title: "knitout-frontend-js — JavaScript writer library (MIT)"
  - url: "https://textiles-lab.github.io/knitout/extensions.html"
    title: "Extensions for the Knitout (.k) File Format"
author: "James McCann (Carnegie Mellon University Textiles Lab)"
kind: "notation"
status: "active"
year: 2017
paradigms:
  - "domain-specific"
features:
  - "extension-opcodes"
  - "implicit-kickbacks"
  - "machine-independent-format"
  - "no-flow-control"
  - "source-comments"
note: "Machine-independent text format for low-level knitting-machine instructions: a generator emits operations on named needles and yarn carriers, and a per-machine backend turns the flat instruction list into control data."
---
## Overview

Knitout (`.k`) is a line-oriented [text format](https://textiles-lab.github.io/knitout/knitout.html)
for low-level knitting-machine instructions, machine-independent by design. Design
tools emit it and per-machine backends or simulators interpret it, replacing the
hand-edited, machine-specific pattern files that programming knitting machines
otherwise required.

## Code

::code-group

```knitout [primitives]
;!knitout-2
;;Machine: SWG091N2
;;Gauge: 15
;;Yarn-5: 50-50 Rust
;;Carriers: 1 2 3 4 5 6 7 8 9 10
;;Position: Right

inhook 5
tuck - f10 5
```

```knitout [combinations]
knit + f10 A B     ; bed letter + signed index; two carriers: plating
tuck - b2  C
rack 2             ; at racking R, back needle B aligns with front B+R
xfer f3 b1         ; loop transfer, no yarn consumed
split + f10 b8 A   ; f10 aligns with b8 here; old loops parked on b8
```

```javascript [abstractions]
const knitout = require('knitout')
const k = new knitout.Writer({ carriers: ['B'] })

function castOn(width) {              // alternating tuck, per the spec example
  for (let n = width; n >= 2; n -= 2) k.tuck('-', 'f' + n, 'B')
  for (let n = 1; n < width; n += 2) k.tuck('+', 'f' + n, 'B')
}

function stockinette(width, rows) {   // loops knitout refuses to express
  for (let r = 0; r < rows; ++r) {
    for (let n = width; n >= 1; --n) k.knit('-', 'f' + n, 'B')
    for (let n = 1; n <= width; ++n) k.knit('+', 'f' + n, 'B')
  }
}

k.inhook('B'); castOn(10); k.releasehook('B'); stockinette(10, 20)
k.write('out.k')                      // consumption: a .k file
```

```knitout [idioms]
; interleaved carriers: colorwork needs no capture choreography
knit + f10 B
knit + f9  C     ; no kickback needed
knit + f11 C     ; kickback needed: B's yarn is in the way
miss + f12 C     ; override: set C's logical position explicitly
xfer f12 b12
out C
```

::

::note
A header block, then one needle operation per line: direction, needle, carrier
set. Needles and [carrier sets](https://textiles-lab.github.io/knitout/knitout.html)
compose freely, but the format holds no loops of its own — the
[`Writer`](https://github.com/textiles-lab/knitout-frontend-js) library generates
them in [JavaScript](/languages/javascript). The last tab shows its own idiom:
[implicit kickbacks](https://textiles-lab.github.io/knitout/knitout.html) the
interpreter inserts, so colorwork needs no yarn-capture choreography.
::

## Distinctive traits

- A flat instruction list without flow control: the emitting tool unrolls loops and textures, so it is a [domain-specific](/paradigms/domain-specific) notation, not a general language.
- Interpreter-inserted kickbacks keep carriers clear of the yarn, so colorwork needs no capture choreography; the `miss` opcode overrides it.
- Beds, sliders, and racking are named symbolically, so one file can face different V-bed machines through different backends.
- `;!source:` comments tie each operation to the frontend line that emitted it, so a simulator reports errors at the design-tool location.
- Extension `x-*` opcodes and `X-*` headers carry vendor settings like [stitch number or presser mode](https://textiles-lab.github.io/knitout/extensions.html); readers warn on ones they lack.
- Generators such as [the 3D machine-knitting compiler](https://cdfg.mit.edu/publications/compiler-3d-machine-knitting) emit knitout; backends must act "as if" each stitch ran in written order, however they pack passes.

## Status

The specification stands at version 0.6, public domain since the 0.4 rewrite, and is
maintained by Carnegie Mellon's [Textiles Lab](https://textiles.cs.cmu.edu/). A
JavaScript writer and several research compilers use it as their low-level output.
