/**
 * Card-related combat actions: selectCard, playCard, applyCardEffects, etc.
 */

import type { SetState, GetState, CardEffectResult } from "../types";
import type { LogEntry, ActionMessage, Card, BardSongType } from "../../../../types";
import { CLASS_CONFIGS } from "../../../../data/classes";
import {
  rollD20,
  createLogEntry,
  applyEffect,
} from "../../../utils";
import {
  WARRIOR_RAGE_DIVISOR,
  WARRIOR_RAGE_MAX_GAIN,
  ROGUE_COMBO_GAIN,
  HEALER_RESOURCE_GAIN,
  BARD_INSPIRATION_GAIN,
  ARCHER_FOCUS_GAIN,
} from "../../../../constants";

/**
 * Detect Bard song type from card description
 * Cards are tagged with [Harmony] or [Riot] in their descriptions
 */
function getBardSongType(card: Card): BardSongType {
  if (card.description.includes("[Harmony]")) return "harmony";
  if (card.description.includes("[Riot]")) return "riot";
  return null;
}

export const createCardActions = (set: SetState, get: GetState) => ({
  selectCard: (cardId: string) => {
    const { phase } = get();
    if (phase === "SELECT") {
      set({ selectedCardId: cardId, selectedTargetId: null });
    }
  },

  selectTarget: (targetId: string) => {
    const { phase } = get();
    if (phase === "TARGET_SELECT") {
      set({ selectedTargetId: targetId });
    }
  },

  confirmTarget: () => {
    const { selectedTargetId } = get();
    if (!selectedTargetId) return;
    get().startDiceRoll();
  },

  needsTargetSelection: () => {
    const { selectedCardId, players, currentPlayerIndex } = get();
    if (!selectedCardId) return false;
    const player = players[currentPlayerIndex];
    const card = player?.hand.find((c) => c.id === selectedCardId);
    if (!card) return false;

    return card.effects.some(
      (e) => e.target === "ally" || e.target === "monster"
    );
  },

  getTargetType: () => {
    const { selectedCardId, players, currentPlayerIndex } = get();
    if (!selectedCardId) return null;
    const player = players[currentPlayerIndex];
    const card = player?.hand.find((c) => c.id === selectedCardId);
    if (!card) return null;

    for (const effect of card.effects) {
      if (effect.target === "ally") return "ally";
      if (effect.target === "monster") return "monster";
    }
    return null;
  },

  rollAggro: () => {
    const { players, currentPlayerIndex, selectedCardId, turn } = get();
    const player = players[currentPlayerIndex];
    const selectedCard = player?.hand.find((c) => c.id === selectedCardId);

    if (!selectedCard) return;

    const diceAggro = rollD20();
    const cardAggro = selectedCard.aggro;
    const newBaseAggro = player.baseAggro + cardAggro;
    const totalAggro = newBaseAggro + diceAggro;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      baseAggro: newBaseAggro,
      diceAggro,
    };

    set({
      players: updatedPlayers,
      phase: "PLAYER_ACTION",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "AGGRO",
          `${player.name} rolls D20: ${diceAggro} + ${newBaseAggro} base = ${totalAggro} aggro`,
          "roll"
        ),
      ],
    });

    get().playCard();
  },

  playCard: async () => {
    const { players, currentPlayerIndex, selectedCardId, selectedTargetId, turn, enhanceMode } = get();
    const player = players[currentPlayerIndex];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Handle stunned player
    if (player.isStunned) {
      get().addActionMessage(`${player.name} is stunned!`, "debuff", player.id);
      set({
        log: [
          ...get().log,
          createLogEntry(turn, "PLAYER_ACTION", `${player.name} is stunned and cannot act!`, "debuff"),
        ],
        enhanceMode: false,
      });
      await delay(1500);
      get().nextPhase();
      return;
    }

    const selectedCard = player.hand.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    const isEnhanced = enhanceMode && player.resource >= player.maxResource;
    const enhanceText = isEnhanced ? " (ENHANCED!)" : "";

    // Determine attack animation type based on card effects and class
    let attackAnimation: "slash" | "cast" | "shoot" | "thrust" = "slash";
    const hasDamage = selectedCard.effects.some((e) => e.type === "damage");
    const hasHeal = selectedCard.effects.some((e) => e.type === "heal");
    const hasDebuff = selectedCard.effects.some((e) =>
      ["poison", "burn", "ice", "stun", "weakness"].includes(e.type)
    );

    // Mages and Clerics cast spells, Archers shoot
    if (player.class === "mage" || player.class === "cleric" || player.class === "bard") {
      attackAnimation = "cast";
    } else if (player.class === "archer") {
      attackAnimation = "shoot";
    } else if (player.class === "paladin" || player.class === "fighter") {
      // Paladin heals are casts, attacks are slashes
      if (hasHeal && !hasDamage) {
        attackAnimation = "cast";
      } else {
        attackAnimation = "slash";
      }
    } else if (player.class === "rogue") {
      attackAnimation = "thrust";
    } else if (hasDebuff && !hasDamage) {
      // Debuff-only cards use cast animation
      attackAnimation = "cast";
    }

    // Show action message
    set({ phase: "PLAYER_ACTION", enhanceMode: false });
    get().addActionMessage(`${player.name} plays ${selectedCard.name}!${enhanceText}`, "action", player.id);
    set({
      log: [
        ...get().log,
        createLogEntry(turn, "PLAYER_ACTION", `${player.name} plays ${selectedCard.name}!${enhanceText}`, "action"),
      ],
    });

    // Trigger attack animation
    get().triggerAttackAnimation(player.id, attackAnimation);
    await delay(900);

    // Clear attack animation
    get().clearAttackAnimation();

    // Apply card effects using shared function
    const result = get().applyCardEffects(currentPlayerIndex, selectedCardId!, selectedTargetId, isEnhanced);

    // Show damage numbers
    for (const dn of result.damageNumbers) {
      get().addDamageNumber(dn.targetId, dn.value, dn.type);
    }

    // Award XP
    for (const [championId, xp] of result.xpEarned) {
      get().addXP(championId, xp);
    }

    // Update state
    set({
      players: result.players,
      monsters: result.monsters,
      selectedCardId: null,
      selectedTargetId: null,
    });

    // Show log messages with delays
    for (const logEntry of result.logs) {
      const msgType = logEntry.type === "damage" ? "damage" : logEntry.type === "heal" ? "heal" : "action";
      get().addActionMessage(logEntry.message, msgType as ActionMessage["type"], player.id);
      set({ log: [...get().log, logEntry] });
      await delay(1500);
    }

    // Sync to other players if online
    get().syncAfterAction();

    // Check for victory
    if (result.monsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    get().nextPhase();
  },

  // Core effect application - extracts common logic used by both playCard and resolveAllActions
  applyCardEffects: (playerIndex: number, cardId: string, targetId: string | null, isEnhanced: boolean): CardEffectResult => {
    const { players, monsters, turn, environment } = get();

    const player = players[playerIndex];
    const selectedCard = player.hand.find((c) => c.id === cardId);

    if (!selectedCard) {
      return {
        players,
        monsters,
        logs: [],
        damageNumbers: [],
        xpEarned: new Map(),
      };
    }

    const config = CLASS_CONFIGS[player.class];
    let updatedPlayers = [...players];
    let updatedMonsters = [...monsters];
    const logs: LogEntry[] = [];
    const damageNumbers: Array<{ targetId: string; value: number; type: "damage" | "heal" }> = [];
    const allXpEarned = new Map<string, number>();

    // Consume resource if enhanced
    if (isEnhanced) {
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        resource: 0,
      };
    }

    let totalDamageDealt = 0;
    let totalHealing = 0;

    // Apply each effect from the card
    for (const effect of selectedCard.effects) {
      const monsterHpBefore = new Map(updatedMonsters.map((m) => [m.id, m.hp]));
      const playerHpBefore = new Map(updatedPlayers.map((p) => [p.id, p.hp]));

      // Apply enhancement bonuses
      let enhancedEffect = effect;
      if (isEnhanced && effect.value) {
        const bonus =
          effect.type === "damage"
            ? config.enhanceBonus.damageBonus
            : effect.type === "heal"
            ? config.enhanceBonus.healBonus
            : effect.type === "shield"
            ? config.enhanceBonus.shieldBonus
            : 0;
        if (bonus > 0) {
          enhancedEffect = { ...effect, value: effect.value + bonus };
        }
      }

      const result = applyEffect(
        enhancedEffect,
        player,
        updatedPlayers,
        updatedMonsters,
        turn,
        targetId,
        environment
      );
      updatedPlayers = result.players;
      updatedMonsters = result.monsters;
      logs.push(...result.logs);

      // Collect XP earned
      for (const [championId, xp] of result.xpEarned) {
        allXpEarned.set(championId, (allXpEarned.get(championId) || 0) + xp);
      }

      // Track damage for floating numbers
      for (const monster of updatedMonsters) {
        const hpBefore = monsterHpBefore.get(monster.id) || monster.hp;
        const damage = hpBefore - monster.hp;
        if (damage > 0) {
          totalDamageDealt += damage;
          damageNumbers.push({ targetId: monster.id, value: damage, type: "damage" });
        }
      }

      // Track healing for floating numbers
      for (const p of updatedPlayers) {
        const hpBefore = playerHpBefore.get(p.id) || p.hp;
        const healing = p.hp - hpBefore;
        if (healing > 0) {
          totalHealing += healing;
          damageNumbers.push({ targetId: p.id, value: healing, type: "heal" });
        }
      }
    }

    // Calculate resource gain based on class
    const currentPlayer = updatedPlayers[playerIndex];
    let resourceGain = 0;
    switch (currentPlayer.class) {
      case "fighter":
        if (totalDamageDealt > 0) resourceGain = Math.min(WARRIOR_RAGE_MAX_GAIN, Math.ceil(totalDamageDealt / WARRIOR_RAGE_DIVISOR));
        break;
      case "rogue":
        resourceGain = ROGUE_COMBO_GAIN;
        break;
      case "paladin":
      case "cleric":
        if (totalHealing > 0) resourceGain = HEALER_RESOURCE_GAIN;
        break;
      case "bard": {
        const cardSongType = getBardSongType(selectedCard);
        if (cardSongType) {
          const currentSongType = currentPlayer.bardSongType;
          if (!currentSongType || currentSongType === cardSongType) {
            // Same song or no song: add 1 stack
            resourceGain = BARD_INSPIRATION_GAIN;
            // Update song type if not set
            if (!currentSongType) {
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                bardSongType: cardSongType,
              };
            }
          } else {
            // Different song: switch type, reset to 1 stack
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              bardSongType: cardSongType,
              resource: 0, // Reset to 0, will add 1 below
            };
            resourceGain = BARD_INSPIRATION_GAIN;
          }
        }
        break;
      }
      case "archer":
        resourceGain = ARCHER_FOCUS_GAIN;
        break;
    }

    if (resourceGain > 0 && !isEnhanced) {
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        resource: Math.min(
          updatedPlayers[playerIndex].resource + resourceGain,
          updatedPlayers[playerIndex].maxResource
        ),
      };
    }

    // Move played card to discard, other card back to deck
    const playedCard = player.hand.find((c) => c.id === cardId)!;
    const otherCard = player.hand.find((c) => c.id !== cardId);

    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      hand: [],
      discard: [...updatedPlayers[playerIndex].discard, playedCard],
      deck: otherCard
        ? [...updatedPlayers[playerIndex].deck, otherCard]
        : updatedPlayers[playerIndex].deck,
    };

    return {
      players: updatedPlayers,
      monsters: updatedMonsters,
      logs,
      damageNumbers,
      xpEarned: allXpEarned,
    };
  },

  canUseSpecialAbility: () => {
    const { players, currentPlayerIndex, phase } = get();
    const player = players[currentPlayerIndex];
    if (!player || !player.isAlive) return false;
    if (phase !== "SELECT") return false;
    return player.resource >= player.maxResource;
  },

  canEnhanceCard: () => {
    const { players, currentPlayerIndex, phase, selectedCardId } = get();
    const player = players[currentPlayerIndex];
    if (!player || !player.isAlive) return false;
    if (phase !== "SELECT" || !selectedCardId) return false;
    return player.resource >= player.maxResource;
  },

  setEnhanceMode: (enabled: boolean) => {
    set({ enhanceMode: enabled });
  },

  useSpecialAbility: async () => {
    const { players, monsters, currentPlayerIndex, turn } = get();
    const player = players[currentPlayerIndex];
    const config = CLASS_CONFIGS[player.class];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      resource: 0,
    };

    set({ phase: "PLAYER_ACTION", players: updatedPlayers });
    get().addActionMessage(
      `${player.name} uses ${config.specialAbility.name}!`,
      "action",
      player.id
    );
    set({
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} uses ${config.specialAbility.name}! (${config.specialAbility.description})`,
          "action"
        ),
      ],
    });
    await delay(1500);

    let finalPlayers = updatedPlayers;
    let finalMonsters = [...monsters];
    const logs: LogEntry[] = [];

    // Filter effects for Bard's Crescendo based on current song type
    let effectsToApply = config.specialAbility.effects;
    if (player.class === "bard") {
      const songType = player.bardSongType;
      if (songType === "harmony") {
        // Harmony: only apply ally buffs (strength)
        effectsToApply = effectsToApply.filter(
          (e) => e.target === "allAllies" || e.target === "self" || e.target === "ally"
        );
      } else if (songType === "riot") {
        // Riot: only apply enemy debuffs (vulnerable, weakness)
        effectsToApply = effectsToApply.filter(
          (e) => e.target === "allMonsters" || e.target === "monster"
        );
      }
      // Reset song type after Crescendo
      finalPlayers[currentPlayerIndex] = {
        ...finalPlayers[currentPlayerIndex],
        bardSongType: null,
      };
    }

    for (const effect of effectsToApply) {
      const result = applyEffect(
        effect,
        player,
        finalPlayers,
        finalMonsters,
        turn,
        null,
        get().environment
      );
      finalPlayers = result.players;
      finalMonsters = result.monsters;
      logs.push(...result.logs);

      // Distribute XP to champions if monsters were killed
      for (const [championId, xp] of result.xpEarned) {
        get().addXP(championId, xp);
      }

      finalPlayers[currentPlayerIndex] = {
        ...finalPlayers[currentPlayerIndex],
        resource: 0,
      };

      for (const monster of finalMonsters) {
        const oldMonster = monsters.find((m) => m.id === monster.id);
        if (oldMonster && oldMonster.hp > monster.hp) {
          get().addDamageNumber(
            monster.id,
            oldMonster.hp - monster.hp,
            "damage"
          );
        }
      }
      for (const p of finalPlayers) {
        const oldPlayer = players.find((pl) => pl.id === p.id);
        if (oldPlayer && oldPlayer.hp < p.hp) {
          get().addDamageNumber(p.id, p.hp - oldPlayer.hp, "heal");
        }
      }
    }

    for (const logEntry of logs) {
      const msgType =
        logEntry.type === "damage"
          ? "damage"
          : logEntry.type === "heal"
          ? "heal"
          : "action";
      get().addActionMessage(
        logEntry.message,
        msgType as ActionMessage["type"],
        player.id
      );
      set({ log: [...get().log, logEntry] });
      await delay(1500);
    }

    const currentPlayer = finalPlayers[currentPlayerIndex];
    finalPlayers[currentPlayerIndex] = {
      ...currentPlayer,
      deck: [...currentPlayer.deck, ...currentPlayer.hand],
      hand: [],
    };

    set({
      players: finalPlayers,
      monsters: finalMonsters,
      selectedCardId: null,
    });

    if (finalMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    get().nextPhase();
  },

  startDiceRoll: () => {
    const { players, currentPlayerIndex, selectedCardId, turn } = get();
    const player = players[currentPlayerIndex];
    const selectedCard = player.hand.find((c) => c.id === selectedCardId);

    if (!selectedCard) return;

    set((state) => ({
      phase: "AGGRO",
      animation: { ...state.animation, diceRolling: true, diceRoll: null },
    }));

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const fakeRoll = Math.floor(Math.random() * 20) + 1;
      set((state) => ({
        animation: { ...state.animation, diceRoll: fakeRoll },
      }));
      rollCount++;
      if (rollCount >= 5) {
        clearInterval(rollInterval);

        const finalRoll = rollD20();
        const cardAggro = selectedCard.aggro;
        const newBaseAggro = player.baseAggro + cardAggro;
        const totalAggro = newBaseAggro + finalRoll;

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = {
          ...player,
          baseAggro: newBaseAggro,
          diceAggro: finalRoll,
        };

        set((state) => ({
          players: updatedPlayers,
          animation: {
            ...state.animation,
            diceRoll: finalRoll,
            diceRolling: false,
          },
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "AGGRO",
              `${player.name} rolls D20: ${finalRoll} + ${newBaseAggro} base = ${totalAggro} aggro`,
              "roll"
            ),
          ],
        }));

        setTimeout(() => {
          set((state) => ({
            animation: { ...state.animation, diceRoll: null },
          }));
          get().playCard();
        }, 300);
      }
    }, 50);
  },
});
