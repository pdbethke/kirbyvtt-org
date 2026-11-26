---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-dice
description: Fair, seeded, replayable dice.
---

kirby-dice rolls dice and does nothing else. It has no dependencies and holds
no game rules: what a roll means is up to whoever asked for it.

## Why dice get their own package

Players are, reasonably, funny about dice. A roller buried inside a combat
engine can say it's fair. One that ships on its own can show it.

The fairness tests run a chi-square check over 60,000 rolls, check that each
roll is independent of the one before it, and pin the average close to 3.5.
Every test is seeded, so it gives the same answer every time. A fairness test
that fails once a fortnight only teaches people to re-run it. Two of the
tests check the checks: a loaded die has to fail, and twenty unseeded rollers
must not share a seed.

## Every fight can be replayed

A roller always reports the seed it rolls from, even when you didn't give it
one. Record the seed with the fight and it replays die for die.

```python
from kirby_dice import RandomRoller

roller = RandomRoller()
fight = [roller.roll_dice(3, 6) for _ in range(40)]

replay = RandomRoller(seed=roller.seed)
assert [replay.roll_dice(3, 6) for _ in range(40)] == fight
```

## Install

```sh
pip install kirby-dice
```

## Credit

The roller is based in part on the work of Bill Bame, shared informally and
with thanks.

## Source

kirby-dice is source-available, free for personal use, under the PolyForm
Noncommercial License 1.0.0.

[github.com/pdbethke/kirby-dice](https://github.com/pdbethke/kirby-dice)
