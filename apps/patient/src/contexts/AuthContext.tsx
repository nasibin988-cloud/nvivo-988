import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getAuthInstance } from '@nvivo/shared';

// Test user email and patientId for development
const TEST_EMAIL = 'sarah.mitchell@test.nvivo.health';
const TEST_PATIENT_ID = 'sarah-mitchell-test';

interface AuthContextType {
  user: User | null;
  patientId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  };

  // patientId: use TEST_PATIENT_ID for test user, otherwise user.uid
  const patientId = user
    ? (user.email === TEST_EMAIL ? TEST_PATIENT_ID : user.uid)
    : null;

  return (
    <AuthContext.Provider value={{ user, patientId, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
