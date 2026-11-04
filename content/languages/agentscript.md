---
title: "AgentScript"
name: "AgentScript"
homepage: "https://agentscript.org/"
references:
  - url: "https://agentscript.org/"
    title: "AgentScript official site"
author: "Owen Densmore"
paradigms:
  - "agent-based"
influences:
  - "NetLogo"
note: "A minimalist Agent-Based modeling system based on NetLogo semantics (Patches, Turtles, Links), implemented on JavaScript ES6 modules"
---
## Overview

AgentScript is Owen Densmore's minimalist port of NetLogo semantics
(Patches, Turtles, Links) onto modern JavaScript ES6 modules — agent-based
modeling as a plain class library, no NetLogo GUI or DSL required.

## Code

::code-group

```javascript [abstractions]
import Model from '/src/Model.js'
class HelloModel extends Model {
  population = 10
  setup() {                                 // modeler overrides hooks
    this.turtles.setDefault('atEdge', 'bounce')
    this.turtles.create(this.population, t => {
      t.moveTo(this.patches.oneOf())
    })
    this.turtles.ask(t => {
      this.links.create(t, this.turtles.otherOneOf(t))
    })
  }
  step() {                                  // one NetLogo tick
    this.turtles.ask(t => {
      t.heading += util.randomCentered(this.wiggleAngle)
      t.forward(this.speed)
    })
  }
}
```

::

::note
A *model* is the definable unit — subclass `Model` , override `setup()`
  /`step()`; `ask(fn)` runs a herd iteration, NetLogo's `ask` preserved
  verbatim.
::

## Distinctive traits

- NetLogo semantics without its DSL: `ask`, `oneOf`, breeds, and step loops
  map 1:1 onto JavaScript arrays and closures.
- ES6 modules all the way down — models compose like any JS library,
  testable in Node or viewable in a browser canvas view.
- Agent sets (`Patches`, `Turtles`, `Links`) are the combination mechanism:
  breeds subdivide them; queries iterate with `ask(fn)`.

## Status

Open source (Owen Densmore, RedfishGroup) on GitHub
(backspaces/agentscript), actively used for teaching agent-based modeling;
documentation and live model views live at agentscript.org.
