import { NavLink, useLocation } from 'react-router-dom';
import { Home, Heart, BookOpen, ClipboardList, Menu } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/care', label: 'Care', icon: ClipboardList },
  { path: '/more', label: 'More', icon: Menu },
];

export default function TabBar() {
  const location = useLocation();

  // Don't show on login
  if (location.pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-base ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
