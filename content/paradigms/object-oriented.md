---
title: "Object-oriented"
name: "Object-oriented"
homepage: "https://ethw.org/Milestones:Object-Oriented_Programming,_1961-1967"
references:
  - url: "https://ethw.org/Milestones:Object-Oriented_Programming,_1961-1967"
    title: "Milestone: Object-Oriented Programming, 1961-1967 (IEEE Engineering and Technology History Wiki)"
  - url: "https://www.purl.org/stefan_ram/pub/doc_kay_oop_en"
    title: "Dr. Alan Kay on the Meaning of Object-Oriented Programming (2003 e-mail, Stefan Ram archive)"
  - url: "https://fare.tunes.org/files/cs/poof/ltuo.html"
    title: "Lambda: The Ultimate Object - Object Orientation Elucidated (François-René Rideau)"
author: "Ole-Johan Dahl and Kristen Nygaard (SIMULA 67); Alan Kay (coined the term)"
paradigm: "object-oriented"
status: "active"
year: 1967
features:
  - "encapsulation"
  - "inheritance"
  - "late-binding"
  - "message-passing"
  - "dynamic-object-creation"
relations:
  - name: "imperative"
    kind: "shares-ancestor-with"
  - name: "functional"
    kind: "interoperates-with"
note: "Programming languages organized around objects that bundle state with the procedures that operate on it, combined through inheritance and late binding. Introduced in SIMULA 67 (1967) and named by Alan Kay; still the dominant style of large-scale software."
---
## Overview

Object-oriented programming organizes a program around objects that bundle state with the procedures that act on it, combined through inheritance and late binding. SIMULA 67 introduced that combination in 1967, Alan Kay coined the term around the same time, and the style remains the dominant way large systems are structured.

Its canonical languages run from [Smalltalk](/languages/smalltalk) through [Java](/languages/java) to [C#](/languages/csharp).

## Code

::code-group

```smalltalk [primitives]
" an object bundles state with the messages that operate on it.
Object subclass: Account [
  | balance |
  Account class >> new [
    | r |
    r := super new.
    r init.
    ^r
  ]
  init [ balance := 0 ]
  deposit: amount [ balance := balance + amount ]
  spend: amount   [ balance := balance - amount ]
  printOn: stream [
    super printOn: stream.
    stream nextPutAll: ' with balance: '.
    balance printOn: stream
  ]
]
```

```smalltalk [combinations]
" objects compose by message: one asks another to act.
a := Account new.
a deposit: 125.
a deposit: 20.
a spend: 10.
a printOn: Transcript.    "an Account with balance: 135
```

```java [abstractions]
// a class is a specification that subclasses refine.
public class Account {
  private int balance;
  public Account(int start) { balance = start; }
  public int balance() { return balance; }
}
public class Savings extends Account {
  public Savings(int start) { super(start); }
}
```

```csharp [idioms]
// late binding: one message, whichever implementation answers it.
public class Account {
  public virtual string Label => "account";
}
public class Savings : Account {
  public override string Label => "savings";
}
Account[] accounts = { new Account(), new Savings() };
foreach (var a in accounts) Console.WriteLine(a.Label);
```

::

::note
The tour runs across the paradigm's own lineage - Smalltalk's message-sending
  objects and its `printOn:` protocol, Java's class-and- subclass specification,
  then C#'s virtual dispatch for late binding.
::

## Distinctive traits

- Objects own their state. Bundling data with the procedures that act on it stops one part of a program from silently changing another's data.
- Late binding buys substitutability. A message reaches whichever implementation answers it, so a new subtype works without editing its users.
- Classes are not essential. Rideau treats a class as a compile-time prototype for a type, making class-based object orientation a special case.
- Kay's definition was messaging, not encapsulation: messaging, local retention of state, and extreme late binding of everything.
- The consensus definition is the SIMULA trio: encapsulation, inheritance with late binding, and dynamic creation of objects at run time.
- The definition is contested, not settled. Rideau argues encapsulation covers only half of object orientation, and that message passing is not essential to it.

## Status

Still dominant, and contested. Object orientation structures most large systems, but its definition remains disputed: whether encapsulation, classes, or message passing is essential, and whether it should replace functional programming rather than merely combine with it.

## History

Dahl and Nygaard began SIMULA in 1961 as a simulation language; SIMULA 67, completed in 1967, introduced classes, subclasses, late binding, and dynamic object creation. Kay, working at Utah and later Xerox PARC, coined "object-oriented programming" around 1967 and built [Smalltalk](/languages/smalltalk) on that idea, leaving inheritance out at first. Stroustrup carried SIMULA's philosophy to C++ systems programmers around 1980, and Gosling's [Java](/languages/java) followed in the 1990s.
