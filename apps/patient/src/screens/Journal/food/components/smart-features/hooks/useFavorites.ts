/**
 * useFavorites Hook
 * Manages favorite foods with Firestore persistence
 */

import { useState, useCallback, useMemo } from 'react';
import type { FavoriteFood } from '../types';
import { sortFavorites } from '../utils';

// Mock initial favorites - in production these would come from Firestore
const MOCK_FAVORITES: FavoriteFood[] = [
  {
    id: 'fav-1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 4,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    servingSize: '3 oz',
    usageCount: 24,
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'fav-2',
    name: 'Greek Yogurt',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 1,
    fiber: 0,
    sugar: 4,
    sodium: 50,
    brand: 'Fage',
    servingSize: '170g',
    usageCount: 18,
    lastUsed: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'fav-3',
    name: 'Brown Rice',
    calories: 215,
    protein: 5,
    carbs: 45,
    fat: 2,
    fiber: 4,
    sugar: 0,
    sodium: 10,
    servingSize: '1 cup cooked',
    usageCount: 15,
    lastUsed: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'fav-4',
    name: 'Eggs (2 large)',
    calories: 140,
    protein: 12,
    carbs: 1,
    fat: 10,
    fiber: 0,
    sugar: 0,
    sodium: 140,
    servingSize: '2 large eggs',
    usageCount: 32,
    lastUsed: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'fav-5',
    name: 'Avocado',
    calories: 240,
    protein: 3,
    carbs: 12,
    fat: 22,
    fiber: 10,
    sugar: 1,
    sodium: 10,
    servingSize: '1 medium',
    usageCount: 12,
    lastUsed: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
];

interface UseFavoritesReturn {
  favorites: FavoriteFood[];
  isLoading: boolean;
  addFavorite: (food: Omit<FavoriteFood, 'id' | 'usageCount' | 'lastUsed' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
  useFavorite: (id: string) => FavoriteFood | undefined;
  searchFavorites: (query: string) => FavoriteFood[];
  isFavorite: (name: string) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteFood[]>(MOCK_FAVORITES);
  const [isLoading] = useState(false);

  // Sort favorites by usage and recency
  const sortedFavorites = useMemo(() => sortFavorites(favorites), [favorites]);

  // Add a new favorite
  const addFavorite = useCallback((food: Omit<FavoriteFood, 'id' | 'usageCount' | 'lastUsed' | 'createdAt'>) => {
    const newFavorite: FavoriteFood = {
      ...food,
      id: `fav-${Date.now()}`,
      usageCount: 1,
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setFavorites(prev => [...prev, newFavorite]);
  }, []);

  // Remove a favorite
  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  // Use a favorite (increments usage count and updates lastUsed)
  const useFavorite = useCallback((id: string) => {
    let usedFood: FavoriteFood | undefined;

    setFavorites(prev => prev.map(f => {
      if (f.id === id) {
        usedFood = {
          ...f,
          usageCount: f.usageCount + 1,
          lastUsed: new Date().toISOString(),
        };
        return usedFood;
      }
      return f;
    }));

    return usedFood;
  }, []);

  // Search favorites by name
  const searchFavorites = useCallback((query: string) => {
    if (!query.trim()) return sortedFavorites;

    const lowerQuery = query.toLowerCase();
    return sortedFavorites.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.brand?.toLowerCase().includes(lowerQuery)
    );
  }, [sortedFavorites]);

  // Check if a food is already a favorite
  const isFavorite = useCallback((name: string) => {
    const lowerName = name.toLowerCase();
    return favorites.some(f => f.name.toLowerCase() === lowerName);
  }, [favorites]);

  return {
    favorites: sortedFavorites,
    isLoading,
    addFavorite,
    removeFavorite,
    useFavorite,
    searchFavorites,
    isFavorite,
  };
}
