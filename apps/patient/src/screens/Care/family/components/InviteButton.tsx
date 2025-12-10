/**
 * InviteButton - Prominent button to invite family members
 */

import { UserPlus } from 'lucide-react';

interface InviteButtonProps {
  onClick: () => void;
}

export function InviteButton({ onClick }: InviteButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-white/[0.08] p-4 hover:border-white/[0.15] hover:bg-surface-2 transition-all group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.06] via-transparent to-violet-500/[0.04] opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center justify-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <UserPlus size={18} className="text-rose-400" />
        </div>
        <span className="text-text-primary font-medium">Invite Family Member</span>
      </div>
    </button>
  );
}
