import { NavLink, useLocation } from 'react-router-dom';
import { Home, Heart, BookOpen, ClipboardList, GraduationCap, LucideIcon } from 'lucide-react';

interface NavTab {
  path: string;
  label: string;
  icon: LucideIcon;
}

// Changed "More" to "Learn" as requested
const tabs: NavTab[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/care', label: 'Care', icon: ClipboardList },
  { path: '/learn', label: 'Learn', icon: GraduationCap },
];

interface BottomNavProps {
  variant?: 1 | 2 | 3 | 4;
}

/**
 * Variant 1: Classic Stacked
 * Traditional bottom nav with stacked icon and label
 */
function NavVariant1() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-base ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Variant 2: Pill Active State
 * Modern design with pill-shaped active indicator
 */
function NavVariant2() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center justify-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent flex-[1.5]'
                  : 'text-text-muted hover:text-text-secondary flex-1'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="text-xs font-medium whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Variant 3: Floating Dock
 * iOS-style floating dock with rounded corners
 */
function NavVariant3() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-surface/90 backdrop-blur-lg rounded-2xl shadow-elevated border border-border/50 px-2">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path));
            return (
              <NavLink
                key={path}
                to={path}
                className={`relative flex flex-col items-center justify-center flex-1 h-14 transition-all duration-200 ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-accent/10 scale-110' : 'scale-100'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] mt-0.5 transition-all duration-200 ${
                    isActive ? 'font-semibold opacity-100' : 'opacity-70'
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Variant 4: Minimalist Icons
 * Clean icon-only design with subtle dot indicator
 */
function NavVariant4() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="border-t border-border/50">
        <div className="flex justify-around items-center h-14">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path));
            return (
              <NavLink
                key={path}
                to={path}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                }`}
                aria-label={label}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                {/* Dot indicator */}
                <div
                  className={`absolute bottom-1 w-1 h-1 rounded-full bg-accent transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Bottom navigation with 4 design variants
 * "More" tab has been changed to "Learn"
 */
export function BottomNav({ variant = 1 }: BottomNavProps) {
  const location = useLocation();

  // Don't show on login
  if (location.pathname === '/login') return null;

  switch (variant) {
    case 2:
      return <NavVariant2 />;
    case 3:
      return <NavVariant3 />;
    case 4:
      return <NavVariant4 />;
    default:
      return <NavVariant1 />;
  }
}

/**
 * Get bottom padding for content based on nav variant
 */
export function getNavPadding(variant: 1 | 2 | 3 | 4 = 1): string {
  if (variant === 3) {
    return 'pb-28'; // Extra padding for floating nav
  }
  return 'pb-20'; // Standard padding
}

export default BottomNav;
