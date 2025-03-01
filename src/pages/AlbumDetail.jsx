import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAlbumInfo } from '../services/lastfm';
import CommentSection from '../components/CommentSection';
import { FaHeart, FaRegHeart, FaHeadphones, FaMusic, FaPlay, FaUser, FaTag, FaCalendar, FaClock, FaLink } from 'react-icons/fa';
import { useAlbumStatus } from '../hooks/useAlbumActions';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

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

  if (albumLoading) return <Loading size="large" />;
  if (albumError) return <div className="text-red-500">Bir hata oluştu</div>;

  const totalDuration = albumInfo?.tracks?.track?.reduce((acc, track) => acc + (track.duration || 0), 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            src={albumInfo?.image?.[4]['#text'] || albumInfo?.image?.[3]['#text'] || '/album-placeholder.jpg'}
            alt={albumInfo?.name}
            className="w-full rounded-lg shadow-lg mb-6"
          />
          
          {currentUser && (
            <div className="flex justify-center gap-4 mt-4 mb-4">
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

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Number(albumInfo?.listeners).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Dinleyici</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Number(albumInfo?.playcount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Çalınma</div>
              </div>
            </div>
          </div>

          {albumInfo?.tags?.tag && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {albumInfo.tags.tag.map(tag => (
                  <a
                    key={tag.name}
                    href={tag.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    <FaTag size={12} />
                    {tag.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{albumInfo.name}</h1>
              <Link 
                to={`/artist/${encodeURIComponent(albumInfo.artist)}`}
                className="text-xl text-gray-400 hover:text-purple-400 transition-colors"
              >
                {albumInfo.artist}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-8">
            {albumInfo?.tracks?.track && (
              <div className="flex items-center gap-2">
                <FaPlay />
                <span>{albumInfo.tracks.track.length} Şarkı</span>
              </div>
            )}
            {totalDuration > 0 && (
              <div className="flex items-center gap-2">
                <FaClock />
                <span>
                  {hours > 0 ? `${hours} saat ` : ''}
                  {minutes} dakika
                </span>
              </div>
            )}
          </div>

          {albumInfo?.tracks?.track && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Şarkı Listesi</h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {albumInfo.tracks.track.map((track, index) => (
                  <div
                    key={track.name}
                    className="flex items-center px-4 py-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="w-8 text-gray-500">{index + 1}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{track.name}</div>
                      {track.artist?.name && track.artist.name !== albumInfo.artist && (
                        <div className="text-sm text-gray-400">feat. {track.artist.name}</div>
                      )}
                    </div>
                    <div className="text-gray-400">
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {albumInfo?.wiki && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <FaCalendar size={14} />
                <span>Yayınlanma: {new Date(albumInfo.wiki.published).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {albumInfo.wiki.content.split('<a')[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentSection albumId={albumId} />
    </div>
  );
} 