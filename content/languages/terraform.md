---
title: "Terraform"
name: "Terraform"
homepage: "https://developer.hashicorp.com/terraform"
references:
  - url: "https://developer.hashicorp.com/terraform/language"
    title: "Terraform Language Documentation"
  - url: "https://developer.hashicorp.com/terraform/language/syntax/configuration"
    title: "Terraform — Configuration Syntax (HCL native syntax)"
  - url: "https://developer.hashicorp.com/terraform/language/expressions/type-constraints"
    title: "Terraform — Type Constraints"
  - url: "https://developer.hashicorp.com/terraform/language/state"
    title: "Terraform — State"
  - url: "https://developer.hashicorp.com/terraform/language/tests"
    title: "Terraform — Tests (v1.6.0 and later)"
  - url: "https://github.com/hashicorp/terraform/releases/tag/v0.1.0"
    title: "Terraform v0.1.0 release tag (28 July 2014)"
  - url: "https://github.com/hashicorp/terraform/blob/main/LICENSE"
    title: "Terraform LICENSE — Business Source License 1.1, change licence MPL 2.0"
author: "Mitchell Hashimoto and HashiCorp"
kind: "language"
status: "active"
year: 2014
paradigms:
  - "declarative"
  - "domain-specific"
  - "modular"
family: "hcl"
features:
  - "dependency-graph"
  - "for-expressions"
  - "modules"
  - "plan-and-apply"
  - "state-file"
  - "type-constraints"
relations:
  - name: "HCL"
    kind: "derived-from"
note: "HashiCorp's infrastructure-as-code language: a declarative configuration of resources in HCL, resolved through providers into a dependency graph, diffed as a plan, and applied against a recorded state file."
---
## Overview

Terraform is HashiCorp's infrastructure-as-code language, written in the
[HCL](/languages/hcl) native syntax. It is declarative: a configuration names
the resources that should exist, and Terraform computes the ordering, the diff,
and the calls needed to reach that state.

## Code

::code-group

```hcl [primitives]
locals {
  region    = "eu-west-1"
  instances = 3
  enabled   = true
  sum       = 1 + 2 * 3                          # arithmetic operators
  label     = "env-${local.region}"              # string interpolation
  limit     = local.sum > 100 ? local.sum : 100  # conditional expression
}
```

```hcl [combinations]
locals {
  zones  = ["eu-west-1a", "eu-west-1b"]         # a list
  tags   = { team = "infra", owner = "ops" }    # a map
  first  = local.zones[0]                        # index
  team   = local.tags["team"]                    # element lookup
  shout  = [for z in local.zones : upper(z)]     # tuple for-expression
  number = { for i, z in local.zones : z => i }  # object for-expression
}
```

```hcl [abstractions]
variable "size" {
  type = string                # a static type constraint
}
resource "aws_instance" "web" {
  ami           = data.aws_ami.latest.id
  instance_type = var.size
}
module "net" {
  source = "./modules/net"
  cidr   = aws_vpc.main.cidr_block   # referencing a value orders the apply
}
```

```hcl [idioms]
// reuses the `locals` from the combinations tab
resource "aws_subnet" "az" {
  count             = length(local.zones)        # one instance per zone
  availability_zone = local.zones[count.index]
  vpc_id            = aws_vpc.main.id            # implicit dependency edge
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
}
resource "aws_instance" "web" {
  for_each = toset(local.zones)                  # instances keyed by zone
}
```

::

::note
Literals and [operators](https://developer.hashicorp.com/terraform/language/syntax/configuration#arguments)
fill `locals` attributes; lists and maps are consumed by index and
[`for` expressions](https://developer.hashicorp.com/terraform/language/expressions/for#for-expressions);
`variable` and `module` are the abstraction, and
[`count`](https://developer.hashicorp.com/terraform/language/meta-arguments/count#count-reference)
/ `for_each` are the idiom. The idiom also shows the mechanism no other slot
can: a reference to `aws_vpc.main` is a dependency edge that Terraform
[walks in parallel](https://developer.hashicorp.com/terraform/internals/graph#walking-the-graph).
::

## Distinctive traits

- Types are constraints, not declarations: `type = string` on a variable is a
  [static type](https://developer.hashicorp.com/terraform/language/expressions/type-constraints#type-constraints)
  the value must satisfy, rather than the declaration of the value itself.
- A reference *is* the dependency. Using `aws_vpc.main.id` orders the apply, so
  `depends_on` is the exception rather than the rule.
- The [plan](https://developer.hashicorp.com/terraform/cli/commands/plan) is a
  first-class artifact: Terraform computes the diff before it changes anything,
  and a plan can be saved and applied later.
- Execution is stateful: a [state file](https://developer.hashicorp.com/terraform/language/state#state)
  maps configuration addresses to real objects, so the same configuration
  deployed twice does not create duplicates.
- Providers are plugins: the language names resource *types*, and the provider
  binary decides which properties exist and how the call is made.
- Tests are configuration too: `terraform test`
  ([v1.6+](https://developer.hashicorp.com/terraform/language/tests)) runs
  `run`/`assert` blocks against short-lived infrastructure.

## Status

Active: 1.x releases are published several times a year under a stated
compatibility promise. Distributed as a single Go binary; sources since 1.6
fall under the
[Business Source License](https://github.com/hashicorp/terraform/blob/main/LICENSE),
which converts to MPL 2.0 four years after each release.

## History

The first tag, v0.1.0, is dated 28 July 2014 and shipped under the MPL 2.0.
[Version 1.0](https://github.com/hashicorp/terraform/releases/tag/v1.0.0) in
June 2021 began the 1.x compatibility promise. In August 2023 HashiCorp
announced the move to the Business Source License, effective from
[release 1.6.0](https://github.com/hashicorp/terraform/releases/tag/v1.6.0);
[OpenTofu](/languages/opentofu) forked the last MPL-licensed code and became a
Linux Foundation project instead.
