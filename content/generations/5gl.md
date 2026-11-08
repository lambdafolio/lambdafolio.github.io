---
title: "Fifth-generation language"
name: "Fifth-generation language"
references:
  - url: "https://www.rogerclarke.com/SOS/SwareGenns.html"
    title: "A Contingency Approach to the Application Software Generations — Roger Clarke (1991), §7–8"
  - url: "https://www.theregister.com/software/2007/01/17/what-makes-a-5gl/1545596"
    title: "What makes a 5GL? — Philip Howard, The Register (2007)"
  - url: "https://www.logicprogramming.org/"
    title: "Association for Logic Programming — the field the tier is drawn from"
generation: "5gl"
status: "historical"
year: 1981
features:
  - "constraint-based"
  - "declarative-problem-statement"
  - "inference-engine"
  - "logic-programming"
  - "no-algorithm-specified"
note: "The hoped-for tier above declarative programming, where the system derives its own algorithm from constraints and a knowledge base. Associated with logic programming and the 1980s Japanese fifth-generation project; the ambition outran the results."
---

## Overview

The fifth generation is the tier that was *promised* rather than achieved: a
**declarative problem statement** plus constraints, from which an **inference
engine** derives a solution with **no algorithm specified** by the programmer. It
is associated with **logic programming** — [Prolog](https://www.logicprogramming.org/)
and its descendants — and with Japan's Fifth Generation Computer Systems project,
launched in 1981. [Clarke's
survey](https://www.rogerclarke.com/SOS/SwareGenns.html) treats it as the
emergent tier above the [fourth](/generations/4gl).

## Defining characteristics

- **Constraint-based rather than procedure-based.** The programmer supplies
  conditions the answer must satisfy, in the hope that search and inference do
  the rest — the [logic](/paradigms/logic) and
  [declarative](/paradigms/declarative) styles taken to their limit.
- **An inference engine as the runtime.** Execution is deduction over a rule
  base rather than evaluation of instructions, which is what the tier promises
  over the fourth generation's program generation.
- **Knowledge representation.** The tier is tied to expert systems and
  knowledge bases, where a domain model is the program, in place of either
  procedures or queries.
- **Abstraction above delegation.** Clarke's model frames the fourth generation
  as delegating *how* while the fifth delegates the formulation of the solution
  itself, describing the human relationship as teaching rather than instructing.

## Status

Historical as a named generation, active as a set of techniques. The label was
applied to a hardware-and-software programme whose ambitions were not met, and
skepticism about it predates the results: in 2007 [Philip Howard
argued](https://www.theregister.com/software/2007/01/17/what-makes-a-5gl/1545596)
that no further level of abstraction above a 4GL is possible, so "5GL" names a 4GL
with extras. Constraint solving, logic programming, and rule engines nonetheless
survive and are used in earnest — [Oz](/languages/oz) among the languages in this
corpus.
