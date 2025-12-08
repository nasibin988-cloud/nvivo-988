import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DesignVariantProvider, useDesignVariants } from './contexts/DesignVariantContext';
import LoginScreen from './screens/Login/LoginScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import { BottomNav } from './components/layout/BottomNav';

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
              <PlaceholderScreen title="Health" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <PlaceholderScreen title="Journal" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/care"
          element={
            <ProtectedRoute>
              <PlaceholderScreen title="Care" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <PlaceholderScreen title="Learn" />
            </ProtectedRoute>
          }
        />
        {/* Legacy more route redirects to learn */}
        <Route path="/more" element={<Navigate to="/learn" replace />} />
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
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background text-text-primary p-4 pb-24">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-text-secondary mt-2">This screen will be built in a future phase.</p>
    </div>
  );
}
