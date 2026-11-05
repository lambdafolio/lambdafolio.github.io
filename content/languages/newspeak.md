---
title: "Newspeak"
name: "Newspeak"
homepage: "https://newspeaklanguage.org/"
urls:
  - "https://newspeaklanguage.org/webIDE/"
  - "https://github.com/newspeaklanguage/newspeak"
  - "https://newspeaklanguage.org/spec/newspeak-spec.pdf"
references:
  - url: "https://newspeaklanguage.org/"
    title: "The Newspeak Programming Language — official site"
  - url: "https://bracha.org/newspeak-modules.pdf"
    title: "Modules as Objects in Newspeak — Bracha et al., ECOOP 2010"
  - url: "https://newspeaklanguage.org/spec/newspeak-spec.pdf"
    title: "Newspeak Programming Language Draft Specification, version 0.106"
  - url: "https://github.com/newspeaklanguage/newspeak"
    title: "newspeaklanguage/newspeak — source repository (IDE and standard library)"
  - url: "https://github.com/newspeaklanguage/primordialsoup/blob/master/docs/design.md"
    title: "Design of Primordial Soup — VM, garbage collector, snapshots"
  - url: "https://gbracha.blogspot.com/2009/02/newspeak-prototype-escapes-into-wild.html"
    title: "Newspeak Prototype Escapes into the Wild — Room 101, 27 February 2009"
logo: "/logos/newspeak.png"
author: "Gilad Bracha, Peter Ahe, Vassili Bykov, Ryan Macnak, Eliot Miranda, Bill Maddox"
kind: "language"
status: "active"
year: 2009
paradigms:
  - "modular"
  - "object-oriented"
typing: "dynamic"
memory:
  - "gc"
  - "generational-gc"
  - "moving-gc"
execution:
  - "bytecode"
  - "interpreted"
  - "sandboxed"
  - "vm"
concurrency:
  - "actors"
  - "isolation"
features:
  - "class-nesting"
  - "first-class-activations"
  - "incremental-typechecker"
  - "live-programming"
  - "mirrors"
  - "modules-as-objects"
  - "object-capability"
  - "snapshots"
relations:
  - name: "BETA"
    kind: "influenced-by"
  - name: "Self"
    kind: "influenced-by"
  - name: "Smalltalk"
    kind: "influenced-by"
note: "Bracha's live, object-capability language in the Smalltalk and Self tradition: nested classes are modules, every class name is late-bound, and the IDE runs in the browser from a serialized snapshot. Mixins, actors, and an incremental typechecker come with the platform."
---
## Overview

Newspeak is a message-based object-oriented language in the Smalltalk and Self
tradition, in which every class name is late-bound and nested classes serve as
modules. The platform is an object-capability system: code, GUI, and IDE run
live in the browser on a serialized snapshot.

## Code

::code-group

```newspeak [primitives]
(* Workspace expressions: literals are objects, operators are sends. *)
42 + 8.                     (* 50 *)
42 / 2.                     (* 21 *)
'Goodthink' , ', friend'    (* , is a send like any other *)
3 < 4                       (* a Boolean, itself an object *)
```

```newspeak [combinations]
(* An Array is built from its class and read with 1-based indices. *)
class Table = Object new (
    (* no slots *)
) (
    public run = (
        | xs = Array new: 3. |
        xs at: 1 put: 2. xs at: 2 put: 3. xs at: 3 put: 5.
        xs at: 2.                                 (* 3 *)
        xs inject: 0 into: [:a :b | a + b]        (* 10 - iteration *)
    )
) : ()
```

```newspeak [abstractions]
(* Class body declares slots; parentheses then hold instance methods. *)
class BankAccount balance: b <Integer> = Object new (
    |
        balance_slot <Integer> ::= b.
    |
) (
    public balance = ( ^balance_slot )
    public deposit: amount <Integer> = ( balance_slot:: balance + amount )
) : (
    (* class side: construct an instance, then apply a method to it *)
    public example = ( ^(self balance: 100) deposit: 50 )
)
```

```newspeak [idioms]
(* A top-level class is a module: dependencies arrive as parameters. *)
class MovieLister finderClass: MovieFinder = Object new (
    |
        private movieDB = MovieFinder from: 'movies.txt'.
    |
) (
    public moviesDirectedBy: directorName = (
        ^movieDB findAll select: [:m | m director = directorName]
    )
)
```

::

::note
One tab per slot: literals and binary sends; an `Array` filled by `at:put:`
and folded by `inject:into:`; a class keeping `balance_slot` private behind
`public` methods; and the module idiom, adapted from Bracha's published
`MovieLister` example to the current `Object new` class form. Off the tour:
late binding makes `mixinApply:` an ordinary send, actors speak by eventual
send, and the running IDE is a live snapshot.
::

## Distinctive traits

- Top-level classes are modules: dependencies are constructor parameters, so
  there are no package imports and no global namespace.
- Every class name is late-bound, so all classes are virtual and any class
  works as a mixin; `mixinApply:` is an ordinary send.
- Classes nest as in BETA, and name lookup follows the lexical chain —
  inheritance falls out of nesting rather than being a separate mechanism.
- Object-capability security: access control is per object, and a send with an
  explicit receiver only ever finds public members.
- The typechecker is an IDE component, not part of execution: the language is
  deliberately dynamically typed, and typing never gates a program.
- Activations are first-class and reflection is mirror-based, which is what
  the debugger, resumable exceptions, and continuations are built from.

## Status

Actively developed. Primordial Soup, the current VM, targets WASM and native
platforms and hosts the Hopscotch IDE as a web app. The specification is an
unreleased draft (0.106); the Squeak-based implementation is unsupported.
Apache 2.0 (Cadence code).

## History

The design descends from Smalltalk and Self and from Bracha's earlier mixin
work in Strongtalk. In May 2008 Cadence Design Systems agreed to open-source it
under Apache 2.0 and a draft specification was promised; the first public
prototype followed in February 2009 on a modified Squeak VM, and the
self-hosted Primordial Soup VM later replaced that host.
