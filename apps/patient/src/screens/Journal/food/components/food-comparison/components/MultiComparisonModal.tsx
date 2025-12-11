/**
 * MultiComparisonModal - Compare multiple food items (2-5)
 * Add all foods first, then analyze in parallel
 * Uses wellness-focused scoring system
 */

import {
  X,
  Plus,
  Zap,
  RotateCcw,
  Settings2,
  Dumbbell,
  Heart,
  Battery,
  Scale,
  Brain,
  Leaf,
  Activity,
  Bone,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useMultiFoodComparison } from '../hooks';
import { usePersonalizedDV } from '../../../../../../hooks/nutrition/usePersonalizedDV';
import { FoodInputCard } from './FoodInputCard';
import { ComparisonResultsView } from './ComparisonResultsView';
import type { WellnessFocus } from '../types';

interface MultiComparisonModalProps {
  onClose: () => void;
}

// Wellness focus options with icons and descriptions (10 total)
const WELLNESS_FOCUSES: {
  value: WellnessFocus;
  label: string;
  icon: typeof Heart;
  description: string;
}[] = [
  { value: 'balanced', label: 'Balanced', icon: Scale, description: 'Overall nutrition balance' },
  { value: 'muscle_building', label: 'Muscle Building', icon: Dumbbell, description: 'High protein for growth' },
  { value: 'heart_health', label: 'Heart Health', icon: Heart, description: 'Low sodium & sat fat' },
  { value: 'energy_endurance', label: 'Energy', icon: Battery, description: 'Sustained energy' },
  { value: 'weight_management', label: 'Weight Mgmt', icon: Scale, description: 'Calorie-conscious' },
  { value: 'brain_focus', label: 'Brain & Focus', icon: Brain, description: 'Cognitive support' },
  { value: 'gut_health', label: 'Gut Health', icon: Leaf, description: 'Fiber & prebiotics' },
  { value: 'blood_sugar_balance', label: 'Blood Sugar', icon: Activity, description: 'Low glycemic impact' },
  { value: 'bone_joint_support', label: 'Bone & Joint', icon: Bone, description: 'Calcium & vitamin D' },
  { value: 'anti_inflammatory', label: 'Anti-Inflam.', icon: Shield, description: 'Reduce inflammation' },
];

export function MultiComparisonModal({ onClose }: MultiComparisonModalProps): React.ReactElement {
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-bg-primary rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Compare Foods</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Add 2-5 foods, then analyze them all at once
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all ${
                showSettings
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
              }`}
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Settings Panel - Single Focus Selector */}
            {showSettings && (
              <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-4">
                <p className="text-xs font-medium text-text-primary mb-1">What's Your Focus?</p>
                <p className="text-xs text-text-muted mb-3">
                  Choose one priority to optimize your comparison
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {WELLNESS_FOCUSES.map(({ value, label, icon: Icon, description }) => {
                    const isActive = selectedFocus === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleFocusSelect(value)}
                        className={`p-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-violet-500/15 border border-violet-500/30'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          {/* Radio indicator */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            isActive ? 'border-violet-400' : 'border-white/20'
                          }`}>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                          </div>
                          <Icon
                            size={14}
                            className={isActive ? 'text-violet-400' : 'text-text-muted'}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isActive ? 'text-violet-400' : 'text-text-primary'
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed pl-[22px]">
                          {description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
      </div>
    </div>
  );
}
