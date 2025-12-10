/**
 * NutritionTierSelector Component
 * Allows users to choose nutrition detail level (Essential, Extended, Complete)
 */

import type { LucideIcon } from 'lucide-react';
import { Info, Sparkles, Beaker, FlaskConical } from 'lucide-react';
import type { NutritionDetailLevel } from '../types';

interface NutritionTierSelectorProps {
  selectedTier: NutritionDetailLevel;
  onTierChange: (tier: NutritionDetailLevel) => void;
}

interface TierOption {
  value: NutritionDetailLevel;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TIER_OPTIONS: TierOption[] = [
  {
    value: 'essential',
    label: 'Essential',
    description: 'Calories, protein, carbs, fat',
    icon: Info,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    value: 'extended',
    label: 'Extended',
    description: '+ Fiber, vitamins, minerals',
    icon: Sparkles,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  {
    value: 'complete',
    label: 'Complete',
    description: '+ All micronutrients',
    icon: FlaskConical,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
];

export default function NutritionTierSelector({
  selectedTier,
  onTierChange,
}: NutritionTierSelectorProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Beaker size={14} className="text-text-muted" />
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Nutrition Detail Level
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TIER_OPTIONS.map((tier) => {
          const isSelected = selectedTier === tier.value;
          const Icon = tier.icon;

          return (
            <button
              key={tier.value}
              onClick={() => onTierChange(tier.value)}
              className={`
                relative p-3 rounded-xl text-left transition-all duration-200
                ${isSelected
                  ? `${tier.bgColor} ${tier.borderColor} border-2 shadow-lg`
                  : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                }
              `}
            >
              <div className="flex flex-col items-center text-center gap-1.5">
                <Icon
                  size={18}
                  className={isSelected ? tier.color : 'text-text-muted'}
                />
                <span
                  className={`text-xs font-semibold ${isSelected ? tier.color : 'text-text-primary'}`}
                >
                  {tier.label}
                </span>
                <span className="text-[9px] text-text-muted leading-tight">
                  {tier.description}
                </span>
              </div>

              {isSelected && (
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${tier.bgColor} ${tier.borderColor} border-2`}
                  style={{
                    backgroundColor: tier.value === 'essential' ? '#10b981' :
                                   tier.value === 'extended' ? '#8b5cf6' : '#f59e0b',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
