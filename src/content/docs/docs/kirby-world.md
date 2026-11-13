---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-world
description: Places, and the geometry inside them.
---

kirby-world models places: a World made of Scenes, and what's inside each
one. That means surfaces, walls, furnishings, hazards and constructs, plus
cover, falling, line of sight, and where each movement mode can actually get
to.

## A place is not a fight

A house with five people doing chores in it, and what's reachable from the
kitchen, needs nothing but this package. The fight engine imports places;
places never import the fight. A test enforces it: it makes the combat engine
impossible to import and builds a house anyway.

Questions about the person rather than the place, such as whether he's
Stunned or what this building has already absorbed, belong to the fight.
They arrive here as plain values, never as the fight itself.

```
kirby-terrain   what a thing is made of     no dependencies
kirby-world     places                      uses kirby-terrain
kirby-combat    the fight                   uses kirby-world, kirby-cost, kirby-dice
```

## Install

```sh
pip install kirby-world
```

## Source

kirby-world is source-available, free for personal use, under the PolyForm
Noncommercial License 1.0.0. It was split out of kirby-combat at 0.20.0.

[github.com/pdbethke/kirby-world](https://github.com/pdbethke/kirby-world)
