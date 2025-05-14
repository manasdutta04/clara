import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface User {
  id: string;
  name: string;
  email: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // User is signed in
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to login');
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log("Auth context: attempting Google sign-in");
      
      if (!googleProvider) {
        console.error("Google provider is not initialized");
        setError("Google authentication is not available");
        setLoading(false);
        return false;
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful:", result.user.email);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Google sign-in error in auth context:", err);
      setLoading(false);
      setError(err?.message || 'Failed to login with Google');
      return false;
    }
  };

  // Signup with email and password
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name (would typically be done with updateProfile)
      // For simplicity, we're just using the name in our context state
      const userData: User = {
        id: userCredential.user.uid,
        name: name,
        email: userCredential.user.email
      };
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create account');
      return false;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut(auth);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to logout');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login, 
        loginWithGoogle,
        signup, 
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 