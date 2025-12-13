/**
 * Glycemic Index Layer Exports
 */

// Main lookup functions
export {
  lookupGI,
  batchLookupGI,
  getGIBand,
  getGLBand,
  hasRelevantGI,
  getGIExplanation,
  calculateMealGI,
  calculateMealGL,
} from './giLookup';

// Database access (for testing/debugging)
export {
  GI_DATABASE,
  CATEGORY_DEFAULTS,
  getDatabaseSize,
  getFoodsByCategory,
  type GIEntry,
  type GICategory,
} from './giDatabase';
