/**
 * Shared types for food analysis features
 * Common interfaces used across PhotoAnalysis, MenuScanner, and FoodComparison
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Theme configuration for analysis modals
 */
export interface AnalysisModalTheme {
  /** Primary color name (e.g., 'violet', 'teal', 'blue') */
  color: string;
  /** Icon component to display in header */
  icon: LucideIcon;
  /** Gradient classes for header background */
  headerGradient: string;
  /** Gradient classes for icon background */
  iconGradient: string;
  /** Shadow color class for icon */
  iconShadow: string;
  /** Border color for action buttons */
  buttonBorder: string;
  /** Text color for action buttons */
  buttonText: string;
  /** Hover background for action buttons */
  buttonHoverBg: string;
  /** Shadow color for action buttons */
  buttonShadow: string;
}

/**
 * Pre-defined themes for different modal types
 */
export const MODAL_THEMES = {
  photoAnalysis: {
    color: 'violet',
    headerGradient: 'from-violet-500/[0.08] via-purple-500/[0.05] to-transparent',
    iconGradient: 'from-violet-500/90 to-purple-600/90',
    iconShadow: 'shadow-violet-500/20',
    buttonBorder: 'border-violet-500/30',
    buttonText: 'text-violet-400',
    buttonHoverBg: 'hover:bg-violet-500/20',
    buttonShadow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  menuScanner: {
    color: 'teal',
    headerGradient: 'from-teal-500/[0.08] via-cyan-500/[0.05] to-transparent',
    iconGradient: 'from-teal-500/90 to-cyan-600/90',
    iconShadow: 'shadow-teal-500/20',
    buttonBorder: 'border-teal-500/30',
    buttonText: 'text-teal-400',
    buttonHoverBg: 'hover:bg-teal-500/20',
    buttonShadow: 'hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]',
  },
  foodComparison: {
    color: 'blue',
    headerGradient: 'from-blue-500/[0.08] via-indigo-500/[0.05] to-transparent',
    iconGradient: 'from-blue-500/90 to-indigo-600/90',
    iconShadow: 'shadow-blue-500/20',
    buttonBorder: 'border-blue-500/30',
    buttonText: 'text-blue-400',
    buttonHoverBg: 'hover:bg-blue-500/20',
    buttonShadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
} as const;

/**
 * Common capture step props shared between PhotoAnalysis and MenuScanner
 */
export interface BaseCaptureStepProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Extended capture step props with theming
 */
export interface ThemedCaptureStepProps extends BaseCaptureStepProps {
  /** Theme color for UI elements */
  themeColor: 'violet' | 'teal' | 'blue';
  /** Empty state icon */
  emptyIcon?: LucideIcon;
  /** Empty state text */
  emptyText?: string;
  /** Secondary empty state text */
  emptySubtext?: string;
  /** Tips to show (optional, for menu scanner) */
  tips?: string[];
  /** Capture button label */
  captureLabel?: string;
}
