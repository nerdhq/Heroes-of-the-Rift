import { useState, useEffect, useMemo } from "react";
import { Texture, Assets } from "pixi.js";

interface BackgroundSpriteProps {
  imageUrl: string;
  width: number;
  height: number;
}

export function BackgroundSprite({ imageUrl, width, height }: BackgroundSpriteProps) {
  const [texture, setTexture] = useState<Texture | null>(null);

  // Load the texture
  useEffect(() => {
    let isMounted = true;

    const loadTexture = async () => {
      try {
        // Check if already in cache
        const cached = Assets.cache.get(imageUrl);
        if (cached) {
          if (isMounted) setTexture(cached);
          return;
        }

        // Load the texture
        const loadedTexture = await Assets.load(imageUrl);
        if (isMounted) setTexture(loadedTexture);
      } catch (error) {
        console.error("Failed to load background texture:", error);
      }
    };

    loadTexture();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  // Calculate scale to cover the entire canvas (cover, not contain)
  const spriteProps = useMemo(() => {
    if (!texture) return null;

    const textureWidth = texture.width;
    const textureHeight = texture.height;

    // Calculate scale to cover the entire canvas
    const scaleX = width / textureWidth;
    const scaleY = height / textureHeight;
    const scale = Math.max(scaleX, scaleY);

    // Center the background
    const scaledWidth = textureWidth * scale;
    const scaledHeight = textureHeight * scale;
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    return {
      x,
      y,
      scaleX: scale,
      scaleY: scale,
    };
  }, [texture, width, height]);

  if (!texture || !spriteProps) {
    // Render a dark fallback while loading
    return (
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.rect(0, 0, width, height);
          g.fill({ color: 0x1a1a2e });
        }}
      />
    );
  }

  return (
    <pixiSprite
      texture={texture}
      x={spriteProps.x}
      y={spriteProps.y}
      scale={{ x: spriteProps.scaleX, y: spriteProps.scaleY }}
    />
  );
}
