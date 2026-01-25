import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  ArrowLeft,
  Users,
  Layers,
  Bug,
  Mountain,
  Swords,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Play,
} from "lucide-react";
import { CLASS_CONFIGS, AVAILABLE_CLASSES } from "../data/classes";
import { CARDS_BY_CLASS, getAllCards } from "../data/cards";
import {
  MONSTER_TEMPLATES,
  MONSTER_TIERS,
  ELITE_MODIFIERS,
} from "../data/monsters";
import { MONSTER_IMAGES, MONSTER_CATEGORIES } from "../assets/monsters";
import { ENVIRONMENTS } from "../data/environments";
import { BACKGROUND_IMAGES, DEFAULT_BACKGROUND } from "../assets/backgrounds";
import type {
  ClassType,
  Rarity,
  Card,
  EnvironmentType,
  EliteModifier,
} from "../types";

type TabType = "heroes" | "cards" | "monsters" | "environments" | "battle";

const getClassIcon = (classType: string): string => {
  const icons: Record<string, string> = {
    fighter: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    cleric: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType] || "👤";
};

const getRarityColor = (rarity: Rarity): string => {
  const colors: Record<Rarity, string> = {
    common: "border-stone-500 bg-stone-800/50",
    uncommon: "border-green-500 bg-green-900/30",
    rare: "border-blue-500 bg-blue-900/30",
    legendary: "border-amber-500 bg-amber-900/30",
  };
  return colors[rarity];
};

const getRarityTextColor = (rarity: Rarity): string => {
  const colors: Record<Rarity, string> = {
    common: "text-stone-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    legendary: "text-amber-400",
  };
  return colors[rarity];
};

// Heroes Tab Component
function HeroesTab() {
  const [expandedClass, setExpandedClass] = useState<ClassType | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-100 mb-4">
        Classes ({AVAILABLE_CLASSES.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_CLASSES.map((classType) => {
          const config = CLASS_CONFIGS[classType];
          const isExpanded = expandedClass === classType;
          const classCards = CARDS_BY_CLASS[classType];

          return (
            <div
              key={classType}
              className="bg-stone-800/60 rounded-lg border border-stone-700 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedClass(isExpanded ? null : classType)
                }
                className="w-full p-4 text-left hover:bg-stone-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getClassIcon(classType)}</span>
                    <div>
                      <h3
                        className="font-bold text-lg"
                        style={{ color: config.color }}
                      >
                        {config.name}
                      </h3>
                      <p className="text-stone-400 text-sm">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-stone-900/50 rounded px-2 py-1">
                    <span className="text-stone-500">Base HP:</span>{" "}
                    <span className="text-red-400">{config.baseHp}</span>
                  </div>
                  <div className="bg-stone-900/50 rounded px-2 py-1">
                    <span className="text-stone-500">{config.resourceName}:</span>{" "}
                    <span className="text-blue-400">{config.maxResource}</span>
                  </div>
                </div>

                <div className="mt-2 bg-stone-900/50 rounded p-2">
                  <div className="text-xs text-stone-500 mb-1">
                    Special Ability
                  </div>
                  <div className="text-amber-300 font-medium">
                    {config.specialAbility.name}
                  </div>
                  <div className="text-stone-400 text-xs">
                    {config.specialAbility.description}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-stone-700 p-4 bg-stone-900/40 max-h-64 overflow-y-auto">
                  <div className="text-sm text-stone-400 mb-2">
                    Cards ({classCards.length})
                  </div>
                  <div className="space-y-2">
                    {classCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-2 rounded border ${getRarityColor(
                          card.rarity
                        )}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-stone-200">
                            {card.name}
                          </span>
                          <span
                            className={`text-xs ${getRarityTextColor(
                              card.rarity
                            )}`}
                          >
                            {card.rarity}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-1">
                          {card.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cards Tab Component
function CardsTab() {
  const [classFilter, setClassFilter] = useState<ClassType | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");

  const allCards = getAllCards();
  const filteredCards = allCards.filter((card) => {
    if (classFilter !== "all" && card.class !== classFilter) return false;
    if (rarityFilter !== "all" && card.rarity !== rarityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-amber-100">
          Cards ({filteredCards.length} / {allCards.length})
        </h2>

        <div className="flex gap-2">
          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value as ClassType | "all")
            }
            className="bg-stone-800 border border-stone-600 rounded px-3 py-1 text-stone-200"
          >
            <option value="all">All Classes</option>
            {AVAILABLE_CLASSES.map((c) => (
              <option key={c} value={c}>
                {CLASS_CONFIGS[c].name}
              </option>
            ))}
          </select>

          <select
            value={rarityFilter}
            onChange={(e) =>
              setRarityFilter(e.target.value as Rarity | "all")
            }
            className="bg-stone-800 border border-stone-600 rounded px-3 py-1 text-stone-200"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredCards.map((card) => (
          <CardDisplay key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function CardDisplay({ card }: { card: Card }) {
  const classConfig = CLASS_CONFIGS[card.class];

  return (
    <div
      className={`rounded-lg border-2 p-3 ${getRarityColor(
        card.rarity
      )} hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-stone-100 leading-tight">{card.name}</h3>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: classConfig.color + "30", color: classConfig.color }}
        >
          {classConfig.name}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs mb-2">
        <span className={getRarityTextColor(card.rarity)}>{card.rarity}</span>
        <span className="text-stone-500">|</span>
        <span className="text-orange-400">Aggro: {card.aggro}</span>
      </div>

      <p className="text-xs text-stone-300 mb-2">{card.description}</p>

      <div className="space-y-1">
        {card.effects.map((effect, idx) => (
          <div key={idx} className="text-xs bg-stone-900/50 rounded px-2 py-1">
            <span className="text-stone-400">{effect.type}</span>
            {effect.value !== undefined && (
              <span className="text-amber-300 ml-1">{effect.value}</span>
            )}
            <span className="text-stone-500 ml-1">→ {effect.target}</span>
            {effect.duration && (
              <span className="text-blue-400 ml-1">({effect.duration}t)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Monsters Tab Component
function MonstersTab() {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredMonsters = MONSTER_TEMPLATES.filter((monster) => {
    // Tier filter
    if (tierFilter !== "all") {
      const tierMonsters =
        MONSTER_TIERS[tierFilter as keyof typeof MONSTER_TIERS];
      if (!tierMonsters?.includes(monster.id)) return false;
    }

    // Category filter
    if (categoryFilter !== "all") {
      const categoryMonsters =
        MONSTER_CATEGORIES[categoryFilter as keyof typeof MONSTER_CATEGORIES] as readonly string[];
      if (!categoryMonsters?.includes(monster.id)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-amber-100">
          Monsters ({filteredMonsters.length} / {MONSTER_TEMPLATES.length})
        </h2>

        <div className="flex gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-stone-800 border border-stone-600 rounded px-3 py-1 text-stone-200"
          >
            <option value="all">All Tiers</option>
            <option value="tier1">Tier 1 (Early)</option>
            <option value="tier2">Tier 2 (Mid)</option>
            <option value="tier3">Tier 3 (Late)</option>
            <option value="tier4">Tier 4 (Elite)</option>
            <option value="bosses">Bosses</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-800 border border-stone-600 rounded px-3 py-1 text-stone-200"
          >
            <option value="all">All Categories</option>
            {Object.keys(MONSTER_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMonsters.map((monster) => (
          <MonsterDisplay key={monster.id} monster={monster} />
        ))}
      </div>
    </div>
  );
}

function MonsterDisplay({
  monster,
}: {
  monster: (typeof MONSTER_TEMPLATES)[0];
}) {
  const [showAbilities, setShowAbilities] = useState(false);
  const spriteImage = MONSTER_IMAGES[monster.id];

  // Determine tier for coloring
  const isBoss = MONSTER_TIERS.bosses.includes(monster.id);
  const isTier4 = MONSTER_TIERS.tier4.includes(monster.id);
  const isTier3 = MONSTER_TIERS.tier3.includes(monster.id);

  const borderColor = isBoss
    ? "border-red-500"
    : isTier4
    ? "border-purple-500"
    : isTier3
    ? "border-blue-500"
    : "border-stone-600";

  return (
    <div
      className={`bg-stone-800/60 rounded-lg border-2 ${borderColor} overflow-hidden`}
    >
      <div
        className="aspect-square bg-stone-900/50 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => setShowAbilities(!showAbilities)}
      >
        {spriteImage ? (
          <img
            src={spriteImage}
            alt={monster.name}
            className="h-full object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <span className="text-6xl">{monster.icon}</span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-stone-100 flex items-center gap-2">
          <span className="text-xl">{monster.icon}</span>
          {monster.name}
        </h3>

        <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
          <div className="bg-stone-900/50 rounded px-2 py-1 text-center">
            <div className="text-stone-500">HP</div>
            <div className="text-red-400 font-bold">{monster.baseHp}</div>
          </div>
          <div className="bg-stone-900/50 rounded px-2 py-1 text-center">
            <div className="text-stone-500">Gold</div>
            <div className="text-yellow-400 font-bold">
              {monster.baseGoldReward}
            </div>
          </div>
          <div className="bg-stone-900/50 rounded px-2 py-1 text-center">
            <div className="text-stone-500">XP</div>
            <div className="text-green-400 font-bold">
              {monster.baseXPReward}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAbilities(!showAbilities)}
          className="w-full mt-2 text-xs text-stone-400 hover:text-amber-400 flex items-center justify-center gap-1"
        >
          {showAbilities ? (
            <>
              <ChevronUp className="w-3 h-3" /> Hide Abilities
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Show Abilities (
              {monster.abilities.length})
            </>
          )}
        </button>

        {showAbilities && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {monster.abilities.map((ability, idx) => (
              <div
                key={idx}
                className="bg-stone-900/50 rounded p-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-amber-300 font-medium">
                    [{ability.roll}] {ability.name}
                  </span>
                  {ability.damage !== 0 && (
                    <span
                      className={
                        ability.damage > 0 ? "text-red-400" : "text-green-400"
                      }
                    >
                      {ability.damage > 0 ? `-${ability.damage}` : `+${Math.abs(ability.damage)}`}
                    </span>
                  )}
                </div>
                <div className="text-stone-400 mt-1">{ability.description}</div>
                {ability.debuff && (
                  <div className="text-purple-400 mt-1">
                    {ability.debuff.type} ({ability.debuff.value}) for{" "}
                    {ability.debuff.duration}t
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Environments Tab Component
function EnvironmentsTab() {
  const [previewEnv, setPreviewEnv] = useState<string | null>(null);

  const environmentTypes = Object.keys(ENVIRONMENTS) as Array<
    keyof typeof ENVIRONMENTS
  >;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-100 mb-4">
        Environments ({environmentTypes.length})
      </h2>

      {previewEnv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewEnv(null)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[80vh] m-4">
            <img
              src={BACKGROUND_IMAGES[previewEnv as keyof typeof BACKGROUND_IMAGES] || DEFAULT_BACKGROUND}
              alt={previewEnv}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg text-stone-200">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {environmentTypes.map((envType) => {
          const env = ENVIRONMENTS[envType];
          const bgImage = BACKGROUND_IMAGES[envType as keyof typeof BACKGROUND_IMAGES] || DEFAULT_BACKGROUND;

          return (
            <div
              key={envType}
              className="bg-stone-800/60 rounded-lg border border-stone-700 overflow-hidden hover:border-amber-500 transition-colors"
            >
              <div
                className="aspect-video relative cursor-pointer group"
                onClick={() => setPreviewEnv(envType)}
              >
                <img
                  src={bgImage}
                  alt={env.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">Click to preview</span>
                </div>
              </div>

              <div className="p-3">
                <h3
                  className="font-bold text-lg"
                  style={{ color: env.theme.primaryColor }}
                >
                  {env.name}
                </h3>
                <p className="text-stone-400 text-sm mb-2">{env.description}</p>

                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: env.theme.primaryColor }}
                    title="Primary Color"
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: env.theme.secondaryColor }}
                    title="Secondary Color"
                  />
                </div>

                <div className="space-y-1">
                  {env.effects.map((effect, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-stone-900/50 rounded px-2 py-1"
                    >
                      <span
                        className={
                          effect.value >= 1 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {effect.value >= 1 ? "+" : ""}
                        {Math.round((effect.value - 1) * 100)}%
                      </span>{" "}
                      <span className="text-stone-400">
                        {effect.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mock Battle Configuration Types
interface MockHeroConfig {
  id: string;
  name: string;
  classType: ClassType;
  deckCardIds: string[];
}

interface MockMonsterConfig {
  id: string;
  templateId: string;
  level: number;
  eliteModifier?: EliteModifier;
}

// Mock Battle Tab Component
function MockBattleTab() {
  const startMockBattle = useGameStore((state) => state.startMockBattle);
  const [heroes, setHeroes] = useState<MockHeroConfig[]>([
    {
      id: "hero-1",
      name: "Hero 1",
      classType: "fighter",
      deckCardIds: [],
    },
  ]);
  const [monsters, setMonsters] = useState<MockMonsterConfig[]>([
    {
      id: "monster-1",
      templateId: "bat",
      level: 1,
      eliteModifier: undefined,
    },
  ]);
  const [environmentType, setEnvironmentType] = useState<
    EnvironmentType | "none"
  >("none");
  const [editingDeckHeroId, setEditingDeckHeroId] = useState<string | null>(
    null
  );

  const addHero = () => {
    if (heroes.length >= 5) return;
    const newId = `hero-${Date.now()}`;
    setHeroes([
      ...heroes,
      {
        id: newId,
        name: `Hero ${heroes.length + 1}`,
        classType: "fighter",
        deckCardIds: [],
      },
    ]);
  };

  const removeHero = (heroId: string) => {
    if (heroes.length <= 1) return;
    setHeroes(heroes.filter((h) => h.id !== heroId));
  };

  const updateHero = (heroId: string, updates: Partial<MockHeroConfig>) => {
    setHeroes(
      heroes.map((h) => {
        if (h.id !== heroId) return h;
        const updated = { ...h, ...updates };
        // Reset deck when class changes
        if (updates.classType && updates.classType !== h.classType) {
          updated.deckCardIds = [];
        }
        return updated;
      })
    );
  };

  const addMonster = () => {
    const newId = `monster-${Date.now()}`;
    setMonsters([
      ...monsters,
      {
        id: newId,
        templateId: "bat",
        level: 1,
        eliteModifier: undefined,
      },
    ]);
  };

  const removeMonster = (monsterId: string) => {
    if (monsters.length <= 1) return;
    setMonsters(monsters.filter((m) => m.id !== monsterId));
  };

  const updateMonster = (
    monsterId: string,
    updates: Partial<MockMonsterConfig>
  ) => {
    setMonsters(monsters.map((m) => (m.id === monsterId ? { ...m, ...updates } : m)));
  };

  const toggleCardSelection = (heroId: string, cardId: string) => {
    setHeroes(
      heroes.map((h) => {
        if (h.id !== heroId) return h;
        const isSelected = h.deckCardIds.includes(cardId);
        if (isSelected) {
          return { ...h, deckCardIds: h.deckCardIds.filter((id) => id !== cardId) };
        } else {
          return { ...h, deckCardIds: [...h.deckCardIds, cardId] };
        }
      })
    );
  };

  const selectAllCards = (heroId: string) => {
    const hero = heroes.find((h) => h.id === heroId);
    if (!hero) return;
    const allCardIds = CARDS_BY_CLASS[hero.classType].map((c) => c.id);
    updateHero(heroId, { deckCardIds: allCardIds });
  };

  const clearAllCards = (heroId: string) => {
    updateHero(heroId, { deckCardIds: [] });
  };

  const canStartBattle = () => {
    // Check all heroes have at least 5 cards
    return heroes.every((h) => h.deckCardIds.length >= 5) && monsters.length > 0;
  };

  const handleStartBattle = () => {
    if (!canStartBattle()) return;

    startMockBattle({
      heroes: heroes.map((h) => ({
        id: h.id,
        name: h.name,
        classType: h.classType,
        deckCardIds: h.deckCardIds,
      })),
      monsters: monsters.map((m) => ({
        id: m.id,
        templateId: m.templateId,
        level: m.level,
        eliteModifier: m.eliteModifier,
      })),
      environmentType: environmentType === "none" ? null : environmentType,
    });
  };

  const editingHero = editingDeckHeroId
    ? heroes.find((h) => h.id === editingDeckHeroId)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-amber-100 mb-4">Mock Battle Setup</h2>

      {/* Card Picker Modal */}
      {editingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-stone-800 rounded-lg border border-stone-600 w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
            <div className="flex items-center justify-between p-4 border-b border-stone-700">
              <h3 className="text-lg font-bold text-amber-100">
                Select Cards for {CLASS_CONFIGS[editingHero.classType].name} (
                {editingHero.deckCardIds.length} selected)
              </h3>
              <button
                onClick={() => setEditingDeckHeroId(null)}
                className="p-1 hover:bg-stone-700 rounded"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="flex gap-2 p-4 border-b border-stone-700">
              <button
                onClick={() => selectAllCards(editingHero.id)}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded text-sm"
              >
                Select All
              </button>
              <button
                onClick={() => clearAllCards(editingHero.id)}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded text-sm"
              >
                Clear All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {CARDS_BY_CLASS[editingHero.classType].map((card) => {
                const isSelected = editingHero.deckCardIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCardSelection(editingHero.id, card.id)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      isSelected
                        ? "border-amber-500 bg-amber-900/30"
                        : "border-stone-600 bg-stone-700/50 hover:bg-stone-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-stone-200">
                          {isSelected ? "☑" : "☐"} {card.name}
                        </span>
                        <span
                          className={`ml-2 text-xs ${getRarityTextColor(
                            card.rarity
                          )}`}
                        >
                          ({card.rarity})
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      {card.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-stone-700">
              <button
                onClick={() => setEditingDeckHeroId(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 rounded font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Party Setup Section */}
      <div className="bg-stone-800/60 rounded-lg border border-stone-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-amber-100">
            Party ({heroes.length}/5)
          </h3>
          <button
            onClick={addHero}
            disabled={heroes.length >= 5}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-stone-600 disabled:cursor-not-allowed rounded text-sm"
          >
            <Plus className="w-4 h-4" /> Add Hero
          </button>
        </div>

        <div className="space-y-3">
          {heroes.map((hero) => {
            const classConfig = CLASS_CONFIGS[hero.classType];
            const cardCount = hero.deckCardIds.length;
            const totalCards = CARDS_BY_CLASS[hero.classType].length;

            return (
              <div
                key={hero.id}
                className="bg-stone-900/50 rounded-lg border border-stone-600 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getClassIcon(hero.classType)}</span>
                    <span
                      className="font-medium"
                      style={{ color: classConfig.color }}
                    >
                      {classConfig.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeHero(hero.id)}
                    disabled={heroes.length <= 1}
                    className="p-1 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    <X className="w-4 h-4 text-stone-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={hero.name}
                      onChange={(e) =>
                        updateHero(hero.id, { name: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-600 rounded text-sm text-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Class
                    </label>
                    <select
                      value={hero.classType}
                      onChange={(e) =>
                        updateHero(hero.id, {
                          classType: e.target.value as ClassType,
                        })
                      }
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-600 rounded text-sm text-stone-200"
                    >
                      {AVAILABLE_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {CLASS_CONFIGS[c].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Deck ({cardCount}/{totalCards} cards)
                    </label>
                    <button
                      onClick={() => setEditingDeckHeroId(hero.id)}
                      className={`w-full px-2 py-1 rounded text-sm ${
                        cardCount < 5
                          ? "bg-red-900/50 border border-red-500 text-red-300"
                          : "bg-stone-700 border border-stone-600 hover:bg-stone-600"
                      }`}
                    >
                      {cardCount < 5
                        ? `Need ${5 - cardCount} more cards`
                        : "Edit Deck"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monster Setup Section */}
      <div className="bg-stone-800/60 rounded-lg border border-stone-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-amber-100">
            Monsters ({monsters.length})
            {monsters.length > 5 && (
              <span className="text-yellow-400 text-sm ml-2">
                (Warning: Large encounter)
              </span>
            )}
          </h3>
          <button
            onClick={addMonster}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
          >
            <Plus className="w-4 h-4" /> Add Monster
          </button>
        </div>

        <div className="space-y-3">
          {monsters.map((monster) => {
            const template = MONSTER_TEMPLATES.find(
              (t) => t.id === monster.templateId
            );
            if (!template) return null;

            // Calculate scaled HP for preview
            let previewHp = Math.floor(
              template.baseHp * (1 + (monster.level - 1) * 0.5)
            );
            if (monster.eliteModifier === "armored") {
              previewHp = Math.floor(previewHp * 1.5);
            }
            const previewGold = Math.floor(
              template.baseGoldReward *
                (1 + (monster.level - 1) * 0.3) *
                (monster.eliteModifier ? 1.5 : 1)
            );
            const previewXP = Math.floor(
              template.baseXPReward *
                (1 + (monster.level - 1) * 0.1) *
                (monster.eliteModifier ? 1.5 : 1)
            );

            return (
              <div
                key={monster.id}
                className="bg-stone-900/50 rounded-lg border border-stone-600 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{template.icon}</span>
                    <span className="font-medium text-stone-200">
                      {monster.eliteModifier &&
                        ELITE_MODIFIERS[monster.eliteModifier].icon}{" "}
                      {template.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMonster(monster.id)}
                    disabled={monsters.length <= 1}
                    className="p-1 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    <X className="w-4 h-4 text-stone-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Template
                    </label>
                    <select
                      value={monster.templateId}
                      onChange={(e) =>
                        updateMonster(monster.id, { templateId: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-600 rounded text-sm text-stone-200"
                    >
                      {MONSTER_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Level (1-5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={monster.level}
                      onChange={(e) =>
                        updateMonster(monster.id, {
                          level: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <div className="text-center text-sm text-stone-400">
                      Level {monster.level}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Elite Modifier
                    </label>
                    <select
                      value={monster.eliteModifier || "none"}
                      onChange={(e) =>
                        updateMonster(monster.id, {
                          eliteModifier:
                            e.target.value === "none"
                              ? undefined
                              : (e.target.value as EliteModifier),
                        })
                      }
                      className="w-full px-2 py-1 bg-stone-800 border border-stone-600 rounded text-sm text-stone-200"
                    >
                      <option value="none">None</option>
                      {Object.entries(ELITE_MODIFIERS).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-stone-400">
                  <span>
                    HP: <span className="text-red-400">{previewHp}</span>
                  </span>
                  <span>
                    Gold: <span className="text-yellow-400">{previewGold}</span>
                  </span>
                  <span>
                    XP: <span className="text-green-400">{previewXP}</span>
                  </span>
                  {monster.eliteModifier && (
                    <span className="text-purple-400">
                      {ELITE_MODIFIERS[monster.eliteModifier].description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Section */}
      <div className="bg-stone-800/60 rounded-lg border border-stone-700 p-4">
        <h3 className="text-lg font-bold text-amber-100 mb-4">Environment</h3>

        <select
          value={environmentType}
          onChange={(e) =>
            setEnvironmentType(e.target.value as EnvironmentType | "none")
          }
          className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded mb-3 text-stone-200"
        >
          <option value="none">None (Default Dungeon)</option>
          {Object.entries(ENVIRONMENTS).map(([key, env]) => (
            <option key={key} value={key}>
              {env.name}
            </option>
          ))}
        </select>

        {environmentType !== "none" && (
          <div className="bg-stone-900/50 rounded-lg p-3">
            <h4
              className="font-medium mb-1"
              style={{
                color: ENVIRONMENTS[environmentType].theme.primaryColor,
              }}
            >
              {ENVIRONMENTS[environmentType].name}
            </h4>
            <p className="text-sm text-stone-400 mb-2">
              {ENVIRONMENTS[environmentType].description}
            </p>
            <div className="space-y-1">
              {ENVIRONMENTS[environmentType].effects.map((effect, idx) => (
                <div key={idx} className="text-xs">
                  <span
                    className={
                      effect.value >= 1 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {effect.value >= 1 ? "+" : ""}
                    {Math.round((effect.value - 1) * 100)}%
                  </span>{" "}
                  <span className="text-stone-400">{effect.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Battle Button */}
      <button
        onClick={handleStartBattle}
        disabled={!canStartBattle()}
        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-stone-600 disabled:to-stone-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all"
      >
        <Play className="w-6 h-6" />
        Start Mock Battle
      </button>

      {!canStartBattle() && (
        <p className="text-center text-red-400 text-sm">
          Each hero needs at least 5 cards in their deck to start the battle.
        </p>
      )}
    </div>
  );
}

// Main DevToolsScreen Component
export function DevToolsScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const [activeTab, setActiveTab] = useState<TabType>("heroes");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "heroes", label: "Heroes", icon: <Users className="w-4 h-4" /> },
    { id: "cards", label: "Cards", icon: <Layers className="w-4 h-4" /> },
    { id: "monsters", label: "Monsters", icon: <Bug className="w-4 h-4" /> },
    {
      id: "environments",
      label: "Environments",
      icon: <Mountain className="w-4 h-4" />,
    },
    {
      id: "battle",
      label: "Mock Battle",
      icon: <Swords className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      {/* Header */}
      <header className="bg-stone-900/80 border-b border-stone-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen("title")}
            className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-amber-100">Dev Tools</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-stone-800/60 border-b border-stone-700 px-4 sticky top-[53px] z-30">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === "heroes" && <HeroesTab />}
        {activeTab === "cards" && <CardsTab />}
        {activeTab === "monsters" && <MonstersTab />}
        {activeTab === "environments" && <EnvironmentsTab />}
        {activeTab === "battle" && <MockBattleTab />}
      </main>
    </div>
  );
}
