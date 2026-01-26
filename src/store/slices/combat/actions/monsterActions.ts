/**
 * Monster-related combat actions: monsterAct, targeting logic
 */

import type { SetState, GetState } from "../types";
import type { StatusEffect } from "../../../../types";
import { rollD6, createLogEntry, formatDebuffMessage } from "../../../utils";
import {
  ENRAGED_DAMAGE_MULTIPLIER,
  WARRIOR_RAGE_DAMAGE_DIVISOR,
  WARRIOR_RAGE_DAMAGE_MAX_GAIN,
  ARCHER_FOCUS_LOSS,
} from "../../../../constants";

export const createMonsterActions = (set: SetState, get: GetState) => ({
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
        get().addActionMessage(`${monster.name} is stunned!`, "debuff", monster.id);
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

        // Decrement action-tracked debuffs (monster spent an action opportunity)
        const currentMonsters = get().monsters;
        const monsterIdx = currentMonsters.findIndex((m) => m.id === monster.id);
        if (monsterIdx !== -1) {
          const currentMonster = currentMonsters[monsterIdx];
          const updatedDebuffs = currentMonster.debuffs
            .map((d) => d.useActionTracking ? { ...d, duration: d.duration - 1 } : d)
            .filter((d) => d.duration > 0);

          const updatedMonsters = [...currentMonsters];
          updatedMonsters[monsterIdx] = {
            ...currentMonster,
            debuffs: updatedDebuffs,
          };
          set({ monsters: updatedMonsters });
        }

        syncNow();
        await delay(1500);
        continue;
      }

      const actCount = monster.eliteModifier === "fast" ? 2 : 1;

      for (let actionNum = 0; actionNum < actCount; actionNum++) {
        const currentMonster = get().monsters.find((m) => m.id === monster.id);
        if (!currentMonster?.isAlive) break;

        if (actionNum === 1) {
          get().addActionMessage(`${monster.name} acts again! ⚡`, "roll", monster.id);
          syncNow();
          await delay(800);
        }

        const ability =
          monster.intent ||
          monster.abilities.find((a) => a.roll === rollD6()) ||
          monster.abilities[0];

        get().addActionMessage(`${monster.name} uses ${ability.name}!`, "roll", monster.id);
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

        // Trigger monster attack animation (slash for melee damage, cast for other effects)
        const monsterAttackAnim: "slash" | "cast" = ability.damage > 0 ? "slash" : "cast";
        get().triggerAttackAnimation(monster.id, monsterAttackAnim);
        syncNow();
        await delay(900);
        get().clearAttackAnimation();
        await delay(1200);

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
              damage = Math.floor(damage * ENRAGED_DAMAGE_MULTIPLIER);
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
            if (damagedPlayer.class === "fighter" && damage > 0) {
              const rageGain = Math.min(WARRIOR_RAGE_DAMAGE_MAX_GAIN, Math.ceil(damage / WARRIOR_RAGE_DAMAGE_DIVISOR));
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
                resource: Math.max(0, updatedPlayers[playerIndex].resource - ARCHER_FOCUS_LOSS),
              };
            }

            const damageMsg = `${target.name} takes ${damage} damage!${
              !isAlive ? " 💀" : ""
            }`;
            get().addActionMessage(damageMsg, "damage", target.id);
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
            await delay(1800);
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
            "heal",
            monster.id
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
          await delay(1800);
        }

        if (ability.debuff) {
          for (const target of targets) {
            const playerIndex = updatedPlayers.findIndex(
              (p) => p.id === target.id
            );
            if (playerIndex === -1) continue;

            // Stun uses action-based tracking (duration = actions missed)
            const useActionTracking = ability.debuff.type === "stun";

            // Check if debuff of this type already exists - stack by extending duration
            const currentDebuffs = [...updatedPlayers[playerIndex].debuffs];
            const existingDebuffIdx = currentDebuffs.findIndex(d => d.type === ability.debuff!.type);

            if (existingDebuffIdx !== -1) {
              // Stack: extend duration and take higher value
              const existing = currentDebuffs[existingDebuffIdx];
              currentDebuffs[existingDebuffIdx] = {
                ...existing,
                duration: existing.duration + ability.debuff.duration,
                value: Math.max(existing.value, ability.debuff.value),
              };
            } else {
              // New debuff
              const newDebuff: StatusEffect = {
                type: ability.debuff.type,
                value: ability.debuff.value,
                duration: ability.debuff.duration,
                source: monster.name,
                useActionTracking,
              };
              currentDebuffs.push(newDebuff);
            }

            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              debuffs: currentDebuffs,
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
              "debuff",
              target.id
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
            await delay(1500);
          }
        }

        // Decrement action-tracked debuffs (monster took an action)
        const monstersAfterAction = get().monsters;
        const monsterIdx = monstersAfterAction.findIndex((m) => m.id === monster.id);
        if (monsterIdx !== -1) {
          const currentMonster = monstersAfterAction[monsterIdx];
          const updatedDebuffs = currentMonster.debuffs
            .map((d) => d.useActionTracking ? { ...d, duration: d.duration - 1 } : d)
            .filter((d) => d.duration > 0);

          const updatedMonsters = [...monstersAfterAction];
          updatedMonsters[monsterIdx] = {
            ...currentMonster,
            debuffs: updatedDebuffs,
          };
          set({ monsters: updatedMonsters });
        }
      }

      await delay(800);
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
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "defeat" });
      return;
    }

    get().nextPhase();
  },
});
