interface DamageNumber {
  id: string;
  value: number;
  type: "damage" | "heal" | "shield";
  targetId: string;
}

interface FloatingDamageNumbersProps {
  damageNumbers: DamageNumber[];
}

export function FloatingDamageNumbers({
  damageNumbers,
}: FloatingDamageNumbersProps) {
  return (
    <>
      {damageNumbers.map((dmg) => {
        const isPlayer = dmg.targetId.startsWith("player");
        return (
          <div
            key={dmg.id}
            className={`fixed z-50 pointer-events-none animate-damage-float font-bold text-3xl ${
              dmg.type === "damage"
                ? "text-red-500"
                : dmg.type === "heal"
                ? "text-green-500"
                : "text-blue-500"
            }`}
            style={{
              left: isPlayer ? "15%" : "60%",
              top: "40%",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {dmg.type === "damage" ? "-" : "+"}
            {dmg.value}
          </div>
        );
      })}
    </>
  );
}
