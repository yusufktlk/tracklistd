import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export function useAlbumStatus(albumId, albumInfo) {
  const cleanAlbumId = albumId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const queryClient = useQueryClient();

  const { data: status = { isFavorite: false, isListened: false }, isLoading } = useQuery({
    queryKey: ['albumStatus', cleanAlbumId, auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return { isFavorite: false, isListened: false };

      const listenedRef = doc(db, 'listened', `${auth.currentUser.uid}-${cleanAlbumId}`);
      const listenedDoc = await getDoc(listenedRef);

      const [favSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'favorites'),
          where('albumId', '==', cleanAlbumId),
          where('userId', '==', auth.currentUser.uid)
        ))
      ]);

      return {
        isFavorite: !favSnapshot.empty,
        isListened: listenedDoc.exists(),
        favoriteId: favSnapshot.docs[0]?.id,
        source: listenedDoc.exists() ? listenedDoc.data().source : null
      };
    },
    enabled: !!auth.currentUser && !!cleanAlbumId
  });

  const toggleFavorite = useCallback(async () => {
    if (!auth.currentUser || !albumInfo) return;

    try {
      if (status.isFavorite) {
        await deleteDoc(doc(db, 'favorites', status.favoriteId));
      } else {
        const albumData = {
          albumId: cleanAlbumId,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          albumData: {
            name: albumInfo.name,
            artist: albumInfo.artist,
            image: albumInfo.image?.[3]['#text'] || albumInfo.image?.[0]['#text']
          }
        };
        
        await addDoc(collection(db, 'favorites'), albumData);
      }
      
      queryClient.invalidateQueries(['albumStatus', cleanAlbumId]);
      queryClient.invalidateQueries(['favorites', auth.currentUser.uid]);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [cleanAlbumId, albumInfo, status.isFavorite, status.favoriteId, queryClient]);

  const checkListened = async () => {
    if (!auth.currentUser) return false;
    
    const listenedRef = doc(db, 'listened', `${auth.currentUser.uid}-${cleanAlbumId}`);
    const docSnap = await getDoc(listenedRef);
    
    return docSnap.exists() && (
      docSnap.data().source === 'manual' || 
      docSnap.data().source === 'spotify'
    );
  };

  const toggleListened = async () => {
    if (!auth.currentUser) {
      toast.error('Önce giriş yapmalısınız');
      return;
    }

    const listenedRef = doc(db, 'listened', `${auth.currentUser.uid}-${cleanAlbumId}`);

    try {
      if (status.isListened) {
        await deleteDoc(listenedRef);
        toast.success('Dinlenenlerden kaldırıldı');
      } else {
        const docSnap = await getDoc(listenedRef);
        if (docSnap.exists()) {
          toast.error('Bu albüm zaten dinlenenlerde mevcut');
          return;
        }

        await setDoc(listenedRef, {
          userId: auth.currentUser.uid,
          albumId: cleanAlbumId,
          albumData: {
            name: albumInfo?.name,
            artist: albumInfo?.artist,
            image: albumInfo?.image?.[3]['#text']
          },
          source: 'manual',
          createdAt: serverTimestamp()
        });
        toast.success('Dinlenenlere eklendi');
      }

      queryClient.invalidateQueries(['listened']);
      queryClient.invalidateQueries(['albumStatus', cleanAlbumId]);
    } catch (error) {
      console.error('Error toggling listened:', error);
      toast.error('Bir hata oluştu');
    }
  };

  return {
    isFavorite: status.isFavorite,
    isListened: status.isListened,
    toggleFavorite,
    toggleListened,
    isLoading
  };
} 