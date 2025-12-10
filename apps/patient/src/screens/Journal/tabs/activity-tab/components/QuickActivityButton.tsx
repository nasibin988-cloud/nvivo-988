/**
 * Quick Activity Button Component
 * Shortcut button for common activities
 */

interface QuickActivityButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

export function QuickActivityButton({
  icon,
  label,
  color,
  onClick,
}: QuickActivityButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface border border-border hover:bg-surface-2 transition-all"
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-text-primary">{label}</span>
    </button>
  );
}
