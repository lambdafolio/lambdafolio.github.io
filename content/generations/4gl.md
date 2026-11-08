---
title: "Fourth-generation language"
name: "Fourth-generation language"
references:
  - url: "https://www.rogerclarke.com/SOS/SwareGenns.html"
    title: "A Contingency Approach to the Application Software Generations — Roger Clarke (1991), §4–5"
  - url: "https://archive.org/details/applicationdevel00mart"
    title: "Application Development Without Programmers — James Martin (Prentice-Hall, 1981)"
  - url: "https://web.archive.org/web/20180424230256/http://archive.oreilly.com/pub/a/oreilly/news/vhll_1299.html"
    title: "Are VHLLs Really High-Level? — Greg Wilson (O'Reilly, 1999)"
generation: "4gl"
status: "historical"
year: 1981
features:
  - "non-procedural"
  - "set-at-a-time"
  - "domain-specific"
  - "program-generation"
  - "end-user-development"
note: "A notation that states the problem rather than the procedure for solving it, usually over a domain such as reports, queries, or forms. The tier is defined by delegating the how to the system — and the term was substantially a marketing label."
---

## Overview

The fourth generation is the **non-procedural** tier: the developer declares
what result is wanted — a query, a report, a screen — and the system supplies the
procedure. [James Martin's *Application Development Without
Programmers*](https://archive.org/details/applicationdevel00mart) (1981)
codified the term for specification languages that are not written in the
procedural style of the [third generation](/generations/3gl).

## Defining characteristics

- **Non-procedural, not merely high-level.** [Clarke's careful
  reading](https://www.rogerclarke.com/SOS/SwareGenns.html) is that the defining
  move is *delegation*: the 4GL operates with **set-at-a-time** operations over
  many records, where a 3GL would write a loop. SQL is the canonical example —
  one statement selects over a whole relation.
- **Domain-specific focus.** The tier grew up around databases, report
  generation, forms, and statistical manipulation, and the
  [domain-specific](/paradigms/domain-specific) narrowing is where its leverage
  comes from: the notation only has to be good at one class of problem.
- **Program generation.** Many members generate third-generation code, or drive
  a runtime that interprets tabular declarations, rather than being compiled
  directly.
- **End-user development.** The stated ambition was that domain experts could
  build their own applications, which is why the tier is tied to prototyping and
  to low-code descendants.
- **A boundary that blurred.** Once general-purpose languages absorbed
  declarative facilities and libraries, the line between 3GL and 4GL became hard
  to draw, and Clarke notes that both "procedural" and "non-procedural" sit on a
  continuum rather than naming two disjoint classes.

## Status

Historical as a marketing category, live as a set of ideas. The term was applied
broadly and loosely enough that it never acquired a crisp test, and the
abstraction claim it rests on is the one critics attacked most; the languages it
pointed at — SQL, report generators, spreadsheets — remain in daily use.

## Contested by design

This is the tier where the ladder stops being descriptive. Different sources
disagree on membership because they disagree on the criterion: productivity gain,
end-user authorship, relational data modelling, and program generation were all
proposed as the defining property, and Clarke's 1991 survey lists them side by
side before concluding that delegation is the common thread. Treat "is X a 4GL?"
as a question about which criterion is in play, not as a fact about X — and note
that the [fifth generation](/generations/5gl) was coined largely to get above
this ambiguity.
