// Monster sprite imports from MonstersWithUpgrades_v03
// Using idle sprite sheets (4 frames per monster for animation)

// Arcane monsters
import archmage from '../MonstersWithUpgrades_v03/Arcane/archmage_idleSheet.png';
import glimmershell from '../MonstersWithUpgrades_v03/Arcane/glimmershell_idleSheet.png';
import slugmancer from '../MonstersWithUpgrades_v03/Arcane/slugmancer_idleSheet.png';

// Beast monsters
import bat from '../MonstersWithUpgrades_v03/Beasts/Bat_idleSheet.png';
import direwolf from '../MonstersWithUpgrades_v03/Beasts/Direwolf_idleSheet.png';
import whollySpider from '../MonstersWithUpgrades_v03/Beasts/Whollyspider_idleSheet.png';

// Boss monsters
import jeffrey from '../MonstersWithUpgrades_v03/Bosses/Jeffrey_idleSheet.png';
import towerKnight from '../MonstersWithUpgrades_v03/Bosses/TowerKnight_idleSheet.png';

// Earth monsters
import mushroom from '../MonstersWithUpgrades_v03/Earth/Mushroom_idleSheet.png';
import rockman from '../MonstersWithUpgrades_v03/Earth/Rockman_idle.png';
import theBoulder from '../MonstersWithUpgrades_v03/Earth/TheBoulder_idle.png';

// Military monsters
import arbalist from '../MonstersWithUpgrades_v03/Military/Arbalist_idleSheet.png';
import captain from '../MonstersWithUpgrades_v03/Military/Captain_idleSheet.png';
import soldier from '../MonstersWithUpgrades_v03/Military/Soldier_idleSheet.png';

// Mystic monsters
import channeler from '../MonstersWithUpgrades_v03/Mystics/Channeler_idleSheet.png';
import fortuneteller from '../MonstersWithUpgrades_v03/Mystics/Fortuneteller_idleSheet.png';
import seer from '../MonstersWithUpgrades_v03/Mystics/Seer_idleSheet.png';

// Nature monsters
import bigBroot from '../MonstersWithUpgrades_v03/Nature/BigBroot_idleSheet.png';
import bupling from '../MonstersWithUpgrades_v03/Nature/Bupling_idleSheet.png';
import butterfly from '../MonstersWithUpgrades_v03/Nature/Butterfly_idleSheet.png';

// Outlaw monsters
import berserker from '../MonstersWithUpgrades_v03/Outlaws/Berserker_idleSheet.png';
import brawler from '../MonstersWithUpgrades_v03/Outlaws/Brawler_idleSheet.png';
import scoundrel from '../MonstersWithUpgrades_v03/Outlaws/Scoundrel_idleSheet.png';

// Undead monsters
import ectoskull from '../MonstersWithUpgrades_v03/Undead/Ectoskull_idleSheet.png';
import fallenWarrior from '../MonstersWithUpgrades_v03/Undead/FallenWarrior_idleSheet.png';
import spectre from '../MonstersWithUpgrades_v03/Undead/Spectre_idleSheet.png';

// Map monster types to their sprite images
export const MONSTER_IMAGES: Record<string, string> = {
  // Arcane
  archmage,
  glimmershell,
  slugmancer,
  // Beasts
  bat,
  direwolf,
  whollySpider,
  // Bosses
  jeffrey,
  towerKnight,
  // Earth
  mushroom,
  rockman,
  theBoulder,
  // Military
  arbalist,
  captain,
  soldier,
  // Mystics
  channeler,
  fortuneteller,
  seer,
  // Nature
  bigBroot,
  bupling,
  butterfly,
  // Outlaws
  berserker,
  brawler,
  scoundrel,
  // Undead
  ectoskull,
  fallenWarrior,
  spectre,
};

// Monster categories for themed encounters
export const MONSTER_CATEGORIES = {
  arcane: ['archmage', 'glimmershell', 'slugmancer'],
  beasts: ['bat', 'direwolf', 'whollySpider'],
  bosses: ['jeffrey', 'towerKnight'],
  earth: ['mushroom', 'rockman', 'theBoulder'],
  military: ['arbalist', 'captain', 'soldier'],
  mystics: ['channeler', 'fortuneteller', 'seer'],
  nature: ['bigBroot', 'bupling', 'butterfly'],
  outlaws: ['berserker', 'brawler', 'scoundrel'],
  undead: ['ectoskull', 'fallenWarrior', 'spectre'],
} as const;

export default MONSTER_IMAGES;
