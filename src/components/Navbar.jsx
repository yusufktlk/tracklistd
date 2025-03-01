import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCompactDisc, FaUser } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-gray-900/60 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold"
            >
              <FaCompactDisc className="text-indigo-400 animate-spin-slow" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Tracklistd
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/albums" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                Albümler
              </Link>
              <Link 
                to="/artists" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                Sanatçılar
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Link 
                  to={`/profile/${currentUser.uid}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                >
                  <FaUser className="text-indigo-400" />
                  <span>Profilim</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 