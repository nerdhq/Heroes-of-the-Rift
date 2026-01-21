import type { Environment, EnvironmentType } from "../types";
import { BACKGROUND_IMAGES, DEFAULT_BACKGROUND } from "../assets/backgrounds";

// ============================================
// ENVIRONMENT DEFINITIONS
// ============================================

export const ENVIRONMENTS: Record<EnvironmentType, Environment> = {
  forest: {
    type: "forest",
    name: "Ancient Forest",
    description: "A lush woodland where nature's magic flows freely",
    theme: {
      background: "from-green-900 via-green-800 to-emerald-900",
      primaryColor: "#22c55e",
      secondaryColor: "#86efac",
    },
    effects: [
      {
        type: "healingBonus",
        value: 1.25,
        description: "Healing effects are 25% more effective",
      },
      {
        type: "poisonBonus",
        value: 1.3,
        description: "Poison damage increased by 30%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.forest,
  },

  castle: {
    type: "castle",
    name: "Fortress Battlements",
    description: "Stone walls echo with the clash of steel",
    theme: {
      background: "from-stone-800 via-stone-700 to-stone-900",
      primaryColor: "#a8a29e",
      secondaryColor: "#d6d3d1",
    },
    effects: [
      {
        type: "shieldBonus",
        value: 1.3,
        description: "Shield effects are 30% more effective",
      },
      {
        type: "damageBonus",
        value: 1.1,
        description: "Physical damage increased by 10%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.castle,
  },

  volcano: {
    type: "volcano",
    name: "Volcanic Crater",
    description: "Lava flows and scorching heat permeate the air",
    theme: {
      background: "from-red-900 via-orange-800 to-red-950",
      primaryColor: "#ef4444",
      secondaryColor: "#fb923c",
    },
    effects: [
      {
        type: "fireBonus",
        value: 1.5,
        description: "Fire and burn damage increased by 50%",
      },
      {
        type: "frostBonus",
        value: 0.5,
        description: "Ice and frost damage reduced by 50%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.volcano,
  },

  iceCave: {
    type: "iceCave",
    name: "Frozen Cavern",
    description: "Icy stalactites and freezing winds chill to the bone",
    theme: {
      background: "from-cyan-900 via-blue-900 to-indigo-950",
      primaryColor: "#06b6d4",
      secondaryColor: "#67e8f9",
    },
    effects: [
      {
        type: "frostBonus",
        value: 1.5,
        description: "Ice and frost damage increased by 50%",
      },
      {
        type: "fireBonus",
        value: 0.5,
        description: "Fire and burn damage reduced by 50%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.iceCave,
  },

  swamp: {
    type: "swamp",
    name: "Toxic Marshlands",
    description: "Murky waters and noxious fumes fill the air",
    theme: {
      background: "from-lime-900 via-green-950 to-emerald-950",
      primaryColor: "#84cc16",
      secondaryColor: "#a3e635",
    },
    effects: [
      {
        type: "poisonBonus",
        value: 1.6,
        description: "Poison damage increased by 60%",
      },
      {
        type: "healingBonus",
        value: 0.7,
        description: "Healing effects reduced by 30%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.swamp,
  },

  desert: {
    type: "desert",
    name: "Scorching Wastes",
    description: "Endless dunes under a merciless sun",
    theme: {
      background: "from-yellow-800 via-amber-700 to-orange-900",
      primaryColor: "#f59e0b",
      secondaryColor: "#fbbf24",
    },
    effects: [
      {
        type: "fireBonus",
        value: 1.3,
        description: "Fire damage increased by 30%",
      },
      {
        type: "damageBonus",
        value: 1.15,
        description: "All damage increased by 15%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.desert,
  },

  crypt: {
    type: "crypt",
    name: "Haunted Crypt",
    description: "Death magic saturates this cursed place",
    theme: {
      background: "from-violet-950 via-purple-950 to-indigo-950",
      primaryColor: "#a855f7",
      secondaryColor: "#c084fc",
    },
    effects: [
      {
        type: "poisonBonus",
        value: 1.4,
        description: "Poison and curse effects increased by 40%",
      },
      {
        type: "healingBonus",
        value: 0.6,
        description: "Healing effects reduced by 40%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.crypt,
  },

  void: {
    type: "void",
    name: "The Void",
    description: "A realm of chaos where nothing is certain",
    theme: {
      background: "from-black via-purple-950 to-black",
      primaryColor: "#7c3aed",
      secondaryColor: "#a78bfa",
    },
    effects: [
      {
        type: "damageBonus",
        value: 1.25,
        description: "All damage increased by 25%",
      },
      {
        type: "shieldBonus",
        value: 0.75,
        description: "Shield effects reduced by 25%",
      },
    ],
    backgroundImage: BACKGROUND_IMAGES.void,
  },
};

// ============================================
// ENVIRONMENT SELECTION
// ============================================

const ENVIRONMENT_POOL: EnvironmentType[] = [
  "forest",
  "castle",
  "volcano",
  "iceCave",
  "swamp",
  "desert",
  "crypt",
  "void",
];

export const getRandomEnvironment = (): Environment => {
  const randomType =
    ENVIRONMENT_POOL[Math.floor(Math.random() * ENVIRONMENT_POOL.length)];
  return ENVIRONMENTS[randomType];
};

// Get environment based on round (for progression feel)
export const getEnvironmentForRound = (round: number): Environment | null => {
  // 50% chance of no special environment (just a regular dungeon)
  if (Math.random() < 0.5) {
    return null;
  }

  // Early rounds: Natural environments
  if (round <= 2) {
    const earlyEnvironments: EnvironmentType[] = ["forest", "castle", "swamp"];
    const randomType =
      earlyEnvironments[Math.floor(Math.random() * earlyEnvironments.length)];
    return ENVIRONMENTS[randomType];
  }

  // Mid rounds: Elemental/harsh environments
  if (round <= 4) {
    const midEnvironments: EnvironmentType[] = [
      "volcano",
      "iceCave",
      "desert",
    ];
    const randomType =
      midEnvironments[Math.floor(Math.random() * midEnvironments.length)];
    return ENVIRONMENTS[randomType];
  }

  // Late rounds: Dark/mystical environments
  const lateEnvironments: EnvironmentType[] = ["crypt", "void"];
  const randomType =
    lateEnvironments[Math.floor(Math.random() * lateEnvironments.length)];
  return ENVIRONMENTS[randomType];
};

// Export default background for use when no environment is set
export { DEFAULT_BACKGROUND };
