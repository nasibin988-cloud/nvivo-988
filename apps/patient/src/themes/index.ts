/**
 * Theme System
 *
 * To switch themes, change the import in index.css:
 *
 * @import './themes/obsidian.css';      // Theme 1: Deep Luxury Dark
 * @import './themes/midnight-ocean.css'; // Theme 2: Deep Blues
 * @import './themes/carbon-noir.css';    // Theme 3: Minimalist Monochrome
 * @import './themes/aurora.css';         // Theme 4: Gradient Glass
 * @import './themes/ember.css';          // Theme 5: Warm Dark
 */

export const THEMES = {
  OBSIDIAN: 'obsidian',
  MIDNIGHT_OCEAN: 'midnight-ocean',
  CARBON_NOIR: 'carbon-noir',
  AURORA: 'aurora',
  EMBER: 'ember',
} as const;

export type ThemeName = typeof THEMES[keyof typeof THEMES];

// For programmatic theme switching (future enhancement)
export const THEME_DESCRIPTIONS = {
  [THEMES.OBSIDIAN]: {
    name: 'Obsidian',
    description: 'Deep Luxury Dark - Professional, calm, premium',
    accent: '#6366F1',
  },
  [THEMES.MIDNIGHT_OCEAN]: {
    name: 'Midnight Ocean',
    description: 'Deep Blues - Calming, trustworthy, medical-grade',
    accent: '#38BDF8',
  },
  [THEMES.CARBON_NOIR]: {
    name: 'Carbon Noir',
    description: 'Minimalist Monochrome - Ultra-minimal, Apple-esque',
    accent: '#8B5CF6',
  },
  [THEMES.AURORA]: {
    name: 'Aurora',
    description: 'Gradient Glass - Dynamic, alive, premium',
    accent: '#818CF8',
  },
  [THEMES.EMBER]: {
    name: 'Ember',
    description: 'Warm Dark - Welcoming, organic, healthy',
    accent: '#F97316',
  },
} as const;
