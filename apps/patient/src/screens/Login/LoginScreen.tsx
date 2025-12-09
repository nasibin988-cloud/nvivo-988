import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthInstance } from '@nvivo/shared';
import { Heart } from 'lucide-react';

// Test user credentials for development (from seed.ts)
const TEST_EMAIL = 'sarah.mitchell@test.nvivo.health';
const TEST_PASSWORD = 'TestPatient2024!';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      // Navigation happens automatically via AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Try to sign in first
      await signIn(TEST_EMAIL, TEST_PASSWORD);
    } catch {
      // If sign-in fails, create the user first then sign in
      try {
        const auth = getAuthInstance();
        await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        // User is automatically signed in after creation
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'Failed to create dev user');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-purple-light flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">NVIVO</h1>
        <p className="text-text-secondary text-sm mt-1">Patient Portal</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple"
            placeholder="your@email.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-purple-light text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Dev Login - Only shown in development */}
      {isLocalhost && (
        <div className="mt-8 text-center">
          <p className="text-text-muted text-xs mb-3">Development Mode</p>
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={loading}
            className="px-4 py-2 bg-surface border border-accent-purple/50 text-accent-purple text-sm rounded-lg hover:bg-accent-purple/10 disabled:opacity-50"
          >
            Dev Login (Test User)
          </button>
          <p className="text-text-muted text-xs mt-2">
            {TEST_EMAIL} / {TEST_PASSWORD}
          </p>
        </div>
      )}
    </div>
  );
}
