import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useParams } from 'react-router-dom';
import { FaHeart, FaHeadphones, FaEdit, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const isOwnProfile = !userId || userId === currentUser?.uid;
  const [userProfile, setUserProfile] = useState(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  const activeData = activeTab === 'favorites' ? favorites : listened;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        {isOwnProfile ? 'Profilim' : 'Kullanıcı Profili'}
      </h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaUser size={40} />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.nickname || 'İsimsiz Kullanıcı'}
              </h1>
              <p className="text-gray-400 mt-2">
                {userProfile?.bio || (isOwnProfile ? 'Henüz bir biyografi eklemediniz' : 'Kullanıcı henüz biyografi eklememiş')}
              </p>
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
    </div>
  );
} 