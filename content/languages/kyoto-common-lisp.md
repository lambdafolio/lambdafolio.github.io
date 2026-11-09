---
title: "Kyoto Common Lisp"
name: "Kyoto Common Lisp"
urls:
  - "https://softwarepreservation.computerhistory.org/LISP/kcl/doc/kcl-report.pdf"
  - "https://ecl.common-lisp.dev/static/manual/History.html"
author: "Taiichi Yuasa and Masami Hagiya (RIMS, Kyoto University)"
kind: "language"
status: "historical"
year: 1984
paradigms:
  - "functional"
  - "modular"
family: "lisp"
typing: "dynamic"
memory:
  - "gc"
execution:
  - "transpiled"
relations:
  - name: "C"
    kind: "implemented-in"
influences:
  - "Common Lisp"
note: "KCL, the Kyoto Common Lisp of Yuasa and Hagiya, compiles Common Lisp to C so the same sources build on any Unix with a C compiler. It was among the first Common Lisp implementations and, by being written from the specification alone, exposed holes in it; AKCL and later ECL descend from it."
---
TODO: Write the wiki article for **Kyoto Common Lisp**.
