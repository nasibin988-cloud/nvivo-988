/**
 * FocusSelector - Prominent wellness focus selector for food comparison
 * Used in both Menu Scanner and Food Compare before analysis
 */

import {
  Dumbbell,
  Heart,
  Battery,
  Scale,
  Brain,
  Leaf,
  Activity,
  Bone,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { WellnessFocus } from '../types';

interface FocusSelectorProps {
  selectedFocus: WellnessFocus;
  onFocusChange: (focus: WellnessFocus) => void;
  /** Color theme - 'teal' for menu scanner, 'violet' for food compare */
  colorTheme?: 'teal' | 'violet';
}

// Wellness focus options with icons and descriptions
const WELLNESS_FOCUSES: {
  value: WellnessFocus;
  label: string;
  icon: typeof Heart;
  description: string;
}[] = [
  { value: 'balanced', label: 'Balanced', icon: Scale, description: 'Overall nutrition' },
  { value: 'muscle_building', label: 'Muscle', icon: Dumbbell, description: 'High protein' },
  { value: 'heart_health', label: 'Heart', icon: Heart, description: 'Low sat fat & sodium' },
  { value: 'energy_endurance', label: 'Energy', icon: Battery, description: 'Sustained fuel' },
  { value: 'weight_management', label: 'Weight', icon: Scale, description: 'Calorie smart' },
  { value: 'brain_focus', label: 'Brain', icon: Brain, description: 'Cognitive boost' },
  { value: 'gut_health', label: 'Gut', icon: Leaf, description: 'Fiber & prebiotics' },
  { value: 'blood_sugar_balance', label: 'Blood Sugar', icon: Activity, description: 'Low glycemic' },
  { value: 'bone_joint_support', label: 'Bone', icon: Bone, description: 'Calcium & D' },
  { value: 'anti_inflammatory', label: 'Anti-Inflam', icon: Shield, description: 'Reduce inflammation' },
];

export function FocusSelector({
  selectedFocus,
  onFocusChange,
  colorTheme = 'teal',
}: FocusSelectorProps): React.ReactElement {
  const colors = colorTheme === 'teal'
    ? {
        accent: 'teal',
        bgActive: 'bg-teal-500/15',
        borderActive: 'border-teal-500/40',
        textActive: 'text-teal-400',
        iconBg: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
        iconBorder: 'border-teal-500/30',
      }
    : {
        accent: 'violet',
        bgActive: 'bg-violet-500/15',
        borderActive: 'border-violet-500/40',
        textActive: 'text-violet-400',
        iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
        iconBorder: 'border-violet-500/30',
      };

  return (
    <div className={`rounded-xl border ${colors.iconBorder} ${colors.iconBg} p-4`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className={colors.textActive} />
        <span className="text-sm font-semibold text-text-primary">What's Your Focus?</span>
        <span className="text-xs text-text-muted ml-auto">Affects scoring</span>
      </div>

      {/* Focus options - 5 columns on larger screens, 3 on small */}
      <div className="grid grid-cols-5 gap-1.5">
        {WELLNESS_FOCUSES.map(({ value, label, icon: Icon }) => {
          const isActive = selectedFocus === value;
          return (
            <button
              key={value}
              onClick={() => onFocusChange(value)}
              className={`p-2 rounded-lg text-center transition-all ${
                isActive
                  ? `${colors.bgActive} ${colors.borderActive} border`
                  : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <Icon
                size={18}
                className={`mx-auto mb-1 ${isActive ? colors.textActive : 'text-text-muted'}`}
              />
              <span
                className={`text-[10px] font-medium leading-tight block ${
                  isActive ? colors.textActive : 'text-text-secondary'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
