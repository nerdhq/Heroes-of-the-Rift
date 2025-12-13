# Paper Dungeon - Application Overview

**Version**: 1.0.0
**Last Updated**: December 12, 2025

---

## Table of Contents

1. [What is Paper Dungeon?](#what-is-paper-dungeon)
2. [Core Features](#core-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Game Mechanics](#game-mechanics)
6. [Architecture & Design Patterns](#architecture--design-patterns)
7. [Component Hierarchy](#component-hierarchy)
8. [Key Systems](#key-systems)
9. [Code Metrics](#code-metrics)

---

## What is Paper Dungeon?

**Paper Dungeon** is a **cooperative, turn-based card dungeon crawler** built as a web application. It's designed for 1-5 players who work together to defeat increasingly powerful monsters across 6 rounds, culminating in an epic battle against the Ancient Dragon.

### Core Premise

- **Setting**: A dungeon made entirely of paper (thematic tie-in to art style)
- **Objective**: Assemble a party of heroes and defeat progressively harder enemies
- **Player Count**: 1-5 heroes working cooperatively
- **Gameplay Style**: Turn-based tactical card game with roguelike elements

---

## Core Features

### 1. Hero System (8 Classes)

Each class has unique mechanics and playstyles:

| Class | Resource | Max Resource | Playstyle |
|-------|----------|--------------|-----------|
| **Warrior** | Rage | 10 | Aggressive tank, generates rage from combat |
| **Rogue** | Combo Points | 5 | Momentum-based damage dealer |
| **Paladin** | Faith | 8 | Holy warrior with shields and healing |
| **Mage** | Arcane | 12 | Spellcaster with passive mana regeneration |
| **Priest** | Devotion | 10 | Support healer with cleanse abilities |
| **Bard** | Melody | 6 | Buffer with party-wide effects |
| **Archer** | Focus | 8 | Ranged DPS with precision mechanics |
| **Barbarian** | Fury | 10 | Berserker with risk/reward gameplay |

### 2. Card System (120 Total Cards)

- **15 cards per class** (120 total unique cards)
- **5-card starting decks** built from available pool
- **Rarity tiers**: Common, Uncommon, Rare, Legendary
- **15 effect types**: Damage, Heal, Shield, Cleanse, Stealth, Block, Strength, Revive, Poison, Burn, Ice, Weakness, Stun, Taunt, Disable

### 3. Combat System

#### Turn Phases

1. **DRAW**: Draw 2 cards
2. **SELECT**: Choose card to play
3. **TARGET_SELECT**: Pick target if needed
4. **AGGRO**: Roll D20 dice for aggro calculation
5. **PLAYER_ACTION**: Apply card effects
6. **MONSTER_ACTION**: Monsters execute abilities
7. **DEBUFF_RESOLUTION**: Tick damage-over-time effects
8. **END_TURN**: Cleanup and next player

#### Aggro/Targeting Mechanics

- **Base Aggro**: 0-5 from card selection
- **Dice Aggro**: D20 roll (1-20)
- **Total Aggro**: Determines monster targeting
- **Modifiers**: Taunt (forces target), Stealth (prevents target)

### 4. Campaign Structure (6 Rounds)

| Round | Name | Encounter |
|-------|------|-----------|
| 1 | The Dark Passage | 2 random Tier 1 monsters |
| 2 | The Haunted Halls | 2 random Tier 1-2 monsters |
| 3 | The Chamber of Horrors | 2 random Tier 2-3 monsters |
| 4 | The Lich King's Crypt | Lich King + 1 Tier 3 elite |
| 5 | The Demon Gate | Demon Lord + 1 Tier 4 elite |
| 6 | The Dragon's Lair | Ancient Dragon (final boss) |

### 5. Monster System (18+ Enemy Types)

**Tier Distribution**:
- **Tier 1**: Goblin, Imp, Skeleton, Slime, Wraith (5 types)
- **Tier 2**: Necromancer, Gargoyle, Banshee, Mimic, Werewolf (5 types)
- **Tier 3**: Troll, Vampire, Elemental (3 types)
- **Tier 4**: Hydra, Demon, Cerberus (3 types)
- **Bosses/Elites**: Lich King, Demon Lord, Ancient Dragon, Dark Knight, Orc Warlord (5 types)

**Elite Modifiers** (15-35% spawn chance):
- ⚡ **Fast**: Acts twice per turn
- 🛡️ **Armored**: +50% HP, 25% damage reduction
- 🔥 **Enraged**: +50% damage dealt
- 💚 **Regenerating**: Heals 10 HP per turn
- 💀 **Cursed**: Applies random debuffs to attackers
- 🔰 **Shielded**: Has regenerating shield

### 6. Resource & Enhancement System

- **Resource Generation**: Unique to each class (combat actions, passive, conditional)
- **Special Abilities**: Unlock powerful moves when resource is full
- **Card Enhancement**: Spend full resource bar to boost card effects (+8 to +12 damage/healing)

### 7. Progression Systems

- **Between-Round Rewards**: Pick 1 card from 3 random options
- **Health Recovery**: Heal 50% of missing HP each round
- **Dynamic Deck Building**: Expand deck throughout the run

### 8. Visual Polish

- **Animated D20 Dice Roll**: 1.5-second manual aggro animation
- **Floating Damage Numbers**: Color-coded (red=damage, green=heal, blue=shield)
- **Action Messages**: Stacked, floating combat feedback
- **Health Bar Animations**: Smooth transitions with low-HP pulse
- **Monster Intent Preview**: See upcoming abilities
- **Battle Log**: Comprehensive turn-by-turn history

### 9. Speed Controls

- **1x (Normal)**: Standard gameplay
- **2.5x (Fast)**: Accelerated animations
- **Instant**: Skip all delays

---

## Technology Stack

### Frontend Framework
- **React 19.0.2**: Latest React with concurrent features
- **TypeScript 5.9.3**: Type-safe development

### State Management
- **Zustand 5.0.9**: Lightweight state management
  - Single store pattern (`useGameStore`)
  - 2,351 lines of game logic

### Styling
- **Tailwind CSS 4.0.0**: Utility-first CSS framework
- **@tailwindcss/vite**: Vite integration
- Custom paper-themed color palette (stone, amber, gradients)

### UI & Icons
- **Lucide React 0.468.0**: Icon library (Sword, Shield, Scroll, Trophy, etc.)

### Build Tools
- **Vite 7.0.2**: Next-generation build tool
- **@vitejs/plugin-react**: JSX transformation
- Fast HMR and optimized production builds

### Development Tools
- **ESLint 9.39.1**: Code quality
- **@eslint/js**, **typescript-eslint**: TypeScript linting
- **eslint-plugin-react-hooks**: React hooks validation
- **eslint-plugin-react-refresh**: Fast refresh support

---

## Project Structure

```
paper-dungeon/
├── public/                          # Static assets
│   ├── vite.svg
│   └── [18+ monster PNG images]
│
├── src/
│   ├── components/                  # React components
│   │   ├── game/                    # Game subcomponents (13 files)
│   │   │   ├── PlayerCard.tsx       # Hero display with HP/resources
│   │   │   ├── MonsterCard.tsx      # Enemy display with intent
│   │   │   ├── HealthBar.tsx        # HP/shield bars
│   │   │   ├── StatusEffects.tsx    # Buff/debuff icons
│   │   │   ├── CardHand.tsx         # Card selection UI
│   │   │   ├── BattleLog.tsx        # Action history sidebar
│   │   │   ├── ActionMessages.tsx   # Floating combat text
│   │   │   ├── FloatingDamageNumbers.tsx  # Damage popups
│   │   │   ├── DiceRollOverlay.tsx  # D20 roll animation
│   │   │   ├── GameHeader.tsx       # Round/turn display
│   │   │   ├── TopControls.tsx      # Control buttons
│   │   │   ├── SpeedSettings.tsx    # Game speed modal
│   │   │   └── QuitConfirmModal.tsx # Quit confirmation
│   │   ├── TitleScreen.tsx          # Main menu
│   │   ├── ClassSelectScreen.tsx    # Hero selection (1-5 heroes)
│   │   ├── DeckBuilderScreen.tsx    # 5-card deck creation
│   │   ├── GameScreen.tsx           # Main combat interface
│   │   ├── CardRewardScreen.tsx     # Post-round card selection
│   │   ├── VictoryScreen.tsx        # Campaign win screen
│   │   ├── DefeatScreen.tsx         # Campaign loss screen
│   │   └── HelpModal.tsx            # Game guide
│   │
│   ├── data/                        # Game configuration
│   │   ├── classes.ts               # Class configs (140 lines)
│   │   ├── cards.ts                 # Card definitions (1,350 lines)
│   │   └── monsters.ts              # Monster templates & rounds (1,557 lines)
│   │
│   ├── store/                       # State management
│   │   └── gameStore.ts             # Zustand store (2,351 lines)
│   │
│   ├── assets/                      # Image assets
│   │   └── monsters/                # Monster images & exports
│   │       └── index.ts
│   │
│   ├── types/                       # TypeScript definitions
│   │   └── index.ts                 # All game types & interfaces
│   │
│   ├── App.tsx                      # Root component with routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint rules
├── README.md                        # User documentation
└── IMPROVEMENTS.md                  # Feature roadmap
```

---

## Game Mechanics

### 1. Resource Generation System

Each class generates resources differently, creating unique playstyles:

- **Warrior (Rage)**: +1-2 per hit taken, +1 per attack
- **Rogue (Combo)**: +1 per card played
- **Mage (Arcane)**: +2 per turn (passive regeneration)
- **Paladin (Faith)**: +2 per healing action
- **Priest (Devotion)**: +2 per healing action
- **Bard (Melody)**: +1 per buff application
- **Archer (Focus)**: +1 per turn (passive), -X when hit
- **Barbarian (Fury)**: Scales with HP% (more when desperate)

### 2. Dice System

- **D20 (Aggro Roll)**: Determines monster targeting (1-20)
- **D6 (Monster Intent)**: Determines monster ability (1-6)
- **Pre-rolled Intents**: Shown before monster acts for tactical planning

### 3. Targeting Mechanics

- **Single Target**: Highest aggro (visible, non-stealthed) player
- **AOE (All Targets)**: Hits all players except stealthed
- **Random Targets**: Random visible player
- **Taunt Override**: Forces monster to target taunting player
- **Stealth Evasion**: Cannot be targeted while stealthed

### 4. Status Effect System

**Duration-Based Effects**:
- **Poison/Burn/Ice**: Damage-over-time (ticks each turn)
- **Stun**: Prevents actions
- **Weakness**: Reduces damage output
- **Stealth**: Avoids targeting
- **Taunt**: Forces targeting
- **Strength**: Increases damage
- **Shield**: Absorbs incoming damage

**Stacking**: Multiple instances of same effect can stack

### 5. Card Rarity Distribution

Per class (15 cards):
- ~7 **Common**: Basic effects, reliable
- ~5 **Uncommon**: Situational or combo cards
- ~2 **Rare**: Powerful single-use effects
- ~1 **Legendary**: High-impact game-changers

### 6. Between-Round Recovery

- **Health**: Heal 50% of missing HP
- **Deck**: Discard shuffled back into deck
- **Resources**: Reset to 0 (with some passive generation)
- **Rewards**: Choose 1 card from 3 random options

---

## Architecture & Design Patterns

### 1. State Management (Zustand)

**Single Store Pattern**:
```typescript
const useGameStore = create<GameStore>((set, get) => ({
  // State
  screen: "title",
  gamePhase: "draw",
  players: [],
  monsters: [],

  // Actions
  startGame: () => { /* ... */ },
  playCard: async () => { /* ... */ },
  nextTurn: async () => { /* ... */ },

  // Derived State
  needsTargetSelection: () => { /* ... */ },
  canUseSpecialAbility: (playerId) => { /* ... */ },
}));
```

**Benefits**:
- Single source of truth
- Minimal boilerplate
- Easy async operations
- Derived state calculations

### 2. Async Game Loop with Delays

```typescript
const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, get().getDelay(ms)));

// Usage
await delay(1000); // Respects speed settings
```

**Pattern**: Sequential async operations
- Allows animations to complete
- Respects game speed (1x, 2.5x, instant)
- Prevents visual race conditions

### 3. Immutable State Updates

```typescript
const updatedPlayers = [...players];
updatedPlayers[index] = { ...updatedPlayers[index], hp: newHp };
set({ players: updatedPlayers });
```

**Benefits**:
- Prevents mutation bugs
- Zustand detects changes properly
- Predictable state flow
- Easy debugging

### 4. Effect-Driven Card System

```typescript
interface Card {
  id: string;
  name: string;
  effects: Array<{
    type: EffectType;        // "damage" | "heal" | "shield" | ...
    value?: number;
    target: TargetType;      // "self" | "ally" | "monster" | "all"
    duration?: number;
  }>;
}
```

**Benefits**:
- Cards are pure data
- Easy to add new effects
- Flexible targeting system
- No hard-coded card logic

### 5. Template-Based Monster Creation

```typescript
interface MonsterTemplate {
  id: string;
  name: string;
  baseHp: number;
  abilities: MonsterAbility[];
}

function createMonster(templateId: string): Monster {
  // Apply elite modifiers, randomize hp, etc.
}
```

**Benefits**:
- Templates are immutable
- Runtime instances have variability
- Elite modifiers add randomness
- Enables replay with different monsters

### 6. Screen-Based Navigation

```typescript
type ScreenType =
  | "title"
  | "classSelect"
  | "deckBuilder"
  | "game"
  | "cardReward"
  | "victory"
  | "defeat";
```

**Pattern**: Conditional rendering from root
- Each screen is isolated component
- State stored in Zustand
- Easy to add new screens

### 7. Configuration Objects

```typescript
export const CLASS_CONFIGS: Record<ClassType, ClassConfig> = {
  warrior: {
    name: "Warrior",
    resourceType: "Rage",
    maxResource: 10,
    // ...
  },
  // ...
};
```

**Benefits**:
- Centralized game balance
- Single source of truth
- Easy to export for tools
- Type-safe configuration

### 8. Battle Log System

```typescript
type LogEntry = {
  turn: number;
  phase: GamePhase;
  message: string;
  type: "info" | "damage" | "heal" | "buff" | "debuff" | "roll" | "action";
  isSubEntry?: boolean;
};
```

**Benefits**:
- Comprehensive turn-by-turn history
- Categorized for filtering
- Helpful for debugging
- Improves player understanding

---

## Component Hierarchy

```
App.tsx (Routes based on store.screen)
│
├─ TitleScreen
│
├─ ClassSelectScreen
│
├─ DeckBuilderScreen
│
├─ GameScreen (Main game loop)
│  ├─ GameHeader (Round/turn info)
│  ├─ TopControls (Speed, help, quit)
│  ├─ PlayerCard[] (Heroes)
│  │  ├─ HealthBar
│  │  └─ StatusEffects
│  ├─ MonsterCard[] (Enemies)
│  │  ├─ HealthBar
│  │  └─ StatusEffects
│  ├─ CardHand (Card selection)
│  ├─ ActionMessages (Floating text)
│  ├─ FloatingDamageNumbers
│  ├─ DiceRollOverlay (D20 animation)
│  ├─ BattleLog (Sidebar)
│  ├─ SpeedSettings (Modal)
│  ├─ QuitConfirmModal
│  └─ HelpModal
│
├─ CardRewardScreen
│
├─ VictoryScreen
│
└─ DefeatScreen
```

---

## Key Systems

### Game Loop Flow

```
START_GAME → Initialize party, deck, round 1
  ↓
DRAW → Draw 2 cards
  ↓
SELECT → Player chooses card
  ↓
TARGET_SELECT (conditional) → Choose target if needed
  ↓
AGGRO → Roll D20 for aggro
  ↓
PLAYER_ACTION → Execute card effects
  ↓
  ├─ Check victory (all monsters dead)
  └─ Next player or...
  ↓
MONSTER_ACTION → Each monster acts
  ↓
  ├─ Check defeat (all players dead)
  └─ Continue or...
  ↓
DEBUFF_RESOLUTION → Tick damage-over-time
  ↓
END_TURN → Cleanup, next turn
  ↓
(Loop until round victory/defeat)
  ↓
CARD_REWARD → Choose 1 from 3 cards
  ↓
NEXT_ROUND → Heal 50% HP, next round
  ↓
(Repeat for 6 rounds)
  ↓
VICTORY or DEFEAT
```

### Card Execution Pipeline

```
1. selectCard(cardId)
   - Store selected card ID
   - Check if target needed

2. confirmTarget(targetId) [if needed]
   - Store target ID
   - Proceed to dice roll

3. startDiceRoll()
   - Animate D20 roll (1.5s)
   - Calculate total aggro

4. playCard()
   - For each effect in card:
     - Apply damage/heal/shield/buff/debuff
     - Generate floating messages
     - Update player resources
   - Move card to discard
   - Check for victory
   - Proceed to next phase

5. nextPhase()
   - Advance to monster action or next player
```

### Monster AI Flow

```
1. rollMonsterIntents()
   - Each monster rolls D6
   - Determines which ability to use
   - Store intent for display

2. monsterAct()
   For each alive monster:
     - Check for stun/disable (skip if true)
     - Determine targets:
       - If taunted: target taunter
       - If AOE: all visible players
       - If single: highest aggro visible player
       - If random: random visible player
     - Apply ability effects
     - Generate floating messages
     - Check elite modifier behaviors

3. Check defeat condition
   - If all players dead → DEFEAT screen
   - Otherwise → continue
```

---

## Code Metrics

| Aspect | Count |
|--------|-------|
| **Total TypeScript Files** | ~30 files |
| **React Components** | 21 components |
| **Playable Classes** | 8 classes |
| **Total Cards** | 120 cards (15 per class) |
| **Monster Types** | 18+ types |
| **Elite Modifiers** | 6 types |
| **Status Effect Types** | 15+ effects |
| **Game Phases** | 8 phases |
| **Campaign Rounds** | 6 rounds |
| **Monster Images** | 18+ PNG sprites |
| **Store Logic** | 2,351 lines |
| **Monster Data** | 1,557 lines |
| **Card Data** | 1,350 lines |
| **Total Game Logic** | ~5,258 lines |

---

## Key Files Reference

| File | Purpose | Size | Key Exports |
|------|---------|------|-------------|
| `store/gameStore.ts` | All game logic, state, actions | 2,351 lines | `useGameStore` |
| `data/monsters.ts` | Monster templates, round configs | 1,557 lines | `MONSTER_TEMPLATES`, `ROUND_CONFIGS` |
| `data/cards.ts` | Card definitions for all classes | 1,350 lines | `CARD_DATA` |
| `data/classes.ts` | Class configurations | ~140 lines | `CLASS_CONFIGS` |
| `types/index.ts` | TypeScript interfaces | ~350 lines | All game types |
| `GameScreen.tsx` | Main game UI orchestration | ~300 lines | `GameScreen` component |
| `App.tsx` | Root routing component | 27 lines | `App` component |

---

## Interesting Implementation Details

### 1. Turn Resolution Order
- All players act before monsters
- Monsters see current aggro state
- Debuffs tick AFTER monster action (prevents instant poison death)

### 2. Aggro Calculation
- Base (0-5) + D20 Roll (1-20) = Total Aggro
- Taunt overrides aggro completely
- Stealth prevents targeting regardless of aggro
- AOE ignores aggro system

### 3. Resource as Skill Expression
- **Rage**: Reactive (combat-based)
- **Combo**: Momentum (card flow)
- **Arcane**: Mana-like (passive)
- **Faith**: Support (helping others)
- **Fury**: Risk/reward (desperate power)

### 4. Elite Modifier Combinations
Modifiers can create emergent difficulty:
- Fast + Enraged = Overwhelming damage
- Armored + Regenerating = War of attrition
- Cursed + Shielded = Dangerous to attack

### 5. Speed-Aware Animation System
```typescript
const getDelay = (baseMs: number): number => {
  if (gameSpeed === "instant") return 0;
  if (gameSpeed === "fast") return baseMs / 2.5;
  return baseMs;
};
```
All delays scale with speed setting.

### 6. Victory/Defeat Checks
- Victory checked after each card effect
- Defeat checked after monster action phase
- Prevents redundant turn phases

### 7. Deck Cycling
```typescript
if (deck.length === 0 && discard.length > 0) {
  deck = shuffleArray(discard);
  discard = [];
}
```
Automatic reshuffle ensures continuous play.

### 8. Hand Limit Flexibility
- No maximum hand size
- Allows strategic card hoarding
- No artificial penalties

### 9. Party Composition Freedom
- 1-5 heroes of any class
- Allows duplicate classes
- Enables specialized team comps (all-Mage party, etc.)

---

## Summary

**Paper Dungeon** is a polished, feature-complete cooperative card game with:

- **Solid Technical Foundation**: React 19 + TypeScript + Zustand + Tailwind
- **Deep Game Systems**: Resources, aggro, status effects, elite modifiers
- **Strategic Depth**: 8 classes, 120 cards, 18+ monsters, 6 elite modifiers
- **Visual Polish**: Animations, floating feedback, speed controls, battle log
- **Scalable Design**: Data-driven cards, monsters, and rounds
- **Type-Safe Codebase**: Comprehensive TypeScript types throughout
- **Accessible Architecture**: Clear separation of concerns, well-organized

The game is production-ready and has a clear roadmap for enhancements (see `IMPROVEMENTS.md`).

---

**For More Information**:
- Game design details: `README.md`
- Future features: `IMPROVEMENTS.md`
- Development: `package.json` scripts
