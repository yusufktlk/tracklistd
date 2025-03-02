import { createContext, useContext, useState, useEffect } from 'react';
import { spotifyAuth, spotifyApi } from '../services/spotify';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, writeBatch, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      loadSpotifyToken();
    } else {
      setSpotifyToken(null);
      setIsConnected(false);
    }
  }, [currentUser?.uid]);

  const loadSpotifyToken = async () => {
    if (!currentUser) return;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();

    if (userData?.spotifyData?.token) {
      if (isTokenExpired(userData.spotifyData.token.expires_at)) {
        try {
          const newToken = await spotifyAuth.refreshToken(userData.spotifyData.token.refresh_token);
          await saveSpotifyToken(newToken);
          setSpotifyToken(newToken);
          setIsConnected(true);
        } catch (error) {
          console.error('Token yenileme hatası:', error);
          setIsConnected(false);
        }
      } else {
        setSpotifyToken(userData.spotifyData.token);
        setIsConnected(true);
      }
    } else {
      setSpotifyToken(null);
      setIsConnected(false);
    }
  };

  const saveSpotifyToken = async (token) => {
    if (!currentUser) return null;

    try {
      const tokenData = {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_in: token.expires_in,
        expires_at: Date.now() + (token.expires_in * 1000),
        token_type: token.token_type
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        spotifyData: {
          token: tokenData,
          userId: currentUser.uid,
          connectedAt: serverTimestamp()
        },
        lastSpotifySync: serverTimestamp()
      }, { merge: true });

      return tokenData;
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
      toast.error('Token kaydedilemedi');
      return null;
    }
  };

  const connectSpotify = () => {
    spotifyAuth.authorize();
  };

  const handleSpotifyCallback = async (code) => {
    try {
      console.log('Handling callback with code:', code);
      
      const tokenData = await spotifyAuth.getToken(code);
      console.log('Received token data:', tokenData);
      
      if (!tokenData.access_token) {
        const error = new Error(tokenData.error_description || 'Token alınamadı');
        console.error('Token error:', tokenData);
        toast.error(error.message);
        return false;
      }

      const savedToken = await saveSpotifyToken(tokenData);
      
      if (!savedToken) {
        toast.error('Token kaydedilemedi');
        return false;
      }

      setSpotifyToken(savedToken);
      setIsConnected(true);

      await syncSpotifyData();
      return true;
    } catch (error) {
      console.error('Spotify bağlantı hatası:', error);
      toast.error(error.message || 'Spotify bağlantısında bir hata oluştu');
      return false;
    }
  };

  const isTokenExpired = (expiresAt) => {
    return Date.now() > expiresAt;
  };

  const syncSpotifyData = async () => {
    if (!spotifyToken?.access_token || !currentUser) {
      toast.error('Spotify bağlantısı bulunamadı');
      return;
    }

    try {
      const [albumsData, topArtistsData] = await Promise.all([
        spotifyApi.getSavedAlbums(spotifyToken.access_token),
        spotifyApi.getTopArtists(spotifyToken.access_token)
      ]);

      const q = query(
        collection(db, 'listened'),
        where('userId', '==', currentUser.uid),
        where('source', '==', 'spotify')
      );
      const existingDocs = await getDocs(q);
      
      const batch = writeBatch(db);

      existingDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      if (albumsData?.items?.length > 0) {
        for (const item of albumsData.items) {
          const album = item.album;
          const artistName = typeof album.artists[0] === 'object' ? album.artists[0].name : album.artists[0];
          const albumId = `${artistName}-${album.name}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''); 
          
          const listenedRef = doc(db, 'listened', `${currentUser.uid}-${albumId}`);
          
          batch.set(listenedRef, {
            userId: currentUser.uid,
            albumId,
            albumData: {
              name: album.name,
              artist: artistName,
              image: album.images[0]?.url,
            },
            source: 'spotify',
            addedAt: new Date(item.added_at).getTime(),
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      }

      if (topArtistsData?.items?.length > 0) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          batch.update(userRef, {
            'spotifyData.profile': {
              topArtists: topArtistsData.items.map(artist => ({
                name: artist.name,
                image: artist.images[0]?.url,
                genres: artist.genres
              })),
              lastSync: serverTimestamp()
            }
          });
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      }

      await batch.commit();
      console.log('Spotify data sync completed');
      toast.success('Spotify verileri başarıyla senkronize edildi');
      
      queryClient.invalidateQueries(['listened', currentUser.uid]);
      
    } catch (error) {
      console.error('Spotify senkronizasyon hatası:', error);
      toast.error('Spotify verilerini senkronize ederken bir hata oluştu: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (spotifyToken?.access_token) {
      syncSpotifyData();
    }
  }, [spotifyToken]);

  const disconnectSpotify = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      await setDoc(userRef, {
        spotifyData: null,
        lastSpotifySync: null
      }, { merge: true });

      const q = query(
        collection(db, 'listened'),
        where('userId', '==', currentUser.uid),
        where('source', '==', 'spotify')
      );
      
      const batch = writeBatch(db);
      const docs = await getDocs(q);
      docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      setSpotifyToken(null);
      setIsConnected(false);
      
      queryClient.invalidateQueries(['listened', currentUser.uid]);
      
      toast.success('Spotify bağlantısı kaldırıldı');
    } catch (error) {
      console.error('Spotify bağlantısı kaldırılırken hata:', error);
      toast.error('Spotify bağlantısı kaldırılırken bir hata oluştu');
    }
  };

  return (
    <SpotifyContext.Provider value={{
      spotifyToken,
      isConnected,
      connectSpotify,
      handleSpotifyCallback,
      syncSpotifyData,
      disconnectSpotify,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export const useSpotify = () => useContext(SpotifyContext); 