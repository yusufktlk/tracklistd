import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import AlbumDetail from './pages/AlbumDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProfile from './pages/EditProfile';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/album/:artist/:album" element={<AlbumDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile/edit" element={<EditProfile />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
