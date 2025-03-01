import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export function useAlbumStatus(albumId, albumInfo) {
  const queryClient = useQueryClient();

  const { data: status = { isFavorite: false, isListened: false }, isLoading } = useQuery({
    queryKey: ['albumStatus', albumId, auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return { isFavorite: false, isListened: false };

      const [favSnapshot, listenedSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'favorites'),
          where('albumId', '==', albumId),
          where('userId', '==', auth.currentUser.uid)
        )),
        getDocs(query(
          collection(db, 'listened'),
          where('albumId', '==', albumId),
          where('userId', '==', auth.currentUser.uid)
        ))
      ]);

      return {
        isFavorite: !favSnapshot.empty,
        isListened: !listenedSnapshot.empty,
        favoriteId: favSnapshot.docs[0]?.id,
        listenedId: listenedSnapshot.docs[0]?.id
      };
    },
    enabled: !!auth.currentUser && !!albumId
  });

  const toggleFavorite = useCallback(async () => {
    if (!auth.currentUser || !albumInfo) return;

    try {
      if (status.isFavorite) {
        await deleteDoc(doc(db, 'favorites', status.favoriteId));
      } else {
        const albumData = {
          albumId,
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
      
      queryClient.invalidateQueries(['albumStatus', albumId]);
      queryClient.invalidateQueries(['favorites', auth.currentUser.uid]);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [albumId, albumInfo, status.isFavorite, status.favoriteId, queryClient]);

  const toggleListened = useCallback(async () => {
    console.log('Toggle listened called:', {
      currentUser: auth.currentUser,
      albumInfo,
      albumId
    });

    if (!auth.currentUser || !albumInfo) {
      console.log('Toggle listened failed:', { 
        hasUser: !!auth.currentUser, 
        hasAlbumInfo: !!albumInfo,
        albumInfo 
      });
      return;
    }

    try {
      if (status.isListened) {
        console.log('Removing from listened:', {
          listenedId: status.listenedId,
          userId: auth.currentUser.uid
        });
        await deleteDoc(doc(db, 'listened', status.listenedId));
      } else {
        const albumData = {
          albumId,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          albumData: {
            name: albumInfo.name,
            artist: albumInfo.artist,
            image: albumInfo.image?.[3]['#text'] || albumInfo.image?.[0]['#text']
          }
        };

        console.log('Adding to listened:', albumData);
        const docRef = await addDoc(collection(db, 'listened'), albumData);
        console.log('Added to listened with ID:', docRef.id);
      }
      
      console.log('Invalidating queries for:', {
        albumId,
        userId: auth.currentUser.uid,
        queries: [
          ['albumStatus', albumId],
          ['listened', auth.currentUser.uid]
        ]
      });

      queryClient.invalidateQueries(['albumStatus', albumId]);
      queryClient.invalidateQueries(['listened', auth.currentUser.uid]);
      
      setTimeout(() => {
        const cache = queryClient.getQueryData(['listened', auth.currentUser.uid]);
        console.log('Cache after invalidation:', cache);
      }, 100);

    } catch (error) {
      console.error('Error toggling listened:', error);
    }
  }, [albumId, albumInfo, status.isListened, status.listenedId, queryClient]);

  return {
    isFavorite: status.isFavorite,
    isListened: status.isListened,
    toggleFavorite,
    toggleListened,
    isLoading
  };
} 