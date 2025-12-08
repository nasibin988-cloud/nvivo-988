import { Bell, User } from 'lucide-react';

interface GreetingHeaderProps {
  firstName: string | null | undefined;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function GreetingHeader({
  firstName,
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
}: GreetingHeaderProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Let's check on your health today
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2.5 rounded-theme-md bg-surface hover:bg-surface-2 border border-border transition-base"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onProfileClick}
          className="p-2.5 rounded-theme-md bg-surface hover:bg-surface-2 border border-border transition-base"
          aria-label="Profile"
        >
          <User size={20} className="text-text-secondary" />
        </button>
      </div>
    </div>
  );
}

export function GreetingHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="h-7 w-48 skeleton rounded" />
        <div className="h-4 w-36 skeleton rounded mt-2" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 skeleton rounded-theme-md" />
        <div className="w-10 h-10 skeleton rounded-theme-md" />
      </div>
    </div>
  );
}
