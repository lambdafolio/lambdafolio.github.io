---
title: "Lisp"
name: "Lisp"
homepage: "https://www.lispworks.com/documentation/HyperSpec/Front/index.htm"
references:
  - url: "https://www-formal.stanford.edu/jmc/recursive.pdf"
    title: "Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I — John McCarthy (1960)"
  - url: "https://www.lispworks.com/documentation/HyperSpec/Front/index.htm"
    title: "Common Lisp HyperSpec — ANSI INCITS 226-1994 (R1999)"
  - url: "https://standards.scheme.org/corrected-r7rs/r7rs.html"
    title: "Revised^7 Report on the Algorithmic Language Scheme (R7RS)"
  - url: "https://clojure.org/"
    title: "Clojure — official site"
  - url: "https://racket-lang.org/"
    title: "Racket — official site"
author: "John McCarthy (MIT)"
family: "lisp"
status: "active"
year: 1958
features:
  - "homoiconicity"
  - "s-expressions"
  - "macro-extension"
  - "first-class-functions"
  - "garbage-collection"
  - "read-eval-loop"
note: "The family defined by code-as-data: programs are s-expressions, so a program can construct and evaluate programs, and macro systems extend the language itself. McCarthy's Lisp at MIT began it; Common Lisp, Scheme, and Clojure are the three main branches, and Racket is Scheme's language-workbench descendant."
---

## Overview

Lisp's defining property is that source and data share a representation. A
program is a list of lists, the reader turns text into that structure, and
`eval` runs it — so the language can be extended from inside itself. Every
member keeps that property and disagrees about how much of it to expose.

## Distinctive traits

- Homoiconicity: the surface syntax is the data structure. That is what makes
  macro systems meaningful rather than textual substitution.
- Macros over a parsed form, not text. A macro is a program from forms to
  forms, expanded before evaluation and therefore hygienic by construction in
  Scheme-derived members.
- First-class functions with closures, from the 1960 paper onward, and a
  garbage-collected heap in the original implementation.
- Interactive development: read-eval-print, and in several members a running
  image you modify rather than a binary you rebuild.
- Divergence into three branches by *namespace policy*: Common Lisp keeps
  separate function and value namespaces, Scheme has one, Clojure has one with
  immutable persistent data as the default.

## Members and what each one changed

| Language | Branch | What it changed |
| --- | --- | --- |
| [Clojure](/languages/clojure) | new dialect targeting the JVM (2007) | persistent immutable data structures, software transactional memory, `seq` abstraction over host collections |
| [Racket](/languages/racket) | Scheme (PLT, from 1995) | the language is a library decision: `#lang` chooses the reader and semantics per module |
| [Janet](/languages/janet) | new small dialect | embeddable single-binary design with a bytecode VM and fibers |
| [FemtoLisp](/languages/femtolisp) | Scheme-derived, minimal | a tiny Scheme used as a bootstrapping layer (originally inside Julia) |
| [LFE](/languages/lfe) | Lisp syntax for the Erlang VM | Erlang's actor semantics with Lisp forms, compiling to BEAM |
| [Hyperlisp](/languages/hyperlisp) | Lisp variant | a hypertext-oriented dialect in the Thompson collection |

Membership is again descent from the s-expression-plus-`eval` core, not a
feature list: LFE is a concurrency system that happens to be a Lisp, while
Racket is a language-construction toolkit that happens to be a Scheme.

## Status

Active. Clojure and Racket are in production use, Scheme has a current standard
(R7RS), Common Lisp has an ANSI standard, and the macro-plus-REPL model has
since been adopted by non-Lisp languages.

## History

McCarthy published the design in 1960, with `eval` written out as a Lisp
function and garbage collection as part of the machine model. Scheme followed
in 1975 (Sussman and Steele) with lexical scope and proper tail calls. Common
Lisp was standardized as ANSI INCITS 226-1994 to unify the 1980s implementations.
Clojure arrived in 2007, and Racket grew out of the PLT Scheme project.

::note
Read [Clojure](/languages/clojure) for the immutability turn and
[Racket](/languages/racket) for the language-as-library turn; both keep the
s-expression core that defines the family.
::
