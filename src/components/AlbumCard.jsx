import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaHeadphones, FaMusic } from 'react-icons/fa';
import { useAlbumStatus } from '../hooks/useAlbumActions';
import { useAuth } from '../contexts/AuthContext';

export default function AlbumCard({ album }) {
  const { currentUser } = useAuth();
  
  const artistName = typeof album.artist === 'object' ? album.artist.name : album.artist;
  
  const albumId = `${artistName}-${album.name}`.toLowerCase().replace(/\s+/g, '-');
  
  const { 
    isFavorite, 
    isListened, 
    toggleFavorite, 
    toggleListened, 
    isLoading 
  } = useAlbumStatus(albumId, {
    ...album,
    artist: artistName 
  });

  const handleAction = (e, action) => {
    e.preventDefault();
    action();
  };

  return (
    <Link
      to={`/album/${encodeURIComponent(artistName)}/${encodeURIComponent(album.name)}`}
      className="group relative block bg-gray-800 rounded-lg overflow-hidden"
    >
      {currentUser && (
        <div 
          className="absolute top-2 right-2 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <button
            onClick={(e) => handleAction(e, toggleFavorite)}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${
              isFavorite 
                ? 'bg-pink-600 text-white' 
                : 'bg-gray-800 bg-opacity-75 text-gray-400 hover:text-white'
            }`}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            {isFavorite ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
          </button>
          
          <button
            onClick={(e) => handleAction(e, toggleListened)}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${
              isListened 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 bg-opacity-75 text-gray-400 hover:text-white'
            }`}
            title={isListened ? 'Dinlenenlerden Çıkar' : 'Dinlenenlere Ekle'}
          >
            {isListened ? <FaHeadphones size={16} /> : <FaMusic size={16} />}
          </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl">
        <img
          src={album.image[3]['#text'] || album.image[2]['#text'] || '/album-placeholder.jpg'}
          alt={album.name}
          className="w-full aspect-square object-cover"
        />
        <div className="p-4">
          <h3 className="text-white font-semibold truncate group-hover:text-purple-400">
            {album.name}
          </h3>
          <p className="text-gray-400 text-sm truncate">
            {artistName}
          </p>
        </div>
      </div>
    </Link>
  );
} 