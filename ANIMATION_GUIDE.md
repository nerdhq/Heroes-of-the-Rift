# Animation Implementation Guide for Paper Dungeon

## Quick Start: Adding Sprite-Based Characters

### Step 1: Get Sprite Assets

**Recommended Free Pack**: LPC (Liberated Pixel Cup)
- Download from: https://lpc.opengameart.org/
- Or use Tiny RPG packs from itch.io

Each character needs these animations:
- `idle.png` - 4-8 frames, gentle breathing/bobbing
- `attack.png` - 6-8 frames, swing weapon
- `hurt.png` - 2-4 frames, recoil from damage
- `death.png` - 6-8 frames, fall down
- `victory.png` - 4-6 frames, celebration (optional)

### Step 2: Folder Structure

```
public/
  sprites/
    heroes/
      warrior/
        idle.png       (512x64 = 8 frames @ 64x64)
        attack.png     (448x64 = 7 frames @ 64x64)
        hurt.png       (192x64 = 3 frames @ 64x64)
        death.png      (384x64 = 6 frames @ 64x64)
      rogue/
        idle.png
        attack.png
        ...
      mage/
      paladin/
      ...
    monsters/
      goblin/
        idle.png
        attack.png
        hurt.png
        death.png
      skeleton/
      ...
```

### Step 3: Create Sprite Component

```tsx
// src/components/game/CharacterSprite.tsx

import { useEffect, useState } from 'react';

interface CharacterSpriteProps {
  type: 'hero' | 'monster';
  characterId: string; // 'warrior', 'goblin', etc.
  animation: 'idle' | 'attack' | 'hurt' | 'death' | 'victory';
  onAnimationComplete?: () => void;
  size?: number;
}

// Sprite sheet configuration
const SPRITE_CONFIG = {
  idle: { frames: 8, duration: 1200, loop: true },
  attack: { frames: 7, duration: 500, loop: false },
  hurt: { frames: 3, duration: 300, loop: false },
  death: { frames: 6, duration: 800, loop: false },
  victory: { frames: 4, duration: 600, loop: true },
};

export function CharacterSprite({
  type,
  characterId,
  animation,
  onAnimationComplete,
  size = 64,
}: CharacterSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const config = SPRITE_CONFIG[animation];
  const frameTime = config.duration / config.frames;

  useEffect(() => {
    setCurrentFrame(0); // Reset animation when it changes
  }, [animation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = prev + 1;

        if (nextFrame >= config.frames) {
          if (config.loop) {
            return 0; // Loop back
          } else {
            onAnimationComplete?.(); // Notify completion
            return prev; // Stay on last frame
          }
        }

        return nextFrame;
      });
    }, frameTime);

    return () => clearInterval(interval);
  }, [animation, config, frameTime, onAnimationComplete]);

  return (
    <div
      className="character-sprite"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/sprites/${type}s/${characterId}/${animation}.png)`,
        backgroundPosition: `-${currentFrame * size}px 0`,
        backgroundSize: `${config.frames * size}px ${size}px`,
        imageRendering: 'pixelated',
        transition: 'background-position 0.05s steps(1)',
      }}
    />
  );
}
```

### Step 4: CSS Approach (Simpler Alternative)

If you prefer CSS animations:

```tsx
// src/components/game/CSSCharacterSprite.tsx

interface CSSCharacterSpriteProps {
  type: 'hero' | 'monster';
  characterId: string;
  animation: 'idle' | 'attack' | 'hurt' | 'death';
  size?: number;
}

export function CSSCharacterSprite({
  type,
  characterId,
  animation,
  size = 64,
}: CSSCharacterSpriteProps) {
  return (
    <div
      className={`sprite sprite-${type} sprite-${characterId}-${animation}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
```

```css
/* src/styles/sprites.css */

.sprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Warrior sprites */
.sprite-warrior-idle {
  background: url('/sprites/heroes/warrior/idle.png');
  animation: warrior-idle-anim 1.2s steps(8) infinite;
}

@keyframes warrior-idle-anim {
  from { background-position-x: 0; }
  to { background-position-x: -512px; } /* 8 frames × 64px */
}

.sprite-warrior-attack {
  background: url('/sprites/heroes/warrior/attack.png');
  animation: warrior-attack-anim 0.5s steps(7) 1;
}

@keyframes warrior-attack-anim {
  from { background-position-x: 0; }
  to { background-position-x: -448px; } /* 7 frames × 64px */
}

/* Add similar rules for each character and animation */
```

### Step 5: Integrate into PlayerCard

```tsx
// Update src/components/game/PlayerCard.tsx

import { CharacterSprite } from './CharacterSprite';

export function PlayerCard({ player, isActive }: PlayerCardProps) {
  const [animation, setAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle');

  // When player attacks
  const handleAttack = () => {
    setAnimation('attack');
    setTimeout(() => setAnimation('idle'), 500);
  };

  // When player takes damage
  useEffect(() => {
    if (playerJustGotHurt) {
      setAnimation('hurt');
      setTimeout(() => setAnimation('idle'), 300);
    }
  }, [player.hp]);

  return (
    <div className="player-card">
      <CharacterSprite
        type="hero"
        characterId={player.classType}
        animation={animation}
        size={96}
      />

      {/* Rest of player card UI */}
      <div className="player-info">
        <h3>{player.name}</h3>
        <HealthBar hp={player.hp} maxHp={player.maxHp} />
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## Advanced: Framer Motion Animations

For smoother, more dynamic animations without sprite sheets:

### Step 1: Install Framer Motion

```bash
npm install framer-motion
```

### Step 2: Create Animated Character Component

```tsx
// src/components/game/AnimatedCharacter.tsx

import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  characterId: string;
  state: 'idle' | 'attacking' | 'defending' | 'hurt' | 'dead';
  size?: number;
}

export function AnimatedCharacter({
  characterId,
  state,
  size = 100,
}: AnimatedCharacterProps) {
  // Define animation variants
  const variants = {
    idle: {
      y: [0, -5, 0],
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    attacking: {
      x: [0, 20, 0],
      rotate: [0, -10, 5, 0],
      transition: {
        duration: 0.5,
      },
    },
    defending: {
      x: [0, -10, -5, 0],
      scale: [1, 0.95, 1],
      transition: {
        duration: 0.3,
      },
    },
    hurt: {
      x: [0, -15, -10, -5, 0],
      opacity: [1, 0.7, 1, 0.7, 1],
      transition: {
        duration: 0.4,
      },
    },
    dead: {
      rotate: 90,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <motion.div
      className="animated-character"
      variants={variants}
      animate={state}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={`/characters/${characterId}.png`}
        alt={characterId}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Attack effect overlay */}
      {state === 'attacking' && (
        <motion.div
          className="attack-slash"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: 1.5 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hurt effect overlay */}
      {state === 'hurt' && (
        <motion.div
          className="hurt-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 0, 0, 0.5)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
}
```

### Step 3: Add Card Game Specific Animations

```tsx
// src/components/game/AnimatedCard.tsx

import { motion } from 'framer-motion';

export function AnimatedCard({ card, onPlay }: AnimatedCardProps) {
  return (
    <motion.div
      className="card"
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onPlay}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Card content */}
    </motion.div>
  );
}

export function AnimatedCardHand({ cards }: AnimatedCardHandProps) {
  return (
    <motion.div
      className="card-hand"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          custom={index}
          initial={{ opacity: 0, y: 50, rotate: 0 }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: (index - cards.length / 2) * 5, // Fan effect
            x: index * 20,
          }}
          transition={{ delay: index * 0.1 }}
        >
          <AnimatedCard card={card} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Paper Cutout Style (Recommended for Theme)

Create a unique "paper" aesthetic:

### Step 1: Create Paper Texture Overlay

```tsx
// src/components/game/PaperCharacter.tsx

import { motion } from 'framer-motion';

export function PaperCharacter({ classType, state }: PaperCharacterProps) {
  return (
    <motion.div
      className="paper-character"
      style={{
        position: 'relative',
        filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.3))',
      }}
      animate={state === 'attacking' ? 'attack' : 'idle'}
      variants={{
        idle: {
          rotate: [-1, 1, -1],
          transition: { duration: 3, repeat: Infinity },
        },
        attack: {
          x: [0, 15, 0],
          rotate: [0, -5, 0],
          transition: { duration: 0.4 },
        },
      }}
    >
      {/* Paper texture overlay */}
      <div
        className="paper-texture"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/textures/paper.png)',
          opacity: 0.3,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Character illustration */}
      <img
        src={`/paper-characters/${classType}.png`}
        alt={classType}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Torn paper edges effect */}
      <div
        className="torn-edges"
        style={{
          position: 'absolute',
          inset: -2,
          background: 'transparent',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          borderRadius: '3px',
          filter: 'url(#torn-paper-filter)',
        }}
      />
    </motion.div>
  );
}
```

```css
/* Add paper texture and torn edge effects */
.paper-character {
  image-rendering: auto;
  -webkit-font-smoothing: antialiased;
}

/* SVG filter for torn paper edges */
<svg style={{ position: 'absolute', width: 0, height: 0 }}>
  <defs>
    <filter id="torn-paper-filter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.05"
        numOctaves="3"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="3"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
```

---

## Animation State Management

Add animation state to your game store:

```typescript
// src/store/gameStore.ts

interface AnimationState {
  characterAnimations: Record<string, 'idle' | 'attack' | 'hurt' | 'death'>;
}

// In your store
const useGameStore = create<GameStore>((set, get) => ({
  // ... existing state
  characterAnimations: {},

  triggerAnimation: (characterId: string, animation: 'attack' | 'hurt' | 'death') => {
    set((state) => ({
      characterAnimations: {
        ...state.characterAnimations,
        [characterId]: animation,
      },
    }));

    // Auto-reset to idle after animation
    setTimeout(() => {
      set((state) => ({
        characterAnimations: {
          ...state.characterAnimations,
          [characterId]: 'idle',
        },
      }));
    }, 500); // Animation duration
  },
}));
```

---

## Resources

### Free Sprite Packs
- **LPC Characters**: https://lpc.opengameart.org/
- **Tiny RPG Pack**: https://itch.io/game-assets/tag-character
- **Kenney Assets**: https://kenney.nl/assets

### Tools
- **Aseprite**: https://www.aseprite.org/ ($19.99)
- **Piskel**: https://www.piskelapp.com/ (Free, browser)
- **Photopea**: https://www.photopea.com/ (Free Photoshop alternative)

### Animation Libraries
- **Framer Motion**: https://www.framer.com/motion/
- **Lottie**: https://lottiefiles.com/
- **React Spring**: https://www.react-spring.dev/

### Learning
- **Pixel Art Tutorial**: https://blog.studiominiboss.com/pixelart
- **Game Animation Principles**: https://www.gamedeveloper.com/art/the-animation-process
