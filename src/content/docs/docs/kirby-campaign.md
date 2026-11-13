---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: kirby-campaign
description: Teams and rosters that last between fights.
---

kirby-campaign holds what lasts between fights: teams, their rosters, and
the bases they operate from. It has no database and no web layer. It's the
newest and smallest of the Kirby packages.

## A team is not a side

A **team** is who you are between fights: a Sentinel on Tuesday is still one
on Wednesday. A **side** is who you're fighting with right now.

They usually agree, and they have to be able to disagree: a schism, a
temporary alliance against something worse, a mind-controlled teammate. So a
character's team sets their side by default, but never overrides a side
they've already been given.

```python
from kirby_campaign import Team, TeamMember, sides_from_teams

sentinels = Team(
    id="sentinels", name="Sentinels of Dawn", team_type="hero",
    members=(TeamMember("aurora", "leader"), TeamMember("bulwark")),
    base_ids=("dawn-spire",),
)
sides_from_teams([sentinels])
```

## The dependency runs one way

kirby-campaign uses [kirby-combat](/docs/kirby-combat/), never the other way
round. A free-for-all in an alley has sides and no campaign at all, so the
combat engine can't depend on one.

## Install

```sh
pip install kirby-campaign
```

## Source

kirby-campaign is source-available, free for personal use, under the
PolyForm Noncommercial License 1.0.0.

[github.com/pdbethke/kirby-campaign](https://github.com/pdbethke/kirby-campaign)
