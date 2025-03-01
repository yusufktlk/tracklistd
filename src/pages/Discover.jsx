import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopAlbums, searchAlbums } from '../services/lastfm';
import AlbumCard from '../components/AlbumCard';

export default function Discover() {
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
    queryKey: ['albums', debouncedQuery, page],
    queryFn: () => debouncedQuery ? searchAlbums(debouncedQuery, page) : getTopAlbums(page),
    staleTime: 1000 * 60 * 5, 
  });

  const albums = debouncedQuery 
    ? data?.albummatches?.album 
    : data?.album;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Albümleri Keşfet</h1>
        <div className="max-w-xl">
          <input
            type="text"
            placeholder="Albüm ara..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Yükleniyor...</div>
      ) : error ? (
        <div className="text-red-500">Bir hata oluştu: {error.message}</div>
      ) : albums?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {albums.map((album) => (
              <AlbumCard 
                key={`${album.artist}${album.name}`} 
                album={album} 
              />
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
          {debouncedQuery ? 'Albüm bulunamadı' : 'Popüler albümler yüklenirken bir hata oluştu'}
        </div>
      )}
    </div>
  );
} 