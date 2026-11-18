---
title: "PL/I"
name: "PL/I"
homepage: "https://www.ibm.com/products/pli-compiler-zos"
references:
  - url: "https://ecma-international.org/publications-and-standards/standards/ecma-50/"
    title: "ECMA-50 — Programming Language PL/I, 1st edition (December 1976)"
  - url: "https://www.iso.org/standard/12406.html"
    title: "ISO 6160:1979 — Programming languages: PL/I (endorsement of ANSI X3.53-1976)"
  - url: "https://www.ibm.com/docs/en/epfz/6.2.0?topic=language-reference"
    title: "Enterprise PL/I for z/OS 6.2 — Language Reference (IBM)"
  - url: "https://www.microfocus.com/documentation/openpli/80/pfdecl.htm"
    title: "Open PL/I — Chapter 4: Declarations and Attributes (Micro Focus)"
  - url: "https://www.microfocus.com/documentation/openpli/80/pfstmt.htm"
    title: "Open PL/I — Chapter 8: Statements (Micro Focus)"
  - url: "https://multicians.org/pl1.html"
    title: "The Choice of PL/I — Multics history, by McIlroy, Van Vleck, Mills, Freiburghouse et al."
  - url: "https://web.archive.org/web/2020/http://www.bitsavers.org/pdf/ibm/npl/320-0908_NPL_Technical_Report_Dec64.pdf"
    title: "NPL Technical Report (IBM, December 1964) — the language's first definition, archived"
  - url: "https://dl.acm.org/doi/10.1145/363707.363708"
    title: "NPL: Highlights of a New Programming Language — Radin and Rogoway, Communications of the ACM 8(1), 1965"
author: "IBM and the SHARE Advanced Language Development Committee"
kind: "language"
status: "active"
year: 1964
paradigms:
  - "imperative"
  - "structured"
  - "systems"
family: "pl-i"
typing: "static"
memory:
  - "arena"
  - "manual"
execution:
  - "ahead-of-time"
concurrency:
  - "tasks"
features:
  - "bit-strings"
  - "decimal-arithmetic"
  - "exception-handling"
  - "multitasking"
  - "no-reserved-words"
  - "picture-data"
  - "storage-classes"
influences:
  - "ALGOL"
  - "COBOL"
  - "FORTRAN"
note: "Designed to serve scientific, commercial, real-time and systems programmers in one language: ALGOL block structure, COBOL-style records and picture editing, FORTRAN arithmetic, storage classes and ON-units. Multics was written in it."
---

## Overview

PL/I is a procedural, imperative language designed by IBM and a SHARE
committee so one language could serve scientific, commercial and systems
programmers. It combined [ALGOL](/languages/algol) block structure with
[COBOL](/languages/cobol)-style records and picture editing,
[FORTRAN](/languages/fortran) arithmetic, programmer-controlled storage classes
and ON-unit exception handling.

## Code

::code-group

```text [primitives]
hello: proc options(main);
  dcl n fixed binary(31) init(42);
  dcl msg char(20) varying;
  dcl flags bit(8) aligned init('10101010'b);
  dcl rate fixed decimal(5,2) init(0.05);
  msg = 'total: ' || char(n);
  put skip list(msg, n * 2, rate, flags);
end hello;
```

```text [combinations]
invoice_report: proc options(main);
  dcl 1 invoice,
        2 customer char(12) varying,
        2 total    fixed decimal(9,2) init(0),
        2 qty(5)   fixed binary(15);
  dcl items(3) char(8) init('nut','bolt','washer');
  dcl i fixed binary(15);
  do i = 1 to 5;
    invoice.qty(i) = i * 10;
    invoice.total = invoice.total + invoice.qty(i);
  end;
  put skip list(invoice.total, invoice.qty(3), items(2));
end invoice_report;
```

```text [abstractions]
report: proc options(main);
  sum_to: procedure(limit) returns(fixed binary(31));
    dcl (limit, i, acc) fixed binary(31);
    acc = 0;
    do i = 1 to limit;
      acc = acc + i;
    end;
    return(acc);
  end sum_to;
  put skip list(sum_to(10));
end report;
```

```text [idioms]
demo: proc options(main);
  dcl buffer(100) fixed binary(31) controlled;
  on condition(overdraft) put skip list('limit exceeded');
  allocate buffer;
  buffer(1) = 42;
  if buffer(1) > 40 then signal condition(overdraft);
  free buffer;
end demo;
```

::

::note
`dcl` fixes base, scale, length and storage class at once, so `controlled` puts
the buffer's lifetime under [`allocate`/`free`](https://www.microfocus.com/documentation/openpli/80/pfstmt.htm),
while the [`on condition`](https://www.ibm.com/docs/en/epfz/6.2.0?topic=statements-on)
unit registered earlier handles the condition `signal` raises.
::

## Distinctive traits

- Storage classes (`static`, `automatic`, `controlled`, `based`, `area`) make
  lifetime a declaration; `controlled`, `based` and `area` put allocation under
  `allocate`/`free`.
- [No reserved words](https://www.ibm.com/support/pages/apar/PK86579):
  keywords are ordinary identifiers, so later additions such as `select` or
  packages could not invalidate working programs.
- [ON-units](https://www.microfocus.com/documentation/openpli/80/pfstmt.htm)
  attach an exception handler to each runtime condition (`zerodivide`,
  `conversion`, `endfile`) and are inherited down the call chain.
- [PICTURE and FIXED DECIMAL](https://www.microfocus.com/documentation/openpli/80/pfdecl.htm)
  give COBOL-style report editing and packed-decimal data in the same syntax as
  binary arithmetic.
- Multitasking is in the language: TASK and EVENT variables, a task option on
  `call`, and a `wait` join
  ([fork/join](http://www.iron-spring.com/prog_guide.html)).
- Bit strings and pointer-addressed `based` variables let system code lay out
  and walk control blocks from a high-level language.

## Status

Active. IBM Enterprise PL/I for z/OS 6.2 is the current mainframe compiler,
Iron Spring PL/I covers Linux and OS/2, and the language is standardized as
ISO 6160:1979 (endorsing ANSI X3.53-1976) and ECMA-50.

## History

SHARE's Advanced Language Development Committee was charged by SHARE and IBM to
specify a language serving scientific, commercial, real-time and systems
programmers; its first definition appeared as the NPL Technical Report in
December 1964. MIT's Multics project wrote a system-programming subset, EPL, and
then the operating system itself in
[PL/I](https://multicians.org/pl1.html). ANSI standardized the language in 1976
(X3.53), ECMA in 1976 (ECMA-50) and ISO in 1979 (ISO 6160).
