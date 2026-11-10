---
title: "Jacquard card chain"
name: "Jacquard card chain"
references:
  - url: "https://archive.org/details/jacquardmachinea00poss"
    title: "The Jacquard Machine Analyzed and Explained — Emanuel Anthony Posselt, 1887 (Internet Archive)"
  - url: "https://cdnmedia.handweaving.net/DigitalArchive/books/wp_xAppendix_D.pdf"
    title: "Preparing a File for an Industrial Jacquard Loom (Stäubli JC5) — The Woven Pixel, Appendix D"
  - url: "https://www.fourmilab.ch/babbage/sketch.html"
    title: "Sketch of the Analytical Engine Invented by Charles Babbage — Menabrea, with notes by Ada Lovelace (1843)"
author: "Joseph Marie Jacquard"
kind: "notation"
status: "historical"
year: 1804
paradigms:
  - "domain-specific"
features:
  - "hole-per-warp-end"
  - "fixed-card-width"
  - "looped-card-chain"
  - "no-branching"
note: "Loom-control notation of the 1804 Jacquard head: one card per weft pick, a hole or its absence per warp end, and cards laced in a closed chain that repeats the pattern exactly."
---
## Overview

The Jacquard card chain is the pattern notation executed by the
[Jacquard head](https://archive.org/details/jacquardmachinea00poss) fitted to a
loom: a laced chain of perforated cards, one card per weft pick. Replacing the
chain replaced the design, which is why Babbage borrowed the idea for the
Analytical Engine.

## Code

The notation is a physical object, so the tour shows the plates themselves — a
card, the chain it is laced into, and the section through the head that reads it.
There is no *abstractions* tab because there is nothing to name: a design is a
matrix of holes, and its only composition is concatenation. Plates are cropped
from Posselt's 1887 treatise, whose engravings stay authoritative.

::code-group

::div{label="primitives"}
![A single Jacquard card: 26 by 8 positions of holes, 208 in all, one per hook](/images/jacquard/jacquard-card-fig14.png){width="560"}

Posselt's Fig. XIV, a real 200-machine card at one-quarter size: 26 holes across
the width and 8 in its depth — 208 positions, "one for each hook in the machine".
All 208 are read together, so a whole card selects the shed for one pass of the
shuttle. The two large holes at the sides are peg holes for the cylinder.
::

::div{label="combinations"}
![Four cards laced together into the endless chain](/images/jacquard/jacquard-card-chain-fig15.png){width="520"}

Fig. XV, four cards laced together — the numbers 1 to 4 are the cards' order in
the sequence. Posselt states the composition directly:

```text [combinations]
The cards are interlaced in an endless arrangement; hence, one card is brought
after the other in rotation towards the needles.

When using a great number of cards in a set they are made to fold into a "rack."
This is done by attaching a wire 1 to 1½ inches longer than the cards at the
junction of, say every 12th, 15th, or 20th cards.
                              — Posselt, The Jacquard Machine (1887)
```

Every card carries the same matrix of hole positions, so the design is a
fixed-width sequence of cards — and that sequence, not any name or call, is the
program order.
::

::div{label="idioms"}
![Section through the height of a card: 8 hooks, needles, griffe bars, springs](/images/jacquard/jacquard-fig7-section.png){width="330"}

Fig. VII, the cross-section of a machine whose needles stand eight rows high:
the heads of the needles (`a`–`b`) press toward the card, the hooks (`e`–`m`)
stand over the griffe bars, and the springs hold each needle forward. A hole lets
a needle pass, the hook keeps its crook over the bar and is lifted; no hole pushes
the needle and the hook back, and the griffe rises without it. One card, all its
holes read at once, is one pass of the shuttle.
::

::

::note
What the plates make visible: the **alphabet** is a hole or its absence at one
of the 208 positions; the **word** is a whole card, its width fixed by the head's
hook count and read in a single motion; the **program text** is the laced chain,
read in rotation with no branching, since looping is the only control flow the
chain has. Nothing is named, so a repeated motif is stored once and re-read as
the chain cycles. Images are crops of Posselt's engravings, which remain
authoritative.
::

## Distinctive traits

- The alphabet is one bit per warp end per pick; a whole card is a complete instruction for one pass of the shuttle.
- Card width is fixed by the machine's hook count, so a design is a matrix rather than a variable-length program.
- Cards are laced into a closed chain: the only control flow is repetition of the whole sequence.
- A hook may drive several harness cords: Posselt divides a 400-hook comber-board into four sections to weave 1600 ends.
- Changing the design means changing the chain, an operation slow enough that mechanical Jacquards suit long production runs.

## Status

Historical as a physical medium: electronic heads read a file instead of cards, and
industrial looms now take `.JC5` and `.EP` card files
[from design software](https://cdnmedia.handweaving.net/DigitalArchive/books/wp_xAppendix_D.pdf).
The instruction model — one card per pick, fixed width — is unchanged.

## History

Posselt records Jacquard paid by the French government in February 1804 and
installed at Lyon that year, building on Bouchon's perforated paper and Falcon's
cards. The replaceable chain then became the model for stored programs: Lovelace's
[notes on the Analytical Engine](https://www.fourmilab.ch/babbage/sketch.html)
describe adopting "the principle which Jacquard devised for regulating, by means of
punched cards, the most complicated patterns in the fabrication of brocaded
stuffs".
