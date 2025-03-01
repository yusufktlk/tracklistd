import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchArtists, getTopArtists } from '../services/lastfm';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import Loading from '../components/Loading';

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['artists', debouncedQuery, page],
    queryFn: () => debouncedQuery ? searchArtists(debouncedQuery, page) : getTopArtists(page),
    staleTime: 1000 * 60 * 5,
  });

  const artists = debouncedQuery ? data?.results?.artistmatches?.artist : data?.artists?.artist;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Sanatçılar</h1>
        <div className="max-w-xl">
          <input
            type="text"
            placeholder="Sanatçı ara..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="text-red-500">Bir hata oluştu: {error.message}</div>
      ) : artists?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <Link
                key={artist.name}
                to={`/artist/${encodeURIComponent(artist.name)}`}
                className="group bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-square">
                  <img
                    src={artist.image?.[2]['#text'] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxRjI5MzciLz48cGF0aCBkPSJNMTUwIDEyNUMxNjcuMzIgMTI1IDE4MS4yNSAxMTEuMDcgMTgxLjI1IDkzLjc1QzE4MS4yNSA3Ni40MyAxNjcuMzIgNjIuNSAxNTAgNjIuNUMxMzIuNjggNjIuNSAxMTguNzUgNzYuNDMgMTE4Ljc1IDkzLjc1QzExOC43NSAxMTEuMDcgMTMyLjY4IDEyNSAxNTAgMTI1WiIgZmlsbD0iIzRCNTU2MyIvPjxwYXRoIGQ9Ik0yMTIuNSAyMTguNzVDMjEyLjUgMTg0LjUgMTg0LjI1IDE1Ni4yNSAxNTAgMTU2LjI1QzExNS43NSAxNTYuMjUgODcuNSAxODQuNSA4Ny41IDIxOC43NVYyMzcuNUgyMTIuNVYyMTguNzVaIiBmaWxsPSIjNEI1NTYzIi8+PC9zdmc+'}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate group-hover:text-purple-400">
                    {artist.name}
                  </h3>
                  {artist.listeners && (
                    <p className="text-gray-400 text-sm">
                      {Number(artist.listeners).toLocaleString()} dinleyici
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </>
      ) : (
        <div className="text-gray-400">
          {debouncedQuery ? 'Sanatçı bulunamadı' : 'Popüler sanatçılar yüklenirken bir hata oluştu'}
        </div>
      )}
    </div>
  );
} 