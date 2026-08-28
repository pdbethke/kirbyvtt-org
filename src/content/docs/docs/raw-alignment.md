---
# SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
title: RAW alignment
description: The HERO System rulebooks' own worked examples, run against the engine.
---

Every VTT claims to implement the rules. Here is how Kirby proves it.

The HERO System rulebooks teach through named worked examples — a character
recovering from being Stunned, a flying brick doing a Move By, a hero fighting
blind. Each states exact numbers. That makes them the sharpest available test
of whether an engine implements the rules or merely resembles them.

So Kirby runs them.

:::note[This page ships no rules text]
Kirby ships no Hero Games content, and neither does this page. Each entry names
a page, describes the book's scenario in our own words, and shows what the
engine produces from those inputs. **Open your own copy and check us.**
:::

Each example below is backed by a script in the `kirby-combat` repository.
The scripts **assert** the book's numbers rather than printing them, and the
test suite requires every one to exit cleanly. So this page cannot drift from
the engine: if Kirby stops agreeing with a book example, the build goes red.

---

## Recovering from being Stunned

**6E2 p.107** · script: `examples/raw_andarra.py` · **rule and example agree**

**The book's scenario.** A character with DEX 20 and SPD 3 is Stunned by an
attack in Segment 6. Her next Phase falls in Segment 8, and she must spend it
recovering. She recovers when her DEX comes up in that Segment — regaining her
full DCV, with Placed Shot modifiers back to normal — but still cannot take any
other Action until her next Phase in Segment 12. The book is explicit that she
*may* Abort that Segment 12 Phase during Segments 8 (after her DEX), 9, 10
or 11.

**What Kirby does with those inputs:**

```
Segment 6 — Stunned by an attack

Segment 7    {stunned}                  DCV 5 (base 9)   Abort allowed: False
Segment 8    {recoveringFromStunned}    DCV 5 (base 9)   Abort allowed: False
Segment 9    {— none —}                 DCV 9 (base 9)   Abort allowed: True
Segment 10   {— none —}                 DCV 9 (base 9)   Abort allowed: True
Segment 11   {— none —}                 DCV 9 (base 9)   Abort allowed: True
Segment 12   {— none —}                 DCV 9 (base 9)   Abort allowed: True
```

Segments 9, 10 and 11 — the ones the book names — are asserted by the script.

**Where Kirby is approximate, stated plainly.** The book restores her DCV
*partway through* Segment 8, at her DEX. Kirby derives conditions by folding a
combat event log, which carries no intra-Segment DEX position, so its edge is
the end of Segment 8 rather than DEX 20 within it. Kirby therefore
over-penalises her for the remainder of one Segment. The script prints that
case and labels it — it never asserts it, because asserting it would claim a
fidelity the engine does not have.

**Why this example is here at all.** An earlier version of Kirby got it wrong.
It refused the Aborts the book grants in Segments 9–11, and halved a DCV the
book restores, because the design had cited two adjacent pages for a rule that
lives on a third. The entire test suite was green the whole time. Running the
example is what caught it — which is the argument for this page.

---

## Move By — where the book contradicts itself

**6E2 p.72** · script: `examples/raw_starburst.py` · **the example disagrees with the rule; Kirby follows the rule**

**The rule.** A Move By does half the attacker's STR damage plus one d6 per 10m
of velocity. The page adds a parenthetical instruction: halve the character's
STR *before* working out its damage, specifically so that nobody has to halve a
half-die. The attacker takes one third of the damage done.

**The example, on the same page.** A flying character with STR 15 and 30m of
Flight Move Bys a villain from 10m away, ending 20m past him. The book computes
the damage as (½ × 3d6) + 3d6 = 4½d6.

**These do not agree** — because the example halves the *dice*, the very thing
the parenthetical exists to prevent:

| | STR → damage | Result |
|---|---|---|
| **The rule** — halve STR *first* | STR 15 → 7 → 7/5 = **1 DC** | 1 + 3 = **4 DC** |
| **The example** — halve the *dice* | STR 15 → 3d6 → ½ × 3d6 = **1½d6** | 1½ + 3 = **4½d6** |

**Kirby follows the rule: 4 DC.** Everything else in the example matches
exactly — 20m past the target, and the attacker taking one third.

If you are checking Kirby against your book by hand, this is the one place on
this page where the engine will look wrong and is not. We would rather tell you
that than quietly match a worked example against its own rule.

---

## What Kirby cannot reproduce yet

Listed so the gaps are visible rather than implied.

| Example | Page | Needs |
|---|---|---|
| Fighting an opponent you cannot perceive | 6E2 p.9 / p.127 | the ½ OCV / ½ DCV penalties and their per-opponent mitigation — in progress |
| Aborting to Dodge | 6E2 p.24 | a driver that spends the aborted Phase |
| Adding damage to a weapon | 6E2 p.101 | turns on a GM ruling rather than a rule; not mechanically reproducible |

The first is the agreed finish line for Kirby's sense-affecting powers work:
that feature is not done until the book's own blinded-hero example runs and
asserts.

---

Kirby is a HERO System VTT in active development. **HERO System™** is a
trademark of DOJ, Inc. d/b/a Hero Games; Kirby is not affiliated with or
endorsed by them, and ships no Hero Games content.
