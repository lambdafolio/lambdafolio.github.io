---
title: "HCL"
name: "HCL"
homepage: "https://github.com/hashicorp/hcl"
references:
  - url: "https://github.com/hashicorp/hcl"
    title: "HCL — the HashiCorp configuration language (repository, README, information model)"
  - url: "https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md"
    title: "HCL Native Syntax Specification"
  - url: "https://github.com/hashicorp/hcl/blob/main/spec.md"
    title: "HCL syntax-agnostic Information Model"
  - url: "https://github.com/hashicorp/hcl/blob/main/json/spec.md"
    title: "HCL JSON Representation"
  - url: "https://github.com/hashicorp/hcl/releases/tag/v2.0.0"
    title: "HCL v2.0.0 release notes (3 January 2020)"
  - url: "https://opentofu.org/manifesto/"
    title: "The OpenTofu Manifesto — why the fork exists"
author: "Mitchell Hashimoto (HashiCorp)"
family: "hcl"
status: "active"
year: 2014
features:
  - "blocks-and-attributes"
  - "expression-sub-language"
  - "template-interpolation"
  - "json-serialization"
  - "application-defined-schema"
note: "The family defined by one notation: blocks and attributes, plus an expression and template sub-language the host application evaluates. Terraform and OpenTofu both parse it and attach their own schemas to the same bodies."
---

## Overview

The HCL family is a notation plus a toolkit. HCL defines no built-in resource
types; it defines *bodies* — blocks and attributes — and hands them to a calling
application that declares which attribute names and nested block types it
expects. Every member inherits that split between syntax and schema, so the
family's members differ in what they do with a body, not in how they read one.

## Distinctive traits

- **Syntax without semantics.** HCL is explicitly a *toolkit*: the application
  supplies variable values, functions, and the schema, so an HCL file alone
  cannot be validated — only parsed.
- **Two concrete syntaxes, one model.** The native syntax and the JSON profile
  serialize the same bodies, so machine-generated configuration and
  hand-authored configuration mix in one configuration set.
- **An expression sub-language, not a program.** Arithmetic, comparison,
  conditionals, `for` expressions and splats are expressions; there is no
  statement, loop, or assignment to sequence them with.
- **Template interpolation inside strings.** `${…}` interpolation and
  `%{ for }` / `%{ if }` directives make a string a small template, including
  heredocs with strip markers.
- **Unknown values are first-class.** Evaluation can defer: a value may be
  *unknown* of a known type, which is what lets a member plan an operation
  before every input is knowable.
- **Type conversion and unification are specified, not incidental.** Safe and
  unsafe conversions, and the most general type two values unify to, are part
  of the information model, so independent implementations agree.

## Members and what each one changed

| Language | Relationship to HCL | What it changed |
| --- | --- | --- |
| [HCL](/languages/hcl) | the notation itself — v1 (2014) and v2 (2020) | the block/attribute body, the expression and template sub-languages, the JSON profile |
| [Terraform](/languages/terraform) | first consumer, and the reason HCL exists | added resources, providers, state, and the plan/apply cycle on top of the notation |
| [OpenTofu](/languages/opentofu) | the MPL-licensed fork of Terraform | kept the same bodies and expressions, added client-side state encryption and its own registry |

The recurring move is *holding the notation still*: OpenTofu's compatibility
promise is measured in `.tf` files that parse unchanged, and Terraform's own
break with HCL 1 was a change of library and parser, not of the shape of a
configuration.

## Status

Active through both members. The toolkit is at HCL 2.x under the MPL 2.0; the
native syntax specification and the syntax-agnostic information model are
published in the repository, and the JSON profile is a supported input format
rather than a compatibility shim.

## History

HCL and its predecessor HIL (the interpolation language) were written for
Terraform in 2014; the repository's first commit is dated August 2014. HCL 2
merged HCL 1 with HIL into a single language with arbitrary expressions and a
new parser and Go API, released as v2.0.0 in January 2020. The family changed
shape in 2023: HashiCorp moved Terraform to the Business Source License, and the
community fork that became OpenTofu kept the notation while changing the
licence and the governance.
