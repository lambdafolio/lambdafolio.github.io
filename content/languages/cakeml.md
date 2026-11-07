---
title: "CakeML"
name: "CakeML"
homepage: "https://cakeml.org/"
references:
  - url: "https://cakeml.org/"
    title: "CakeML — official site"
  - url: "https://cakeml.org/popl14.pdf"
    title: "CakeML: A Verified Implementation of ML — Kumar et al., POPL 2014"
  - url: "https://github.com/CakeML/cakeml"
    title: "CakeML — source repository"
author: "CakeML development team (Ramana Kumar, Magnus Myreen, Michael Norrish, Scott Owens, and others)"
family: "ml"
status: "active"
year: 2014
paradigms:
  - "functional"
type_system:
  - "inferred"
  - "parametric-polymorphic"
memory:
  - "gc"
execution:
  - "native"
  - "ahead-of-time"
features:
  - "verified-compiler"
  - "bootstrapping"
  - "higher-order-logic-semantics"
  - "pattern-matching"
influences:
  - "Standard ML"
relations:
  - name: "Standard ML"
    kind: "derived-from"
note: "CakeML: a functional language based on a substantial subset of Standard ML, defined by a formal semantics in higher-order logic and shipped with an end-to-end verified compiler that has been bootstrapped — the compiler compiles itself and the resulting binary provably implements it."
---
TODO: Write the wiki article for **CakeML**.
