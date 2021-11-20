---
title: "Kingdom Rush Analytics"
date: 2022-01-01
draft: true
---

I've gone through several playthroughs of Kingdom Rush (and the sequels) and really enjoy the strategy of this particularly well designed tower defense game. However, I keep wanting to really **solve** Kingdom Rush, to figure out the truly optimal tower layouts for the different levels and the reasoning behind them.

[Source:Tower Damage Per Second | Kingdom Rush Wiki | Fandom](https://kingdomrushtd.fandom.com/wiki/Source:Tower_Damage_Per_Second)

## Barracks Towers

| Tower                   | Item Cost | Total Cost | Damage | DPS         | sec / hit | Cost / Dmg | HP   | Armor | Respawn [s] |
| ----------------------- | --------- | ---------- | ------ | ----------- | --------- | ---------- | ---- | ----- | ----------- |
| Militia                 | 70        | 70         | 1-3    | 2.0 [6]     | 1.0       | 11.7       | 50   | None  | 10          |
| Footmen                 | 110       | 180        | 3-4    | 2.1 [6]     | 1.6       | 30         | 100  | 15%   | 10          |
| Knights                 | 160       | 340        | 6-10   | 4.8 [14.4]  | 1.6       | 23.6       | 150  | 30%   | 10          |
| **Holy Order**          | 230       | 570        | 12-18  | 9.1 [27.3]  | 1.6       | 20.9       | 200  | 50%   | 14          |
| **Barbarian Mead Hall** | 230       | 570        | 16-24  | 12.1 [36.3] | 1.6       | 15.7       | 250  | None  | 10          |
| w/Throwing L3           | +400      | 970        | 54-62  | 16.5 [49.7] | 3.5       | 19.5       | 250  | None  | 10          |
| w/More Axes L3          | +500      | 1,070      | 46-54  | 31.3 [93.8] | 1.6       | 11.4       | 250  | None  | 10          |

### Barracks Upgrades

| Tower      | Upgrade          | Cost              | sec / hit     | Damage           | DPS  | Cost / Dmg |
| ---------- | ---------------- | ----------------- | ------------- | ---------------- | ---- | ---------- |
| Holy Order | Healing Light    | 150 \| 150 \| 150 | 10            | 50 \| 100 \| 150 | -    | -          |
| Holy Order | Shield of Valor  | 250               |               | Armor 50% -> 65% |      |            |
| Holy Order | Holy Strike L1   | 220               | 5.3 [10%]     | 25-45            | 6.6  | 33.3       |
| Holy Order | Holy Strike L2   | 150               | 5.3 [10%]     | 50-90            | 13.2 | 28.0       |
| Holy Order | Holy Strike L3   | 150               | 5.3 [10%]     | 75-135           | 19.8 | 26.3       |
| Barbarians | Throwing Axes L1 | 200               | 1.2 [3.5 / 3] | 34-42            | 31.7 | 6.3        |
| Barbarians | Throwing Axes L2 | 100               | 1.2 [3.5 / 3] | 44-52            | 40.0 | 7.5        |
| Barbarians | Throwing Axes L3 | 100               | 1.2 [3.5 / 3] | 54-62            | 48.3 | 8.3        |
| Barbarians | Whirlwind L1     | 150               | 15%           | 25-45            |      |            |
| Barbarians | Whirlwind L2     | 100               | 20%           | 40-60            |      |            |
| Barbarians | Whirlwind L3     | 100               | 25%           | 55-75            |      |            |
| Barbarians | More Axes L1     | 300               | 0.56          | +10 [26-34]      | 53.6 |            |
| Barbarians | More Axes L2     | 100               | 0.56          | +20 [36-44]      | 71.4 |            |
| Barbarians | More Axes L3     | 100               | 0.56          | +30 [46-54]      | 89.3 |            |

## Archer Towers

| Tower         | Item Cost | Total Cost | Damage | DPS  | sec / hit | Cost / Dmg |
| ------------- | --------- | ---------- | ------ | ---- | --------- | ---------- |
| Archer        | 70        | 70         | 4-6    | 6.3  | 0.8       | 11.1       |
| Marksman      | 110       | 180        | 7-11   | 15   | 0.6       | 12.0       |
| Sharpshooter  | 160       | 340        | 10-16  | 26   | 0.5       | 13.1       |
| **Ranger**    | 230       | 570        | 13-19  | 40   | 0.4       | 14.3       |
| w/Poison L3   | + 750     | 1,320      |        | 152  | 0.4       | 8.7        |
| w/Thorns L3   | + 600     | 1,170      |        | 160  | 0.4 / 8   | 7.3        |
| maxed         | + 1,350   | 1,920      |        | 272  | 0.4 / 8   | 7.1        |
| **Musketeer** | 230       | 570        | 35-65  | 33.3 | 1.5       | 17.1       |
| w/Sniper L3   | + 750     | 1,320      |        |      |           |            |
| w/Shrapnel L3 | + 900     | 1,470      |        | 113  | 1.5 / 9   | 13.0       |
| maxed         | + 1,650   | 2,220      |        |      |           |            |

### Archer Upgrades

| Tower     | Upgrade     | Cost | sec / hit | Damage        | DPS     | Cost / Dmg  |
| --------- | ----------- | ---- | --------- | ------------- | ------- | ----------- |
| Musketeer | Sniper L1   | 250  | 14        | [20% of life] | *       |             |
| Musketeer | Sniper L2   | 250  | 14        | [40% of life] | *       |             |
| Musketeer | Sniper L3   | 250  | 14        | [60% of life] | *       |             |
| Musketeer | Shrapnel L1 | 300  | 9         | 60-240        | 16 [26] | 18.8 [11.3] |
| Musketeer | Shrapnel L2 | 300  | 9         | 120-480       | 33 [53] | 18.0 [11.3] |
| Musketeer | Shrapnel L3 | 300  | 9         | 180-720       | 50 [80] | 18.0 [11.3] |
| Ranger    | Poison L1   | 250  | 0.4       | 15 / 3s       | 37      | 6.7         |
| Ranger    | Poison L2   | 250  | 0.4       | 30 / 3s       | 75      | 6.7         |
| Ranger    | Poison L3   | 250  | 0.4       | 45 / 3s       | 112     | 6.7         |
| Ranger    | Thorns L1   | 300  | 8         | 40 / 1s       | 40      | 7.5         |
| Ranger    | Thorns L2   | 150  | 8         | 80 / 2s       | 80      | 5.6         |
| Ranger    | Thorns L3   | 150  | 8         | 120 / 3s      | 120     | 5.0         |

Notes:
Musketeer Shrapnel benefits from the artillery "Smart Targeting" perk, which causes every shot to always do maximum damage. 

Ranger Poison does true damage (bypassing any armor). Spiders and Undead are immune. Rangers could poison seven enemies within three seconds, or keep seven enemies continually poisoned.

Ranger Thorns trap up to eight enemies with an eight second cooldown for 1-3 seconds.

Poison L3: 7 x 15 = 105 DPS if seven enemies to hit.



## Mage Towers

Numbers shown after upgrades "Hermetic Study" (-10% cost) and "Empowered Magic" (+15% damage)

| Tower             | Item Cost | Total Cost | Damage | DPS  | sec / hit | Cost / Dmg |
| ----------------- | --------- | ---------- | ------ | ---- | --------- | ---------- |
| Mage              | 90        | 90         | 11-20  | 10.3 | 1.5       | 8.7        |
| Adept             | 144       | 234        | 27-50  | 25.6 | 1.5       | 9.1        |
| Wizard            | 216       | 450        | 46-86  | 44.0 | 1.5       | 10.2       |
| **Arcane Wizard** | 270       | 720        | 76-140 | 62.3 | 2.0       | 11.6       |
| **Sorcerer Mage** | 270       | 720        | 49-90  | 46.3 | 1.5       | 15.6       |



## Artillery Towers

Numbers shown after upgrades "Concentrated Fire" (+10% damage), "Field Logistics" (-10% cost), "Smart Targeting" (max damage in full area of effect). Artillery Damage ignores half of armor.

| Tower           | Item Cost | Total Cost | Damage | DPS  | sec / hit | Cost / Dmg |
| --------------- | --------- | ---------- | ------ | ---- | --------- | ---------- |
| Bombard         | 112       | 112        | 17     | 5.7  | 3.0       | 19.6       |
| Artillery       | 198       | 310        | 44     | 14.7 | 3.0       | 21.1       |
| Howitzer        | 288       | 598        | 66     | 22.0 | 3.0       | 27.2       |
| **Big Bertha**  | 360       | 958        | 110    | 31.4 | 3.5       | 30.5       |
| **Tesla x104**  | 337       | 935        | 66-121 | 42.5 | 2.2       | 22.0       |
| w/Overcharge L3 | +373      | 1,308      |        |      |           |            |
| w/Bolt L2       | +374      | 1,309      |        |      |           |            |
| maxed           |           | 1,682      |        |      |           |            |

### Artillery Upgrades

| Tower | Upgrade              | Cost | sec / hit | Damage     | DPS  | Cost / Dmg |
| ----- | -------------------- | ---- | --------- | ---------- | ---- | ---------- |
| Tesla | Overcharge L1        | 187  | 2.5?      | 10-20      |      |            |
| Tesla | Overcharge L2        | 93   | 2.5?      | 20-30      |      |            |
| Tesla | Overcharge L3        | 93   | 2.5?      | 30-40      |      |            |
| Tesla | Supercharged Bolt L1 | 187  |           | 4th target |      |            |
| Tesla | Supercharged Bolt L2 | 187  |           | 5th target |      |            |



## Enemies

| Enemy  | HP   | Speed | Armor | Mag. Def. | Gold | Damage | sec/hit |
| ------ | ---- | ----- | ----- | --------- | ---- | ------ | ------- |
| Goblin | 20   | Fast  | None  | None      | 3    | 1-4    | 1.0     |
|        |      |       |       |           |      |        |         |
|        |      |       |       |           |      |        |         |



### Goblin Analysis

With 20 HP, goblins take:
  Archer: 4 hits x 5 HP, taking 0.8 x 4 = 3.2 seconds each for 70G. [224G per KPS]
  Marksman: 3 hits x 9 HP, taking 0.6 x 3 = 1.8 seconds each for 180G. [324G per KPS]
  Sharpshooter: 2 hits x 13 HP, taking 0.5 x 2 = 1.0 seconds each for 340G. [340G per KPS]
  Ranger: 2 hits x 16 HP, taking 0.4 x 2 = 0.8 seconds each for 570G. [456 per KPS]
  Killed by one thorns or one poison L1 arrow. [870 or 820G] [328 per KPS]
  Poison: 0.4 x 1 = 0.4 seconds each.
  Thorns: 18 per 8 seconds = 0.44 seconds each.