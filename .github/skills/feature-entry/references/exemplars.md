# Exemplars (conforming feature entries)

No feature page has been curated yet — every promoted key is currently a
stub. This file records the target shape so the first one has a reference.

## The starting state: stubs

`scripts/scaffold-features.mjs` creates one per `FEATURES` value:

```md
---
title: "Closures"
name: "Closures"
feature: "closures"
---
TODO: Write the wiki article for **Closures**.
```

A stub is a **valid terminal state**: the frontmatter lint warns only, the
body lint is exempt, the page renders as a data row with its derived member
list, and the chips in language entries link to it.

## What a curated feature page looks like

Mirror [`content/languages/javascript.md`](../../../../content/languages/javascript.md)
for the mechanical shape (the fully conforming tour) and read the
difference in *content*:

| aspect | language entry | feature entry |
| --- | --- | --- |
| `features` | a long tail of tags (tier 1) | n/a — the page *is* one promoted tag |
| `year` | first release of the language | when the mechanism first appeared |
| `author` | the language's designers | none — mechanisms do not have designers in this schema |
| `Code` tour | the language's syntax | the mechanism compared across 2–3 member languages |
| members | n/a | **derived**, never written |
| prose scope | this language | this mechanism, corpus-wide |

## Choosing the demonstration languages

Read them from the derived list, not from taste:

```sh
node scripts/scaffold-features.mjs --members closures
```

Then prefer, in order: a language whose entry is already curated; a language
whose entry *witnesses* the feature in its own tour (so you can cross-link
rather than explain); a language where the mechanism is canonical (Smalltalk
for message dispatch, ML for pattern matching, JavaScript for prototypes).

## Checklist shape (the closing summary)

- fields written, fields left blank and why,
- the defining reference (spec clause / manual section / paper) with URL,
- which member languages the tour uses and why those,
- lint results for both gates,
- hyperlink audit,
- anything flagged for human review (paraphrased code, contested origin
  year, a member language that should promote or drop the tag).

Keep the list short when a new entry lands that beats these in shape — two
to four pointers, most recent first.
