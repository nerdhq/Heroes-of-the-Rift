import type { SliceCreator, CombatActions } from "../types";
import type { SavedParty, LogEntry, ActionMessage, StatusEffect } from "../../types";
import { CLASS_CONFIGS } from "../../data/classes";
import { getMonstersForRound, ROUNDS, getRoundDescription } from "../../data/monsters";
import { getEnvironmentForRound } from "../../data/environments";
import {
  rollD20,
  rollD6,
  rollMonsterIntents,
  shuffleArray,
  createLogEntry,
  applyEffect,
  formatDebuffMessage,
  distributeGold,
  applyEnvironmentModifier,
} from "../utils";

export const createCombatSlice: SliceCreator<CombatActions> = (set, get) => ({
  startGame: () => {
    const { players, selectedClasses, heroNames } = get();

    const savedParty: SavedParty = {
      classes: selectedClasses,
      names: heroNames,
    };

    const shuffledPlayers = players.map((player) => ({
      ...player,
      deck: shuffleArray(player.deck),
    }));

    set({
      players: shuffledPlayers,
      monsters: [],
      round: 1,
      turn: 1,
      currentPlayerIndex: 0,
      phase: "DRAW",
      selectedCardId: null,
      selectedTargetId: null,
      log: [],
      environment: null,
      savedParty,
    });

    get().startRound();
  },

  startRound: () => {
    const { round, players } = get();
    const roundConfig = ROUNDS.find((r) => r.round === round);
    const rawMonsters = getMonstersForRound(round);
    const monsters = rollMonsterIntents(rawMonsters);
    const environment = getEnvironmentForRound(round);

    const refreshedPlayers = players.map((player) => ({
      ...player,
      shield: 0,
    }));

    const firstAlivePlayerIndex = refreshedPlayers.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = refreshedPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      // Campaign mode: fail the campaign
      if (get().campaignProgress) {
        get().failCampaign();
      } else {
        set({ currentScreen: "defeat" });
      }
      return;
    }

    set({
      players: refreshedPlayers,
      monsters,
      environment,
      phase: "DRAW",
      currentPlayerIndex: firstAlivePlayerIndex,
      log: [
        ...get().log,
        createLogEntry(get().turn, "DRAW", `────────────────`, "info"),
        createLogEntry(
          get().turn,
          "DRAW",
          `ROUND ${round}: ${roundConfig?.name || "Unknown"}`,
          "info"
        ),
        createLogEntry(get().turn, "DRAW", getRoundDescription(round), "info"),
        ...(environment
          ? [
              createLogEntry(
                get().turn,
                "DRAW",
                `Environment: ${environment.name} - ${environment.description}`,
                "info"
              ),
            ]
          : []),
        createLogEntry(
          get().turn,
          "DRAW",
          `${monsters.map((m) => m.name).join(" & ")} appear${
            monsters.length > 1 ? "" : "s"
          }!`,
          "info"
        ),
      ],
    });

    // Sync new round state before drawing cards
    get().syncAfterAction();

    // Use simultaneous draw for online mode, sequential for offline
    if (get().isOnline) {
      get().drawAllPlayersCards();
    } else {
      get().drawCards();
    }
  },

  nextRound: () => {
    const { round, maxRounds, players, campaignProgress } = get();

    // Campaign mode: check if this was a boss round (quest complete)
    if (campaignProgress) {
      const isBossRound = round >= maxRounds;
      
      if (isBossRound) {
        // Quest complete - call campaign slice handler
        get().completeQuest();
        return;
      }
      
      // Not boss round - advance to next round within quest
      const healedPlayers = players.map((player) => {
        if (!player.isAlive) return player;
        const missingHp = player.maxHp - player.hp;
        const healAmount = Math.floor(missingHp * 0.5);
        return {
          ...player,
          hp: Math.min(player.maxHp, player.hp + healAmount),
          baseAggro: 0,
          diceAggro: 0,
          gold: player.gold + 1,
          deck: shuffleArray([...player.deck, ...player.discard]),
          discard: [],
          hand: [],
        };
      });

      const alivePlayerCount = players.filter((p) => p.isAlive).length;
      get().addUserGold(alivePlayerCount);

      // Update campaign progress
      const updatedProgress = {
        ...campaignProgress,
        currentRound: campaignProgress.currentRound + 1,
      };
      localStorage.setItem("campaignProgress", JSON.stringify(updatedProgress));

      set({
        round: round + 1,
        turn: get().turn + 1,
        players: healedPlayers,
        playerSelections: [],
        roundGoldEarned: alivePlayerCount,
        campaignProgress: updatedProgress,
        currentScreen: "roundComplete",
      });

      get().syncAfterAction();
      return;
    }

    // Non-campaign mode: original logic
    if (round >= maxRounds) {
      // Save gold to champion before showing victory
      const { activeChampion, players: currentPlayers } = get();
      if (activeChampion) {
        const championPlayer = currentPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "victory" });
      return;
    }

    const healedPlayers = players.map((player) => {
      if (!player.isAlive) return player;
      const missingHp = player.maxHp - player.hp;
      const healAmount = Math.floor(missingHp * 0.5);
      return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + healAmount),
        baseAggro: 0,
        diceAggro: 0,
        gold: player.gold + 1, // Award 1 gold for completing the round
        deck: shuffleArray([...player.deck, ...player.discard]),
        discard: [],
        hand: [],
      };
    });

    // Award 1 gold to user's persistent gold for each alive player
    const alivePlayerCount = players.filter((p) => p.isAlive).length;
    get().addUserGold(alivePlayerCount);

    set({
      round: round + 1,
      turn: get().turn + 1,
      players: healedPlayers,
      playerSelections: [], // Clear selections for new round
      roundGoldEarned: alivePlayerCount,
      currentScreen: "roundComplete",
    });

    // Sync round transition
    get().syncAfterAction();
  },

  drawCards: () => {
    const { players, currentPlayerIndex, turn, phase } = get();
    const player = players[currentPlayerIndex];

    if (!player.isAlive) {
      const nextAlivePlayer = players.findIndex(
        (p, i) => i > currentPlayerIndex && p.isAlive
      );

      if (nextAlivePlayer !== -1) {
        set({
          currentPlayerIndex: nextAlivePlayer,
        });
        get().drawCards();
      } else {
        set({ phase: "MONSTER_ACTION" });
        get().monsterAct();
      }
      return;
    }

    let deck = [...player.deck];
    let discard = [...player.discard];
    const hand: typeof player.hand = [];

    for (let i = 0; i < 2; i++) {
      if (deck.length === 0 && discard.length > 0) {
        deck = shuffleArray(discard);
        discard = [];
      }
      if (deck.length > 0) {
        hand.push(deck.pop()!);
      }
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      deck,
      discard,
      hand,
    };

    set({
      players: updatedPlayers,
      phase: "SELECT",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          phase,
          `${player.name} draws ${hand.map((c) => c.name).join(", ")}`,
          "info"
        ),
      ],
    });

    // Sync to other players if online
    get().syncAfterAction();
  },

  selectCard: (cardId) => {
    const { phase } = get();
    if (phase === "SELECT") {
      set({ selectedCardId: cardId, selectedTargetId: null });
    }
  },

  selectTarget: (targetId) => {
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
      get().addActionMessage(`${player.name} is stunned!`, "debuff");
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

    // Show action message
    set({ phase: "PLAYER_ACTION", enhanceMode: false });
    get().addActionMessage(`${player.name} plays ${selectedCard.name}!${enhanceText}`, "action");
    set({
      log: [
        ...get().log,
        createLogEntry(turn, "PLAYER_ACTION", `${player.name} plays ${selectedCard.name}!${enhanceText}`, "action"),
      ],
    });

    await delay(800);

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
      get().addActionMessage(logEntry.message, msgType as ActionMessage["type"]);
      set({ log: [...get().log, logEntry] });
      await delay(1000);
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
  applyCardEffects: (playerIndex, cardId, targetId, isEnhanced) => {
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
      case "warrior":
        if (totalDamageDealt > 0) resourceGain = Math.min(2, Math.ceil(totalDamageDealt / 10));
        break;
      case "rogue":
        resourceGain = 1;
        break;
      case "paladin":
      case "priest":
        if (totalHealing > 0) resourceGain = 2;
        break;
      case "bard":
        if (selectedCard.effects.some((e) => ["strength", "shield", "block"].includes(e.type))) {
          resourceGain = 1;
        }
        break;
      case "archer":
        resourceGain = 1;
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

  monsterAct: async () => {
    const { players, monsters, turn } = get();
    const updatedPlayers = [...players];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Helper to sync state for real-time updates
    const syncNow = () => get().syncAfterAction();

    for (const monster of monsters) {
      if (!monster.isAlive) continue;

      const isStunned = monster.debuffs.some((d) => d.type === "stun");
      if (isStunned) {
        get().addActionMessage(`${monster.name} is stunned!`, "debuff");
        set({
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${monster.name} is stunned and cannot act!`,
              "debuff"
            ),
          ],
        });
        syncNow();
        await delay(1500);
        continue;
      }

      const actCount = monster.eliteModifier === "fast" ? 2 : 1;

      for (let actionNum = 0; actionNum < actCount; actionNum++) {
        const currentMonster = get().monsters.find((m) => m.id === monster.id);
        if (!currentMonster?.isAlive) break;

        if (actionNum === 1) {
          get().addActionMessage(`${monster.name} acts again! ⚡`, "roll");
          syncNow();
          await delay(800);
        }

        const ability =
          monster.intent ||
          monster.abilities.find((a) => a.roll === rollD6()) ||
          monster.abilities[0];

        get().addActionMessage(`${monster.name} uses ${ability.name}!`, "roll");
        set({
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${monster.name} uses ${ability.name}!`,
              "roll"
            ),
          ],
        });
        syncNow();
        await delay(1500);

        const alivePlayers = updatedPlayers.filter((p) => p.isAlive);
        if (alivePlayers.length === 0) continue;

        const tauntPlayer = alivePlayers.find((p) => p.hasTaunt);

        let targets: typeof alivePlayers = [];
        if (ability.target === "all") {
          targets = alivePlayers.filter((p) => !p.isStealth);
        } else if (ability.target === "random") {
          const validTargets = alivePlayers.filter((p) => !p.isStealth);
          if (validTargets.length > 0) {
            targets = [
              validTargets[Math.floor(Math.random() * validTargets.length)],
            ];
          }
        } else {
          if (tauntPlayer && !tauntPlayer.isStealth) {
            targets = [tauntPlayer];
          } else {
            const validTargets = alivePlayers.filter((p) => !p.isStealth);
            if (validTargets.length > 0) {
              validTargets.sort(
                (a, b) =>
                  b.baseAggro + b.diceAggro - (a.baseAggro + a.diceAggro)
              );
              targets = [validTargets[0]];
            }
          }
        }

        if (ability.damage > 0) {
          for (const target of targets) {
            const playerIndex = updatedPlayers.findIndex(
              (p) => p.id === target.id
            );
            if (playerIndex === -1) continue;

            let damage = ability.damage;

            if (monster.eliteModifier === "enraged") {
              damage = Math.floor(damage * 1.5);
            }

            const weakness = monster.debuffs.find((d) => d.type === "weakness");
            if (weakness) {
              damage = Math.max(0, damage - weakness.value);
            }

            let remainingDamage = damage;
            let newShield = updatedPlayers[playerIndex].shield;
            if (newShield > 0) {
              if (newShield >= remainingDamage) {
                newShield -= remainingDamage;
                remainingDamage = 0;
              } else {
                remainingDamage -= newShield;
                newShield = 0;
              }
            }

            const newHp = Math.max(
              0,
              updatedPlayers[playerIndex].hp - remainingDamage
            );
            const isAlive = newHp > 0;

            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              hp: newHp,
              shield: newShield,
              isAlive,
            };

            get().addDamageNumber(target.id, damage, "damage");

            const damagedPlayer = updatedPlayers[playerIndex];
            if (damagedPlayer.class === "warrior" && damage > 0) {
              const rageGain = Math.min(2, Math.ceil(damage / 15));
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                resource: Math.min(
                  updatedPlayers[playerIndex].resource + rageGain,
                  updatedPlayers[playerIndex].maxResource
                ),
              };
            } else if (damagedPlayer.class === "archer" && damage > 0) {
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                resource: Math.max(0, updatedPlayers[playerIndex].resource - 1),
              };
            }

            const damageMsg = `${target.name} takes ${damage} damage!${
              !isAlive ? " 💀" : ""
            }`;
            get().addActionMessage(damageMsg, "damage");
            set({
              players: updatedPlayers,
              log: [
                ...get().log,
                createLogEntry(
                  turn,
                  "MONSTER_ACTION",
                  `${monster.name} deals ${damage} damage to ${target.name}!${
                    !isAlive ? ` ${target.name} falls!` : ""
                  }`,
                  "damage"
                ),
              ],
            });
            await delay(1200);
          }
        } else if (ability.damage < 0) {
          const monsterIndex = monsters.findIndex((m) => m.id === monster.id);
          const healAmount = Math.abs(ability.damage);
          const newHp = Math.min(monster.maxHp, monster.hp + healAmount);
          const updatedMonster = { ...monster, hp: newHp };
          const updatedMonstersArray = [...monsters];
          updatedMonstersArray[monsterIndex] = updatedMonster;

          get().addDamageNumber(monster.id, healAmount, "heal");

          get().addActionMessage(
            `${monster.name} heals for ${healAmount}!`,
            "heal"
          );
          set({
            monsters: updatedMonstersArray,
            log: [
              ...get().log,
              createLogEntry(
                turn,
                "MONSTER_ACTION",
                `${monster.name} heals for ${healAmount}!`,
                "heal"
              ),
            ],
          });
          await delay(1200);
        }

        if (ability.debuff) {
          for (const target of targets) {
            const playerIndex = updatedPlayers.findIndex(
              (p) => p.id === target.id
            );
            if (playerIndex === -1) continue;

            const newDebuff: StatusEffect = {
              type: ability.debuff.type,
              value: ability.debuff.value,
              duration: ability.debuff.duration,
              source: monster.name,
            };

            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              debuffs: [...updatedPlayers[playerIndex].debuffs, newDebuff],
              isStunned:
                ability.debuff.type === "stun" ||
                updatedPlayers[playerIndex].isStunned,
              accuracyPenalty:
                ability.debuff.type === "accuracy"
                  ? updatedPlayers[playerIndex].accuracyPenalty +
                    ability.debuff.value
                  : updatedPlayers[playerIndex].accuracyPenalty,
            };

            get().addActionMessage(
              `${target.name} is ${formatDebuffMessage(ability.debuff!.type)}!`,
              "debuff"
            );
            set({
              players: updatedPlayers,
              log: [
                ...get().log,
                createLogEntry(
                  turn,
                  "MONSTER_ACTION",
                  `${target.name} is afflicted with ${ability.debuff!.type}!`,
                  "debuff"
                ),
              ],
            });
            await delay(1000);
          }
        }
      }

      await delay(500);
    }

    set({
      players: updatedPlayers,
      selectedTargetId: null, // Clear any target highlight after monster attacks
    });

    // Sync to other players if online
    get().syncAfterAction();

    if (updatedPlayers.every((p) => !p.isAlive)) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = updatedPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "defeat" });
      return;
    }

    get().nextPhase();
  },

  resolveDebuffs: () => {
    const { players, monsters, turn, environment } = get();
    let updatedPlayers = [...players];
    const updatedMonsters = [...monsters];
    const logs: LogEntry[] = [];

    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (!player.isAlive) continue;

      let totalDotDamage = 0;
      const dotSources: string[] = [];

      for (const debuff of player.debuffs) {
        if (debuff.type === "poison") {
          const poisonDamage = applyEnvironmentModifier(debuff.value, "poison", environment);
          totalDotDamage += poisonDamage;
          dotSources.push(`poison (${poisonDamage})`);
        } else if (debuff.type === "burn") {
          const burnDamage = applyEnvironmentModifier(debuff.value, "burn", environment);
          totalDotDamage += burnDamage;
          dotSources.push(`burn (${burnDamage})`);
        } else if (debuff.type === "ice") {
          const iceDamage = applyEnvironmentModifier(debuff.value, "ice", environment);
          totalDotDamage += iceDamage;
          dotSources.push(`frost (${iceDamage})`);
        }
      }

      if (totalDotDamage > 0) {
        const newHp = Math.max(0, player.hp - totalDotDamage);
        const isAlive = newHp > 0;

        updatedPlayers[i] = {
          ...player,
          hp: newHp,
          isAlive,
        };

        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${
              player.name
            } takes ${totalDotDamage} damage from ${dotSources.join(", ")}!${
              !isAlive ? ` ${player.name} falls!` : ""
            }`,
            "damage"
          )
        );
      }

      const updatedDebuffs = player.debuffs
        .map((d) => ({ ...d, duration: d.duration - 1 }))
        .filter((d) => d.duration > 0);

      const hasStun = updatedDebuffs.some((d) => d.type === "stun");
      const hasStealth = updatedPlayers[i].buffs.some(
        (b) => b.type === "stealth"
      );
      const hasTaunt = updatedPlayers[i].buffs.some((b) => b.type === "taunt");
      const accuracyPenalty = updatedDebuffs
        .filter((d) => d.type === "accuracy")
        .reduce((sum, d) => sum + d.value, 0);

      const updatedBuffs = updatedPlayers[i].buffs
        .map((b) => ({ ...b, duration: b.duration - 1 }))
        .filter((b) => b.duration > 0);

      updatedPlayers[i] = {
        ...updatedPlayers[i],
        debuffs: updatedDebuffs,
        buffs: updatedBuffs,
        isStunned: hasStun,
        isStealth: hasStealth,
        hasTaunt: hasTaunt,
        accuracyPenalty,
      };
    }

    for (let i = 0; i < updatedMonsters.length; i++) {
      const monster = updatedMonsters[i];
      if (!monster.isAlive) continue;

      let totalDotDamage = 0;
      const dotSources: string[] = [];

      for (const debuff of monster.debuffs) {
        if (debuff.type === "poison") {
          const modifiedValue = applyEnvironmentModifier(debuff.value, "poison", environment);
          totalDotDamage += modifiedValue;
          dotSources.push(`poison (${modifiedValue})`);
        } else if (debuff.type === "burn") {
          const modifiedValue = applyEnvironmentModifier(debuff.value, "burn", environment);
          totalDotDamage += modifiedValue;
          dotSources.push(`burn (${modifiedValue})`);
        } else if (debuff.type === "ice") {
          const modifiedValue = applyEnvironmentModifier(debuff.value, "ice", environment);
          totalDotDamage += modifiedValue;
          dotSources.push(`frost (${modifiedValue})`);
        }
      }

      if (totalDotDamage > 0) {
        const newHp = Math.max(0, monster.hp - totalDotDamage);
        const isAlive = newHp > 0;

        updatedMonsters[i] = {
          ...monster,
          hp: newHp,
          isAlive,
        };

        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${
              monster.name
            } takes ${totalDotDamage} damage from ${dotSources.join(", ")}!${
              !isAlive ? ` ${monster.name} is defeated!` : ""
            }`,
            "damage"
          )
        );

        if (monster.isAlive && !isAlive) {
          const goldDistribution = distributeGold(
            updatedPlayers,
            monster.goldReward
          );
          updatedPlayers = goldDistribution.players;
          logs.push(
            createLogEntry(
              turn,
              "DEBUFF_RESOLUTION",
              goldDistribution.message,
              "info"
            )
          );
        }
      }

      if (monster.eliteModifier === "regenerating" && monster.isAlive) {
        const healAmount = 10;
        const newHp = Math.min(
          monster.maxHp,
          updatedMonsters[i].hp + healAmount
        );
        updatedMonsters[i] = {
          ...updatedMonsters[i],
          hp: newHp,
        };
        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${monster.name} regenerates ${healAmount} HP! 💚`,
            "heal"
          )
        );
      }

      if (monster.eliteModifier === "shielded" && monster.isAlive) {
        const shieldRegen = Math.floor(monster.maxHp * 0.1);
        const newShield = Math.min(
          Math.floor(monster.maxHp * 0.2),
          updatedMonsters[i].shield + shieldRegen
        );
        if (newShield > updatedMonsters[i].shield) {
          updatedMonsters[i] = {
            ...updatedMonsters[i],
            shield: newShield,
          };
          logs.push(
            createLogEntry(
              turn,
              "DEBUFF_RESOLUTION",
              `${monster.name}'s shield regenerates! 🔰`,
              "buff"
            )
          );
        }
      }

      const updatedDebuffs = monster.debuffs
        .map((d) => ({ ...d, duration: d.duration - 1 }))
        .filter((d) => d.duration > 0);

      updatedMonsters[i] = {
        ...updatedMonsters[i],
        debuffs: updatedDebuffs,
      };
    }

    set({
      players: updatedPlayers,
      monsters: updatedMonsters,
      log: [...get().log, ...logs],
    });

    if (updatedMonsters.every((m) => !m.isAlive)) {
      const { round } = get();
      if (round > 2) {
        get().startShopPhase();
      } else {
        get().startRewardPhase();
      }
      return;
    }
    if (updatedPlayers.every((p) => !p.isAlive)) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = updatedPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      // Campaign mode: fail the campaign
      if (get().campaignProgress) {
        get().failCampaign();
      } else {
        set({ currentScreen: "defeat" });
      }
      return;
    }

    get().nextPhase();
  },

  endTurn: () => {
    const { turn, players, monsters, isOnline } = get();

    const firstAlivePlayerIndex = players.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = players.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      // Campaign mode: fail the campaign
      if (get().campaignProgress) {
        get().failCampaign();
      } else {
        set({ currentScreen: "defeat" });
      }
      return;
    }

    const updatedMonsters = rollMonsterIntents(monsters);

    get().regenerateResources();

    set({
      currentPlayerIndex: firstAlivePlayerIndex,
      turn: turn + 1,
      phase: "DRAW",
      monsters: updatedMonsters,
      log: [
        ...get().log,
        createLogEntry(turn + 1, "DRAW", `--- Turn ${turn + 1} ---`, "info"),
      ],
    });

    // Use simultaneous draw for online mode, sequential for offline
    if (isOnline) {
      get().drawAllPlayersCards();
    } else {
      get().drawCards();
    }
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

  setEnhanceMode: (enabled) => {
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
      "action"
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
    await delay(1200);

    let finalPlayers = updatedPlayers;
    let finalMonsters = [...monsters];
    const logs: LogEntry[] = [];

    for (const effect of config.specialAbility.effects) {
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
        msgType as ActionMessage["type"]
      );
      set({ log: [...get().log, logEntry] });
      await delay(1000);
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

  // ============================================
  // SIMULTANEOUS PLAY ACTIONS
  // ============================================

  // Initialize player selections at start of turn
  initializePlayerSelections: () => {
    const { players } = get();
    const selections = players
      .filter((p) => p.isAlive)
      .map((p) => ({
        playerId: p.id,
        cardId: null,
        targetId: null,
        isReady: false,
        enhanceMode: false,
      }));
    set({ playerSelections: selections });
  },

  // Draw cards for ALL players at once
  drawAllPlayersCards: () => {
    const { players, turn, phase } = get();
    const updatedPlayers = [...players];

    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (!player.isAlive) continue;

      let deck = [...player.deck];
      let discard = [...player.discard];
      const hand: typeof player.hand = [];

      for (let j = 0; j < 2; j++) {
        if (deck.length === 0 && discard.length > 0) {
          deck = shuffleArray(discard);
          discard = [];
        }
        if (deck.length > 0) {
          hand.push(deck.pop()!);
        }
      }

      updatedPlayers[i] = {
        ...player,
        deck,
        discard,
        hand,
      };
    }

    // Initialize player selections
    const selections = updatedPlayers
      .filter((p) => p.isAlive)
      .map((p) => ({
        playerId: p.id,
        cardId: null,
        targetId: null,
        isReady: false,
        enhanceMode: false,
      }));

    set({
      players: updatedPlayers,
      playerSelections: selections,
      phase: "SELECT",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          phase,
          `All players draw their cards`,
          "info"
        ),
      ],
    });

    // Sync to other players if online
    get().syncAfterAction();
  },

  // Set card/target selection for a specific player
  setPlayerSelection: (playerId, cardId, targetId, enhanceMode = false) => {
    const { playerSelections } = get();
    const updatedSelections = playerSelections.map((sel) =>
      sel.playerId === playerId
        ? { ...sel, cardId, targetId, enhanceMode }
        : sel
    );
    set({ playerSelections: updatedSelections });

    // Sync to other players if online
    get().syncAfterAction();
  },

  // Mark a player as ready
  setPlayerReady: (playerId, isReady) => {
    const { playerSelections, isOnline, isHost } = get();
    const updatedSelections = playerSelections.map((sel) =>
      sel.playerId === playerId ? { ...sel, isReady } : sel
    );
    set({ playerSelections: updatedSelections });

    // Sync to other players if online
    get().syncAfterAction();

    // Check if all players are ready - only host triggers resolve
    const allReady = updatedSelections.every((sel) => sel.isReady);
    if (allReady) {
      if (isOnline) {
        // For online mode, only the host triggers resolve
        // This happens via handleStateUpdate when all selections are synced
        if (isHost) {
          // Small delay to ensure all syncs are received
          setTimeout(() => {
            const { playerSelections: latestSelections, phase } = get();
            // Double-check all are still ready and we haven't already started resolving
            if (phase === "SELECT" && latestSelections.every((sel) => sel.isReady)) {
              get().resolveAllActions();
            }
          }, 500);
        }
      } else {
        // For offline mode, trigger immediately
        get().resolveAllActions();
      }
    }
  },

  // Check if all players are ready
  areAllPlayersReady: () => {
    const { playerSelections } = get();
    return playerSelections.length > 0 && playerSelections.every((sel) => sel.isReady);
  },

  // Execute all player actions simultaneously
  resolveAllActions: async () => {
    const { players, playerSelections, turn } = get();

    set({ phase: "AGGRO" });

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Helper to sync state for real-time updates
    const syncNow = () => get().syncAfterAction();

    let updatedPlayers = [...players];
    const logs: LogEntry[] = [];

    // Phase 1: Roll aggro dice for all players
    get().addActionMessage("Rolling aggro dice...", "roll");
    syncNow();
    await delay(500);

    for (const selection of playerSelections) {
      const playerIndex = updatedPlayers.findIndex((p) => p.id === selection.playerId);
      if (playerIndex === -1) continue;

      const player = updatedPlayers[playerIndex];
      if (!player.isAlive || player.isStunned || !selection.cardId) continue;

      const selectedCard = player.hand.find((c) => c.id === selection.cardId);
      if (!selectedCard) continue;

      // Animate dice roll
      set((state) => ({
        animation: { ...state.animation, diceRolling: true, diceRoll: null },
      }));

      for (let i = 0; i < 8; i++) {
        const fakeRoll = Math.floor(Math.random() * 20) + 1;
        set((state) => ({ animation: { ...state.animation, diceRoll: fakeRoll } }));
        await delay(80);
      }

      const diceRoll = rollD20();
      const cardAggro = selectedCard.aggro;
      const newBaseAggro = player.baseAggro + cardAggro;
      const totalAggro = newBaseAggro + diceRoll;

      set((state) => ({
        animation: { ...state.animation, diceRoll: diceRoll, diceRolling: false },
      }));

      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        baseAggro: newBaseAggro,
        diceAggro: diceRoll,
      };

      set({ players: updatedPlayers });
      get().addActionMessage(`${player.name} rolls ${diceRoll} (+${cardAggro} card) = ${totalAggro} aggro`, "roll");
      logs.push(createLogEntry(turn, "AGGRO", `${player.name} rolls D20: ${diceRoll} + ${newBaseAggro} base = ${totalAggro} aggro`, "roll"));
      syncNow();
      await delay(600);
    }

    set((state) => ({ animation: { ...state.animation, diceRoll: null, diceRolling: false } }));
    await delay(500);

    // Phase 2: Process each player's action using shared applyCardEffects
    set({ phase: "RESOLVE" });
    syncNow();

    for (const selection of playerSelections) {
      const currentPlayers = get().players;
      const playerIndex = currentPlayers.findIndex((p) => p.id === selection.playerId);
      if (playerIndex === -1) continue;

      const player = currentPlayers[playerIndex];
      if (!player.isAlive) continue;

      if (player.isStunned) {
        get().addActionMessage(`${player.name} is stunned!`, "debuff");
        logs.push(createLogEntry(turn, "RESOLVE", `${player.name} is stunned and cannot act!`, "debuff"));
        continue;
      }

      const selectedCard = player.hand.find((c) => c.id === selection.cardId);
      if (!selectedCard) continue;

      const isEnhanced = selection.enhanceMode && player.resource >= player.maxResource;
      const enhanceText = isEnhanced ? " (ENHANCED!)" : "";

      get().addActionMessage(`${player.name} plays ${selectedCard.name}!${enhanceText}`, "action");
      logs.push(createLogEntry(turn, "RESOLVE", `${player.name} plays ${selectedCard.name}!${enhanceText}`, "action"));
      syncNow();
      await delay(800);

      // Use shared effect application function
      const result = get().applyCardEffects(playerIndex, selection.cardId!, selection.targetId, isEnhanced);

      // Show damage numbers
      for (const dn of result.damageNumbers) {
        get().addDamageNumber(dn.targetId, dn.value, dn.type);
      }

      // Award XP
      for (const [championId, xp] of result.xpEarned) {
        get().addXP(championId, xp);
      }

      // Update store with results (so next player sees updated state)
      set({ players: result.players, monsters: result.monsters });
      logs.push(...result.logs);
      syncNow();
      await delay(500);
    }

    // Final state update
    set({
      playerSelections: [],
      log: [...get().log, ...logs],
    });
    syncNow();

    // Check for victory/defeat
    const finalMonsters = get().monsters;
    const finalPlayers = get().players;

    if (finalMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    if (finalPlayers.every((p) => !p.isAlive)) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = finalPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer && championPlayer.gold > 0) {
          get().addChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "defeat" });
      return;
    }

    set({ phase: "MONSTER_ACTION" });
    get().monsterAct();
  },
});
