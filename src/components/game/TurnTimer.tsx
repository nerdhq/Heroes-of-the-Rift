import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TurnTimerProps {
  turnStartedAt: string | null;
  timeoutSeconds?: number;
  isMyTurn: boolean;
}

export function TurnTimer({
  turnStartedAt,
  timeoutSeconds = 120,
  isMyTurn,
}: TurnTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutSeconds);

  useEffect(() => {
    if (!turnStartedAt) {
      setRemainingSeconds(timeoutSeconds);
      return;
    }

    const startTime = new Date(turnStartedAt).getTime();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsed);
      setRemainingSeconds(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [turnStartedAt, timeoutSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isLow = remainingSeconds <= 30;
  const isCritical = remainingSeconds <= 10;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isCritical
          ? "bg-red-900/50 text-red-300 animate-pulse"
          : isLow
          ? "bg-amber-900/50 text-amber-300"
          : "bg-stone-800/50 text-stone-300"
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span className="font-mono">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
      {isMyTurn && isCritical && (
        <span className="text-xs ml-1">Hurry!</span>
      )}
    </div>
  );
}
