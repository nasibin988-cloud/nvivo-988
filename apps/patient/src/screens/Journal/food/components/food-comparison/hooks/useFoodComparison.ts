/**
 * useFoodComparison Hook
 * State management for food health analysis and comparison
 */

import { useState, useCallback, useMemo } from 'react';
import type { FoodHealthProfile, FoodComparisonResult, UserCondition } from '../types';
import {
  calculateHealthGrade,
  calculateNutrientScores,
  calculateConditionImpacts,
  generateAlternatives,
  generateAiRecommendation,
} from '../utils';

interface FoodInput {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface UseFoodComparisonReturn {
  food1: FoodHealthProfile | null;
  food2: FoodHealthProfile | null;
  userConditions: UserCondition[];
  comparison: FoodComparisonResult | null;
  analyzeFood: (food: FoodInput, slot: 1 | 2) => void;
  clearFood: (slot: 1 | 2) => void;
  setUserConditions: (conditions: UserCondition[]) => void;
  comparefoods: () => void;
}

export function useFoodComparison(): UseFoodComparisonReturn {
  const [food1, setFood1] = useState<FoodHealthProfile | null>(null);
  const [food2, setFood2] = useState<FoodHealthProfile | null>(null);
  const [userConditions, setUserConditions] = useState<UserCondition[]>(['none']);

  const analyzeFood = useCallback(
    (food: FoodInput, slot: 1 | 2) => {
      const { grade, reason } = calculateHealthGrade(food);
      const nutrientScores = calculateNutrientScores(food);
      const conditionImpacts = calculateConditionImpacts(food, userConditions);

      const profile: FoodHealthProfile = {
        ...food,
        healthGrade: grade,
        gradeReason: reason,
        nutrientScores,
        conditionImpacts,
        alternatives: generateAlternatives({ ...food, healthGrade: grade }),
      };

      profile.aiRecommendation = generateAiRecommendation(profile);

      if (slot === 1) {
        setFood1(profile);
      } else {
        setFood2(profile);
      }
    },
    [userConditions]
  );

  const clearFood = useCallback((slot: 1 | 2) => {
    if (slot === 1) {
      setFood1(null);
    } else {
      setFood2(null);
    }
  }, []);

  const comparison = useMemo((): FoodComparisonResult | null => {
    if (!food1 || !food2) return null;

    const comparisons: FoodComparisonResult['comparison'] = [];

    // Compare calories (lower is usually better unless very low)
    comparisons.push({
      category: 'Calories',
      food1Better: food1.calories < food2.calories,
      difference: `${Math.abs(food1.calories - food2.calories)} cal difference`,
    });

    // Compare protein (higher is better)
    comparisons.push({
      category: 'Protein',
      food1Better: food1.protein > food2.protein,
      difference: `${Math.abs(food1.protein - food2.protein)}g difference`,
    });

    // Compare fiber (higher is better)
    comparisons.push({
      category: 'Fiber',
      food1Better: food1.fiber > food2.fiber,
      difference: `${Math.abs(food1.fiber - food2.fiber)}g difference`,
    });

    // Compare sugar (lower is better)
    comparisons.push({
      category: 'Sugar',
      food1Better: food1.sugar < food2.sugar,
      difference: `${Math.abs(food1.sugar - food2.sugar)}g difference`,
    });

    // Compare sodium (lower is better)
    comparisons.push({
      category: 'Sodium',
      food1Better: food1.sodium < food2.sodium,
      difference: `${Math.abs(food1.sodium - food2.sodium)}mg difference`,
    });

    // Determine winner based on health grades and comparison wins
    const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
    const grade1Index = gradeOrder.indexOf(food1.healthGrade);
    const grade2Index = gradeOrder.indexOf(food2.healthGrade);

    let winner: FoodComparisonResult['winner'] = 'tie';
    if (grade1Index < grade2Index) {
      winner = 'food1';
    } else if (grade2Index < grade1Index) {
      winner = 'food2';
    } else {
      // Same grade - count wins
      const food1Wins = comparisons.filter((c) => c.food1Better).length;
      const food2Wins = comparisons.filter((c) => !c.food1Better).length;
      if (food1Wins > food2Wins) winner = 'food1';
      else if (food2Wins > food1Wins) winner = 'food2';
    }

    return {
      food1,
      food2,
      winner,
      comparison: comparisons,
    };
  }, [food1, food2]);

  const comparefoods = useCallback(() => {
    // Re-analyze both foods with current conditions
    if (food1) {
      analyzeFood(food1, 1);
    }
    if (food2) {
      analyzeFood(food2, 2);
    }
  }, [food1, food2, analyzeFood]);

  return {
    food1,
    food2,
    userConditions,
    comparison,
    analyzeFood,
    clearFood,
    setUserConditions,
    comparefoods,
  };
}
