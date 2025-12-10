/**
 * RequestButton Component
 * Button to start a new appointment request
 */

import { Plus } from 'lucide-react';

interface RequestButtonProps {
  onClick: () => void;
}

export default function RequestButton({ onClick }: RequestButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-white/[0.08] p-4 hover:border-white/[0.15] hover:bg-surface-2 transition-all group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-info/[0.05] opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center justify-center gap-3">
        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
          <Plus size={18} className="text-accent" />
        </div>
        <span className="text-text-primary font-medium">Request Appointment</span>
      </div>
    </button>
  );
}
