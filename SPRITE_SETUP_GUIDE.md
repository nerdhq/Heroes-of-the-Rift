# CSS Sprite Animation Setup Guide

## 📁 Step 1: Get Sprite Sheets

You need sprite sheets for each character. Here's where to find them:

### Free Resources

#### Option A: LPC (Liberated Pixel Cup) - Best for RPG ⭐⭐⭐⭐⭐
1. Go to https://lpc.opengameart.org/
2. Click "LPC Character Generator"
3. Create your character:
   - Select body type
   - Choose equipment (armor, weapons)
   - Pick animations (walk, slash, hurt, die)
4. Download sprite sheet (PNG format)
5. The generator creates all frames automatically!

**Characters you can make**: Warrior, Rogue, Mage, Archer, etc.

#### Option B: itch.io Game Assets
1. Go to https://itch.io/game-assets/free/tag-character
2. Search for "RPG character sprite"
3. Download packs with animations

**Recommended packs**:
- "Tiny RPG Character Asset Pack" (Free/Paid versions)
- "16x16 Fantasy RPG Characters"
- "Rogue Fantasy Catacombs"

#### Option C: OpenGameArt
1. Go to https://opengameart.org/
2. Search "character sprite sheet animation"
3. Filter by license: CC0 (public domain)

### Sprite Sheet Requirements

Each character needs these animations:

```
✅ idle.png     - 4-8 frames (gentle breathing/bobbing)
✅ attack.png   - 6-8 frames (weapon swing)
✅ hurt.png     - 2-4 frames (recoil from hit)
✅ death.png    - 6-8 frames (fall down)
🔄 victory.png  - 4-6 frames (celebration) - Optional
```

**Format**: Horizontal strip (frames side-by-side)

```
Frame 1 | Frame 2 | Frame 3 | Frame 4 | Frame 5 | Frame 6 | Frame 7 | Frame 8
--------|---------|---------|---------|---------|---------|---------|--------
[ img ] | [ img ] | [ img ] | [ img ] | [ img ] | [ img ] | [ img ] | [ img ]
```

---

## 📂 Step 2: Organize Your Files

Create this folder structure:

```
public/
  sprites/
    heroes/
      warrior/
        idle.png       (512x64 = 8 frames @ 64x64)
        attack.png     (384x64 = 6 frames @ 64x64)
        hurt.png       (192x64 = 3 frames @ 64x64)
        death.png      (384x64 = 6 frames @ 64x64)

      rogue/
        idle.png
        attack.png
        hurt.png
        death.png

      mage/
        idle.png
        attack.png
        hurt.png
        death.png

      paladin/
      priest/
      bard/
      archer/
      barbarian/

    monsters/
      goblin/
        idle.png
        attack.png
        hurt.png
        death.png

      skeleton/
      troll/
      vampire/
      ... (all your monsters)
```

---

## 🎨 Step 3: Process Sprite Sheets (If Needed)

If your sprites aren't in the right format:

### Using Aseprite (Recommended - $19.99)
1. Open sprite sheet
2. Slice into individual frames: `Sprite → Slice`
3. Export as horizontal strip: `File → Export Sprite Sheet`
4. Settings:
   - Layout: Horizontal
   - Frames: All
   - Output file: `idle.png`, etc.

### Using Free Tools

#### Piskel (Browser-based - Free)
1. Go to https://www.piskelapp.com/
2. Import your sprite sheet
3. Export as sprite sheet (horizontal)

#### ImageMagick (Command line - Free)
```bash
# Install ImageMagick
# Then convert vertical to horizontal:
convert vertical-sprite.png -append horizontal-sprite.png

# Or split and recombine frames
convert input.png -crop 64x64 frame%02d.png
montage frame*.png -tile 8x1 -geometry 64x64+0+0 output.png
```

---

## 🔧 Step 4: Import CSS in Your App

Add the sprite CSS to your main entry point:

```tsx
// src/main.tsx

import './styles/sprites.css'; // Add this line
import './index.css';
// ... rest of imports
```

---

## 🎮 Step 5: Use in Your Components

### Example: Update PlayerCard.tsx

```tsx
// src/components/game/PlayerCard.tsx

import { CharacterSprite } from './CharacterSprite';
import { useGameAnimation } from '../../hooks/useSpriteAnimation';
import type { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
}

export function PlayerCard({ player, isActive }: PlayerCardProps) {
  // Hook automatically manages animation state
  const { currentAnimation } = useGameAnimation({
    hp: player.hp,
    maxHp: player.maxHp,
    isAlive: player.isAlive,
    isAttacking: false, // You'll set this from game state
  });

  return (
    <div className={`player-card ${isActive ? 'active' : ''}`}>
      {/* Replace your current icon with CharacterSprite */}
      <CharacterSprite
        characterType={player.classType}
        animation={currentAnimation}
        size={96}
        className="player-sprite"
      />

      {/* Rest of your player card UI */}
      <div className="player-info">
        <h3>{player.name || player.classType}</h3>
        <HealthBar hp={player.hp} maxHp={player.maxHp} />
        {/* ... */}
      </div>
    </div>
  );
}
```

### Example: Update MonsterCard.tsx

```tsx
// src/components/game/MonsterCard.tsx

import { MonsterSprite } from './CharacterSprite';
import { useGameAnimation } from '../../hooks/useSpriteAnimation';
import type { Monster } from '../../types';

interface MonsterCardProps {
  monster: Monster;
  isTargeted: boolean;
}

export function MonsterCard({ monster, isTargeted }: MonsterCardProps) {
  const { currentAnimation } = useGameAnimation({
    hp: monster.hp,
    maxHp: monster.maxHp,
    isAlive: monster.isAlive,
  });

  return (
    <div className={`monster-card ${isTargeted ? 'targeted' : ''}`}>
      <MonsterSprite
        monsterType={monster.id as any} // Convert to MonsterType
        animation={currentAnimation}
        size={128}
        className="monster-sprite"
      />

      <div className="monster-info">
        <h3>{monster.name}</h3>
        <HealthBar hp={monster.hp} maxHp={monster.maxHp} />
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 🧪 Step 6: Test with Demo Component

Create a test page to see your sprites in action:

```tsx
// src/components/SpriteDemo.tsx

import { useState } from 'react';
import { CharacterSprite, AnimationType, CharacterType } from './game/CharacterSprite';

export function SpriteDemo() {
  const [character, setCharacter] = useState<CharacterType>('warrior');
  const [animation, setAnimation] = useState<AnimationType>('idle');

  const characters: CharacterType[] = [
    'warrior', 'rogue', 'paladin', 'mage',
    'priest', 'bard', 'archer', 'barbarian'
  ];

  const animations: AnimationType[] = [
    'idle', 'attack', 'hurt', 'death', 'victory'
  ];

  return (
    <div className="sprite-demo" style={{ padding: 40, background: '#1c1917' }}>
      <h1 style={{ color: 'white' }}>Sprite Animation Test</h1>

      <div style={{ margin: '40px 0' }}>
        <CharacterSprite
          characterType={character}
          animation={animation}
          size={128}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <label style={{ color: 'white' }}>Character:</label>
        {characters.map(char => (
          <button
            key={char}
            onClick={() => setCharacter(char)}
            style={{
              padding: '8px 16px',
              background: character === char ? '#f59e0b' : '#44403c',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {char}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <label style={{ color: 'white' }}>Animation:</label>
        {animations.map(anim => (
          <button
            key={anim}
            onClick={() => setAnimation(anim)}
            style={{
              padding: '8px 16px',
              background: animation === anim ? '#3b82f6' : '#44403c',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {anim}
          </button>
        ))}
      </div>
    </div>
  );
}
```

Add to your `App.tsx` temporarily:

```tsx
import { SpriteDemo } from './components/SpriteDemo';

// Add this route to test
{screen === 'spriteDemo' && <SpriteDemo />}
```

---

## 🔄 Step 7: Integrate with Game Store

Add animation state to your game store:

```typescript
// src/store/gameStore.ts

interface GameStore {
  // ... existing state

  // Animation tracking
  attackingPlayerId: string | null;
  attackingMonsterId: string | null;

  // Actions
  triggerPlayerAttack: (playerId: string) => void;
  triggerMonsterAttack: (monsterId: string) => void;
}

// In your store implementation:
export const useGameStore = create<GameStore>((set, get) => ({
  // ... existing state
  attackingPlayerId: null,
  attackingMonsterId: null,

  triggerPlayerAttack: (playerId: string) => {
    set({ attackingPlayerId: playerId });

    // Reset after animation completes
    setTimeout(() => {
      set({ attackingPlayerId: null });
    }, 500); // Match attack animation duration
  },

  triggerMonsterAttack: (monsterId: string) => {
    set({ attackingMonsterId: monsterId });

    setTimeout(() => {
      set({ attackingMonsterId: null });
    }, 600);
  },

  // Update your playCard function to trigger animation:
  playCard: async () => {
    // ... existing logic

    const currentPlayer = get().players[get().currentPlayerIndex];
    get().triggerPlayerAttack(currentPlayer.id);

    // Wait for animation
    await delay(500);

    // Apply damage...
  },
}));
```

Then in your components:

```tsx
// PlayerCard.tsx
const attackingPlayerId = useGameStore(state => state.attackingPlayerId);
const isAttacking = attackingPlayerId === player.id;

const { currentAnimation } = useGameAnimation({
  hp: player.hp,
  maxHp: player.maxHp,
  isAlive: player.isAlive,
  isAttacking, // This triggers attack animation
});
```

---

## 🎨 Placeholder Sprites (While You Get Real Ones)

Don't have sprites yet? The CSS includes colored gradient fallbacks:

- **Warrior**: Red gradient
- **Rogue**: Purple gradient
- **Paladin**: Gold gradient
- **Mage**: Blue gradient
- **Priest**: White/gray gradient
- **Bard**: Pink gradient
- **Archer**: Green gradient
- **Barbarian**: Orange gradient

The component will show these until you add actual sprite images.

---

## 🚀 Quick Start (30 seconds)

Want to see it working RIGHT NOW?

1. **Download one free sprite pack**:
   - Go to: https://itch.io/game-assets/free/tag-character
   - Download any RPG character pack

2. **Extract and rename**:
   - Put in `public/sprites/heroes/warrior/`
   - Rename files to `idle.png`, `attack.png`, etc.

3. **Import the CSS**:
   ```tsx
   // src/main.tsx
   import './styles/sprites.css';
   ```

4. **Test**:
   ```tsx
   import { CharacterSprite } from './components/game/CharacterSprite';

   <CharacterSprite characterType="warrior" animation="attack" size={64} />
   ```

That's it! You should see an animated sprite.

---

## 🐛 Troubleshooting

### Sprites not showing
- Check browser console for 404 errors
- Verify file paths match exactly: `/public/sprites/heroes/warrior/idle.png`
- Make sure files are in `public/` folder (not `src/`)

### Animation not playing
- Check CSS is imported in `main.tsx`
- Verify sprite sheet has correct number of frames
- Check `background-size` matches frame count (8 frames = 800%)

### Sprites look blurry
- Make sure `image-rendering: pixelated` is in CSS
- Use square frames (64x64, 32x32, etc.)
- Don't resize sprites in CSS beyond their natural size

### Performance issues
- Reduce sprite size (32x32 instead of 128x128)
- Limit number of simultaneous animations
- Use `will-change: background-position` (already in CSS)

---

## 📚 Advanced Tips

### Custom Frame Counts

If your sprite has different frame counts:

```css
/* 5-frame animation */
.custom-animation {
  background-size: 500% 100%; /* 5 × 100% */
  animation: sprite-5-frames 1s steps(5) infinite;
}

@keyframes sprite-5-frames {
  from { background-position-x: 0%; }
  to { background-position-x: 100%; }
}
```

### Flip Sprite Horizontally

```css
.sprite-facing-left {
  transform: scaleX(-1);
}
```

### Add Shadow

```css
.character-sprite {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}
```

### Sprite Sheet with Multiple Rows

If you have a sprite sheet with animations in rows:

```css
.sprite-multi-row {
  background-position: 0 0; /* Column 0, Row 0 */
  background-size: 800% 400%; /* 8 columns, 4 rows */
}

/* Attack animation on row 2 */
.sprite-attack {
  background-position-y: 33.33%; /* Row 2 of 3 */
  animation: sprite-8-frames 0.5s steps(8) 1;
}
```

---

## 🎯 Next Steps

1. ✅ Get sprite sheets for all 8 heroes
2. ✅ Get sprite sheets for all 18+ monsters
3. ✅ Test each character's animations
4. ✅ Integrate into PlayerCard and MonsterCard
5. ✅ Hook up to game state (attack triggers, damage triggers)
6. ✅ Add sound effects to match animations
7. ✅ Polish timing and transitions

---

## 📦 Batch Download Script

If you have many sprites to download from LPC:

```javascript
// Run this in browser console on LPC generator page
// Downloads all animation sets automatically

const animations = ['idle', 'walk', 'slash', 'hurt', 'die'];
const character = 'warrior';

animations.forEach(anim => {
  // Adjust selectors based on LPC site structure
  const button = document.querySelector(`[data-animation="${anim}"]`);
  if (button) button.click();

  setTimeout(() => {
    const downloadBtn = document.querySelector('.download-button');
    if (downloadBtn) downloadBtn.click();
  }, 1000);
});
```

---

## 🎨 Commissioned Art Pricing

If you want custom sprites:

- **Fiverr**: $10-50 per character (basic)
- **itch.io artists**: $20-100 per character (quality)
- **Professional**: $100-500+ per character

**Bulk discount**: Commission all 8 heroes at once for 20-30% off.

---

Ready to add sprites? Let me know if you need help with any step!
