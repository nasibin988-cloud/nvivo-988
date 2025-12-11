"use strict";
/**
 * DRI (Dietary Reference Intakes) Domain Module
 *
 * Barrel export for all DRI-related functionality.
 *
 * Usage:
 * ```typescript
 * import {
 *   NUTRIENT_NATURE,
 *   getNutrientNature,
 *   DRI_TABLE,
 *   getDriDefinition,
 *   CLASSIFICATION_THRESHOLDS,
 * } from './domains/nutrition/dri';
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByPriority = exports.getClassificationSeverity = exports.CLASSIFICATION_SEVERITY = exports.getThreshold = exports.CLASSIFICATION_THRESHOLDS = exports.RISK_THRESHOLDS = exports.BENEFICIAL_THRESHOLDS = exports.getDefinedNutrients = exports.getDriDefinition = exports.DRI_TABLE = exports.getNutrientsByNature = exports.isRiskNutrient = exports.isBeneficialNutrient = exports.getNutrientNature = exports.NUTRIENT_NATURE = void 0;
// Nutrient nature registry
var nutrientNature_1 = require("./nutrientNature");
Object.defineProperty(exports, "NUTRIENT_NATURE", { enumerable: true, get: function () { return nutrientNature_1.NUTRIENT_NATURE; } });
Object.defineProperty(exports, "getNutrientNature", { enumerable: true, get: function () { return nutrientNature_1.getNutrientNature; } });
Object.defineProperty(exports, "isBeneficialNutrient", { enumerable: true, get: function () { return nutrientNature_1.isBeneficialNutrient; } });
Object.defineProperty(exports, "isRiskNutrient", { enumerable: true, get: function () { return nutrientNature_1.isRiskNutrient; } });
Object.defineProperty(exports, "getNutrientsByNature", { enumerable: true, get: function () { return nutrientNature_1.getNutrientsByNature; } });
// DRI data table
var driTable_1 = require("./driTable");
Object.defineProperty(exports, "DRI_TABLE", { enumerable: true, get: function () { return driTable_1.DRI_TABLE; } });
Object.defineProperty(exports, "getDriDefinition", { enumerable: true, get: function () { return driTable_1.getDriDefinition; } });
Object.defineProperty(exports, "getDefinedNutrients", { enumerable: true, get: function () { return driTable_1.getDefinedNutrients; } });
// Classification thresholds
var classificationThresholds_1 = require("./classificationThresholds");
Object.defineProperty(exports, "BENEFICIAL_THRESHOLDS", { enumerable: true, get: function () { return classificationThresholds_1.BENEFICIAL_THRESHOLDS; } });
Object.defineProperty(exports, "RISK_THRESHOLDS", { enumerable: true, get: function () { return classificationThresholds_1.RISK_THRESHOLDS; } });
Object.defineProperty(exports, "CLASSIFICATION_THRESHOLDS", { enumerable: true, get: function () { return classificationThresholds_1.CLASSIFICATION_THRESHOLDS; } });
Object.defineProperty(exports, "getThreshold", { enumerable: true, get: function () { return classificationThresholds_1.getThreshold; } });
Object.defineProperty(exports, "CLASSIFICATION_SEVERITY", { enumerable: true, get: function () { return classificationThresholds_1.CLASSIFICATION_SEVERITY; } });
Object.defineProperty(exports, "getClassificationSeverity", { enumerable: true, get: function () { return classificationThresholds_1.getClassificationSeverity; } });
Object.defineProperty(exports, "sortByPriority", { enumerable: true, get: function () { return classificationThresholds_1.sortByPriority; } });
//# sourceMappingURL=index.js.map