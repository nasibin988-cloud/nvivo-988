/**
 * Smart Features Modal
 * Unified modal for barcode scanning, favorites, recurring meals, and AI suggestions
 */

import { useState } from 'react';
import {
  X,
  Barcode,
  Heart,
  Repeat,
  Sparkles,
  Plus,
  Search,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<SmartFeatureView | 'barcode'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter favorites by search
  const filteredFavorites = searchQuery ? searchFavorites(searchQuery) : favorites;

  const tabs = [
    { id: 'suggestions' as const, label: 'Suggestions', icon: Sparkles, color: 'violet' },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, color: 'rose' },
    { id: 'recurring' as const, label: 'Recurring', icon: Repeat, color: 'blue' },
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
