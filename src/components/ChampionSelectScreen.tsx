import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  Coins,
  Swords,
  Heart,
  Shield,
  Zap,
  Brain,
  Clover,
  Pencil,
} from "lucide-react";
import type { Champion, ClassType } from "../types";
import { ConfirmModal } from "./ui/ConfirmModal";
import { InputModal } from "./ui/InputModal";

const getClassIcon = (classType: ClassType): string => {
  const icons: Record<ClassType, string> = {
    fighter: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    cleric: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType];
};

const getClassColor = (classType: ClassType): string => {
  const colors: Record<ClassType, string> = {
    fighter: "from-red-700 to-red-600",
    rogue: "from-purple-700 to-purple-600",
    paladin: "from-yellow-600 to-yellow-500",
    mage: "from-blue-700 to-blue-600",
    cleric: "from-white/20 to-white/10",
    bard: "from-pink-600 to-pink-500",
    archer: "from-green-700 to-green-600",
    barbarian: "from-orange-700 to-orange-600",
  };
  return colors[classType];
};

function ChampionCard({
  champion,
  onSelect,
  onEdit,
  onDelete,
}: {
  champion: Champion;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = CLASS_CONFIGS[champion.class];
  const xpPercent = (champion.xp / champion.xpToNextLevel) * 100;

  return (
    <div className="flex flex-col">
      {/* Card */}
      <div
        onClick={onSelect}
        className={`relative bg-gradient-to-br ${getClassColor(
          champion.class
        )} rounded-xl p-4 cursor-pointer transition-all hover:scale-105 border-2 border-transparent hover:border-white/30`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-3xl mb-1">{getClassIcon(champion.class)}</div>
            <h3 className="text-xl font-bold text-white">{champion.name}</h3>
            <p className="text-sm text-white/70">{config.name}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-300">
              <Star className="w-4 h-4" />
              <span className="font-bold">Lv. {champion.level}</span>
            </div>
            {champion.unspentStatPoints > 0 && (
              <div className="text-xs text-green-300 mt-1">
                +{champion.unspentStatPoints} pts
              </div>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>XP</span>
            <span>
              {champion.xp} / {champion.xpToNextLevel}
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="flex items-center gap-1 text-white/80">
            <Swords className="w-3 h-3" />
            <span>{champion.attributes.STR}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <Zap className="w-3 h-3" />
            <span>{champion.attributes.AGI}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <Heart className="w-3 h-3" />
            <span>{champion.attributes.CON}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <Brain className="w-3 h-3" />
            <span>{champion.attributes.INT}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <Shield className="w-3 h-3" />
            <span>{champion.attributes.WIS}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80">
            <Clover className="w-3 h-3" />
            <span>{champion.attributes.LCK}</span>
          </div>
        </div>

        {/* Gold and Cards */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-yellow-300">
            <Coins className="w-4 h-4" />
            <span>{champion.gold}</span>
          </div>
          <div className="text-white/60">{champion.ownedCards.length} cards</div>
        </div>
      </div>

      {/* Action buttons below card */}
      <div className="flex justify-center gap-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white rounded-lg text-sm transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-red-900 text-stone-300 hover:text-red-300 rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

export function ChampionSelectScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const setReturnScreen = useGameStore((state) => state.setReturnScreen);
  const playerAccount = useGameStore((state) => state.playerAccount);
  const loadProgression = useGameStore((state) => state.loadProgression);
  const selectChampion = useGameStore((state) => state.selectChampion);
  const deleteChampion = useGameStore((state) => state.deleteChampion);
  const updateChampionName = useGameStore((state) => state.updateChampionName);

  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; championId: string; championName: string }>({
    isOpen: false,
    championId: "",
    championName: "",
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; championId: string; currentName: string }>({
    isOpen: false,
    championId: "",
    currentName: "",
  });

  useEffect(() => {
    loadProgression();
  }, [loadProgression]);

  // Handle selecting a champion as active
  const handleSelectChampion = async (championId: string) => {
    await selectChampion(championId);
    setScreen("title");
  };

  const handleDeleteClick = (championId: string, championName: string) => {
    setDeleteModal({ isOpen: true, championId, championName });
  };

  const handleDeleteConfirm = () => {
    deleteChampion(deleteModal.championId);
    setDeleteModal({ isOpen: false, championId: "", championName: "" });
  };

  const handleEditClick = (championId: string, currentName: string) => {
    setEditModal({ isOpen: true, championId, currentName });
  };

  const handleEditConfirm = (newName: string) => {
    if (newName !== editModal.currentName) {
      updateChampionName(editModal.championId, newName);
    }
    setEditModal({ isOpen: false, championId: "", currentName: "" });
  };

  const canCreateMore =
    playerAccount &&
    playerAccount.champions.length < playerAccount.maxChampionSlots;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setScreen("title")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Your Champions
          </h1>
          <p className="text-stone-400">
            Click a champion to set them as your active champion
          </p>
        </div>

        {/* Champion slots info */}
        <div className="text-center mb-6">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {playerAccount?.champions.length ?? 0} /{" "}
            {playerAccount?.maxChampionSlots ?? 3} Champion Slots
          </span>
        </div>

        {/* Champions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {playerAccount?.champions.map((champion) => (
            <ChampionCard
              key={champion.id}
              champion={champion}
              onSelect={() => handleSelectChampion(champion.id)}
              onEdit={() => handleEditClick(champion.id, champion.name)}
              onDelete={() => handleDeleteClick(champion.id, champion.name)}
            />
          ))}

          {/* Create new button */}
          {canCreateMore && (
            <button
              onClick={() => {
                setReturnScreen("championSelect");
                setScreen("championCreate");
              }}
              className="bg-stone-800/50 border-2 border-dashed border-stone-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-500 hover:text-amber-400 transition-all"
            >
              <Plus className="w-12 h-12" />
              <span className="font-bold">Create New Champion</span>
            </button>
          )}
        </div>

        {/* Empty state */}
        {(!playerAccount || playerAccount.champions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-stone-400 text-lg mb-4">
              You don't have any champions yet.
            </p>
            <button
              onClick={() => setScreen("championCreate")}
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-3 px-8 rounded-lg transition-all"
            >
              Create Your First Champion
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Champion"
        message={`Are you sure you want to delete ${deleteModal.championName}?\n\nThis will permanently remove the champion and all their gold, cards, and progress. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, championId: "", championName: "" })}
      />

      {/* Edit Name Modal */}
      <InputModal
        isOpen={editModal.isOpen}
        title="Edit Champion"
        label="Champion Name"
        placeholder="Enter champion name"
        initialValue={editModal.currentName}
        maxLength={20}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={handleEditConfirm}
        onCancel={() => setEditModal({ isOpen: false, championId: "", currentName: "" })}
      />
    </div>
  );
}
