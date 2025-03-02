import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db
} from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
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

  const deleteAccount = async (password) => {
    if (!currentUser) return;

    try {
      await signInWithEmailAndPassword(auth, currentUser.email, password);

      const batch = writeBatch(db);

      const collections = ['favorites', 'listened', 'comments'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      batch.delete(doc(db, 'users', currentUser.uid));

      await batch.commit();

      await deleteUser(currentUser);

      toast.success('Hesabınız başarıyla silindi');
      navigate('/login');
    } catch (error) {
      console.error('Hesap silme hatası:', error.code, error.message);
      toast.error('Hesap silinirken bir hata oluştu');
    }
  };

  const updateProfile = async (data) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
      throw error;
    }
  };

  const value = {
    currentUser,
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    login,
    loginWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    logout: () => signOut(auth),
    deleteAccount,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
} 