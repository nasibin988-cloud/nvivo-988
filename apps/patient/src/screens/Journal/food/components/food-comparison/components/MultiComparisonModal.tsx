/**
 * MultiComparisonModal - Compare multiple food items (2-4)
 * Add all foods first, then analyze in parallel
 * Uses wellness-focused scoring system
 */

import {
  X,
  Plus,
  Zap,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMultiFoodComparison } from '../hooks';
import { usePersonalizedDV } from '../../../../../../hooks/nutrition/usePersonalizedDV';
import { FoodInputCard } from './FoodInputCard';
import { ComparisonResultsView } from './ComparisonResultsView';
import { FocusSelector } from './FocusSelector';
import type { WellnessFocus, FoodLogItem } from '../types';

interface MultiComparisonModalProps {
  onClose: () => void;
  /** Callback when user wants to add selected foods to their food log */
  onAddToLog?: (items: FoodLogItem[]) => void;
}

export function MultiComparisonModal({ onClose, onAddToLog }: MultiComparisonModalProps): React.ReactElement {
  const [selectedForLog, setSelectedForLog] = useState<Set<number>>(new Set());

  const {
    items,
    userFocuses,
    isAnalyzing,
    isLoadingAIInsight,
    canAddMore,
    comparisonResult,
    addItem,
    removeItem,
    resetItem,
    setPhotoData,
    setTextData,
    setManualData,
    analyzeAll,
    setUserFocuses,
    resetAll,
  } = useMultiFoodComparison();

  // Fetch personalized Daily Values for nutrition display
  const { dvs: personalizedDVs, isPersonalized } = usePersonalizedDV();

  const pendingCount = items.filter(item => item.status === 'pending').length;
  const analyzingCount = items.filter(item => item.status === 'analyzing').length;
  const readyCount = items.filter(item => item.status === 'ready').length;
  const hasAnalyzedItems = readyCount > 0;

  // Single focus selection (radio behavior)
  const selectedFocus = userFocuses[0] || 'balanced';
  const handleFocusSelect = (focus: WellnessFocus) => {
    setUserFocuses([focus]);
  };

  // Toggle selection for adding to food log
  const toggleFoodSelection = (index: number) => {
    setSelectedForLog(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Handle adding selected foods to the log
  const handleAddToLog = () => {
    if (!comparisonResult || !onAddToLog || selectedForLog.size === 0) return;

    const itemsToAdd: FoodLogItem[] = Array.from(selectedForLog).map(index => {
      const item = comparisonResult.items[index];
      return {
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber ?? null,
        sugar: item.sugar ?? null,
        sodium: item.sodium ?? null,
      };
    });

    onAddToLog(itemsToAdd);
    onClose();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md" style={{ width: '100vw', height: '100vh' }}>
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-bg-primary rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Compare Foods</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Add 2-4 foods, then analyze them all at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Food Input Cards */}
            {!comparisonResult && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item, index) => (
                    <FoodInputCard
                      key={item.id}
                      item={item}
                      index={index}
                      canRemove={items.length > 2 && !hasAnalyzedItems && !isAnalyzing}
                      disabled={item.status === 'empty' && (hasAnalyzedItems || isAnalyzing)}
                      onRemove={() => removeItem(item.id)}
                      onReset={() => resetItem(item.id)}
                      onSetPhoto={(imageData) => setPhotoData(item.id, imageData)}
                      onSetText={(text) => setTextData(item.id, text)}
                      onSetManual={(data) => setManualData(item.id, data)}
                    />
                  ))}

                  {/* Add More Button - disabled after analysis has started */}
                  {canAddMore && !hasAnalyzedItems && !isAnalyzing && (
                    <button
                      onClick={addItem}
                      className="rounded-xl border-2 border-dashed border-white/[0.1] p-4 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-primary hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-all min-h-[140px]"
                    >
                      <Plus size={24} />
                      <span className="text-xs font-medium">Add Food</span>
                    </button>
                  )}
                </div>

                {/* Start Over button - only show after analysis */}
                {hasAnalyzedItems && (
                  <div className="flex justify-end px-1">
                    <button
                      onClick={resetAll}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all"
                    >
                      <RotateCcw size={12} />
                      Start Over
                    </button>
                  </div>
                )}

                {/* Focus Selector - shows when 2+ items have data (pending or ready) */}
                {pendingCount + readyCount >= 2 && !isAnalyzing && (
                  <FocusSelector
                    selectedFocus={selectedFocus}
                    onFocusChange={handleFocusSelect}
                    colorTheme="violet"
                  />
                )}
              </>
            )}

            {/* Comparison Results */}
            {comparisonResult && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text-primary">Comparison Results</p>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/[0.08] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
                  >
                    <RotateCcw size={12} />
                    New Comparison
                  </button>
                </div>
                <ComparisonResultsView
                  result={comparisonResult}
                  isLoadingAIInsight={isLoadingAIInsight}
                  selectedFocuses={userFocuses}
                  personalizedDVs={personalizedDVs}
                  isPersonalized={isPersonalized}
                  selectedForLog={onAddToLog ? selectedForLog : undefined}
                  onToggleSelection={onAddToLog ? toggleFoodSelection : undefined}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!comparisonResult && (
          <div className="p-4 border-t border-white/[0.08]">
            <button
              onClick={analyzeAll}
              disabled={pendingCount === 0 || isAnalyzing}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                pendingCount > 0 && !isAnalyzing
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing {analyzingCount} item{analyzingCount !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  {pendingCount > 0
                    ? `Analyze ${pendingCount} Food${pendingCount > 1 ? 's' : ''}`
                    : readyCount >= 2
                    ? 'View Comparison'
                    : 'Add Foods to Compare'}
                </>
              )}
            </button>

            {readyCount >= 2 && pendingCount === 0 && !isAnalyzing && (
              <p className="text-xs text-text-muted text-center mt-2">
                Scroll down to see your comparison results
              </p>
            )}
          </div>
        )}

        {/* Footer for Adding to Food Log */}
        {comparisonResult && onAddToLog && (
          <div className="p-4 border-t border-white/[0.08]">
            <button
              onClick={handleAddToLog}
              disabled={selectedForLog.size === 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedForLog.size > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
            >
              <UtensilsCrossed size={18} />
              {selectedForLog.size > 0
                ? `Add ${selectedForLog.size} Food${selectedForLog.size > 1 ? 's' : ''} to Log`
                : 'Select Foods to Add'}
            </button>
            {selectedForLog.size === 0 && (
              <p className="text-xs text-text-muted text-center mt-2">
                Tap foods in the ranking above to select them
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
