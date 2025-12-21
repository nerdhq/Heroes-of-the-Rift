import { User, Users } from "lucide-react";

interface TurnIndicatorProps {
  currentPlayerName: string;
  isMyTurn: boolean;
  totalPlayers: number;
  currentPlayerIndex: number;
}

export function TurnIndicator({
  currentPlayerName,
  isMyTurn,
  totalPlayers,
  currentPlayerIndex,
}: TurnIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
        isMyTurn
          ? "bg-green-900/50 border border-green-600 text-green-200"
          : "bg-stone-800/50 border border-stone-600 text-stone-300"
      }`}
    >
      <div className="flex items-center gap-2">
        {isMyTurn ? (
          <User className="w-5 h-5 text-green-400" />
        ) : (
          <Users className="w-5 h-5 text-stone-400" />
        )}
        <span className="font-medium">
          {isMyTurn ? "Your Turn" : `${currentPlayerName}'s Turn`}
        </span>
      </div>

      {totalPlayers > 1 && (
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <span>•</span>
          <span>
            Player {currentPlayerIndex + 1} of {totalPlayers}
          </span>
        </div>
      )}

      {isMyTurn && (
        <span className="ml-2 px-2 py-0.5 bg-green-600 text-green-100 text-xs font-medium rounded">
          SELECT A CARD
        </span>
      )}
    </div>
  );
}
