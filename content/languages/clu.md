---
title: "CLU"
name: "CLU"
references:
  - url: "https://web.archive.org/web/20140110001054/http://pmg.csail.mit.edu/CLU.html"
    title: "CLU home page — MIT Programming Methodology Group"
  - url: "https://web.archive.org/web/20140110001054/http://publications.csail.mit.edu/lcs/specpub.php?id=793"
    title: "CLU Reference Manual — MIT LCS specification"
author: "Barbara Liskov"
features:
  - "contracts"
note: "First language with native support of Code Contracts"
---
## Overview

CLU is Barbara Liskov's (MIT, 1974–75) pioneering language for data
abstraction — the origin of *clusters*, iterators, and exception handling
as ordinary programming constructs, directly shaping C++, Java, Python,
and Ruby.

## Code

::code-group

```clu [abstractions]
intvec = cluster is create, append, sum    % cluster: abstract data type
    rep = array[int]                       % concrete representation
    sum = proc (v: cvt) returns (int)      % cvt: rep coercion for impl code
        total: int := 0
        for i: int in array[int]$elements(v) do   % iterator call
            total := total + i
            end
        return (total)
        end sum
    end intvec
```

::

::note
The `cluster` is the definable unit — a type and its operations behind an
  interface (`rep` is hidden; callers see only the listed procedures); iterators
  (`$elements`) drive `for` loops.
::

## Distinctive traits

- Clusters make data abstraction *the* language mechanism: the `rep` is
  private, procedures are the only interface — the ADT blueprint.
- Iterators as coroutines: `for … in … do` sequences are produced by
  generator procedures, later echoed in Python's iterator protocol.
- Structured exception handling (`except when … end`) — CLU's mechanism is
  the direct ancestor of modern try/except designs.

## Status

Historical: developed at MIT's Programming Methodology Group (1974–1979)
with a portable implementation; its influence reaches object-oriented
design and iterators everywhere — Liskov's Turing Award cites it.
