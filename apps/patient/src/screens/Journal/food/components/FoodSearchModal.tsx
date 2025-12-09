/**
 * Food Search Modal
 * Search USDA database for foods with accurate nutrition data
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Loader2,
  Apple,
  Barcode,
  ChevronRight,
  Check,
  Flame,
  Beef,
  Wheat,
  Droplets,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';

interface FoodSearchResult {
  name: string;
  fdcId?: string;
  brandName?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  };
}

interface FoodSearchModalProps {
  onClose: () => void;
  onSelect: (food: FoodSearchResult) => void;
}

export default function FoodSearchModal({ onClose, onSelect }: FoodSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentFoodSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    // Focus input on mount
    searchInputRef.current?.focus();
  }, []);

  // Save recent searches
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentFoodSearches', JSON.stringify(updated));
  };

  // Search foods
  const searchFoods = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const functions = getFunctions();
      const searchFn = httpsCallable<{ query: string; limit?: number }, FoodSearchResult[]>(
        functions,
        'searchFoods'
      );
      const response = await searchFn({ query: searchQuery, limit: 15 });
      setResults(response.data);
    } catch (error) {
      console.error('Food search failed:', error);
      // Fallback to mock results for demo
      setResults(getMockResults(searchQuery));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchFoods(value);
    }, 300);
  };

  // Handle selection
  const handleSelect = (food: FoodSearchResult) => {
    setSelectedFood(food);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedFood) {
      saveRecentSearch(query);
      onSelect(selectedFood);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.06] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center shrink-0 bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Search Foods</h2>
            <p className="text-xs text-text-muted">400k+ foods from USDA database</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border bg-white/[0.01]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search for a food..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {isLoading && (
              <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors">
              <Barcode size={12} />
              Scan Barcode
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQueryChange(term)}
                    className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-secondary text-xs hover:bg-surface transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results state */}
          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="text-center py-12">
              <Apple size={40} className="mx-auto text-text-muted mb-3 opacity-50" />
              <p className="text-sm text-text-muted">No foods found for "{query}"</p>
              <p className="text-xs text-text-muted mt-1">Try a different search term</p>
            </div>
          )}

          {/* Results list */}
          {results.map((food, index) => (
            <button
              key={`${food.fdcId || index}`}
              onClick={() => handleSelect(food)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedFood === food
                  ? 'bg-emerald-500/15 border-2 border-emerald-500/50'
                  : 'bg-surface-2 border border-border hover:bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{food.name}</p>
                  {food.brandName && (
                    <p className="text-xs text-text-muted mt-0.5">{food.brandName}</p>
                  )}

                  {/* Macros preview */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Flame size={10} />
                      {food.nutrition.calories} cal
                    </span>
                    <span className="text-xs text-rose-400 flex items-center gap-1">
                      <Beef size={10} />
                      {food.nutrition.protein}g
                    </span>
                    <span className="text-xs text-amber-400/70 flex items-center gap-1">
                      <Wheat size={10} />
                      {food.nutrition.carbohydrates}g
                    </span>
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                      <Droplets size={10} />
                      {food.nutrition.fat}g
                    </span>
                  </div>
                </div>

                {selectedFood === food ? (
                  <div className="p-1.5 rounded-full bg-emerald-500 text-white">
                    <Check size={14} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-text-muted mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-white/[0.02] shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!selectedFood}
            className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-500/25"
          >
            {selectedFood ? `Add ${selectedFood.name.split(',')[0]}` : 'Select a Food'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock results for demo/fallback
function getMockResults(query: string): FoodSearchResult[] {
  const mockFoods: FoodSearchResult[] = [
    { name: 'Chicken breast, grilled', nutrition: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0 } },
    { name: 'Brown rice, cooked', nutrition: { calories: 216, protein: 5, carbohydrates: 45, fat: 1.8, fiber: 3.5 } },
    { name: 'Salmon, Atlantic, baked', nutrition: { calories: 208, protein: 20, carbohydrates: 0, fat: 13, fiber: 0 } },
    { name: 'Broccoli, steamed', nutrition: { calories: 55, protein: 3.7, carbohydrates: 11, fat: 0.6, fiber: 5.1 } },
    { name: 'Greek yogurt, plain', nutrition: { calories: 100, protein: 17, carbohydrates: 6, fat: 0.7, fiber: 0 } },
    { name: 'Avocado, raw', nutrition: { calories: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 7 } },
    { name: 'Eggs, scrambled', nutrition: { calories: 147, protein: 10, carbohydrates: 2, fat: 11, fiber: 0 } },
    { name: 'Banana, raw', nutrition: { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6 } },
    { name: 'Oatmeal, cooked', nutrition: { calories: 158, protein: 6, carbohydrates: 27, fat: 3, fiber: 4 } },
    { name: 'Spinach, raw', nutrition: { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2 } },
  ];

  return mockFoods.filter((food) =>
    food.name.toLowerCase().includes(query.toLowerCase())
  );
}
