---
title: "Piet"
name: "Piet"
homepage: "https://www.dangermouse.net/esoteric/piet.html"
references:
  - url: "https://www.dangermouse.net/esoteric/piet.html"
    title: "Piet — specification by David Morgan-Mar"
  - url: "https://www.dangermouse.net/esoteric/piet/samples.html"
    title: "Piet Program Gallery"
  - url: "https://www.bertnase.de/npiet/"
    title: "npiet — Piet interpreter and editor"
  - url: "https://github.com/dloscutoff/ascii-piet"
    title: "ASCII encoding for Piet (dloscutoff/ascii-piet)"
  - url: "https://esoteric.codes/blog/david-morgan-mar"
    title: "Interview with David Morgan-Mar (esoteric.codes, 2015)"
  - url: "http://web.archive.org/web/20020410063200/http://www.dangermouse.net/esoteric/piet.html"
    title: "Piet specification as archived in April 2002"
author: "David Morgan-Mar"
kind: "language"
status: "active"
year: 2001
paradigms:
  - "stack-based"
  - "visual"
typing: "untyped"
execution:
  - "interpreted"
features:
  - "2d-flow"
  - "bitmap-source"
  - "codel-blocks"
  - "stack"
  - "turing-complete"
influences:
  - "Befunge"
note: "Esoteric language whose programs are bitmaps of coloured blocks: hue and lightness transitions encode commands, block size encodes integers, and the pointer walks the image. Named after Piet Mondrian."
---
## Overview

Piet is an esoteric [visual](/paradigms/visual) language whose source code is a
bitmap: blocks of colour called codels, walked by a pointer, where the change of
hue and lightness between blocks selects the command. It exists to make the
program itself an abstract painting — Morgan-Mar named it for Piet Mondrian —
while staying computationally universal.

## Code

Piet has no textual syntax, so the tour shows the language in its own terms: the
[20-colour palette](https://www.dangermouse.net/esoteric/piet.html) and the table
that gives those colours meaning, the stack holding every value, and two gallery
programs. There is no *abstraction* tab because there is no call, definition or
name to abstract with. Each program was run under [npiet](https://www.bertnase.de/npiet/)
to confirm its output.

::code-group

::div{label="primitives"}
![Piet's twenty colours, and the command each colour change fires](/images/piet/piet-primitives.png){width="560"}

A colour alone means nothing: what fires a command is the *change* to the next
block, counted forward round two cycles — hue red → yellow → … → magenta, and
lightness light → normal → dark (wrapping: “light is one step darker than dark”).
One hue step is `add`, one lightness step is `push`, two of each is `not`. Values
come from block size, so numbers must be drawn.
::

::div{label="combinations"}
Everything a Piet program computes lives on one unbounded stack of integers — no
arrays, records or cells. The sixteen operations that reach inside it:

```text [combinations]
push       ( -- n )        n = codels in the block just left
pop        ( n -- )
add        ( a b -- a+b )
subtract   ( a b -- a-b )
multiply   ( a b -- a*b )
divide     ( a b -- a/b )  integer division
mod        ( a b -- a mod b )
not        ( n -- 0|1 )
greater    ( a b -- a>b )
duplicate  ( n -- n n )
roll       ( d r -- )      revolve the top d entries r times
pointer    ( n -- )        turn the DP clockwise n steps
switch     ( n -- )        toggle the CC n times
in, out    ( -- n / n -- )  read a number or character / print it
```

::

::div{label="idioms"}
![Hello World from the program gallery](/images/piet/piet-hello-world.png){width="300"}

Prints `Hello world!`. Execution starts in the light-red field top-left and walks
clockwise round the edge; each field is one character's arithmetic, its codel count
being the literal it pushes (red 72 is `H`, magenta 101 is `e`). Black regions steer.

![Thomas Schoch's artistic Hello World](/images/piet/piet-artistic-hello.png){width="280"}

Thomas Schoch's 13×13 `Hello, world!`: the same job arranged to read as a small
abstract painting — the gallery's style and the point of the language; lone codels are 1s.
::

::

::note
The **table** is the whole instruction set: six hues × three lightnesses cycle
(red → yellow → … → magenta, light → normal → dark), while black and white sit
outside both cycles, so a command is always a *delta* between two blocks.
**Hello World** shows size-as-data — the red field is 72 codels, so `push` leaves
72 and `out(char)` prints `H`. The **artistic** version prints the same text from
a picture that reads as an abstraction, the idiom the gallery is built on. No
fourth tab exists because there is no fourth capability: with no call or
definition, everything is spelled out in the program's own geometry. Images are
redrawn from the [gallery](https://www.dangermouse.net/esoteric/piet/samples.html)
originals, which stay authoritative.
::

## Distinctive traits

- Colour transitions, not colours, are the instruction set: the hue and
  lightness deltas between consecutive blocks select one of 17 commands.
- Block size is the only literal: a block's value is its codel count, so
  numbers must be drawn, and negative ones computed.
- Flow is geometry: a direction pointer and codel chooser pick the next block,
  black blocks redirect, and white blocks cross without executing. Like
  [Befunge](/languages/befunge), the picture is the control flow.
- No abstraction: nothing can be named or called, so a repeated computation is
  copied into the picture, and programs grow with their repetition.
- Turing-complete on an [unbounded stack](/paradigms/stack-based) of unbounded
  integers — the spec's own conditional — and a
  [brainfuck interpreter written in Piet](https://lutter.cc/piet/) demonstrates it.

## Status

Morgan-Mar maintains the specification, preferring clarifications to an
authoritative implementation, so interpreters differ in detail.
[npiet](https://www.bertnase.de/npiet/), the C interpreter, is still released
(1.3h, 2026); [editors, encodings and compilers](https://www.dangermouse.net/esoteric/piet/tools.html)
exist, and gallery programs keep appearing.
