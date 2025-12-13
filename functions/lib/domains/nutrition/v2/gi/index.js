"use strict";
/**
 * Glycemic Index Layer Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoodsByCategory = exports.getDatabaseSize = exports.CATEGORY_DEFAULTS = exports.GI_DATABASE = exports.calculateMealGL = exports.calculateMealGI = exports.getGIExplanation = exports.hasRelevantGI = exports.getGLBand = exports.getGIBand = exports.batchLookupGI = exports.lookupGI = void 0;
// Main lookup functions
var giLookup_1 = require("./giLookup");
Object.defineProperty(exports, "lookupGI", { enumerable: true, get: function () { return giLookup_1.lookupGI; } });
Object.defineProperty(exports, "batchLookupGI", { enumerable: true, get: function () { return giLookup_1.batchLookupGI; } });
Object.defineProperty(exports, "getGIBand", { enumerable: true, get: function () { return giLookup_1.getGIBand; } });
Object.defineProperty(exports, "getGLBand", { enumerable: true, get: function () { return giLookup_1.getGLBand; } });
Object.defineProperty(exports, "hasRelevantGI", { enumerable: true, get: function () { return giLookup_1.hasRelevantGI; } });
Object.defineProperty(exports, "getGIExplanation", { enumerable: true, get: function () { return giLookup_1.getGIExplanation; } });
Object.defineProperty(exports, "calculateMealGI", { enumerable: true, get: function () { return giLookup_1.calculateMealGI; } });
Object.defineProperty(exports, "calculateMealGL", { enumerable: true, get: function () { return giLookup_1.calculateMealGL; } });
// Database access (for testing/debugging)
var giDatabase_1 = require("./giDatabase");
Object.defineProperty(exports, "GI_DATABASE", { enumerable: true, get: function () { return giDatabase_1.GI_DATABASE; } });
Object.defineProperty(exports, "CATEGORY_DEFAULTS", { enumerable: true, get: function () { return giDatabase_1.CATEGORY_DEFAULTS; } });
Object.defineProperty(exports, "getDatabaseSize", { enumerable: true, get: function () { return giDatabase_1.getDatabaseSize; } });
Object.defineProperty(exports, "getFoodsByCategory", { enumerable: true, get: function () { return giDatabase_1.getFoodsByCategory; } });
//# sourceMappingURL=index.js.map