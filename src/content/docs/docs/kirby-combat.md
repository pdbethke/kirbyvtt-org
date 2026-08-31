---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-combat
description: A pure-Python HERO 6E combat engine.
---

kirby-combat is a pure-Python HERO 6E combat engine. It has one runtime
dependency, [kirby-cost](https://github.com/pdbethke/kirby-cost), and that
is deliberate: anything deriving a cost, a number of dice or a roll belongs
there, so the combat engine acts on the numbers it is given rather than
deriving its own.

It is covered by 1,348 tests spanning attacks, grappling, movement, mental
combat, perception, vehicles, mass combat, destructible terrain, Presence
attacks, Entangles and their escapes, and the conditions that follow from
them.

Some of those tests are the rulebooks' own worked examples, run against the
engine — see [RAW alignment](/docs/raw-alignment/).

## Install

```sh
pip install kirby-combat
```

kirby-combat needs no Hero Designer installation and no character file —
combatants are plain Python objects. It ships no rules text and no Hero
Games content; the numbers still come from your own rulebooks.

## Source

kirby-combat is source-available, free for personal use, under the PolyForm
Noncommercial License 1.0.0.

[github.com/pdbethke/kirby-combat](https://github.com/pdbethke/kirby-combat)
