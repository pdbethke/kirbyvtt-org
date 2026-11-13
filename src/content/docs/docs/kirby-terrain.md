---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-terrain
description: What's physically there, and how hard it is to break.
---

kirby-terrain describes what is physically in a place: walls, doors, windows,
floors, anything with a shape and a height. Everything is measured in metres.
It has no dependencies.

A wall in kirby-terrain doesn't know whether it blocks sight, and a door
doesn't know what it takes to break it down. Those are rules, and rules live
in [kirby-world](/docs/kirby-world/) and [kirby-combat](/docs/kirby-combat/).
This package only says what's there and what it's made of.

## How hard it is to break

When an object is a kind the HERO Objects Table covers (6E2 p.173), such as a
wall, a door or a pane of glass, its PD, ED and BODY come from that table.
You can override them per object. When it isn't, such as a tree or a car, you
supply them yourself. Nothing is guessed.

## Install

```sh
pip install kirby-terrain
```

You rarely need to install it by hand: [kirby-world](/docs/kirby-world/)
pulls it in.

## Source

kirby-terrain is source-available, free for personal use, under the PolyForm
Noncommercial License 1.0.0.

[github.com/pdbethke/kirby-terrain](https://github.com/pdbethke/kirby-terrain)
