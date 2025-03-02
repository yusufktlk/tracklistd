import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '../contexts/SpotifyContext';
import Loading from '../components/Loading';
import { toast } from 'react-hot-toast';

export default function SpotifyCallback() {
  const [status, setStatus] = useState('connecting');
  const navigate = useNavigate();
  const { handleSpotifyCallback } = useSpotify();

  useEffect(() => {
    const connectSpotify = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        console.log('Callback params:', { code, error });

        if (error) {
          console.error('Spotify error:', error);
          toast.error('Spotify bağlantısı iptal edildi');
          setStatus('error');
          return;
        }

        if (!code) {
          console.error('No code received');
          toast.error('Spotify kodu alınamadı');
          setStatus('error');
          return;
        }

        const success = await handleSpotifyCallback(code);
        console.log('Callback result:', success);
        
        if (success) {
          setStatus('success');
          toast.success('Spotify başarıyla bağlandı!');
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          setStatus('error');
          toast.error('Spotify bağlantısı başarısız oldu');
        }
      } catch (error) {
        console.error('Spotify callback error:', error);
        setStatus('error');
        toast.error(error.message || 'Bir hata oluştu');
      }
    };

    connectSpotify();
  }, []);

  if (status === 'connecting') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loading size="large" />
        <p className="mt-4 text-gray-400">Spotify bağlanıyor...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Spotify bağlantısı başarısız oldu
        </h2>
        <button
          onClick={() => navigate('/profile')}
          className="text-purple-400 hover:text-purple-300"
        >
          Profile Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-green-500 mb-4">
        Spotify başarıyla bağlandı!
      </h2>
      <p className="text-gray-400">Yönlendiriliyorsunuz...</p>
    </div>
  );
} 