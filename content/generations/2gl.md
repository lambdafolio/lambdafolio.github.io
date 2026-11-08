---
title: "Second-generation language"
name: "Second-generation language"
references:
  - url: "https://archive.org/details/computerscienceo0000broo_e5b8"
    title: "Computer Science: An Overview (11th ed.) — J. Glenn Brookshear"
  - url: "https://www.rogerclarke.com/SOS/SwareGenns.html"
    title: "A Contingency Approach to the Application Software Generations — Roger Clarke (1991), Exhibit 1"
  - url: "https://www.cs.yale.edu/homes/perlis-alan/quotes.html"
    title: "Epigrams in Programming — Alan J. Perlis (ACM SIGPLAN Notices, September 1982), epigram 8"
generation: "2gl"
status: "historical"
year: 1949
features:
  - "mnemonic-mapping"
  - "one-to-one-with-machine"
  - "requires-assembler"
  - "processor-family-specific"
  - "machine-dependent"
  - "attention-to-irrelevant-detail"
note: "Symbolic mnemonics standing in for the machine instruction set, translated by an assembler. The mapping stays one-to-one, so the programmer still thinks in the processor's terms — just in readable ones."
---

## Overview

A second-generation language is an **assembly language**: a **mnemonic
mapping** onto one processor family's instruction set, converted to machine code
by an **assembler**. [Clarke's model](https://www.rogerclarke.com/SOS/SwareGenns.html)
calls the translation *isomorphic* — the highest level of machine activity is a
direct, mechanical substitution of symbols for bit patterns. It sits between
[first-generation machine code](/generations/1gl) and the
[third-generation](/generations/3gl) languages that broke the one-to-one mapping.

## Defining characteristics

- **Mnemonics, not numbers.** Instructions and locations get names. That is the
  whole gain: the notation becomes readable and writable by a human while the
  underlying shape stays identical.
- **One-to-one with machine instructions.** A line of assembly corresponds to a
  processor command, optionally with macros expanding one line to several. Because
  the correspondence is this tight, the language is still "the machine's terms"
  rather than an abstraction over them.
- **An assembler is mandatory.** Unlike first-generation code, this notation
  cannot be executed as written; it **requires an assembler** to produce the
  bit patterns the hardware consumes.
- **Processor-family-specific.** The language belongs to an instruction set, so
  programs remain **machine-dependent**: moving to another architecture means
  rewriting, and assemblers are themselves written per target.
- **Still used where the machine is the point.** Boot loaders, interrupt
  vectors, device drivers, and hand-tuned inner loops are written here because
  nothing sits closer to the hardware.

## Status

Historical as a general-purpose choice, active as a specialized one. Ordinary
application code moved upward once compilers could match hand-written assembly;
assembly survives where the exact instruction sequence *is* the requirement.

## Why the tier exists

Assembly is the first rung that separates *what the machine executes* from *what
the programmer writes*. Everything above it — every later generation, beginning
with the [third](/generations/3gl) — inherits that separation, which is why the
ladder only becomes interesting from here on.

Seen through [Perlis's criterion](https://www.cs.yale.edu/homes/perlis-alan/quotes.html)
— *"A programming language is low level when its programs require attention to
the irrelevant"* — assembly buys a specific and limited improvement: it deletes
the **instruction encoding** from the set of things a programmer must keep in
mind. Writing `MOV AX, 4C00h` instead of the corresponding byte pattern removes
one class of irrelevant attention and leaves the rest intact. Register
assignment, address arithmetic, the calling convention, and per-architecture
differences all remain the programmer's problem, which is exactly why assembly is
still low level by that definition even though it is a generation higher than
machine code.

## A note on the date

The `year` recorded here is **1949**, and like the [first-generation
page](/generations/1gl) it is an era marker rather than a sourced
first-appearance date. Assembly has no coining moment either: mnemonic coding
schemes were devised by individual programmers and machine vendors through the
late 1940s and were not named as a *generation* until the label was back-formed
in the 1960s. 1949 is an anchor for the first assembler-like programs, not a
claim that assembly was invented that year.

What *can* be dated is the recognition, not the technique —
[Clarke](https://www.rogerclarke.com/SOS/SwareGenns.html) records that the
1GL/2GL labels were applied retroactively once "third generation" entered use.
The tier is therefore better identified by what it removes than by when it
appeared, and the Perlis criterion above is the durable description: assembly
deletes instruction encoding from the set of things a programmer must attend to,
and nothing more. Compare `4gl`'s 1981, which marks Martin's publication of the
term, and `5gl`'s, which marks the launch of the Japanese project — both are
genuine coinages, and this page has no equivalent.
