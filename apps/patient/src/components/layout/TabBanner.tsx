/**
 * Tab Banner Component
 * Unified banner design for Health, Journal, Care, and Learn tabs
 * 4 design variants for selection
 */

import { BookOpen, GraduationCap, Activity, Stethoscope } from 'lucide-react';

// Tab configuration with colors and icons
export const tabConfig = {
  health: {
    title: 'Health',
    subtitle: 'Track your vitals and wellness',
    icon: Activity,
    color: 'rose',
    gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/20',
  },
  journal: {
    title: 'Journal',
    subtitle: 'Log your daily activities and mood',
    icon: BookOpen,
    color: 'violet',
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
  },
  care: {
    title: 'Care',
    subtitle: 'Manage your care team and appointments',
    icon: Stethoscope,
    color: 'cyan',
    gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
  },
  learn: {
    title: 'Learn',
    subtitle: 'Health education tailored for you',
    icon: GraduationCap,
    color: 'amber',
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
};

type TabType = keyof typeof tabConfig;

interface TabBannerProps {
  tab: TabType;
  design?: 1 | 2 | 3 | 4;
}

/**
 * Design 1: Icon Box Style
 * Colored icon box on left, title + subtitle stacked on right
 */
function Design1({ tab }: { tab: TabType }) {
  const config = tabConfig[tab];
  const Icon = config.icon;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border}`}>
          <Icon size={22} className={config.text} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{config.title}</h1>
          <p className="text-sm text-text-secondary">{config.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Design 2: Full-Width Gradient Banner
 * Gradient background with large background icon, title only
 */
function Design2({ tab }: { tab: TabType }) {
  const config = tabConfig[tab];
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`} />
      <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l ${config.gradient} opacity-50`} />

      {/* Large background icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
        <Icon size={80} className={config.text} />
      </div>

      {/* Content */}
      <div className="relative px-6 py-6">
        <h1 className="text-2xl font-medium tracking-wide text-text-primary">{config.title}</h1>
      </div>
    </div>
  );
}

/**
 * Design 3: Card Style with Glow
 * Floating card with subtle glow and icon
 */
function Design3({ tab }: { tab: TabType }) {
  const config = tabConfig[tab];
  const Icon = config.icon;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className={`relative rounded-2xl ${config.bg} border ${config.border} p-4 overflow-hidden`}>
        {/* Glow effect */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 ${config.bg} blur-3xl opacity-50`} />

        {/* Content */}
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{config.title}</h1>
            <p className="text-sm text-text-secondary mt-0.5">{config.subtitle}</p>
          </div>
          <div className={`p-3 rounded-full ${config.bg} border ${config.border}`}>
            <Icon size={24} className={config.text} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Design 4: Minimal Accent Line
 * Clean design with colored accent line and floating icon
 */
function Design4({ tab }: { tab: TabType }) {
  const config = tabConfig[tab];
  const Icon = config.icon;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{config.title}</h1>
            <div className={`h-1 w-12 rounded-full ${config.bg.replace('/10', '/40')}`} />
          </div>
          <p className="text-sm text-text-secondary mt-1">{config.subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon size={18} className={config.text} />
        </div>
      </div>
    </div>
  );
}

/**
 * Main TabBanner component
 * Use design prop to select variant (1-4)
 */
export default function TabBanner({ tab, design = 1 }: TabBannerProps) {
  switch (design) {
    case 1:
      return <Design1 tab={tab} />;
    case 2:
      return <Design2 tab={tab} />;
    case 3:
      return <Design3 tab={tab} />;
    case 4:
      return <Design4 tab={tab} />;
    default:
      return <Design1 tab={tab} />;
  }
}

/**
 * Preview all designs for a specific tab
 * Use this component to compare all 4 designs
 */
export function TabBannerPreview({ tab }: { tab: TabType }) {
  return (
    <div className="space-y-6 p-4 bg-background min-h-screen">
      <h2 className="text-lg font-bold text-text-primary mb-4">Banner Design Options for {tabConfig[tab].title}</h2>

      <div className="space-y-4">
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-surface border-b border-border">
            <span className="text-xs font-medium text-text-secondary">Design 1: Icon Box Style</span>
          </div>
          <Design1 tab={tab} />
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-surface border-b border-border">
            <span className="text-xs font-medium text-text-secondary">Design 2: Gradient Banner</span>
          </div>
          <Design2 tab={tab} />
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-surface border-b border-border">
            <span className="text-xs font-medium text-text-secondary">Design 3: Card with Glow</span>
          </div>
          <Design3 tab={tab} />
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-surface border-b border-border">
            <span className="text-xs font-medium text-text-secondary">Design 4: Minimal Accent Line</span>
          </div>
          <Design4 tab={tab} />
        </div>
      </div>
    </div>
  );
}
