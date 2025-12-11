/**
 * AnalysisModalShell - Reusable modal wrapper for AI analysis features
 * Used by PhotoAnalysisModal, MenuScannerModal, and FoodComparisonModal
 */

import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AnalysisModalShellProps {
  /** Modal title */
  title: string;
  /** Subtitle/step description */
  subtitle: string;
  /** Icon component for header */
  icon: LucideIcon;
  /** Header background gradient classes */
  headerGradient: string;
  /** Icon background gradient classes */
  iconGradient: string;
  /** Icon shadow classes */
  iconShadow: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (optional) */
  footer?: React.ReactNode;
  /** Close handler */
  onClose: () => void;
  /** Max width class (default: max-w-lg) */
  maxWidth?: string;
}

export function AnalysisModalShell({
  title,
  subtitle,
  icon: Icon,
  headerGradient,
  iconGradient,
  iconShadow,
  children,
  footer,
  onClose,
  maxWidth = 'max-w-lg',
}: AnalysisModalShellProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal container */}
      <div className={`relative w-full ${maxWidth} bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className={`p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r ${headerGradient}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconGradient} text-white shadow-lg ${iconShadow}`}>
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{title}</h2>
              <p className="text-xs text-text-muted">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
