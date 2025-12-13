/**
 * FocusSelectorModal - Select nutrition focus mode
 *
 * Allows users to choose from 10 different nutrition focuses
 * which adjust how their daily nutrition score is calculated.
 */

import { useState } from 'react';
import { X, Check, Target, Info } from 'lucide-react';
import { FOCUS_OPTIONS, type FocusInfo } from '../../../../hooks/nutrition';
import type { NutritionFocusId } from '../../../../hooks/nutrition';

interface FocusSelectorModalProps {
  currentFocus: NutritionFocusId;
  onSelect: (focusId: NutritionFocusId) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export function FocusSelectorModal({
  currentFocus,
  onSelect,
  onClose,
  isSaving = false,
}: FocusSelectorModalProps): React.ReactElement {
  const [selectedFocus, setSelectedFocus] = useState<NutritionFocusId>(currentFocus);

  const handleConfirm = () => {
    if (selectedFocus !== currentFocus) {
      onSelect(selectedFocus);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-bg-primary rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Target size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Nutrition Focus</h2>
              <p className="text-xs text-text-muted">Choose what matters most to you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Focus Options */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {FOCUS_OPTIONS.map((focus) => (
            <FocusOption
              key={focus.id}
              focus={focus}
              isSelected={selectedFocus === focus.id}
              isCurrent={currentFocus === focus.id}
              onSelect={() => setSelectedFocus(focus.id)}
              showInfo={selectedFocus === focus.id}
            />
          ))}
        </div>

        {/* Info Panel */}
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.04]">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-text-muted leading-relaxed">
              Your focus adjusts how the nutrition score is calculated. Different focuses
              emphasize different nutrients and have stricter or more lenient limits.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                {selectedFocus === currentFocus ? 'Done' : 'Apply Focus'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface FocusOptionProps {
  focus: FocusInfo;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  showInfo: boolean;
}

function FocusOption({
  focus,
  isSelected,
  isCurrent,
  onSelect,
  showInfo,
}: FocusOptionProps): React.ReactElement {
  const IconComponent = focus.icon;

  return (
    <div className="space-y-1">
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
          isSelected
            ? 'bg-white/[0.06] border-emerald-500/40'
            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
        }`}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${focus.color}20` }}
        >
          <IconComponent size={20} style={{ color: focus.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{focus.name}</span>
            {isCurrent && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Current
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted line-clamp-1">{focus.description}</p>
        </div>

        {/* Selection indicator */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            isSelected
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-white/20'
          }`}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </div>
      </button>

      {/* Expanded Info */}
      {showInfo && (
        <div className="ml-13 px-4 py-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <FocusDetails focusId={focus.id} color={focus.color} />
        </div>
      )}
    </div>
  );
}

interface FocusDetailsProps {
  focusId: NutritionFocusId;
  color: string;
}

function FocusDetails({ focusId, color }: FocusDetailsProps): React.ReactElement {
  const details = FOCUS_DETAILS[focusId];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-[10px]">
        <div>
          <span className="text-text-muted">Adequacy</span>
          <span className="ml-1 font-bold" style={{ color }}>{details.weights.adequacy}</span>
        </div>
        <div>
          <span className="text-text-muted">Moderation</span>
          <span className="ml-1 font-bold" style={{ color }}>{details.weights.moderation}</span>
        </div>
        <div>
          <span className="text-text-muted">Balance</span>
          <span className="ml-1 font-bold" style={{ color }}>{details.weights.balance}</span>
        </div>
      </div>
      {details.emphasis && (
        <p className="text-[10px] text-text-muted">
          <span className="text-text-secondary font-medium">Emphasizes:</span> {details.emphasis}
        </p>
      )}
      {details.stricter && (
        <p className="text-[10px] text-text-muted">
          <span className="text-amber-400 font-medium">Stricter limits:</span> {details.stricter}
        </p>
      )}
    </div>
  );
}

// Focus configuration details for display
const FOCUS_DETAILS: Record<NutritionFocusId, {
  weights: { adequacy: number; moderation: number; balance: number };
  emphasis?: string;
  stricter?: string;
}> = {
  balanced: {
    weights: { adequacy: 50, moderation: 30, balance: 20 },
  },
  muscle_building: {
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    emphasis: 'Protein (2x), Vitamin D, Magnesium, Zinc',
  },
  heart_health: {
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    emphasis: 'Fiber, Potassium, Magnesium',
    stricter: 'Sodium (1500mg), Saturated fat (7%), Cholesterol (200mg)',
  },
  energy: {
    weights: { adequacy: 50, moderation: 25, balance: 25 },
    emphasis: 'B-vitamins, Iron, Fiber',
  },
  weight_management: {
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    emphasis: 'Protein, Fiber for satiety',
    stricter: 'Calorie tolerance (±10%)',
  },
  brain_focus: {
    weights: { adequacy: 50, moderation: 25, balance: 25 },
    emphasis: 'B6, B12, Folate, Choline, Vitamin E',
    stricter: 'Saturated fat (8%)',
  },
  gut_health: {
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    emphasis: 'Fiber (3x emphasis)',
  },
  blood_sugar: {
    weights: { adequacy: 45, moderation: 35, balance: 20 },
    emphasis: 'Fiber (2x), Magnesium',
    stricter: 'Added sugar (5% of calories)',
  },
  bone_joint: {
    weights: { adequacy: 55, moderation: 25, balance: 20 },
    emphasis: 'Calcium (2x), Vitamin D (2x), Vitamin K, Protein',
  },
  anti_inflammatory: {
    weights: { adequacy: 45, moderation: 30, balance: 25 },
    emphasis: 'Vitamin C, E, Selenium, Zinc, Fiber',
    stricter: 'Saturated fat (7%), Added sugar (5%)',
  },
};
