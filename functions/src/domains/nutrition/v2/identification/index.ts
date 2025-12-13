/**
 * AI Identification Layer Exports
 *
 * This layer handles food identification only.
 * AI does NOT estimate nutrition - that comes from the resolution layer.
 */

// Photo identification
export {
  identifyFoodsFromPhoto,
  identifyFoodsFromPhotoUrl,
  photoIdOpenaiApiKey,
} from './photoIdentifier';

// Text parsing
export {
  parseFoodText,
  parseMultipleFoods,
  quickParseSingleFood,
  textParserOpenaiApiKey,
} from './textParser';

// Menu scanning
export {
  scanMenu,
  scanMenuFromUrl,
  getSelectedMenuItems,
  selectMenuItems,
  menuItemsToDescriptors,
  menuScannerOpenaiApiKey,
} from './menuScanner';
