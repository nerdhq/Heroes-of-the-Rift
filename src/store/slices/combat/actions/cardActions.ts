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
  PALADIN_FAITH_BASE_GAIN,
  PALADIN_FAITH_HEAL_BONUS,
  HEALER_RESOURCE_GAIN,
  BARD_INSPIRATION_GAIN,
  ARCHER_FOCUS_GAIN,
} from "../../../../constants";
import {
  hasFaithScaling,
  getApplicableFaithBonuses,
  type ParsedFaithBonus,
  hasManaScaling,
  getApplicableManaModifier,
  getApplicableManaModifiers,
  getManaTier,
  type ParsedManaModifier,
} from "../../../../utils/cardHelpers";
import type { Effect } from "../../../../types";

/**
 * Convert a parsed Faith bonus to an Effect that can be applied by applyEffect
 */
function convertFaithBonusToEffect(bonus: ParsedFaithBonus, _targetId: string | null): Effect | null {
  switch (bonus.type) {
    case "damage":
      return {
        type: "damage",
        value: bonus.value || 0,
        target: bonus.target || "monster",
      };
    case "shield":
      return {
        type: "shield",
        value: bonus.value || 0,
        target: bonus.target || "self",
      };
    case "heal":
      return {
        type: "heal",
        value: bonus.value || 0,
        target: bonus.target || "self",
      };
    case "stunDuration":
      // For stun duration bonuses, we extend the stun - this is handled in effect application
      // For now, apply a new stun effect (existing one will stack)
      return {
        type: "stun",
        value: 1,
        target: "monster",
        duration: bonus.value || 1,
      };
    case "cleanse":
      return {
        type: "cleanse",
        target: bonus.target || "ally",
      };
    case "strength":
      return {
        type: "strength",
        value: bonus.value || 0,
        target: bonus.target || "self",
        duration: bonus.duration || 2,
      };
    case "weakness":
      return {
        type: "weakness",
        value: bonus.value || 0,
        target: bonus.target || "monster",
        duration: bonus.duration || 2,
      };
    case "burn":
      return {
        type: "burn",
        value: bonus.value || 0,
        target: bonus.target || "monster",
        duration: bonus.duration || 2,
      };
    case "vulnerable":
      return {
        type: "vulnerable",
        value: bonus.value || 0,
        target: bonus.target || "monster",
        duration: bonus.duration || 2,
      };
    case "block":
      return {
        type: "block",
        value: 1,
        target: "self",
        duration: bonus.duration || 1,
      };
    case "revivePercent":
      // This modifies the revive percentage - for now we'll apply a heal to the revived target
      // This is a special case that would need more complex handling
      return null;
    default:
      return null;
  }
}

/**
 * Generate a human-readable description of a Faith bonus
 */
function describeFaithBonus(bonus: ParsedFaithBonus): string {
  const targetStr = bonus.target === "self" ? " to self" :
                    bonus.target === "allAllies" ? " to all allies" :
                    bonus.target === "allMonsters" ? " to all enemies" :
                    "";

  switch (bonus.type) {
    case "damage":
      return `+${bonus.value} damage${targetStr}`;
    case "shield":
      return `+${bonus.value} shield${targetStr}`;
    case "heal":
      return `+${bonus.value} healing${targetStr}`;
    case "stunDuration":
      return `+${bonus.value} turn(s) stun`;
    case "cleanse":
      return "cleanse debuffs";
    case "strength":
      return `+${bonus.value} Strength for ${bonus.duration || 2} turns`;
    case "weakness":
      return `+${bonus.value} Weakness for ${bonus.duration || 2} turns`;
    case "burn":
      return `+${bonus.value} Burn for ${bonus.duration || 2} turns`;
    case "vulnerable":
      return `+${bonus.value} Vulnerable for ${bonus.duration || 2} turns`;
    case "block":
      return `Block for ${bonus.duration || 1} turn(s)`;
    case "revivePercent":
      return `revive at ${bonus.value}% HP`;
    default:
      return String(bonus.type);
  }
}

/**
 * Convert a parsed Mage mana modifier to an Effect that can be applied by applyEffect
 * Returns null for modifiers that modify existing effects (handled elsewhere)
 */
function convertManaModifierToEffect(modifier: ParsedManaModifier): Effect | null {
  switch (modifier.type) {
    case "stun":
      // New stun effect (Empowered: Stun X turn)
      return {
        type: "stun",
        value: modifier.value || 1,
        target: modifier.target || "allMonsters",
        duration: modifier.duration || 1,
      };
    case "damage":
      // Bonus damage effect
      return {
        type: "damage",
        value: modifier.value || 0,
        target: modifier.target || "monster",
      };
    case "shield":
      return {
        type: "shield",
        value: modifier.value || 0,
        target: modifier.target || "self",
      };
    case "heal":
      return {
        type: "heal",
        value: modifier.value || 0,
        target: modifier.target || "self",
      };
    case "burn":
      // New burn effect (not a tick modifier)
      if (modifier.duration !== 0) {
        return {
          type: "burn",
          value: modifier.value || 0,
          target: modifier.target || "monster",
          duration: modifier.duration || 2,
        };
      }
      return null; // duration 0 means tick modifier, handled elsewhere
    case "frost":
      // New frost effect (not a tick modifier)
      if (modifier.duration !== 0) {
        return {
          type: "frost",
          value: modifier.value || 0,
          target: modifier.target || "monster",
          duration: modifier.duration || 2,
        };
      }
      return null; // duration 0 means tick modifier, handled elsewhere
    case "vulnerable":
      return {
        type: "vulnerable",
        value: modifier.value || 0,
        target: modifier.target || "monster",
        duration: modifier.duration || 2,
      };
    case "weakness":
      return {
        type: "weakness",
        value: modifier.value || 0,
        target: modifier.target || "monster",
        duration: modifier.duration || 2,
      };
    // These modify existing effects, not create new ones
    case "stunDuration":
    case "frostDuration":
    case "missile":
      return null;
    default:
      return null;
  }
}

/**
 * Describe a Mage mana modifier for the combat log
 */
function describeManaModifierBonus(modifier: ParsedManaModifier): string {
  const targetStr = modifier.target === "self" ? " to self" :
                    modifier.target === "allAllies" ? " to all allies" :
                    modifier.target === "allMonsters" ? " to all enemies" :
                    "";

  switch (modifier.type) {
    case "stun":
      return `Stun${targetStr} for ${modifier.duration || 1} turn(s)`;
    case "frostDuration":
      return `extend Frost by ${modifier.value} turn(s)`;
    case "damage":
      return `+${modifier.value} damage${targetStr}`;
    case "shield":
      return `+${modifier.value} shield${targetStr}`;
    case "heal":
      return `+${modifier.value} healing${targetStr}`;
    case "burn":
      return modifier.duration === 0 ? `+${modifier.value} Burn/tick` : `+${modifier.value} Burn${targetStr}`;
    case "frost":
      return modifier.duration === 0 ? `+${modifier.value} Frost/tick` : `+${modifier.value} Frost${targetStr}`;
    case "vulnerable":
      return `+${modifier.value} Vulnerable${targetStr}`;
    case "weakness":
      return `+${modifier.value} Weakness${targetStr}`;
    case "missile":
      return `+${modifier.value} missile(s)`;
    default:
      return String(modifier.type);
  }
}

/**
 * Apply Mage mana modifier to an effect
 * Returns the modified effect with adjusted values
 */
function applyManaModifierToEffect(effect: Effect, modifier: ParsedManaModifier): Effect {
  // Only modify effects that match the modifier type
  if (modifier.type === "damage" && effect.type === "damage") {
    // Check if targeting matches (single vs AOE)
    const isEffectAoe = effect.target === "allMonsters";
    const isModifierAoe = modifier.target === "allMonsters";
    if (isEffectAoe === isModifierAoe) {
      return { ...effect, value: Math.max(0, (effect.value || 0) + modifier.value) };
    }
  }

  if (modifier.type === "shield" && effect.type === "shield") {
    return { ...effect, value: Math.max(0, (effect.value || 0) + modifier.value) };
  }

  if (modifier.type === "heal" && effect.type === "heal") {
    return { ...effect, value: Math.max(0, (effect.value || 0) + modifier.value) };
  }

  // Burn/Ice tick modifiers affect the status effect value
  if (modifier.type === "burn" && effect.type === "burn") {
    return { ...effect, value: Math.max(0, (effect.value || 0) + modifier.value) };
  }

  if (modifier.type === "frost" && effect.type === "frost") {
    return { ...effect, value: Math.max(0, (effect.value || 0) + modifier.value) };
  }

  // Stun duration modifier
  if (modifier.type === "stunDuration" && effect.type === "stun") {
    return { ...effect, duration: Math.max(0, (effect.duration || 1) + modifier.value) };
  }

  return effect;
}

/**
 * Describe a Mage mana modifier for the combat log
 */
function describeManaModifier(modifier: ParsedManaModifier, tier: string): string {
  const sign = modifier.value >= 0 ? "+" : "";
  switch (modifier.type) {
    case "damage":
      return `${tier}: ${sign}${modifier.value} damage`;
    case "shield":
      return `${tier}: ${sign}${modifier.value} shield`;
    case "heal":
      return `${tier}: ${sign}${modifier.value} healing`;
    case "burn":
      return `${tier}: ${sign}${modifier.value} Burn/tick`;
    case "frost":
      return `${tier}: ${sign}${modifier.value} Ice/tick`;
    case "stunDuration":
      return `${tier}: ${sign}${modifier.value} turn(s) stun`;
    case "missile":
      return `${tier}: ${sign}${modifier.value} missile(s)`;
    default:
      return `${tier}: ${sign}${modifier.value} ${modifier.type}`;
  }
}

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

      // Decrement action-tracked debuffs (player's action opportunity passed)
      const updatedDebuffsAfterStun = player.debuffs
        .map((d) => d.useActionTracking ? { ...d, duration: d.duration - 1 } : d)
        .filter((d) => d.duration > 0);

      const logEntries = [
        createLogEntry(turn, "PLAYER_ACTION", `${player.name} is stunned and cannot act!`, "debuff"),
      ];

      // Log expired action-tracked debuffs
      const expiredStunDebuffs = player.debuffs.filter(
        (d) => d.useActionTracking && d.duration === 1
      );
      for (const debuff of expiredStunDebuffs) {
        logEntries.push(createLogEntry(turn, "PLAYER_ACTION", `${player.name}'s ${debuff.type} wore off!`, "info"));
      }

      // Update player with decremented debuffs
      const hasStunAfter = updatedDebuffsAfterStun.some((d) => d.type === "stun");
      const updatedPlayers = players.map((p, idx) =>
        idx === currentPlayerIndex
          ? { ...p, debuffs: updatedDebuffsAfterStun, isStunned: hasStunAfter }
          : p
      );

      set({
        players: updatedPlayers,
        phase: "PLAYER_ACTION", // Set phase so nextPhase() knows where to go
        log: [...get().log, ...logEntries],
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
      ["poison", "burn", "frost", "stun", "weakness"].includes(e.type)
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
    let totalShieldApplied = 0;

    // Log Mage mana state if card has Empowered scaling and is empowered
    // Uses the separate mana pool (not resource/Resonance)
    if (player.class === "mage" && hasManaScaling(selectedCard.description)) {
      const currentMana = player.mana ?? 0;
      const maxMana = player.maxMana ?? 10;
      const manaTier = getManaTier(currentMana, maxMana);
      if (manaTier === "empowered") {
        const manaModifier = getApplicableManaModifier(
          selectedCard.description,
          currentMana,
          maxMana
        );
        if (manaModifier) {
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Empowered! ${describeManaModifier(manaModifier, "Empowered")}`,
              "buff",
              true
            )
          );
        }
      }
    }

    // Apply each effect from the card
    for (const effect of selectedCard.effects) {
      const monsterHpBefore = new Map(updatedMonsters.map((m) => [m.id, m.hp]));
      const playerHpBefore = new Map(updatedPlayers.map((p) => [p.id, p.hp]));
      const playerShieldBefore = new Map(updatedPlayers.map((p) => [p.id, p.shield]));

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

      // Apply Mage Empowered/Depowered modifiers (modify effect values based on mana state)
      // Uses the separate mana pool (not resource/Resonance)
      if (player.class === "mage" && hasManaScaling(selectedCard.description)) {
        const currentMana = player.mana ?? 0;
        const maxMana = player.maxMana ?? 10;
        const manaModifier = getApplicableManaModifier(
          selectedCard.description,
          currentMana,
          maxMana
        );
        if (manaModifier) {
          enhancedEffect = applyManaModifierToEffect(enhancedEffect, manaModifier);
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

      // Track shield applied (for Paladin Faith gain)
      for (const p of updatedPlayers) {
        const shieldBefore = playerShieldBefore.get(p.id) || 0;
        const shieldGained = p.shield - shieldBefore;
        if (shieldGained > 0) {
          totalShieldApplied += shieldGained;
        }
      }
    }

    // Apply Paladin Faith bonuses (card-specific bonuses at 50%/100% Faith)
    if (player.class === "paladin" && hasFaithScaling(selectedCard.description)) {
      const faithBonuses = getApplicableFaithBonuses(
        selectedCard.description,
        player.resource,
        player.maxResource
      );

      for (const bonus of faithBonuses) {
        // Convert parsed bonus to an Effect and apply it
        const bonusEffect = convertFaithBonusToEffect(bonus, targetId);
        if (bonusEffect) {
          const bonusHpBefore = new Map(updatedPlayers.map((p) => [p.id, p.hp]));
          const bonusShieldBefore = new Map(updatedPlayers.map((p) => [p.id, p.shield]));
          const bonusMonsterHpBefore = new Map(updatedMonsters.map((m) => [m.id, m.hp]));

          const result = applyEffect(
            bonusEffect,
            player,
            updatedPlayers,
            updatedMonsters,
            turn,
            targetId,
            environment
          );
          updatedPlayers = result.players;
          updatedMonsters = result.monsters;

          // Log Faith bonus application
          const faithTier = player.resource >= player.maxResource ? "100%" : "50%";
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Faith (${faithTier}) bonus: ${describeFaithBonus(bonus)}`,
              "buff",
              true
            )
          );
          logs.push(...result.logs);

          // Collect XP earned
          for (const [championId, xp] of result.xpEarned) {
            allXpEarned.set(championId, (allXpEarned.get(championId) || 0) + xp);
          }

          // Track additional damage for floating numbers
          for (const monster of updatedMonsters) {
            const hpBefore = bonusMonsterHpBefore.get(monster.id) || monster.hp;
            const damage = hpBefore - monster.hp;
            if (damage > 0) {
              totalDamageDealt += damage;
              damageNumbers.push({ targetId: monster.id, value: damage, type: "damage" });
            }
          }

          // Track additional healing for floating numbers
          for (const p of updatedPlayers) {
            const hpBefore = bonusHpBefore.get(p.id) || p.hp;
            const healing = p.hp - hpBefore;
            if (healing > 0) {
              totalHealing += healing;
              damageNumbers.push({ targetId: p.id, value: healing, type: "heal" });
            }
          }

          // Track additional shield applied (for Faith gain calculation)
          for (const p of updatedPlayers) {
            const shieldBefore = bonusShieldBefore.get(p.id) || 0;
            const shieldGained = p.shield - shieldBefore;
            if (shieldGained > 0) {
              totalShieldApplied += shieldGained;
            }
          }
        }
      }
    }

    // Apply Mage Empowered bonus effects (new effects like Stun, frost duration extension)
    if (player.class === "mage" && hasManaScaling(selectedCard.description)) {
      const currentMana = player.mana ?? 0;
      const maxMana = player.maxMana ?? 10;
      const manaTier = getManaTier(currentMana, maxMana);

      if (manaTier === "empowered") {
        const manaModifiers = getApplicableManaModifiers(
          selectedCard.description,
          currentMana,
          maxMana
        );

        for (const modifier of manaModifiers) {
          // Handle frostDuration: extend existing frost debuffs on monsters
          if (modifier.type === "frostDuration") {
            for (let i = 0; i < updatedMonsters.length; i++) {
              const monster = updatedMonsters[i];
              if (!monster.isAlive) continue;

              const frostIdx = monster.debuffs.findIndex(d => d.type === "frost");
              if (frostIdx !== -1) {
                const updatedDebuffs = [...monster.debuffs];
                updatedDebuffs[frostIdx] = {
                  ...updatedDebuffs[frostIdx],
                  duration: updatedDebuffs[frostIdx].duration + modifier.value,
                };
                updatedMonsters[i] = { ...monster, debuffs: updatedDebuffs };

                logs.push(
                  createLogEntry(
                    turn,
                    "PLAYER_ACTION",
                    `Empowered! ${monster.name}'s Frost extended by ${modifier.value} turn(s)!`,
                    "debuff",
                    true
                  )
                );
              }
            }
            continue; // Don't try to convert this to an effect
          }

          // Convert modifier to an Effect and apply it
          const bonusEffect = convertManaModifierToEffect(modifier);
          if (bonusEffect) {
            const bonusHpBefore = new Map(updatedPlayers.map((p) => [p.id, p.hp]));
            const bonusMonsterHpBefore = new Map(updatedMonsters.map((m) => [m.id, m.hp]));

            const result = applyEffect(
              bonusEffect,
              player,
              updatedPlayers,
              updatedMonsters,
              turn,
              targetId,
              environment
            );
            updatedPlayers = result.players;
            updatedMonsters = result.monsters;

            // Log Mage empowered bonus application
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Empowered bonus: ${describeManaModifierBonus(modifier)}`,
                "buff",
                true
              )
            );
            logs.push(...result.logs);

            // Collect XP earned
            for (const [championId, xp] of result.xpEarned) {
              allXpEarned.set(championId, (allXpEarned.get(championId) || 0) + xp);
            }

            // Track additional damage for floating numbers
            for (const monster of updatedMonsters) {
              const hpBefore = bonusMonsterHpBefore.get(monster.id) || monster.hp;
              const damage = hpBefore - monster.hp;
              if (damage > 0) {
                totalDamageDealt += damage;
                damageNumbers.push({ targetId: monster.id, value: damage, type: "damage" });
              }
            }

            // Track additional healing for floating numbers
            for (const p of updatedPlayers) {
              const hpBefore = bonusHpBefore.get(p.id) || p.hp;
              const healing = p.hp - hpBefore;
              if (healing > 0) {
                totalHealing += healing;
                damageNumbers.push({ targetId: p.id, value: healing, type: "heal" });
              }
            }
          }
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
        // Paladin gains base Faith per card + bonus when healing
        resourceGain = PALADIN_FAITH_BASE_GAIN;
        if (totalHealing > 0) resourceGain += PALADIN_FAITH_HEAL_BONUS;
        break;
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
      case "mage":
        // Mage gains 1 Resonance per spell cast (for special ability)
        resourceGain = 1;
        // Also gain 1 Mana for Empowered scaling (separate pool)
        if (!isEnhanced) {
          const mageIdx = updatedPlayers.findIndex((p) => p.id === currentPlayer.id);
          if (mageIdx !== -1) {
            const currentMana = updatedPlayers[mageIdx].mana ?? 0;
            const maxMana = updatedPlayers[mageIdx].maxMana ?? 10;
            updatedPlayers[mageIdx] = {
              ...updatedPlayers[mageIdx],
              mana: Math.min(currentMana + 1, maxMana),
            };
          }
        }
        break;
      case "barbarian":
        // Barbarian gains Fury from dealing or taking damage
        if (totalDamageDealt > 0) {
          resourceGain = Math.min(3, Math.ceil(totalDamageDealt / 10));
        }
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

    // Move played card to discard, keep unused cards in hand
    const playedCard = player.hand.find((c) => c.id === cardId)!;
    const remainingHand = player.hand.filter((c) => c.id !== cardId);

    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      hand: remainingHand,
      discard: [...updatedPlayers[playerIndex].discard, playedCard],
    };

    // Decrement action-tracked buffs/debuffs for the player who took an action
    const actionPlayer = updatedPlayers[playerIndex];
    const updatedBuffsAfterAction = actionPlayer.buffs
      .map((b) => b.useActionTracking ? { ...b, duration: b.duration - 1 } : b)
      .filter((b) => b.duration > 0);
    const updatedDebuffsAfterAction = actionPlayer.debuffs
      .map((d) => d.useActionTracking ? { ...d, duration: d.duration - 1 } : d)
      .filter((d) => d.duration > 0);

    // Log expired action-tracked effects
    const expiredBuffs = actionPlayer.buffs.filter(
      (b) => b.useActionTracking && b.duration === 1
    );
    const expiredDebuffs = actionPlayer.debuffs.filter(
      (d) => d.useActionTracking && d.duration === 1
    );
    for (const buff of expiredBuffs) {
      logs.push(
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${actionPlayer.name}'s ${buff.type} wore off!`,
          "info",
          true
        )
      );
    }
    for (const debuff of expiredDebuffs) {
      logs.push(
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${actionPlayer.name}'s ${debuff.type} wore off!`,
          "info",
          true
        )
      );
    }

    // Update player with decremented action-tracked effects
    const hasStunAfter = updatedDebuffsAfterAction.some((d) => d.type === "stun");
    const hasStealthAfter = updatedBuffsAfterAction.some((b) => b.type === "stealth");
    const hasTauntAfter = updatedBuffsAfterAction.some((b) => b.type === "taunt");

    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      buffs: updatedBuffsAfterAction,
      debuffs: updatedDebuffsAfterAction,
      isStunned: hasStunAfter,
      isStealth: hasStealthAfter,
      hasTaunt: hasTauntAfter,
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

    // Filter effects for Cleric's Prayer Cycle based on current mode
    if (player.class === "cleric") {
      const mode = player.clericMode || "judgment";
      if (mode === "judgment") {
        // Judgment: damage + strength buff (first 2 effects)
        effectsToApply = effectsToApply.filter(
          (e) => e.type === "damage" || e.type === "strength"
        );
      } else {
        // Benediction: heal + regen (last 2 effects)
        effectsToApply = effectsToApply.filter(
          (e) => e.type === "heal" || e.type === "regen"
        );
      }
      // Switch mode after Prayer Cycle
      finalPlayers[currentPlayerIndex] = {
        ...finalPlayers[currentPlayerIndex],
        clericMode: mode === "judgment" ? "benediction" : "judgment",
      };
      // Log the mode switch
      logs.push(
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} switches to ${mode === "judgment" ? "Benediction" : "Judgment"} mode!`,
          "action"
        )
      );
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

    // Keep hand as-is when using special ability (no card was played)
    // Player will draw to refill next turn if hand is not full

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
