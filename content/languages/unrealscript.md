---
title: "UnrealScript"
name: "UnrealScript"
homepage: "https://docs.unrealengine.com/udk/Three/UnrealScriptHome.html"
references:
  - url: "https://docs.unrealengine.com/udk/Three/UnrealScriptHome.html"
    title: "UnrealScript — Unreal Development Kit documentation (Epic Games)"
  - url: "https://docs.unrealengine.com/udk/Three/UnrealScriptReference.html"
    title: "UnrealScript Language Reference — Unreal Development Kit documentation (Epic Games)"
  - url: "https://web.archive.org/web/19991128174329/http://unreal.epicgames.com/UnrealScript.htm"
    title: "UnrealScript Language Reference — Tim Sweeney, Epic MegaGames (1998 original, archived)"
  - url: "https://docs.unrealengine.com/udk/Three/UnrealScriptStates.html"
    title: "UnrealScript States — Unreal Development Kit documentation"
  - url: "https://docs.unrealengine.com/udk/Three/UnrealScriptDefaultProperties.html"
    title: "UnrealScript Default Properties — Unreal Development Kit documentation"
  - url: "https://docs.unrealengine.com/udk/Three/ReplicationHome.html"
    title: "Networking & Replication — Unreal Development Kit documentation"
  - url: "https://www.gamedeveloper.com/programming/epic-s-tim-sweeney-lays-out-the-case-for-unreal-engine-4"
    title: "Epic's Tim Sweeney lays out the case for Unreal Engine 4 — Game Developer (2014)"
author: "Tim Sweeney (Epic MegaGames / Epic Games)"
kind: "language"
status: "historical"
year: 1998
paradigms:
  - "object-oriented"
  - "imperative"
typing: "static"
memory:
  - "gc"
execution:
  - "bytecode"
  - "vm"
concurrency:
  - "green-threads"
features:
  - "case-insensitive-identifiers"
  - "defaultproperties"
  - "editable-properties"
  - "latent-functions"
  - "replication"
  - "state-stacking"
  - "states"
influences:
  - "C++"
  - "Java"
note: "Epic's native Unreal Engine scripting language: a single-inheritance, compile-time-checked object system with states, latent functions and replication built in. Removed in Unreal Engine 4 in favour of C++ and Blueprints."
---
## Overview

UnrealScript is Epic's built-in scripting language for Unreal Engine 1 through 3,
a [Java](/languages/java)-style [object-oriented](/paradigms/object-oriented)
language designed by Tim Sweeney for gameplay code. It puts time, actor state,
and network replication into the language itself, so gameplay logic reads as
linear sequences rather than frame bookkeeping.

## Code

::code-group

```unrealscript [primitives]
class Counter extends Object;
var int Count;
var float Rate;
function string Describe()
{
  Count = 42;                    // int
  Rate = 1.5;                    // float
  return "count " $ string(Count); // $ joins, the cast renders the number
}
```

```unrealscript [combinations]
var array<int> Scores;
var vector Offset;
function Grow()
{
  local int Each;
  Scores.AddItem(7);             // dynamic array append
  Offset = vect(1.0, 2.0, 3.0);  // struct-typed literal
  Offset.Z = Offset.Z * 2.0;     // member access
  foreach Scores(Each)           // iterate the elements
    `log("p" @ Each);
}
```

```unrealscript [abstractions]
class DoorTrigger extends Actor;
function Touch(Actor Other)
{
  Super.Touch(Other);      // the inherited implementation
  GotoState('Opening');    // applied when state code resumes
}
```

```unrealscript [idioms]
var() float OpenTime;   // editable in UnrealEd
state Opening
{
Begin:
  Sleep(OpenTime);      // latent: resumes after game time
  Stop;                 // state code halts until the next transition
}
defaultproperties
{
  OpenTime=2.0
}
```

::

::note
A class is the abstraction and `Super` reaches its inherited version;
[`foreach`](https://docs.unrealengine.com/udk/Three/UnrealScriptVariables.html#DynArrayIterator)
walks the [dynamic array](https://docs.unrealengine.com/udk/Three/UnrealScriptVariables.html#DynArray);
[`Sleep`](https://docs.unrealengine.com/udk/Three/UnrealScriptStates.html) is
latent — only state code may call it, entering at `Begin`, and the
[`defaultproperties`](https://docs.unrealengine.com/udk/Three/UnrealScriptDefaultProperties.html)
tail plays the constructor's part.
::

## Distinctive traits

- [States](https://docs.unrealengine.com/udk/Three/UnrealScriptStates.html) are
  language-level: each actor is in exactly one, their functions shadow global ones, and `PushState`/`PopState` stack them.
- Latent functions inside state code make timed sequences linear; the engine
  simulates a per-actor thread instead of running OS threads.
- [Replication](https://docs.unrealengine.com/udk/Three/ReplicationHome.html)
  is declared, not coded: `server`, `client`, `reliable` and `simulated`
  specifiers place each function, and `repnotify` marks variables to notify on.
- `defaultproperties` replaces constructors and feeds UnrealEd's editable
  properties marked with [`var()`](https://docs.unrealengine.com/udk/Three/UnrealScriptVariables.html); classes have no constructors or destructors.
- Single inheritance from `Object` with
  [compile-time type checking](https://docs.unrealengine.com/udk/Three/UnrealScriptClasses.html),
  garbage collection, and case-insensitive identifiers throughout.
- Speed was traded for safety deliberately: the 1998 reference measures scripts
  at roughly [20× slower than C++](https://web.archive.org/web/19991128174329/http://unreal.epicgames.com/UnrealScript.htm),
  so heavy work stayed in native code.

## Status

Historical: it shipped with Unreal in 1998 and served Engine 1 through 3,
including Unreal Tournament. [Epic dropped it](https://www.gamedeveloper.com/programming/epic-s-tim-sweeney-lays-out-the-case-for-unreal-engine-4)
for Unreal Engine 4, moving gameplay code to [C++](/languages/cplusplus) and
[Blueprints](/languages/blueprints); the UDK documentation remains its reference.
