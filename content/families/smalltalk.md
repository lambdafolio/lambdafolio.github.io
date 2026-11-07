---
title: "Smalltalk"
name: "Smalltalk"
homepage: "https://web.archive.org/web/2019/http://www.smalltalk.org/"
references:
  - url: "https://web.archive.org/web/2019/http://www.smalltalk.org/"
    title: "Smalltalk (official site, archived)"
  - url: "https://www.gnu.org/software/smalltalk/manual/gst.html"
    title: "GNU Smalltalk manual — language tutorial"
  - url: "https://web.archive.org/web/20120902030025/http://users.ipa.net/~dwighth/smalltalk/byte_aug81/design_principles_behind_smalltalk.html"
    title: "Design Principles Behind Smalltalk — Dan Ingalls, BYTE, August 1981"
  - url: "https://selflanguage.org/"
    title: "Self — prototype-based successor (Self language site)"
  - url: "https://newspeaklanguage.org/spec/newspeak-spec.pdf"
    title: "Newspeak Programming Language Draft Specification, version 0.106"
author: "Alan Kay, Dan Ingalls, Adele Goldberg, and the Xerox PARC team"
family: "smalltalk"
status: "active"
year: 1972
features:
  - "message-passing"
  - "image-based-persistence"
  - "live-programming"
  - "everything-is-an-object"
  - "first-class-classes"
  - "blocks-as-closures"
note: "The Xerox PARC lineage and the archetype of the message-passing object model: every operation is a message send to an object, classes are objects, closures are blocks, and the running system is an editable image rather than a file tree. Self, Newspeak, Squeak, Pharo, and GNU Smalltalk all descend from it."
---

## Overview

Smalltalk is an ancestry as much as a language. Kay's Dynabook vision at Xerox
PARC produced a whole environment — object memory, browser, debugger, compiler —
in which the boundary between source files and a running program disappeared.
Descendants inherited the model rather than the syntax, and each reworked a
different assumption.

## Distinctive traits

- Every operation is a message send. `receiver selector arguments` covers
  arithmetic and control flow alike (`ifTrue:`, `whileTrue:`), so the language
  has almost no special forms and a debugger can step through everything.
- Everything is an object, including classes. A class is an instance of a
  metaclass, so class-side methods are ordinary methods on an object.
- The image is the program. A system persists as serialized object memory you
  resume, not as a directory of files you compile from scratch.
- The environment is part of the language. Browsers, inspectors, and live
  editing are the primary interface to source, not an accessory to it.
- Closures are blocks passed as arguments. `do:`, `inject:into:`, and
  `ifTrue:ifFalse:` are library methods, not syntax.

## Members and what each one changed

Membership means descent from that model. Every member keeps the
message-passing core and reworks one major assumption:

| Language | Kept | Changed |
| --- | --- | --- |
| [Smalltalk](/languages/smalltalk) / GNU Smalltalk | class-based model, image | — (the reference point) |
| [Self](/languages/self) | message passing, live environment | classes → prototypes and slots; inheritance becomes object copying plus parent traits |
| [Newspeak](/languages/newspeak) | message passing, image, live environment | classes → nested classes as modules; no global namespace, everything late-bound, capability-secure |
| Pharo / Squeak | the image and the browser | modernized tooling (Pharo), media and education focus (Squeak) |

Self is the hinge. It deleted the one thing the others treated as essential —
classes — and showed that the rest of the model does not depend on them. The
prototype idea then travelled well beyond Smalltalk: JavaScript's
prototype-based objects descend from Self, not from Scheme.

## Status

Active and varied. The image-based style survives in Pharo, Squeak, and
Newspeak; GNU Smalltalk keeps a file-based workflow for scripting. The
message-passing model itself is mainstream by absorption — almost every object
system adopted it — while the image and the live-environment habits remain
distinctive to this lineage.

## History

Smalltalk-72 was a Xerox PARC research system, and the term "object-oriented"
was attached to it. Smalltalk-80 — designed for release, with the class library
and the bytecode virtual machine — is the ancestor every member above works
from, and Ingalls's 1981 BYTE article stated the design principles they argue
over. Self came out of Sun Microsystems in the late 1980s; Newspeak from
Gilad Bracha's work at SAP Labs in the 2000s.

::note
This page records descent, not features: Smalltalk is an object-oriented
paradigm member, but so are C++ and Java, which are not in this family. A
language carries one `family` value and many `paradigm` values on purpose.
::
