"use strict";
/**
 * AI Identification Layer Exports
 *
 * This layer handles food identification only.
 * AI does NOT estimate nutrition - that comes from the resolution layer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuScannerOpenaiApiKey = exports.menuItemsToDescriptors = exports.selectMenuItems = exports.getSelectedMenuItems = exports.scanMenuFromUrl = exports.scanMenu = exports.textParserOpenaiApiKey = exports.quickParseSingleFood = exports.parseMultipleFoods = exports.parseFoodText = exports.photoIdOpenaiApiKey = exports.identifyFoodsFromPhotoUrl = exports.identifyFoodsFromPhoto = void 0;
// Photo identification
var photoIdentifier_1 = require("./photoIdentifier");
Object.defineProperty(exports, "identifyFoodsFromPhoto", { enumerable: true, get: function () { return photoIdentifier_1.identifyFoodsFromPhoto; } });
Object.defineProperty(exports, "identifyFoodsFromPhotoUrl", { enumerable: true, get: function () { return photoIdentifier_1.identifyFoodsFromPhotoUrl; } });
Object.defineProperty(exports, "photoIdOpenaiApiKey", { enumerable: true, get: function () { return photoIdentifier_1.photoIdOpenaiApiKey; } });
// Text parsing
var textParser_1 = require("./textParser");
Object.defineProperty(exports, "parseFoodText", { enumerable: true, get: function () { return textParser_1.parseFoodText; } });
Object.defineProperty(exports, "parseMultipleFoods", { enumerable: true, get: function () { return textParser_1.parseMultipleFoods; } });
Object.defineProperty(exports, "quickParseSingleFood", { enumerable: true, get: function () { return textParser_1.quickParseSingleFood; } });
Object.defineProperty(exports, "textParserOpenaiApiKey", { enumerable: true, get: function () { return textParser_1.textParserOpenaiApiKey; } });
// Menu scanning
var menuScanner_1 = require("./menuScanner");
Object.defineProperty(exports, "scanMenu", { enumerable: true, get: function () { return menuScanner_1.scanMenu; } });
Object.defineProperty(exports, "scanMenuFromUrl", { enumerable: true, get: function () { return menuScanner_1.scanMenuFromUrl; } });
Object.defineProperty(exports, "getSelectedMenuItems", { enumerable: true, get: function () { return menuScanner_1.getSelectedMenuItems; } });
Object.defineProperty(exports, "selectMenuItems", { enumerable: true, get: function () { return menuScanner_1.selectMenuItems; } });
Object.defineProperty(exports, "menuItemsToDescriptors", { enumerable: true, get: function () { return menuScanner_1.menuItemsToDescriptors; } });
Object.defineProperty(exports, "menuScannerOpenaiApiKey", { enumerable: true, get: function () { return menuScanner_1.menuScannerOpenaiApiKey; } });
//# sourceMappingURL=index.js.map