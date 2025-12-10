/**
 * StatusBadge Component
 * Display status with appropriate color styling
 */

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  improved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  stable: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  worsened: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  normal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  borderline: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  abnormal: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  mild: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  moderate: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  severe: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const style = statusConfig[status] || statusConfig.normal;

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text} uppercase`}>
      {status}
    </span>
  );
}
