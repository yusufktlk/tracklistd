import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AlbumDetail from './pages/AlbumDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProfile from './pages/EditProfile';
import ArtistDetail from './pages/ArtistDetail';
import Artists from './pages/Artists';
import { AuthProvider } from './contexts/AuthContext';
import Albums from './pages/Albums';
import SpotifyCallback from './pages/SpotifyCallback';
import { SpotifyProvider } from './contexts/SpotifyContext';
import { Toaster } from 'react-hot-toast';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SpotifyProvider>
            <div className="min-h-screen bg-gray-950">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/albums" element={<Albums />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/album/:artist/:album" element={<AlbumDetail />} />
                  <Route path="/artist/:artist" element={<ArtistDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/spotify/callback" element={<SpotifyCallback />} />
                </Routes>
              </main>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#1F2937',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  }
                }}
              />
            </div>
          </SpotifyProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
