import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTopAlbums } from '../services/lastfm';
import { useAuth } from '../contexts/AuthContext';
import AlbumCard from '../components/AlbumCard';
import { FaCompactDisc, FaPlay, FaArrowRight } from 'react-icons/fa';

export default function Home() {
  const { currentUser } = useAuth();

  const { data: trendingAlbums, isLoading } = useQuery({
    queryKey: ['trending-albums'],
    queryFn: () => getTopAlbums(1)
  });

  return (
    <div className="space-y-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-gray-900 to-purple-950">
        <div className="absolute inset-0 bg-[url('/vinyl-pattern.png')] opacity-10"></div>
        <div className="relative px-8 py-16 md:py-24 max-w-4xl mx-auto text-center">
          <div className="animate-spin-slow absolute -right-20 -top-20 text-indigo-500/10">
            <FaCompactDisc size={200} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-100">Müzik Yolculuğunu</span>
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Kayıt Altına Al
            </span>
          </h1>
          <p className="text-xl text-indigo-100/80 mb-8 max-w-2xl mx-auto">
            Favori albümlerinizi keşfedin, koleksiyonunuzu oluşturun ve müzik dünyasına yolculuğa çıkın
          </p>
          {!currentUser && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  Hemen Başla
                  <FaPlay className="transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Trend Albümler
            </span>
          </h2>
          <Link
            to="/albums"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
          >
            Tümünü Gör
            <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg aspect-square animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingAlbums?.album?.slice(0, 6).map((album) => (
              <AlbumCard key={album.name} album={album} />
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/50 to-gray-900 p-6 rounded-xl backdrop-blur-sm">
          <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <FaCompactDisc className="text-purple-400" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Koleksiyon Oluştur</h3>
          <p className="text-gray-400">
            Dinlediğiniz ve beğendiğiniz albümleri koleksiyonunuza ekleyin
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-900/50 to-gray-900 p-6 rounded-xl backdrop-blur-sm">
          <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <FaCompactDisc className="text-pink-400" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Yorumlar Yapın</h3>
          <p className="text-gray-400">
            Albümler hakkında düşüncelerinizi paylaşın ve tartışmalara katılın
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-gray-900 p-6 rounded-xl backdrop-blur-sm">
          <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <FaCompactDisc className="text-blue-400" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Keşfedin</h3>
          <p className="text-gray-400">
            Yeni albümler keşfedin ve müzik zevkinizi genişletin
          </p>
        </div>
      </div>
    </div>
  );
} 