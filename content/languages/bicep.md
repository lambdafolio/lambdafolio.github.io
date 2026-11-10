---
title: "Bicep"
name: "Bicep"
homepage: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview"
references:
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview"
    title: "What is Bicep? — Azure Resource Manager | Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/file"
    title: "Bicep file structure and syntax"
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/data-types"
    title: "Data types in Bicep"
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/loops"
    title: "Iterative loops in Bicep"
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules"
    title: "Bicep modules"
  - url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/existing-resource"
    title: "Reference existing resource in Bicep"
  - url: "https://github.com/Azure/bicep"
    title: "Azure/bicep — the Bicep compiler repository (MIT)"
  - url: "https://github.com/Azure/bicep/releases/tag/v0.1.1-alpha"
    title: "Bicep v0.1.1-alpha, the first public release (28 August 2020)"
author: "Microsoft"
kind: "language"
status: "active"
year: 2020
paradigms:
  - "declarative"
  - "domain-specific"
  - "modular"
typing: "static"
features:
  - "compile-to-arm-template"
  - "decorators"
  - "existing-resources"
  - "loops"
  - "modules"
  - "resource-symbolic-names"
  - "type-safety"
  - "user-defined-types"
execution:
  - "transpiled"
relations:
  - name: "C#"
    kind: "implemented-in"
note: "Microsoft's declarative language for Azure: resources are declared by symbolic name and compiled by the Bicep CLI into a Resource Manager JSON template, so the ARM engine keeps the state and the orchestration."
---
## Overview

Bicep is Microsoft's declarative language for deploying Azure resources, and a
transparent abstraction over Resource Manager templates. It exists because the
equivalent JSON template is verbose and full of bracketed expressions; Bicep
compiles to that same template, so nothing the platform supports is lost.

## Code

::code-group

```bicep [primitives]
@description('Region for every resource')          // decorator: metadata
param location string = resourceGroup().location
param count int = 2

var name   = 'store${uniqueString(resourceGroup().id)}'  // interpolation
var ok     = count > 1 && location != ''                 // logical operators
var suffix = count == 2 ? 'pair' : 'many'                  // conditional
```

```bicep [combinations]
var regions = [
  'eastus'
  'westus2'
]
var sizes = { small: 'Standard_LRS', large: 'Premium_LRS' }

output first string  = regions[0]            // index accessor
output picked string = sizes.small           // property accessor
output both array    = concat(regions, ['centralus'])
```

```bicep [abstractions]
resource store 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: name
  location: location
  sku: { name: sizes.small }
  kind: 'StorageV2'
}

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' existing = {
  name: 'shared-rg'
}
```

```bicep [idioms]
module net './net.bicep' = [for region in regions: {
  name: 'net-${region}'
  params: {
    region: region
  }
}]

output endpoints array = [for i in range(0, count): {
  endpoint: net[i].outputs.endpoint
}]
```

::

::note
Values and
[operators](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/data-types#data-type-assignability)
fill declarations; arrays and objects are consumed by
[accessors](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/data-types#arrays)
and `concat`; a [resource](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/file#resources)
or `existing` resource is the abstraction, and a
[`for` loop](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/loops#loop-syntax)
over a module is the idiom. Notice that `net[i]` needs no `dependsOn`: the
symbolic reference *is* the edge the ARM engine orders on.
::

## Distinctive traits

- A resource is named by a symbol, not a string: `store` is an identifier that
  the compiler maps to a resource id, so property references replace most
  `dependsOn` and `reference()` calls.
- **Type safety is compile-time**: declared parameters and variables are
  checked, while `any` explicitly
  [disables that checking](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/data-types#any)
  for one symbol.
- Literal and
  [union types](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/data-types#union-types)
  narrow a value to a set of constants, so an invalid SKU name fails at build
  time rather than mid-deployment.
- [User-defined types](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/user-defined-data-types#define-types)
  put a name on a configuration shape, and
  [decorators](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters#use-decorators)
  like `@secure()` and `@allowed()` attach validation to that name.
- [Modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules#define-modules)
  are files or registry artifacts compiled into nested deployments, so reuse
  needs no separate template service.
- `existing` declares a resource you do not own: it is read for its properties
  and never redeployed, which is how a configuration reaches into another
  resource group or subscription.

## Status

Active and open source under the
[MIT licence](https://github.com/Azure/bicep/blob/main/LICENSE); the compiler
ships as the Bicep CLI and as the VS Code extension. Version numbers remain
0.x, and Microsoft's documentation marks experimental features as
unsupported.

## History

The compiler's first public release is tagged 28 August 2020. Microsoft
[introduced Project Bicep](https://devblogs.microsoft.com/devops/project-bicep-next-generation-arm-templates/)
as a domain-specific language for ARM templates, and the repository ships the
[`bicep decompile`](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli#decompile)
command that turns an existing ARM JSON template back into Bicep. The compiler
is written in [C#](/languages/csharp); the VS Code extension is TypeScript.
