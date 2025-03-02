import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useParams } from 'react-router-dom';
import { FaHeart, FaHeadphones, FaEdit, FaUser, FaSpotify, FaMusic, FaSync, FaExclamationTriangle, FaUnlink } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import Loading from '../components/Loading';
import { useSpotify } from '../contexts/SpotifyContext';
import SpotifyConnect from '../components/SpotifyConnect';
import { spotifyApi } from '../services/spotify';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EditFavoriteAlbumsModal from '../components/EditFavoriteAlbumsModal';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser, deleteAccount } = useAuth();
  const { isConnected, connectSpotify, spotifyToken, syncSpotifyData, disconnectSpotify } = useSpotify();
  const isOwnProfile = !userId || userId === currentUser?.uid;
  const [userProfile, setUserProfile] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) return;

      const userDoc = await getDoc(doc(db, 'users', targetUserId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }

    fetchUserProfile();
  }, [userId, currentUser]);

  const [activeTab, setActiveTab] = useState('favorites');

  const tabs = [
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: <FaHeart className="text-lg" />,
      activeColor: 'bg-pink-600'
    },
    {
      id: 'listened',
      label: 'Dinlenenler',
      icon: <FaHeadphones className="text-lg" />,
      activeColor: 'bg-purple-600'
    }
  ];

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', userId || currentUser?.uid],
    queryFn: async () => {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) return [];
      
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return data;
    },
    enabled: !!(userId || currentUser?.uid)
  });

  const { data: listened = [], isLoading: listenedLoading } = useQuery({
    queryKey: ['listened', userId || currentUser?.uid],
    queryFn: async () => {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) {
        return [];
      }
      
      try {
        const q = query(
          collection(db, 'listened'),
          where('userId', '==', targetUserId),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return { id: doc.id, ...docData };
        });

        return data;
      } catch (error) {
        console.error('Error fetching listened:', error);
        return [];
      }
    },
    enabled: !!(userId || currentUser?.uid)
  });

  const isLoading = favoritesLoading || listenedLoading;

  const { data: spotifyProfile } = useQuery({
    queryKey: ['spotify-profile', userId || currentUser?.uid],
    queryFn: async () => {
      const userDoc = await getDoc(doc(db, 'users', userId || currentUser.uid));
      const userData = userDoc.data();
      if (!userData?.spotifyData?.token) return null;
      
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${userData.spotifyData.token.access_token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch Spotify profile');
        const spotifyUser = await response.json();

        const tracksResponse = await fetch('https://api.spotify.com/v1/me/tracks?limit=1', {
          headers: {
            'Authorization': `Bearer ${userData.spotifyData.token.access_token}`
          }
        });
        const tracksData = await tracksResponse.json();

        // Takip edilen sanatçılar
        const followingResponse = await fetch('https://api.spotify.com/v1/me/following?type=artist&limit=1', {
          headers: {
            'Authorization': `Bearer ${userData.spotifyData.token.access_token}`
          }
        });
        const followingData = await followingResponse.json();

        const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=1', {
          headers: {
            'Authorization': `Bearer ${userData.spotifyData.token.access_token}`
          }
        });
        const playlistsData = await playlistsResponse.json();

        return {
          id: spotifyUser.id,
          display_name: spotifyUser.display_name,
          email: spotifyUser.email,
          images: spotifyUser.images,
          followers: spotifyUser.followers,
          product: spotifyUser.product,
          savedTracks: tracksData.total,
          playlists: playlistsData.total,
          following: followingData.artists.total
        };
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
        return null;
      }
    },
    enabled: !!(userId || currentUser?.uid)
  });

  const { data: spotifyAlbums } = useQuery({
    queryKey: ['spotify-albums', spotifyToken?.access_token],
    queryFn: () => spotifyApi.getSavedAlbums(spotifyToken.access_token),
    enabled: !!spotifyToken?.access_token
  });

  const { data: recentlyPlayed } = useQuery({
    queryKey: ['spotify-recent', spotifyToken?.access_token],
    queryFn: () => spotifyApi.getRecentlyPlayed(spotifyToken.access_token),
    enabled: !!spotifyToken?.access_token
  });

  const { data: topArtists } = useQuery({
    queryKey: ['spotify-top-artists', spotifyToken?.access_token],
    queryFn: () => spotifyApi.getTopArtists(spotifyToken.access_token),
    enabled: !!spotifyToken?.access_token
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncSpotifyData();
      toast.success('Veriler başarıyla güncellendi');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Güncelleme sırasında bir hata oluştu');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteConfirm = async (password) => {
    await deleteAccount(password);
    setIsDeleteModalOpen(false);
  };

  const handleDisconnectSpotify = async () => {
    try {
      await disconnectSpotify();
      setIsDisconnectModalOpen(false);
    } catch (error) {
      console.error('Spotify bağlantısı kesilirken hata:', error);
    }
  };

  if (isLoading) {
    return <Loading size="large" />;
  }

  const activeData = activeTab === 'favorites' ? favorites : listened;

  const renderSpotifyStats = () => {
    if (!isConnected) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaSpotify className="text-green-500" size={24} />
            <h2 className="text-xl font-semibold">Spotify İstatistikleri</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDisconnectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaUnlink />
              Bağlantıyı Kes
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyAlbums?.total || 0}
            </div>
            <div className="text-sm text-gray-400">Kayıtlı Albüm</div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyProfile?.playlists || 0}
            </div>
            <div className="text-sm text-gray-400">Çalma Listesi</div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyProfile?.following || 0}
            </div>
            <div className="text-sm text-gray-400">Takip Edilen</div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyProfile?.followers?.total || 0}
            </div>
            <div className="text-sm text-gray-400">Takipçi</div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyProfile?.savedTracks || 0}
            </div>
            <div className="text-sm text-gray-400">Beğenilen Şarkı</div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {spotifyProfile?.product === 'premium' ? 'Premium' : 'Free'}
            </div>
            <div className="text-sm text-gray-400">Üyelik Tipi</div>
          </div>
        </div>

        {recentlyPlayed?.items?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Son Dinlenenler</h3>
            <div className="space-y-2">
              {recentlyPlayed.items.slice(0, 5).map((item) => (
                <div key={item.played_at} className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg">
                  <img
                    src={item.track.album.images[2]?.url}
                    alt={item.track.album.name}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <div className="font-medium">{item.track.name}</div>
                    <div className="text-sm text-gray-400">{item.track.artists[0].name}</div>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {new Date(item.played_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topArtists?.items?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">En Çok Dinlenen Sanatçılar</h3>
            <div className="flex flex-wrap gap-3">
              {topArtists.items.slice(0, 6).map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${encodeURIComponent(artist.name)}`}
                  className="bg-gray-700/30 px-3 py-2 rounded-full hover:bg-gray-600/50 transition-colors flex items-center gap-2"
                >
                  {artist.images?.[2]?.url && (
                    <img
                      src={artist.images[2].url}
                      alt={artist.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  {artist.name}
                  <span className="text-xs text-gray-400">
                    {artist.genres?.[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        {isOwnProfile ? 'Profilim' : 'Kullanıcı Profili'}
      </h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <Avatar
              src={userProfile?.avatar}
              alt={userProfile?.nickname}
              size="large"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.nickname || 'İsimsiz Kullanıcı'}
              </h1>
              <p className="text-gray-400 mt-2">
                {userProfile?.bio || (isOwnProfile ? 'Henüz bir biyografi eklemediniz' : 'Kullanıcı henüz biyografi eklememiş')}
              </p>
              {isOwnProfile && (
                <div className="mt-4">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <FaSpotify size={20} />
                      <span>Spotify Bağlı</span>
                      {spotifyProfile && (
                        <span className="text-gray-400 text-sm">
                          ({spotifyProfile.display_name})
                        </span>
                      )}
                    </div>
                  ) : (
                    <SpotifyConnect onConnect={connectSpotify} />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaEdit className="mr-2" />
              Profili Düzenle
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Favori Albümler</h2>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditingFavorites(true)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Düzenle
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userProfile?.favoriteAlbums?.map((album, index) => (
            <Link
              key={album.id}
              to={`/album/${album.artist}/${album.name}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={album.image}
                alt={album.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div>
                  <div className="font-medium text-white">{album.name}</div>
                  <div className="text-sm text-gray-300">{album.artist}</div>
                </div>
              </div>
            </Link>
          ))}
          
          {isOwnProfile && (!userProfile?.favoriteAlbums || userProfile.favoriteAlbums.length < 4) && (
            <button
              onClick={() => setIsEditingFavorites(true)}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 transition-colors flex items-center justify-center"
            >
              <span className="text-gray-500">Albüm Ekle</span>
            </button>
          )}
        </div>
      </div>

      {isConnected && renderSpotifyStats()}

      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-8 max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md
              transition-all duration-200 ease-in-out
              ${activeTab === tab.id 
                ? `${tab.activeColor} text-white` 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            {tab.icon}
            <span className="font-medium">
              {tab.label} ({tab.id === 'favorites' ? favorites.length : listened.length})
            </span>
          </button>
        ))}
      </div>

      {activeData.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          {activeData.map((item) => (
            <Link
              key={item.id}
              to={`/album/${item.albumData.artist}/${item.albumData.name}`}
              className="group"
            >
              <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <img
                  src={item.albumData.image || '/album-placeholder.jpg'}
                  alt={item.albumData.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate group-hover:text-purple-400">
                    {item.albumData.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {item.albumData.artist}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-lg mb-4">
            {activeTab === 'favorites' 
              ? 'Henüz favori albümünüz yok' 
              : 'Henüz dinlediğiniz albüm yok'}
          </p>
          <Link
            to="/discover"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Albümleri Keşfet
          </Link>
        </div>
      )}

      {isOwnProfile && (
        <div className="mt-12 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Tehlikeli Bölge</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Hesabı Sil</h3>
            <p className="text-gray-400 mb-4">
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Hesabı Sil
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        title={
          <div className="flex items-center gap-3 text-red-500">
            <FaUnlink size={24} />
            <span>Spotify Bağlantısını Kes</span>
          </div>
        }
      >
        <div className="text-gray-300 space-y-4">
          <p>
            Spotify bağlantınızı kesmek üzeresiniz. Bu işlem sonucunda:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Spotify üzerinden senkronize edilen veriler silinecek</li>
            <li>Otomatik müzik senkronizasyonu duracak</li>
            <li>Spotify istatistikleriniz kaldırılacak</li>
          </ul>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDisconnectModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleDisconnectSpotify}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Bağlantıyı Kes
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      >
        <div className="text-gray-300 space-y-4">
          <p>
            Hesabınızı silmek üzeresiniz. Bu işlem geri alınamaz ve aşağıdaki verileriniz kalıcı olarak silinecektir:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Profil bilgileriniz</li>
            <li>Favori albümleriniz</li>
            <li>Dinlediğiniz albümler</li>
            <li>Yorumlarınız</li>
            <li>Spotify bağlantınız</li>
          </ul>
        </div>
      </DeleteConfirmModal>

      <EditFavoriteAlbumsModal
        isOpen={isEditingFavorites}
        onClose={() => setIsEditingFavorites(false)}
        currentFavorites={userProfile?.favoriteAlbums || []}
      />
    </div>
  );
} 