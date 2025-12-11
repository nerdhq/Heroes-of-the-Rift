import { useRef, useEffect } from "react";
import type { LogEntry } from "../../types";

interface BattleLogProps {
  log: LogEntry[];
}

export function BattleLog({ log }: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="col-span-3 flex flex-col min-h-0 mt-10">
      <h2 className="text-lg font-bold text-amber-400 mb-2">Battle Log</h2>
      <div
        ref={logContainerRef}
        className="flex-1 bg-stone-800/50 rounded-xl p-3 border border-stone-700 overflow-y-auto min-h-0"
      >
        <div className="flex flex-col gap-1">
          {log.slice(-25).map((entry) => (
            <div
              key={entry.id}
              className={`text-sm p-2 rounded ${
                entry.isSubEntry ? "ml-4 border-l-2 border-stone-600" : ""
              } ${
                entry.type === "damage"
                  ? "text-red-400 bg-red-900/20"
                  : entry.type === "heal"
                  ? "text-green-400 bg-green-900/20"
                  : entry.type === "buff"
                  ? "text-blue-400 bg-blue-900/20"
                  : entry.type === "debuff"
                  ? "text-purple-400 bg-purple-900/20"
                  : entry.type === "roll"
                  ? "text-amber-400 bg-amber-900/20"
                  : entry.type === "action"
                  ? "text-amber-200 bg-amber-900/10"
                  : "text-stone-400"
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
