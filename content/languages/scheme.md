---
title: "Scheme"
name: "Scheme"
homepage: "https://standards.scheme.org/"
urls:
  - "https://standards.scheme.org/corrected-r7rs/r7rs.html"
author: "Guy L. Steele Jr. and Gerald Jay Sussman (MIT)"
kind: "language"
status: "active"
year: 1975
paradigms:
  - "functional"
  - "logic"
family: "lisp"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "interpreted"
features:
  - "closures"
  - "first-class-functions"
  - "homoiconicity"
  - "proper-tail-recursion"
  - "macro-extension"
relations:
  - name: "Lisp"
    kind: "derived-from"
note: "A minimal Lisp built on lexical scope and lambda: one namespace, first-class continuations reachable through `call/cc`, and tail calls required to be constant-space. The R7RS report is the current definition, and its `syntax-rules` macros are hygienic by construction."
---
TODO: Write the wiki article for **Scheme**.
