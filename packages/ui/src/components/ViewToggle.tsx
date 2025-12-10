/**
 * ViewToggle - Reusable view toggle component with two style variants
 *
 * Variant 'glass': Glassmorphic style with glow effects (used in Wellness, Nutrition)
 * Variant 'solid': Solid background style (used in Activity, Medications, Assessments)
 */

import React from 'react';

export type ViewToggleVariant = 'glass' | 'solid';

export type ViewToggleColor = 'violet' | 'emerald' | 'sky' | 'rose' | 'amber';

export interface ViewToggleOption<T extends string> {
  value: T;
  label: string;
}

export interface ViewToggleProps<T extends string> {
  options: [ViewToggleOption<T>, ViewToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  color: ViewToggleColor;
  variant?: ViewToggleVariant;
}

// Color configurations for each variant
const glassColorConfig: Record<ViewToggleColor, { active: string; glow: string }> = {
  violet: {
    active: 'text-violet-400 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    glow: 'rgba(139,92,246,0.15)',
  },
  emerald: {
    active: 'text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    glow: 'rgba(16,185,129,0.15)',
  },
  sky: {
    active: 'text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
    glow: 'rgba(14,165,233,0.15)',
  },
  rose: {
    active: 'text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    glow: 'rgba(244,63,94,0.15)',
  },
  amber: {
    active: 'text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    glow: 'rgba(245,158,11,0.15)',
  },
};

const solidColorConfig: Record<ViewToggleColor, { bg: string; shadow: string }> = {
  violet: { bg: 'bg-violet-500', shadow: 'shadow-violet-500/25' },
  emerald: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/25' },
  sky: { bg: 'bg-sky-500', shadow: 'shadow-sky-500/25' },
  rose: { bg: 'bg-rose-500', shadow: 'shadow-rose-500/25' },
  amber: { bg: 'bg-amber-500', shadow: 'shadow-amber-500/25' },
};

export function ViewToggle<T extends string>({
  options,
  value,
  onChange,
  color,
  variant = 'glass',
}: ViewToggleProps<T>): React.ReactElement {
  if (variant === 'glass') {
    const colorCfg = glassColorConfig[color];
    return (
      <div className="flex bg-white/[0.02] backdrop-blur-sm rounded-xl p-1 border border-white/[0.04]">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              value === option.value
                ? `bg-white/[0.08] ${colorCfg.active} border`
                : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  // Solid variant
  const colorCfg = solidColorConfig[color];
  return (
    <div className="flex bg-surface-2 rounded-xl p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            value === option.value
              ? `${colorCfg.bg} text-white shadow-lg ${colorCfg.shadow}`
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
