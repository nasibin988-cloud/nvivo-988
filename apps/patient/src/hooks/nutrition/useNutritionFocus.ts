/**
 * useNutritionFocus Hook
 *
 * Manages the user's nutrition focus preference.
 * Persists to Firestore and provides local state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';
import type { NutritionFocusId } from './useNutritionEvaluation';
import type { LucideIcon } from 'lucide-react';
import {
  Scale,
  Dumbbell,
  Heart,
  Battery,
  Brain,
  Leaf,
  Activity,
  Bone,
  Shield,
} from 'lucide-react';

// Focus display information
export interface FocusInfo {
  id: NutritionFocusId;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const FOCUS_OPTIONS: FocusInfo[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    shortName: 'Balanced',
    description: 'Overall nutrition following dietary guidelines',
    icon: Scale,
    color: '#10b981',
  },
  {
    id: 'muscle_building',
    name: 'Muscle Building',
    shortName: 'Muscle',
    description: 'High protein for muscle growth and recovery',
    icon: Dumbbell,
    color: '#f59e0b',
  },
  {
    id: 'heart_health',
    name: 'Heart Health',
    shortName: 'Heart',
    description: 'Cardioprotective diet with lower sodium and saturated fat',
    icon: Heart,
    color: '#ef4444',
  },
  {
    id: 'energy',
    name: 'Energy',
    shortName: 'Energy',
    description: 'Sustained energy through B-vitamins and low-GI carbs',
    icon: Battery,
    color: '#eab308',
  },
  {
    id: 'weight_management',
    name: 'Weight Management',
    shortName: 'Weight',
    description: 'Calorie-conscious with high satiety foods',
    icon: Scale,
    color: '#8b5cf6',
  },
  {
    id: 'brain_focus',
    name: 'Brain & Focus',
    shortName: 'Brain',
    description: 'Cognitive support through omega-3 and B-vitamins',
    icon: Brain,
    color: '#06b6d4',
  },
  {
    id: 'gut_health',
    name: 'Gut Health',
    shortName: 'Gut',
    description: 'High fiber diet for microbiome health',
    icon: Leaf,
    color: '#22c55e',
  },
  {
    id: 'blood_sugar',
    name: 'Blood Sugar',
    shortName: 'Blood Sugar',
    description: 'Glycemic control with low-GI foods and fiber',
    icon: Activity,
    color: '#ec4899',
  },
  {
    id: 'bone_joint',
    name: 'Bone & Joint',
    shortName: 'Bone',
    description: 'Calcium and Vitamin D for bone density',
    icon: Bone,
    color: '#f97316',
  },
  {
    id: 'anti_inflammatory',
    name: 'Anti-Inflammatory',
    shortName: 'Anti-Inflam',
    description: 'Reduce inflammation with antioxidants and omega-3',
    icon: Shield,
    color: '#14b8a6',
  },
];

export function getFocusInfo(focusId: NutritionFocusId): FocusInfo {
  return FOCUS_OPTIONS.find((f) => f.id === focusId) ?? FOCUS_OPTIONS[0];
}

interface UseNutritionFocusReturn {
  focus: NutritionFocusId;
  focusInfo: FocusInfo;
  setFocus: (focusId: NutritionFocusId) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

/**
 * Hook to manage nutrition focus preference
 */
export function useNutritionFocus(): UseNutritionFocusReturn {
  const { user } = useAuth();
  const [focus, setFocusState] = useState<NutritionFocusId>('balanced');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load focus from Firestore on mount
  useEffect(() => {
    async function loadFocus() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const db = getDb();
        const settingsRef = doc(db, 'patients', user.uid, 'settings', 'nutrition');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.focusId && FOCUS_OPTIONS.some((f) => f.id === data.focusId)) {
            setFocusState(data.focusId as NutritionFocusId);
          }
        }
      } catch (error) {
        console.error('Failed to load nutrition focus:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFocus();
  }, [user?.uid]);

  // Save focus to Firestore
  const setFocus = useCallback(
    async (focusId: NutritionFocusId) => {
      if (!user?.uid) return;

      setIsSaving(true);
      setFocusState(focusId); // Optimistic update

      try {
        const db = getDb();
        const settingsRef = doc(db, 'patients', user.uid, 'settings', 'nutrition');
        await setDoc(settingsRef, { focusId, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        console.error('Failed to save nutrition focus:', error);
        // Could revert here, but optimistic update is probably fine
      } finally {
        setIsSaving(false);
      }
    },
    [user?.uid]
  );

  return {
    focus,
    focusInfo: getFocusInfo(focus),
    setFocus,
    isLoading,
    isSaving,
  };
}
