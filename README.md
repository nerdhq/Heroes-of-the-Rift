# Heroes of the Rift

A co-op card dungeon crawler web game built with React, TypeScript, and Zustand.

**Play Now:** [https://nerdhq.github.io/Heroes-of-the-Rift/](https://nerdhq.github.io/Heroes-of-the-Rift/)

## Features

- **Champion System**: Create persistent characters that level up and grow stronger
- **6 Core Attributes**: STR, AGI, CON, INT, WIS, LCK - each scaling different combat effects
- **Up to 5 Heroes**: Choose from 8 classes including Warrior, Rogue, Paladin, Mage, Priest, Bard, Archer, and Barbarian
- **Deck Building**: Build your deck from cards you own and earn
- **Turn-based Combat**: Strategic card-based gameplay with D20/D6 dice mechanics
- **Aggro System**: D20 rolls determine monster targeting
- **Buffs & Debuffs**: Poison, burn, ice, stun, stealth, taunt, and more
- **Monster AI**: D6 roll tables determine monster actions
- **Online Multiplayer**: Play with friends via Supabase backend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

## Champion Progression System

Champions are persistent characters that gain XP, level up, and allocate stat points. Each champion is locked to their chosen class.

### Attributes

| Stat | Name         | Effect                                                  |
| ---- | ------------ | ------------------------------------------------------- |
| STR  | Strength     | +3% physical damage per point above 10                  |
| AGI  | Agility      | +0.5% dodge chance per point above 10                   |
| CON  | Constitution | +2 max HP per point, +2.5% shield effectiveness         |
| INT  | Intelligence | +4% spell damage per point above 10                     |
| WIS  | Wisdom       | +3.5% healing per point, +1 buff duration per 10 points |
| LCK  | Luck         | 5% base crit chance + 0.5% per point                    |

### Stat Scaling

- All stats start at 10 (baseline, no bonus)
- Stats 11-50: Cost 1 point each
- Stats 51-99: Cost 2 points each (soft cap)
- Hard cap: 99

### XP and Leveling

**XP from Monsters:**

- Tier 1 (Goblin, Skeleton): 15-25 XP
- Tier 2 (Werewolf, Necromancer): 35-50 XP
- Tier 3 (Troll, Vampire): 55-75 XP
- Tier 4 (Hydra, Demon): 90-120 XP
- Bosses: 200-500 XP

**Stat Points per Level:**

- Levels 1-10: 3 points per level
- Levels 11-20: 2 points per level
- Levels 21+: 1 point per level

### Per-Champion Economy

Each champion has their own:

- Gold balance
- Owned cards collection
- Lifetime statistics

## Game Mechanics

### Turn Structure

1. **DRAW PHASE**: Draw 2 cards
2. **SELECT PHASE**: Pick 1 card to play
3. **AGGRO PHASE**: Roll D20 for aggro (determines targeting)
4. **PLAYER ACTION PHASE**: Apply card effects
5. **MONSTER ACTION PHASE**: Monster rolls D6 and acts
6. **DEBUFF RESOLUTION**: Tick DOTs (poison, burn, ice)
7. **END TURN**: Move to next player or turn

### Classes

| Class     | HP  | Resource | Playstyle                |
| --------- | --- | -------- | ------------------------ |
| Warrior   | 120 | Rage     | Tank, high damage        |
| Rogue     | 80  | Combo    | Stealth, poison          |
| Paladin   | 100 | Faith    | Heals, shields           |
| Mage      | 70  | Arcane   | AOE damage, debuffs      |
| Priest    | 90  | Holy     | Healing, buffs           |
| Bard      | 85  | Rhythm   | Support, buffs           |
| Archer    | 75  | Focus    | Ranged damage            |
| Barbarian | 130 | Fury     | High damage, low defense |

### Aggro System

- **Base Aggro**: 0-5 from card played
- **Dice Aggro**: D20 roll each turn
- **Total Aggro** = Base + Dice
- Monster targets highest aggro (unless taunt/stealth)

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool
- **Supabase** - Backend (auth, database, realtime)

## Project Structure

```
src/
├── components/         # React components
│   ├── TitleScreen.tsx
│   ├── ChampionSelectScreen.tsx
│   ├── ChampionCreateScreen.tsx
│   ├── StatAllocationScreen.tsx
│   ├── DeckBuilderScreen.tsx
│   ├── GameScreen.tsx
│   ├── VictoryScreen.tsx
│   └── DefeatScreen.tsx
├── data/               # Game data
│   ├── cards.ts        # Card definitions
│   ├── classes.ts      # Class configs
│   └── monsters.ts     # Monster templates
├── store/              # Zustand store
│   ├── gameStore.ts    # Combined store
│   └── slices/         # State slices
│       ├── progressionSlice.ts
│       ├── combatSlice.ts
│       └── ...
├── lib/                # Utilities
│   └── supabase.ts     # Supabase client
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx             # Main app component
```

## Roadmap

- [x] Core combat systems
- [x] 8 playable classes
- [x] Buffs & Debuffs
- [x] Aggro System
- [x] Champion progression (XP, levels, stats)
- [x] Per-champion economy (gold, cards)
- [x] Online multiplayer
- [ ] Boss encounters
- [ ] Achievement system
- [ ] Leaderboards

## License

MIT
