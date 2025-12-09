import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DesignVariantProvider, useDesignVariants } from './contexts/DesignVariantContext';
import LoginScreen from './screens/Login/LoginScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import HealthScreen from './screens/Health/HealthScreen';
import JournalScreen from './screens/Journal/JournalScreen';
import CareScreen from './screens/Care';
import LearnScreen from './screens/Learn/LearnScreen';
import { BottomNav } from './components/layout/BottomNav';
import TabBanner from './components/layout/TabBanner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();
  const { variants } = useDesignVariants();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <HealthScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/care"
          element={
            <ProtectedRoute>
              <CareScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <LearnScreen />
            </ProtectedRoute>
          }
        />
        {/* Legacy more route redirects to learn */}
        <Route path="/more" element={<Navigate to="/learn" replace />} />
        {/* Banner design preview - temporary route */}
        <Route
          path="/banner-preview"
          element={
            <ProtectedRoute>
              <BannerDesignPreview />
            </ProtectedRoute>
          }
        />
      </Routes>

      {user && <BottomNav variant={variants.nav} />}
    </div>
  );
}

export default function App() {
  return (
    <DesignVariantProvider>
      <AppContent />
    </DesignVariantProvider>
  );
}

// Placeholder for tabs we haven't built yet
function _PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background text-text-primary p-4 pb-24">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-text-secondary mt-2">This screen will be built in a future phase.</p>
    </div>
  );
}
void _PlaceholderScreen;

// Banner design preview - shows all 4 designs for all 4 tabs
function BannerDesignPreview() {
  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 overflow-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Banner Design Options</h1>
        <p className="text-sm text-text-secondary mt-1">Compare all 4 designs across all tabs</p>
      </div>

      {/* All tabs side by side for each design */}
      {[1, 2, 3, 4].map((design) => (
        <div key={design} className="border-b border-border">
          <div className="px-4 py-3 bg-surface sticky top-0 z-10">
            <span className="text-sm font-bold text-accent">
              Design {design}:{' '}
              {design === 1 && 'Icon Box Style'}
              {design === 2 && 'Gradient Banner'}
              {design === 3 && 'Card with Glow'}
              {design === 4 && 'Minimal Accent Line'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            {(['health', 'journal', 'care', 'learn'] as const).map((tab) => (
              <div key={tab} className="bg-background">
                <div className="px-2 py-1 bg-surface/50">
                  <span className="text-xs text-text-muted uppercase">{tab}</span>
                </div>
                <TabBannerPreviewSingle tab={tab} design={design as 1 | 2 | 3 | 4} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Single banner preview component
function TabBannerPreviewSingle({ tab, design }: { tab: 'health' | 'journal' | 'care' | 'learn'; design: 1 | 2 | 3 | 4 }) {
  return <TabBanner tab={tab} design={design} />;
}
