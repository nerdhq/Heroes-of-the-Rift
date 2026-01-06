// ============================================
// CAMPAIGN DEFINITIONS
// ============================================

import type { CampaignDefinition } from "../types/campaign";

// ============================================
// CAMPAIGN 1: THE FALLEN KINGDOM (Normal)
// ============================================
export const CAMPAIGN_FALLEN_KINGDOM: CampaignDefinition = {
  id: "fallen-kingdom",
  name: "The Fallen Kingdom",
  description: "An ancient kingdom corrupted by dark magic. Face the undead hordes and their Lich King.",
  difficulty: "normal",
  icon: "💀",
  themeColor: "#a855f7",

  introText: `Long ago, the Kingdom of Valdoria stood as a beacon of hope and prosperity.
Its wise King Aldric ruled with justice and compassion for over fifty years.

But when age began to claim him, Aldric grew desperate. He sought forbidden magic,
making a dark pact with forces beyond mortal understanding.

Now, as the Lich King, he commands an army of the undead from his throne of bones.
The once-beautiful kingdom has become a land of eternal darkness and death.

You must descend into the corrupted lands and end his reign of terror.
The fate of the realm rests in your hands.`,

  quests: [
    {
      id: "fk-1",
      name: "The Blighted Village",
      description: "A village overrun by the first wave of undead.",
      introText: `The village of Millbrook was the first to fall when the darkness spread.
Once a peaceful farming community, it now crawls with shambling corpses
and restless spirits. The villagers who couldn't escape became part of the horde.

You must clear the village and discover what happened here.`,
      minRounds: 2,
      maxRounds: 3,
      monsterTiers: ["tier1"],
      monsterLevel: 1,
      eliteChance: 0,
      bossId: "skeleton",
      bossLevel: 1,
      environmentPool: ["crypt"],
    },
    {
      id: "fk-2",
      name: "The Cursed Forest",
      description: "Dark magic has twisted the ancient woods.",
      introText: `The Whispering Woods were once sacred to the druids.
Now the trees themselves seem to hunger for flesh, and dark creatures
lurk in every shadow. The path to the castle leads through here.

Steel your nerves and press forward through the corruption.`,
      minRounds: 2,
      maxRounds: 4,
      monsterTiers: ["tier1", "tier2"],
      monsterLevel: 1,
      eliteChance: 0.1,
      bossId: "werewolf",
      bossLevel: 1,
      environmentPool: ["forest", "swamp"],
    },
    {
      id: "fk-3",
      name: "The Haunted Graveyard",
      description: "The dead refuse to stay buried.",
      introText: `The Royal Cemetery stretches before you, tombstones cracked and defiled.
The Lich King's power is strongest here, where thousands of the kingdom's
dead have risen to serve their new master.

A powerful necromancer coordinates the undead from within. Destroy them.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier1", "tier2"],
      monsterLevel: 2,
      eliteChance: 0.15,
      bossId: "necromancer",
      bossLevel: 2,
      environmentPool: ["crypt"],
    },
    {
      id: "fk-4",
      name: "The Fallen Cathedral",
      description: "A once-holy place now desecrated by dark rituals.",
      introText: `The Grand Cathedral of Light was the spiritual heart of Valdoria.
Now it serves as a temple of darkness, where unholy rituals strengthen
the Lich King's grip on the land.

The screams of tortured souls echo through its corrupted halls.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier2", "tier3"],
      monsterLevel: 2,
      eliteChance: 0.2,
      bossId: "vampire",
      bossLevel: 2,
      bossEliteModifier: "regenerating",
      environmentPool: ["crypt", "castle"],
    },
    {
      id: "fk-5",
      name: "The Castle Gates",
      description: "The outer defenses of the Lich King's stronghold.",
      introText: `Castle Valdoria looms before you, its once-white walls now black with corruption.
The gates are guarded by the Lich King's most loyal servants—knights who
chose undeath over abandoning their king.

Break through their defenses and enter the castle.`,
      minRounds: 3,
      maxRounds: 5,
      monsterTiers: ["tier2", "tier3"],
      monsterLevel: 2,
      eliteChance: 0.25,
      bossId: "dark-knight",
      bossLevel: 3,
      bossEliteModifier: "armored",
      environmentPool: ["castle"],
    },
    {
      id: "fk-6",
      name: "The Throne of Bones",
      description: "Face the Lich King in his seat of power.",
      introText: `You stand before the throne room. Beyond these doors sits Aldric,
the Lich King, surrounded by the bones of those who failed before you.

This is the final battle. End his reign and free Valdoria from eternal darkness.
May the light guide your blades.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier3"],
      monsterLevel: 3,
      eliteChance: 0.3,
      bossId: "lich-king",
      bossLevel: 3,
      environmentPool: ["crypt"],
    },
  ],

  finalBossId: "lich-king",
  finalBossName: "Aldric the Undying",
  finalBossDifficulty: {
    hpMultiplier: 1.75,
    damageMultiplier: 1.4,
    eliteModifier: "regenerating",
  },
  finalBossIntroText: `Aldric rises from his throne of bones, dark energy swirling around him.
His hollow eyes burn with malevolent purple fire.

"Fools! You dare challenge the eternal king? I have conquered death itself!
Your souls will join my army, and your bones will decorate my throne!"

The Lich King raises his staff, and the temperature drops to freezing.
This is it. The final battle for Valdoria begins.`,
};

// ============================================
// CAMPAIGN 2: INFERNAL DEPTHS (Hard)
// ============================================
export const CAMPAIGN_INFERNAL_DEPTHS: CampaignDefinition = {
  id: "infernal-depths",
  name: "Infernal Depths",
  description: "Descend into the volcanic underworld where demons plot to invade the surface.",
  difficulty: "hard",
  icon: "🔥",
  themeColor: "#ef4444",

  introText: `Deep beneath the Scorched Mountains lies a gateway to the Infernal Realm.
For centuries, powerful wards kept the demons contained, but the seals are failing.

Demon Lord Malachar has been gathering his forces, preparing for an invasion
that would plunge the world into eternal hellfire.

You must descend into the volcanic depths, fight through his demonic legions,
and seal the gateway before it's too late. The heat alone has killed many heroes.

Only the strongest and most determined will survive the Infernal Depths.`,

  quests: [
    {
      id: "id-1",
      name: "The Scorched Entrance",
      description: "The volcanic caves leading to the demon realm.",
      introText: `The entrance to the Infernal Depths belches smoke and ash.
Lesser demons have already begun emerging, testing the weakened wards.

Clear them out and descend into the volcanic tunnels below.`,
      minRounds: 2,
      maxRounds: 3,
      monsterTiers: ["tier1", "tier2"],
      monsterLevel: 1,
      eliteChance: 0.1,
      bossId: "imp",
      bossLevel: 2,
      environmentPool: ["volcano"],
    },
    {
      id: "id-2",
      name: "The Lava Flows",
      description: "Rivers of molten rock bar your path.",
      introText: `The tunnels open into vast caverns filled with rivers of lava.
Fire elementals dance across the molten rock, and demons patrol the narrow paths.

Navigate carefully—one wrong step means a fiery death.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier2"],
      monsterLevel: 2,
      eliteChance: 0.15,
      bossId: "elemental",
      bossLevel: 2,
      bossEliteModifier: "enraged",
      environmentPool: ["volcano"],
    },
    {
      id: "id-3",
      name: "The Demon Barracks",
      description: "Where Malachar's army prepares for war.",
      introText: `You've found the demon army's staging ground. Thousands of demons
drill and train here, preparing for the invasion of the surface world.

Cause as much chaos as you can and thin their numbers.`,
      minRounds: 3,
      maxRounds: 5,
      monsterTiers: ["tier2", "tier3"],
      monsterLevel: 2,
      eliteChance: 0.2,
      bossId: "demon",
      bossLevel: 2,
      environmentPool: ["volcano"],
    },
    {
      id: "id-4",
      name: "The Torture Pits",
      description: "Where captured souls are broken and corrupted.",
      introText: `The screams here never stop. This is where demons break the souls
of the captured, turning them into twisted servants of darkness.

End their suffering and destroy the pit masters.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier3"],
      monsterLevel: 2,
      eliteChance: 0.25,
      bossId: "cerberus",
      bossLevel: 3,
      bossEliteModifier: "fast",
      environmentPool: ["volcano", "void"],
    },
    {
      id: "id-5",
      name: "The Hellgate Chamber",
      description: "The gateway between worlds pulses with dark energy.",
      introText: `The Hellgate looms before you, a swirling vortex of fire and shadow.
Malachar's generals guard it, channeling power to keep it open.

Destroy the generals and weaken the gate before facing Malachar himself.`,
      minRounds: 4,
      maxRounds: 5,
      monsterTiers: ["tier3", "tier4"],
      monsterLevel: 3,
      eliteChance: 0.3,
      bossId: "hydra",
      bossLevel: 3,
      bossEliteModifier: "regenerating",
      environmentPool: ["volcano", "void"],
    },
    {
      id: "id-6",
      name: "Malachar's Throne",
      description: "Face the Demon Lord in his seat of infernal power.",
      introText: `Beyond the Hellgate lies Malachar's throne room, a palace of obsidian and flame.
The Demon Lord awaits, confident in his power.

This battle will determine the fate of the world above.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier4"],
      monsterLevel: 3,
      eliteChance: 0.3,
      bossId: "demon-lord",
      bossLevel: 4,
      environmentPool: ["void"],
    },
  ],

  finalBossId: "demon-lord",
  finalBossName: "Malachar the Destroyer",
  finalBossDifficulty: {
    hpMultiplier: 1.85,
    damageMultiplier: 1.5,
    eliteModifier: "enraged",
  },
  finalBossIntroText: `Malachar rises from his throne of skulls, flames wreathing his massive form.
His laughter shakes the very foundations of his palace.

"Mortals! You've come so far, only to burn! Your world will be my conquest,
and your ashes will pave the road for my armies!"

He draws a sword of pure hellfire, its heat warping the air around it.
The final battle for the world's survival begins now.`,
};

// ============================================
// CAMPAIGN 3: DRAGON'S DOMAIN (Nightmare)
// ============================================
export const CAMPAIGN_DRAGONS_DOMAIN: CampaignDefinition = {
  id: "dragons-domain",
  name: "Dragon's Domain",
  description: "Challenge the ancient dragons in their mountain fortress. Only legends survive.",
  difficulty: "nightmare",
  icon: "🐉",
  themeColor: "#eab308",

  introText: `The Dragon Peaks have been forbidden territory for a thousand years.
Here, the ancient dragons slumber, their hoards of treasure beyond imagination.

But the eldest of them all, Vyraxion the Eternal, has awakened.
His hunger threatens to consume entire kingdoms, and his children
have begun raiding the lowlands.

No army can stand against dragonfire. Only a small band of heroes,
striking at the heart of their domain, has any chance of success.

This is a suicide mission. But if you succeed, you will become legends.`,

  quests: [
    {
      id: "dd-1",
      name: "The Mountain Pass",
      description: "The treacherous path into dragon territory.",
      introText: `The only path to the Dragon Peaks is guarded by the dragons' servants—
creatures twisted by proximity to such ancient power.

The air grows thin and cold as you ascend. There is no turning back.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier2", "tier3"],
      monsterLevel: 2,
      eliteChance: 0.2,
      bossId: "gargoyle",
      bossLevel: 2,
      bossEliteModifier: "armored",
      environmentPool: ["iceCave", "castle"],
    },
    {
      id: "dd-2",
      name: "The Wyrmling Nests",
      description: "Where young dragons learn to hunt.",
      introText: `The nesting grounds of the younger dragons. Even these "children"
are deadly beyond measure, their scales already hard as steel.

Thin their numbers before they grow into full terrors.`,
      minRounds: 3,
      maxRounds: 4,
      monsterTiers: ["tier3"],
      monsterLevel: 2,
      eliteChance: 0.25,
      bossId: "elemental",
      bossLevel: 3,
      bossEliteModifier: "fast",
      environmentPool: ["volcano", "iceCave"],
    },
    {
      id: "dd-3",
      name: "The Hoard Caverns",
      description: "Mountains of treasure guarded by ancient magic.",
      introText: `The dragons' treasure hoard stretches as far as the eye can see.
Gold, gems, magical artifacts—the wealth of a hundred conquered kingdoms.

But the hoard is guarded by powerful magic and deadly traps.`,
      minRounds: 3,
      maxRounds: 5,
      monsterTiers: ["tier3", "tier4"],
      monsterLevel: 3,
      eliteChance: 0.3,
      bossId: "mimic",
      bossLevel: 3,
      bossEliteModifier: "shielded",
      environmentPool: ["castle"],
    },
    {
      id: "dd-4",
      name: "The Dragon Shrine",
      description: "A temple to the dragon gods of old.",
      introText: `The dragons worship beings even older than themselves here.
The shrine pulses with primordial power, and its guardians are fearsome.

Desecrate the shrine to weaken Vyraxion's connection to his ancestors.`,
      minRounds: 4,
      maxRounds: 5,
      monsterTiers: ["tier4"],
      monsterLevel: 3,
      eliteChance: 0.35,
      bossId: "hydra",
      bossLevel: 4,
      bossEliteModifier: "regenerating",
      environmentPool: ["void"],
    },
    {
      id: "dd-5",
      name: "The Elder's Rest",
      description: "Where ancient dragons sleep between centuries.",
      introText: `The sleeping chambers of the elder dragons. Most slumber still,
but one has awakened to defend against your intrusion.

Defeat it quickly, before the others wake.`,
      minRounds: 4,
      maxRounds: 5,
      monsterTiers: ["tier4"],
      monsterLevel: 4,
      eliteChance: 0.4,
      bossId: "dragon",
      bossLevel: 4,
      bossEliteModifier: "armored",
      environmentPool: ["volcano", "void"],
    },
    {
      id: "dd-6",
      name: "Vyraxion's Peak",
      description: "The lair of the Eternal Dragon.",
      introText: `You stand at the summit of the highest peak, where Vyraxion makes his lair.
The ancient dragon is older than recorded history, a living god of destruction.

This is the ultimate test. Slay the Eternal Dragon and become legends.`,
      minRounds: 4,
      maxRounds: 5,
      monsterTiers: ["tier4"],
      monsterLevel: 4,
      eliteChance: 0.4,
      bossId: "dragon",
      bossLevel: 5,
      environmentPool: ["volcano"],
    },
  ],

  finalBossId: "dragon",
  finalBossName: "Vyraxion the Eternal",
  finalBossDifficulty: {
    hpMultiplier: 2.0,
    damageMultiplier: 1.6,
    eliteModifier: "fast",
  },
  finalBossIntroText: `Vyraxion unfurls wings that blot out the sky, each scale a shield of adamantine.
His eyes hold the wisdom and cruelty of ten thousand years.

"Insects. You have come to my domain, slain my children, defiled my shrine.
For this, I will not simply kill you. I will erase your very existence from history."

The ancient dragon draws a breath that pulls the air from your lungs.
The battle against a living god begins.`,
};

// ============================================
// ALL CAMPAIGNS
// ============================================
export const CAMPAIGNS: CampaignDefinition[] = [
  CAMPAIGN_FALLEN_KINGDOM,
  CAMPAIGN_INFERNAL_DEPTHS,
  CAMPAIGN_DRAGONS_DOMAIN,
];

// ============================================
// HELPER FUNCTIONS
// ============================================
export const getCampaignById = (id: string): CampaignDefinition | undefined => {
  return CAMPAIGNS.find((c) => c.id === id);
};

export const getDifficultyColor = (difficulty: CampaignDefinition["difficulty"]): string => {
  switch (difficulty) {
    case "normal":
      return "text-green-400";
    case "hard":
      return "text-orange-400";
    case "nightmare":
      return "text-red-400";
    default:
      return "text-stone-400";
  }
};

export const getDifficultyBgColor = (difficulty: CampaignDefinition["difficulty"]): string => {
  switch (difficulty) {
    case "normal":
      return "bg-green-900/30 border-green-500";
    case "hard":
      return "bg-orange-900/30 border-orange-500";
    case "nightmare":
      return "bg-red-900/30 border-red-500";
    default:
      return "bg-stone-900/30 border-stone-500";
  }
};
