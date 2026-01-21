// Background images from FantasyBattleBackgrounds_v05
// Each environment type maps to an appropriate background

import caveBackground from '../FantasyBattleBackgrounds_v05/Cave/CaveComposite.png';
import forestBackground from '../FantasyBattleBackgrounds_v05/Forest/ForestComposite.png';
import keepBackground from '../FantasyBattleBackgrounds_v05/Keep/Keep.png';
import plainsBackground from '../FantasyBattleBackgrounds_v05/Plains/Plains.png';
import ruinsBackground from '../FantasyBattleBackgrounds_v05/Ruins/RuinsCompositeSample.png';
import townBackground from '../FantasyBattleBackgrounds_v05/Town/TownComposite.png';

// Map environment types to background images
export const BACKGROUND_IMAGES = {
  // Natural environments
  forest: forestBackground,
  plains: plainsBackground,

  // Structures
  castle: keepBackground,
  town: townBackground,
  ruins: ruinsBackground,

  // Underground
  cave: caveBackground,

  // Elemental - use closest match
  volcano: caveBackground, // Cave with red/orange tint works for volcanic
  iceCave: caveBackground, // Cave with blue tint works for ice cave
  swamp: forestBackground, // Forest with green tint works for swamp
  desert: plainsBackground, // Plains for desert
  crypt: ruinsBackground, // Ruins for crypt
  void: ruinsBackground, // Ruins for void realm
} as const;

// Default background when no environment is set
export const DEFAULT_BACKGROUND = forestBackground;

export default BACKGROUND_IMAGES;
