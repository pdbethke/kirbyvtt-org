---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-combat
description: A pure-Python HERO 6E combat engine.
---

kirby-combat is a pure-Python HERO 6E combat engine. It works out whose
Phase it is, what each character can legally do with it, and what happens
when they do.

It depends on three other Kirby packages, and each split is deliberate:

- [kirby-cost](/docs/kirby-cost/) for anything that derives a cost, a number
  of dice or a roll, so the combat engine acts on the numbers it is given
  rather than deriving its own. That includes a Multipower split: how much a
  slot can do with the reserve points it holds.
- [kirby-dice](/docs/kirby-dice/) for the dice themselves.
- [kirby-world](/docs/kirby-world/) for the place the fight happens in:
  walls, cover, line of sight and movement.

It is covered by over 4,000 tests spanning attacks, grappling, movement,
mental combat, perception, vehicles, mass combat, destructible terrain,
Presence attacks, Entangles and their escapes, Multipower splits, and the
conditions that follow from them.

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
