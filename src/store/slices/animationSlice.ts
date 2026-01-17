import type { SliceCreator, AnimationActions } from "../types";
import { generateId } from "../utils";

export const createAnimationSlice: SliceCreator<AnimationActions> = (set) => ({
  setAnimation: (animationUpdate) => {
    set((state) => ({
      animation: { ...state.animation, ...animationUpdate },
    }));
  },

  addActionMessage: (text, type) => {
    const newMessage = {
      id: generateId(),
      text,
      type,
      timestamp: Date.now(),
    };
    set((state) => ({
      animation: {
        ...state.animation,
        actionMessages: [...state.animation.actionMessages, newMessage],
      },
    }));
  },

  clearActionMessages: () => {
    set((state) => ({
      animation: { ...state.animation, actionMessages: [] },
    }));
  },

  addDamageNumber: (targetId, value, type) => {
    const newDamageNumber = {
      id: generateId(),
      targetId,
      value,
      type,
    };
    set((state) => ({
      animation: {
        ...state.animation,
        damageNumbers: [...state.animation.damageNumbers, newDamageNumber],
      },
    }));
    setTimeout(() => {
      set((state) => ({
        animation: {
          ...state.animation,
          damageNumbers: state.animation.damageNumbers.filter(
            (d) => d.id !== newDamageNumber.id
          ),
        },
      }));
    }, 1500);
  },

  triggerAttackAnimation: (entityId, animation) => {
    set((state) => ({
      animation: {
        ...state.animation,
        attackingEntityId: entityId,
        attackAnimation: animation,
      },
    }));
  },

  clearAttackAnimation: () => {
    set((state) => ({
      animation: {
        ...state.animation,
        attackingEntityId: null,
        attackAnimation: null,
      },
    }));
  },
});
