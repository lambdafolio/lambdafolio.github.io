---
title: "Esterel"
name: "Esterel"
homepage: "http://www-sop.inria.fr/meije/esterel/esterel-eng.html"
urls:
  - "https://en.wikipedia.org/wiki/Esterel"
  - "http://www1.cs.columbia.edu/~sedwards/cec/"
  - "https://docs.racket-lang.org/esterel/"
references:
  - url: "http://www-sop.inria.fr/meije/esterel/esterel-eng.html"
    title: "Esterel — INRIA Meije project page (primary)"
  - url: "http://www1.cs.columbia.edu/~sedwards/cec/"
    title: "Columbia Esterel Compiler"
  - url: "https://docs.racket-lang.org/esterel/"
    title: "Esterel in Racket — documentation"
author: "Gérard Berry et al. (École des Mines de Paris & INRIA)"
paradigms:
  - "imperative"
  - "reactive"
  - "synchronous"
influenced:
  - "SyncCharts"
  - "Blech"
note: "Synchronous imperative language for reactive systems; replaces physical time with deterministic logical instants. Commercialized as Esterel Studio and commercialized as part of the SCADE lineage for safety-critical avionics; compiles to C or RTL (VHDL/Verilog)"
---
## Overview

Esterel is a synchronous imperative language for reactive systems. It replaces physical time with logical instants, making concurrency deterministic by construction and programs amenable to formal verification.

## Code

::code-group

```esterel [idioms]
signal S, T;
loop
  every 10 do
    emit Alarm
  end every
  abort await S until T;
  emit O;
end loop
```

::

::note
Preemption and broadcast in one shape — `abort ... until T` discards the wait
  mid-instant when `T` arrives; `every 10` raises a tick-counted cycle;
  communication is instantaneous within a single tick. Paraphrased from the
  language's documented constructs.
::

## Distinctive traits

- Multiform time: programs see instants, not seconds — deterministic scheduling by construction.
- Broadcast signals: present-or-absent communication, instantaneous within a single tick.
- Preemption is first-class: `suspend`, `await`, and `abort` are core constructs, not libraries.
- Dual targets: compilers generate both C and RTL hardware descriptions (VHDL/Verilog).

## Status

Industrialized in the SCADE suite for safety-critical avionics; the IEEE P1778 standardization attempt dissolved in 2011. The open-source Columbia Esterel Compiler and a Racket implementation exist; commercial lineage via Esterel Technologies.
