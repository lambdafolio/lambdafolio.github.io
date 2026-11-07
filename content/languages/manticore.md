---
title: "Manticore"
name: "Manticore"
homepage: "https://web.archive.org/web/2020/http://manticore.cs.uchicago.edu/"
references:
  - url: "https://web.archive.org/web/2020/http://manticore.cs.uchicago.edu/"
    title: "The Manticore Project (official site, archived)"
  - url: "https://web.archive.org/web/2020/http://manticore.cs.uchicago.edu/papers/damp07.pdf"
    title: "Manticore: A heterogeneous parallel language — Fluet, Rainey, Reppy, Shaw, Xiao (DAMP 2007)"
  - url: "https://web.archive.org/web/2020/http://manticore.cs.uchicago.edu/papers/icfp08-implicit.pdf"
    title: "Implicitly-threaded parallelism in Manticore — Fluet et al. (ICFP 2008)"
author: "Matthew Fluet, Mike Rainey, John Reppy, Adam Shaw, Yingqi Xiao, and others"
family: "ml"
status: "dormant"
year: 2007
paradigms:
  - "parallel"
  - "concurrent"
  - "functional"
typing: "static"
type_system:
  - "inferred"
  - "parametric-polymorphic"
memory:
  - "gc"
execution:
  - "native"
  - "ahead-of-time"
concurrency:
  - "channels"
  - "fork/join"
  - "data-parallel"
features:
  - "parallel-tuples"
  - "nested-data-parallelism"
  - "concurrent-ml"
  - "implicitly-threaded-parallelism"
influences:
  - "Standard ML"
relations:
  - name: "Standard ML"
    kind: "derived-from"
note: "Manticore: a high-level parallel functional language from the University of Chicago and RIT, targeted at multicore hardware. Combines explicit concurrency through CML-style channels with fine-grain parallelism through parallel tuples and NESL/Nepal-style parallel array comprehensions."
---
TODO: Write the wiki article for **Manticore**.
