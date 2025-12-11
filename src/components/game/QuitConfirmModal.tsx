import { AlertTriangle } from "lucide-react";

interface QuitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function QuitConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: QuitConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-stone-900 rounded-xl border-2 border-red-700 p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-900/50 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400">Quit Game?</h2>
        </div>

        {/* Message */}
        <p className="text-stone-300 mb-6">
          Are you sure you want to quit? All progress in this run will be lost
          and you'll return to the main menu.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg font-bold transition-colors border border-stone-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors border border-red-600"
          >
            Quit Game
          </button>
        </div>
      </div>
    </div>
  );
}
