---
title: "OpenQASM"
name: "OpenQASM"
homepage: "https://openqasm.com/"
urls:
  - "https://en.wikipedia.org/wiki/OpenQASM"
references:
  - url: "https://openqasm.com/"
    title: "OpenQASM — official specification site"
influences:
  - "Verilog"
note: "Open Quantum Assembly Language for describing quantum circuits and algorithms; developed by IBM, released with Qiskit"
---
## Overview

OpenQASM is IBM's open specification for expressing quantum circuits and
algorithms — quantum assembly as interchange format. Version 3 (2021+) is
a full language: typed classical registers, control flow, and routines, so
a Qiskit-expressed algorithm ports across simulators and hardware.

## Code

::code-group

```openqasm [primitives]
OPENQASM 3;
include "stdgates.inc";
qubit[2] q;                       // primitives: quantum registers
bit[2]   c;
angle theta = pi / 4;             // fixed-precision angles

gate bell a, b {                  // abstractions: define a routine...
  h a;
  ctrl @ x a, b;                  // ...via gate modifiers
}
bell q[0], q[1];                  // apply it

c = measure q;                    // consume: measurement into bits
```

::

::note
Registers compose — slices (`q[0:2]`), index sets, and `ctrl @` /`inv @`
  modifiers stack on any gate, so new operations come from combining old ones;
  `gate` /`bell q[...]` above are the definable unit in action.
::

## Distinctive traits

- Quantum primitives are registers and gates; `qubit[n]`/`bit[n]` and
  hardware-precision `angle`/`duration` types model physical constraints.
- Gate modifiers (`ctrl @`, `inv @`, `pow(k) @`) derive new unitaries from
  definitions — abstraction through combination.
- Timing and hardware semantics (barriers, `defcal` calibration blocks) let
  one program target simulators and real devices.

## Status

Developed by IBM Quantum with open governance; the specification site
(openqasm.com) tracks versions (2.0 → 3.x) and the standard gate library.
Qiskit consumes and emits it; other SDKs and vendors support it to varying
degrees.
