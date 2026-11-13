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

## Fighting blind

**6E2 p.9** · script: `examples/raw_orion.py` · **rule and example agree**

**The book's scenario.** A hero is blinded by a Flash. With no Targeting
Sense left, he's at half OCV and half DCV in hand-to-hand combat, and at
Range his OCV drops to zero while his DCV is halved. He then spends a Half
Phase on a Hearing PER Roll against one attacker and makes it. Against that
one attacker his hand-to-hand DCV is now only -1, and at Range he's back to
full DCV. Against everyone else, nothing has changed.

The page doesn't give the hero's own CVs, so the script gives him 8 OCV and
8 DCV. That makes "half" a whole number and keeps the halved and mitigated
values plainly different.

**What Kirby does with those inputs**, after the PER Roll is made:

```
vs the one he heard   HTH: OCV 4  DCV 7   │   Range: OCV 4  DCV 8
vs everyone else      HTH: OCV 4  DCV 4   │   Range: OCV 0  DCV 4
```

At the start of his next Phase the benefit lapses, and both rows go back to
the second one until he spends another Half Phase and makes another roll.

**Why this example is here.** It breaks any design that treats "blind" as one
number. The same character has two different DCVs in the same Segment,
depending on who's attacking. The mitigated value is a flat -1, not a second
halving (a second halving gives 2, where the book says 7). And the mitigation
isn't symmetric: it restores full DCV at Range but not hand-to-hand.

---

## Dividing a Multipower

**6E1 p.404–406** · script: `examples/raw_kerendor_multipower.py` · **rule and example agree**

**The book's scenario.** A character owns a Multipower with a 60-point
reserve and three variable slots: a Blast, Flight, and Resistant Protection
at 15 PD / 15 ED (45 Active Points). Each Phase he can divide the reserve
however he likes, and each slot gets as many levels as its points will buy.
The page works through several splits, including one where the Flight slot
carries an Advantage, so its points have to pay for that too.

**What Kirby does with those inputs.** Each line is read back from the
combat engine's own views of the character's attacks, movement and
defenses after the split is stated. Nothing in the script prices anything
itself.

```
30 Blast / 30 Flight                    Blast 6d6, Flight 30m
40 Flight / 20 Blast                    Flight 40m, Blast 4d6
Protection on (45), 15 left             Protection 15/15, and either Flight 15m or Blast 3d6
10 Flight / 40 Blast / 9 Protection     Flight 10m, Blast 8d6, Protection 3/3
30 into Flight with +1/4 Advantage      Flight 24m, not 30
```

A slot holding no points is off: it isn't offered, and nothing it does
happens.

**Why this example is here.** The engine had the reserve's arithmetic for a
long time, but nothing ever used it. Every slot either fired at full strength
or didn't fire at all. Now a split is recorded on the fight's log, priced by
[kirby-cost](/docs/kirby-cost/), and read everywhere a slot matters:
attacks, movement, defenses, END, and characteristics.

---

## Aborting to Dodge

**6E2 p.24** · script: `examples/raw_lazer.py` · **rule and example agree**

**The book's scenarios.** A character with SPD 5 (Phases in Segments 3, 5, 8,
10 and 12) is attacked in Segment 6 and Aborts to Dodge. That uses up his
Segment 8 Phase: in Segment 8 he can do nothing, though he still has the
Dodge's DCV, and he acts again in Segment 10. The page then works through the
edges. If he's attacked in Segment 5 before his DEX comes up, the Abort spends
that Segment 5 Phase instead. If he's Holding an Action, he Aborts with it and
loses nothing more. A SPD 4 character can Abort his Segment 3 Phase in
Segment 2 to Block. And once a character has acted in a Segment, he can't
Abort again until the next one.

**What Kirby does with those inputs.** The script runs each case through the
real turn loop: the attacker announces, the defender is asked, and the engine
records what follows.

```
Attacked in Segment 6, Aborts to Dodge   gives up Segment 8; DCV 5+3 there; acts in 10
Attacked in Segment 5 before his DEX     gives up Segment 5; acts in 8
Holding his Phase when attacked          uses the Held Phase; still acts in 8
SPD 4, attacked in Segment 2             Blocks; nothing in Segment 3; attacks in 6
Attacked back after acting in Segment 5  never asked; no Abort
```

The book's Held Action example is a Half Move followed by a Held Half Phase.
The script Holds the whole Phase, which falls under the same sentence of the
rule.

---

## Adding damage

**6E2 p.99 and p.101** · script: `examples/raw_adding_damage.py` · **rule and example agree**

**The book's scenario.** Maneuvers add damage one Damage Class at a time,
whatever the kind of damage. A Martial Strike (+2 DC) takes a 3d6 club to
5d6, and a 1d6 HKA sword to 1½d6. A maneuver that does a different kind of
damage, like a Killing Strike, adds nothing to a weapon. And on p.99's table a
Killing Damage DC is a single pip, three of them to the die.

**What Kirby does with those inputs:**

```
Martial Strike with his Club     5d6
Martial Strike with his Sword    HKA 1½d6
Killing Strike                   made barehanded, never added to a weapon

STR on a 1d6 HKA:  STR 5 → 1d6+1   STR 10 → 1½d6   STR 15 → 2d6   STR 20 → 2d6
```

STR 20 stops at 2d6 because STR can't more than double an attack. That limit
is a rule (6E1 p.137). The page's broader suggestion that no attack should
more than double, however the damage is added, is offered as GM guidance, so
Kirby doesn't enforce it.

**Why this example is here.** Running it found two things. Kirby couldn't use
a martial maneuver with a weapon at all: a maneuver bought for weapon use was
quietly made barehanded. And STR was being added to Killing attacks half a
die at a time, so a 1d6 HKA with STR 5 came out at 1½d6 where the book says
1d6+1. Both are fixed.

---

## Haymaker

**6E2 p.70** · script: `examples/raw_adding_damage.py` · **rule and example agree**

**The book's scenario.** A character with a Phase in Segment 6 Haymakers his
Strike. He begins it in Segment 6, and it lands at the very end of Segment 7,
after everyone in Segment 7 has acted. He could Abort to Block in Segment 7
first, but then he loses the attack.

**What Kirby does with those inputs.** The Haymaker is begun in Segment 6, and
the blow lands in Segment 7, after the other fighter's Phase there, at +4 DC.
Run again with him Aborting to Block in Segment 7, the Haymaker is ruined and
never lands. While he's winding up he's at -5 DCV (the Combat Maneuvers
table, p.73).

**Why this example is here.** Kirby used to treat a Haymaker as a bonus for
"the next attack", and nothing ever applied the bonus, so a Haymaker cost a
Phase and did nothing.

---

## What Kirby cannot reproduce yet

Listed so the gaps are visible rather than implied.

| Example | Page | Needs |
|---|---|---|
| Combat Skill Levels for damage | 6E2 p.101 | the turn loop to offer spending two CSLs for +1 DC; the arithmetic is in |

Fighting blind, Aborting to Dodge and adding damage to a weapon all used to
be on this list. Each came off when its example started running, above.

---

Kirby is a HERO System VTT in active development. **HERO System™** is a
trademark of DOJ, Inc. d/b/a Hero Games; Kirby is not affiliated with or
endorsed by them, and ships no Hero Games content.
