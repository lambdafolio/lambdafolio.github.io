---
title: "Plush"
name: "Plush"
homepage: "https://maximecb.github.io/plush/"
references:
  - url: "https://github.com/maximecb/plush/blob/main/docs/language.md"
    title: "Plush Language Guide"
  - url: "https://github.com/maximecb/plush/blob/main/docs/design.md"
    title: "Plush Design Notes"
  - url: "https://github.com/maximecb/plush"
    title: "maximecb/plush — source repository (Apache-2.0)"
  - url: "https://pointersgonewild.com/2025-08-03-creating-a-toy-language-with-actor-based-parallelism/"
    title: "Creating a Toy Programming Language with Actor-Based Parallelism (Maxime Chevalier-Boisvert, August 3 2025)"
author: "Maxime Chevalier-Boisvert"
kind: "language"
status: "experimental"
year: 2025
paradigms:
  - "concurrent"
  - "imperative"
  - "object-oriented"
  - "parallel"
typing: "dynamic"
memory:
  - "gc"
  - "moving-gc"
execution:
  - "bytecode"
  - "interpreted"
concurrency:
  - "actors"
  - "isolation"
features:
  - "actors"
  - "byte-arrays"
  - "closures"
  - "explicit-self"
  - "first-class-functions"
  - "frame-buffers"
  - "modules"
  - "single-inheritance"
influences:
  - "JavaScript"
  - "Lox"
  - "Lua"
  - "Python"
  - "Rust"
relations:
  - name: "JavaScript"
    kind: "influenced-by"
  - name: "Lox"
    kind: "influenced-by"
  - name: "Lua"
    kind: "influenced-by"
  - name: "Python"
    kind: "influenced-by"
  - name: "Rust"
    kind: "influenced-by"
  - name: "Rust"
    kind: "implemented-in"
note: "Maxime Chevalier-Boisvert's minimal dynamically-typed language and register-based VM for teaching and creative coding: actors instead of locks, no FFI, and window, audio and socket host functions built in."
---
## Overview

Plush is [Maxime Chevalier-Boisvert](https://pointersgonewild.com/)'s dynamically
typed language and register-based bytecode VM, made for fun, teaching and
creative coding, with window, audio and socket host functions built in. It
exists to explore [actor-based
parallelism](https://github.com/maximecb/plush/blob/main/docs/language.md#concurrency-with-actors)
in a language inspired by [JavaScript](/languages/javascript), [Lox](/languages/lox),
[Lua](/languages/lua), [Python](/languages/python) and Rust, with no global VM
lock and no foreign function interface.

## Code

::code-group

```plush [primitives]
let n = 42;                    // Int64; 0.5 would be a Float64
let s = "plush";               // immutable UTF-8 string
let ok = n > 10 && s != "";    // Bool from comparison and logical operators
$println(n / 4);               // 10.5 — `/` always yields a float
$println(n.idiv(4));           // 10 — truncated integer division
```

```plush [combinations]
let xs = [0, 1, 2, 3];                    // Array: JS-shaped literal
let d = { name: "plush", version: 1 };   // Dict: string keys, JSON syntax
let buf = ByteArray.with_size(16);       // raw mutable bytes

$println(xs[2]);                         // 2 — indexing
$println(d["name"]);                     // "plush" — or d.name
buf.store_u32(0, 0xFF00FF);              // typed write into the buffer
for (let var i = 0; i < xs.len; ++i)
    $println(xs[i]);                     // .len, and a mutable counter
```

```plush [abstractions]
fun add(a, b) { return a + b; }      // fun: a named, immutable global

class Point {
    init(self, x, y) {               // self is explicit, not an implicit `this`
        self.x = x; self.y = y;
    }
    to_s(self) { return "(" + self.x.to_s() + ", " + self.y.to_s() + ")"; }
}

let p = Point(1, 2);                 // a class name called is a constructor
let double = |x| x * 2;              // lambda: the expression returns implicitly
$println(add(1, 2) + double(p.x));   // 5
```

```plush [idioms]
fun worker() {
    let msg = $actor_recv();       // block on this actor's mailbox
    $println("got: " + msg);
    return msg.len;                // the actor's result
}

let w = $actor_spawn(worker);      // own heap: a copy of the parent's globals
$actor_send(w, "hello");           // no lock, no shared memory
$println($actor_join(w));          // 5
```

::

::note
Values and operators, JSON-shaped containers plus typed byte buffers, then
named functions, [closures](https://github.com/maximecb/plush/blob/main/docs/language.md#closures-and-lambdas)
and classes that take [`self` explicitly](https://github.com/maximecb/plush/blob/main/docs/language.md#classes)
and allow [single inheritance](https://github.com/maximecb/plush/blob/main/docs/language.md#inheritance).
Lambdas are first-class values, and the last slot is the point: a spawned actor
gets its own mailbox and collector, so parallelism is messages, not locks.
::

## Distinctive traits

- Actors, not locks: each actor owns a mailbox and a heap, and messages are deep-copied, so shared-memory races cannot occur.
- No FFI, no package manager: [`$`-prefixed host functions](https://github.com/maximecb/plush/blob/main/docs/design.md#host-functions) are the only exit, and a [module is one relative file](https://github.com/maximecb/plush/blob/main/docs/language.md#imports).
- Immutable by default: `let` binds once and `let var` opts in, which keeps [globals and functions](https://github.com/maximecb/plush/blob/main/docs/design.md#language-design) redefinition-free and optimizable.
- Register-based bytecode VM written in [Rust](/languages/rust) with no global VM lock; the guide [claims it can outperform Lua](https://github.com/maximecb/plush/blob/main/docs/language.md).
- Creative coding is library, not package: frame buffers are BGRA32 [byte arrays](https://github.com/maximecb/plush/blob/main/docs/language.md#manipulating-image-data) and audio is float32 samples.
- Corner-case budget: assignment is a statement, not an expression, and `/` always yields a float, so `=` and `==` cannot be confused.

## Status

Work in progress at version 0.6.x under Apache-2.0, with prebuilt binaries for
Linux, macOS and Windows, a REPL, a VS Code extension and bundled examples. The
author calls it a fun side-project and warns of bugs and missing features.
