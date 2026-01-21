# Heroes of the Rift - Development Plan

## Phase 1: Playtesting
- Play the game to understand current state and flow
- Note pain points, balance issues, and areas for improvement

---

## Phase 2: Class Redesign

### 2.1 Terminology Audit
- Review all class names, abilities, and card names for WoW-specific terminology
- Shift language toward D&D-style verbiage to avoid IP concerns
- Keep core mechanics, change the flavor/naming

### 2.2 Existing Class Review
Review each class individually for:
- Resource system (name, max, generation)
- All 15 cards (names, effects, balance)
- Base stats (HP, stat affinities)
- Special ability (ultimate)
- Overall identity and playstyle

### 2.3 Duration System Rework

**Core Problem:** Effects based on "turns" often expire before being useful.

**Solution:** Change duration system based on effect type:

| Effect Type | Wording | Example |
|-------------|---------|---------|
| **Stun** (enemy debuff) | "next X cards enemies use" | "Stun: skip next 1 card enemies use" |
| **Taunt** (force targeting) | "next X cards enemies use" | "Taunt for next 2 cards enemies use" |
| **Strength/Buffs** (self buffs) | "next X cards" | "+5 Strength for next 2 cards" |
| **Poison/Burn/DoT** | Turns | Tick at end of each turn (current behavior is fine) |
| **Stealth** | Cards or until broken | "Stealth for next 3 cards or until you attack" |
| **Shield** | Permanent until consumed | Current behavior is fine |

**Implementation Notes:**
- Monster debuffs track "enemy cards remaining"
- Player buffs track "your cards remaining"
- Clear distinction in UI between your cards vs enemy cards

### 2.4 Card Logic Audit
Review all cards for timing/logic issues:

**Known Issues:**
- [ ] Berserker Rage: +5 Strength for 1 turn → should be 2 cards
- [ ] Battle Cry: +3 Strength for 2 turns → should be 3 cards per ally

**Things to check:**
- Self-damage cards - is the tradeoff worth it?
- AOE vs single-target balance
- Cards that do nothing in certain situations (heal when full HP, etc.)
- Aggro values - do they make sense for the card's power level?

**Standard Card Distribution (all classes):**
- 7 Common
- 6 Uncommon
- 5 Rare
- 4 Legendary
**Total: 22 cards per class**

**NOTE:** Warrior (21 cards) and Rogue (22 cards) need card count adjustments to match this distribution.

**Classes to review:**
- [x] Warrior (DONE - see below) - NEEDS: +1 card to reach 22
- [x] Rogue (DONE - see below) - OK at 22
- [x] Paladin (DONE - see below) - OK at 22
- [x] Mage (DONE - see below) - OK at 22
- [x] Cleric (DONE - see below) - OK at 22 (renamed from Priest)
- [ ] Bard
- [ ] Archer
- [ ] Barbarian

---

### Warrior Rework (FINAL)

**Class Identity:** Disciplined martial fighter, technique over rage. Commander/tactician.

**Resource:** Rage → **Discipline** (max 10)

**Special Ability:** Berserker Strike → **Martial Supremacy**
- 25 AOE damage + enemies deal 20% less damage on their next card

**Card Renames:**
| Old Name | New Name | Notes |
|----------|----------|-------|
| Defensive Stance | Raise Shields | - |
| Whirlwind | Blade Sweep | - |
| Intimidating Roar | Intimidate | - |
| Rallying Shout | Rally | - |
| Last Stand | Final Stand | - |
| Bloodthirst | Siphoning Blow | - |
| War Stomp | Disarm | **Effect change:** stun 1 turn (was 4 AOE damage) |
| Berserker Rage | Shattering Blow | **Effect change:** damage + removes shields + reduces armor for 3 turns |
| Titan's Grip | Riposte | **Effect change:** damage + prevent damage that turn + priority (goes first) |
| Unstoppable Force | Juggernaut | - |

### Rogue Rework (FINAL)

**Class Identity:** Assassin who rewards tactical setup. Bonus effects when attacking from stealth or when target is stunned.

**Resource:** Combo (max 5) - keeping as is

**Special Ability:** Assassinate - keeping as is (40 damage + 2 turn stealth)

**Core Mechanic: Opportunist**
Some Rogue cards gain bonus damage or effects when:
- You are in Stealth, OR
- Target is Stunned

**BALANCE NOTE:** Opportunist bonuses need to be worth the setup cost. You're essentially banking a turn to stealth/stun, so the payoff on the following turn needs to reflect that investment. Numbers are placeholder - will adjust during balancing pass.

**Stealth Mechanic Clarification:**
- While stealthed, you cannot be targeted or hit by enemy attacks
- Stealth breaks when you deal damage (or after duration expires)

**"All Allies" Clarification:**
- "All allies" effects INCLUDE self (caster is part of the party)

---

### Paladin Rework (FINAL)

**Class Identity:** Holy knight, protector, healer hybrid. Faith resource provides passive scaling bonuses.

**Resource:** Faith (max 8) - keeping as is

**Special Ability:** Shield of Faith - Heal + Shield all allies, immune to damage/effects until end of next turn

**Core Mechanic: Faith Scaling**
Paladin cards gain minor passive bonuses based on Faith resource level:
- **50% Faith (4+):** First bonus tier (minor boon)
- **100% Faith (8):** Second bonus tier (stronger boon)

This rewards building Faith over time in battle without requiring active spending.

**COMMON (7):**
| Card | Effect | 50% Faith | 100% Faith |
|------|--------|-----------|------------|
| Shield Bash | Low damage + Stun 1 turn | +damage | +1 turn stun |
| Blessed Shield | Shield | +shield | +small heal |
| Healing Word | Heal ally | +minor shield | +cleanse |
| Righteous Blow | Damage | +minor self heal | +damage |
| Prayer of Mending | Minor AOE heal | +minor shield | +minor AOE damage |
| Lesser Smite | Damage + extra vs undead/demons | +heal | +damage |
| Inspiring Blow | Damage + buff ally's next card | +minor heal | +damage |

**UNCOMMON (6):**
| Card | Effect | 50% Faith | 100% Faith |
|------|--------|-----------|------------|
| Consecrate Ground | Small AOE damage + heal for 3 turns | Heal affects all party | +extra damage |
| Bless Armor | Shield to ally | +minor heal | +block until end of next turn |
| Heal Sickness | Cleanse debuffs from ally | +minor heal | +damage to target's next attack |
| Holy Strike | Damage + heal | +damage | +healing |
| Greater Smite | AOE damage + extra vs undead/demons | +heal | +damage |
| Turn Evil | Stun + reduce damage 2 turns | +damage | Reduce damage 3 turns |

**RARE (5):**
| Card | Effect | 50% Faith | 100% Faith |
|------|--------|-----------|------------|
| Blinding Light | AOE low damage + stun 1 turn | +Weakness after stun ends | +AOE heal |
| Test of Faith | Shield + Taunt | +damage | AOE Taunt |
| Resurrect | Revive ally at 30% HP | Revive at 50% HP | +shield |
| Righteous Aura | Shield to all allies | +AOE heal | +AOE damage |
| Righteous Judgment | Damage + Weakness | +damage | +1 turn stun |

**LEGENDARY (4):**
| Card | Effect | 50% Faith | 100% Faith |
|------|--------|-----------|------------|
| Divine Shield | Immune to damage/effects 2 turns | +small heal | +damage bonus 2 turns |
| Archangel's Blessing | Increase all allies damage 2 turns | Next attack applies heavy burn | Next attack heals for damage dealt |
| Redeem Allies | Resurrect all fallen allies | +shield after res | Higher health threshold |
| Divine Wrath | AOE damage + AOE heal | +Consecrate Ground 3 turns | +AOE stun |

---

### Mage Rework (FINAL)

**Class Identity:** Scholarly arcanist who has mastered the arcane arts through study and intellect. Bends reality, manipulates magical forces, and unleashes devastating spells. High damage and utility, but fragile.

**Resource:** Mana (max 10, starts full)

**Special Ability:** Arcane Blast → **Mana Overload**
- Deal 36 damage to all enemies (12 Fire + 12 Frost + 12 Arcane)
- Apply 2 Burn, 2 Ice, and 2 Vulnerable for 2 turns
- Reset mana to 10
- **Unlocks after spending 20 mana total** (counter resets to 0 after use)

**Core Mechanic: Mana Mastery**
Mage spells cost mana to cast. Your mana level determines spell power:

- **Empowered (5+ mana):** Spells cost base + 1 mana but gain Empowered bonuses
- **Recovery (0-4 mana):** Spells restore mana equal to base cost but have Depowered effects

**Mana Cost Pattern:**
- Commons: 1 mana (2 when Empowered)
- Uncommons: 2 mana (3 when Empowered)
- Rares: 3 mana (4 when Empowered)
- Legendaries: 4 mana (5 when Empowered)
- Utility (Evocation, Concentration): 0 mana

**New Status Effect: Vulnerable**
- Target takes +X damage from all sources for duration

**Burn Mechanic Update:**
- New burn ADDS to existing burn amount
- Duration RESETS to the new spell's duration
- Rewards sustained fire pressure to build massive DoT

**Fire Spell Bonus:** If target has Burn, increased Burn/tick
**Frost Spell Bonus:** If target has Frost, increased damage

---

**COMMON (7):**
| Card | Mana | Base Effect | Empowered (5+ mana) | Depowered (<5 mana) |
|------|------|-------------|---------------------|---------------------|
| Arcane Bolt | 1 | Deal 10 damage | +4 damage | -4 damage |
| Magic Missile | 1 | Deal 4 damage x3 to random enemies | +1 extra missile | -1 missile |
| Mana Shield | 1 | Gain 8 shield | +4 shield | -4 shield |
| Firebolt | 1 | 6 damage + 2 Burn 2 turns. If has Burn: +1 Burn/tick | +2 Burn/tick | -1 Burn/tick |
| Ray of Frost | 1 | 6 damage + 2 Ice 2 turns. If has Frost: +3 damage | +2 damage | -2 damage |
| Evocation | 0 | Restore 3 mana | Also +5 damage to next spell | Base effect only |
| Concentration | 0 | Next spell is Empowered (even in Recovery) | Double next spell's Empowered bonus | Base effect only |

**UNCOMMON (6):**
| Card | Mana | Base Effect | Empowered (5+ mana) | Depowered (<5 mana) |
|------|------|-------------|---------------------|---------------------|
| Fireball | 2 | 8 AOE damage + 2 Burn 2 turns. If has Burn: +2 Burn/tick | +4 AOE damage | -4 AOE damage |
| Icy Blast | 2 | 8 AOE damage + 2 Ice 2 turns. If has Frost: +4 damage | +1 Ice/tick | -1 Ice/tick |
| Counterspell | 2 | Stun 1 enemy for 1 turn | +1 turn stun | No stun, apply 2 Weakness instead |
| Magical Might | 2 | Grant ally or self +3 primary stat for 2 turns | +2 primary stat | -1 primary stat |
| Mirror Image | 2 | Gain Taunt + Stealth for 1 turn | +1 turn duration | No Taunt, Stealth only |
| Arcane Explosion | 2 | Deal 5 AOE damage + 2 Vulnerable 2 turns | +2 AOE damage | -2 AOE damage |

**RARE (5):**
| Card | Mana | Base Effect | Empowered (5+ mana) | Depowered (<5 mana) |
|------|------|-------------|---------------------|---------------------|
| Shattering Lance | 3 | 15 damage. Double if target has Frost | +2 Frost duration | Removes Frost from target |
| Mana Bomb | 3 | 12 damage + 6 splash to all + 2 Vulnerable 2 turns | +4 primary, +2 splash | -4 primary, -2 splash |
| Polymorph | 3 | Stun until damaged or 3 turns. Attack that breaks deals +10 bonus damage | +5 bonus damage | -5 bonus damage |
| Invisibility | 3 | Stealth 1 turn + restore 4 mana | Next attack +8 damage | Next attack -4 damage |
| Meteor | 3 | 15 AOE damage + 3 Burn 3 turns. If has Burn: +3 Burn/tick | +5 AOE damage | -5 AOE damage |

**LEGENDARY (4):**
| Card | Mana | Base Effect | Empowered (5+ mana) | Depowered (<5 mana) |
|------|------|-------------|---------------------|---------------------|
| Arcane Infusion | 4 | Reset mana to 10 + next spell is Empowered | Double next spell's Empowered bonus | Next spell +5 damage |
| Inferno | 4 | 20 AOE + 5 Burn 3 turns. If has Burn: +10 damage, +4 Burn/tick | +5 AOE damage | -5 AOE damage |
| Blizzard | 4 | 20 AOE + 5 Ice 3 turns. If has Frost: +20 damage, +2 Ice/tick | +5 AOE damage | -5 AOE damage |
| Arcane Torrent | 4 | Fire 10 missiles (3 damage each). Each applies 1 Vulnerable 1 turn | +2 extra missiles | -4 missiles |

---

### Cleric Rework (FINAL)

**Class Identity:** Divine servant who channels their deity's power through prayer. Switches between healing and damaging modes, rewarded for building devotion before switching.

**Renamed from:** Priest → Cleric

**Resource:** Devotion (max 5)

**Special Ability:** Prayer Cycle (passive mode-switching mechanic)

**Core Mechanic: Prayer Cycle**
Cleric has two modes they can switch between:
- **Judgment Mode** (starting mode): Damage and Debuff cards build Devotion
- **Benediction Mode**: Heal, Shield, Buff, Revive, Cleanse cards build Devotion

**Devotion Building:**
- +1 Devotion per turn (passive)
- +1 Devotion per matching card played (damage/debuff in Judgment, heal/support in Benediction)
- Hybrid cards (both damage and heal/support) build Devotion in either mode

**Switching Modes (costs your card play for the turn):**
- **Below 5 Devotion:** Mode changes, Devotion resets to 0, no effect
- **At 5 Devotion:**
  - → Judgment: 10 AOE damage + **+50% damage buff for 2 turns**
  - → Benediction: 15 AOE heal + **+50% healing buff for 2 turns**
  - Devotion resets to 0

**Card Types:**
- **Judgment:** Damage, Debuff (builds Devotion in Judgment mode)
- **Benediction:** Heal, Shield, Buff, Revive, Cleanse (builds Devotion in Benediction mode)
- **Hybrid:** Contains both damage AND heal/support effects (builds Devotion in either mode)

---

**COMMON (7):**
| Card | Type | Effect |
|------|------|--------|
| Sacred Flame | Judgment | Deal 8 damage + 2 Burn 2 turns |
| Admonish Wickedness | Judgment | Deal 6 damage + 2 Weakness 2 turns |
| Cure Wounds | Benediction | Heal ally 12 HP |
| Healing Word | Benediction | Heal all allies 5 HP |
| Prayer of Protection | Benediction | Grant ally 10 shield |
| Bless | Benediction | Grant ally +3 Strength 2 turns |
| Righteous Reprimand | Hybrid | Deal 5 damage + heal self 5 HP |

**UNCOMMON (6):**
| Card | Type | Effect |
|------|------|--------|
| Pillar of Light | Judgment | Deal 10 damage + Stun 1 turn + 2 Weakness AOE 1 turn |
| Deific Blast | Judgment | Deal 6 AOE damage |
| Prayer of Healing | Benediction | Heal all allies 8 HP |
| Purity Seal | Benediction | Grant ally +3 Strength 2 turns + 8 shield (reapplies 2 turns) |
| Holy Fire | Hybrid | Deal 8 damage + heal lowest ally 8 HP |
| Angelic Assist | Hybrid | Deal 10 damage + grant self 6 shield |

**RARE (5):**
| Card | Type | Effect |
|------|------|--------|
| War Angel's Sermon | Judgment | Deal 12 AOE damage + 2 Vulnerable 2 turns |
| Penance | Judgment | Deal 10 damage to enemy (5 to self) + transfer all debuffs from self to enemy |
| Purifying Light | Benediction | Heal all allies 12 HP + cleanse |
| Revivify | Benediction | Revive ally at 40% HP |
| Holy Nova | Hybrid | Deal 12 AOE damage + heal all allies 10 HP |

**LEGENDARY (4):**
| Card | Type | Effect |
|------|------|--------|
| Damnation | Judgment | Deal 20 AOE damage. Below 25% HP: instant death. Above: 4 Burn 3 turns |
| Archangel's Descent | Hybrid | Deal 20 AOE damage + heal all 15 HP + Stun enemies 1 turn + cleanse allies |
| Divine Intervention | Benediction | Revive all fallen at 50% HP + heal all 20 HP |
| Angelic Blessing | Benediction | Heal ally 20 HP + 15 shield + +4 Strength 2 turns + cleanse |

---

**POST-REWORK NOTE:** Discuss priority system - how action order is determined each turn, and design priority cards.

---

**COMMON (7):**
| Old Name | New Name | New Effect | Opportunist Bonus |
|----------|----------|------------|-------------------|
| Backstab | *(moved to Uncommon)* | - | - |
| Shadowstep | Shadowstep | Stealth 1 turn | - |
| Poison Blade | Apply Poison | Next 3 damaging cards apply 3 poison 3 turns | +1 poison/tick if stealthed |
| Quick Stab | Stab | 8 damage | +4 if stealthed OR stunned |
| Cloak of Shadows | Cloak of Shadows | 5 shield + Stealth 1 turn | - |
| Venomous Strike | Venomous Strike | 5 damage + 3 poison 2 turns | +1 poison/tick if stealthed |
| Slice and Dice | Double Strike | 6 damage x2 | +1 extra hit if stealthed |
| Distract | Distraction | Reduce aggro significantly for next 2 cards | - |

**UNCOMMON (6):**
| Old Name | New Name | New Effect | Opportunist Bonus |
|----------|----------|------------|-------------------|
| Backstab | Sneak Attack | 10 damage | +5 if stealthed OR stunned |
| Fan of Knives | Dagger Cleave | 4 AOE damage | +2 AOE damage if stealthed |
| Cheap Shot | Hit 'em Where It Hurts | 6 damage + 2 Weakness 2 turns | +1 turn stun if stealthed |
| Smoke Bomb | Pocket Sand | Stealth 1 turn + 1 Weakness to enemies | - |
| Blade Flurry | Toxic Swipe | 3 AOE damage + 3 poison 3 turns | +1 poison/tick if stealthed |
| Evasion | Night Walk | Stealth 1 turn + 8 shield | - |

**RARE (5):**
| Old Name | New Name | New Effect | Opportunist Bonus |
|----------|----------|------------|-------------------|
| Assassinate | Night Blade | 18 damage + Stealth 1 turn | +8 damage if stealthed |
| Eviscerate | Blinding Strike | 12 damage + 2 accuracy penalty 2 turns | +1 turn if stealthed |
| Deadly Poison | Toxic Strike | 1 damage + 6 poison 4 turns | +1 turn if stealthed (5 turns) |
| Garrote | Acid Splash | 5 AOE damage + 2 poison 2 turns | +1 turn if stealthed (3 turns) |
| Marked for Death | Open a Bounty | Mark enemy: bonus gold if you get killing blow | - |

**LEGENDARY (4):** *(reduced from 6)*
| Card | Effect | Opportunist Bonus |
|------|--------|-------------------|
| Secret Recipe | 10 damage + 10 poison 4 turns | +4 Weakness 4 turns if stealthed |
| Toxic Cloud | 15 AOE damage + 5 poison 4 turns | +1 poison/tick if stealthed |
| Deathblow | 40 damage | +20 damage if stealthed |
| Umbral Shroud | All allies Stealth 1 turn + next attack +10 damage | - |

---

### 2.5 New Classes
Add new classes to expand roster:
- [ ] Necromancer (summons, life drain, undead synergy)
- [ ] (Others TBD)

---

## Phase 3: Card System Enhancements

### 3.1 Card Types (TBD)
Introduce a card type system for synergies and mechanics.

**Potential types (to be decided):**
- Attack / Defense / Skill / Utility?
- Physical / Magical / Support?
- Instant / Channeled / Sustained?

Card types will enable:
- Class synergies ("When you play an Attack card...")
- Upgrade path differentiation
- Passive ability triggers

### 3.2 Card Upgrades
Add permanent card upgrade system:
- Upgrade existing cards (Slash → Slash+)
- Upgrades provide meaningful power boosts
- Available after boss fights (not normal rounds)

### 3.3 Hand Rerolls
Add ability to reroll cards in hand:

**Options to consider:**
- X rerolls per round (resets each round)
- X rerolls per combat (limited resource)
- 1 free reroll per hand, additional cost gold/resource
- Reroll single card vs entire hand

**Design considerations:**
- Reduces bad luck frustration
- Adds tactical decision (save reroll or use now?)
- Could be a stat that scales (LCK gives more rerolls?)
- Could be a class passive (Rogues get extra rerolls)

---

## Phase 4: Boss Reward Rework

After defeating a boss, player chooses ONE of three options:

### Option 1: Upgrade Existing Card
- Pick a card you own to permanently upgrade
- Should be powerful and impactful

### Option 2: New Card (Better Odds)
- Higher rarity odds than normal round rewards
- Boss-tier card selection pool

### Option 3: Random Stat Upgrade
- +1 to a random attribute (STR, AGI, CON, INT, WIS, LCK)
- Alternative progression path for builds

---

## Phase 5: Passive Class Abilities

### Concept
- Earned through progression (not available at start)
- Relatively powerful effects
- Synergize with card types

### Examples (conceptual)
- **Paladin**: "Whenever you cast a healing spell, gain X shield"
- **Hunter/Archer**: "Whenever you summon a creature/pet, gain X"
- **Necromancer**: "Whenever a creature dies, gain X"
- **Rogue**: "Attack cards deal +X damage while in Stealth"

### Implementation Notes
- May need multiple passive options per class (choice/build variety)
- Unlock timing TBD (level up? campaign milestone? achievement?)
- Balance carefully - should be impactful but not overwhelming

---

## Phase 6: Ability Animations

### Concept
Add visually impactful animations for card/ability usage.

### Examples
- **Mage Fireball**: Fire builds up on character, then shoots as a projectile to enemy
- **Barbarian Rage**: Red aura effect or angry face overlay on player card
- **Priest Heal**: Golden light / holy glow emanating from character
- **Rogue Stealth**: Smoke/shadow effect, character fades partially
- **Archer Piercing Shot**: Arrow trail with impact effect
- **Paladin Divine Shield**: Glowing shield bubble around allies

### Implementation Notes
- Could use CSS animations, Lottie, or canvas-based effects
- Animations should be skippable (respect game speed settings)
- Each card type might have a base animation, with legendary cards having unique ones
- Consider performance on lower-end devices

---

## Phase 7: Avatar & Cosmetics System

### Base Avatars
- Each class has a default avatar
- Choose between male/female variants at character creation
- Simple but recognizable silhouettes/portraits

### Cosmetic Drops
- Bosses drop cosmetic items for your class when defeated
- Cosmetics are account-bound (or champion-bound TBD)
- Types of cosmetics:
  - **Portraits/Avatars**: Different art for your character
  - **Card Backs**: Visual flair for your deck
  - **Ability Effects**: Alternate colors/styles for animations
  - **Frames/Borders**: Player card decoration

### Cosmetic Unlocks
- Specific bosses drop specific cosmetics (farmable)
- Some cosmetics tied to achievements
- Rare/legendary cosmetics for harder content

### UI
- Cosmetic wardrobe/collection screen
- Preview cosmetics before equipping
- Show off equipped cosmetics in multiplayer

---

## Phase 8: UI/UX Improvements

### Resource System Explanation
- Add tooltip/info icon next to resource bar explaining:
  - What the resource is called (Fury, Combo, Faith, etc.)
  - How it's gained (per card played, per damage dealt, etc.)
  - What happens when full (Enhanced Mode available)
  - What Enhanced Mode does for this class (+X damage, +X healing, etc.)
- Consider a first-time tutorial popup when playing a new class
- Maybe show "Enhanced Mode Ready!" indicator when resource is maxed

### Other UX Gaps to Address
- [ ] Explain aggro system (what does the D20 roll mean?)
- [ ] Explain status effects (what does poison/burn/ice actually do?)
- [ ] Explain stat scaling (how does STR affect damage?)
- [ ] Card tooltips showing calculated damage with current stats
- [ ] Turn phase indicator explanation
- [ ] Hover over incoming enemy skill/intent to see details (damage amount, effect type, target)
- [ ] Add main menu button to defeat/victory screens

---

## Open Questions
- [ ] What card types to use?
- [ ] How many passive options per class?
- [ ] When/how are passives unlocked?
- [ ] What are the upgrade values for cards?
- [ ] What are the improved rarity odds for boss card rewards?
- [ ] Animation tech: CSS, Lottie, canvas, or library like Framer Motion?
- [ ] Art style for avatars: pixel art, illustrated, simple icons?
- [ ] Cosmetics champion-bound or account-wide?
- [ ] Which bosses drop which cosmetics?

---

## Current System Reference

### Existing Classes
| Class | HP | Resource | Max | Special Ability |
|-------|-----|----------|-----|-----------------|
| Warrior | 120 | Discipline | 10 | Martial Supremacy (25 AOE + 20% weakness) |
| Rogue | 80 | Combo | 5 | Assassinate (40 dmg + stealth) |
| Paladin | 100 | Faith | 8 | Shield of Faith (heal + shield + block) |
| Mage | 70 | Mana | 10 | Mana Overload (36 AOE + debuffs, unlocks after 20 mana spent) |
| Cleric | 75 | Devotion | 5 | Prayer Cycle (mode switch: 10 AOE dmg or 15 AOE heal + 50% buff) |
| Bard | 85 | Melody | 6 | Battle Hymn (+5 STR AOE) |
| Archer | 75 | Focus | 8 | Piercing Shot (30 AOE) |
| Barbarian | 130 | Fury | 10 | Rampage (20 AOE + 10 heal) |

### Current Card Rarities
- Common, Uncommon, Rare, Legendary
- 15 cards per class (120 total)

### Current Reward Flow
- Normal round: Card reward selection
- Round 2+: Card shop available
- No current distinction for boss rewards
