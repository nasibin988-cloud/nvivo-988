/**
 * ActiveShares - Display list of active shared health summaries
 */

import { Link, Copy, CheckCircle } from 'lucide-react';
import type { SharedSummary } from '../types';

interface ActiveSharesProps {
  shares: SharedSummary[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ActiveShares({
  shares,
  copiedCode,
  onCopyCode,
}: ActiveSharesProps): React.ReactElement | null {
  if (shares.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-text-secondary">Active Shares</h3>
        <span className="text-xs text-text-muted">{shares.length} active</span>
      </div>
      {shares.map((share) => (
        <div
          key={share.id}
          className="p-4 rounded-2xl bg-surface border border-white/[0.04]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Link size={16} className="text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{share.recipientEmail}</p>
                <p className="text-xs text-text-muted">
                  Expires {share.expiresAt} &bull; {share.viewCount} views
                </p>
              </div>
            </div>
            <button
              onClick={() => onCopyCode(share.accessCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              {copiedCode === share.accessCode ? (
                <CheckCircle size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} className="text-text-muted" />
              )}
              <span className="text-xs font-mono text-text-secondary">{share.accessCode}</span>
            </button>
          </div>
          <div className="flex gap-2">
            {share.includesMetrics && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">
                Vitals
              </span>
            )}
            {share.includesMedications && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">
                Meds
              </span>
            )}
            {share.includesAppointments && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">
                Appts
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
