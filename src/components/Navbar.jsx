import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              TracklistDB
            </Link>
            <div className="ml-10 space-x-4">
              <Link to="/discover" className="text-gray-300 hover:text-white transition duration-200">
                Keşfet
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link 
                  to={`/profile/${currentUser.uid}`} 
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Profilim
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
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