---
title: "HCL"
name: "HCL"
homepage: "https://github.com/hashicorp/hcl"
references:
  - url: "https://github.com/hashicorp/hcl"
    title: "HCL — the HashiCorp configuration language (README)"
  - url: "https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md"
    title: "HCL Native Syntax Specification"
  - url: "https://github.com/hashicorp/hcl/blob/main/spec.md"
    title: "HCL syntax-agnostic Information Model"
  - url: "https://github.com/hashicorp/hcl/blob/main/json/spec.md"
    title: "HCL JSON Representation"
  - url: "https://github.com/hashicorp/hcl/releases/tag/v2.0.0"
    title: "HCL v2.0.0 release notes (3 January 2020)"
  - url: "https://github.com/vstakhov/libucl"
    title: "libucl — a native syntax the HCL README cites as an inspiration"
author: "Mitchell Hashimoto (HashiCorp)"
kind: "language"
status: "active"
year: 2014
paradigms:
  - "declarative"
family: "hcl"
features:
  - "application-defined-schema"
  - "blocks-and-attributes"
  - "expression-sub-language"
  - "json-serialization"
  - "template-interpolation"
  - "unknown-values"
relations:
  - name: "Go"
    kind: "implemented-in"
note: "A syntax and API for building structured configuration languages: bodies of blocks and attributes plus an expression and template sub-language, with the application supplying the schema and functions."
---
## Overview

HCL is the HashiCorp configuration language: a notation for structured
configuration plus the toolkit that parses and evaluates it. It exists because
JSON and YAML serialize data without letting an application define a schema,
while a general-purpose language turns a configuration file into a program.

## Code

::code-group

```hcl [primitives]
// An attribute binds a name to an expression; literals are the atoms.
port    = 8080                // number
enabled = true               // bool
region  = "eu-west-1"        // string, itself a template
ratio   = 0.75
sum     = 1 + 2 * 3          // * binds tighter than +
flag    = !enabled || port > 1024
```

```hcl [combinations]
// Tuples and objects; the operators that consume them.
zones = ["a", "b", "c"]
tags  = { team = "infra", tier = "web" }       // a literal key is a name
first  = zones[0]                              // index
team   = tags.team                             // attribute access
sizes  = [for z in zones : upper(z)]           // tuple for-expression
lookup = { for z in zones : z => length(z) }   // object for-expression
```

```hcl [abstractions]
// A block: a type, optional labels, and a child body the application validates.
service "http" "web_proxy" {
  listen_addr = "127.0.0.1:8080"

  process "main" {                     // a nested block
    command = ["app", "server"]
  }
}

shout = upper("done")                  // functions come from the host application
```

```hcl [idioms]
// Templates: interpolation, directives, heredocs, and the splat shorthand.
name = "app-${zones[0]}"                       // interpolation of an expression
list = "%{ for n in zones }${n},%{ endfor }"   // a template directive
doc  = <<-EOT
  first zone is ${zones[0]}
%{ if length(zones) > 1 }  multi-zone%{ endif }
EOT
ids  = nodes.*.id                             // attribute-only splat
```

::

::note
Every slot is a *body*: attributes hold [literals and
operators](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#literal-values),
tuples and objects are consumed by
[index](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#index-operator),
[attribute access](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#attribute-access-operator),
[`for` expressions](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#for-expressions)
and [splats](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#splat-operators),
and the block gives the application a child body to validate. Note what is
*absent*: no assignment, no loop statement, no way to name a block as a value —
those belong to the [information model](https://github.com/hashicorp/hcl/blob/main/spec.md#body-content),
which only the calling application can interpret.
::

## Distinctive traits

- **Bodies, not schemas.** The application declares the attribute names and
  block types it accepts, so one notation serves unrelated tools
  ([schema-driven processing](https://github.com/hashicorp/hcl/blob/main/spec.md#schema-driven-processing)).
- **Three co-designed sub-languages.** A structural language for
  [blocks and attributes](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#blocks),
  an expression sub-language for values, and a
  [template](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md#template-interpolations)
  language for strings.
- **Unknown values are first-class.** A value may be unknown of a known type,
  which is what lets a caller plan from partial information instead of failing
  ([unification](https://github.com/hashicorp/hcl/blob/main/spec.md#type-unification)).
- **Two syntaxes, one model.** The native syntax and the
  [JSON profile](https://github.com/hashicorp/hcl/blob/main/json/spec.md) decode
  to the same bodies, so generated and hand-written configuration mix.
- **Coercion is specified.** Conversions between primitive types are marked
  [safe or unsafe](https://github.com/hashicorp/hcl/blob/main/spec.md#type-conversions-and-unification),
  and unsafe ones may fail rather than silently lose information.
- **Static analysis is a separate reading.** Lists, maps, calls and traversals
  can be inspected without evaluating them, which is how tools lint a
  configuration they cannot fully resolve.

## Status

Active: HCL 2.x is a Go module under the
[MPL 2.0](https://github.com/hashicorp/hcl/blob/main/LICENSE), with the native
syntax specification and the information model published alongside the code.
[Terraform](/languages/terraform) and [OpenTofu](/languages/opentofu) are its
largest consumers; other HashiCorp tools read the same notation.

## History

HCL and its predecessor HIL — the interpolation language — were written for
Terraform in 2014, and the repository's earliest commit is dated August 2014.
[HCL 2.0](https://github.com/hashicorp/hcl/releases/tag/v2.0.0) merged the two
into a single language with arbitrary expressions and a new parser and Go API,
released in January 2020. The native syntax is
[credited in the README](https://github.com/hashicorp/hcl#acknowledgements) as
inspired by [libucl](https://github.com/vstakhov/libucl) and nginx
configuration.
