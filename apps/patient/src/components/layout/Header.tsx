import { Bell, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  firstName: string | null | undefined;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
  unreadCount?: number;
  variant?: 1 | 2 | 3 | 4;
  // Quick stats data (kept for compatibility but not used in minimal designs)
  streak?: number;
  healthScore?: number;
  medicationsToday?: number;
  appointmentsToday?: number;
  avatarUrl?: string;
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Variant 1: Floating Glass
 * Ultra-minimal with frosted glass aesthetic and subtle gradient accent
 */
function HeaderVariant1({
  firstName,
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
  avatarUrl,
}: HeaderProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <div className="relative py-4 px-4">
      {/* Subtle gradient orb behind */}
      <div className="absolute top-0 right-8 w-24 h-24 bg-gradient-to-br from-accent/30 to-accent-secondary/20 rounded-full blur-2xl" />

      <div className="relative flex items-center justify-between">
        {/* Left - Minimal greeting */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{greeting}</p>
          <h1 className="text-xl font-light text-text-primary tracking-tight">
            {firstName || 'Welcome'}
          </h1>
        </div>

        {/* Right - Glass-style actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNotificationsClick}
            className="relative w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-secondary p-[2px] hover:scale-105 transition-transform duration-300"
            aria-label="Profile"
          >
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-text-primary">
                  {firstName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Variant 2: Neon Accent Line
 * Clean with a beautiful glowing accent line underneath
 */
function HeaderVariant2({
  firstName,
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
  avatarUrl,
}: HeaderProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <div className="pt-4 pb-5 px-4">
      <div className="flex items-center justify-between mb-4">
        {/* Left - Name focus */}
        <div className="flex items-center gap-3">
          <button
            onClick={onProfileClick}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent via-accent to-accent-secondary flex items-center justify-center shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow duration-300"
            aria-label="Profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-lg font-semibold text-white">
                {firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </button>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">{greeting}</p>
            <h1 className="text-lg font-semibold text-text-primary -mt-0.5">
              {firstName || 'Welcome'}
            </h1>
          </div>
        </div>

        {/* Right - Minimal bell */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2.5"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Glowing accent line */}
      <div className="relative h-[2px] rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm" />
      </div>
    </div>
  );
}

/**
 * Variant 3: Split Tone
 * Modern split design with contrasting left/right sections
 */
function HeaderVariant3({
  firstName,
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
  avatarUrl,
}: HeaderProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <div className="flex items-stretch -mx-4">
      {/* Left section - Dark/accent tone */}
      <div className="flex-1 bg-gradient-to-r from-accent/10 to-transparent py-5 pl-8 pr-4">
        <p className="text-[11px] text-accent font-medium uppercase tracking-wider mb-0.5">
          {greeting}
        </p>
        <h1 className="text-xl font-bold text-text-primary">
          {firstName || 'Welcome'}
        </h1>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={onNotificationsClick}
          className="relative w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center hover:border-accent/30 transition-colors duration-300"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-accent to-accent-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onProfileClick}
          className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-accent/50 hover:border-accent transition-colors duration-300"
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center">
              <span className="text-base font-semibold text-white">
                {firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Variant 4: Sparkle Minimal
 * Super clean with a subtle sparkle icon accent
 */
function HeaderVariant4({
  firstName,
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
  avatarUrl,
}: HeaderProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <div className="py-5 px-4">
      <div className="flex items-center justify-between">
        {/* Left - Greeting with sparkle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles size={20} className="text-accent" />
            <div className="absolute inset-0 blur-md bg-accent/40 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-text-primary">
              {greeting}, <span className="font-semibold">{firstName || 'friend'}</span>
            </h1>
          </div>
        </div>

        {/* Right - Stacked icons */}
        <div className="flex items-center">
          <button
            onClick={onNotificationsClick}
            className="relative w-9 h-9 flex items-center justify-center hover:bg-surface-2 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-text-muted" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>

          <div className="w-px h-5 bg-border mx-2" />

          <button
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-accent/30 transition-all duration-300"
            aria-label="Profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center">
                <User size={16} className="text-text-secondary" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Header component with 4 design variants
 */
export function Header(props: HeaderProps) {
  const { variant = 1 } = props;

  switch (variant) {
    case 2:
      return <HeaderVariant2 {...props} />;
    case 3:
      return <HeaderVariant3 {...props} />;
    case 4:
      return <HeaderVariant4 {...props} />;
    default:
      return <HeaderVariant1 {...props} />;
  }
}

/**
 * Skeleton loaders for each variant (all minimal)
 */
export function HeaderSkeleton({ variant = 1 }: { variant?: 1 | 2 | 3 | 4 }) {
  // Variant 2: Neon Accent Line
  if (variant === 2) {
    return (
      <div className="pt-4 pb-5 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 skeleton rounded-2xl" />
            <div>
              <div className="h-2.5 w-16 skeleton rounded mb-1.5" />
              <div className="h-5 w-24 skeleton rounded" />
            </div>
          </div>
          <div className="w-10 h-10 skeleton rounded-full" />
        </div>
        <div className="h-[2px] skeleton rounded-full" />
      </div>
    );
  }

  // Variant 3: Split Tone
  if (variant === 3) {
    return (
      <div className="flex items-stretch -mx-4">
        <div className="flex-1 py-5 pl-8 pr-4">
          <div className="h-3 w-20 skeleton rounded mb-1.5" />
          <div className="h-6 w-28 skeleton rounded" />
        </div>
        <div className="flex items-center gap-2 pr-4">
          <div className="w-11 h-11 skeleton rounded-2xl" />
          <div className="w-11 h-11 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  // Variant 4: Sparkle Minimal
  if (variant === 4) {
    return (
      <div className="py-5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 skeleton rounded-full" />
            <div className="h-5 w-40 skeleton rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 skeleton rounded-full" />
            <div className="w-px h-5 bg-border mx-1" />
            <div className="w-9 h-9 skeleton rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Default variant 1: Floating Glass
  return (
    <div className="py-4 px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-20 skeleton rounded mb-1.5" />
          <div className="h-6 w-28 skeleton rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 skeleton rounded-full" />
          <div className="w-10 h-10 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default Header;
