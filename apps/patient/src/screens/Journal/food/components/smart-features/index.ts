/**
 * Smart Features - Barrel Export
 * Barcode scanning, favorites, recurring meals, and AI suggestions
 */

// Types
export * from './types';

// Utils
export * from './utils';

// Hooks
export { useFavorites } from './hooks/useFavorites';
export { useRecurringMeals } from './hooks/useRecurringMeals';
export { useSuggestions } from './hooks/useSuggestions';
export { useBarcodeScanner } from './hooks/useBarcodeScanner';

// Components
export { FavoriteCard } from './components/FavoriteCard';
export { RecurringMealCard } from './components/RecurringMealCard';
export { SuggestionCard } from './components/SuggestionCard';
export { BarcodeScannerView } from './components/BarcodeScannerView';
export { NutritionGapCard } from './components/NutritionGapCard';
