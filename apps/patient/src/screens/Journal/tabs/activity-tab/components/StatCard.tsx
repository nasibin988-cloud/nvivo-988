/**
 * Stat Card Component
 * Displays a single stat with icon, value, and label
 */

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

export function StatCard({ icon, value, label, color }: StatCardProps): React.ReactElement {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className={`p-2 rounded-lg ${color} w-fit mb-2`}>
        {icon}
      </div>
      <span className="text-xl font-bold text-text-primary block">{value}</span>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}
