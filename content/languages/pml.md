---
title: "Prose Markup Language (PML)"
name: "Prose Markup Language"
homepage: "https://github.com/dineshraju/pml"
urls:
  - "https://github.com/dineshraju/pml/blob/main/pml.txt"
references:
  - url: "https://github.com/dineshraju/pml/blob/main/pml.txt"
    title: "PML — interpreter specification (predefined tag reference)"
  - url: "https://github.com/dineshraju/pml/blob/main/examples/pml.xml"
    title: "PML example — an article about PML written in PML"
  - url: "https://github.com/dineshraju/pml"
    title: "Prose Markup Language repository (dineshraju/pml)"
author: "Dinesh Raju"
kind: "notation"
status: "dormant"
year: 2023
paradigms:
  - "declarative"
  - "domain-specific"
execution:
  - "interpreted"
features:
  - "metadata-head"
  - "natural-language-exec-directive"
  - "pseudocode-interpreter-prompt"
  - "tagged-markup"
influences:
  - "Jargon"
relations:
  - name: "Jargon"
    kind: "influenced-by"
note: "XML-flavoured markup where ideas and instructions are tags: a head block carries topic and style guidance, and the model renders the rest into flowing article prose."
---
## Overview

PML is Dinesh Raju's [markup notation](https://github.com/dineshraju/pml/blob/main/pml.txt)
for generating article-length prose: XML-like tags hold ideas and
[`<exec>`](https://github.com/dineshraju/pml/blob/main/pml.txt) instructions, and a
separate `<head>` sets tone the reader never sees. It exists to turn a rough
brain-dump into flowing text while staying
[rearrangeable without rewriting](https://github.com/dineshraju/pml/blob/main/examples/pml.xml).

## Code

::code-group

```xml [primitives]
<pml>
  <head>
    <topic>This article introduces PML</topic>
    <style>Write in a tone that sounds like Paul Graham</style>
    <style>use simple to understand words</style>
  </head>
```

```xml [combinations]
  <para>
    <idea>PML includes style header tags for article tone</idea>
    <idea>hints like "write from a first-person perspective"</idea>
  </para>
  <conc>
    <idea>imagine when later versions of GPT make this better</idea>
  </conc>
```

```xml [abstractions]
  <para>
    <exec>describe what PML is, emphasizing the names of the different
      predefined tags</exec>
    <idea>PML isn't just a markup language, it gives you a
      writing collaborator</idea>
  </para>
```

```xml [idioms]
  <para>
    <idea>you can just do a brain dump, bad grammar and all</idea>
    <idea>and that gets turned in to flowing prose</idea>
  </para>
</pml>
```

::

::note
`<head>` content is metadata the interpreter obeys but never prints, so one
document can be re-styled without touching a single idea. The `<exec>` tab shows the
escape hatch: an instruction telling the model *how* to write that section, which is
the notation's answer to a missing construct.
::

## Distinctive traits

- The head block is guidance, not content, so tone and topic are edited without disturbing the ideas below.
- `<idea>` marks an insight the model must weave into prose, leaving connective writing entirely to the model.
- `<exec>` is [an instruction to the interpreter](https://github.com/dineshraju/pml/blob/main/pml.txt), the escape hatch for anything the tags cannot express.
- Output is continuous prose with no per-paragraph descriptors, so structure lives in the source rather than the article.
- Only nine tags are defined, and the specification is a single prompt pasted ahead of the markup.

## Status

A 2023 experiment: one specification file, one example, and no implementation
beyond the interpreter prompt. The repository has [not changed since its first
day](https://github.com/dineshraju/pml), and the author's own example treats it as a
prototype awaiting stronger models.

## History

Built in March 2023, days after Jake Brukhman's [Jargon](/languages/jargon); the
[example article](https://github.com/dineshraju/pml/blob/main/examples/pml.xml)
links that post and describes PML as an attempt to apply the same pseudolanguage
idea to article writing.
