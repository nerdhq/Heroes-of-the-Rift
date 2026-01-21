# Class Rework Session Notes

## Overview
Reworking all 8 classes with unique mechanics, thematic cards, and balanced gameplay. Each class should have:
- Unique resource mechanic
- 22 cards (7 common, 6 uncommon, 5 rare, 4 legendary)
- Thematic identity and playstyle

---

## COMPLETED CLASSES

### Warrior ✅
- **Resource:** Discipline (max 10)
- **Mechanic:** Tactical combat, damage reduction, counter-attacks
- **Special Ability:** Martial Supremacy - 25 AOE damage, enemies deal 20% less damage next turn
- **Theme:** Disciplined martial fighter with high HP and tactical prowess

### Rogue ✅
- **Resource:** Combo (max 5)
- **Mechanic:** Combo building, stealth, critical strikes
- **Special Ability:** Assassinate - 40 single target damage + gain stealth
- **Theme:** Swift assassin striking from shadows
- **NOTE:** Want to change special ability to give Stealth + next attack bonus instead of big damage ult

### Paladin ✅
- **Resource:** Faith (max 8)
- **Mechanic:** Holy knight balancing offense and defense
- **Special Ability:** Shield of Faith - Heal 10 + Shield 15 all allies + Block 1 turn
- **Theme:** Holy protector who shields allies and smites evil

### Mage ✅
- **Resource:** Mana (max 10)
- **Mechanic:** Elemental magic (Fire/Ice), mana spending unlocks ultimate
- **Special Ability:** Mana Overload - 36 AOE damage + 2 Burn + 2 Ice + 2 Vulnerable (2 turns), reset mana to 10. Unlocks after spending 20 mana.
- **Theme:** Scholarly arcanist bending reality through elemental mastery
- **Status Effects:** Uses Burn, Ice, Vulnerable

### Cleric ✅
- **Resource:** Devotion (max 5)
- **Mechanic:** Prayer Cycle - switches between Judgment and Benediction modes
  - Judgment mode: Damage and debuff cards
  - Benediction mode: Heal, shield, buff, revive, cleanse cards
  - Hybrid cards: Work in either mode
  - Devotion builds +1 per turn, +1 per matching card type
  - Switching modes costs your card play for the turn
  - At 5 Devotion when switching:
    - → Judgment: 10 AOE damage + 50% damage buff (2 turns)
    - → Benediction: 15 AOE heal + 50% healing buff (2 turns)
  - Starting mode: Judgment
- **Special Ability:** Prayer Cycle (mode switch with bonuses at max Devotion)
- **Theme:** Divine servant channeling deity's power, D&D-inspired naming (avoid WoW terminology)
- **Card Types:** Each card tagged as Judgment, Benediction, or Hybrid

---

## IN PROGRESS: BARD

### Current Design Direction
- **Resource:** Melody (max 6)
- **Theme:** Charismatic performer using music for battlefield control, buffs/debuffs, and team enablement

### Rhythm & Resonance Mechanic (DRAFT)
**Core Concept:** Bard maintains an active Song that provides persistent per-turn effects

**6 Song Types Defined:**
1. **Battle Anthem** - All allies deal +X bonus damage per turn
2. **Hymn of Fortitude** - All allies gain X shield per turn
3. **Hymn of Healing** - All allies heal X HP per turn
4. **Dirge of Despair** - All enemies take X damage per turn (DoT)
5. **Lullaby** - All enemies deal reduced damage (Weakness)
6. **Discordant Anthem** - All enemies take increased damage (Vulnerable)

**Rules:**
- Only one Song active at a time
- Playing a new Song replaces the current one
- Songs provide persistent effects each turn while active

### Pending Design Questions
1. **Song Persistence:** How long do songs last?
   - Option A: Until replaced by another song
   - Option B: Fixed duration (X turns)
   - Option C: Melody-based drain (costs Melody per turn to maintain)

2. **Echo vs Resonance System:**
   - Echo: At 3 Melody, cards have enhanced effects
   - Resonance: At 6 Melody (max), cards have powerful bonus effects
   - Options: Both thresholds / Just Resonance at 6 / Just Echo at 3

3. **Bardic Inspiration:**
   - Separate mechanic giving allies bonus dice/effects?
   - Tied to Melody spending?
   - Skip it and focus on Songs?

### User Preferences Noted
- Focus on music, rhythmic, melodic themes
- Likes Bardic Inspiration concept
- Likes Echo/Encore idea
- Wants battlefield buffs/debuffs as core identity
- Persistent effects to enable team or disable enemies
- D&D-inspired (Bardic Inspiration, etc.)

---

## PENDING CLASSES

### Archer
- **Current Resource:** Focus (max 8)
- **Current Special:** Piercing Shot - 30 AOE damage (ignores shields)
- **Needs:** Unique mechanic review, card design

### Barbarian
- **Current Resource:** Fury (max 10)
- **Current Special:** Rampage - 20 AOE damage + heal 10 self
- **Current Theme:** Berserker who grows stronger as they take damage
- **Needs:** Unique mechanic review, card design

---

## OTHER PENDING TASKS

### Priority System Discussion
Need to discuss how action order/priority works in combat. This affects:
- When buffs/debuffs apply
- Order of card resolution
- Turn structure

### Rogue Special Ability Update
Change from: "Assassinate - 40 damage to one enemy + stealth"
Change to: Stealth + next attack bonus (specifics TBD)

---

## DESIGN PRINCIPLES

1. **Card Distribution:** 7 common, 6 uncommon, 5 rare, 4 legendary
2. **Naming Convention:** D&D-inspired, avoid WoW terminology
3. **Unique Mechanics:** Each class should feel distinct to play
4. **Resource Identity:** Resource name and mechanic should match class fantasy
5. **Balance Considerations:**
   - Legendaries should be powerful but not game-breaking
   - Common cards form the backbone of gameplay
   - Rares/Legendaries provide exciting moments

---

## FILES TO REFERENCE

- `src/data/classes.ts` - Class configs (HP, resource, special ability)
- `src/data/cards.ts` - All card definitions
- `src/types/index.ts` - TypeScript types including ClassType, effects
- `DEVELOPMENT_PLAN.md` - Full documentation of class designs

---

## RESUME POINT

Continue with **Bard class design**:
1. Answer the 3 pending questions about Song persistence, Echo/Resonance, and Bardic Inspiration
2. Design 22 Bard cards following the Rhythm & Resonance mechanic
3. Implement in code

Then move to Archer, then Barbarian, then discuss priority system.
