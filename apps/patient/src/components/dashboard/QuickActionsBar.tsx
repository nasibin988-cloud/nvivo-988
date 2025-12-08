import { Heart, Utensils, MessageCircle, Calendar } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<Record<string, unknown>>;
  color: string;
  bgColor: string;
  path: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'mood',
    label: 'Log Mood',
    icon: Heart,
    color: 'text-cardiac',
    bgColor: 'bg-cardiac-muted',
    path: '/journal?tab=wellness',
  },
  {
    id: 'food',
    label: 'Log Food',
    icon: Utensils,
    color: 'text-nutrition',
    bgColor: 'bg-nutrition-muted',
    path: '/journal?tab=food',
  },
  {
    id: 'message',
    label: 'Message',
    icon: MessageCircle,
    color: 'text-accent',
    bgColor: 'bg-accent-muted',
    path: '/care?tab=messaging',
  },
  {
    id: 'appointment',
    label: 'Appointments',
    icon: Calendar,
    color: 'text-sleep',
    bgColor: 'bg-sleep-muted',
    path: '/care?tab=appointments',
  },
];

interface QuickActionsBarProps {
  onActionClick?: (path: string) => void;
}

export function QuickActionsBar({ onActionClick }: QuickActionsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onActionClick?.(action.path)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-theme-lg bg-surface border border-border hover:border-border-strong transition-base"
          >
            <div className={`p-2 rounded-theme-md ${action.bgColor}`}>
              <Icon size={20} className={action.color} />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickActionsBarSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 p-3">
          <div className="w-10 h-10 skeleton rounded-theme-md" />
          <div className="w-12 h-3 skeleton rounded" />
        </div>
      ))}
    </div>
  );
}
