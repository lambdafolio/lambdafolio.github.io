---
title: "Object-based"
name: "Object-based"
references:
  - url: "https://doi.org/10.1145/38765.38823"
    title: "Peter Wegner — Dimensions of Object-Based Language Design (OOPSLA '87)"
  - url: "https://doi.org/10.1145/6041.6042"
    title: "Cardelli and Wegner — On Understanding Types, Data Abstraction, and Polymorphism (ACM Computing Surveys, 1985)"
  - url: "https://learn.microsoft.com/en-us/previous-versions/4ah5852c(v=vs.85)"
    title: "Class Statement (VBScript) — Microsoft Learn"
author: "Luca Cardelli and Peter Wegner (the distinction)"
paradigm: "object-based"
status: "active"
year: 1985
features:
  - "encapsulation"
  - "class-templates"
  - "no-inheritance"
relations:
  - name: "object-oriented"
    kind: "shares-ancestor-with"
note: "Languages that define objects and classes but stop short of inheritance. Wegner's distinction separates object functionality and object management from class management by inheritance, which is what object-oriented adds."
---
## Overview

An object-based language defines objects and classes but no inheritance, so a
class bundles state and behaviour without a superclass to refine. Cardelli and
Wegner drew that line in 1985 so objects, classes and inheritance could be
weighed as separate choices; [VBScript](/languages/vbscript) is a late example.

## Code

::code-group

```vbscript [abstractions]
Class Account
    Private m_balance
    Private Sub Class_Initialize
        m_balance = 0
    End Sub
    Public Property Get Balance
        Balance = m_balance
    End Property
    Public Sub Deposit(amount)
        m_balance = m_balance + amount
    End Sub
End Class
```

```vbscript [idioms]
' no inheritance: reuse arrives by holding an instance and forwarding.
Class LoudAccount
    Private m_inner
    Private Sub Class_Initialize
        Set m_inner = New Account
    End Sub
    Public Sub Deposit(amount)
        m_inner.Deposit amount
    End Sub
    Public Property Get Balance
        Balance = m_inner.Balance
    End Property
End Class
```

::

::note
The two slots are the definition in miniature: `Class` plus `Private` members
  encloses state behind a public property, and the object-based substitute for
  inheritance is delegation — a field of the enclosing type and one forwarding
  method per reused member. Paraphrased from the VBScript `Class` statement
  reference; the source's notation stays authoritative.
::

## Distinctive traits

- The boundary is inheritance, not objects: private state behind public
  properties still leaves a language object-based under Wegner's definition.
- Classless design also qualifies: Wegner folds delegation-based languages
  (prototypes, actors) into the same object-based space as class templates.
- Encapsulation survives the downgrade: access control and constructors carry
  object-based design without any class hierarchy to hang it on.
- Delegation replaces inheritance in practice — an object holds another and
  forwards to it, so reuse is manual and per member rather than structural.
- The tiers nest: object-based, class-based and object-oriented name
  progressively narrower feature sets, inheritance being the last one added.

## Status

Still the standard classification for languages with objects and without
inheritance, and still applied where inheritance is deferred to prototypes. Its
boundary is contested: some writers count delegation as
[object orientation](/paradigms/object-oriented), collapsing the two.

## History

Cardelli and Wegner popularized the split in their 1985 survey of types,
abstraction and polymorphism. Wegner gave it a design space at OOPSLA in 1987,
characterizing object-based languages along objects, classes, inheritance, data
abstraction, strong typing, concurrency and persistence, and treating actors and
prototypes as classless members of the same space rather than a separate
category.
