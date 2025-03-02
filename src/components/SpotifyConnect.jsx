import { FaSpotify } from 'react-icons/fa';
import { useSpotify } from '../contexts/SpotifyContext';

export default function SpotifyConnect() {
  const { connectSpotify, disconnectSpotify, isConnected } = useSpotify();

  return (
    <>
      {isConnected ? (
        <button
          onClick={disconnectSpotify}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          <FaSpotify size={20} />
          Spotify Bağlantısını Kaldır
        </button>
      ) : (
        <button
          onClick={connectSpotify}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          <FaSpotify size={20} />
          Spotify'ı Bağla
        </button>
      )}
    </>
  );
} 