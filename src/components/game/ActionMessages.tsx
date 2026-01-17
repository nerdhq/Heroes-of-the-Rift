import type { ActionMessage } from "../../types";

interface ActionMessagesProps {
  messages: ActionMessage[];
}

export function ActionMessages({ messages }: ActionMessagesProps) {
  // Filter out damage and heal messages - those are shown as floating numbers
  const filteredMessages = messages.filter(
    (msg) => msg.type !== "damage" && msg.type !== "heal"
  );

  if (filteredMessages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2">
      {filteredMessages.slice(-4).map((msg, index, arr) => {
        const position = arr.length - 1 - index;
        const fadeClass =
          position >= 4
            ? "opacity-30"
            : position >= 3
            ? "opacity-50"
            : position >= 2
            ? "opacity-70"
            : "";

        return (
          <div
            key={msg.id}
            className={`px-6 py-3 rounded-xl border-2 shadow-lg animate-message-slide-up transition-opacity duration-1000 ${fadeClass} ${
              msg.type === "damage"
                ? "bg-red-900/90 border-red-500 text-red-100"
                : msg.type === "heal"
                ? "bg-green-900/90 border-green-500 text-green-100"
                : msg.type === "debuff"
                ? "bg-purple-900/90 border-purple-500 text-purple-100"
                : msg.type === "buff"
                ? "bg-blue-900/90 border-blue-500 text-blue-100"
                : msg.type === "roll"
                ? "bg-amber-900/90 border-amber-500 text-amber-100"
                : "bg-stone-900/90 border-amber-500 text-amber-100"
            }`}
          >
            <p className="text-xl font-bold whitespace-nowrap">{msg.text}</p>
          </div>
        );
      })}
    </div>
  );
}
