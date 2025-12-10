# Paper Dungeon - Improvement Ideas

This document contains a comprehensive list of potential improvements and features for Paper Dungeon, organized by impact and effort required.

---

## 🎯 High Impact, Low Effort (Remaining)

### Sound Effects

- Card draw sound
- Card play sound (different per rarity)
- Damage/healing sounds
- Victory/defeat music
- Monster roar when appearing
- Status effect application sounds

### Death Animations

- Fade/dissolve effect when monsters die
- Victory pose for heroes
- Dramatic effect when heroes fall

---

## 🎯 High Impact, Low Effort (Remaining)

#### Undo Card Selection

- Allow changing card selection before confirming
- Cancel target selection and go back to card selection
- Confirmation dialog for risky plays

#### Card History Viewer

- Tab/button to see all cards played this combat
- Filter by player or turn
- Shows what effects were applied

---

## 🚀 High Impact, Medium Effort

### 6. Meta-Progression

#### Unlockable Cards

- Start with 8 basic cards per class
- Unlock 2 more through achievements
- Hidden legendary cards for each class
- Unlock conditions: defeat specific bosses, use combos, etc.

#### Hero Upgrades (Persistent Between Runs)

- **Max HP+**: +10 HP permanently
- **Starting Shield**: Begin each run with 5 shields
- **Card Draw+**: Draw 3 cards instead of 2
- **Resource Boost**: Start with max resources
- **Rarity Boost**: Higher chance of rare cards in rewards

#### Achievement System

- **Flawless Victory**: Defeat dragon with no deaths
- **Solo Run**: Win with only 1 hero
- **Class Master**: Win with each class
- **Speed Runner**: Win in under 50 turns
- **Tank**: Win while one hero has 30+ aggro
- **Healer**: Heal 500+ HP in one run
- **Combo King**: Play 10+ cards in one turn
- **Survivor**: Win with hero at 1 HP

---

## 💎 High Impact, High Effort

### 7. Strategic Depth

#### Card Synergies

- **Combos**: Certain cards trigger bonuses when played together
- **Set Bonuses**: Playing 3+ poison cards in one run grants poison mastery
- **Cross-Class Synergies**: Warrior taunt + Paladin shield = bonus shield
- **Chain Effects**: Some effects trigger additional effects

Examples:

- **Rogue Combo**: Stealth → Backstab = 2x damage
- **Mage Combo**: Frostbolt → Frostbolt = Freeze
- **Warrior Chain**: Each attack this turn grants +1 damage to next attack

#### Positioning System

- **Front Row**: Takes more damage, generates more aggro
- **Back Row**: Takes less damage, harder to target
- **Movement**: Cards that swap positions
- **Formation Bonuses**: Specific arrangements grant benefits

#### Relic System (Binding of Isaac Style)

- Find permanent items during runs
- Modify core gameplay mechanics
- Can be positive or negative

Examples:

- **Blood Amulet**: +2 damage, but -5 max HP
- **Lucky Coin**: Card rewards give 4 options instead of 3
- **Cursed Dice**: D20 rolls are ±2 random
- **Phoenix Feather**: Revive once with 50% HP (consumed)
- **Thorns Ring**: Reflect 20% of damage taken
- **Mana Crystal**: +2 max resources for all heroes

#### Event System (Between Rounds)

- Random encounters instead of always getting card rewards
- Multiple paths to choose from

Event Types:

- **Merchant**: Buy cards, relics, or upgrades with gold
- **Shrine**: Sacrifice HP for powerful blessing
- **Treasure**: Get random relic
- **Curse**: Accept curse for powerful card
- **Rest Site**: Heal all heroes to full or upgrade a card
- **Mystery**: Unknown outcome (could be good or bad)
- **Elite Enemy**: Harder fight with better rewards

### 8. Difficulty Modes & Progression

#### Difficulty Levels

- **Story Mode**: -20% enemy HP, start with 5 extra HP per hero
- **Normal**: Balanced as currently designed
- **Hard**: +30% enemy HP, +20% enemy damage
- **Nightmare**: +60% enemy HP, +40% damage, enemies get new abilities
- **Hell**: +100% enemy HP, +60% damage, limited healing, permadeath

#### Endless Mode

- See how many rounds you can survive
- Enemies scale infinitely
- Leaderboard for most rounds survived
- Special rewards at round milestones (10, 25, 50, 100)

#### Daily Challenge

- Pre-set party composition and deck
- Same challenge for all players that day
- Leaderboard for fastest clear or highest score
- Special rewards for top performers

#### New Game+ (Ascension System)

- Replay with increased difficulty
- Unlock new cards and relics
- Track highest ascension level
- 20 ascension levels, each adding modifiers

Ascension Modifiers:

- Level 1: Elite enemies appear in rounds
- Level 2: Monsters start with buffs
- Level 3: Start with 2 curses in deck
- Level 4: Healing reduced by 50%
- Level 5: Monsters have +1 to all ability rolls
- ... and so on

### 9. Advanced Gameplay Features

#### Card Upgrades (During Run)

- Upgrade cards at rest sites or through events
- Choose 1 card to upgrade

Upgrade Examples:

- **Slash**: 8 damage → 12 damage
- **Heal**: Heal 15 → Heal 20 + cleanse 1 debuff
- **Fireball**: 10 damage → 14 damage + burn
- **Shield Bash**: 5 damage + 5 shield → 8 damage + 8 shield

#### Curse System

- Negative cards added to deck (dead draws)
- Can't be discarded normally
- Some events/relics add curses

Curse Examples:

- **Injury**: Deal 5 damage to self when drawn
- **Doubt**: Can't play the next card you draw
- **Exhaustion**: -10 max HP while in hand
- **Bad Luck**: D20 rolls are -3 while in deck

#### Boss Mechanics

- Multi-phase bosses with changing abilities
- Special mechanics that require strategy

Boss Examples:

- **Dragon Phase 2**: Immune to damage, must destroy shield first
- **Lich King**: Summons skeletons that must be killed before damaging boss
- **Demon Lord**: Possession mechanic - controls a hero for 1 turn
- **Hydra**: Each head is a separate target, regrows heads if not all killed

#### Hero Synergies

- Specific class combinations unlock bonus abilities
- Passive team buffs

Synergy Examples:

- **Warrior + Paladin**: All shields grant +2 HP regen
- **Mage + Priest**: Elemental spells also heal lowest HP ally
- **Rogue + Archer**: Both gain +1 to aggro rolls
- **Barbarian + Warrior**: Rage abilities cost 1 less resource

---

## 🔧 Technical Improvements

### 10. Save System

#### Auto-Save

- Persist game state to localStorage after each action
- Save on game close, resume on reopen
- Prevent progress loss from browser crashes

#### Multiple Save Slots

- 3-5 save slots for different runs
- Show preview: party composition, current round, heroes alive
- Delete old saves

#### Cloud Saves (Optional)

- Create free account to sync saves
- Access from any device
- Backup/restore functionality
- Share run data for analysis

### 11. Performance & Polish

#### Optimization

- React.memo for expensive components
- useMemo for complex calculations
- Virtualize battle log for long games
- Lazy load screens not currently visible

#### Animation System

- Proper animation queue for sequential effects
- Don't let animations block gameplay
- Smooth 60fps transitions
- Respect user's "reduced motion" preference

#### Mobile Support

- Touch-friendly buttons (larger tap targets)
- Responsive layout for tablets/phones
- Portrait and landscape modes
- Swipe gestures for navigation

#### Accessibility

- Keyboard shortcuts for all actions
- Screen reader support for visually impaired
- Color-blind modes (deuteranopia, protanopia, tritanopia)
- High contrast mode
- Font size options

### 12. Analytics & Balance

#### Telemetry System

- Track card win rates
- Identify which bosses are hardest
- See where players die most often
- Monitor average game length
- Track card pick rates in deck building

#### Balance Dashboard

- Internal tool to visualize balance data
- Compare class win rates
- See underused/overused cards
- Identify dominant strategies

#### Regular Balance Patches

- Monthly card/monster adjustments
- Buff underperforming cards
- Nerf overpowered strategies
- Keep meta fresh and evolving

---

## 🎨 Creative Additions

### 13. Story & Lore

#### Narrative Elements

- Short story text between rounds
- Flavor text on cards
- Monster lore when first encountered
- Ending cutscene with branching story based on survivors

#### Character Backstories

- Unlock hero lore through achievements
- Each class has a personal reason for fighting the dragon
- Reading all lore unlocks special card

#### World Building

- The world is called "Papyria"
- Made entirely of paper (explains the art style)
- Dragon is tearing the world apart
- Heroes are legendary figures from folklore

### 14. Multiplayer Features

#### Co-op Mode

- 2 players control party together
- Each controls different heroes
- Must coordinate strategy
- Shared victory or defeat

#### PvP Arena

- Draft deck from random pool of cards
- 1v1: Each player controls a party
- Best of 3 rounds
- Ranked ladder with seasons

#### Leaderboards

- Fastest clear times
- Highest score (points for kills, combos, flawless rounds)
- Longest win streak
- Highest endless mode round
- Daily challenge rankings

### 15. Cosmetics & Customization

#### Card Back Designs

- Default: Classic paper texture
- Unlock through achievements:
  - **Dragon Scale**: Defeat dragon on nightmare
  - **Golden**: Win 50 games
  - **Shadow**: Win without taking damage
  - **Prismatic**: Unlock all cards

#### Hero Skins/Portraits

- Alternative character art
- Seasonal skins (Halloween, Christmas, etc.)
- Earn through progression or special events
- No gameplay impact, purely cosmetic

#### Battlefields

- Different visual themes for combat arena
- **Forest**: Green, leafy background
- **Castle**: Stone walls and torches
- **Volcano**: Lava and fire effects
- **Ice Cavern**: Frozen, blue tint
- Changes based on current round or player choice

#### Emotes/Reactions

- Express yourself during combat
- "Well Played", "Oops", "Thanks", "Thinking..."
- Shows character making expression
- Cooldown to prevent spam

---

## 🎯 Recommended Implementation Priority

Based on the current state of the game and maximum impact, here's my recommended order for implementation:

### Phase 1: Core Enhancements (1-2 weeks)

1. **Resource System** - Makes classes unique, adds strategic depth
2. **Enemy Intent Preview** - Huge QoL improvement, reduces frustration
3. **Sound Effects & Basic Animations** - Professional polish

### Phase 2: Content Expansion (2-3 weeks)

4. **More Cards** (15-20 per class) - Increases deck variety and replayability
5. **New Monsters & Rounds** - Extends gameplay time
6. **Card Synergies** - Rewards creative deck building

### Phase 3: Progression Systems (2-3 weeks)

7. **Achievement System** - Goals to work towards
8. **Meta-Progression** (Unlockables) - Keeps players coming back
9. **Save System** - Don't lose progress

### Phase 4: Advanced Features (3-4 weeks)

10. **Difficulty Modes** - Caters to different skill levels
11. **Card Upgrades & Events** - Adds roguelike depth
12. **Relic System** - Run variety and build diversity

### Phase 5: Polish & Extras (Ongoing)

13. **Performance Optimization** - Smooth experience
14. **Mobile Support** - Reach more players
15. **Story/Lore** - Emotional investment

---

## Current State Summary

### What's Working Great ✅

- Clean, maintainable codebase
- Solid turn-based combat system
- 8 classes with unique card pools
- 80 cards with diverse effects
- Functional aggro system
- Complete buff/debuff system
- 3-round campaign with bosses
- Professional UI/UX

### Quick Wins for Maximum Impact 🎯

1. Add resource costs to cards (makes classes feel unique)
2. Show enemy intent (what monster will do next turn)
3. Add sound effects (huge atmosphere boost)
4. Expand to 15 cards per class (more variety)
5. Implement save system (don't lose progress)

### Future Vision 🔮

Paper Dungeon has the foundation to become a deep, replayable tactical card game with:

- Meaningful class differentiation through resources
- Strategic deck building with synergies
- Endless replayability through roguelike elements
- Competitive leaderboards and challenges
- A vibrant meta that evolves with balance updates

The core is solid - now it's about adding depth, content, and polish!

---

## ✅ COMPLETED - High Impact, Low Effort

### 1. Visual & UX Polish ✅

#### Card Play Animations ✅

- ~~Add scale/fade animation when cards are played~~ ✅
- ~~Smooth transition from hand to discard pile~~ ✅
- ~~Glow effect on selected card~~ ✅ (Pulsing amber glow)

#### Health Bar Animations ✅

- ~~Smooth transitions when HP changes~~ ✅ (CSS transitions)
- ~~Pulsing animation when low HP~~ ✅ (Below 25% HP)

#### Monster Attack Indicator ✅

- ~~Highlight which player will be targeted based on current aggro~~ ✅ (Red "TARGET" badge + pulse animation)
- ~~Visual indicator for AOE attacks~~ ✅ (Shown in intent preview)

### 2. Better Feedback Systems ✅

#### Turn Timer/Progress Indicator ✅

- ~~Visual representation of current phase~~ ✅ (Draw → Select → Roll → Attack → Enemy)
- ~~Progress bar showing turn flow~~ ✅ (Color-coded: amber active, green completed)
- ~~Highlight active player more prominently~~ ✅ (Amber border + shadow)

#### Enemy Intent Preview ✅

- ~~Show what ability each monster rolled before it executes~~ ✅
- ~~Display damage values and targets~~ ✅
- ~~Icon indicators for buff/debuff abilities~~ ✅ (⚔️ damage, 💀 debuff, 💨 nothing)

#### Tooltip Improvements ✅

- ~~Comprehensive hover tooltips for status effects~~ ✅
- ~~Explain exactly what each debuff does~~ ✅
- ~~Show remaining duration and stack count~~ ✅

#### Dice Roll Animation ✅ (NEW)

- Manual aggro roll with animated D20 dice overlay
- Shows rolling animation for 1.5 seconds
- Displays final result before playing card

#### Stacked Action Messages ✅ (NEW)

- Color-coded floating messages (red=damage, green=heal, purple=debuff, amber=action)
- Messages stack vertically with new ones appearing at bottom
- Old messages fade out after 5 seconds
- Delays between actions for better readability

### 3. Quality of Life ✅

#### Speed Up Options ✅ (NEW)

- ~~Fast-forward through monster turns~~ ✅ (3 speed modes: 1x, 2.5x, instant)
- ~~Skip animations toggle~~ ✅ (Toggle in speed settings dropdown)
- ~~Quick combat mode~~ ✅ (Instant mode skips all delays)

#### Quick Restart ✅ (NEW)

- ~~"Play Again" button on victory/defeat that uses same party~~ ✅
- ~~"Try Different Classes" for full reset~~ ✅
- ~~Save last party composition~~ ✅ (Shows party names on restart screens)

#### Damage Numbers ✅ (NEW)

- ~~Floating damage numbers that appear when attacks hit~~ ✅
- ~~Color-coded: red for damage, green for healing, blue for shields~~ ✅
- ~~Fade out animation~~ ✅

### 4. Resource System Implementation ✅ (NEW)

Currently classes have resources defined but don't use them. Full implementation includes:

#### Resource Generation ✅

- Gain X resource each turn automatically (Mage: 2 Arcane/turn, Barbarian: based on HP%)
- Some cards generate extra resource (Rogue: 1 Combo per card, etc.)
- Resource persists between rounds

#### Resource Display ✅

- Resource bar shown under HP in player cards
- Color-coded per class
- Glow animation when resource is full

#### Class-Specific Resource Mechanics ✅

**Warrior - Rage (10 max)** ✅

- Gain Rage from taking damage (1-2 per hit)
- Gain Rage from dealing damage (1 per attack)
- High-cost abilities for burst damage (future)

**Rogue - Combo Points (5 max)** ✅

- Gain Combo from playing cards (1 per card)
- Combo resets when targeting different enemy (future)

**Mage - Arcane (12 max)** ✅

- Regenerate 2 Arcane per turn
- Big spells cost 8-10 Arcane (future)

**Paladin - Faith (8 max)** ✅

- Gain Faith from healing allies (2 per heal)
- Spend Faith for shields and buffs (future)
- Faith-powered resurrections (future)

**Priest - Devotion (10 max)** ✅

- Gain from healing
- Powerful heals cost Devotion (future)
- Buff abilities require Devotion (future)

**Bard - Melody (6 max)** ✅

- Gain from buffing allies
- Songs have ongoing costs (future)
- Combo effects with other heroes' actions (future)

**Archer - Focus (8 max)** ✅

- Gain Focus passively (1 per turn)
- Lose Focus when hit
- Precise shots consume Focus (future)

**Barbarian - Fury (10 max)** ✅

- Gain Fury from low HP (more at lower HP%)
- More Fury = more damage (future)
- Berserker state at max Fury (future)

---

## 🔮 Resource Spending ✅ (NEW)

When resource bar is full, players can choose to:

### Special Abilities ✅

Each class has a unique special ability that costs full resource bar:

- **Warrior**: Berserker Strike - 25 damage to all enemies
- **Rogue**: Assassinate - 40 damage + stealth
- **Paladin**: Divine Shield - 15 shield to all allies
- **Mage**: Arcane Blast - 35 damage to all enemies
- **Priest**: Mass Heal - 20 HP heal + cleanse all allies
- **Bard**: Battle Hymn - +5 strength to all allies (3 turns)
- **Archer**: Piercing Shot - 30 damage to all enemies
- **Barbarian**: Rampage - 20 damage to all + self heal 10

### Card Enhancement ✅

Spend full resource bar to enhance a card's effects:

- Each class has different enhancement bonuses
- Damage, healing, and shield values are boosted
- Visual indicator shows enhanced cards

---

### 5. Expanded Content ✅ (NEW)

#### More Rounds (6 total) ✅

- **Round 1**: The Dark Passage - Tier 1 monsters (2 random)
- **Round 2**: The Haunted Halls - Tier 1-2 monsters (2 random)
- **Round 3**: The Chamber of Horrors - Tier 2-3 monsters (2 random)
- **Round 4**: The Lich King's Crypt - Lich King boss + Tier 3 monster
- **Round 5**: The Demon Gate - Demon Lord boss + Tier 4 monster
- **Round 6**: The Dragon's Lair - Ancient Dragon final boss

#### Randomized Encounters ✅

- Each playthrough has different monster combinations
- Monsters selected randomly from tier pools
- Multiple round descriptions for variety
- No two games are exactly the same!

#### New Monster Types (12 new enemies) ✅

**Tier 1 (Early Game)**

- **Imp** (25 HP) - Fast attacker, fire damage
- **Slime** (50 HP) - Acid attacks, self-healing
- **Wraith** (40 HP) - Life drain, fear aura

**Tier 2 (Mid Game)**

- **Necromancer** (60 HP) - Dark magic, curses
- **Gargoyle** (80 HP) - Stone form healing, stuns
- **Banshee** (55 HP) - Fear debuffs, soul screams
- **Mimic** (70 HP) - Copies attacks, disguise

**Tier 3 (Late Game)**

- **Elemental** (90 HP) - Multi-element attacks

**Tier 4 (Elite)**

- **Hydra** (120 HP) - Multi-head attacks, regeneration
- **Demon** (150 HP) - Hellfire, curses

**Bosses**

- **Lich King** (200 HP) - Undead master, plague, frost
- **Demon Lord** (280 HP) - Ultimate demon, armageddon

#### Elite Enemy Modifiers ✅

Random chance for monsters to spawn with elite modifiers (15-35% based on round):

- **⚡ Fast**: Acts twice per turn
- **🛡️ Armored**: +50% HP, 25% damage reduction
- **🔥 Enraged**: +50% damage dealt
- **💚 Regenerating**: Heals 10 HP per turn
- **💀 Cursed**: Applies random debuffs to attackers
- **🔰 Shielded**: Has shield that regenerates each turn

Elite modifiers are displayed with colored badges on monster cards.

#### More Cards Per Class (15 total) ✅

Each class now has 15 cards (up from 10):

- 10 base cards (common to rare)
- 5 advanced cards (uncommon to legendary)
- More situational/combo cards
- Better variety for deck building
