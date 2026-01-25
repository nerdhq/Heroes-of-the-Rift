/**
 * Debuff resolution actions: resolveDebuffs
 */

import type { SetState, GetState } from "../types";
import type { LogEntry } from "../../../../types";
import { createLogEntry, distributeGold, applyEnvironmentModifier } from "../../../utils";
import {
  REGENERATING_HEAL_AMOUNT,
  SHIELDED_REGEN_PERCENT,
  SHIELDED_MAX_PERCENT,
} from "../../../../constants";

export const createDebuffActions = (set: SetState, get: GetState) => ({
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
        let newHp = Math.max(0, player.hp - totalDotDamage);
        let isAlive = newHp > 0;

        // Check for surviveLethal buff
        const surviveLethalBuff = player.buffs.find((b) => b.type === "surviveLethal");
        if (!isAlive && surviveLethalBuff) {
          newHp = 1;
          isAlive = true;
          updatedPlayers[i] = {
            ...player,
            hp: newHp,
            isAlive,
            buffs: player.buffs.filter((b) => b.type !== "surviveLethal"),
          };
          logs.push(
            createLogEntry(
              turn,
              "DEBUFF_RESOLUTION",
              `Death's Door! ${player.name} survives at 1 HP!`,
              "heal"
            )
          );
        } else {
          updatedPlayers[i] = {
            ...player,
            hp: newHp,
            isAlive,
          };
        }

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

      // Process regen buffs (heal over time)
      let totalRegen = 0;
      for (const buff of player.buffs) {
        if (buff.type === "regen") {
          totalRegen += buff.value;
        }
      }
      if (totalRegen > 0 && updatedPlayers[i].isAlive) {
        const currentHp = updatedPlayers[i].hp;
        const newHp = Math.min(updatedPlayers[i].maxHp, currentHp + totalRegen);
        const actualHeal = newHp - currentHp;
        if (actualHeal > 0) {
          updatedPlayers[i] = {
            ...updatedPlayers[i],
            hp: newHp,
          };
          logs.push(
            createLogEntry(
              turn,
              "BUFF_RESOLUTION",
              `${player.name} regenerates ${actualHeal} HP!`,
              "heal"
            )
          );
        }
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
        const healAmount = REGENERATING_HEAL_AMOUNT;
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
        const shieldRegen = Math.floor(monster.maxHp * SHIELDED_REGEN_PERCENT);
        const newShield = Math.min(
          Math.floor(monster.maxHp * SHIELDED_MAX_PERCENT),
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
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
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
});
