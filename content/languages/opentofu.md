---
title: "OpenTofu"
name: "OpenTofu"
homepage: "https://opentofu.org/"
references:
  - url: "https://opentofu.org/docs/language/"
    title: "OpenTofu Language Documentation"
  - url: "https://opentofu.org/docs/language/state/encryption/"
    title: "OpenTofu — State and Plan Encryption"
  - url: "https://opentofu.org/docs/cli/commands/test/"
    title: "OpenTofu — Command: test"
  - url: "https://opentofu.org/docs/intro/migration/"
    title: "OpenTofu — Migrating from Terraform"
  - url: "https://opentofu.org/manifesto/"
    title: "The OpenTofu Manifesto"
  - url: "https://github.com/opentofu/opentofu/releases/tag/v1.6.0"
    title: "OpenTofu v1.6.0, the first stable release (10 January 2024)"
  - url: "https://opentofu.org/blog/opentofu-is-going-ga/"
    title: "OpenTofu is going GA (10 January 2024)"
author: "The OpenTofu community (Linux Foundation)"
kind: "language"
status: "active"
year: 2023
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
  - "state-encryption"
  - "state-file"
  - "type-constraints"
relations:
  - name: "Terraform"
    kind: "forked-from"
note: "The MPL-licensed fork of Terraform, governed by the Linux Foundation: the same HCL configuration and plan/apply cycle, plus client-side state and plan encryption and its own provider registry."
---
## Overview

OpenTofu is the community fork of [Terraform](/languages/terraform), created
after HashiCorp moved Terraform to the Business Source License in August 2023.
It keeps the language and the `.tf` file format, and is described by its
maintainers as a drop-in replacement.

## Code

::code-group

```hcl [primitives]
locals {
  region    = "eu-west-1"
  instances = 3
  enabled   = true
  prefix    = "env-${local.region}"                        # interpolation
  big       = local.instances > 2 ? "yes" : "no"          # conditional
}
```

```hcl [combinations]
locals {
  zones = ["eu-west-1a", "eu-west-1b"]
  tags  = { team = "infra" }
  first = local.zones[0]
  names = [for z in local.zones : upper(z)]
  by_az = { for i, z in local.zones : z => i }
}
```

```hcl [abstractions]
variable "size" {
  type = string
}
resource "aws_instance" "web" {
  instance_type = var.size
}
module "net" {
  source = "./modules/net"
  cidr   = aws_vpc.main.cidr_block
}
```

```hcl [idioms]
terraform {
  encryption {
    key_provider "pbkdf2" "main" { passphrase = var.passphrase }
    method "aes_gcm" "aes" { keys = key_provider.pbkdf2.main }
    state { method = method.aes_gcm.aes }
  }
}

// in a .tftest.hcl / .tofutest.hcl file:
run "check_type" {
  assert {
    condition     = aws_instance.web.instance_type == "t3.micro"
    error_message = "unexpected instance type"
  }
}
```

::

::note
The first three tabs are the language it inherited — literals, collections,
[`for` expressions](https://opentofu.org/docs/language/expressions/for/#for-expressions)
and `variable`/`resource`/`module` — and the fourth is what it added:
[encryption](https://opentofu.org/docs/language/state/encryption/#configuration)
of state and plan files, plus [`run`/`assert` tests](https://opentofu.org/docs/cli/commands/test/#the-runassert-block)
both forks read.
::

## Distinctive traits

- Configuration compatibility is the contract: existing `.tf` files and
  providers work unchanged, and the
  [migration guide](https://opentofu.org/docs/intro/migration/) is a rename and
  a state-file check rather than a rewrite.
- A reference to another resource's attribute is a
  [dependency edge](https://opentofu.org/docs/language/expressions/references/),
  and the resulting graph is walked in parallel.
- [State and plan encryption](https://opentofu.org/docs/language/state/encryption/#configuration)
  is client-side and configured in the language: a `key_provider`, a `method`,
  and per-artifact `state`/`plan` blocks with a `fallback` for rollover.
- Keys come from PBKDF2 passphrases, AWS/GCP/Azure KMS, OpenBao, or an external
  program, so the same mechanism spans self-managed and cloud-held keys.
- `tofu test` reads both `.tftest.hcl` and `.tofutest.hcl`, so one test suite
  can target Terraform and OpenTofu.
- The [registry](https://registry.opentofu.org/) is a git repository of
  providers and modules, published by pull request — and, being a Linux
  Foundation project, the [manifesto](https://opentofu.org/manifesto/) stands
  in for a vendor's licence promise.

## Status

Active: stable releases carry a published
[1.x compatibility promise](https://opentofu.org/docs/language/v1-compatibility-promises/)
for the language. Distributed as a binary named `tofu`; source is under the
[MPL 2.0](https://github.com/opentofu/opentofu/blob/main/LICENSE), with the
original Terraform copyright retained.

## History

HashiCorp announced the licence change on 10 August 2023. When no response to
the community's request to revert arrived by 25 August, the fork was published
as OpenTF; it was renamed OpenTofu and adopted by the Linux Foundation before
its first stable release. [OpenTofu 1.6.0](https://opentofu.org/blog/opentofu-is-going-ga/)
shipped on 10 January 2024 — a drop-in replacement for Terraform, with the
[1.6.0 tag](https://github.com/opentofu/opentofu/releases/tag/v1.6.0) four
months after the fork. State encryption, designed in the open through an RFC,
followed in 1.7.
