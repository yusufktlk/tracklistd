import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { searchAlbums } from '../services/lastfm';

export default function EditFavoriteAlbumsModal({ isOpen, onClose, currentFavorites = [] }) {
  const [search, setSearch] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState(currentFavorites);
  const { updateProfile } = useAuth();
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    try {
      const results = await searchAlbums(search);
      setSearchResults(results.albummatches.album || []); 
    } catch (error) {
      console.error('Album search error:', error);
      toast.error('Albüm araması başarısız oldu');
    }
  };
  

  const handleSave = async () => {
    try {
      await updateProfile({ favoriteAlbums: selectedAlbums });
      onClose();
      toast.success('Favori albümler güncellendi');
    } catch (error) {
      toast.error('Favori albümler güncellenirken bir hata oluştu');
    }
  };

  return (
    <Modal
      size='3xl'
      isOpen={isOpen}
      onClose={onClose}
      title="Favori Albümleri Düzenle"
    >
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Albüm ara..."
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 rounded-lg"
          >
            <FaSearch />
          </button>
        </form>

        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {searchResults.map(album => (
            <button
              key={`${album.artist}-${album.name}`}
              onClick={() => {
                if (selectedAlbums.length >= 4) {
                  toast.error('En fazla 4 albüm seçebilirsiniz');
                  return;
                }
                setSelectedAlbums([...selectedAlbums, {
                  id: `${album.artist}-${album.name}`.toLowerCase(),
                  name: album.name,
                  artist: album.artist,
                  image: album.image?.[3]['#text'] || album.image?.[2]['#text']
                }]);
              }}
              className="flex gap-2 p-2 rounded-lg hover:bg-gray-700/50"
            >
              <img
                src={album.image?.[2]['#text']}
                alt={album.name}
                className="w-16 h-16 rounded"
              />
              <div className="text-left">
                <div className="font-medium">{album.name}</div>
                <div className="text-sm text-gray-400">{album.artist}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Seçilen Albümler</h3>
          <div className="space-y-2">
            {selectedAlbums.map((album, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={album.image}
                    alt={album.name}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <div className="font-medium">{album.name}</div>
                    <div className="text-sm text-gray-400">{album.artist}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlbums(selectedAlbums.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-lg"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 rounded-lg"
          >
            Kaydet
          </button>
        </div>
      </div>
    </Modal>
  );
} 