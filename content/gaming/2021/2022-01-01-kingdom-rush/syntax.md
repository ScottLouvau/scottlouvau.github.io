---
title: "Kingdom Rush Game Syntax Guide"
date: 2022-01-01
draft: true
---

I really enjoy Kingdom Rush. It provides a great balance of strategic thinking and tactical gameplay and can accommodate short sessions. Unfortunately, it's hard to remember how I solved a level. I want to write my solutions down, iterate on them, replay them easily, and share them with others. I want something easier than watching a twenty minute YouTube video on a second screen and constantly pausing and resuming as I follow along. 

If there was a "chess algebra" syntax for Kingdom Rush, I could do these things easily. The tower positions on each map would have to be labelled. Even with a language, visualizing what a script says to do might be difficult, so I'd like an animated guide I could "step through" to follow the script.

So... that's what I've created. If you like Kingdom Rush and want an easier way to write down your games, visualize them, iterate on them, replay them, and share them, follow along:

## Position Naming

Every tower position on each map is assigned a name ("D5") consisting of one letter (A-H) and one digit (1-9), just like chessboard squares. Like chess, the letter indicates the left-to-right position and the digit the bottom-to-top position, so that you know where on the map to look for a position.

To choose the names:

* Find all of the positions on a map (I find the flags drawn there).
* Find the most left, right, top, and bottom position coordinates.
* Divide the map into eight columns and nine rows in this range, with a minimum width and height.
* Assign a letter and digit to each position based on the row and column it falls within.



## Move Descriptions

To describe a move, you need to know the position name where the move happens and what is built or upgraded there. 

I use the first four letters of the tower type to identify them, and the first four letters of the specific top-level tower names. These are easy to remember and not ambiguous:

|           | L1   | L2    | L3    | L4   | L5   |
| --------- | ---- | ----- | ----- | ---- | ---- |
| Barracks  | Barr | Barr2 | Barr3 | Holy | Barb |
| Archer    | Arch | Arch2 | Arch3 | Rang | Musk |
| Mage      | Mage | Mage2 | Mage3 | Arca | Sorc |
| Artillery | Arti | Arti2 | Arti3 | BigB | Tesl |

If your build plan has you build and upgrade the tower in one position in back-to-back steps, you can just write a "move" for the highest level. For example, if you want to build a Tesla tower in position B5, write "B5 Tesl".

The upgrades to the top-level towers (like the Tesla tower Overcharge) are identified by the first four letters of the upgrade name and a number for levels higher than one. To fully upgrade Overcharge on the Tesla tower, add "B5 Over3".



## Upgrades

X, Y, Z and level.

Overcharge3 => Over3 => Y3.



## Other

|                | Mnemonic    | Short | Long | Top 1 | Top 2 |
| -------------- | ----------- | ----- | ---- | ----- | ----- |
| Rain of Fire   | "Meteors"   | M     | Rain |       |       |
| Reinforcements | "Neighbors" | N     | Rein |       |       |
| Hero           | "Officer"   | O     | Hero |       |       |
| Barracks       | "Paladin"   | P     | Barr | Holy  | Barb  |
| Archer         | "Ranger"    | R     | Arch | Rang  | Musk  |
| Mage           | "Sorcerer"  | S     | Mage | Arca  | Sorc  |
| Artillery      | "Tesla"     | T     | Arti | BigB  | Tesl  |

'.' as visual separator between steps (leave out in URLs)
'-' as whitespace indicator

L2: C8 Arti; A9 Barr; - ; A6 Barr ; C9 Mage ; - ; C8 Arti2
L2: C8t.A9p.-.A6p.-.C9s.-.C8t2
L2: C8tA9pA6pC9sC8t2