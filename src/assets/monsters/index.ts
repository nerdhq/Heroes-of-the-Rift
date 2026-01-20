// Monster sprite imports (LPC spritesheets for animated monsters)
import goblin from './goblin.png';
import imp from './imp.png';
import wraith from './wraith.png';
import skeleton from './skeleton.png';

// Map monster types to their sprite images
// Add more imports above and entries below as sprites are created
export const MONSTER_IMAGES: Record<string, string> = {
  goblin,
  imp,
  wraith,
  skeleton,
};

export default MONSTER_IMAGES;
