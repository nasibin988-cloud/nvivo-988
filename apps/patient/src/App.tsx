import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/Login/LoginScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import TabBar from './components/layout/TabBar';

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

export default function App() {
  const { user, loading } = useAuth();

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
          path="/more"
          element={
            <ProtectedRoute>
              <PlaceholderScreen title="More" />
            </ProtectedRoute>
          }
        />
      </Routes>

      {user && <TabBar />}
    </div>
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
