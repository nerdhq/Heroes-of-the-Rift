interface HealthBarProps {
  current: number;
  max: number;
  color: string;
}

export function HealthBar({ current, max, color }: HealthBarProps) {
  const percentage = Math.max(0, (current / max) * 100);
  const isLowHp = percentage <= 25 && percentage > 0;

  return (
    <div className="w-full h-3 bg-stone-700 rounded-full overflow-hidden">
      <div
        className={`h-full health-bar-fill ${color} ${
          isLowHp ? "animate-low-hp" : ""
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
