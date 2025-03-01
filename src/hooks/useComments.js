import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';

export function useComments(albumId) {
  return useQuery({
    queryKey: ['comments', albumId],
    queryFn: async () => {
      if (!albumId) return [];

      try {
        const commentsRef = collection(db, 'comments');
        const q = query(
          commentsRef,
          where('albumId', '==', albumId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });

        return comments;
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    },
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false
  });
}

export async function addComment(albumId, commentData) {
  if (!auth.currentUser) {
    console.error('No authenticated user found');
    throw new Error('Yorum eklemek için giriş yapmalısınız');
  }

  try {
    const token = await auth.currentUser.getIdToken(true);
    console.log('Token refreshed:', !!token);

    const comment = {
      albumId: albumId,
      text: commentData.text.trim(),
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || 'Anonim',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'comments'), comment);

    return {
      id: docRef.id,
      ...comment,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Detailed error:', {
      errorCode: error.code,
      errorMessage: error.message,
      authState: {
        isAuthenticated: !!auth.currentUser,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email
      }
    });

    throw new Error(`Yorum eklenirken bir hata oluştu: ${error.message}`);
  }
}

export async function deleteComment(commentId) {
  if (!auth.currentUser) {
    throw new Error('Yorum silmek için giriş yapmalısınız');
  }

  try {
    await deleteDoc(doc(db, 'comments', commentId));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Yorum silinirken bir hata oluştu');
  }
} 