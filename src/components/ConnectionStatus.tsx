import { useGameStore } from "../store/gameStore";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function ConnectionStatus({
  showLabel = false,
  className = "",
}: ConnectionStatusProps) {
  const isOnline = useGameStore((state) => state.isOnline);
  const isConnected = useGameStore((state) => state.isConnected);
  const isSyncing = useGameStore((state) => state.isSyncing);
  const syncError = useGameStore((state) => state.syncError);

  if (!isOnline) {
    return null; // Don't show anything for offline mode
  }

  let statusColor = "text-stone-500";
  let bgColor = "bg-stone-800";
  let Icon = WifiOff;
  let label = "Disconnected";

  if (syncError) {
    statusColor = "text-red-400";
    bgColor = "bg-red-900/30";
    Icon = AlertCircle;
    label = "Sync Error";
  } else if (isSyncing) {
    statusColor = "text-amber-400";
    bgColor = "bg-amber-900/30";
    Icon = Loader2;
    label = "Syncing...";
  } else if (isConnected) {
    statusColor = "text-green-400";
    bgColor = "bg-green-900/30";
    Icon = Wifi;
    label = "Connected";
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded ${bgColor} ${className}`}
      title={syncError || label}
    >
      <Icon
        className={`w-4 h-4 ${statusColor} ${isSyncing ? "animate-spin" : ""}`}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${statusColor}`}>{label}</span>
      )}
    </div>
  );
}
