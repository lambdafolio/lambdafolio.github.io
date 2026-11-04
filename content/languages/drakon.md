---
title: "DRAKON"
name: "DRAKON"
homepage: "https://drakonhub.com/en/drakon"
urls:
  - "https://news.ycombinator.com/item?id=36021495"
  - "https://en.wikipedia.org/wiki/DRAKON"
references:
  - url: "https://news.ycombinator.com/item?id=36021495"
    title: "Hacker News discussion"
  - url: "https://drakonhub.com/en/drakon"
    title: "DRAKON — DrakonHub (official overview)"
author: "Vladimir Parondzhanov"
paradigms:
  - "visual"
features:
  - "flowcharts"
note: "Visual algorithmic language developed for the Buran spacecraft project; flowcharts with strict structural rules"
---
## Overview

DRAKON is a visual algorithmic language from the Russian space program,
developed for the Buran spacecraft under Vladimir Parondzhanov — flowcharts
with strict structural rules intended to be readable by engineers and
auditable by reviewers.

## Code

::code-group

```mermaid [combinations]
flowchart TB
    s@{ shape: sm-circ, label: "start" }
    a@{ shape: rect, label: "action (skewed icon)" }
    q@{ shape: diam, label: "q?" }
    ok@{ shape: rect, label: "then-branch" }
    e@{ shape: dbl-circ, label: "end" }
    s --> a --> q
    q -->|yes| ok --> e
    q -->|no| e
```

::

::note
*there is no textual syntax* — programs combine by icon layout. This Mermaid
  rendering approximates DRAKON's real icons (skewed action, question diamond,
  branching right); the official notation at drakonhub stays authoritative, and
  the `silhouette` icon splits large algorithms into named sub-charts.
::

## Distinctive traits

- One visual primitive: a fixed icon set with strict placement rules;
  execution flows top-to-bottom, branching to the right only ("the
  further right, the worse" — the diagram approximates this).
- No arrows: plain lines imply downward flow; crossings are forbidden —
  discipline is enforced by layout, not naming.
- Silhouette icons split big algorithms into named subroutines — the
  "divide and conquer" construct the rules revolve around.

## Status

Born in the Buran program (1980s, NPO Molniya), later formalized in a
Russian state standard; maintained by DrakonHub (commercial editor with a
free tier). Historical origin, present-day niche tooling.
