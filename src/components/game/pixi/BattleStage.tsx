import { useRef, useState, useLayoutEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import { BattleScene } from "./BattleScene";

// Extend PixiJS components for JSX use
extend({ Container, Graphics, Text, Sprite });

interface BattleStageProps {
  className?: string;
}

export function BattleStage({ className }: BattleStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Track container dimensions for responsive canvas using ResizeObserver
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width > 0 && height > 0) {
        setDimensions((prev) => {
          if (prev?.width === width && prev?.height === height) return prev;
          return { width, height };
        });
      }
    };

    // Use ResizeObserver for more reliable dimension tracking
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);
    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Don't render Application until we have proper dimensions
  if (!dimensions) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-full ${className || ""}`}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className || ""}`}
      style={{ overflow: "hidden" }}
    >
      <Application
        width={dimensions.width}
        height={dimensions.height}
        backgroundAlpha={0}
        antialias
        resolution={window.devicePixelRatio || 1}
        autoDensity
      >
        <BattleScene width={dimensions.width} height={dimensions.height} />
      </Application>
    </div>
  );
}
