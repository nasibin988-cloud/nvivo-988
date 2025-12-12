/**
 * AnalyzingAnimation - Sexy scanning/analyzing animation for food analysis
 * Used across Photo AI, Text AI, Menu Scanner, and Food Compare
 */

import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AnalyzingAnimationProps {
  /** Image to show behind the animation (optional) */
  imageData?: string | null;
  /** Main title text */
  title: string;
  /** Subtitle/description text */
  subtitle: string;
  /** Icon to display in the center */
  icon: LucideIcon;
  /** Color theme */
  colorTheme?: 'teal' | 'violet' | 'amber' | 'emerald';
}

const COLOR_THEMES = {
  teal: {
    scanLine: 'via-teal-400',
    glow: 'bg-teal-500/20',
    iconBg: 'bg-teal-500/20',
    iconBorder: 'border-teal-500/30',
    iconColor: 'text-teal-400',
    textColor: 'text-teal-400',
    dotColor: 'bg-teal-400/60',
  },
  violet: {
    scanLine: 'via-violet-400',
    glow: 'bg-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconBorder: 'border-violet-500/30',
    iconColor: 'text-violet-400',
    textColor: 'text-violet-400',
    dotColor: 'bg-violet-400/60',
  },
  amber: {
    scanLine: 'via-amber-400',
    glow: 'bg-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400/60',
  },
  emerald: {
    scanLine: 'via-emerald-400',
    glow: 'bg-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400/60',
  },
};

export function AnalyzingAnimation({
  imageData,
  title,
  subtitle,
  icon: Icon,
  colorTheme = 'teal',
}: AnalyzingAnimationProps): React.ReactElement {
  const colors = COLOR_THEMES[colorTheme];

  // If we have an image, show it with the overlay
  if (imageData) {
    return (
      <div className="p-5">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06]">
          {/* Image preview with scanning overlay */}
          <img
            src={imageData}
            alt="Analyzing"
            className="w-full h-full object-cover opacity-50"
          />

          {/* Scanning animation overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            {/* Animated scan line */}
            <div className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent ${colors.scanLine} to-transparent animate-scan`} />

            {/* Loading indicator */}
            <div className="relative">
              <div className={`absolute -inset-4 ${colors.glow} rounded-full blur-xl animate-pulse`} />
              <div className={`relative p-4 rounded-full ${colors.iconBg} border ${colors.iconBorder}`}>
                <Icon size={32} className={`${colors.iconColor} animate-pulse`} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className={`flex items-center justify-center gap-2 ${colors.textColor} font-semibold`}>
                <Loader2 size={16} className="animate-spin" />
                {title}
              </div>
              <p className="text-xs text-text-muted mt-2">
                {subtitle}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${colors.dotColor} animate-bounce`}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Custom styles for scan animation */}
        <style>{`
          @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // No image - show centered animation (for text analysis, comparison)
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5">
      {/* Animated background circle */}
      <div className="relative">
        <div className={`absolute -inset-8 ${colors.glow} rounded-full blur-2xl animate-pulse`} />

        {/* Orbiting dots */}
        <div className="absolute -inset-6 animate-spin-slow">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${colors.dotColor}`}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 90}deg) translateX(24px) translateY(-50%)`,
              }}
            />
          ))}
        </div>

        {/* Center icon */}
        <div className={`relative w-20 h-20 rounded-2xl ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center`}>
          <Icon size={36} className={`${colors.iconColor} animate-pulse`} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className={`flex items-center justify-center gap-2 ${colors.textColor} font-semibold text-lg`}>
          <Loader2 size={18} className="animate-spin" />
          {title}
        </div>
        <p className="text-sm text-text-muted mt-2 max-w-xs">
          {subtitle}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${colors.dotColor} animate-bounce`}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Custom styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
