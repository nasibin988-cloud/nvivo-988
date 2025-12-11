"use strict";
/**
 * Nutrition Targets Module
 *
 * Exports functions for calculating personalized nutrition targets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCalorieTarget = exports.computeSingleTarget = exports.computeTargetsForNutrients = exports.computeUserTargets = exports.getGoalAdjustment = exports.getActivityMultiplier = exports.calculateEnergy = exports.calculateTargetCalories = exports.calculateTDEE = exports.calculateBMR = exports.isElderly = exports.isPediatric = exports.getDriLifeStage = exports.getLifeStageGroup = exports.calculateAge = void 0;
// Age utilities
var ageUtils_1 = require("./ageUtils");
Object.defineProperty(exports, "calculateAge", { enumerable: true, get: function () { return ageUtils_1.calculateAge; } });
Object.defineProperty(exports, "getLifeStageGroup", { enumerable: true, get: function () { return ageUtils_1.getLifeStageGroup; } });
Object.defineProperty(exports, "getDriLifeStage", { enumerable: true, get: function () { return ageUtils_1.getDriLifeStage; } });
Object.defineProperty(exports, "isPediatric", { enumerable: true, get: function () { return ageUtils_1.isPediatric; } });
Object.defineProperty(exports, "isElderly", { enumerable: true, get: function () { return ageUtils_1.isElderly; } });
// Calorie calculator
var calorieCalculator_1 = require("./calorieCalculator");
Object.defineProperty(exports, "calculateBMR", { enumerable: true, get: function () { return calorieCalculator_1.calculateBMR; } });
Object.defineProperty(exports, "calculateTDEE", { enumerable: true, get: function () { return calorieCalculator_1.calculateTDEE; } });
Object.defineProperty(exports, "calculateTargetCalories", { enumerable: true, get: function () { return calorieCalculator_1.calculateTargetCalories; } });
Object.defineProperty(exports, "calculateEnergy", { enumerable: true, get: function () { return calorieCalculator_1.calculateEnergy; } });
Object.defineProperty(exports, "getActivityMultiplier", { enumerable: true, get: function () { return calorieCalculator_1.getActivityMultiplier; } });
Object.defineProperty(exports, "getGoalAdjustment", { enumerable: true, get: function () { return calorieCalculator_1.getGoalAdjustment; } });
// Target computer
var targetComputer_1 = require("./targetComputer");
Object.defineProperty(exports, "computeUserTargets", { enumerable: true, get: function () { return targetComputer_1.computeUserTargets; } });
Object.defineProperty(exports, "computeTargetsForNutrients", { enumerable: true, get: function () { return targetComputer_1.computeTargetsForNutrients; } });
Object.defineProperty(exports, "computeSingleTarget", { enumerable: true, get: function () { return targetComputer_1.computeSingleTarget; } });
Object.defineProperty(exports, "computeCalorieTarget", { enumerable: true, get: function () { return targetComputer_1.computeCalorieTarget; } });
//# sourceMappingURL=index.js.map