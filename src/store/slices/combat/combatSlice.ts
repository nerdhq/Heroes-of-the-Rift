/**
 * Combat slice - composes all combat-related action modules
 *
 * This is the main entry point for the combat slice.
 * It combines actions from separate modules for better organization:
 * - phaseActions: startGame, startRound, nextRound, endTurn
 * - cardActions: selectCard, playCard, applyCardEffects, etc.
 * - monsterActions: monsterAct
 * - debuffActions: resolveDebuffs
 * - simultaneousActions: drawCards, drawAllPlayersCards, resolveAllActions, etc.
 */

import type { SliceCreator, CombatActions } from "../../types";
import { createPhaseActions } from "./actions/phaseActions";
import { createCardActions } from "./actions/cardActions";
import { createMonsterActions } from "./actions/monsterActions";
import { createDebuffActions } from "./actions/debuffActions";
import { createSimultaneousActions } from "./actions/simultaneousActions";

export const createCombatSlice: SliceCreator<CombatActions> = (set, get) => {
  // Create all action modules
  const phaseActions = createPhaseActions(set, get);
  const cardActions = createCardActions(set, get);
  const monsterActions = createMonsterActions(set, get);
  const debuffActions = createDebuffActions(set, get);
  const simultaneousActions = createSimultaneousActions(set, get);

  // Compose all actions into a single object
  return {
    // Phase actions
    startGame: phaseActions.startGame,
    startRound: phaseActions.startRound,
    nextRound: phaseActions.nextRound,
    endTurn: phaseActions.endTurn,
    startMockBattle: phaseActions.startMockBattle,

    // Card actions
    selectCard: cardActions.selectCard,
    selectTarget: cardActions.selectTarget,
    confirmTarget: cardActions.confirmTarget,
    needsTargetSelection: cardActions.needsTargetSelection,
    getTargetType: cardActions.getTargetType,
    rollAggro: cardActions.rollAggro,
    playCard: cardActions.playCard,
    applyCardEffects: cardActions.applyCardEffects,
    canUseSpecialAbility: cardActions.canUseSpecialAbility,
    canEnhanceCard: cardActions.canEnhanceCard,
    setEnhanceMode: cardActions.setEnhanceMode,
    useSpecialAbility: cardActions.useSpecialAbility,
    startDiceRoll: cardActions.startDiceRoll,

    // Monster actions
    monsterAct: monsterActions.monsterAct,

    // Debuff actions
    resolveDebuffs: debuffActions.resolveDebuffs,

    // Simultaneous play actions
    drawCards: simultaneousActions.drawCards,
    initializePlayerSelections: simultaneousActions.initializePlayerSelections,
    drawAllPlayersCards: simultaneousActions.drawAllPlayersCards,
    setPlayerSelection: simultaneousActions.setPlayerSelection,
    setPlayerReady: simultaneousActions.setPlayerReady,
    areAllPlayersReady: simultaneousActions.areAllPlayersReady,
    resolveAllActions: simultaneousActions.resolveAllActions,
  };
};
