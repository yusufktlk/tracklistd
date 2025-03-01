import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAlbumInfo } from '../services/lastfm';
import CommentSection from '../components/CommentSection';
import { FaHeart, FaRegHeart, FaHeadphones, FaMusic } from 'react-icons/fa';
import { useAlbumStatus } from '../hooks/useAlbumActions';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AlbumDetail() {
  const { artist, album } = useParams();
  const { currentUser } = useAuth();

  const albumId = `${artist}-${album}`.toLowerCase().replace(/\s+/g, '-');

  const { data: albumInfo, isLoading: albumLoading, error: albumError } = useQuery({
    queryKey: ['album', artist, album],
    queryFn: () => getAlbumInfo(artist, album)
  });

  const { 
    isFavorite, 
    isListened, 
    toggleFavorite, 
    toggleListened, 
    isLoading: isStatusLoading 
  } = useAlbumStatus(albumId, albumInfo);

  const tracks = albumInfo?.tracks?.track 
    ? (Array.isArray(albumInfo.tracks.track) 
      ? albumInfo.tracks.track 
      : [albumInfo.tracks.track])
    : [];

  if (albumLoading) return <div className="text-gray-400">Yükleniyor...</div>;
  if (albumError) return <div className="text-red-500">Bir hata oluştu</div>;

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            src={albumInfo.image[4]['#text'] || '/album-placeholder.jpg'}
            alt={albumInfo.name}
            className="w-full rounded-lg shadow-lg"
          />
          
          {currentUser && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                  isFavorite ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'
                } hover:bg-pink-700`}
                title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                disabled={isStatusLoading}
              >
                {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
              </button>
              
              <button
                onClick={toggleListened}
                className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                  isListened ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                } hover:bg-purple-700`}
                title={isListened ? 'Dinlenenlerden Çıkar' : 'Dinlenenlere Ekle'}
                disabled={isStatusLoading}
              >
                {isListened ? <FaHeadphones size={24} /> : <FaMusic size={24} />}
              </button>
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{albumInfo.name}</h1>
              <Link 
                to={`/artist/${encodeURIComponent(albumInfo.artist)}`}
                className="text-xl text-gray-400 hover:text-purple-400 transition-colors"
              >
                {albumInfo.artist}
              </Link>
            </div>
          </div>

          {albumInfo.wiki && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Hakkında</h2>
              <p className="text-gray-400">{albumInfo.wiki.summary}</p>
            </div>
          )}

          {tracks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Şarkı Listesi</h2>
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div
                    key={track.name}
                    className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-8">{index + 1}</span>
                    <span>{track.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentSection albumId={albumId} />
    </div>
  );
} 