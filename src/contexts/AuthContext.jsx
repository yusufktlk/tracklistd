import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
} from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        console.log('Token refreshed:', !!token);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    login,
    loginWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    logout: () => signOut(auth)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 