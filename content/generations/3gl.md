---
title: "Third-generation language"
name: "Third-generation language"
references:
  - url: "https://www.rogerclarke.com/SOS/SwareGenns.html"
    title: "A Contingency Approach to the Application Software Generations — Roger Clarke (1991)"
  - url: "https://softwarepreservation.computerhistory.org/FORTRAN/"
    title: "History of FORTRAN and FORTRAN II — Computer History Museum software preservation"
  - url: "https://archive.org/details/computerscienceo0000broo_e5b8"
    title: "Computer Science: An Overview (11th ed.) — J. Glenn Brookshear"
generation: "3gl"
status: "active"
year: 1957
features:
  - "machine-independent"
  - "compiler-translated"
  - "procedural-abstraction"
  - "source-portability"
  - "structured-constructs"
note: "A procedural notation defined independently of any processor, translated by a compiler. The mapping to hardware is no longer one-to-one, which is what buys source portability and makes most general-purpose languages today third generation."
---

## Overview

The third generation is the **high-level** tier: a procedural notation whose
meaning is defined without reference to a particular processor, and whose
**compiler** performs a non-isomorphic translation into whatever instructions the
target provides. [FORTRAN](/languages/fortran), [COBOL](/languages/cobol), and
[ALGOL](/languages/algol) are its founding members; the Computer History Museum's
[FORTRAN archive](https://softwarepreservation.computerhistory.org/FORTRAN/)
dates that work to the mid-1950s, and
[Clarke](https://www.rogerclarke.com/SOS/SwareGenns.html) puts the theoretical
advance at FORTRAN around 1952–54 and ALGOL around 1958–60.

## Defining characteristics

- **Machine-independent source.** The language is specified over an abstract
  machine — variables, expressions, control flow — so a program is written once
  and **source portability** follows.
- **Compilation, not substitution.** The compiler resolves a *structure clash*
  between the language's primitives and the hardware's, which is exactly what
  separates this tier from assembly's one-to-one mapping.
- **Procedural abstraction.** Named procedures with parameters and local state
  become the unit of composition, letting a program be organized around the
  problem rather than the instruction set.
- **Structured constructs.** Block structure, loops, and conditional statements
  give control flow a shape of its own instead of relying on jumps, and later
  additions — **modular** compilation units, then classes — extend that.
- **It is the default tier.** Most general-purpose languages in use today are
  third generation; the label says little more than "compiled or interpreted
  high-level language", which is why [paradigms](/paradigms/declarative) and
  families say more about a language than its generation does.

## Status

Active and dominant. Third generation is not a historical stage but the
baseline: the tier is defined by the absence of a one-to-one correspondence with
the machine, and that absence is still what most languages are built on.

## Why the label thins out

"Third generation" is largely synonymous with "high-level", and "high-level" is
itself relative — Clarke notes the term was contested from the start, and the
[later tiers](/generations/4gl) were invented partly to say *how much higher* a
language sits. That is why the interesting questions in this schema are answered
by `paradigms` and `family`, not by generation.

[Perlis](https://www.cs.yale.edu/homes/perlis-alan/quotes.html) supplies the
measure the ladder was groping for: *"A programming language is low level when
its programs require attention to the irrelevant"* (epigram 8). On that test the
third generation earns its step by deleting instruction selection, storage
layout, and register allocation — the programmer names variables and the
compiler finds places to put them. But the criterion is a **continuum**, not a
staircase: a 3GL that makes you manage memory by hand still demands attention to
something the problem did not mention, and a "higher" generation that forces
you to declare schema details may demand more than a plainer language would.
That is the real reason this tier is hard to bound — not that the numbering is
sloppy, but that relevance is a property of each program, not of the tier its
language belongs to.
