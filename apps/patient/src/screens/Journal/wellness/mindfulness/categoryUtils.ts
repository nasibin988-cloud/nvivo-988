/**
 * Category Utilities for Mindfulness
 */

import { Moon, Wind, Sparkles, Waves, Brain, type LucideIcon } from 'lucide-react';

export function getCategoryColor(category: string): { text: string; bg: string; border: string; hex: string } {
  const colors: Record<string, { text: string; bg: string; border: string; hex: string }> = {
    Vitality: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hex: '#06b6d4' },
    Sleep: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hex: '#a855f7' },
    Stress: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#10b981' },
    Focus: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#f59e0b' },
  };
  return colors[category] || colors.Vitality;
}

export function getCategoryIcon(category: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    Vitality: Wind,
    Sleep: Moon,
    Stress: Sparkles,
    Focus: Waves,
  };
  return icons[category] || Brain;
}

export function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Vitality: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    Sleep: 'from-purple-500/20 via-pink-500/10 to-transparent',
    Stress: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    Focus: 'from-amber-500/20 via-orange-500/10 to-transparent',
  };
  return gradients[category] || 'from-gray-500/10 to-transparent';
}
