import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArtistInfo, getArtistAlbums } from '../services/lastfm';
import AlbumCard from '../components/AlbumCard';
import { FaTag, FaLink, FaCalendar } from 'react-icons/fa';
import Loading from '../components/Loading';

export default function ArtistDetail() {
  const { artist } = useParams();

  const { data: artistInfo, isLoading: artistLoading, error: artistError } = useQuery({
    queryKey: ['artist', artist],
    queryFn: () => getArtistInfo(artist)
  });

  const { data: artistAlbums, isLoading: albumsLoading } = useQuery({
    queryKey: ['artist-albums', artist],
    queryFn: () => getArtistAlbums(artist)
  });

  if (artistLoading || albumsLoading) return <Loading size="large" />;
  if (artistError) return <div className="text-red-500">Bir hata oluştu</div>;

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            src={artistInfo?.image?.[4]['#text'] || artistInfo?.image?.[3]['#text'] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxRjI5MzciLz48cGF0aCBkPSJNMTUwIDEyNUMxNjcuMzIgMTI1IDE4MS4yNSAxMTEuMDcgMTgxLjI1IDkzLjc1QzE4MS4yNSA3Ni40MyAxNjcuMzIgNjIuNSAxNTAgNjIuNUMxMzIuNjggNjIuNSAxMTguNzUgNzYuNDMgMTE4Ljc1IDkzLjc1QzExOC43NSAxMTEuMDcgMTMyLjY4IDEyNSAxNTAgMTI1WiIgZmlsbD0iIzRCNTU2MyIvPjxwYXRoIGQ9Ik0yMTIuNSAyMTguNzVDMjEyLjUgMTg0LjUgMTg0LjI1IDE1Ni4yNSAxNTAgMTU2LjI1QzExNS43NSAxNTYuMjUgODcuNSAxODQuNSA4Ny41IDIxOC43NVYyMzcuNUgyMTIuNVYyMTguNzVaIiBmaWxsPSIjNEI1NTYzIi8+PC9zdmc+'}
            alt={artistInfo?.name}
            className="w-full rounded-lg shadow-lg mb-6"
          />

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">İstatistikler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <span className="block text-2xl font-bold text-purple-400">
                  {Number(artistInfo?.stats?.listeners).toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">Dinleyici</span>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <span className="block text-2xl font-bold text-purple-400">
                  {Number(artistInfo?.stats?.playcount).toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">Çalınma</span>
              </div>
            </div>
          </div>

          {artistInfo?.tags?.tag && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {artistInfo.tags.tag.map((tag) => (
                  <a
                    key={tag.name}
                    href={tag.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-600 transition-colors"
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
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">{artistInfo?.name}</h1>
            {artistInfo?.ontour === "1" && (
              <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                Turne Devam Ediyor
              </span>
            )}
          </div>

          {artistInfo?.bio && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <FaCalendar size={14} />
                <span>Yayınlanma: {new Date(artistInfo.bio.published).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {artistInfo.bio.content.split('<a')[0]}
                </p>
              </div>
            </div>
          )}

          {artistInfo?.similar?.artist && artistInfo.similar.artist.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Benzer Sanatçılar</h2>
              <div className="flex flex-wrap gap-3">
                {artistInfo.similar.artist.map((similar) => (
                  <Link
                    key={similar.name}
                    to={`/artist/${encodeURIComponent(similar.name)}`}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {similar.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {artistAlbums?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Albümler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artistAlbums.map((album) => (
              <AlbumCard key={album.name} album={album} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href={artistInfo?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <FaLink size={14} />
          Last.fm'de Görüntüle
        </a>
      </div>
    </div>
  );
} 