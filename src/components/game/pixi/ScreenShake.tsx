import { useCallback, useState, type ReactNode } from "react";
import { useTick } from "@pixi/react";

interface ScreenShakeProps {
  children: ReactNode;
  isShaking: boolean;
  intensity?: number;
}

export function ScreenShake({ children, isShaking, intensity = 5 }: ScreenShakeProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useTick(useCallback(() => {
    if (isShaking) {
      // Random offset within intensity range
      setOffset({
        x: (Math.random() - 0.5) * intensity * 2,
        y: (Math.random() - 0.5) * intensity * 2,
      });
    } else {
      // Smoothly return to center
      setOffset((prev) => ({
        x: prev.x * 0.8,
        y: prev.y * 0.8,
      }));
    }
  }, [isShaking, intensity]));

  return (
    <pixiContainer x={offset.x} y={offset.y}>
      {children}
    </pixiContainer>
  );
}
