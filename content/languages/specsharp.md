---
title: "Spec#"
name: "Spec#"
homepage: "https://www.microsoft.com/en-us/research/project/spec/"
references:
  - url: "https://www.microsoft.com/en-us/research/project/spec/"
    title: "Spec# — Microsoft Research project page"
  - url: "http://web.archive.org/web/20050514074128/http://research.microsoft.com/SpecSharp/"
    title: "The Spec# Programming System — archived project page announcing the preliminary release, May 2005"
  - url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/krml189.pdf"
    title: "Using the Spec# Language, Methodology, and Tools to Write Bug-Free Programs (Leino & Müller)"
  - url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/TheSpecSharpProgrammingSystem28CASSIS200429.pdf"
    title: "The Spec# Programming System: An Overview (Barnett, Leino & Schulte, CASSIS 2004)"
  - url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2011/06/krml196.pdf"
    title: "Specification and Verification: The Spec# Experience (Barnett et al., CACM 2011)"
  - url: "https://www.jot.fm/issues/issue_2004_06/article2/"
    title: "Verification of Object-Oriented Programs with Invariants (Barnett et al., JOT 2004)"
  - url: "http://web.archive.org/web/20091228194210/http://specsharp.codeplex.com/"
    title: "Spec# on CodePlex — archived project page, December 2009"
  - url: "https://github.com/allisterb/specsharp-ms"
    title: "Spec# sources ported to .NET Framework 4.x — community continuation of the last CodePlex release"
  - url: "https://learn.microsoft.com/en-us/dotnet/standard/automatic-memory-management"
    title: "Automatic memory management (.NET fundamentals, Microsoft Learn)"
author: "Mike Barnett, K. Rustan M. Leino, Wolfram Schulte, Herman Venter (Microsoft Research)"
kind: "language"
status: "dormant"
year: 2005
paradigms:
  - "imperative"
  - "object-oriented"
  - "specification"
typing: "static"
memory:
  - "gc"
execution:
  - "bytecode"
  - "vm"
features:
  - "checked-exceptions"
  - "design-by-contract"
  - "loop-invariants"
  - "non-null-types"
  - "object-invariants"
  - "ownership"
  - "quantifiers"
  - "static-verification"
influences:
  - "AsmL"
  - "C#"
  - "Eiffel"
  - "JML"
influenced:
  - "Boogie"
  - "Sing#"
relations:
  - name: "C#"
    kind: "derived-from"
note: "Microsoft Research's design-by-contract extension of C#: non-null reference types, method pre- and postconditions, checked exceptions, and object invariants checked by a static verifier that translates to Boogie."
---

## Overview

Spec# is [Microsoft Research](https://www.microsoft.com/en-us/research/project/spec/)'s
extension of [C#](/languages/csharp) that puts API contracts into the language
itself: [non-null types](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/TheSpecSharpProgrammingSystem28CASSIS200429.pdf),
method pre- and postconditions, object invariants, checked exceptions. It exists
to test whether a verifier can check
[specifications](/paradigms/specification) written in the programmer's own
language, and that work became [Boogie](/languages/boogie).

## Code

::code-group

```csharp [primitives]
string aString = "Hello";                     // non-null by default (/nn)
string? maybe = null;                         // possibly-null: may hold null
int x = 9;
bool inRange = 0 <= x && x < 100;             // conjunction of comparisons
bool big = inRange ==> x > 5;                 // lower precedence than &&
int size = maybe != null ? maybe.Length : 0;  // guarded, so the deref is legal
bool three = exists{int i in (0: x); i == 3};  // half-open integer range
```

```csharp [combinations]
int[] a = new int[] { 4, 8, 15, 16 };
int second = a[1];                            // indexing owes a bounds proof
bool sorted = forall{int i in (1: a.Length); a[i-1] <= a[i]};
bool has16  = exists{int i in (0: a.Length); a[i] == 16};
int lo = min{a[0], a[1], a[2]};               // min/max take a set of values
int hi = max{lo, a[3], 100};
```

```csharp [abstractions]
int ISqrt(int x)
  requires 0 <= x;
  ensures result*result <= x && x < (result+1)*(result+1);
{
  int r = 0;
  while ((r+1)*(r+1) <= x)
    invariant r*r <= x;                   // a loop invariant, not an object one
  { r++; }
  return r;
}
void ReadToken(ArrayList a)
  throws EndOfFileException
  ensures a.Count == old(a.Count);        // holds on the throwing path too
```

```csharp [idioms]
using Microsoft.Contracts;
class Band {
  int gigs;
  [Rep] Guitar gt;                        // gt is a component of this aggregate
  invariant 7 <= gt.Level;                // re-established per class frame
  public void Play() {
    expose (this) {                       // mutable from here…
      gigs++;
      gt.Strum();
    }                                     // …and the invariant holds again
  }
}
```

::

::note
`/nn` makes `string` non-null, so `string?` must be tested before a member is
reachable. `forall`/`exists` are the quantifiers: they range over a half-open
interval, and `min`/`max` aggregate a set — neither loops. The clauses are C#
expressions, not a separate language. The idiom slot is the payoff: `[Rep]`
[ownership](https://www.jot.fm/issues/issue_2004_06/article2/) plus `expose` lets
an invariant mention a sub-object and still be checked one class frame at a
time. Examples follow the [tutorial](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/krml189.pdf).
::

## Distinctive traits

- Contracts are syntax: `requires`, `ensures`, `invariant`, and `modifies` sit
  between the signature and the body, written in C# itself.
- Non-null types split references in two: `string` cannot be null, `string?`
  may be, and only the first is dereferenceable without a guard or cast.
- An object invariant holds for every valid object; `expose` opens a scoped
  region in which a multi-field update may break it.
- `[Rep]` marks a component of an aggregate, and ownership lets an invariant
  mention a sub-object while still checking each frame modularly.
- The static verifier is sound but not complete: Boogie plus a solver may reject
  correct methods until specifications are strengthened.
- A checked exception is part of the contract: `throws` names it, and an
  `ensures` after it constrains what holds when it is raised.

## Status

Research project, not a product: the last CodePlex release was 1.0.21125 in
2009, licensed for non-commercial use only, and
[Code Contracts](https://learn.microsoft.com/en-us/dotnet/framework/debug-trace-profile/code-contracts)
carried the contract idea into .NET 4. A
[community fork](https://github.com/allisterb/specsharp-ms) moved the compiler and
libraries to .NET Framework 4.x.
