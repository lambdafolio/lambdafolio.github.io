---
title: "KnitScript"
name: "KnitScript"
homepage: "https://mhofmann-khoury.github.io/knit_script/"
references:
  - url: "https://mhofmann-khoury.github.io/knit_script/language_reference.html"
    title: "KnitScript — language reference (Northeastern ACT Lab)"
  - url: "https://mhofmann-khoury.github.io/knit_script/machine_operations.html"
    title: "KnitScript — machine operations guide"
  - url: "https://github.com/mhofmann-Khoury/knit_script"
    title: "knit_script repository (mhofmann-Khoury/knit_script, MIT)"
  - url: "https://pypi.org/project/knit-script/"
    title: "knit-script on PyPI — V-bed knitting machine language"
  - url: "https://make4all.org/portfolio/knitscript-a-domain-specific-scripting-language-for-advanced-machine-knitting/"
    title: "KnitScript: A Domain-Specific Scripting Language for Advanced Machine Knitting (UIST 2023)"
author: "Megan Hofmann, Lea Albaugh, Tongyan Wang, Jennifer Mankoff, Scott E. Hudson"
kind: "language"
status: "active"
year: 2023
paradigms:
  - "domain-specific"
typing: "dynamic"
execution:
  - "interpreted"
features:
  - "carriage-pass-direction"
  - "carrier-management"
  - "knitout-codegen"
  - "multi-sheet-gauge"
  - "needle-selection"
  - "python-interop"
relations:
  - name: "Knitout"
    kind: "transpiles-to"
  - name: "Python"
    kind: "implemented-in"
note: "Python-like scripting language for V-bed knitting machines: needle sets, carriage-pass directions, and fabric sheets abstract knitout's flat operations, and a Python entry point injects design parameters."
---
## Overview

KnitScript is a [domain-specific](/paradigms/domain-specific) scripting language for
writing V-bed knitting-machine programs. It exposes machine state — carriers,
directions, fabric sheets — as scoped language constructs and
[compiles to knitout](https://mhofmann-khoury.github.io/knit_script/quickstart.html),
so a design can be parametric without hand-writing needle operations.

## Code

::code-group

```knitscript [primitives]
// dynamically typed, following Python conventions; statements end with ;
width = 20;                 // int
is_finished = True;         // bool
needle_list = [1, 2, 3, 4]; // list
pattern_dict = {"a": 1};    // dictionary
print f"Knitting {width} stitches";  // f-strings
```

```knitscript [combinations]
Carrier = c1;                       // machine state: the active carrier
in Leftward direction:{             // one carriage pass, one direction
  tuck Front_Needles[0:width:2];    // even needles: a Python-style slice
  knit Loops;                       // a built-in set: needles holding loops
}
xfer Front_Loops 2 to Right to Back bed;  // offset transfer
drop Front_Needles[0:5];
```

```knitscript [abstractions]
def alt_tuck_cast_on(width = 10):{   // default argument, as in Python
  in Leftward direction:{
    tuck Front_Needles[0:width:2];
  }
  in reverse direction:{             // opposite of the last directed pass
    tuck Front_Needles[1:width:2];
  }
}

with Carrier as c1:{                 // carrier state is scoped
  alt_tuck_cast_on(12);              // call it
}
```

```knitscript [idioms]
with Carrier as c1, Gauge as 2:{    // two fabric sheets, layered for free
  with Sheet as s0:{                // rib on the front of the tube
    in Leftward direction:{ knit Front_Needles[0:width:2]; }
  }
  with Sheet as s1:{                // falls behind s0 by default
    in reverse direction:{ knit Back_Needles[1:width:2]; }
  }
  for _ in range(height):{
    with Sheet as s0:{ in reverse direction:{ knit Loops; } }
    with Sheet as s1:{ in reverse direction:{ knit Loops; } }
  }
}
cut c1;
```

::

::note
Python-shaped values and slices; [needle-set
variables](https://mhofmann-khoury.github.io/knit_script/language_reference.html#built-in-needle-sets)
that replace coordinates; functions and `with` blocks that scope the machine
state; then the idiom the paper is about — a
[gauge](https://mhofmann-khoury.github.io/knit_script/machine_operations.html#gauge-configuration)
of stacked sheets, where layer bookkeeping that knitout leaves to transfers
becomes a scope. Every block compiles to [Knitout](/languages/knitout).
::

## Distinctive traits

- Machine state is lexical: `Carrier`, `Racking`, `Gauge`, and `Sheet` are [scoped variables](https://mhofmann-khoury.github.io/knit_script/language_reference.html#machine-state-variables), not calls into a library.
- A [direction block](https://mhofmann-khoury.github.io/knit_script/machine_operations.html#direction-keywords) turns a set of stitches into one carriage pass, sorting them by travel direction instead of source order.
- `reverse` and `current` name a direction relative to the previous pass, so patterns survive being reversed.
- Built-in needle sets (`Loops`, `Front_Loops`, `Last_Pass`) plus Python slicing select needles declaratively rather than by index arithmetic.
- Multi-sheet gauges model layered fabric directly, avoiding the transfer sequences a ribbed tube would otherwise need to keep untangled.
- It is a script, not a schema: [Python supplies the parameters](https://mhofmann-khoury.github.io/knit_script/quickstart.html#parameterized-patterns) and wraps the interpreter for interfaces and generators.

## Status

Published at UIST 2023 and released on [PyPI](https://pypi.org/project/knit-script/) as
`knit-script` (MIT), maintained by the Northeastern ACT Lab. Its target is industrial
V-bed machines, and it emits knitout rather than vendor data directly.
