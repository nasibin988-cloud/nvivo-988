/**
 * Smart Features Modal
 * Unified modal for barcode scanning, favorites, recurring meals, and AI suggestions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  Barcode,
  Heart,
  Repeat,
  Sparkles,
  Plus,
  Search,
  Loader2,
  Apple,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Check,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';
import {
  useFavorites,
  useRecurringMeals,
  useSuggestions,
  useBarcodeScanner,
  FavoriteCard,
  RecurringMealCard,
  SuggestionCard,
  BarcodeScannerView,
  NutritionGapCard,
  type SmartFeatureView,
  type FavoriteFood,
  type SuggestedFood,
  type BarcodeProduct,
  type RecurringMeal,
} from './smart-features';

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
  return mockFoods.filter((food) => food.name.toLowerCase().includes(query.toLowerCase()));
}

interface SmartFeaturesModalProps {
  onClose: () => void;
  onAddFood: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
  }) => void;
  currentTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export default function SmartFeaturesModal({
  onClose,
  onAddFood,
  currentTotals,
  targets,
}: SmartFeaturesModalProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SmartFeatureView | 'barcode' | 'search'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');

  // Search state
  const [usdaQuery, setUsdaQuery] = useState('');
  const [usdaResults, setUsdaResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchFood, setSelectedSearchFood] = useState<FoodSearchResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when switching to search tab
  useEffect(() => {
    if (activeTab === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  // Hooks
  const { favorites, removeFavorite, useFavorite, searchFavorites } = useFavorites();
  const { recurringMeals, toggleMealActive, deleteRecurringMeal } = useRecurringMeals();
  const { suggestions, nutritionGaps, isOnTrack, progressPercentage } = useSuggestions({
    currentTotals,
    targets,
    favorites,
  });
  const {
    isScanning,
    isLookingUp,
    product,
    error,
    recentScans,
    startScanning,
    stopScanning,
    lookupBarcode,
    clearProduct,
  } = useBarcodeScanner();

  // Handle adding a favorite
  const handleAddFavorite = (favorite: FavoriteFood) => {
    useFavorite(favorite.id);
    onAddFood({
      name: favorite.name,
      calories: favorite.calories,
      protein: favorite.protein,
      carbs: favorite.carbs,
      fat: favorite.fat,
      fiber: favorite.fiber,
      sugar: favorite.sugar,
      sodium: favorite.sodium,
    });
  };

  // Handle adding a suggested food
  const handleAddSuggestion = (food: SuggestedFood) => {
    onAddFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: null,
      sugar: null,
      sodium: null,
    });
  };

  // Handle adding a barcode product
  const handleAddBarcodeProduct = (barcodeProduct: BarcodeProduct) => {
    onAddFood({
      name: barcodeProduct.name,
      calories: barcodeProduct.calories,
      protein: barcodeProduct.protein,
      carbs: barcodeProduct.carbs,
      fat: barcodeProduct.fat,
      fiber: barcodeProduct.fiber ?? null,
      sugar: barcodeProduct.sugar ?? null,
      sodium: barcodeProduct.sodium ?? null,
    });
    clearProduct();
  };

  // Handle logging a recurring meal
  const handleLogRecurringMeal = (meal: RecurringMeal) => {
    // Log each food in the recurring meal
    meal.foods.forEach((food) => {
      onAddFood({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
      });
    });
  };

  // USDA Search functions
  const searchFoods = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUsdaResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const functions = getFunctions();
      const searchFn = httpsCallable<{ query: string; limit?: number }, FoodSearchResult[]>(
        functions,
        'searchFoods'
      );
      const response = await searchFn({ query, limit: 15 });
      setUsdaResults(response.data);
    } catch (error) {
      console.error('Food search failed:', error);
      setUsdaResults(getMockResults(query));
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleUsdaQueryChange = (value: string) => {
    setUsdaQuery(value);
    setSelectedSearchFood(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchFoods(value);
    }, 300);
  };

  const handleAddSearchFood = (food: FoodSearchResult) => {
    onAddFood({
      name: food.name,
      calories: food.nutrition.calories,
      protein: food.nutrition.protein,
      carbs: food.nutrition.carbohydrates,
      fat: food.nutrition.fat,
      fiber: food.nutrition.fiber ?? null,
      sugar: null,
      sodium: food.nutrition.sodium ?? null,
    });
    setSelectedSearchFood(null);
    setUsdaQuery('');
    setUsdaResults([]);
  };

  // Filter favorites by search
  const filteredFavorites = searchQuery ? searchFavorites(searchQuery) : favorites;

  const tabs = [
    { id: 'search' as const, label: 'Search', icon: Search, color: 'blue' },
    { id: 'suggestions' as const, label: 'For You', icon: Sparkles, color: 'violet' },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, color: 'rose' },
    { id: 'recurring' as const, label: 'Recurring', icon: Repeat, color: 'cyan' },
    { id: 'barcode' as const, label: 'Barcode', icon: Barcode, color: 'teal' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] shrink-0 bg-gradient-to-r from-violet-500/[0.08] via-purple-500/[0.05] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/90 to-purple-500/90 text-white shadow-lg shadow-violet-500/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Smart Features</h2>
                <p className="text-xs text-text-muted">Quick add, scan, and suggestions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5">
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === id
                    ? `bg-${color}-500/15 border border-${color}-500/30 text-${color}-400`
                    : 'bg-white/[0.02] border border-white/[0.04] text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={usdaQuery}
                  onChange={(e) => handleUsdaQueryChange(e.target.value)}
                  placeholder="Search 400k+ foods (USDA database)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/[0.02] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500/30 transition-all"
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
                )}
              </div>

              {/* No query state */}
              {usdaQuery.length < 2 && !isSearching && usdaResults.length === 0 && (
                <div className="text-center py-8">
                  <Search size={32} className="text-blue-400/50 mx-auto mb-3" />
                  <p className="text-sm text-text-muted">Type to search for foods</p>
                  <p className="text-xs text-text-muted mt-1">e.g., "chicken breast", "brown rice"</p>
                </div>
              )}

              {/* No results state */}
              {usdaQuery.length >= 2 && !isSearching && usdaResults.length === 0 && (
                <div className="text-center py-8">
                  <Apple size={32} className="text-text-muted/50 mx-auto mb-3" />
                  <p className="text-sm text-text-muted">No foods found for "{usdaQuery}"</p>
                  <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                </div>
              )}

              {/* Results list */}
              {usdaResults.map((food, index) => (
                <button
                  key={`${food.fdcId || index}`}
                  onClick={() => setSelectedSearchFood(selectedSearchFood === food ? null : food)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedSearchFood === food
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{food.name}</p>
                      {food.brandName && (
                        <p className="text-xs text-text-muted truncate">{food.brandName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-amber-400 flex items-center gap-0.5">
                          <Flame size={10} />
                          {food.nutrition.calories}
                        </span>
                        <span className="text-xs text-rose-400 flex items-center gap-0.5">
                          <Beef size={10} />
                          {food.nutrition.protein}g
                        </span>
                        <span className="text-xs text-amber-400/70 flex items-center gap-0.5">
                          <Wheat size={10} />
                          {food.nutrition.carbohydrates}g
                        </span>
                        <span className="text-xs text-blue-400 flex items-center gap-0.5">
                          <Droplets size={10} />
                          {food.nutrition.fat}g
                        </span>
                      </div>
                    </div>
                    {selectedSearchFood === food ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSearchFood(food);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-all flex items-center gap-1"
                      >
                        <Check size={12} />
                        Add
                      </button>
                    ) : (
                      <Plus size={16} className="shrink-0 text-text-muted mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {/* Nutrition gaps overview */}
              <NutritionGapCard
                gaps={nutritionGaps}
                isOnTrack={isOnTrack}
                progressPercentage={progressPercentage}
              />

              {/* Suggestion cards */}
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAddFood={handleAddSuggestion}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles size={32} className="text-violet-400/50 mx-auto mb-3" />
                  <p className="text-sm text-text-muted">
                    No suggestions right now. Keep logging to get personalized recommendations!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search favorites..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.02] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-rose-500/30 transition-all"
                />
              </div>

              {/* Favorites list */}
              {filteredFavorites.length > 0 ? (
                <div className="grid gap-3">
                  {filteredFavorites.map((favorite) => (
                    <FavoriteCard
                      key={favorite.id}
                      favorite={favorite}
                      onAdd={handleAddFavorite}
                      onRemove={removeFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart size={32} className="text-rose-400/50 mx-auto mb-3" />
                  <p className="text-sm text-text-muted mb-3">
                    {searchQuery ? 'No favorites match your search' : 'No favorites yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs text-text-muted">
                      Tap the heart icon on any food to add it to favorites
                    </p>
                  )}
                </div>
              )}

              {/* Add favorite hint */}
              {favorites.length > 0 && (
                <div className="pt-4 border-t border-white/[0.04]">
                  <button className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-rose-400 hover:border-rose-500/20 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add custom favorite
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recurring Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-4">
              {recurringMeals.length > 0 ? (
                <div className="space-y-3">
                  {recurringMeals.map((meal) => (
                    <RecurringMealCard
                      key={meal.id}
                      meal={meal}
                      onToggleActive={toggleMealActive}
                      onDelete={deleteRecurringMeal}
                      onLogNow={handleLogRecurringMeal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Repeat size={32} className="text-blue-400/50 mx-auto mb-3" />
                  <p className="text-sm text-text-muted mb-3">No recurring meals set up</p>
                  <p className="text-xs text-text-muted">
                    Create schedules for meals you eat regularly
                  </p>
                </div>
              )}

              {/* Create recurring meal */}
              <button className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all flex items-center justify-center gap-2">
                <Plus size={16} />
                Create Recurring Meal
              </button>
            </div>
          )}

          {/* Barcode Tab */}
          {activeTab === 'barcode' && (
            <BarcodeScannerView
              isScanning={isScanning}
              isLookingUp={isLookingUp}
              product={product}
              error={error}
              recentScans={recentScans}
              onStartScanning={startScanning}
              onStopScanning={stopScanning}
              onLookup={lookupBarcode}
              onAddProduct={handleAddBarcodeProduct}
              onClear={clearProduct}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(120px); }
        }
      `}</style>
    </div>
  );
}
