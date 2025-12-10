# Paper Dungeon 🎮

A co-op card dungeon crawler web game built with React, TypeScript, and Zustand.

## Features

- **Up to 5 Heroes**: Choose from Warrior, Rogue, Paladin, and Mage classes
- **Deck Building**: Select 5 cards from a pool of 10 to form your starting deck
- **Turn-based Combat**: Strategic card-based gameplay with D20/D6 dice mechanics
- **Aggro System**: D20 rolls determine monster targeting
- **Buffs & Debuffs**: Poison, burn, ice, stun, stealth, taunt, and more
- **Monster AI**: D6 roll tables determine monster actions

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

| Class   | HP  | Resource | Playstyle           |
| ------- | --- | -------- | ------------------- |
| Warrior | 120 | Rage     | Tank, high damage   |
| Rogue   | 80  | Combo    | Stealth, poison     |
| Paladin | 100 | Faith    | Heals, shields      |
| Mage    | 70  | Arcane   | AOE damage, debuffs |

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

## Project Structure

```
src/
├── components/       # React components
│   ├── TitleScreen.tsx
│   ├── ClassSelectScreen.tsx
│   ├── DeckBuilderScreen.tsx
│   ├── GameScreen.tsx
│   ├── VictoryScreen.tsx
│   └── DefeatScreen.tsx
├── data/            # Game data
│   ├── cards.ts     # Card definitions
│   ├── classes.ts   # Class configs
│   └── monsters.ts  # Monster templates
├── store/           # Zustand store
│   └── gameStore.ts # Game state & logic
├── types/           # TypeScript types
│   └── index.ts
└── App.tsx          # Main app component
```

## Roadmap

- [x] Phase 1: Core Systems
- [x] Phase 2: Class Decks (4 classes)
- [x] Phase 3: Buffs & Debuffs
- [x] Phase 4: Aggro System
- [ ] Phase 5: Additional Classes (Priest, Bard, Archer, Barbarian)
- [ ] Phase 5: Additional Monsters
- [ ] Level progression
- [ ] Save/Load system
- [ ] Multiplayer support

## License

MIT
