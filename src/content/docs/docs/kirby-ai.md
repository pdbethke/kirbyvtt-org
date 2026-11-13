---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-ai
description: The part of Kirby that chooses, and the part that never makes rules.
---

kirby-ai is everything in Kirby that makes a choice: which action a
computer-run character takes this Phase, how it reviews that choice before
committing to it, and how a fight gets narrated.

It makes choices and nothing else. Every rule lives in
[kirby-combat](/docs/kirby-combat/): the engine works out what each
character can legally do this Phase, and kirby-ai picks one of those
options. It never invents an action, and it never works out an outcome.
That means a human player and a computer-run villain choose from the same
menu, and the engine can offer a player the same suggestion it would make
for a villain, if the player wants one.

## Propose, review, then act

Being on the menu means an action is legal, not that it makes sense. Our
O.K. Corral benchmark kept turning up legal absurdities: a marshal who
couldn't see anyone spending his Phase shooting a boarding house, five men
with revolvers trying to knock down a saloon they couldn't dent.

So a choice can go through two steps. One model proposes an action, and a
second reviews it. The reviewer never picks an action itself. It either
approves, or sends the proposal back with its objection, and the proposer
tries again. Proposing and reviewing are different jobs, so they're two
separate seats that can't end up as the same model by accident.

## Seats, not models

Code that asks for a choice names a **seat**, such as `combat-pick`, and
never a model. Which model sits in that seat is configured in one place, so
you can run a fight on a local model or a hosted one without touching the
code. kirby-ai carries no API keys.

There are no defaults. Ask for a seat that isn't configured and it raises
an error instead of quietly picking a model for you.

## Install

```sh
pip install kirby-ai
```

kirby-ai is source-available, free for personal use, under the PolyForm
Noncommercial License 1.0.0.
