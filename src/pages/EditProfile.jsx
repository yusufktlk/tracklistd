import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';

export default function EditProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    avatar: '',
    bio: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    }
    
    fetchProfile();
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const url = e.target.value;
    if (url && !url.match(/^https?:\/\/.+\/.+$/)) {
      alert('Lütfen geçerli bir resim URL\'i girin');
      return;
    }
    setProfile(prev => ({ ...prev, avatar: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile.avatar) {
        const img = new Image();
        img.src = profile.avatar;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Geçersiz resim URL\'i'));
        });
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message === 'Geçersiz resim URL\'i') {
        alert('Lütfen geçerli bir resim URL\'i girin');
        return;
      }
      alert('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Profili Düzenle</h1>

      <div className="mb-8 flex justify-center">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                setProfile(prev => ({ ...prev, avatar: '' }));
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaUser size={48} />
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Kullanıcı Adı</label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            placeholder="Kullanıcı adınız"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Avatar URL</label>
          <input
            type="url"
            value={profile.avatar}
            onChange={handleAvatarChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            placeholder="Avatar resmi URL'i"
          />
          <p className="text-gray-400 text-sm mt-1">
            Profil resminiz için bir resim URL'i girin (örn: https://example.com/image.jpg)
          </p>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Biyografi</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white h-32"
            placeholder="Kendinizden bahsedin..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 