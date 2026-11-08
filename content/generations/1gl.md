---
title: "First-generation language"
name: "First-generation language"
references:
  - url: "https://archive.org/details/computerscienceo0000broo_e5b8"
    title: "Computer Science: An Overview (11th ed.) — J. Glenn Brookshear, ch. on levels of abstraction"
  - url: "https://www.rogerclarke.com/SOS/SwareGenns.html"
    title: "A Contingency Approach to the Application Software Generations — Roger Clarke (1991)"
  - url: "https://www.cs.yale.edu/homes/perlis-alan/quotes.html"
    title: "Epigrams in Programming — Alan J. Perlis (ACM SIGPLAN Notices, September 1982), epigram 8"
generation: "1gl"
status: "historical"
year: 1943
features:
  - "machine-instruction-encoding"
  - "no-translator"
  - "hardware-specific"
  - "directly-executable"
  - "attention-to-irrelevant-detail"
note: "The instruction set of a particular processor written in its own numeric encoding: no translator stands between the program and the machine, and nothing in the notation survives a change of hardware."
---

## Overview

A first-generation language is the numeric **machine instruction encoding** of
one processor, entered without a **translator**. [Clarke's 1991
model](https://www.rogerclarke.com/SOS/SwareGenns.html) places it at the bottom
of the ladder: the programmer expresses the solution "in the machine's terms",
and the highest level of machine activity is the computation itself — there is no
translation step at all. Its successor, [second-generation
language](/generations/2gl), inserts exactly one: the assembler.

## Defining characteristics

- **No layer between program and machine.** A source file *is* the
  **directly executable** bit pattern; no assembler, compiler, or interpreter
  stands in the way. Early machines took these patterns through front-panel
  switches or paper tape rather than from a text file.
- **Encoding is numeric.** Instructions appear as binary, or octal/hexadecimal
  shorthand for human convenience. The vocabulary is the instruction set and
  nothing else: there are no names for locations, no expressions, and no loops
  beyond branch instructions.
- **Hardware-specific by construction.** The notation is defined by one
  processor's instruction set, so portability is not merely poor — it is
  undefined. A program for one machine is meaningless on another.
- **It demands constant attention to the irrelevant.** Perlis's definition of
  "low level" is not positional: *"A programming language is low level when its
  programs require attention to the irrelevant"* ([epigram 8](https://www.cs.yale.edu/homes/perlis-alan/quotes.html)
  in *Epigrams in Programming*). Here the irrelevant is almost everything —
  binary encoding, register assignment, address arithmetic, instruction
  scheduling — none of which is part of the problem being solved but all of
  which the program cannot omit.
- **One-to-one with machine activity.** Every encoded instruction corresponds to
  a single operation the hardware performs, which is what separates this tier
  from every later one.

## Status

Historical as a way of writing programs, universal before assemblers and still
reachable — modern compilers emit machine code, and disassemblers read it — but
nobody authors applications in it. The tier exists today as a *target* format
rather than a notation.

## Naming and retroactivity

The term is back-formed. "Third generation" entered use first, in the
mid-1960s, and machine code and assembly were labelled first and second
generation only afterward, to fill out the ladder below it. Clarke records the
convention as distinguishing machine language from "in succession, assembler and
procedural languages" — a retrospective ordering of things that already existed,
not a design program. The point is argued at length in
[Clarke's paper](https://www.rogerclarke.com/SOS/SwareGenns.html), which treats
the whole ladder as a set of levels of abstraction from the hardware rather than
as a historical sequence.

## Why this tier is the *reference* low level

[Perlis's criterion](https://www.cs.yale.edu/homes/perlis-alan/quotes.html) is
worth using as the yardstick for the whole ladder, because it survives the
objection that the generations are a marketing artifact. First-generation code is
not low level because a diagram puts it at the left edge — it is low level
because a correct program cannot be written without deciding things that the
problem does not mention. Every later tier is best read as removing one named
class of that *irrelevant* attention: assembly removes instruction encoding, the
third generation removes instruction selection and storage layout. That framing
also explains why the ladder stalls at the top: a tier only earns its number by
deleting a specific kind of irrelevant work, and once nothing irrelevant is left
to delete, adding a generation number adds a word rather than a capability.

## A note on the date

The `year` recorded here is **1943**, and it should be read as an era marker
rather than a first-appearance date. Machine code has no single author, no
release, and no first program: it is whatever encoding a given processor accepts,
and processors of the 1940s were largely programmed by reconfiguring them rather
than by loading a stored program. 1943 is therefore an anchor near the start of
the stored-program era, not a sourced claim about when first-generation code was
first written.

No sharper date exists on the same evidentiary footing as the rest of this page.
[Clarke](https://www.rogerclarke.com/SOS/SwareGenns.html) dates the *ladder*,
not its bottom rung — he records that the 1GL and 2GL labels were back-formed
after "third generation" entered use in the mid-1960s — so the strongest
defensible statement is that machine code predates every other tier and has no
documented birthday. Treat the field as approximate. Unlike this page's
neighbors, it does not mark a coining: `4gl`'s 1981 is the year Martin published
the term, and `5gl`'s is the year the Japanese project launched.
